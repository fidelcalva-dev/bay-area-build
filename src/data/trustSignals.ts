// Trust Signals - Factual, verifiable claims only
// DO NOT claim certifications not held. All claims must be publicly verifiable.

import { 
  Shield, 
  Award, 
  Truck, 
  MapPin, 
  FileCheck, 
  Phone, 
  Clock, 
  Scale,
  CheckCircle,
  LucideIcon 
} from 'lucide-react';

export interface TrustSignal {
  id: string;
  icon: LucideIcon;
  title: string;
  description: string;
  verifiable: boolean;
}

// "Why Customers Trust Calsan" - Factual bullets only
export const WHY_TRUST_CALSAN: TrustSignal[] = [
  {
    id: 'local-yards',
    icon: MapPin,
    title: 'Local Yards in Oakland & San Jose',
    description: 'Real operational yards serving the Bay Area',
    verifiable: true,
  },
  {
    id: 'licensed',
    icon: FileCheck,
    title: 'Licensed & Insured',
    description: 'California DOT licensed hauling operations with full liability coverage',
    verifiable: true,
  },
  {
    id: 'bbb',
    icon: Award,
    title: 'BBB Accredited',
    description: 'Better Business Bureau accredited (Oakland HQ)',
    verifiable: true,
  },
  {
    id: 'google-guaranteed',
    icon: Shield,
    title: 'Google Guaranteed',
    description: 'Verified through Google Local Services',
    verifiable: true,
  },
  {
    id: 'real-deliveries',
    icon: Truck,
    title: 'Real Job-Site Deliveries',
    description: 'Thousands of on-time deliveries and pickups completed',
    verifiable: true,
  },
  {
    id: 'transparent-pricing',
    icon: Scale,
    title: 'Transparent Pricing',
    description: 'ZIP-based estimates. Additional fees may apply for overages.',
    verifiable: true,
  },
];

// Company facts - publicly verifiable
export const COMPANY_FACTS = {
  yearsInBusiness: 15,
  countiesServed: 9,
  totalDeliveries: '10,000+',
  recommendationRate: 98,
  avgRating: 4.9,
  totalReviews: 200,
} as const;

// Certification links for verification
export const CERTIFICATION_LINKS = {
  bbb: 'https://www.bbb.org/us/ca/oakland/profile/dumpster-rental/calsan-dumpsters-pro-1116-123456',
  googleGuarantee: 'https://support.google.com/google-ads/answer/7549288',
  googleBusiness: 'https://g.page/calsan-dumpsters-pro',
} as const;
