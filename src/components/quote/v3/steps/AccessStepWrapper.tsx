// V3 Step 7 — Access & Placement constraints
import { AccessConstraintStep, type AccessConstraintData } from '../AccessConstraintStep';
import { StepTransition, BackButton } from './shared';
import type { AccessStepProps } from './types';

export function AccessStep({ zip, addressResult, zoneResult, onComplete, onSkip, goBack }: AccessStepProps) {
  return (
    <StepTransition stepKey="access">
      <div className="space-y-5">
        <BackButton onClick={goBack} />

        <div>
          <h4 className="text-xl font-bold text-foreground tracking-tight mb-1">
            Placement & Access
          </h4>
          <p className="text-sm text-muted-foreground">
            Help us plan the best delivery route and placement.
          </p>
        </div>

        <AccessConstraintStep
          zip={zip}
          city={addressResult?.city || zoneResult?.cityName}
          onComplete={onComplete}
          onSkip={onSkip}
        />
      </div>
    </StepTransition>
  );
}
