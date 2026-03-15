// Heavy Material Contract Clauses Component
// Uses canonical policy language from policyLanguage.ts

import { FileText, AlertCircle, Camera, Scale, Leaf } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Separator } from '@/components/ui/separator';
import { DEBRIS_INCLUDED_TONS, EXTRA_TON_RATE } from '@/lib/heavyMaterialService';
import {
  FILL_LINE_NOTICE,
  CONTAMINATION_NOTICE,
  MISDECLARED_REROUTE_NOTICE,
  PHOTO_DOCUMENTATION_NOTICE,
  GREEN_HALO_NOTICE,
} from '@/lib/policyLanguage';

interface HeavyContractClausesProps {
  sizeYd: number;
  materialName: string;
  requestedGreenHalo: boolean;
  className?: string;
}

// Generate contract clause text for heavy orders (uses canonical language)
export function getHeavyContractClauses(
  sizeYd: number,
  materialName: string,
  requestedGreenHalo: boolean
): {
  fillLineClause: string;
  reclassificationClause: string;
  photoRequirementClause: string;
  greenHaloClause?: string;
} {
  const includedTons = DEBRIS_INCLUDED_TONS[sizeYd] || 1.0;

  const fillLineClause = `FILL-LINE COMPLIANCE: ${FILL_LINE_NOTICE.en}`;

  const reclassificationClause = `MATERIAL RECLASSIFICATION: ${CONTAMINATION_NOTICE.en} ${MISDECLARED_REROUTE_NOTICE.en} Under reclassification for this ${sizeYd}-yard container: included weight allowance is ${includedTons.toFixed(2)} tons; all weight exceeding ${includedTons.toFixed(2)} tons will be charged at $${EXTRA_TON_RATE}/ton based on certified scale ticket.`;

  const photoRequirementClause = `PHOTO DOCUMENTATION: ${PHOTO_DOCUMENTATION_NOTICE.en}`;

  const greenHaloClause = requestedGreenHalo
    ? `GREEN HALO CERTIFICATION: ${GREEN_HALO_NOTICE.en}`
    : undefined;

  return {
    fillLineClause,
    reclassificationClause,
    photoRequirementClause,
    greenHaloClause,
  };
}

export function HeavyContractClauses({
  sizeYd,
  materialName,
  requestedGreenHalo,
  className,
}: HeavyContractClausesProps) {
  const clauses = getHeavyContractClauses(sizeYd, materialName, requestedGreenHalo);
  const includedTons = DEBRIS_INCLUDED_TONS[sizeYd] || 1.0;

  return (
    <div className={cn("space-y-4", className)}>
      <div className="flex items-center gap-2 text-sm font-semibold text-foreground">
        <FileText className="w-4 h-4 text-primary" />
        Heavy Material Terms & Conditions
      </div>

      {/* Fill Line Clause */}
      <ClauseCard
        icon={<Scale className="w-4 h-4" />}
        title="Fill-Line Compliance"
        iconColor="text-amber-600"
        bgColor="bg-amber-50 dark:bg-amber-950/30"
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          {clauses.fillLineClause}
        </p>
      </ClauseCard>

      {/* Reclassification Clause */}
      <ClauseCard
        icon={<AlertCircle className="w-4 h-4" />}
        title="Material Reclassification"
        iconColor="text-destructive"
        bgColor="bg-destructive/5"
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          {clauses.reclassificationClause}
        </p>
        <div className="mt-2 p-2 bg-muted rounded text-xs">
          <strong>If contaminated:</strong> Included = {includedTons.toFixed(2)}T, Extra = ${EXTRA_TON_RATE}/ton
        </div>
      </ClauseCard>

      {/* Photo Requirement Clause */}
      <ClauseCard
        icon={<Camera className="w-4 h-4" />}
        title="Photo Documentation"
        iconColor="text-blue-600"
        bgColor="bg-blue-50 dark:bg-blue-950/30"
      >
        <p className="text-xs text-muted-foreground leading-relaxed">
          {clauses.photoRequirementClause}
        </p>
      </ClauseCard>

      {/* Green Halo Clause */}
      {requestedGreenHalo && clauses.greenHaloClause && (
        <ClauseCard
          icon={<Leaf className="w-4 h-4" />}
          title="Green Halo Certification"
          iconColor="text-success"
          bgColor="bg-success/5"
        >
          <p className="text-xs text-muted-foreground leading-relaxed">
            {clauses.greenHaloClause}
          </p>
        </ClauseCard>
      )}

      <Separator />

      <p className="text-[11px] text-muted-foreground italic">
        By proceeding, you acknowledge and agree to these heavy material terms in addition to our standard Service Terms.
      </p>
    </div>
  );
}

function ClauseCard({
  icon,
  title,
  children,
  iconColor,
  bgColor,
}: {
  icon: React.ReactNode;
  title: string;
  children: React.ReactNode;
  iconColor: string;
  bgColor: string;
}) {
  return (
    <div className={cn("p-3 rounded-lg border border-border", bgColor)}>
      <div className="flex items-center gap-2 mb-2">
        <span className={iconColor}>{icon}</span>
        <span className="text-sm font-medium text-foreground">{title}</span>
      </div>
      {children}
    </div>
  );
}
