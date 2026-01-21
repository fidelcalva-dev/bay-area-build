// Material Volume & Weight Estimator Types

export type MaterialCategory = 
  | 'mixed_cd'
  | 'roofing'
  | 'drywall'
  | 'lumber'
  | 'concrete'
  | 'dirt_soil'
  | 'green_waste'
  | 'metal'
  | 'appliances';

export type InputMethod = 
  | 'sqft'
  | 'cuyd'
  | 'dimensions'
  | 'count';

export type ConfidenceLevel = 'safe' | 'tight' | 'overflow' | 'overweight';

export interface MaterialCategoryConfig {
  id: MaterialCategory;
  label: string;
  labelEs: string;
  icon: string;
  description: string;
  descriptionEs: string;
  isHeavy: boolean;
  allowedInputMethods: InputMethod[];
  densityLow: number; // tons per cubic yard
  densityHigh: number;
  // Extra prompts for input
  askThickness?: boolean;
  askLayers?: boolean;
  askSheets?: boolean;
}

export interface InputMethodConfig {
  id: InputMethod;
  label: string;
  labelEs: string;
  description: string;
  descriptionEs: string;
  icon: string;
}

export interface EstimatorInputs {
  category: MaterialCategory | null;
  inputMethod: InputMethod | null;
  // Input values
  squareFeet?: number;
  cubicYards?: number;
  length?: number;
  width?: number;
  height?: number;
  count?: number;
  // Extra inputs
  thicknessInches?: number;
  layers?: number;
  sheetCount?: number;
}

export interface EstimatorResult {
  volumeLow: number; // cubic yards
  volumeHigh: number;
  weightLow: number; // tons
  weightHigh: number;
  recommendedSize: number;
  alternateSize?: number;
  confidence: ConfidenceLevel;
  confidenceLabel: string;
  confidenceNote: string;
  isHeavy: boolean;
  multipleRequired?: boolean;
  multipleCount?: number;
}

export interface EstimatorData {
  estimatorUsed: boolean;
  materialCategory: MaterialCategory | null;
  inputMethod: InputMethod | null;
  inputValues: Record<string, number>;
  estimatedVolumeCy: number;
  estimatedWeightTonsLow: number;
  estimatedWeightTonsHigh: number;
  recommendedSizeYards: number;
  confidenceLevel: ConfidenceLevel;
}
