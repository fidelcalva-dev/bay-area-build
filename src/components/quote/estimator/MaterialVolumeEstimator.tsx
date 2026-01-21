// Material Volume & Weight Estimator Wizard

import { useState, useMemo } from 'react';
import { 
  X, ArrowRight, ArrowLeft, Ruler, Box, Move3D, Hash, Calculator, Zap,
  Package, Home, Square, TreePine, HardHat, Mountain, Leaf, Wrench, Refrigerator,
  CheckCircle, AlertTriangle, Info, Sparkles, Weight, Scale, type LucideIcon
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useLanguage } from '@/contexts/LanguageContext';
import { 
  MATERIAL_CATEGORIES, 
  INPUT_METHODS, 
  CONCRETE_THICKNESSES,
  INCLUDED_TONS,
} from './constants';
import { useEstimatorCalculation } from './useEstimatorCalculation';
import { PresetSelector } from './PresetSelector';
import type { MaterialCategory, InputMethod, EstimatorInputs, EstimatorData, ConfidenceLevel } from './types';

// Icon mapping
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  'package': Package,
  'home': Home,
  'square': Square,
  'tree-pine': TreePine,
  'hard-hat': HardHat,
  'mountain': Mountain,
  'leaf': Leaf,
  'wrench': Wrench,
  'refrigerator': Refrigerator,
};

const INPUT_ICONS: Record<string, LucideIcon> = {
  'ruler': Ruler,
  'box': Box,
  'move-3d': Move3D,
  'hash': Hash,
};

interface MaterialVolumeEstimatorProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSize: (size: number, isHeavy: boolean, estimatorData: EstimatorData) => void;
  initialMaterial?: 'general' | 'heavy';
}

type WizardStep = 'presets' | 'category' | 'method' | 'input' | 'result';

export function MaterialVolumeEstimator({ 
  isOpen, 
  onClose, 
  onSelectSize,
  initialMaterial = 'general',
}: MaterialVolumeEstimatorProps) {
  const { language, t } = useLanguage();
  const isSpanish = language === 'es';
  
  const [step, setStep] = useState<WizardStep>('presets');
  const [inputs, setInputs] = useState<EstimatorInputs>({
    category: null,
    inputMethod: null,
  });
  
  // Calculate result
  const result = useEstimatorCalculation(inputs);
  
  // Filter categories based on initial material type
  const availableCategories = useMemo(() => {
    if (initialMaterial === 'heavy') {
      return MATERIAL_CATEGORIES.filter(c => c.isHeavy);
    }
    return MATERIAL_CATEGORIES;
  }, [initialMaterial]);
  
  // Get available input methods for selected category
  const availableMethods = useMemo(() => {
    if (!inputs.category) return [];
    const category = MATERIAL_CATEGORIES.find(c => c.id === inputs.category);
    if (!category) return [];
    return INPUT_METHODS.filter(m => category.allowedInputMethods.includes(m.id));
  }, [inputs.category]);
  
  // Get selected category config
  const selectedCategory = useMemo(() => {
    return MATERIAL_CATEGORIES.find(c => c.id === inputs.category);
  }, [inputs.category]);
  
  // Reset wizard
  const resetWizard = () => {
    setStep('presets');
    setInputs({ category: null, inputMethod: null });
  };
  
  // Handle category selection
  const selectCategory = (categoryId: MaterialCategory) => {
    setInputs({ category: categoryId, inputMethod: null });
    setStep('method');
  };
  
  // Handle method selection
  const selectMethod = (methodId: InputMethod) => {
    setInputs(prev => ({ ...prev, inputMethod: methodId }));
    setStep('input');
  };
  
  // Handle back navigation
  const goBack = () => {
    switch (step) {
      case 'category':
        setStep('presets');
        break;
      case 'method':
        setStep('category');
        setInputs(prev => ({ ...prev, category: null }));
        break;
      case 'input':
        setStep('method');
        setInputs(prev => ({ ...prev, inputMethod: null }));
        break;
      case 'result':
        setStep('input');
        break;
    }
  };
  
  // Handle preset selection (direct from PresetSelector)
  const handlePresetSelect = (size: number, isHeavy: boolean, estimatorData: EstimatorData) => {
    onSelectSize(size, isHeavy, estimatorData);
    onClose();
    resetWizard();
  };
  
  // Handle use recommended size
  const handleUseSize = () => {
    if (!result || !inputs.category) return;
    
    const estimatorData: EstimatorData = {
      estimatorUsed: true,
      materialCategory: inputs.category,
      inputMethod: inputs.inputMethod,
      inputValues: {
        ...(inputs.squareFeet && { squareFeet: inputs.squareFeet }),
        ...(inputs.cubicYards && { cubicYards: inputs.cubicYards }),
        ...(inputs.length && { length: inputs.length }),
        ...(inputs.width && { width: inputs.width }),
        ...(inputs.height && { height: inputs.height }),
        ...(inputs.count && { count: inputs.count }),
        ...(inputs.thicknessInches && { thicknessInches: inputs.thicknessInches }),
        ...(inputs.layers && { layers: inputs.layers }),
        ...(inputs.sheetCount && { sheetCount: inputs.sheetCount }),
      },
      estimatedVolumeCy: (result.volumeLow + result.volumeHigh) / 2,
      estimatedWeightTonsLow: result.weightLow,
      estimatedWeightTonsHigh: result.weightHigh,
      recommendedSizeYards: result.recommendedSize,
      confidenceLevel: result.confidence,
    };
    
    onSelectSize(result.recommendedSize, result.isHeavy, estimatorData);
    onClose();
    resetWizard();
  };
  
  // Check if we can show result
  const canShowResult = useMemo(() => {
    if (!inputs.inputMethod) return false;
    
    switch (inputs.inputMethod) {
      case 'sqft':
        return (inputs.squareFeet || 0) > 0;
      case 'cuyd':
        return (inputs.cubicYards || 0) > 0;
      case 'dimensions':
        return (inputs.length || 0) > 0 && (inputs.width || 0) > 0 && (inputs.height || 0) > 0;
      case 'count':
        return (inputs.count || 0) > 0 || (inputs.sheetCount || 0) > 0;
      default:
        return false;
    }
  }, [inputs]);
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative w-full max-w-lg max-h-[90vh] bg-card rounded-t-2xl sm:rounded-2xl shadow-xl overflow-hidden flex flex-col animate-slide-up">
        {/* Header */}
        <div className="sticky top-0 z-10 bg-foreground px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-2">
            {step !== 'presets' && (
              <button
                type="button"
                onClick={goBack}
                className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
              >
                <ArrowLeft className="w-4 h-4 text-background" />
              </button>
            )}
            <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
              {step === 'presets' ? (
                <Zap className="w-4 h-4 text-primary-foreground" />
              ) : (
                <Calculator className="w-4 h-4 text-primary-foreground" />
              )}
            </div>
            <div>
              <h3 className="font-semibold text-background">
                {step === 'presets' 
                  ? (isSpanish ? 'Estimador Rápido' : 'Quick Estimator')
                  : (isSpanish ? 'Estimador de Volumen' : 'Volume Estimator')
                }
              </h3>
              <p className="text-xs text-background/60">
                {step === 'presets' && (isSpanish ? 'Selecciona tu tipo de proyecto' : 'Select your project type')}
                {step === 'category' && (isSpanish ? 'Paso 1: Tipo de material' : 'Step 1: Material type')}
                {step === 'method' && (isSpanish ? 'Paso 2: Método de entrada' : 'Step 2: Input method')}
                {step === 'input' && (isSpanish ? 'Paso 3: Medidas' : 'Step 3: Measurements')}
                {step === 'result' && (isSpanish ? 'Resultado' : 'Result')}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => { onClose(); resetWizard(); }}
            className="w-8 h-8 rounded-full bg-background/10 flex items-center justify-center hover:bg-background/20 transition-colors"
          >
            <X className="w-4 h-4 text-background" />
          </button>
        </div>
        
        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Presets View (Default) */}
          {step === 'presets' && (
            <PresetSelector
              isSpanish={isSpanish}
              onSelectPreset={handlePresetSelect}
              onSwitchToManual={() => setStep('category')}
            />
          )}
          
          {/* Step 1: Category Selection */}
          {step === 'category' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {isSpanish 
                  ? '¿Qué tipo de material tienes?'
                  : 'What type of material do you have?'
                }
              </p>
              <div className="grid grid-cols-1 gap-2">
                {availableCategories.map((category) => {
                  const Icon = CATEGORY_ICONS[category.icon] || Package;
                  return (
                    <button
                      key={category.id}
                      type="button"
                      onClick={() => selectCategory(category.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-input bg-background hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">
                          {isSpanish ? category.labelEs : category.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isSpanish ? category.descriptionEs : category.description}
                        </div>
                      </div>
                      {category.isHeavy && (
                        <span className="px-2 py-0.5 bg-amber-500/10 text-amber-600 text-[10px] font-bold rounded-full">
                          {isSpanish ? 'PESADO' : 'HEAVY'}
                        </span>
                      )}
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Step 2: Input Method Selection */}
          {step === 'method' && (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground mb-4">
                {isSpanish 
                  ? '¿Cómo quieres medir?'
                  : 'How would you like to measure?'
                }
              </p>
              <div className="grid grid-cols-1 gap-2">
                {availableMethods.map((method) => {
                  const Icon = INPUT_ICONS[method.icon] || Ruler;
                  return (
                    <button
                      key={method.id}
                      type="button"
                      onClick={() => selectMethod(method.id)}
                      className="flex items-center gap-3 p-3 rounded-xl border-2 border-input bg-background hover:border-primary hover:bg-primary/5 transition-all text-left"
                    >
                      <div className="w-10 h-10 rounded-lg bg-muted flex items-center justify-center shrink-0">
                        <Icon className="w-5 h-5 text-foreground" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-medium text-foreground">
                          {isSpanish ? method.labelEs : method.label}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {isSpanish ? method.descriptionEs : method.description}
                        </div>
                      </div>
                      <ArrowRight className="w-4 h-4 text-muted-foreground shrink-0" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}
          
          {/* Step 3: Input Fields */}
          {step === 'input' && (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50">
                {(() => {
                  const Icon = selectedCategory ? CATEGORY_ICONS[selectedCategory.icon] || Package : Package;
                  return <Icon className="w-4 h-4 text-muted-foreground" />;
                })()}
                <span className="text-sm font-medium">
                  {isSpanish ? selectedCategory?.labelEs : selectedCategory?.label}
                </span>
              </div>
              
              {/* Square Feet Input */}
              {inputs.inputMethod === 'sqft' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium mb-2">
                      {isSpanish ? 'Pies cuadrados (sq ft)' : 'Square feet (sq ft)'}
                    </label>
                    <Input
                      type="number"
                      inputMode="numeric"
                      placeholder={isSpanish ? 'ej. 200' : 'e.g. 200'}
                      value={inputs.squareFeet || ''}
                      onChange={(e) => setInputs(prev => ({ 
                        ...prev, 
                        squareFeet: parseFloat(e.target.value) || undefined 
                      }))}
                      className="text-lg h-12"
                    />
                  </div>
                  
                  {/* Concrete thickness */}
                  {selectedCategory?.askThickness && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {isSpanish ? 'Espesor del concreto' : 'Concrete thickness'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {CONCRETE_THICKNESSES.map((t) => (
                          <button
                            key={t.inches}
                            type="button"
                            onClick={() => setInputs(prev => ({ ...prev, thicknessInches: t.inches }))}
                            className={cn(
                              "p-2 rounded-lg border-2 text-center transition-all",
                              inputs.thicknessInches === t.inches
                                ? "border-primary bg-primary/10"
                                : "border-input hover:border-primary/50"
                            )}
                          >
                            <div className="font-bold text-sm">{t.inches}"</div>
                            <div className="text-[10px] text-muted-foreground">
                              {isSpanish ? t.labelEs.split('(')[1]?.replace(')', '') : t.label.split('(')[1]?.replace(')', '')}
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                  
                  {/* Roofing layers */}
                  {selectedCategory?.askLayers && (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {isSpanish ? '¿Cuántas capas de tejas?' : 'How many layers of shingles?'}
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        {[1, 2, 3].map((layers) => (
                          <button
                            key={layers}
                            type="button"
                            onClick={() => setInputs(prev => ({ ...prev, layers }))}
                            className={cn(
                              "p-3 rounded-lg border-2 text-center transition-all",
                              inputs.layers === layers
                                ? "border-primary bg-primary/10"
                                : "border-input hover:border-primary/50"
                            )}
                          >
                            <div className="font-bold">{layers}</div>
                            <div className="text-xs text-muted-foreground">
                              {layers === 1 
                                ? (isSpanish ? 'capa' : 'layer') 
                                : (isSpanish ? 'capas' : 'layers')
                              }
                            </div>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {/* Cubic Yards Input */}
              {inputs.inputMethod === 'cuyd' && (
                <div>
                  <label className="block text-sm font-medium mb-2">
                    {isSpanish ? 'Yardas cúbicas' : 'Cubic yards'}
                  </label>
                  <Input
                    type="number"
                    inputMode="decimal"
                    step="0.1"
                    placeholder={isSpanish ? 'ej. 5' : 'e.g. 5'}
                    value={inputs.cubicYards || ''}
                    onChange={(e) => setInputs(prev => ({ 
                      ...prev, 
                      cubicYards: parseFloat(e.target.value) || undefined 
                    }))}
                    className="text-lg h-12"
                  />
                </div>
              )}
              
              {/* Dimensions Input */}
              {inputs.inputMethod === 'dimensions' && (
                <div className="space-y-3">
                  <p className="text-sm text-muted-foreground">
                    {isSpanish 
                      ? 'Ingresa las dimensiones en pies'
                      : 'Enter dimensions in feet'
                    }
                  </p>
                  <div className="grid grid-cols-3 gap-3">
                    <div>
                      <label className="block text-xs font-medium mb-1 text-muted-foreground">
                        {isSpanish ? 'Largo' : 'Length'}
                      </label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="ft"
                        value={inputs.length || ''}
                        onChange={(e) => setInputs(prev => ({ 
                          ...prev, 
                          length: parseFloat(e.target.value) || undefined 
                        }))}
                        className="text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-muted-foreground">
                        {isSpanish ? 'Ancho' : 'Width'}
                      </label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="ft"
                        value={inputs.width || ''}
                        onChange={(e) => setInputs(prev => ({ 
                          ...prev, 
                          width: parseFloat(e.target.value) || undefined 
                        }))}
                        className="text-center"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium mb-1 text-muted-foreground">
                        {isSpanish ? 'Alto' : 'Height'}
                      </label>
                      <Input
                        type="number"
                        inputMode="decimal"
                        placeholder="ft"
                        value={inputs.height || ''}
                        onChange={(e) => setInputs(prev => ({ 
                          ...prev, 
                          height: parseFloat(e.target.value) || undefined 
                        }))}
                        className="text-center"
                      />
                    </div>
                  </div>
                </div>
              )}
              
              {/* Count Input */}
              {inputs.inputMethod === 'count' && (
                <div className="space-y-4">
                  {selectedCategory?.askSheets ? (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {isSpanish ? '¿Cuántas hojas de 4×8?' : 'How many 4×8 sheets?'}
                      </label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder={isSpanish ? 'ej. 20' : 'e.g. 20'}
                        value={inputs.sheetCount || ''}
                        onChange={(e) => setInputs(prev => ({ 
                          ...prev, 
                          sheetCount: parseInt(e.target.value) || undefined,
                          count: parseInt(e.target.value) || undefined,
                        }))}
                        className="text-lg h-12"
                      />
                    </div>
                  ) : (
                    <div>
                      <label className="block text-sm font-medium mb-2">
                        {isSpanish ? '¿Cuántos artículos?' : 'How many items?'}
                      </label>
                      <Input
                        type="number"
                        inputMode="numeric"
                        placeholder={isSpanish ? 'ej. 5' : 'e.g. 5'}
                        value={inputs.count || ''}
                        onChange={(e) => setInputs(prev => ({ 
                          ...prev, 
                          count: parseInt(e.target.value) || undefined 
                        }))}
                        className="text-lg h-12"
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        {isSpanish 
                          ? 'Electrodomésticos, muebles, colchones, etc.'
                          : 'Appliances, furniture, mattresses, etc.'
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
          
          {/* Result View */}
          {step === 'result' && result && (
            <ResultView result={result} isSpanish={isSpanish} />
          )}
        </div>
        
        {/* Footer */}
        <div className="sticky bottom-0 bg-card border-t border-border p-4">
          {step === 'input' && (
            <Button
              variant="cta"
              className="w-full gap-2"
              onClick={() => setStep('result')}
              disabled={!canShowResult}
            >
              {isSpanish ? 'Ver Resultado' : 'See Result'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          )}
          
          {step === 'result' && result && (
            <Button
              variant="cta"
              className="w-full gap-2"
              onClick={handleUseSize}
            >
              {isSpanish 
                ? `Usar ${result.recommendedSize} Yardas` 
                : `Use ${result.recommendedSize} Yard`
              }
              <CheckCircle className="w-4 h-4" />
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

// Result View Component
function ResultView({ result, isSpanish }: { result: NonNullable<ReturnType<typeof useEstimatorCalculation>>; isSpanish: boolean }) {
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
  
  const style = confidenceStyles[result.confidence];
  
  return (
    <div className="space-y-4">
      {/* Stats Grid */}
      <div className="grid grid-cols-2 gap-3">
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Box className="w-3.5 h-3.5" />
            {isSpanish ? 'Volumen Estimado' : 'Estimated Volume'}
          </div>
          <div className="text-lg font-bold text-foreground">
            ~{result.volumeLow}–{result.volumeHigh} <span className="text-sm font-normal">yd³</span>
          </div>
        </div>
        <div className="p-3 rounded-xl bg-muted/50 border border-border">
          <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
            <Weight className="w-3.5 h-3.5" />
            {isSpanish ? 'Peso Estimado' : 'Estimated Weight'}
          </div>
          <div className="text-lg font-bold text-foreground">
            ~{result.weightLow}–{result.weightHigh} <span className="text-sm font-normal">{isSpanish ? 'ton' : 'tons'}</span>
          </div>
        </div>
      </div>
      
      {/* Recommendation Card */}
      <div className={cn(
        "p-4 rounded-xl border-2",
        result.isHeavy ? "bg-amber-500/5 border-amber-500/30" : "bg-success/5 border-success/30"
      )}>
        <div className="flex items-start gap-3">
          <div className={cn(
            "w-14 h-14 rounded-xl flex items-center justify-center shrink-0",
            result.isHeavy ? "bg-amber-500/20" : "bg-success/20"
          )}>
            <span className="text-2xl font-black text-foreground">{result.recommendedSize}</span>
          </div>
          <div className="flex-1">
            <div className="font-bold text-foreground text-lg">
              {isSpanish ? `${result.recommendedSize} Yardas` : `${result.recommendedSize} Yard`}
              {result.isHeavy && (
                <span className="ml-2 text-xs font-normal text-amber-600">
                  ({isSpanish ? 'Material Pesado' : 'Heavy Material'})
                </span>
              )}
            </div>
            {!result.isHeavy && (
              <div className="text-sm text-muted-foreground">
                {INCLUDED_TONS[result.recommendedSize] || 2}T {isSpanish ? 'incluidas' : 'included'}
              </div>
            )}
            {result.isHeavy && (
              <div className="text-sm text-muted-foreground">
                {isSpanish ? 'Precio fijo — sin cargos por peso' : 'Flat fee — no weight charges'}
              </div>
            )}
          </div>
        </div>
        
        {result.alternateSize && !result.multipleRequired && (
          <div className="mt-3 pt-3 border-t border-border/50">
            <span className="text-xs text-muted-foreground">
              {isSpanish ? 'Alternativa:' : 'Alternative:'}{' '}
              <span className="font-medium text-foreground">{result.alternateSize} {isSpanish ? 'yardas' : 'yard'}</span>
            </span>
          </div>
        )}
        
        {result.multipleRequired && result.multipleCount && (
          <div className="mt-3 pt-3 border-t border-amber-500/30">
            <div className="flex items-center gap-2 text-amber-600">
              <AlertTriangle className="w-4 h-4" />
              <span className="text-sm font-medium">
                {isSpanish 
                  ? `Se necesitan ~${result.multipleCount} contenedores`
                  : `~${result.multipleCount} dumpsters needed`
                }
              </span>
            </div>
          </div>
        )}
      </div>
      
      {/* Confidence Badge */}
      <div className={cn(
        "flex items-center gap-2 p-3 rounded-lg border",
        style.bg
      )}>
        <span className={style.text}>{style.icon}</span>
        <div className="flex-1">
          <span className={cn("font-medium text-sm", style.text)}>
            {result.confidenceLabel}
          </span>
          <p className="text-xs text-muted-foreground">
            {result.confidenceNote}
          </p>
        </div>
      </div>
      
      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground text-center leading-relaxed">
        {isSpanish 
          ? 'Los estimados varían por material, humedad y forma de carga. El cobro final se confirma después del boleto de báscula.'
          : 'Estimates vary by material, moisture, and loading. Final billing confirmed after disposal scale ticket.'
        }
      </p>
    </div>
  );
}
