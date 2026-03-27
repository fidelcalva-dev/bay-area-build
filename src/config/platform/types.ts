// =====================================================
// Multi-Tenant Platform Type Definitions
// =====================================================

export interface CompanyConfig {
  id: string;
  company_name: string;
  legal_entity_name: string | null;
  brand_name: string | null;
  legacy_brand_name: string | null;
  license_number: string | null;
  license_classification: string | null;
  status: 'active' | 'paused' | 'suspended';
  domain: string | null;
  logo_url: string | null;
  primary_color: string | null;
  secondary_color: string | null;
  phone: string | null;
  email: string | null;
  address: string | null;
  operating_locations: string[];
  analytics_ids: Record<string, string>;
  payment_account_id: string | null;
  ghl_subaccount_id: string | null;
  seo_config: SeoConfig;
  header_config: HeaderConfig;
  footer_config: FooterConfig;
  settings: Record<string, unknown>;
}

export interface SeoConfig {
  default_title_suffix?: string;
  og_image?: string;
  canonical_domain?: string;
  gtm_id?: string;
  ga4_id?: string;
}

export interface HeaderConfig {
  logo_url?: string;
  nav_items?: NavItem[];
  cta_text?: string;
  cta_url?: string;
  phone?: string;
}

export interface FooterConfig {
  logo_url?: string;
  tagline?: string;
  columns?: FooterColumn[];
  social_links?: SocialLink[];
}

export interface NavItem {
  label: string;
  href: string;
  children?: NavItem[];
}

export interface FooterColumn {
  title: string;
  links: { label: string; href: string }[];
}

export interface SocialLink {
  platform: string;
  url: string;
}

// =====================================================
// Service Vertical Types
// =====================================================

export type PricingModel =
  | 'LABOR_PLUS_DISPOSAL'
  | 'SIZE_BASED'
  | 'FLAT_PACKAGE'
  | 'RECURRING_SERVICE'
  | 'LINE_ITEM_BASED'
  | 'MANUAL_REVIEW'
  | 'SMART_ENGINE';

export type LineItemType =
  | 'LABOR'
  | 'DISPOSAL'
  | 'DUMPSTER'
  | 'TRUCK'
  | 'MATERIAL_HANDLING'
  | 'CLEANUP'
  | 'SWAP'
  | 'SURCHARGE'
  | 'OTHER';

export interface ServiceVertical {
  service_code: string;
  service_name: string;
  service_category: string;
  pricing_model: PricingModel;
  contract_template_code: string | null;
  requires_dispatch: boolean;
  requires_driver: boolean;
  requires_labor: boolean;
  requires_material_review: boolean;
  requires_photo: boolean;
  requires_scope_notes: boolean;
  quote_fields: QuoteFieldConfig[];
  line_item_types: LineItemType[];
  default_surcharges: SurchargeConfig;
  active: boolean;
}

export interface QuoteFieldConfig {
  field_key: string;
  label: string;
  type: 'text' | 'number' | 'select' | 'boolean' | 'textarea' | 'photo';
  required: boolean;
  options?: string[];
  placeholder?: string;
  default_value?: string | number | boolean;
}

export interface SurchargeConfig {
  rush_pct?: number;
  after_hours_pct?: number;
  stairs_no_elevator_pct?: number;
  long_carry_pct?: number;
  mixed_heavy_debris_pct?: number;
  re_trip_fee?: number;
  change_order_minimum?: number;
}

// =====================================================
// Company-Service Junction
// =====================================================

export interface CompanyService {
  company_id: string;
  service_code: string;
  public_visible: boolean;
  quote_enabled: boolean;
  brand_scope: string | null;
  launch_price: string | null;
  custom_pricing: Record<string, unknown>;
  active: boolean;
}

// =====================================================
// Provider / Marketplace Types
// =====================================================

export interface ProviderProfile {
  id: string;
  company_id: string;
  service_codes: string[];
  counties: string[];
  zip_codes: string[];
  response_hours: number;
  lead_cap: number | null;
  plan_tier: 'starter' | 'growth' | 'pro';
  payment_method: string | null;
  rating: number | null;
  insurance_url: string | null;
  status: 'active' | 'paused' | 'suspended';
}

export type RoutingMode = 'exclusive' | 'shared' | 'round_robin' | 'priority';

export interface LeadRoutingRule {
  service_code: string;
  geo_type: 'county' | 'zip' | 'radius';
  geo_value: string;
  provider_id: string;
  routing_mode: RoutingMode;
  priority: number;
  is_exclusive: boolean;
  active: boolean;
}

export interface SubscriptionPlan {
  plan_code: string;
  plan_name: string;
  monthly_price_cents: number;
  features: Record<string, boolean | number | string>;
  lead_cap: number | null;
  priority_weight: number;
}

// =====================================================
// Document Template Types
// =====================================================

export interface DocumentTemplateMT {
  template_code: string;
  company_id: string | null;
  service_code: string | null;
  template_name: string;
  template_body: string | null;
  merge_tags: string[];
  version: number;
  active: boolean;
}

// =====================================================
// Pricing Family Types
// =====================================================

export interface PricingFamily {
  company_id: string;
  service_code: string | null;
  family_code: string;
  family_name: string;
  rates: Record<string, number | Record<string, number>>;
  active: boolean;
}
