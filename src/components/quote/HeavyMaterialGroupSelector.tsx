// Heavy Material Group Selector — Clean No. 1, Clean No. 2, All Mixed, Other
// Uses the canonical heavy material config for pricing

import { useState } from 'react';
import { Mountain, Grip, Shuffle, HelpCircle, Check, FileText } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Textarea } from '@/components/ui/textarea';
import {
  HEAVY_MATERIAL_GROUPS,
  HEAVY_ALLOWED_SIZES,
  getHeavyPriceBreakdown,
  type HeavyMaterialGroup,
  type HeavySize,
  type HeavyPriceBreakdown,
} from '@/config/heavyMaterialConfig';

export interface HeavyGroupSelectionResult {
  group: HeavyMaterialGroup | null;
  size: HeavySize;
  breakdown: HeavyPriceBreakdown | null;
  otherNotes: string;
}

interface HeavyMaterialGroupSelectorProps {
  selectedSize: HeavySize;
  onSelectionChange: (result: HeavyGroupSelectionResult) => void;
  className?: string;
}

const GROUP_ICONS: Record<HeavyMaterialGroup, React.ReactNode> = {
  CLEAN_NO_1: <Mountain className="w-5 h-5" strokeWidth={2} />,
  CLEAN_NO_2: <Grip className="w-5 h-5" strokeWidth={2} />,
  ALL_MIXED: <Shuffle className="w-5 h-5" strokeWidth={2} />,
  OTHER_HEAVY: <HelpCircle className="w-5 h-5" strokeWidth={2} />,
};

export function HeavyMaterialGroupSelector({
  selectedSize,
  onSelectionChange,
  className,
}: HeavyMaterialGroupSelectorProps) {
  const [selectedGroup, setSelectedGroup] = useState<HeavyMaterialGroup | null>(null);
  const [otherNotes, setOtherNotes] = useState('');

  const handleGroupSelect = (groupId: HeavyMaterialGroup) => {
    setSelectedGroup(groupId);
    const breakdown = getHeavyPriceBreakdown(selectedSize, groupId);
    onSelectionChange({
      group: groupId,
      size: selectedSize,
      breakdown,
      otherNotes: groupId === 'OTHER_HEAVY' ? otherNotes : '',
    });
  };

  const handleNotesChange = (notes: string) => {
    setOtherNotes(notes);
    if (selectedGroup === 'OTHER_HEAVY') {
      const breakdown = getHeavyPriceBreakdown(selectedSize, 'OTHER_HEAVY');
      onSelectionChange({
        group: 'OTHER_HEAVY',
        size: selectedSize,
        breakdown,
        otherNotes: notes,
      });
    }
  };

  const breakdown = selectedGroup ? getHeavyPriceBreakdown(selectedSize, selectedGroup) : null;

  return (
    <div className={cn('space-y-4', className)}>
      {/* Group Label */}
      <div>
        <h3 className="text-sm font-semibold text-foreground mb-1">
          What type of heavy material?
        </h3>
        <p className="text-xs text-muted-foreground">
          Select the material group — pricing adjusts automatically
        </p>
      </div>

      {/* Group Cards */}
      <div className="grid gap-3">
        {HEAVY_MATERIAL_GROUPS.map(group => {
          const isSelected = selectedGroup === group.id;
          const groupBreakdown = getHeavyPriceBreakdown(selectedSize, group.id);

          return (
            <button
              key={group.id}
              type="button"
              onClick={() => handleGroupSelect(group.id)}
              className={cn(
                'p-4 rounded-xl border-2 text-left transition-all w-full',
                isSelected
                  ? 'border-primary bg-primary/5'
                  : 'border-border bg-card hover:border-primary/40'
              )}
            >
              <div className="flex items-start gap-3">
                <div className={cn(
                  'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                  isSelected ? 'bg-primary/10 text-primary' : 'bg-muted text-muted-foreground'
                )}>
                  {GROUP_ICONS[group.id]}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <span className="font-semibold text-sm text-foreground">
                      {group.customerLabel}
                    </span>
                    <span className="text-sm font-bold text-foreground whitespace-nowrap">
                      ${groupBreakdown.totalPrice}
                    </span>
                  </div>
                  <div className="text-xs text-muted-foreground mt-0.5">
                    {group.materials.join(' · ')}
                  </div>
                  {isSelected && (
                    <div className="mt-2 flex items-center gap-1 text-xs text-primary">
                      <Check className="w-3 h-3" />
                      <span>Selected</span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>

      {/* Other Notes */}
      {selectedGroup === 'OTHER_HEAVY' && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">
              Describe your material
            </span>
          </div>
          <Textarea
            value={otherNotes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Describe the type of heavy material you need to dispose of..."
            className="min-h-[80px] text-sm"
          />
        </div>
      )}

      {/* Price Breakdown */}
      {breakdown && (
        <div className="p-4 rounded-xl bg-success/5 border border-success/20 space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-foreground">{selectedSize} Yard — {breakdown.groupLabel}</span>
            <span className="text-xl font-bold text-success">${breakdown.totalPrice}</span>
          </div>
          <div className="text-xs text-muted-foreground space-y-1">
            <div className="flex justify-between">
              <span>Service cost</span>
              <span>${breakdown.serviceCost}</span>
            </div>
            <div className="flex justify-between">
              <span>Dump fee ({selectedSize} yd × ${breakdown.dumpFeePerYard}/yd)</span>
              <span>${breakdown.dumpFee}</span>
            </div>
            <div className="border-t border-border pt-1 mt-1 flex justify-between font-semibold text-foreground">
              <span>Total (flat fee)</span>
              <span>${breakdown.totalPrice}</span>
            </div>
          </div>
          <div className="flex items-center gap-1 text-xs text-success mt-1">
            <Check className="w-3 h-3" />
            <span>Flat fee — disposal included, no weight charges</span>
          </div>
        </div>
      )}

      {/* Disclaimer */}
      <p className="text-[10px] text-muted-foreground">
        * Heavy materials limited to 5, 8, and 10 yard dumpsters only. 
        Pricing includes disposal. If trash or mixed debris is found, 
        reclassification and additional charges may apply.
      </p>
    </div>
  );
}

export default HeavyMaterialGroupSelector;
