// V3 Quote Flow — Shared types for step components

import type { V3Step, CustomerType, ProjectCard, ServiceTimeEstimate } from '../types';
import type { AccessConstraintData } from '../AccessConstraintStep';
import type { AddressResult } from '../AddressAutocomplete';
import type { ConfidenceLevel } from '../hooks/useAvailabilityConfidence';

// Common step props
export interface StepBaseProps {
  goNext: () => void;
  goBack: () => void;
}

// ZIP Step
export interface ZipStepProps extends StepBaseProps {
  zip: string;
  setZip: (z: string) => void;
  useAddress: boolean;
  setUseAddress: (v: boolean) => void;
  addressResult: AddressResult | null;
  setAddressResult: (r: AddressResult | null) => void;
  urlAddress: string;
  isCheckingZip: boolean;
  zoneResult: ZoneResult | null;
  distanceCalc: DistanceCalcResult;
  etaDisplay: string | null;
  availability: AvailabilityResult;
  autoDetectCityName?: string;
}

// Customer Type Step
export interface CustomerTypeStepProps extends StepBaseProps {
  customerType: CustomerType | null;
  onSelect: (type: CustomerType) => void;
}

// Project Step
export interface ProjectStepProps extends StepBaseProps {
  customerType: CustomerType;
  selectedProject: ProjectCard | null;
  onSelect: (project: ProjectCard) => void;
}

// Size Step
export interface SizeStepProps extends StepBaseProps {
  size: number;
  recommendedSize: number;
  availableSizes: number[];
  alternativeSizes: { smaller?: number; larger?: number };
  isHeavy: boolean;
  selectedProject: ProjectCard | null;
  customerType: CustomerType | null;
  etaDisplay: string | null;
  availability: AvailabilityResult;
  showUpsellNudge: boolean;
  onSizeSelect: (s: number) => void;
  onAcceptUpsell: () => void;
  onDeclineUpsell: () => void;
}

// Contact Step
export interface ContactStepProps extends StepBaseProps {
  customerName: string;
  setCustomerName: (v: string) => void;
  customerPhone: string;
  setCustomerPhone: (v: string) => void;
  customerEmail: string;
  setCustomerEmail: (v: string) => void;
  customerNotes: string;
  setCustomerNotes: (v: string) => void;
  companyName: string;
  setCompanyName: (v: string) => void;
  consentSms: boolean;
  setConsentSms: (v: boolean) => void;
  consentTerms: boolean;
  setConsentTerms: (v: boolean) => void;
  customerType: CustomerType | null;
}

// Price Step
export interface PriceStepProps extends StepBaseProps {
  quote: QuoteData;
  size: number;
  getSizeLabel: () => string;
  customerType: CustomerType | null;
  isHeavy: boolean;
  wantsSwap: boolean;
  setWantsSwap: (v: boolean) => void;
  serviceTime: ServiceTimeEstimate | null;
  availability: AvailabilityResult;
  etaDisplay: string | null;
  showInternalBreakdown: boolean;
  capturePartialLead: (milestone: string) => Promise<void>;
  rentalDays: number;
  setRentalDays: (v: number) => void;
}

// Access Step
export interface AccessStepProps extends StepBaseProps {
  zip: string;
  addressResult: AddressResult | null;
  zoneResult: ZoneResult | null;
  onComplete: (data: AccessConstraintData) => void;
  onSkip: () => void;
}

// Confirm Step
export interface ConfirmStepProps extends StepBaseProps {
  quote: QuoteData;
  size: number;
  getSizeLabel: () => string;
  selectedProject: ProjectCard | null;
  isHeavy: boolean;
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  customerNotes: string;
  companyName: string;
  zip: string;
  addressResult: AddressResult | null;
  distanceCalc: DistanceCalcResult;
  accessData: AccessConstraintData | null;
  termsAccepted: boolean;
  setTermsAccepted: (v: boolean) => void;
  isSubmitting: boolean;
  onConfirm: () => void;
  rentalDays: number;
  wantsSwap: boolean;
}

// Shared derived types
export interface ZoneResult {
  zoneId: string | null;
  zoneName: string;
  cityName?: string;
  multiplier: number;
  marketCode?: string;
}

export interface QuoteData {
  subtotal: number;
  subtotalHigh: number;
  includedTons: number;
  isValid: boolean;
  isFlatFee: boolean;
}

export interface AvailabilityResult {
  confidence: ConfidenceLevel;
  sameDayLikely: boolean;
  loading: boolean;
}

export interface DistanceCalcResult {
  distance: {
    yard: { id: string; name: string };
    distanceMiles: number;
    distanceMinutes: number;
    priceAdjustment?: number;
    bracket?: { bracketName: string };
    durationTrafficMin?: number;
    durationTrafficMax?: number;
  } | null;
  geocoding: { lat: number; lng: number } | null;
}
