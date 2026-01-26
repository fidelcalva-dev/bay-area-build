// Canonical Icon Mapping
// Single source of truth for icon usage across the site
// All icons use Lucide (outline style, 2px stroke)

import {
  // Primary Actions
  Calculator,
  ClipboardCheck,
  MessageCircle,
  Phone,
  ArrowRight,
  ShoppingCart,
  
  // Dumpster / Logistics
  Package,
  Box,
  HardHat,
  Trash2,
  Scale,
  Weight,
  MapPin,
  Route,
  Warehouse,
  Navigation,
  Pin,
  Truck,
  
  // Services
  FileText,
  Stamp,
  Recycle,
  
  // Trust / Support
  Star,
  Shield,
  ShieldCheck,
  Award,
  LifeBuoy,
  Users,
  CheckCircle,
  
  // General UI
  Zap,
  Clock,
  DollarSign,
  Calendar,
  Info,
  AlertTriangle,
  ChevronRight,
  ChevronDown,
  X,
  Menu,
  Sparkles,
  Percent,
  ExternalLink,
  
  // Heavy Materials (for icon consistency)
  Hammer,
  Mountain,
  Leaf,
  CircleDot,
  Layers,
  Square,
} from 'lucide-react';

// ========================================
// CANONICAL ICON MAPPINGS
// ========================================

// Primary Actions
export const ICONS = {
  // Primary Actions
  quote: Calculator,
  quoteAlt: ClipboardCheck,
  textUs: MessageCircle,
  callNow: Phone,
  continue: ArrowRight,
  order: ShoppingCart,
  
  // Dumpster / Logistics
  dumpster: Package,
  container: Box,
  heavyMaterials: HardHat,
  generalDebris: Trash2,
  weight: Scale,
  weightAlt: Weight,
  location: MapPin,
  distance: Route,
  yard: Warehouse,
  navigation: Navigation,
  pin: Pin,
  delivery: Truck,
  
  // Services
  dumpTruck: Truck,
  materialDelivery: Package,
  permit: FileText,
  permitAlt: Stamp,
  recycling: Recycle,
  
  // Trust / Support
  reviews: Star,
  compliance: ShieldCheck,
  insurance: Shield,
  accredited: Award,
  support: LifeBuoy,
  community: Users,
  verified: CheckCircle,
  
  // Features / Benefits
  instant: Zap,
  time: Clock,
  pricing: DollarSign,
  schedule: Calendar,
  info: Info,
  warning: AlertTriangle,
  noFees: Sparkles,
  discount: Percent,
  
  // Navigation / UI
  chevronRight: ChevronRight,
  chevronDown: ChevronDown,
  close: X,
  menu: Menu,
  external: ExternalLink,
  
  // Heavy Material Icons (canonical mappings)
  concrete: Hammer,
  asphalt: Layers,
  soil: Mountain,
  rock: Mountain,
  gravel: CircleDot,
  granite: Square,
  brick: Layers,
  grass: Leaf,
  wood: Package,
  mixed: Box,
} as const;

// Type for icon keys
export type IconName = keyof typeof ICONS;

// Helper to get icon by name
export function getIcon(name: IconName) {
  return ICONS[name];
}
