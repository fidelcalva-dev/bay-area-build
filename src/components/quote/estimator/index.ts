// Material Volume & Weight Estimator - Module Exports

export { MaterialVolumeEstimator } from './MaterialVolumeEstimator';
export { useEstimatorCalculation } from './useEstimatorCalculation';

// Re-export specific types to avoid conflicts
export type { 
  MaterialCategory,
  InputMethod,
  ConfidenceLevel as EstimatorConfidenceLevel,
  MaterialCategoryConfig,
  InputMethodConfig,
  EstimatorInputs,
  EstimatorResult,
  EstimatorData,
} from './types';

// Re-export constants
export { 
  MATERIAL_CATEGORIES,
  INPUT_METHODS,
  INCLUDED_TONS,
  SIZE_THRESHOLDS,
  HEAVY_MAX_SIZE,
  CONCRETE_THICKNESSES,
  getCategoryConfig,
  getInputMethodConfig,
} from './constants';
