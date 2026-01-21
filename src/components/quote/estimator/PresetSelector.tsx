// One-Tap Presets Selector Component

import { useState } from 'react';
import { 
  Home, HardHat, Building2, ArrowRight, CheckCircle, AlertTriangle, Info, Scale,
  Box, Weight, Zap, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { PRESET_TABS, PRESETS, getPresetConfidence, type Preset, type PresetTab } from './presets';
import { INCLUDED_TONS } from './constants';
import type { EstimatorData, ConfidenceLevel } from './types';

// Icon mapping
const TAB_ICONS: Record<string, LucideIcon> = {
  'home': Home,
  'hard-hat': HardHat,
  'building': Building2,
};

const PRESET_ICONS: Record<string, LucideIcon> = {
  'home': Home,
  'hard-hat': HardHat,
  'building': Building2,
  'package': Box,
  'square': Box,
  'tree-pine': Home,
  'leaf': Home,
  'wrench': HardHat,
  'mountain': Building2,
};

interface PresetSelectorProps {
  isSpanish: boolean;
  onSelectPreset: (size: number, isHeavy: boolean, estimatorData: EstimatorData) => void;
  onSwitchToManual: () => void;
}

export function PresetSelector({ isSpanish, onSelectPreset, onSwitchToManual }: PresetSelectorProps) {
  const [activeTab, setActiveTab] = useState<PresetTab>('homeowner');
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>(null);

  const handleSelectPreset = (preset: Preset) => {
    setSelectedPreset(preset);
  };

  const handleUsePreset = () => {
    if (!selectedPreset) return;

    const confidence = getPresetConfidence(
      selectedPreset.volumeHigh,
      selectedPreset.weightHigh,
      selectedPreset.recommendedSize,
      selectedPreset.isHeavy
    );

    const estimatorData: EstimatorData = {
      estimatorUsed: true,
      materialCategory: selectedPreset.category,
      inputMethod: null, // Preset-based
      inputValues: {
        presetId: selectedPreset.id as unknown as number,
        volumeLow: selectedPreset.volumeLow,
        volumeHigh: selectedPreset.volumeHigh,
        weightLow: selectedPreset.weightLow,
        weightHigh: selectedPreset.weightHigh,
      },
      estimatedVolumeCy: (selectedPreset.volumeLow + selectedPreset.volumeHigh) / 2,
      estimatedWeightTonsLow: selectedPreset.weightLow,
      estimatedWeightTonsHigh: selectedPreset.weightHigh,
      recommendedSizeYards: selectedPreset.recommendedSize,
      confidenceLevel: confidence.confidence,
    };

    onSelectPreset(selectedPreset.recommendedSize, selectedPreset.isHeavy, estimatorData);
  };

  const presets = PRESETS[activeTab];

  return (
    <div className="space-y-4">
      {/* Quick Presets Header */}
      <div className="flex items-center gap-2">
        <Zap className="w-4 h-4 text-primary" />
        <span className="text-sm font-semibold text-foreground">
          {isSpanish ? 'Presets Rápidos' : 'Quick Presets'}
        </span>
      </div>

      {/* Tab Navigation */}
      <div className="flex gap-1 p-1 bg-muted rounded-lg">
        {PRESET_TABS.map((tab) => {
          const Icon = TAB_ICONS[tab.icon] || Home;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => {
                setActiveTab(tab.id);
                setSelectedPreset(null);
              }}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-sm font-medium transition-all",
                activeTab === tab.id
                  ? "bg-background text-foreground shadow-sm"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Icon className="w-4 h-4" />
              <span className="hidden sm:inline">
                {isSpanish ? tab.labelEs : tab.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Presets Grid */}
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-1">
        {presets.map((preset) => {
          const isSelected = selectedPreset?.id === preset.id;
          const Icon = PRESET_ICONS[preset.icon] || Box;
          
          return (
            <button
              key={preset.id}
              type="button"
              onClick={() => handleSelectPreset(preset)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-input bg-background hover:border-primary/50"
              )}
            >
              <div className={cn(
                "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
                preset.isHeavy ? "bg-amber-500/10" : "bg-muted"
              )}>
                <Icon className={cn(
                  "w-5 h-5",
                  preset.isHeavy ? "text-amber-600" : "text-foreground"
                )} />
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-foreground text-sm">
                  {isSpanish ? preset.labelEs : preset.label}
                </div>
                <div className="text-xs text-muted-foreground truncate">
                  {isSpanish ? preset.descriptionEs : preset.description}
                </div>
              </div>
              <div className="text-right shrink-0">
                <div className={cn(
                  "text-lg font-bold",
                  preset.isHeavy ? "text-amber-600" : "text-primary"
                )}>
                  {preset.recommendedSize}
                </div>
                <div className="text-[10px] text-muted-foreground">
                  {isSpanish ? 'yardas' : 'yard'}
                </div>
              </div>
              {isSelected && (
                <CheckCircle className="w-5 h-5 text-primary shrink-0" />
              )}
            </button>
          );
        })}
      </div>

      {/* Selected Preset Details */}
      {selectedPreset && (
        <SelectedPresetDetails 
          preset={selectedPreset} 
          isSpanish={isSpanish} 
        />
      )}

      {/* Actions */}
      <div className="space-y-2 pt-2 border-t border-border">
        <Button
          variant="cta"
          className="w-full gap-2"
          onClick={handleUsePreset}
          disabled={!selectedPreset}
        >
          {selectedPreset 
            ? (isSpanish 
                ? `Usar ${selectedPreset.recommendedSize} Yardas` 
                : `Use ${selectedPreset.recommendedSize} Yard`)
            : (isSpanish ? 'Selecciona un proyecto' : 'Select a project')
          }
          {selectedPreset && <ArrowRight className="w-4 h-4" />}
        </Button>
        
        <button
          type="button"
          onClick={onSwitchToManual}
          className="w-full text-center text-sm text-muted-foreground hover:text-foreground transition-colors py-2"
        >
          {isSpanish ? '↓ Ajustar manualmente' : '↓ Adjust manually'}
        </button>
      </div>

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        {isSpanish 
          ? 'Los estimados varían. El cobro final se basa en el boleto de báscula.'
          : 'Estimates vary. Final billing based on scale ticket.'
        }
      </p>
    </div>
  );
}

// Selected Preset Details Component
function SelectedPresetDetails({ preset, isSpanish }: { preset: Preset; isSpanish: boolean }) {
  const confidence = getPresetConfidence(
    preset.volumeHigh,
    preset.weightHigh,
    preset.recommendedSize,
    preset.isHeavy
  );

  const confidenceStyles: Record<ConfidenceLevel, { bg: string; text: string; icon: React.ReactNode }> = {
    safe: { 
      bg: 'bg-success/10 border-success/30', 
      text: 'text-success', 
      icon: <CheckCircle className="w-4 h-4" /> 
    },
    tight: { 
      bg: 'bg-amber-500/10 border-amber-500/30', 
      text: 'text-amber-600', 
      icon: <Info className="w-4 h-4" /> 
    },
    overflow: { 
      bg: 'bg-destructive/10 border-destructive/30', 
      text: 'text-destructive', 
      icon: <AlertTriangle className="w-4 h-4" /> 
    },
    overweight: { 
      bg: 'bg-destructive/10 border-destructive/30', 
      text: 'text-destructive', 
      icon: <Scale className="w-4 h-4" /> 
    },
  };

  const style = confidenceStyles[confidence.confidence];
  const includedTons = preset.isHeavy ? null : (INCLUDED_TONS[preset.recommendedSize] || 2);

  return (
    <div className="space-y-3 p-3 rounded-xl bg-muted/30 border border-border">
      {/* Stats Row */}
      <div className="grid grid-cols-2 gap-2">
        <div className="p-2 rounded-lg bg-background">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
            <Box className="w-3 h-3" />
            {isSpanish ? 'Volumen' : 'Volume'}
          </div>
          <div className="text-sm font-bold text-foreground">
            {preset.volumeLow}–{preset.volumeHigh} <span className="text-xs font-normal">yd³</span>
          </div>
        </div>
        <div className="p-2 rounded-lg bg-background">
          <div className="flex items-center gap-1 text-[10px] text-muted-foreground mb-0.5">
            <Weight className="w-3 h-3" />
            {isSpanish ? 'Peso' : 'Weight'}
          </div>
          <div className="text-sm font-bold text-foreground">
            {preset.weightLow}–{preset.weightHigh} <span className="text-xs font-normal">{isSpanish ? 'ton' : 'tons'}</span>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className={cn(
        "flex items-center gap-3 p-2 rounded-lg border",
        preset.isHeavy ? "bg-amber-500/5 border-amber-500/20" : "bg-success/5 border-success/20"
      )}>
        <div className={cn(
          "w-10 h-10 rounded-lg flex items-center justify-center shrink-0",
          preset.isHeavy ? "bg-amber-500/20" : "bg-success/20"
        )}>
          <span className="text-lg font-black text-foreground">{preset.recommendedSize}</span>
        </div>
        <div className="flex-1 min-w-0">
          <div className="font-semibold text-sm text-foreground">
            {isSpanish ? `${preset.recommendedSize} Yardas` : `${preset.recommendedSize} Yard`}
            {preset.isHeavy && (
              <span className="ml-1 text-[10px] font-normal text-amber-600">
                ({isSpanish ? 'Pesado' : 'Heavy'})
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">
            {preset.isHeavy 
              ? (isSpanish ? 'Precio fijo — sin cargos por peso' : 'Flat fee — no weight charges')
              : (isSpanish ? `${includedTons}T incluidas` : `${includedTons}T included`)
            }
          </div>
        </div>
        {preset.alternateSize && (
          <div className="text-right">
            <div className="text-[10px] text-muted-foreground">
              {isSpanish ? 'Alt:' : 'Alt:'}
            </div>
            <div className="text-sm font-medium text-muted-foreground">
              {preset.alternateSize}
            </div>
          </div>
        )}
      </div>

      {/* Confidence Badge */}
      <div className={cn(
        "flex items-center gap-2 p-2 rounded-lg border",
        style.bg
      )}>
        <span className={style.text}>{style.icon}</span>
        <div className="flex-1">
          <span className={cn("font-medium text-xs", style.text)}>
            {isSpanish ? confidence.labelEs : confidence.label}
          </span>
          <p className="text-[10px] text-muted-foreground">
            {isSpanish ? confidence.noteEs : confidence.note}
          </p>
        </div>
      </div>
    </div>
  );
}
