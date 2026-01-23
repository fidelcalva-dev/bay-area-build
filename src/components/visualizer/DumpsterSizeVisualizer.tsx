/**
 * Dumpster Size Visualizer
 * Two modes: "Compare Sizes" (dimensions + scale) and "Will it fit?" (debris calculator)
 */
import { useState, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { 
  DumpsterSize, 
  DUMPSTER_SPECS, 
  GENERAL_SIZES, 
  HEAVY_SIZES,
  calculateFitStatus,
  FitResult 
} from './constants';
import { DimensionOverlay } from './DimensionOverlay';
import { ScaleComparisonSVG } from './ScaleComparisonSVG';
import { DebrisPresetSelector } from './DebrisPresetSelector';
import { FitIndicator } from './FitIndicator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Ruler, Calculator, User, Truck, Home as HomeIcon, ArrowRight, Info } from 'lucide-react';
import { Link } from 'react-router-dom';

interface DumpsterSizeVisualizerProps {
  initialSize?: DumpsterSize;
  onSelectSize?: (size: DumpsterSize) => void;
  showQuoteLink?: boolean;
  className?: string;
}

type ViewMode = 'compare' | 'fit';
type CompareWith = 'person' | 'pickup' | 'garage';
type DisplayMode = 'dimensions' | 'scale';

export function DumpsterSizeVisualizer({ 
  initialSize = 20, 
  onSelectSize,
  showQuoteLink = true,
  className 
}: DumpsterSizeVisualizerProps) {
  const [viewMode, setViewMode] = useState<ViewMode>('compare');
  const [selectedSize, setSelectedSize] = useState<DumpsterSize>(initialSize);
  const [displayMode, setDisplayMode] = useState<DisplayMode>('dimensions');
  const [compareWith, setCompareWith] = useState<CompareWith>('person');
  const [isHeavy, setIsHeavy] = useState(false);
  const [fitResult, setFitResult] = useState<FitResult | null>(null);
  const [estimatedVolume, setEstimatedVolume] = useState<number>(0);
  
  const availableSizes = isHeavy ? HEAVY_SIZES : GENERAL_SIZES;
  
  const handleSizeChange = useCallback((size: DumpsterSize) => {
    setSelectedSize(size);
    onSelectSize?.(size);
    
    // Recalculate fit if we have an estimate
    if (estimatedVolume > 0) {
      const result = calculateFitStatus(estimatedVolume, size, isHeavy);
      setFitResult(result);
    }
  }, [onSelectSize, estimatedVolume, isHeavy]);
  
  const handleDebrisSelect = useCallback((volumeMin: number, volumeMax: number, heavy: boolean) => {
    setIsHeavy(heavy);
    const avgVolume = (volumeMin + volumeMax) / 2;
    setEstimatedVolume(avgVolume);
    
    // Validate selected size for heavy materials
    let sizeToUse = selectedSize;
    if (heavy && !HEAVY_SIZES.includes(selectedSize)) {
      sizeToUse = 10; // Default to largest heavy size
      setSelectedSize(sizeToUse);
    }
    
    const result = calculateFitStatus(avgVolume, sizeToUse, heavy);
    setFitResult(result);
  }, [selectedSize]);
  
  const handleSelectRecommended = useCallback((size: number) => {
    const dumpsterSize = size as DumpsterSize;
    setSelectedSize(dumpsterSize);
    onSelectSize?.(dumpsterSize);
    
    if (estimatedVolume > 0) {
      const result = calculateFitStatus(estimatedVolume, dumpsterSize, isHeavy);
      setFitResult(result);
    }
  }, [onSelectSize, estimatedVolume, isHeavy]);
  
  const spec = DUMPSTER_SPECS[selectedSize];
  
  return (
    <div className={cn("bg-card border border-border rounded-2xl overflow-hidden", className)}>
      {/* Main tabs */}
      <Tabs value={viewMode} onValueChange={(v) => setViewMode(v as ViewMode)}>
        <TabsList className="w-full h-14 p-1.5 rounded-none border-b border-border bg-muted/50">
          <TabsTrigger 
            value="compare" 
            className="flex-1 h-full text-sm font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Ruler className="w-4 h-4" />
            Compare Sizes
          </TabsTrigger>
          <TabsTrigger 
            value="fit" 
            className="flex-1 h-full text-sm font-semibold gap-2 data-[state=active]:bg-background data-[state=active]:shadow-sm"
          >
            <Calculator className="w-4 h-4" />
            Will it fit?
          </TabsTrigger>
        </TabsList>
        
        <div className="p-4 sm:p-6">
          {/* Size selector - shared between modes */}
          <div className="mb-5">
            <label className="text-sm font-medium text-foreground mb-2 block">
              Select dumpster size
            </label>
            <div className="flex flex-wrap gap-2">
              {availableSizes.map((size) => (
                <button
                  key={size}
                  type="button"
                  onClick={() => handleSizeChange(size)}
                  className={cn(
                    "px-4 py-2.5 rounded-lg font-semibold text-sm transition-all",
                    "border-2",
                    selectedSize === size
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border bg-background text-foreground hover:border-primary/50"
                  )}
                >
                  {size} yd
                </button>
              ))}
            </div>
            {isHeavy && (
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Heavy materials limited to 6/8/10 yard sizes
              </p>
            )}
          </div>
          
          <TabsContent value="compare" className="mt-0 space-y-5">
            {/* Display mode toggle */}
            <div className="flex gap-2 p-1 bg-muted rounded-lg">
              <button
                type="button"
                onClick={() => setDisplayMode('dimensions')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                  displayMode === 'dimensions' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <Ruler className="w-3.5 h-3.5" />
                Dimensions
              </button>
              <button
                type="button"
                onClick={() => setDisplayMode('scale')}
                className={cn(
                  "flex-1 py-2 px-3 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-1.5",
                  displayMode === 'scale' 
                    ? "bg-background text-foreground shadow-sm" 
                    : "text-muted-foreground hover:text-foreground"
                )}
              >
                <User className="w-3.5 h-3.5" />
                Scale Comparison
              </button>
            </div>
            
            {displayMode === 'dimensions' ? (
              <DimensionOverlay size={selectedSize} />
            ) : (
              <>
                {/* Compare with selector */}
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setCompareWith('person')}
                    className={cn(
                      "flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                      compareWith === 'person'
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <User className="w-4 h-4" />
                    Person
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareWith('pickup')}
                    className={cn(
                      "flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                      compareWith === 'pickup'
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <Truck className="w-4 h-4" />
                    Pickup
                  </button>
                  <button
                    type="button"
                    onClick={() => setCompareWith('garage')}
                    className={cn(
                      "flex-1 py-2.5 px-3 rounded-lg border text-xs font-medium transition-all flex items-center justify-center gap-1.5",
                      compareWith === 'garage'
                        ? "border-primary bg-primary/10 text-foreground"
                        : "border-border text-muted-foreground hover:border-primary/30"
                    )}
                  >
                    <HomeIcon className="w-4 h-4" />
                    Garage
                  </button>
                </div>
                
                <div className="bg-muted/30 rounded-xl border border-border p-4">
                  <ScaleComparisonSVG size={selectedSize} compareWith={compareWith} />
                </div>
                
                <div className="text-center text-sm text-muted-foreground">
                  ~{spec.pickupLoads} pickup loads capacity
                </div>
              </>
            )}
            
            {showQuoteLink && (
              <Button asChild className="w-full" variant="cta">
                <Link to={`/pricing?size=${selectedSize}`}>
                  Get Quote for {selectedSize}-Yard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            )}
          </TabsContent>
          
          <TabsContent value="fit" className="mt-0 space-y-5">
            <div>
              <label className="text-sm font-medium text-foreground mb-2 block">
                What are you throwing away?
              </label>
              <DebrisPresetSelector onSelect={handleDebrisSelect} />
            </div>
            
            {fitResult && (
              <FitIndicator 
                result={fitResult} 
                onSelectRecommended={handleSelectRecommended}
              />
            )}
            
            {fitResult && showQuoteLink && (
              <Button asChild className="w-full" variant="cta">
                <Link to={`/pricing?size=${selectedSize}&material=${isHeavy ? 'heavy' : 'general'}`}>
                  Get Quote for {selectedSize}-Yard
                  <ArrowRight className="w-4 h-4 ml-1" />
                </Link>
              </Button>
            )}
          </TabsContent>
        </div>
      </Tabs>
      
      {/* Disclaimer */}
      <div className="px-4 sm:px-6 pb-4">
        <p className="text-xs text-muted-foreground flex items-start gap-1.5">
          <Info className="w-3.5 h-3.5 shrink-0 mt-0.5" />
          Estimates vary by material and how it's loaded. Dimensions are approximate.
        </p>
      </div>
    </div>
  );
}
