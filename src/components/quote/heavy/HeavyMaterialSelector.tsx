// Heavy Material Selector Component
// Phase 3: UI for selecting heavy materials with fill-line warnings
// Uses Lucide icons instead of emojis for consistency

import { useState, useEffect } from 'react';
import { cn } from '@/lib/utils';
import { Check, AlertTriangle, Leaf, Info } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Slider } from '@/components/ui/slider';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { useHeavyMaterials } from '@/hooks/useHeavyMaterials';
import type { HeavyMaterialProfile } from '@/lib/heavyMaterialService';
import { getHeavyMaterialIcon } from '@/lib/heavyMaterialIcons';

interface HeavyMaterialSelectorProps {
  sizeYd: number;
  selectedMaterialCode: string | null;
  onMaterialChange: (code: string | null) => void;
  fillPct: number;
  onFillPctChange: (pct: number) => void;
  requestGreenHalo: boolean;
  onGreenHaloChange: (requested: boolean) => void;
  className?: string;
}

export function HeavyMaterialSelector({
  sizeYd,
  selectedMaterialCode,
  onMaterialChange,
  fillPct,
  onFillPctChange,
  requestGreenHalo,
  onGreenHaloChange,
  className,
}: HeavyMaterialSelectorProps) {
  const [showEducation, setShowEducation] = useState(false);

  const {
    profiles,
    selectedProfile,
    estimation,
    warning,
    educationText,
    enforcedFillPct,
    fillWasEnforced,
    fillEnforcementMessage,
    isLoading,
  } = useHeavyMaterials({
    sizeYd,
    materialCode: selectedMaterialCode,
    fillPct,
    requestGreenHalo,
  });

  // When fill is enforced, update parent
  useEffect(() => {
    if (fillWasEnforced && enforcedFillPct !== fillPct) {
      onFillPctChange(enforcedFillPct);
    }
  }, [fillWasEnforced, enforcedFillPct, fillPct, onFillPctChange]);

  if (isLoading) {
    return (
      <div className={cn("animate-pulse bg-muted rounded-lg h-48", className)} />
    );
  }

  return (
    <div className={cn("space-y-4", className)}>
      {/* Material Grid */}
      <div className="space-y-2">
        <label className="text-sm font-medium text-foreground">
          What type of heavy material?
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
          {profiles.map((profile) => (
            <MaterialCard
              key={profile.material_code}
              profile={profile}
              isSelected={selectedMaterialCode === profile.material_code}
              onClick={() => onMaterialChange(profile.material_code)}
            />
          ))}
        </div>
      </div>

      {/* Selected Material Details */}
      {selectedProfile && (
        <div className="space-y-4 p-4 bg-muted/50 rounded-xl border border-border">
          {/* Fill Level Slider (only for non-full-fill materials) */}
          {estimation && !estimation.allowFullFill && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-foreground flex items-center gap-2">
                  Fill Level
                  <Badge variant="outline" className="text-xs">
                    {Math.round(fillPct * 100)}%
                  </Badge>
                </label>
                <span className="text-xs text-muted-foreground">
                  Recommended: {Math.round(selectedProfile.recommended_fill_pct * 100)}%
                </span>
              </div>
              
              <Slider
                value={[fillPct * 100]}
                onValueChange={([val]) => onFillPctChange(val / 100)}
                min={30}
                max={100}
                step={5}
                className="w-full"
              />

              {/* Fill line indicator */}
              <div className="relative h-6 bg-gradient-to-r from-success via-amber-400 to-destructive rounded-full overflow-hidden">
                <div 
                  className="absolute top-0 bottom-0 w-0.5 bg-foreground"
                  style={{ left: `${selectedProfile.recommended_fill_pct * 100}%` }}
                />
                <div 
                  className="absolute top-0 bottom-0 right-0 bg-destructive/20"
                  style={{ width: `${100 - selectedProfile.recommended_fill_pct * 100}%` }}
                />
                <span 
                  className="absolute text-[10px] font-bold text-foreground top-1/2 -translate-y-1/2"
                  style={{ left: `${selectedProfile.recommended_fill_pct * 100 + 2}%` }}
                >
                  FILL LINE
                </span>
              </div>
            </div>
          )}

          {/* Fill Enforcement Message */}
          {fillEnforcementMessage && (
            <div className="flex items-start gap-2 p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
              <p className="text-sm text-amber-800 dark:text-amber-200">
                {fillEnforcementMessage}
              </p>
            </div>
          )}

          {/* Weight Estimation */}
          {estimation && (
            <div className="flex items-center justify-between p-3 bg-background rounded-lg border border-border">
              <div>
                <p className="text-sm font-medium text-foreground">
                  Estimated Weight
                </p>
                <p className="text-xs text-muted-foreground">
                  {estimation.volumeEffective.toFixed(1)} cubic yards effective
                </p>
              </div>
              <div className="text-right">
                <p className={cn(
                  "text-lg font-bold",
                  estimation.riskLevel === 'HIGH' && "text-destructive",
                  estimation.riskLevel === 'MED' && "text-amber-600",
                  estimation.riskLevel === 'LOW' && "text-success"
                )}>
                  {estimation.weightMinTons.toFixed(1)}–{estimation.weightMaxTons.toFixed(1)} T
                </p>
                <Badge 
                  variant={estimation.riskLevel === 'LOW' ? 'default' : 'destructive'}
                  className={cn(
                    "text-xs",
                    estimation.riskLevel === 'MED' && "bg-amber-500"
                  )}
                >
                  {estimation.riskLevel === 'LOW' && '✓ Safe'}
                  {estimation.riskLevel === 'MED' && '⚡ Caution'}
                  {estimation.riskLevel === 'HIGH' && '⚠️ Overweight'}
                </Badge>
              </div>
            </div>
          )}

          {/* Warning Message */}
          {warning && (
            <div className={cn(
              "flex items-start gap-2 p-3 rounded-lg border",
              warning.severity === 'error' && "bg-destructive/10 border-destructive/30",
              warning.severity === 'warning' && "bg-amber-50 dark:bg-amber-950/30 border-amber-200 dark:border-amber-800"
            )}>
              <AlertTriangle className={cn(
                "w-4 h-4 shrink-0 mt-0.5",
                warning.severity === 'error' && "text-destructive",
                warning.severity === 'warning' && "text-amber-600"
              )} />
              <p className={cn(
                "text-sm",
                warning.severity === 'error' && "text-destructive",
                warning.severity === 'warning' && "text-amber-800 dark:text-amber-200"
              )}>
                {warning.message}
              </p>
            </div>
          )}

          {/* Green Halo Option */}
          {selectedProfile.green_halo_allowed && (
            <button
              type="button"
              onClick={() => onGreenHaloChange(!requestGreenHalo)}
              className={cn(
                "w-full flex items-center gap-3 p-3 rounded-lg border-2 transition-all",
                requestGreenHalo
                  ? "border-success bg-success/10"
                  : "border-input bg-background hover:border-success/50"
              )}
            >
              <div className={cn(
                "w-8 h-8 rounded-full flex items-center justify-center",
                requestGreenHalo ? "bg-success" : "bg-muted"
              )}>
                <Leaf className={cn(
                  "w-4 h-4",
                  requestGreenHalo ? "text-success-foreground" : "text-muted-foreground"
                )} />
              </div>
              <div className="flex-1 text-left">
                <p className="font-medium text-foreground">
                  Green Halo™ Receipt
                </p>
                <p className="text-xs text-muted-foreground">
                  Get recycling documentation for clean loads
                </p>
              </div>
              {requestGreenHalo && (
                <Check className="w-5 h-5 text-success" />
              )}
            </button>
          )}

          {/* Green Halo Warning */}
          {requestGreenHalo && (
            <div className="flex items-start gap-2 p-3 bg-success/10 border border-success/30 rounded-lg">
              <Leaf className="w-4 h-4 text-success shrink-0 mt-0.5" />
              <p className="text-sm text-foreground">
                Must be 100% clean and separated. Mixed materials will be reclassified to standard pricing.
              </p>
            </div>
          )}

          {/* Education Collapsible */}
          <Collapsible open={showEducation} onOpenChange={setShowEducation}>
            <CollapsibleTrigger className="w-full flex items-center justify-between p-2 hover:bg-muted rounded-lg transition-colors">
              <span className="flex items-center gap-2 text-sm text-muted-foreground">
                <Info className="w-4 h-4" />
                Why can't I fill it to the top?
              </span>
              <span className="text-xs text-primary">
                {showEducation ? 'Hide' : 'Learn more'}
              </span>
            </CollapsibleTrigger>
            <CollapsibleContent className="pt-2">
              <div className="p-3 bg-background border border-border rounded-lg text-sm text-muted-foreground">
                {educationText}
              </div>
            </CollapsibleContent>
          </Collapsible>
        </div>
      )}
    </div>
  );
}

// Individual Material Card with Lucide icons instead of emojis
function MaterialCard({
  profile,
  isSelected,
  onClick,
}: {
  profile: HeavyMaterialProfile;
  isSelected: boolean;
  onClick: () => void;
}) {
  // Get the Lucide icon for this material
  const MaterialIcon = getHeavyMaterialIcon(profile.material_code);
  
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "relative flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 transition-all text-center",
        "hover:shadow-md focus:outline-none focus:ring-2 focus:ring-primary/20",
        isSelected
          ? "border-primary bg-primary/5 shadow-sm"
          : "border-input bg-background hover:border-primary/50"
      )}
    >
      {/* Lucide icon instead of emoji */}
      <div className={cn(
        "w-10 h-10 rounded-xl flex items-center justify-center",
        isSelected ? "bg-primary/15" : "bg-muted/60"
      )}>
        <MaterialIcon 
          className={cn(
            "w-5 h-5",
            isSelected ? "text-primary" : "text-muted-foreground"
          )}
          strokeWidth={1.75}
        />
      </div>
      <span className="text-xs font-medium text-foreground leading-tight">
        {profile.display_name}
      </span>
      
      {/* Green Halo badge */}
      {profile.green_halo_allowed && (
        <Badge variant="outline" className="text-[10px] px-1.5 py-0 h-4 bg-success/10 border-success/30 text-success">
          <Leaf className="w-2.5 h-2.5 mr-0.5" />
          Recyclable
        </Badge>
      )}
      
      {/* Selection checkmark */}
      {isSelected && (
        <div className="absolute -top-1 -right-1 w-5 h-5 rounded-full bg-primary flex items-center justify-center">
          <Check className="w-3 h-3 text-primary-foreground" strokeWidth={3} />
        </div>
      )}
    </button>
  );
}
