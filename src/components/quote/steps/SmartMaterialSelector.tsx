// Smart Material Selector - Shows filtered materials based on customer type and project
// Phase 3 of Smart Material Options implementation

import { useState } from 'react';
import { 
  Check, Recycle, Scale, AlertTriangle, ChevronDown, ChevronUp,
  type LucideIcon
} from 'lucide-react';
import { 
  Home, Hammer, Wrench, Layers, TreePine, HardHat, Mountain, 
  Cuboid, CircleDot, Boxes, Package, Leaf, Building
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { 
  useSmartMaterials, 
  getPricingModelInfo,
  type MaterialOffer,
  type MaterialCatalogItem,
} from '@/hooks/useMaterialCatalog';
import { Skeleton } from '@/components/ui/skeleton';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';

// Icon mapping for materials
const MATERIAL_ICONS: Record<string, LucideIcon> = {
  'home': Home,
  'hammer': Hammer,
  'wrench': Wrench,
  'layers': Layers,
  'tree-pine': TreePine,
  'hard-hat': HardHat,
  'mountain': Mountain,
  'cuboid': Cuboid,
  'circle-dot': CircleDot,
  'boxes': Boxes,
  'package': Package,
  'leaf': Leaf,
  'building': Building,
};

interface SmartMaterialSelectorProps {
  value: string | null;
  onChange: (materialCode: string, material: MaterialCatalogItem) => void;
  customerType: string;
  projectCategoryCode: string | null;
  selectedSize: number;
  isSpanish?: boolean;
  onHeavyMaterialWarning?: (material: MaterialCatalogItem) => void;
}

// Check if customer type is homeowner
const isHomeownerType = (customerType: string): boolean => {
  return customerType === 'homeowner';
};

function MaterialCard({
  offer,
  isSelected,
  isRecommended,
  onSelect,
  selectedSize,
  isSpanish,
  isHomeowner,
  showHeavyWarning,
}: {
  offer: MaterialOffer;
  isSelected: boolean;
  isRecommended: boolean;
  onSelect: () => void;
  selectedSize: number;
  isSpanish: boolean;
  isHomeowner: boolean;
  showHeavyWarning: boolean;
}) {
  const { material } = offer;
  const IconComponent = MATERIAL_ICONS[material.icon] || Package;
  const pricingInfo = getPricingModelInfo(material.default_pricing_model);
  
  const displayName = isSpanish && material.display_name_es 
    ? material.display_name_es 
    : material.display_name;
  const description = isSpanish && material.description_short_es
    ? material.description_short_es
    : material.description_short;

  // Check if current size is allowed
  const sizeAllowed = material.allowed_sizes_json.includes(selectedSize);
  const isHeavy = material.is_heavy_material;
  const hasGreenHalo = material.green_halo_allowed;

  return (
    <button
      type="button"
      onClick={onSelect}
      disabled={!sizeAllowed}
      className={cn(
        "relative w-full p-4 rounded-xl border-2 text-left transition-all duration-200",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
        !sizeAllowed && "opacity-50 cursor-not-allowed",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-input bg-background hover:border-primary/50"
      )}
    >
      {/* Recommended badge */}
      {isRecommended && (
        <div className="absolute -top-2 left-3 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide bg-primary text-primary-foreground rounded-full">
          {isSpanish ? 'Recomendado' : 'Recommended'}
        </div>
      )}

      <div className="flex items-start gap-3">
        {/* Icon */}
        <div className={cn(
          "w-10 h-10 rounded-full flex items-center justify-center shrink-0 transition-colors",
          "bg-muted/80 border border-border/50",
          isSelected && "bg-primary/10 border-primary/20"
        )}>
          <IconComponent 
            className={cn(
              "w-5 h-5 transition-colors",
              isSelected ? "text-primary" : "text-foreground/70"
            )}
            strokeWidth={1.75}
          />
        </div>

        <div className="flex-1 min-w-0">
          {/* Material name */}
          <div className="font-medium text-foreground text-sm leading-tight">
            {displayName}
          </div>
          
          {/* Description */}
          {description && (
            <div className="text-xs text-muted-foreground mt-0.5">
              {description}
            </div>
          )}

          {/* Badges row */}
          <div className="flex flex-wrap gap-1 mt-2">
            {/* Pricing model badge */}
            <Badge 
              variant="outline" 
              className={cn("text-[10px] px-1.5 py-0", pricingInfo.badgeColor)}
            >
              {pricingInfo.label}
            </Badge>

            {/* Heavy badge */}
            {isHeavy && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-amber-50 text-amber-700 border-amber-200">
                <Scale className="w-3 h-3 mr-0.5" />
                Heavy
              </Badge>
            )}

            {/* Green Halo eligible */}
            {hasGreenHalo && material.material_code !== 'GRASS_YARD_WASTE' && (
              <Badge variant="outline" className="text-[10px] px-1.5 py-0 bg-green-50 text-green-700 border-green-200">
                <Recycle className="w-3 h-3 mr-0.5" />
                {isSpanish ? 'Reciclable' : 'Recyclable'}
              </Badge>
            )}
          </div>

          {/* Size restriction warning */}
          {!sizeAllowed && (
            <div className="flex items-center gap-1 mt-2 text-xs text-amber-600">
              <AlertTriangle className="w-3 h-3" />
              {isSpanish 
                ? `Solo disponible en ${material.allowed_sizes_json.join(', ')} yd` 
                : `Only available in ${material.allowed_sizes_json.join(', ')} yd`}
            </div>
          )}

          {/* Homeowner heavy material warning */}
          {isHomeowner && isHeavy && showHeavyWarning && (
            <div className="flex items-start gap-1.5 mt-2 p-2 rounded-md bg-amber-50 border border-amber-200 text-xs text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              <span>
                {isSpanish 
                  ? 'Material pesado: máximo 10 toneladas. Requiere línea de llenado. Peso extra = $165/ton.' 
                  : 'Heavy material: 10-ton max. Fill-line required. Extra weight = $165/ton.'}
              </span>
            </div>
          )}
        </div>

        {/* Selection checkmark */}
        {isSelected && (
          <div className="w-5 h-5 rounded-full bg-primary flex items-center justify-center shrink-0">
            <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
          </div>
        )}
      </div>
    </button>
  );
}

export function SmartMaterialSelector({
  value,
  onChange,
  customerType,
  projectCategoryCode,
  selectedSize,
  isSpanish = false,
  onHeavyMaterialWarning,
}: SmartMaterialSelectorProps) {
  const { recommended, other, isLoading, error, hasConfiguredOffers } = useSmartMaterials(
    customerType,
    projectCategoryCode
  );
  const [showOther, setShowOther] = useState(false);
  const isHomeowner = isHomeownerType(customerType);

  if (!projectCategoryCode) {
    return (
      <div className="text-center py-8 text-muted-foreground">
        {isSpanish 
          ? 'Primero selecciona un tipo de proyecto' 
          : 'Please select a project type first'}
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-3">
        <Skeleton className="h-5 w-40" />
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} className="h-24 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-4 text-muted-foreground">
        {isSpanish ? 'Error al cargar materiales' : 'Failed to load materials'}
      </div>
    );
  }

  const handleSelect = (offer: MaterialOffer) => {
    // For homeowners selecting heavy materials, trigger warning callback if provided
    if (isHomeowner && offer.material.is_heavy_material && onHeavyMaterialWarning) {
      onHeavyMaterialWarning(offer.material);
    }
    onChange(offer.material_code, offer.material);
  };

  return (
    <div className="space-y-4">
      <label className="block text-sm font-medium text-foreground">
        {isSpanish ? '¿Qué tipo de material?' : 'What type of material?'}
      </label>

      {/* Recommended section */}
      {recommended.length > 0 && (
        <div className="space-y-2">
          <div className="text-xs font-medium text-primary uppercase tracking-wide">
            {isSpanish ? 'Recomendado para tu proyecto' : 'Recommended for your project'}
          </div>
          <div className="space-y-2">
            {recommended.map((offer) => (
              <MaterialCard
                key={offer.material_code}
                offer={offer}
                isSelected={value === offer.material_code}
                isRecommended={true}
                onSelect={() => handleSelect(offer)}
                selectedSize={selectedSize}
                isSpanish={isSpanish}
                isHomeowner={isHomeowner}
                showHeavyWarning={value === offer.material_code}
              />
            ))}
          </div>
        </div>
      )}

      {/* Other options */}
      {other.length > 0 && (
        <div className="space-y-2">
          {recommended.length > 0 && (
            <Button
              type="button"
              variant="ghost"
              size="sm"
              onClick={() => setShowOther(!showOther)}
              className="w-full justify-between text-muted-foreground hover:text-foreground"
            >
              <span className="text-xs font-medium uppercase tracking-wide">
                {isSpanish ? 'Otras opciones' : 'Other options'} ({other.length})
              </span>
              {showOther ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </Button>
          )}
          
          {(showOther || recommended.length === 0) && (
            <div className="space-y-2">
            {other.map((offer) => (
              <MaterialCard
                key={offer.material_code}
                offer={offer}
                isSelected={value === offer.material_code}
                isRecommended={false}
                onSelect={() => handleSelect(offer)}
                selectedSize={selectedSize}
                isSpanish={isSpanish}
                isHomeowner={isHomeowner}
                showHeavyWarning={value === offer.material_code}
              />
            ))}
          </div>
          )}
        </div>
      )}

      {/* Empty state */}
      {recommended.length === 0 && other.length === 0 && (
        <div className="text-center py-8 text-muted-foreground">
          {isSpanish 
            ? 'No hay materiales configurados para este proyecto' 
            : 'No materials configured for this project'}
        </div>
      )}

      {/* Size-based guidance */}
      {value && (
        <div className="mt-4 p-3 rounded-lg bg-muted/50 border border-border/50">
          <div className="flex items-start gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-500 mt-0.5 shrink-0" />
            <div className="text-xs text-muted-foreground">
              {value === 'GRASS_YARD_WASTE'
                ? (isSpanish 
                    ? 'Los desechos de jardín se facturan por tonelaje debido al contenido de tierra. Green Halo™ no disponible.'
                    : 'Yard waste is billed by tonnage due to soil content. Green Halo™ not available.')
                : (isSpanish 
                    ? 'El tamaño disponible puede cambiar según el material seleccionado.'
                    : 'Available sizes may change based on the selected material.')}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default SmartMaterialSelector;
