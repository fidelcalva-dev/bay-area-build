/**
 * Debris Preset Selector - Customer-friendly project type selection
 */
import { useState } from 'react';
import { cn } from '@/lib/utils';
import { DEBRIS_PRESETS, DebrisPreset } from './constants';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { Home, Hammer, Weight, SlidersHorizontal, Truck } from 'lucide-react';

interface DebrisPresetSelectorProps {
  onSelect: (volumeMin: number, volumeMax: number, isHeavy: boolean, presetLabel?: string) => void;
  className?: string;
}

type InputMode = 'preset' | 'manual';
type PresetCategory = 'homeowner' | 'contractor' | 'heavy';

export function DebrisPresetSelector({ onSelect, className }: DebrisPresetSelectorProps) {
  const [mode, setMode] = useState<InputMode>('preset');
  const [category, setCategory] = useState<PresetCategory>('homeowner');
  const [selectedPreset, setSelectedPreset] = useState<string | null>(null);
  const [manualVolume, setManualVolume] = useState<number>(10);
  const [manualPickupLoads, setManualPickupLoads] = useState<number>(5);
  const [manualMode, setManualMode] = useState<'volume' | 'pickup'>('pickup');
  
  const presets = DEBRIS_PRESETS.filter(p => p.category === category);
  
  const handlePresetSelect = (preset: DebrisPreset) => {
    setSelectedPreset(preset.id);
    onSelect(preset.volumeMin, preset.volumeMax, preset.isHeavy || false, preset.label);
  };
  
  const handleManualChange = () => {
    if (manualMode === 'volume') {
      onSelect(manualVolume * 0.8, manualVolume, category === 'heavy');
    } else {
      // Convert pickup loads to volume (approx 2-2.5 cu yd per load for loose debris)
      const volume = manualPickupLoads * 2.2;
      onSelect(volume * 0.8, volume, category === 'heavy');
    }
  };
  
  return (
    <div className={cn("space-y-4", className)}>
      {/* Mode toggle */}
      <div className="flex gap-2 p-1 bg-muted rounded-lg">
        <button
          type="button"
          onClick={() => setMode('preset')}
          className={cn(
            "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all",
            mode === 'preset' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          Choose Project Type
        </button>
        <button
          type="button"
          onClick={() => setMode('manual')}
          className={cn(
            "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5",
            mode === 'manual' 
              ? "bg-background text-foreground shadow-sm" 
              : "text-muted-foreground hover:text-foreground"
          )}
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          Manual
        </button>
      </div>
      
      {mode === 'preset' ? (
        <>
          {/* Category tabs */}
          <Tabs value={category} onValueChange={(v) => { setCategory(v as PresetCategory); setSelectedPreset(null); }}>
            <TabsList className="w-full h-11 p-1">
              <TabsTrigger value="homeowner" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <Home className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Homeowner</span>
              </TabsTrigger>
              <TabsTrigger value="contractor" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <Hammer className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Contractor</span>
              </TabsTrigger>
              <TabsTrigger value="heavy" className="flex-1 gap-1.5 text-xs sm:text-sm">
                <Weight className="w-3.5 h-3.5" />
                <span className="hidden xs:inline">Heavy</span>
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value={category} className="mt-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {presets.map((preset) => (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => handlePresetSelect(preset)}
                    className={cn(
                      "p-3 rounded-lg border text-left transition-all",
                      "hover:border-primary/50 hover:bg-primary/5",
                      selectedPreset === preset.id
                        ? "border-primary bg-primary/10 ring-1 ring-primary"
                        : "border-border bg-card"
                    )}
                  >
                    <p className="font-medium text-sm text-foreground">{preset.label}</p>
                    {preset.description && (
                      <p className="text-xs text-muted-foreground mt-0.5">{preset.description}</p>
                    )}
                    <p className="text-xs text-muted-foreground mt-1">
                      Est. {preset.volumeMin}–{preset.volumeMax} cu yd
                    </p>
                  </button>
                ))}
              </div>
              
              {category === 'heavy' && (
                <p className="text-xs text-amber-600 dark:text-amber-400 mt-3 flex items-center gap-1.5">
                  <Weight className="w-3.5 h-3.5" />
                  Heavy materials limited to 6/8/10 yard dumpsters (flat-fee pricing)
                </p>
              )}
            </TabsContent>
          </Tabs>
        </>
      ) : (
        <div className="space-y-5 py-2">
          {/* Manual mode selector */}
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setManualMode('pickup')}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2",
                manualMode === 'pickup'
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              <Truck className="w-4 h-4" />
              Pickup Loads
            </button>
            <button
              type="button"
              onClick={() => setManualMode('volume')}
              className={cn(
                "flex-1 py-2.5 px-3 rounded-lg border text-sm font-medium transition-all flex items-center justify-center gap-2",
                manualMode === 'volume'
                  ? "border-primary bg-primary/10 text-foreground"
                  : "border-border text-muted-foreground hover:border-primary/30"
              )}
            >
              <SlidersHorizontal className="w-4 h-4" />
              Cubic Yards
            </button>
          </div>
          
          {manualMode === 'pickup' ? (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Number of pickup loads
                </label>
                <span className="text-lg font-bold text-primary">{manualPickupLoads}</span>
              </div>
              <Slider
                value={[manualPickupLoads]}
                onValueChange={([v]) => setManualPickupLoads(v)}
                onValueCommit={handleManualChange}
                min={1}
                max={20}
                step={1}
                className="py-2"
              />
              <p className="text-xs text-muted-foreground">
                Based on a standard 6-ft bed pickup, loosely loaded
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground">
                  Estimated cubic yards
                </label>
                <span className="text-lg font-bold text-primary">{manualVolume}</span>
              </div>
              <Slider
                value={[manualVolume]}
                onValueChange={([v]) => setManualVolume(v)}
                onValueCommit={handleManualChange}
                min={2}
                max={60}
                step={1}
                className="py-2"
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
}
