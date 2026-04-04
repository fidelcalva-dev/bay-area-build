// ============================================================
// V3 Step 3 — Multi-Select Waste / Material Selection
// ============================================================
import { useState, useMemo } from 'react';
import { Package, Scale, HelpCircle, Phone, Recycle, AlertTriangle, ChevronDown, ChevronUp, Ban, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { StepTransition, BackButton } from './shared';
import {
  GENERAL_DEBRIS_MATERIALS, HEAVY_MATERIALS, SPECIAL_HANDLING_ITEMS,
  PROHIBITED_ITEMS, RECYCLING_CREDIT_COPY, MIXED_LOAD_WARNING,
  groupMaterialsByGroup, hasRecyclableSelection, isMixedLoad, hasSpecialHandling,
  needsManualReview,
  type WasteMaterial,
} from '../wasteCatalog';
import type { MaterialGroup } from '../materialTypes';

// ── Types ───────────────────────────────────────────────────
export type RecyclableSeparation = 'yes' | 'no' | 'not_sure';

export interface WasteSelectionResult {
  materialGroup: MaterialGroup;
  selectedMaterialIds: string[];
  canSeparateRecyclables: RecyclableSeparation | null;
  hasRecyclable: boolean;
  isMixed: boolean;
  needsReview: boolean;
  hasSpecial: boolean;
}

interface WasteSelectionStepProps {
  selectedMaterialGroup: MaterialGroup | null;
  selectedMaterialIds: string[];
  canSeparateRecyclables: RecyclableSeparation | null;
  isProjectHeavy: boolean;
  onSelectGroup: (group: MaterialGroup) => void;
  onSelectMaterials: (ids: string[]) => void;
  onSetCanSeparate: (v: RecyclableSeparation) => void;
  onComplete: (result: WasteSelectionResult) => void;
  goBack: () => void;
}

// ── Category Cards ──────────────────────────────────────────
const GROUP_CARDS: { group: MaterialGroup; icon: typeof Package; label: string; desc: string }[] = [
  { group: 'general', icon: Package, label: 'General Debris', desc: 'Household, remodel, construction, yard waste' },
  { group: 'heavy', icon: Scale, label: 'Heavy Materials', desc: 'Concrete, soil, sand, rocks, tile, asphalt' },
  { group: 'unsure', icon: HelpCircle, label: "Not Sure / Need Help", desc: "We'll help you figure it out" },
];

// ── Component ───────────────────────────────────────────────
export function WasteSelectionStep({
  selectedMaterialGroup, selectedMaterialIds, canSeparateRecyclables,
  isProjectHeavy, onSelectGroup, onSelectMaterials, onSetCanSeparate, onComplete, goBack,
}: WasteSelectionStepProps) {
  const [showSpecialHandling, setShowSpecialHandling] = useState(false);
  const [showProhibited, setShowProhibited] = useState(false);

  const effectiveGroup = selectedMaterialGroup || (isProjectHeavy ? 'heavy' : null);

  // Derived state
  const hasRecyclable = hasRecyclableSelection(selectedMaterialIds);
  const isMixed = isMixedLoad(selectedMaterialIds);
  const hasSpecial = hasSpecialHandling(selectedMaterialIds);
  const needsReview = needsManualReview(selectedMaterialIds);

  // Toggle material selection
  const toggleMaterial = (id: string) => {
    const next = selectedMaterialIds.includes(id)
      ? selectedMaterialIds.filter(x => x !== id)
      : [...selectedMaterialIds, id];
    onSelectMaterials(next);
  };

  // Handle continue
  const handleContinue = () => {
    onComplete({
      materialGroup: effectiveGroup || 'general',
      selectedMaterialIds,
      canSeparateRecyclables,
      hasRecyclable,
      isMixed,
      needsReview,
      hasSpecial,
    });
  };

  // ── Group Selection ─────────────────────────────────────
  if (!effectiveGroup || effectiveGroup === 'unsure') {
    return (
      <StepTransition stepKey="waste-group">
        <div className="space-y-5">
          <BackButton onClick={goBack} />
          <div>
            <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">What type of waste?</h4>
            <p className="text-sm text-muted-foreground">
              Select the materials going into the dumpster. You can choose more than one. This helps us recommend the right size, pricing, and recycling options.
            </p>
          </div>
          <div className="space-y-3">
            {GROUP_CARDS.map(({ group, icon: Icon, label, desc }) => (
              <button
                key={group}
                onClick={() => onSelectGroup(group === 'unsure' ? 'general' : group)}
                className={cn(
                  'w-full flex items-center gap-4 p-4 rounded-xl border transition-all duration-150 text-left group/card',
                  'border-border/60 hover:border-primary/40 hover:shadow-sm'
                )}
              >
                <div className="w-11 h-11 rounded-xl bg-muted/60 flex items-center justify-center shrink-0 group-hover/card:bg-primary/10 transition-colors">
                  <Icon className="w-5 h-5 text-primary" />
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-semibold text-foreground text-sm">{label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{desc}</p>
                </div>
              </button>
            ))}
          </div>
          <Button variant="outline" size="default" className="w-full rounded-xl text-xs" onClick={() => window.open('tel:+15106802150', '_blank')}>
            <Phone className="w-4 h-4 mr-1.5" />
            Not sure? Call us — we'll help
          </Button>
        </div>
      </StepTransition>
    );
  }

  // ── Material Multi-Select ───────────────────────────────
  const primaryMaterials = effectiveGroup === 'heavy' ? HEAVY_MATERIALS : GENERAL_DEBRIS_MATERIALS;
  const grouped = groupMaterialsByGroup(primaryMaterials);

  return (
    <StepTransition stepKey="waste-materials">
      <div className="space-y-5">
        <BackButton onClick={() => onSelectGroup(null as any)} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            {effectiveGroup === 'heavy' ? 'What heavy materials?' : 'What type of debris?'}
          </h4>
          <p className="text-sm text-muted-foreground">
            Select all that apply. This helps us recommend the right size and pricing.
          </p>
        </div>

        {/* Heavy materials size warning */}
        {effectiveGroup === 'heavy' && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200">
            <Scale className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Heavy materials are limited to 5, 8, or 10-yard dumpsters. Must not exceed fill line.</span>
          </div>
        )}

        {/* Material chips by group */}
        <div className="space-y-4">
          {Object.entries(grouped).map(([groupName, materials]) => (
            <div key={groupName}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">{groupName}</p>
              <div className="flex flex-wrap gap-2">
                {materials.map((mat) => {
                  const selected = selectedMaterialIds.includes(mat.id);
                  return (
                    <button
                      key={mat.id}
                      onClick={() => toggleMaterial(mat.id)}
                      className={cn(
                        'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150',
                        selected
                          ? 'border-primary bg-primary/10 text-primary shadow-sm'
                          : 'border-border/60 text-foreground hover:border-primary/40 hover:bg-muted/40'
                      )}
                    >
                      {mat.label}
                      {mat.recyclableEligible && (
                        <Recycle className="w-3 h-3 text-emerald-600 dark:text-emerald-400" />
                      )}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>

        {/* Special Handling Section */}
        <div>
          <button
            onClick={() => setShowSpecialHandling(!showSpecialHandling)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            Special handling items
            {showSpecialHandling ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showSpecialHandling && (
            <div className="flex flex-wrap gap-2 mt-2">
              {SPECIAL_HANDLING_ITEMS.map((item) => {
                const selected = selectedMaterialIds.includes(item.id);
                return (
                  <button
                    key={item.id}
                    onClick={() => toggleMaterial(item.id)}
                    className={cn(
                      'inline-flex items-center gap-1.5 px-3 py-2 rounded-lg border text-xs font-medium transition-all duration-150',
                      selected
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-950/20 text-amber-800 dark:text-amber-200 shadow-sm'
                        : 'border-border/60 text-foreground hover:border-amber-300 hover:bg-muted/40'
                    )}
                  >
                    <AlertTriangle className="w-3 h-3" />
                    {item.label}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Prohibited Items Section */}
        <div>
          <button
            onClick={() => setShowProhibited(!showProhibited)}
            className="flex items-center gap-2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
          >
            <Ban className="w-3.5 h-3.5" />
            Not accepted items
            {showProhibited ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
          </button>
          {showProhibited && (
            <div className="flex flex-wrap gap-2 mt-2">
              {PROHIBITED_ITEMS.map((item) => (
                <span key={item} className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-destructive/10 text-destructive text-xs font-medium">
                  <Ban className="w-3 h-3" />
                  {item}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Mixed Load Warning */}
        {isMixed && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-200 dark:border-amber-800/40 text-xs text-amber-800 dark:text-amber-200">
            <AlertTriangle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>{MIXED_LOAD_WARNING}</span>
          </div>
        )}

        {/* Recyclable Credit Message */}
        {hasRecyclable && !isMixed && (
          <div className="flex items-start gap-2.5 px-3.5 py-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/20 border border-emerald-200 dark:border-emerald-800/40 text-xs text-emerald-800 dark:text-emerald-200">
            <Recycle className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <div>
              <p className="font-semibold mb-0.5">{RECYCLING_CREDIT_COPY.badge}</p>
              <p>{RECYCLING_CREDIT_COPY.disclaimer}</p>
            </div>
          </div>
        )}

        {/* Recyclable Separation Question */}
        {hasRecyclable && (
          <div className="space-y-2">
            <p className="text-sm font-medium text-foreground">Can you keep recyclable materials separate?</p>
            <div className="flex gap-2">
              {([
                { value: 'yes' as const, label: 'Yes' },
                { value: 'no' as const, label: 'No' },
                { value: 'not_sure' as const, label: 'Not Sure' },
              ]).map(({ value, label }) => (
                <button
                  key={value}
                  onClick={() => onSetCanSeparate(value)}
                  className={cn(
                    'flex-1 py-2.5 rounded-lg border text-xs font-medium transition-all duration-150',
                    canSeparateRecyclables === value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-border/60 text-foreground hover:border-primary/40'
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Review Required Notice */}
        {needsReview && (
          <div className="flex items-start gap-2.5 px-3.5 py-2.5 rounded-xl bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800/40 text-xs text-blue-800 dark:text-blue-200">
            <Info className="w-3.5 h-3.5 mt-0.5 shrink-0" />
            <span>Some of your selections may require a quick review by our team to confirm pricing.</span>
          </div>
        )}

        {/* Support Copy */}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Clean, separated recyclable materials may qualify for a recycling credit or reduced disposal charge. Mixed loads usually do not qualify.
        </p>

        {/* Continue Button */}
        <Button
          onClick={handleContinue}
          disabled={selectedMaterialIds.length === 0}
          className="w-full rounded-xl"
          size="lg"
        >
          Continue
        </Button>

        {/* Help CTA */}
        <Button variant="ghost" size="sm" className="w-full text-xs text-muted-foreground" onClick={() => window.open('tel:+15106802150', '_blank')}>
          <Phone className="w-3.5 h-3.5 mr-1.5" />
          Not sure? We'll help you choose
        </Button>
      </div>
    </StepTransition>
  );
}
