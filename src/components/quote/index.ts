// Quote System Exports - V3 is the canonical calculator, Minimal is the high-conversion variant
export { InstantQuoteCalculatorV3 } from './InstantQuoteCalculatorV3';
export { MinimalQuoteCalculator } from './MinimalQuoteCalculator';
export { QuoteOrderFlow } from './QuoteOrderFlow';
export { WeightEducation } from './WeightEducation';
export { QuoteBreakdown } from './QuoteBreakdown';
export { DebrisEstimator } from './DebrisEstimator';
export { HeavyMaterialSelector } from './HeavyMaterialSelector';
export { FacilityRequestOption, type FacilityRequest } from './FacilityRequestOption';
export { ComplianceToggle } from './ComplianceToggle';
export { AddressInput } from './steps/AddressInput';
export { PlacementMap } from './steps/PlacementMap';
export { ProjectCategorySelector } from './steps/ProjectCategorySelector';
export { SmartMaterialSelector } from './steps/SmartMaterialSelector';
export { UserTypeMicroCopy, YardValueExplanation, USER_TYPE_HELPER_TEXT } from './UserTypeMicroCopy';
export { useQuoteCalculation, getZoneByZip } from './hooks/useQuoteCalculation';
export { usePricingData, useZoneLookup, calculateIncludedTons, getSizeDbId } from './hooks/usePricingData';
export { useQuoteFlow, type QuoteStep, type MaterialCategory, type QuoteFlowState, type QuoteFlowReturn } from './hooks/useQuoteFlow';
export * from './types';
export * from './constants';

// UI Components
export * from './ui';
