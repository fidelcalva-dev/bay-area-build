// =====================================================
// Company Seed Configuration (Static Fallback)
// =====================================================

import type { CompanyConfig, CompanyService } from './types';

/**
 * Calsan Services — the initial seeded company.
 * Values marked [ADD_*] are placeholders for production config.
 */
export const CALSAN_SERVICES: CompanyConfig = {
  id: '', // populated from DB
  company_name: 'Calsan Services',
  legal_entity_name: 'Calsan Services',
  brand_name: 'Calsan C&D Waste Removal',
  legacy_brand_name: 'Calsan Dumpsters Pro',
  license_number: '1152237',
  license_classification: 'C-61 / D63 - Construction Clean-Up',
  status: 'active',
  domain: null, // [ADD_DOMAIN]
  logo_url: null, // [ADD_LOGO]
  primary_color: null, // [ADD_COLORS]
  secondary_color: null, // [ADD_COLORS]
  phone: null, // [ADD_MAIN_PHONE]
  email: null, // [ADD_EMAIL_DOMAIN]
  address: null, // [ADD_ADDRESS]
  operating_locations: ['Alameda', 'Oakland', 'Bay Area'],
  analytics_ids: {}, // [ADD_ANALYTICS_IDS]
  payment_account_id: null, // [ADD_PAYMENT_ACCOUNT]
  ghl_subaccount_id: null, // [ADD_GHL_SUBACCOUNT]
  seo_config: {
    default_title_suffix: '| Calsan C&D Waste Removal',
    canonical_domain: undefined, // [ADD_DOMAIN]
  },
  header_config: {
    cta_text: 'Get a Free Estimate',
    cta_url: '/quote',
  },
  footer_config: {
    tagline: 'Licensed C&D Waste Removal for the Bay Area',
  },
  settings: {
    brand_rules: {
      cleanup_brand: 'Calsan C&D Waste Removal',
      dumpster_brand: 'Calsan Dumpsters Pro',
      separation: 'strict',
    },
  },
};

/**
 * Company-service assignments for Calsan Services.
 */
export const CALSAN_SERVICES_LIST: Omit<CompanyService, 'company_id'>[] = [
  {
    service_code: 'CONSTRUCTION_CLEANUP',
    public_visible: true,
    quote_enabled: true,
    brand_scope: 'Calsan C&D Waste Removal',
    launch_price: 'From $495',
    custom_pricing: {},
    active: true,
  },
  {
    service_code: 'POST_CONSTRUCTION_CLEANUP',
    public_visible: true,
    quote_enabled: true,
    brand_scope: 'Calsan C&D Waste Removal',
    launch_price: '$0.35–$0.65/sqft, $695 minimum',
    custom_pricing: {},
    active: true,
  },
  {
    service_code: 'DEMOLITION_SUPPORT',
    public_visible: true,
    quote_enabled: true,
    brand_scope: 'Calsan C&D Waste Removal',
    launch_price: 'From $695 + disposal',
    custom_pricing: {},
    active: true,
  },
  {
    service_code: 'SITE_CLEANUP',
    public_visible: true,
    quote_enabled: true,
    brand_scope: 'Calsan C&D Waste Removal',
    launch_price: '$325 quick visit / $595 extended visit',
    custom_pricing: {},
    active: true,
  },
  {
    service_code: 'RECURRING_SITE_SERVICE',
    public_visible: true,
    quote_enabled: true,
    brand_scope: 'Calsan C&D Waste Removal',
    launch_price: 'From $1,200/month',
    custom_pricing: {},
    active: true,
  },
  {
    service_code: 'MATERIAL_PICKUP',
    public_visible: true,
    quote_enabled: true,
    brand_scope: 'Calsan C&D Waste Removal',
    launch_price: '$195 trip fee + labor/disposal',
    custom_pricing: {},
    active: true,
  },
  {
    service_code: 'LABOR_ASSISTED_CLEANUP',
    public_visible: true,
    quote_enabled: true,
    brand_scope: 'Calsan C&D Waste Removal',
    launch_price: '$95/hr per tech (2-tech / 2-hr minimum)',
    custom_pricing: {},
    active: true,
  },
  {
    service_code: 'DUMPSTER_RENTAL_LEGACY',
    public_visible: false, // Not visible on cleanup brand
    quote_enabled: false,
    brand_scope: 'Calsan Dumpsters Pro',
    launch_price: null,
    custom_pricing: {},
    active: true,
  },
];
