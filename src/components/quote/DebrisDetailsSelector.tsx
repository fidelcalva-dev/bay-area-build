// ============================================================
// DEBRIS DETAILS SELECTOR - Canon-Accurate Material Selection
// ============================================================
// Uses canonical material categories from lib/materialCategories.ts
// Handles contamination checks, reclassification, and pricing routing

import { useState, useMemo, useEffect, useCallback } from 'react';
import { 
  CheckCircle, AlertTriangle, Info, Scale, ShieldCheck, 
  Recycle, XCircle, Check, AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { PRICING_POLICIES } from '@/lib/shared-data';
import {
  CANONICAL_MATERIAL_CATEGORIES,
  getCategoryById,
  getGeneralCategories,
  getHeavyCategories,
  checkReclassification,
  buildMaterialSelectionData,
  type CanonicalMaterialCategory,
  type MaterialClassification,
  type PricingMode,
  type MaterialSelectionData,
} from '@/lib/materialCategories';

// ============================================================
// PUBLIC API
// ============================================================

export interface DebrisSelectionResult {
  categoryId: string | null;
  classification: MaterialClassification | null;
  pricingMode: PricingMode | null;
  greenHaloEligible: boolean;
  isHeavyMaterial: boolean;
  allowedSizes: number[];
  reclassified: boolean;
  reclassificationMessage: string | null;
  isComplete: boolean;
  /** Full data for saving to quote record */
  materialData: MaterialSelectionData | null;
}

interface DebrisDetailsSelectorProps {
  selectedSize: number;
  materialType: 'general' | 'heavy';
  onSelectionChange: (result: DebrisSelectionResult) => void;
  isSpanish?: boolean;
}

// ============================================================
// COMPONENT
// ============================================================

export function DebrisDetailsSelector({
  selectedSize,
  materialType,
  onSelectionChange,
  isSpanish = false,
}: DebrisDetailsSelectorProps) {
  // State
  const [selectedCategoryId, setSelectedCategoryId] = useState<string | null>(null);
  const [hasTrash, setHasTrash] = useState<boolean | null>(null);
  const [isCleanSingleType, setIsCleanSingleType] = useState<boolean | null>(null);

  // Get categories based on material type
  const availableCategories = useMemo(() => {
    return materialType === 'heavy' 
      ? getHeavyCategories()
      : getGeneralCategories();
  }, [materialType]);

  // Get selected category
  const selectedCategory = useMemo(() => {
    return selectedCategoryId ? getCategoryById(selectedCategoryId) : null;
  }, [selectedCategoryId]);

  // Compute selection result
  const selectionResult = useMemo((): DebrisSelectionResult => {
    if (!selectedCategory) {
      return {
        categoryId: null,
        classification: null,
        pricingMode: null,
        greenHaloEligible: false,
        isHeavyMaterial: false,
        allowedSizes: materialType === 'heavy' ? [5, 8, 10] : [5, 8, 10, 20, 30, 40, 50],
        reclassified: false,
        reclassificationMessage: null,
        isComplete: false,
        materialData: null,
      };
    }

    // Check if contamination check is needed
    const needsContaminationCheck = selectedCategory.requiresContaminationCheck;
    const contaminationCheckComplete = !needsContaminationCheck || 
      (hasTrash !== null && isCleanSingleType !== null);

    // Check for reclassification
    const reclassCheck = needsContaminationCheck && contaminationCheckComplete
      ? checkReclassification({
          categoryId: selectedCategory.id,
          hasTrash: hasTrash ?? false,
          isCleanSingleType: isCleanSingleType ?? true,
        })
      : null;

    const finalClassification = reclassCheck?.reclassified
      ? reclassCheck.newClassification
      : selectedCategory.classification;

    const finalAllowedSizes = reclassCheck?.reclassified
      ? reclassCheck.newAllowedSizes
      : selectedCategory.allowedSizes;

    const pricingMode = reclassCheck?.reclassified && finalClassification === 'MIXED_GENERAL'
      ? (selectedSize <= 10 ? 'MIXED_YARD_OVERAGE' : 'MIXED_TON_OVERAGE')
      : selectedCategory.getPricingMode(selectedSize);

    // Build material data for quote record
    const materialData = contaminationCheckComplete
      ? buildMaterialSelectionData(
          selectedCategory.id,
          selectedSize,
          hasTrash ?? undefined,
          isCleanSingleType ?? undefined
        )
      : null;

    return {
      categoryId: selectedCategory.id,
      classification: finalClassification,
      pricingMode,
      greenHaloEligible: selectedCategory.greenHaloEligible && !reclassCheck?.reclassified,
      isHeavyMaterial: selectedCategory.isHeavyMaterial && !reclassCheck?.reclassified,
      allowedSizes: finalAllowedSizes,
      reclassified: reclassCheck?.reclassified ?? false,
      reclassificationMessage: reclassCheck?.message ?? null,
      isComplete: contaminationCheckComplete,
      materialData,
    };
  }, [selectedCategory, hasTrash, isCleanSingleType, selectedSize, materialType]);

  // Notify parent of changes
  useEffect(() => {
    onSelectionChange(selectionResult);
  }, [selectionResult, onSelectionChange]);

  // Reset contamination state when category changes
  const handleCategorySelect = useCallback((categoryId: string) => {
    setSelectedCategoryId(categoryId);
    setHasTrash(null);
    setIsCleanSingleType(null);
  }, []);

  // Get pricing display info
  const getPricingInfo = () => {
    if (!selectionResult.pricingMode) return null;

    switch (selectionResult.pricingMode) {
      case 'HEAVY_FLAT_FEE':
        return {
          label: 'Flat-Fee Pricing',
          labelEs: 'Precio Fijo',
          description: 'No weight charges — disposal included',
          descriptionEs: 'Sin cargos por peso — disposición incluida',
          icon: CheckCircle,
          color: 'text-success',
        };
      case 'MIXED_YARD_OVERAGE':
      case 'MIXED_TON_OVERAGE':
        return {
          label: 'Weight-Based Pricing',
          labelEs: 'Precio por Peso',
          description: `$${PRICING_POLICIES.overagePerTonGeneral}/ton after included tonnage`,
          descriptionEs: `$${PRICING_POLICIES.overagePerTonGeneral}/ton después del tonelaje incluido`,
          icon: Scale,
          color: 'text-primary',
        };
      case 'MIXED_TON_OVERAGE':
        return {
          label: 'Weight-Based Pricing',
          labelEs: 'Precio por Peso',
          description: `$${PRICING_POLICIES.overagePerTonGeneral}/ton after included tonnage`,
          descriptionEs: `$${PRICING_POLICIES.overagePerTonGeneral}/ton después del tonelaje incluido`,
          icon: Scale,
          color: 'text-primary',
        };
    }
  };

  const pricingInfo = getPricingInfo();

  return (
    <div className="space-y-4">
      {/* Category Selection Header */}
      <div className="flex items-center gap-2">
        <Recycle className="w-4 h-4 text-primary" strokeWidth={2} />
        <span className="text-sm font-medium text-foreground">
          {isSpanish ? '¿Qué tipo de material?' : 'What type of material?'}
        </span>
      </div>

      {/* Category Grid */}
      <div className="grid grid-cols-2 gap-2">
        {availableCategories.map((category) => {
          const IconComponent = category.icon;
          const isSelected = selectedCategoryId === category.id;
          
          return (
            <button
              key={category.id}
              type="button"
              onClick={() => handleCategorySelect(category.id)}
              className={cn(
                "p-2.5 rounded-xl border-2 text-left transition-all relative",
                isSelected
                  ? "border-primary bg-primary/5"
                  : "border-border bg-background hover:border-primary/50"
              )}
            >
              <div className="flex items-start gap-2">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0",
                  isSelected ? "bg-primary/10" : "bg-muted"
                )}>
                  <IconComponent 
                    className={cn(
                      "w-4 h-4",
                      isSelected ? "text-primary" : "text-foreground/70"
                    )} 
                    strokeWidth={2} 
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-foreground text-xs leading-tight">
                    {isSpanish ? category.displayNameEs : category.displayName}
                  </div>
                  <div className="text-[9px] text-muted-foreground mt-0.5 line-clamp-1">
                    {isSpanish ? category.descriptionEs : category.description}
                  </div>
                </div>
              </div>
              
              {isSelected && (
                <div className="absolute top-1.5 right-1.5">
                  <CheckCircle className="w-3.5 h-3.5 text-primary" />
                </div>
              )}
              
              {/* Badges */}
              <div className="mt-1.5 flex items-center gap-1 flex-wrap">
                {category.greenHaloEligible && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="w-2.5 h-2.5" />
                    {isSpanish ? 'Reciclaje' : 'Recycling'}
                  </span>
                )}
                {category.isHeavyMaterial && (
                  <span className="inline-flex items-center gap-0.5 text-[9px] text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded">
                    <AlertCircle className="w-2.5 h-2.5" />
                    {isSpanish ? 'Pesado' : 'Heavy'}
                  </span>
                )}
                {category.allowedSizes.length <= 3 && (
                  <span className="text-[9px] text-muted-foreground">
                    5-10 yd only
                  </span>
                )}
              </div>
            </button>
          );
        })}
      </div>

      {/* Selected Category Details */}
      {selectedCategory && (
        <>
          <div className="border-t border-border my-4" />

          {/* Examples */}
          <div className="p-3 rounded-xl bg-muted/50 border border-border">
            <div className="flex items-center gap-2 mb-2">
              <Info className="w-4 h-4 text-muted-foreground" />
              <span className="text-xs font-medium text-foreground">
                {isSpanish ? 'Ejemplos comunes:' : 'Common examples:'}
              </span>
            </div>
            <div className="flex flex-wrap gap-1.5">
              {(isSpanish ? selectedCategory.examplesEs : selectedCategory.examples).map((example, idx) => (
                <span 
                  key={idx}
                  className="px-2 py-0.5 bg-background rounded text-xs text-muted-foreground border border-border"
                >
                  {example}
                </span>
              ))}
            </div>
          </div>

          {/* Contamination Check (for heavy materials) */}
          {selectedCategory.requiresContaminationCheck && (
            <div className="space-y-3">
              {/* Trash Question */}
              <div className="p-3 rounded-xl border border-border bg-background">
                <div className="text-sm font-medium text-foreground mb-2">
                  {isSpanish 
                    ? '¿Hay basura mezclada con el material?' 
                    : 'Is there any trash mixed with the material?'}
                </div>
                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setHasTrash(false)}
                    className={cn(
                      "flex-1 p-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                      hasTrash === false
                        ? "border-success bg-success/10 text-success"
                        : "border-border hover:border-success/50"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {hasTrash === false && <Check className="w-4 h-4" />}
                      <span>{isSpanish ? 'No, está limpio' : 'No, it\'s clean'}</span>
                    </div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setHasTrash(true)}
                    className={cn(
                      "flex-1 p-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                      hasTrash === true
                        ? "border-amber-500 bg-amber-500/10 text-amber-700"
                        : "border-border hover:border-amber-500/50"
                    )}
                  >
                    <div className="flex items-center justify-center gap-2">
                      {hasTrash === true && <Check className="w-4 h-4" />}
                      <span>{isSpanish ? 'Sí, hay basura' : 'Yes, there\'s trash'}</span>
                    </div>
                  </button>
                </div>
              </div>

              {/* Single Type Question (only if no trash) */}
              {hasTrash === false && (
                <div className="p-3 rounded-xl border border-border bg-background">
                  <div className="text-sm font-medium text-foreground mb-2">
                    {isSpanish 
                      ? '¿Es solo UN tipo de material (sin mezclar)?' 
                      : 'Is it only ONE type of material (not mixed)?'}
                  </div>
                  <div className="flex gap-2">
                    <button
                      type="button"
                      onClick={() => setIsCleanSingleType(true)}
                      className={cn(
                        "flex-1 p-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                        isCleanSingleType === true
                          ? "border-success bg-success/10 text-success"
                          : "border-border hover:border-success/50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isCleanSingleType === true && <Check className="w-4 h-4" />}
                        <span>{isSpanish ? 'Sí, solo uno' : 'Yes, just one'}</span>
                      </div>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsCleanSingleType(false)}
                      className={cn(
                        "flex-1 p-2.5 rounded-lg border-2 text-sm font-medium transition-all",
                        isCleanSingleType === false
                          ? "border-amber-500 bg-amber-500/10 text-amber-700"
                          : "border-border hover:border-amber-500/50"
                      )}
                    >
                      <div className="flex items-center justify-center gap-2">
                        {isCleanSingleType === false && <Check className="w-4 h-4" />}
                        <span>{isSpanish ? 'No, está mezclado' : 'No, it\'s mixed'}</span>
                      </div>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Reclassification Notice */}
          {selectionResult.reclassified && selectionResult.reclassificationMessage && (
            <div className="p-3 rounded-xl bg-amber-50 border border-amber-200">
              <div className="flex items-start gap-2">
                <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-amber-800 font-medium">
                    {isSpanish ? 'Reclasificación de Material' : 'Material Reclassification'}
                  </p>
                  <p className="text-xs text-amber-700 mt-1">
                    {selectionResult.reclassificationMessage}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Pricing Info */}
          {pricingInfo && selectionResult.isComplete && (
            <div className={cn(
              "p-3 rounded-xl border",
              selectionResult.pricingMode === 'HEAVY_FLAT_FEE' 
                ? "bg-success/5 border-success/20" 
                : "bg-primary/5 border-primary/20"
            )}>
              <div className="flex items-start gap-3">
                <pricingInfo.icon className={cn("w-5 h-5 flex-shrink-0 mt-0.5", pricingInfo.color)} />
                <div className="flex-1">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-foreground">
                      {isSpanish ? pricingInfo.labelEs : pricingInfo.label}
                    </span>
                    <span className={cn(
                      "text-xs px-1.5 py-0.5 rounded font-medium",
                      selectionResult.pricingMode === 'HEAVY_FLAT_FEE'
                        ? "bg-success/10 text-success"
                        : "bg-primary/10 text-primary"
                    )}>
                      {selectedCategory.densityHint}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {isSpanish ? pricingInfo.descriptionEs : pricingInfo.description}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Green Halo Note (informational only) */}
          {selectionResult.greenHaloEligible && selectedCategory.greenHaloNote && !selectionResult.reclassified && (
            <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200">
              <div className="flex items-start gap-2">
                <ShieldCheck className="w-4 h-4 text-emerald-600 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-xs text-emerald-800 font-medium">
                    {isSpanish ? 'Soporte de Reciclaje Disponible' : 'Recycling Support Available'}
                  </p>
                  <p className="text-xs text-emerald-700 mt-1">
                    {isSpanish ? selectedCategory.greenHaloNoteEs : selectedCategory.greenHaloNote}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Size Restriction Warning */}
          {selectedCategory.allowedSizes.length <= 3 && !selectionResult.reclassified && (
            <div className="p-2 rounded-lg bg-amber-50 border border-amber-200">
              <div className="flex items-center gap-2">
                <AlertCircle className="w-3.5 h-3.5 text-amber-600" />
                <p className="text-xs text-amber-700">
                  {isSpanish 
                    ? 'Materiales pesados limitados a contenedores de 6-10 yardas'
                    : 'Heavy materials limited to 6-10 yd containers only'}
                </p>
              </div>
            </div>
          )}
        </>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground">
        {isSpanish 
          ? '* Precio final confirmado después de la disposición. Sobrecargas facturadas según ticket de pesaje o inspección visual.'
          : '* Final pricing confirmed after disposal. Overages billed based on scale ticket or visual inspection.'}
      </p>
    </div>
  );
}

export default DebrisDetailsSelector;
