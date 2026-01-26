import { useEffect, useMemo, useState } from 'react';
import { Package, Ruler, Weight, HelpCircle, Eye, AlertTriangle, Info } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';

// Types for the enhanced size selector
interface DumpsterSize {
  id: string;
  value: number;
  label: string;
  basePrice: number;
  includedTons: number;
  description: string;
  dimensions: string;
  popular?: boolean;
  isHeavyOnly?: boolean;
}

// Material classification for size filtering
export type MaterialCategory = 
  | 'standard_debris' 
  | 'heavy_material' // Concrete, Soil, Rock, Brick, Asphalt
  | 'clean_fill_dirt'; // Special case

interface SizeSelectorV2Props {
  value: number;
  onChange: (size: number) => void;
  
  // Material-based filtering
  materialType: 'general' | 'heavy';
  materialCode?: string | null; // Specific material code from catalog
  
  // Market availability (optional - if not provided, shows all sizes)
  marketAvailableSizes?: number[];
  
  // Estimator integration
  onOpenEstimator?: () => void;
  
  // Size database (from usePricingData hook)
  sizes: DumpsterSize[];
  
  // Callback when size is auto-corrected
  onSizeAutoCorrected?: (newSize: number, reason: string) => void;
  
  // Spanish mode
  isSpanish?: boolean;
}

// Size categories for standard debris
const COMMON_DEBRIS_SIZES = [10, 20, 30, 40];
const ADDITIONAL_DEBRIS_SIZES = [5, 6, 8, 50];

// Heavy material sizes (weight-restricted)
const HEAVY_MATERIAL_SIZES = [5, 6, 8, 10];

// Materials that trigger heavy size restrictions
const HEAVY_MATERIAL_CODES = [
  'CONCRETE_CLEAN',
  'SOIL_CLEAN', 
  'ROCK_GRAVEL_CLEAN',
  'BRICK_TILE_CLEAN',
  'ASPHALT_CLEAN',
  // Also include general heavy markers
  'GRASS_YARD_WASTE', // Heavy due to soil content
];

const CLEAN_FILL_DIRT_CODES = ['SOIL_CLEAN'];

function getMaterialCategory(materialType: 'general' | 'heavy', materialCode?: string | null): MaterialCategory {
  if (materialType === 'heavy') {
    if (materialCode && CLEAN_FILL_DIRT_CODES.includes(materialCode)) {
      return 'clean_fill_dirt';
    }
    return 'heavy_material';
  }
  
  // Check if the general material code is actually heavy (like GRASS_YARD_WASTE)
  if (materialCode && HEAVY_MATERIAL_CODES.includes(materialCode)) {
    if (CLEAN_FILL_DIRT_CODES.includes(materialCode)) {
      return 'clean_fill_dirt';
    }
    return 'heavy_material';
  }
  
  return 'standard_debris';
}

function getAllowedSizesForCategory(category: MaterialCategory): number[] {
  switch (category) {
    case 'heavy_material':
    case 'clean_fill_dirt':
      return HEAVY_MATERIAL_SIZES;
    case 'standard_debris':
    default:
      return [...COMMON_DEBRIS_SIZES, ...ADDITIONAL_DEBRIS_SIZES];
  }
}

export function SizeSelectorV2({
  value,
  onChange,
  materialType,
  materialCode,
  marketAvailableSizes,
  onOpenEstimator,
  sizes,
  onSizeAutoCorrected,
  isSpanish = false,
}: SizeSelectorV2Props) {
  const [showSizeChangedMessage, setShowSizeChangedMessage] = useState(false);

  // Determine material category
  const materialCategory = useMemo(() => {
    return getMaterialCategory(materialType, materialCode);
  }, [materialType, materialCode]);

  // Get allowed sizes based on material category
  const categoryAllowedSizes = useMemo(() => {
    return getAllowedSizesForCategory(materialCategory);
  }, [materialCategory]);

  // Apply market availability filter
  const marketFilteredSizes = useMemo(() => {
    if (!marketAvailableSizes || marketAvailableSizes.length === 0) {
      return categoryAllowedSizes;
    }
    return categoryAllowedSizes.filter(size => marketAvailableSizes.includes(size));
  }, [categoryAllowedSizes, marketAvailableSizes]);

  // Get the actual size objects that are available
  const availableSizeObjects = useMemo(() => {
    return sizes.filter(s => marketFilteredSizes.includes(s.value));
  }, [sizes, marketFilteredSizes]);

  // Split into common and additional for standard debris
  const { commonSizes, additionalSizes } = useMemo(() => {
    if (materialCategory !== 'standard_debris') {
      return { 
        commonSizes: availableSizeObjects, 
        additionalSizes: [] 
      };
    }

    const common = availableSizeObjects.filter(s => COMMON_DEBRIS_SIZES.includes(s.value));
    const additional = availableSizeObjects.filter(s => ADDITIONAL_DEBRIS_SIZES.includes(s.value));
    
    return { commonSizes: common, additionalSizes: additional };
  }, [availableSizeObjects, materialCategory]);

  // Auto-correct size when it becomes invalid
  useEffect(() => {
    if (value && !marketFilteredSizes.includes(value)) {
      // Find the closest valid size, prefer 10 for heavy, 20 for general
      let newSize: number;
      
      if (materialCategory === 'heavy_material' || materialCategory === 'clean_fill_dirt') {
        // For heavy, prefer 10y if available, otherwise largest available
        newSize = marketFilteredSizes.includes(10) ? 10 : Math.max(...marketFilteredSizes);
      } else {
        // For general, prefer 20y if available, otherwise smallest common size
        newSize = marketFilteredSizes.includes(20) 
          ? 20 
          : marketFilteredSizes.find(s => COMMON_DEBRIS_SIZES.includes(s)) || marketFilteredSizes[0];
      }
      
      if (newSize && newSize !== value) {
        onChange(newSize);
        setShowSizeChangedMessage(true);
        onSizeAutoCorrected?.(newSize, isSpanish 
          ? 'Este tamaño no está disponible para el material seleccionado. Hemos seleccionado la opción válida más cercana.'
          : 'This size is not available for the selected material. We\'ve selected the closest valid option.'
        );
        
        // Clear message after 5 seconds
        setTimeout(() => setShowSizeChangedMessage(false), 5000);
      }
    }
  }, [value, marketFilteredSizes, materialCategory, onChange, onSizeAutoCorrected, isSpanish]);

  // Get header text based on material category
  const headerConfig = useMemo(() => {
    switch (materialCategory) {
      case 'heavy_material':
        return {
          title: isSpanish ? 'Tamaños para materiales pesados' : 'Heavy material sizes',
          subtitle: isSpanish 
            ? 'Debido a los límites de peso, los materiales pesados usan contenedores más pequeños'
            : 'Due to weight limits, heavy materials use smaller dumpsters',
          highlightSize: 10,
          highlightText: isSpanish ? 'Más común para materiales pesados' : 'Most common for heavy materials',
        };
      case 'clean_fill_dirt':
        return {
          title: isSpanish ? 'Contenedores para tierra limpia' : 'Clean fill dirt dumpsters',
          subtitle: isSpanish 
            ? 'Límites de peso aplican — línea de llenado requerida'
            : 'Weight limits apply — fill line required',
          highlightSize: 10,
          highlightText: isSpanish ? 'Más común: 10 yardas' : 'Most common: 10 yard',
        };
      case 'standard_debris':
      default:
        return {
          title: isSpanish ? 'Tamaños más comunes' : 'Most common sizes',
          subtitle: null,
          highlightSize: 20, // Popular for standard debris
          highlightText: null,
        };
    }
  }, [materialCategory, isSpanish]);

  // Render a size button
  const renderSizeButton = (size: DumpsterSize, showHighlight: boolean) => {
    const isSelected = value === size.value;
    const isHighlighted = size.value === headerConfig.highlightSize && showHighlight;
    
    return (
      <button
        key={size.id}
        type="button"
        onClick={() => onChange(size.value)}
        className={cn(
          "relative py-3 px-2 rounded-xl border-2 text-center transition-all duration-200",
          "hover:shadow-md",
          isSelected
            ? "border-primary bg-primary/5 shadow-sm"
            : "border-input bg-background hover:border-primary/50",
          isHighlighted && !isSelected && "ring-2 ring-primary/30"
        )}
      >
        {/* Popular badge for standard debris flow */}
        {size.popular && materialCategory === 'standard_debris' && !isHighlighted && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full whitespace-nowrap">
            {isSpanish ? 'POPULAR' : 'POPULAR'}
          </span>
        )}
        
        {/* Highlighted badge for heavy materials */}
        {isHighlighted && (materialCategory === 'heavy_material' || materialCategory === 'clean_fill_dirt') && (
          <span className="absolute -top-2.5 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-primary text-primary-foreground text-[10px] font-bold rounded-full whitespace-nowrap">
            {isSpanish ? 'MÁS COMÚN' : 'MOST COMMON'}
          </span>
        )}
        
        <div className="text-xl font-bold text-foreground">{size.value}</div>
        <div className="text-[10px] text-muted-foreground uppercase tracking-wide">
          {isSpanish ? 'yardas' : 'yard'}
        </div>
        
        {isSelected && (
          <div className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-primary flex items-center justify-center">
            <svg className="w-2.5 h-2.5 text-primary-foreground" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        )}
      </button>
    );
  };

  const selectedSize = sizes.find(s => s.value === value);

  return (
    <div className="space-y-4">
      {/* Header with label and helper links */}
      <div className="flex items-center justify-between">
        <label className="flex items-center gap-1.5 text-sm font-medium text-foreground">
          <Package className="w-4 h-4" />
          {isSpanish ? 'Tamaño del contenedor' : 'Dumpster Size'}
        </label>
        
        <div className="flex items-center gap-3">
          <Link
            to={`/visualizer?size=${value || 20}`}
            className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground font-medium transition-colors"
          >
            <Eye className="w-3.5 h-3.5" />
            {isSpanish ? 'Comparar tamaños' : 'Compare sizes'}
          </Link>
          {onOpenEstimator && (
            <button
              type="button"
              onClick={onOpenEstimator}
              className="flex items-center gap-1 text-xs text-primary hover:text-primary/80 font-medium transition-colors"
            >
              <HelpCircle className="w-3.5 h-3.5" />
              {isSpanish ? 'Ayúdame a elegir' : 'Help me choose'}
            </button>
          )}
        </div>
      </div>

      {/* Size changed warning message */}
      {showSizeChangedMessage && (
        <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 flex items-start gap-2">
          <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
          <p className="text-sm text-amber-800">
            {isSpanish 
              ? 'Este tamaño no estaba disponible para el material seleccionado. Hemos seleccionado la opción válida más cercana.'
              : 'This size is not available for the selected material. We\'ve selected the closest valid option.'}
          </p>
        </div>
      )}

      {/* Section header for material category */}
      <div className="space-y-1">
        <h4 className="text-base font-semibold text-foreground">{headerConfig.title}</h4>
        {headerConfig.subtitle && (
          <p className="text-xs text-muted-foreground">{headerConfig.subtitle}</p>
        )}
      </div>

      {/* Heavy material helper text */}
      {materialCategory === 'clean_fill_dirt' && headerConfig.highlightText && (
        <div className="flex items-center gap-2 p-2 rounded-lg bg-primary/5 border border-primary/20">
          <Info className="w-4 h-4 text-primary shrink-0" />
          <span className="text-xs text-foreground font-medium">{headerConfig.highlightText}</span>
        </div>
      )}

      {/* Common/Primary sizes grid */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
        {commonSizes.map(size => renderSizeButton(size, true))}
      </div>

      {/* Additional sizes section (for standard debris only) */}
      {additionalSizes.length > 0 && materialCategory === 'standard_debris' && (
        <div className="space-y-2">
          <p className="text-xs text-muted-foreground font-medium">
            {isSpanish ? 'Tamaños adicionales disponibles en algunas áreas' : 'Additional sizes available in some areas'}
          </p>
          <div className="grid grid-cols-4 gap-2">
            {additionalSizes.map(size => renderSizeButton(size, false))}
          </div>
        </div>
      )}

      {/* Selected size details */}
      {selectedSize && (
        <div className="bg-muted/50 rounded-lg p-3">
          <div className="flex items-start gap-3">
            <div className="shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
              <Package className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold text-foreground">{selectedSize.label}</div>
              <div className="text-sm text-muted-foreground">{selectedSize.description}</div>
              <div className="flex flex-wrap gap-x-4 gap-y-1 mt-2 text-xs text-muted-foreground">
                <span className="flex items-center gap-1">
                  <Ruler className="w-3 h-3" />
                  {selectedSize.dimensions}
                </span>
                {/* Don't show included tons for heavy materials (flat fee pricing) */}
                {materialCategory === 'standard_debris' && (
                  <span className="flex items-center gap-1">
                    <Weight className="w-3 h-3" />
                    {selectedSize.includedTons}T {isSpanish ? 'incluidas' : 'included'}
                  </span>
                )}
                {(materialCategory === 'heavy_material' || materialCategory === 'clean_fill_dirt') && (
                  <span className="flex items-center gap-1 text-success">
                    <Weight className="w-3 h-3" />
                    {isSpanish ? 'Tarifa fija' : 'Flat fee'}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* No heavy warnings for standard debris flow */}
      {materialCategory === 'standard_debris' && (
        <p className="text-xs text-muted-foreground text-center">
          {isSpanish 
            ? 'Los precios incluyen entrega, recogida y 7 días de alquiler'
            : 'Prices include delivery, pickup, and 7-day rental'}
        </p>
      )}
    </div>
  );
}

export default SizeSelectorV2;
