// Quote System Types

export interface PricingZone {
  id: string;
  name: string;
  slug: string;
  baseMultiplier: number;
  zipCodes: string[];
  distanceMiles?: number;
  estimatedMinutes?: number;
}

export interface DumpsterSize {
  id: string;
  value: number;
  label: string;
  basePrice: number;
  includedTons: number;
  description: string;
  dimensions: string;
  popular?: boolean;
  isHeavyOnly?: boolean;
}

export interface MaterialType {
  value: 'general' | 'heavy';
  label: string;
  icon: string;
  description: string;
  priceAdjustment: number;
  allowedSizes: number[];
}

export interface Extra {
  id: string;
  value: string;
  label: string;
  description: string;
  price: number;
  icon: string;
  allowQuantity: boolean;
  maxQuantity?: number;
}

export interface ExtraSelection {
  id: string;
  quantity: number;
}

export interface RentalPeriod {
  value: number;
  label: string;
  extraDays: number;
  extraCost: number;
  popular?: boolean;
}

export interface UserType {
  value: string;
  label: string;
  discount: number;
  icon: string;
  benefits: string[];
}

export interface QuoteLineItem {
  label: string;
  amount: number;
  type: 'base' | 'addition' | 'discount' | 'subtotal' | 'info';
  subLabel?: string;
}

export interface QuoteResult {
  lineItems: QuoteLineItem[];
  subtotal: number;
  estimatedMin: number;
  estimatedMax: number;
  includedTons: number;
  overageCostPerTon: number;
  extraDayCost: number;
  zone: PricingZone | null;
  isValid: boolean;
  errors: string[];
}

export interface QuoteFormData {
  userType: string;
  zip: string;
  material: 'general' | 'heavy';
  size: number;
  rentalDays: number;
  extras: ExtraSelection[];
  name: string;
  phone: string;
  email: string;
  address?: string;
  preferredDate?: string;
}

export interface DebrisItem {
  id: string;
  name: string;
  icon: string;
  category: string;
  weightPerUnit: number; // lbs
  volumePerUnit: number; // cubic yards
  unit: string;
}

export interface DebrisEstimation {
  items: { itemId: string; quantity: number }[];
  totalWeight: number; // lbs
  totalVolume: number; // cubic yards
  recommendedSize: number;
  tonsEstimate: number;
}
