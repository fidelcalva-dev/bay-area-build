/**
 * Dumpster Size Visualizer - Canonical Constants
 * All dimensions in feet (W × L × H)
 */

export type DumpsterSize = 5 | 8 | 10 | 20 | 30 | 40;

export interface DumpsterSpec {
  yards: DumpsterSize;
  widthFt: number;
  lengthFt: number;
  heightFt: number;
  pickupLoads: string;
  volumeCuYd: number;
  tonsIncluded: number;
  isHeavyOnly?: boolean;
}

/**
 * CANONICAL SPECS (LOCKED) - W × L × H
 * These dimensions are the single source of truth across all visualizations
 */
export const DUMPSTER_SPECS: Record<DumpsterSize, DumpsterSpec> = {
  5:  { yards: 5,  widthFt: 5,   lengthFt: 12, heightFt: 2.25, pickupLoads: '2–3',   volumeCuYd: 5,  tonsIncluded: 0.5 },
  8:  { yards: 8,  widthFt: 6,   lengthFt: 12, heightFt: 3,    pickupLoads: '3–4',   volumeCuYd: 8,  tonsIncluded: 0.5 },
  10: { yards: 10, widthFt: 7.5, lengthFt: 12, heightFt: 3,    pickupLoads: '4–5',   volumeCuYd: 10, tonsIncluded: 1 },
  20: { yards: 20, widthFt: 7.5, lengthFt: 18, heightFt: 4,    pickupLoads: '6–8',   volumeCuYd: 20, tonsIncluded: 2 },
  30: { yards: 30, widthFt: 7.5, lengthFt: 18, heightFt: 6,    pickupLoads: '9–12',  volumeCuYd: 30, tonsIncluded: 3 },
  40: { yards: 40, widthFt: 7.5, lengthFt: 24, heightFt: 6,    pickupLoads: '12–16', volumeCuYd: 40, tonsIncluded: 4 },
};

export const GENERAL_SIZES: DumpsterSize[] = [6, 8, 10, 20, 30, 40];
export const HEAVY_SIZES: DumpsterSize[] = [6, 8, 10];

// Debris presets for "Will it fit?" calculator
export interface DebrisPreset {
  id: string;
  label: string;
  category: 'homeowner' | 'contractor' | 'heavy';
  volumeMin: number; // cubic yards
  volumeMax: number;
  isHeavy?: boolean;
  description?: string;
}

export const DEBRIS_PRESETS: DebrisPreset[] = [
  // Homeowner presets
  { id: 'garage-small', label: 'Garage cleanout (small)', category: 'homeowner', volumeMin: 4, volumeMax: 8 },
  { id: 'garage-medium', label: 'Garage cleanout (medium)', category: 'homeowner', volumeMin: 8, volumeMax: 15 },
  { id: 'bathroom-remodel', label: 'Bathroom remodel', category: 'homeowner', volumeMin: 6, volumeMax: 12 },
  { id: 'kitchen-remodel', label: 'Kitchen remodel', category: 'homeowner', volumeMin: 10, volumeMax: 20 },
  { id: 'roof-small', label: 'Roof tear-off (small home)', category: 'homeowner', volumeMin: 8, volumeMax: 15 },
  { id: 'roof-large', label: 'Roof tear-off (large home)', category: 'homeowner', volumeMin: 15, volumeMax: 30 },
  { id: 'yard-cleanup', label: 'Yard cleanup (green waste)', category: 'homeowner', volumeMin: 4, volumeMax: 10 },
  
  // Contractor presets
  { id: 'one-room-demo', label: 'One-room demo', category: 'contractor', volumeMin: 6, volumeMax: 12 },
  { id: 'full-remodel', label: 'Full remodel debris', category: 'contractor', volumeMin: 15, volumeMax: 35 },
  { id: 'light-demolition', label: 'Light demolition', category: 'contractor', volumeMin: 10, volumeMax: 20 },
  { id: 'commercial-cleanout', label: 'Commercial cleanout', category: 'contractor', volumeMin: 20, volumeMax: 40 },
  
  // Heavy presets
  { id: 'concrete-4in', label: 'Concrete slab (4" thick)', category: 'heavy', volumeMin: 4, volumeMax: 8, isHeavy: true, description: '~100-200 sq ft' },
  { id: 'concrete-6in', label: 'Concrete slab (6" thick)', category: 'heavy', volumeMin: 5, volumeMax: 10, isHeavy: true, description: '~80-150 sq ft' },
  { id: 'clean-dirt', label: 'Clean soil/dirt', category: 'heavy', volumeMin: 4, volumeMax: 10, isHeavy: true },
  { id: 'brick-tile', label: 'Brick / Tile / Rock', category: 'heavy', volumeMin: 4, volumeMax: 10, isHeavy: true },
  { id: 'asphalt', label: 'Asphalt removal', category: 'heavy', volumeMin: 4, volumeMax: 10, isHeavy: true },
];

export type FitStatus = 'fits' | 'tight' | 'overflow';

export interface FitResult {
  status: FitStatus;
  label: string;
  message: string;
  recommendedSize?: DumpsterSize;
}

/**
 * Calculate fit status based on volume vs capacity
 * ≤80% = likely fits, 80-100% = tight, >100% = overflow
 */
export function calculateFitStatus(
  estimatedVolume: number,
  selectedSize: DumpsterSize,
  isHeavy: boolean
): FitResult {
  const spec = DUMPSTER_SPECS[selectedSize];
  const capacity = spec.volumeCuYd;
  const ratio = estimatedVolume / capacity;
  
  // Heavy materials can only use 6/8/10
  const availableSizes = isHeavy ? HEAVY_SIZES : GENERAL_SIZES;
  
  if (ratio <= 0.8) {
    return {
      status: 'fits',
      label: 'Likely fits',
      message: `Your ${estimatedVolume.toFixed(1)} cu yd should fit comfortably in a ${selectedSize}-yard dumpster.`,
    };
  }
  
  if (ratio <= 1.0) {
    return {
      status: 'tight',
      label: 'Might be tight',
      message: `You're near capacity (${Math.round(ratio * 100)}%). Load carefully or consider the next size up.`,
      recommendedSize: availableSizes.find(s => s > selectedSize),
    };
  }
  
  // Overflow - find next size
  const nextSize = availableSizes.find(s => s > selectedSize && estimatedVolume <= DUMPSTER_SPECS[s].volumeCuYd);
  
  return {
    status: 'overflow',
    label: 'Risk of overflow',
    message: nextSize 
      ? `At ${estimatedVolume.toFixed(1)} cu yd, a ${selectedSize}-yard may not fit everything. Consider a ${nextSize}-yard.`
      : isHeavy 
        ? 'This exceeds heavy material limits. Contact us for multi-container options.'
        : `Consider a larger size or multiple containers.`,
    recommendedSize: nextSize,
  };
}

// Scale comparison reference objects (heights in feet)
export const SCALE_REFERENCES = {
  person: { height: 6, label: '6 ft person' },
  pickupTruck: { length: 6, height: 5.5, label: '6-ft bed pickup' },
  garageDoor: { height: 7, width: 8, label: '7 ft garage door' },
} as const;
