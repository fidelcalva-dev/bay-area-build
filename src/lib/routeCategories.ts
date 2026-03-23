/**
 * Route Category Map — Single source of truth for all platform routes.
 * 
 * GUIDELINES FOR NEW PAGES:
 * 1. Before creating any new page, add its entry here first.
 * 2. Assign the correct group, subcategory, and indexation policy.
 * 3. Public pages must NEVER share routes with CRM pages.
 * 4. All CRM/Portal pages must be noindex.
 * 5. Use canonical paths — avoid aliases unless for backward compatibility.
 */

import {
  Home, BarChart3, Users, Package, Truck, Calendar, DollarSign,
  Globe, Shield, Settings, Bell, Phone, Brain, MessageSquare,
  FileText, Link2, TrendingUp, Warehouse, MapPin, Plus,
  Boxes, Receipt, Percent, Banknote, MapPinned, UserCog,
  Send, Layout, PieChart, Star, Activity, Zap,
  type LucideIcon,
} from 'lucide-react';

export type RouteGroup = 'PUBLIC_WEBSITE' | 'CRM_INTERNAL' | 'CUSTOMER_PORTAL';

export type PublicSubcategory = 'Core' | 'SEO' | 'Blog' | 'Marketing' | 'Quote/Contact' | 'Legal' | 'Redirect';
export type CRMSubcategory =
  | 'Control Center'
  | 'Sales'
  | 'Customer Service'
  | 'Dispatch'
  | 'Driver'
  | 'Maintenance'
  | 'Finance'
  | 'Operations'
  | 'Configuration'
  | 'Integrations'
  | 'Telephony'
  | 'Google Ads'
  | 'SEO Admin'
  | 'Marketing Analytics'
  | 'AI'
  | 'Analytics'
  | 'QA/Diagnostics'
  | 'System'
  | 'Auth';
export type PortalSubcategory = 'Auth' | 'Orders' | 'Documents' | 'Payments' | 'Scheduling' | 'Tracking' | 'Green Halo';

export type Subcategory = PublicSubcategory | CRMSubcategory | PortalSubcategory;

/** Sidebar section ID — maps subcategories to sidebar groups */
export type SidebarSectionId =
  | 'control-center'
  | 'analytics'
  | 'sales'
  | 'customers'
  | 'operations'
  | 'driver'
  | 'fleet'
  | 'finance'
  | 'seo-marketing'
  | 'integrations'
  | 'configuration'
  | 'ai'
  | 'admin-qa';

/** Roles that can see a sidebar item */
export type VisibleRole = 'admin' | 'sales' | 'cs' | 'dispatcher' | 'finance' | 'driver' | 'ops_admin' | 'executive' | 'fleet_maintenance' | 'marketing_seo' | 'read_only';

export interface RouteEntry {
  path: string;
  name: string;
  group: RouteGroup;
  subcategory: Subcategory;
  isProtected: boolean;
  indexable: boolean;
  canonicalAlias?: string;
  mounted: boolean;
  isDynamic?: boolean;

  // ─── Sidebar metadata ──────────────────────
  /** Icon for sidebar display */
  sidebarIcon?: LucideIcon;
  /** Sidebar section this route belongs to */
  sidebarSection?: SidebarSectionId;
  /** Short label for sidebar (defaults to name) */
  sidebarLabel?: string;
  /** Whether this shows in sidebar at all */
  showInSidebar?: boolean;
  /** Exact match for active state */
  sidebarEnd?: boolean;
  /** Roles that can see this item (empty = all staff) */
  visibleTo?: VisibleRole[];
  /** Display order within its section */
  sidebarOrder?: number;
}

// ─── PUBLIC WEBSITE ──────────────────────────────────────────────
const publicCore: RouteEntry[] = [
  { path: '/', name: 'Homepage', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/pricing', name: 'Pricing', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/sizes', name: 'Dumpster Sizes', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/areas', name: 'Service Areas', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/materials', name: 'Materials Guide', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/about', name: 'About Us', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/contact', name: 'Contact', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/locations', name: 'Locations Redirect', group: 'PUBLIC_WEBSITE', subcategory: 'Redirect', isProtected: false, indexable: false, mounted: true, canonicalAlias: '/areas' },
  { path: '/how-it-works', name: 'How It Works', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/why-calsan', name: 'Why Calsan', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/why-local-yards', name: 'Why Local Yards', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/not-a-broker', name: 'Not A Broker', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/technology', name: 'Technology', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/capacity-guide', name: 'Capacity Guide', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/visualizer', name: 'Dumpster Visualizer', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/contractors', name: 'Contractors', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/contractor-best-practices', name: 'Contractor Best Practices', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/contractor-resources', name: 'Contractor Resources', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/careers', name: 'Careers', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/waste-vision', name: 'WasteVision AI', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/green-impact', name: 'Green Impact Map', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
  { path: '/green-halo', name: 'Green Halo', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
];

const publicQuoteContact: RouteEntry[] = [
  { path: '/quote', name: 'Get Quote', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: true, mounted: true },
  { path: '/quote/contractor', name: 'Contractor Quote', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: true, mounted: true },
  { path: '/quote/schedule', name: 'Schedule Delivery', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: false, mounted: true },
  { path: '/quote/pay', name: 'Quote Payment', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: false, mounted: true },
  { path: '/quick-order', name: 'Quick Order', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: false, mounted: true },
  { path: '/thank-you', name: 'Thank You', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: false, mounted: true },
  { path: '/download-price-list', name: 'Download Price List', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: false, mounted: true },
];

const publicSEO: RouteEntry[] = [
  { path: '/dumpster-rental/:citySlug', name: 'City Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/dumpster-rental/:citySlug/:sizeSlug-yard', name: 'City + Size', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/dumpster-rental/:citySlug/:materialSlug', name: 'City + Material', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/service-area/:zip/dumpster-rental', name: 'ZIP Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/county/:countySlug/dumpster-rental', name: 'County Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/use-cases/:useCaseSlug', name: 'Use Case Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/yards/:yardSlug', name: 'Yard Hub', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/concrete-disposal/:citySlug', name: 'Concrete Disposal City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/yard-waste-removal/:citySlug', name: 'Yard Waste Removal City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/debris-removal/:citySlug', name: 'Debris Removal City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/construction-debris/:citySlug', name: 'Construction Debris City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/yard-waste-disposal/:citySlug', name: 'Yard Waste Disposal City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/california-dumpster-rental', name: 'California Hub', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/bay-area-dumpster-rental', name: 'Bay Area Hub', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/southern-california-dumpster-rental', name: 'SoCal Hub (redirect)', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: false, mounted: true },
  { path: '/central-valley-dumpster-rental', name: 'Central Valley Hub (redirect)', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: false, mounted: true },
  { path: '/dumpster-rental-oakland-ca', name: 'Oakland SEO', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dumpster-rental-san-jose-ca', name: 'San Jose SEO', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dumpster-rental-san-francisco-ca', name: 'San Francisco SEO', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dumpster-rental-east-bay', name: 'East Bay Regional', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dumpster-rental-south-bay', name: 'South Bay Regional', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/commercial-dumpster-rental', name: 'Commercial Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/construction-dumpsters', name: 'Construction Dumpsters', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/warehouse-cleanout-dumpsters', name: 'Warehouse Cleanout', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/10-yard-dumpster-rental', name: '10 Yard Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/20-yard-dumpster-rental', name: '20 Yard Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/30-yard-dumpster-rental', name: '30 Yard Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/40-yard-dumpster-rental', name: '40 Yard Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/concrete-dumpster-rental', name: 'Concrete Rental', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dirt-dumpster-rental', name: 'Dirt Rental', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/roofing-dumpster-rental', name: 'Roofing Rental', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/construction-debris-dumpster-rental', name: 'Construction Debris Rental', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/residential-dumpster-rental', name: 'Residential Rental', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
];

const publicBlog: RouteEntry[] = [
  { path: '/blog', name: 'Blog Index', group: 'PUBLIC_WEBSITE', subcategory: 'Blog', isProtected: false, indexable: true, mounted: true },
  { path: '/blog/:articleSlug', name: 'Blog Article', group: 'PUBLIC_WEBSITE', subcategory: 'Blog', isProtected: false, indexable: true, mounted: true, isDynamic: true },
];

const publicLegal: RouteEntry[] = [
  { path: '/terms', name: 'Terms of Service', group: 'PUBLIC_WEBSITE', subcategory: 'Legal', isProtected: false, indexable: true, mounted: true },
  { path: '/privacy', name: 'Privacy Policy', group: 'PUBLIC_WEBSITE', subcategory: 'Legal', isProtected: false, indexable: true, mounted: true },
  { path: '/sitemap.xml', name: 'Sitemap', group: 'PUBLIC_WEBSITE', subcategory: 'Legal', isProtected: false, indexable: false, mounted: true },
];

const publicRedirects: RouteEntry[] = [
  { path: '/ai-dumpster-assistant', name: 'AI Assistant Redirect', group: 'PUBLIC_WEBSITE', subcategory: 'Redirect', isProtected: false, indexable: false, mounted: true, canonicalAlias: '/' },
  { path: '/:citySlug/:sizeSlug-yard-dumpster', name: 'Legacy Size Redirect', group: 'PUBLIC_WEBSITE', subcategory: 'Redirect', isProtected: false, indexable: false, mounted: true, isDynamic: true },
  { path: '/:citySlug/:subSlug', name: 'Legacy Subpage Redirect', group: 'PUBLIC_WEBSITE', subcategory: 'Redirect', isProtected: false, indexable: false, mounted: true, isDynamic: true },
];

const publicMarketing: RouteEntry[] = [
  { path: '/preview/quote', name: 'Preview Quote (v2)', group: 'PUBLIC_WEBSITE', subcategory: 'Marketing', isProtected: false, indexable: false, mounted: true },
  { path: '/preview/home', name: 'Preview Home (v2)', group: 'PUBLIC_WEBSITE', subcategory: 'Marketing', isProtected: false, indexable: false, mounted: true },
];

// ─── CRM INTERNAL ────────────────────────────────────────────────
const crmAuth: RouteEntry[] = [
  { path: '/admin/login', name: 'Admin Login', group: 'CRM_INTERNAL', subcategory: 'Auth', isProtected: false, indexable: false, mounted: true },
  { path: '/staff', name: 'Staff Login Redirect', group: 'CRM_INTERNAL', subcategory: 'Auth', isProtected: false, indexable: false, mounted: true, canonicalAlias: '/app' },
  { path: '/app', name: 'Role Router', group: 'CRM_INTERNAL', subcategory: 'Auth', isProtected: true, indexable: false, mounted: true },
  { path: '/request-access', name: 'Request Access', group: 'CRM_INTERNAL', subcategory: 'Auth', isProtected: true, indexable: false, mounted: true },
  { path: '/set-password', name: 'Set Password', group: 'CRM_INTERNAL', subcategory: 'Auth', isProtected: false, indexable: false, mounted: true },
];

const crmControlCenter: RouteEntry[] = [
  { path: '/admin', name: 'Calsan Control Center', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'control-center', sidebarIcon: Home, sidebarLabel: 'Command Center', sidebarEnd: true, sidebarOrder: 0 },
  { path: '/admin/executive', name: 'Executive Dashboard', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'control-center', sidebarIcon: BarChart3, sidebarLabel: 'Executive View', sidebarOrder: 1 },
  { path: '/admin/modules', name: 'Module Registry', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'control-center', sidebarIcon: Settings, sidebarOrder: 2 },
  { path: '/admin/activity', name: 'Activity Feed', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'control-center', sidebarIcon: Activity, sidebarOrder: 3 },
  // legacy-dashboard retired — redirects to /admin
];

const crmAnalytics: RouteEntry[] = [
  { path: '/admin/dashboards/overview', name: 'Analytics Overview', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'analytics', sidebarIcon: BarChart3, sidebarLabel: 'Overview', sidebarOrder: 0 },
  { path: '/admin/dashboards/leads', name: 'Lead Performance', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'analytics', sidebarIcon: Users, sidebarOrder: 1 },
  { path: '/admin/dashboards/kpis', name: 'KPI Optimization', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'analytics', sidebarIcon: TrendingUp, sidebarOrder: 2 },
  { path: '/admin/dashboards/sales', name: 'Sales Funnel', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'analytics', sidebarIcon: TrendingUp, sidebarOrder: 3, visibleTo: ['admin', 'sales', 'executive'] },
  { path: '/admin/dashboards/operations', name: 'Operations', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'analytics', sidebarIcon: Truck, sidebarOrder: 4 },
  { path: '/admin/dashboards/finance', name: 'Finance', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'analytics', sidebarIcon: DollarSign, sidebarOrder: 5, visibleTo: ['admin', 'finance', 'executive'] },
  { path: '/admin/dashboards/customers', name: 'Customers', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'analytics', sidebarIcon: PieChart, sidebarOrder: 6 },
];

const crmSales: RouteEntry[] = [
  { path: '/sales', name: 'Sales Dashboard', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/sales/leads', name: 'Sales Leads', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/sales/leads/:id', name: 'Lead Detail', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/sales/quotes', name: 'Sales Quotes', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/sales/quotes/:id', name: 'Quote Detail', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/sales/quotes/new', name: 'New Quote', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/sales/calls', name: 'Sales Calls', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/sales/order-builder', name: 'Order Builder', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/leads', name: 'Admin Lead Hub', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'sales', sidebarIcon: Users, sidebarLabel: 'Lead Hub', sidebarOrder: 0, visibleTo: ['admin', 'sales', 'cs'] },
  { path: '/admin/leads-health', name: 'Lead Health Dashboard', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'sales', sidebarIcon: TrendingUp, sidebarLabel: 'Lead Health', sidebarOrder: 1, visibleTo: ['admin', 'sales'] },
  { path: '/admin/leads/settings', name: 'Lead Engine Settings', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'sales', sidebarIcon: Settings, sidebarLabel: 'Lead Engine', sidebarOrder: 2, visibleTo: ['admin'] },
  { path: '/admin/sales-performance', name: 'Sales Performance', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'sales', sidebarIcon: BarChart3, sidebarOrder: 3, visibleTo: ['admin', 'sales', 'executive'] },
];

const crmCustomerService: RouteEntry[] = [
  { path: '/cs', name: 'CS Dashboard', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/cs/orders', name: 'CS Orders', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/cs/requests', name: 'CS Requests', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/cs/templates', name: 'CS Templates', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/cs/messages', name: 'CS Messages', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/cs/calls', name: 'CS Calls', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/cs/lead-inbox', name: 'CS Lead Inbox', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/activation', name: 'Customer Activation', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'customers', sidebarIcon: Send, sidebarLabel: 'Activation', sidebarOrder: 2, visibleTo: ['admin', 'cs', 'sales'] },
  { path: '/admin/customers', name: 'Customers Manager', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'customers', sidebarIcon: Users, sidebarLabel: 'Customer List', sidebarOrder: 0 },
  { path: '/admin/customers/:id', name: 'Customer Detail', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/admin/customer-health', name: 'Customer Health', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'customers', sidebarIcon: TrendingUp, sidebarOrder: 1, visibleTo: ['admin', 'cs'] },
  { path: '/admin/customer-type-rules', name: 'Customer Type Rules', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'customers', sidebarIcon: Settings, sidebarLabel: 'Customer Rules', sidebarOrder: 3, visibleTo: ['admin'] },
];

const crmDispatch: RouteEntry[] = [
  { path: '/dispatch', name: 'Dispatch Dashboard', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/today', name: 'Today\'s Runs', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/calendar', name: 'Dispatch Calendar', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/flags', name: 'Dispatch Flags', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/requests', name: 'Dispatch Requests', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/control-tower', name: 'Control Tower', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/history', name: 'Route History', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/facilities', name: 'Facilities Finder', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/yard-hold', name: 'Yard Hold Board', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/dispatch/truck-cameras/:truckId', name: 'Truck Cameras', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/admin/dispatch', name: 'Admin Dispatch Calendar', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/drivers', name: 'Drivers Manager', group: 'CRM_INTERNAL', subcategory: 'Dispatch', isProtected: true, indexable: false, mounted: true },
];

const crmDriver: RouteEntry[] = [
  { path: '/driver', name: 'Driver Home', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true },
  { path: '/driver/runs', name: 'Driver Runs', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true },
  { path: '/driver/runs/:id', name: 'Driver Run Detail', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/driver/profile', name: 'Driver Profile', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true },
  { path: '/driver/truck-select', name: 'Truck Select', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true },
  { path: '/driver/inspect', name: 'Pre-Trip Inspection', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true },
  { path: '/driver/report-issue', name: 'Report Issue', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true },
  // legacy driver app retired — redirects to /driver
];

const crmMaintenance: RouteEntry[] = [
  { path: '/admin/maintenance', name: 'Maintenance Dashboard', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'fleet', sidebarIcon: Warehouse, sidebarLabel: 'Maintenance', sidebarOrder: 2, visibleTo: ['admin', 'ops_admin', 'fleet_maintenance'] },
  { path: '/admin/maintenance/trucks', name: 'Maintenance Trucks', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'fleet', sidebarIcon: Truck, sidebarLabel: 'Truck List', sidebarOrder: 3, visibleTo: ['admin', 'ops_admin', 'fleet_maintenance'] },
  { path: '/admin/maintenance/issues', name: 'Maintenance Issues', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'fleet', sidebarIcon: Bell, sidebarLabel: 'Issues', sidebarOrder: 4, visibleTo: ['admin', 'ops_admin', 'fleet_maintenance'] },
  { path: '/admin/maintenance/work-orders', name: 'Work Orders', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'fleet', sidebarIcon: FileText, sidebarLabel: 'Work Orders', sidebarOrder: 5, visibleTo: ['admin', 'ops_admin', 'fleet_maintenance'] },
  { path: '/admin/vehicles/:id', name: 'Vehicle Profile', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: true, isDynamic: true },
];

const crmFinance: RouteEntry[] = [
  { path: '/finance', name: 'Finance Dashboard', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/finance/invoices', name: 'Invoices', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/finance/invoices/:orderId', name: 'Invoice Detail', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/finance/payments', name: 'Payments', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/finance/payments/:paymentId', name: 'Payment Detail', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/finance/payment-actions', name: 'Payment Actions', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/finance/ar-aging', name: 'AR Aging Dashboard', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/finance/ar-aging/invoices', name: 'AR Aging Invoices', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/finance/ar-aging/customers', name: 'AR Aging Customers', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/tickets', name: 'Tickets & Receipts', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'finance', sidebarIcon: Receipt, sidebarOrder: 0, visibleTo: ['admin', 'finance'] },
  { path: '/admin/overdue', name: 'Overdue Billing', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'finance', sidebarIcon: Receipt, sidebarOrder: 1, visibleTo: ['admin', 'finance'] },
  { path: '/admin/approval-queue', name: 'Approval Queue', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'finance', sidebarIcon: FileText, sidebarOrder: 2, visibleTo: ['admin', 'finance'] },
  { path: '/admin/compensation', name: 'Compensation', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'finance', sidebarIcon: DollarSign, sidebarOrder: 3, visibleTo: ['admin', 'finance', 'executive'] },
  { path: '/admin/profitability', name: 'Profitability', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'finance', sidebarIcon: BarChart3, sidebarOrder: 4, visibleTo: ['admin', 'finance', 'executive'] },
  { path: '/admin/heavy-risk', name: 'Heavy Risk', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'finance', sidebarIcon: Shield, sidebarOrder: 5, visibleTo: ['admin', 'finance'] },
];

const crmOperations: RouteEntry[] = [
  { path: '/admin/orders', name: 'Orders Manager', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'operations', sidebarIcon: Package, sidebarLabel: 'Orders', sidebarOrder: 0 },
  { path: '/admin/dispatch', name: 'Admin Dispatch Calendar', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'operations', sidebarIcon: Calendar, sidebarLabel: 'Dispatch Calendar', sidebarOrder: 1, visibleTo: ['admin', 'dispatcher', 'ops_admin'] },
  { path: '/admin/assets', name: 'Asset Control Tower', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'operations', sidebarIcon: Boxes, sidebarOrder: 2 },
  { path: '/admin/movements', name: 'Movement Log', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'operations', sidebarIcon: FileText, sidebarOrder: 3 },
  { path: '/admin/markets', name: 'Markets Manager', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'operations', sidebarIcon: MapPin, sidebarOrder: 4 },
  { path: '/admin/quick-links', name: 'Quick Links', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'operations', sidebarIcon: Link2, sidebarOrder: 5 },
  { path: '/admin/inventory', name: 'Inventory (Legacy)', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/fleet/cameras', name: 'Fleet Cameras', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'fleet', sidebarIcon: Boxes, sidebarOrder: 1 },
  { path: '/admin/markets/new-location', name: 'New Location Wizard', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/facilities', name: 'Facilities Manager', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/disposal-search', name: 'Disposal Search', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/facilities/finder', name: 'Facilities Finder', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
];

const crmConfiguration: RouteEntry[] = [
  { path: '/admin/configuration', name: 'Config Center', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: Settings, sidebarOrder: 0, visibleTo: ['admin'] },
  { path: '/admin/yards', name: 'Yard Manager', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: Warehouse, sidebarOrder: 1, visibleTo: ['admin', 'ops_admin'] },
  { path: '/admin/zones', name: 'ZIP-to-Zone', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: MapPin, sidebarOrder: 2, visibleTo: ['admin'] },
  { path: '/admin/pricing', name: 'Pricing Tables', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: DollarSign, sidebarOrder: 3, visibleTo: ['admin', 'finance'] },
  { path: '/admin/pricing/locations', name: 'Location Pricing', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/vendors', name: 'Vendors', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: Truck, sidebarOrder: 5, visibleTo: ['admin', 'ops_admin'] },
  { path: '/admin/extras', name: 'Extras Catalog', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: Plus, sidebarOrder: 6, visibleTo: ['admin'] },
  { path: '/admin/config', name: 'Business Rules', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: Settings, sidebarOrder: 7, visibleTo: ['admin'] },
  { path: '/admin/city-rates', name: 'City Rates', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: Banknote, sidebarOrder: 4, visibleTo: ['admin', 'finance'] },
  { path: '/admin/toll-surcharges', name: 'Toll Surcharges', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: MapPinned, sidebarOrder: 8, visibleTo: ['admin'] },
  { path: '/admin/volume-commitments', name: 'Volume Discounts', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: Percent, sidebarOrder: 9, visibleTo: ['admin', 'sales'] },
  { path: '/admin/config/health', name: 'Config Health', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/materials/catalog', name: 'Material Catalog', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/materials/categories', name: 'Project Categories', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/materials/offers', name: 'Material Offers', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/email-config', name: 'Email Config', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'configuration', sidebarIcon: MessageSquare, sidebarOrder: 10, visibleTo: ['admin'] },
];

const crmTelephony: RouteEntry[] = [
  { path: '/admin/telephony/calls', name: 'Call Logs', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'integrations', sidebarIcon: Phone, sidebarOrder: 3 },
  { path: '/admin/telephony/numbers', name: 'Phone Numbers', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'integrations', sidebarIcon: Phone, sidebarOrder: 4 },
  { path: '/admin/telephony/analytics', name: 'Call Analytics', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'integrations', sidebarIcon: BarChart3, sidebarOrder: 5 },
  { path: '/admin/telephony/migration', name: 'GHL Migration', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/telephony/test', name: 'Test Call', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/telephony/import', name: 'Import History', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
];

const crmGoogleAds: RouteEntry[] = [
  { path: '/admin/ads', name: 'Ads Overview', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: TrendingUp, sidebarLabel: 'Google Ads', sidebarEnd: true, sidebarOrder: 20 },
  { path: '/admin/ads/campaigns', name: 'Campaigns', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: BarChart3, sidebarLabel: 'Ad Campaigns', sidebarOrder: 21 },
  { path: '/admin/ads/rules', name: 'Automation Rules', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ads/markets', name: 'Ads Markets Config', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ads/logs', name: 'Ads Sync Logs', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true },
];

const crmSeoAdmin: RouteEntry[] = [
  { path: '/admin/seo/dashboard', name: 'SEO Dashboard', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: Globe, sidebarOrder: 0 },
  { path: '/admin/seo/cities', name: 'SEO Cities', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: MapPin, sidebarOrder: 1 },
  { path: '/admin/seo/pages', name: 'SEO Pages', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: FileText, sidebarOrder: 2 },
  { path: '/admin/seo/health', name: 'SEO Health', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: TrendingUp, sidebarOrder: 3 },
  { path: '/admin/seo/metrics', name: 'SEO Metrics', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: BarChart3, sidebarOrder: 4 },
  { path: '/admin/seo/generate', name: 'SEO Generate', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: Plus, sidebarLabel: 'Generate Pages', sidebarOrder: 5 },
  { path: '/admin/seo/sitemap', name: 'SEO Sitemap', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/gbp-plan', name: 'GBP Domination Plan', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/repair', name: 'SEO Repair', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/indexing', name: 'SEO Indexing', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/queue', name: 'SEO Queue', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/rules', name: 'SEO Rules', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/grid', name: 'SEO Grid', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/audit', name: 'SEO Audit', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
];

const crmLocalSearch: RouteEntry[] = [
  { path: '/admin/local/dashboard', name: 'Local Dashboard', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: MapPinned, sidebarLabel: 'Local Search', sidebarOrder: 30 },
  { path: '/admin/local/google-business', name: 'Google Business', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: MapPin, sidebarLabel: 'Google Business', sidebarOrder: 31 },
  { path: '/admin/local/bing-places', name: 'Bing Places', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: Globe, sidebarLabel: 'Bing Places', sidebarOrder: 32 },
  { path: '/admin/local/apple-business', name: 'Apple Business', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: MapPin, sidebarLabel: 'Apple Business', sidebarOrder: 33 },
  { path: '/admin/local/reviews', name: 'Reviews Engine', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: Star, sidebarLabel: 'Reviews', sidebarOrder: 34 },
  { path: '/admin/local/photos', name: 'Photos Engine', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: MapPin, sidebarLabel: 'Local Photos', sidebarOrder: 35 },
  { path: '/admin/local/citations', name: 'Citations Tracker', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: Link2, sidebarLabel: 'Citations', sidebarOrder: 36 },
];

const crmMarketingAnalytics: RouteEntry[] = [
  { path: '/admin/marketing/dashboard', name: 'Marketing Dashboard', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: BarChart3, sidebarLabel: 'Marketing', sidebarOrder: 10 },
  { path: '/admin/marketing/visitors', name: 'Visitors Dashboard', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'seo-marketing', sidebarIcon: Users, sidebarLabel: 'Visitors', sidebarOrder: 11 },
  { path: '/admin/marketing/sessions', name: 'Sessions Dashboard', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/marketing/google-setup', name: 'Google Setup Wizard', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/marketing/ga4-debug', name: 'GA4 Debug Panel', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true },
];

const crmAI: RouteEntry[] = [
  { path: '/admin/ai/control-center', name: 'AI Control Center', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: Brain, sidebarLabel: 'AI Control Center', sidebarEnd: true, sidebarOrder: 0 },
  { path: '/admin/ai/sales', name: 'AI Sales Copilot', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: TrendingUp, sidebarLabel: 'Sales Copilot', sidebarOrder: 1, visibleTo: ['admin', 'sales'] },
  { path: '/admin/ai/customer-service', name: 'AI CS Copilot', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: Users, sidebarLabel: 'CS Copilot', sidebarOrder: 2, visibleTo: ['admin', 'cs'] },
  { path: '/admin/ai/dispatch', name: 'AI Dispatch Copilot', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: Truck, sidebarLabel: 'Dispatch Copilot', sidebarOrder: 3, visibleTo: ['admin', 'dispatcher', 'ops_admin'] },
  { path: '/admin/ai/driver', name: 'AI Driver Copilot', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: Truck, sidebarLabel: 'Driver Copilot', sidebarOrder: 4, visibleTo: ['admin', 'driver'] },
  { path: '/admin/ai/fleet', name: 'AI Fleet Copilot', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: Warehouse, sidebarLabel: 'Fleet Copilot', sidebarOrder: 5, visibleTo: ['admin', 'fleet_maintenance'] },
  { path: '/admin/ai/finance', name: 'AI Finance Copilot', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: DollarSign, sidebarLabel: 'Finance Copilot', sidebarOrder: 6, visibleTo: ['admin', 'finance'] },
  { path: '/admin/ai/seo', name: 'AI SEO Copilot', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: Globe, sidebarLabel: 'SEO Copilot', sidebarOrder: 7, visibleTo: ['admin', 'marketing_seo'] },
  { path: '/admin/ai/admin', name: 'AI Admin Copilot', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: Shield, sidebarLabel: 'Admin Copilot', sidebarOrder: 8, visibleTo: ['admin'] },
  { path: '/admin/ai/performance', name: 'AI Performance', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: BarChart3, sidebarOrder: 9, visibleTo: ['admin'] },
  { path: '/admin/ai/chat', name: 'AI Chat', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'ai', sidebarIcon: MessageSquare, sidebarOrder: 10, visibleTo: ['admin'] },
];

const crmIntegrations: RouteEntry[] = [
  { path: '/admin/google', name: 'Google Workspace', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'integrations', sidebarIcon: Link2, sidebarOrder: 0, visibleTo: ['admin'] },
  { path: '/admin/google/setup', name: 'Google Setup', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/google/logs', name: 'Google Logs', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/messaging', name: 'Messaging', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'integrations', sidebarIcon: MessageSquare, sidebarOrder: 1, visibleTo: ['admin'] },
  { path: '/admin/email-test', name: 'Email Test', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ghl', name: 'GHL Integration', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/setup/functions', name: 'Functions Map', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'integrations', sidebarIcon: Settings, sidebarOrder: 2, visibleTo: ['admin'] },
  { path: '/admin/setup/what-missing', name: "What's Missing", group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/setup/search-index', name: 'Search Index', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
];

const crmQA: RouteEntry[] = [
  { path: '/admin/qa/control-center', name: 'QA Control Center', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: Shield, sidebarOrder: 0, visibleTo: ['admin'] },
  { path: '/admin/qa/page-organization', name: 'Page Organization', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: Layout, sidebarOrder: 1, visibleTo: ['admin'] },
  { path: '/admin/qa/route-health', name: 'Route Health', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: TrendingUp, sidebarOrder: 2, visibleTo: ['admin'] },
  { path: '/admin/qa/workflows', name: 'Workflows Explorer', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/workflow-graph', name: 'Workflow Graph', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/photo-ai-test', name: 'Photo AI Test', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/build-info', name: 'Build Info', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/env-health', name: 'Env Health', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/build-health', name: 'Build Health', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/seo-health', name: 'SEO Health Redirect', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/admin/seo/health' },
  { path: '/admin/qa/duplicate-pages', name: 'Duplicate Pages', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/public-vs-crm', name: 'Public vs CRM', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/calculator/logs', name: 'Calculator Logs', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
];

const crmSystem: RouteEntry[] = [
  { path: '/admin/alerts', name: 'Alerts', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: Bell, sidebarOrder: 10, visibleTo: ['admin'] },
  { path: '/admin/notifications/internal', name: 'Internal Alerts', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/security', name: 'Security Health', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: Shield, sidebarOrder: 11, visibleTo: ['admin'] },
  { path: '/admin/fraud-flags', name: 'Fraud Flags', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: Shield, sidebarOrder: 12, visibleTo: ['admin'] },
  { path: '/admin/risk', name: 'Risk Review', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: Shield, sidebarOrder: 13, visibleTo: ['admin'] },
  { path: '/admin/users', name: 'User Management', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: UserCog, sidebarOrder: 14, visibleTo: ['admin'] },
  { path: '/admin/access-requests', name: 'Access Requests', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: UserCog, sidebarOrder: 15, visibleTo: ['admin'] },
  { path: '/admin/audit-logs', name: 'Audit Logs', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: FileText, sidebarOrder: 16, visibleTo: ['admin'] },
  { path: '/admin/system/reset', name: 'System Reset', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/docs', name: 'Internal Docs', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'admin-qa', sidebarIcon: FileText, sidebarOrder: 17, visibleTo: ['admin'] },
];

const crmInternal: RouteEntry[] = [
  { path: '/internal/calculator', name: 'Internal Calculator', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/ops/calculator', name: 'Ops Calculator Alias', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/internal/calculator' },
  { path: '/sales/calculator', name: 'Sales Calculator Alias', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/internal/calculator' },
  { path: '/cs/calculator', name: 'CS Calculator Alias', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/internal/calculator' },
  { path: '/dispatch/calculator', name: 'Dispatch Calculator Alias', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/internal/calculator' },
];

// Driver sidebar items
const crmDriverSidebar: RouteEntry[] = [
  { path: '/admin/drivers', name: 'Driver Management', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'driver', sidebarIcon: Truck, sidebarOrder: 0, visibleTo: ['admin', 'dispatcher', 'ops_admin'] },
];

// Fleet sidebar items
const crmFleetSidebar: RouteEntry[] = [
  { path: '/admin/inventory', name: 'Inventory', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, showInSidebar: true, sidebarSection: 'fleet', sidebarIcon: Warehouse, sidebarOrder: 0, visibleTo: ['admin', 'ops_admin', 'fleet_maintenance'] },
];

// ─── CUSTOMER PORTAL ─────────────────────────────────────────────
const portalRoutes: RouteEntry[] = [
  { path: '/portal', name: 'Portal Login', group: 'CUSTOMER_PORTAL', subcategory: 'Auth', isProtected: false, indexable: false, mounted: true },
  { path: '/portal/track', name: 'Order Tracking', group: 'CUSTOMER_PORTAL', subcategory: 'Tracking', isProtected: false, indexable: false, mounted: true },
  { path: '/portal/dashboard', name: 'Customer Dashboard', group: 'CUSTOMER_PORTAL', subcategory: 'Orders', isProtected: true, indexable: false, mounted: true },
  { path: '/portal/orders', name: 'Customer Orders', group: 'CUSTOMER_PORTAL', subcategory: 'Orders', isProtected: true, indexable: false, mounted: true },
  { path: '/portal/order/:orderId', name: 'Order Detail (legacy)', group: 'CUSTOMER_PORTAL', subcategory: 'Orders', isProtected: true, indexable: false, mounted: true, isDynamic: true, canonicalAlias: '/portal/orders/:orderId' },
  { path: '/portal/orders/:orderId', name: 'Order Detail', group: 'CUSTOMER_PORTAL', subcategory: 'Orders', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/portal/documents', name: 'Documents', group: 'CUSTOMER_PORTAL', subcategory: 'Documents', isProtected: true, indexable: false, mounted: true },
  { path: '/portal/payment-complete', name: 'Payment Complete', group: 'CUSTOMER_PORTAL', subcategory: 'Payments', isProtected: true, indexable: false, mounted: true },
  { path: '/portal/quote/:quoteId', name: 'View Quote', group: 'CUSTOMER_PORTAL', subcategory: 'Orders', isProtected: false, indexable: false, mounted: true, isDynamic: true },
  { path: '/portal/schedule', name: 'Schedule Delivery', group: 'CUSTOMER_PORTAL', subcategory: 'Scheduling', isProtected: false, indexable: false, mounted: true },
  { path: '/portal/pay', name: 'Make Payment', group: 'CUSTOMER_PORTAL', subcategory: 'Payments', isProtected: false, indexable: false, mounted: true },
  { path: '/portal/pay/:paymentId', name: 'Payment Redirect', group: 'CUSTOMER_PORTAL', subcategory: 'Payments', isProtected: false, indexable: false, mounted: true, isDynamic: true },
  { path: '/portal/sign-quote-contract', name: 'Sign Contract', group: 'CUSTOMER_PORTAL', subcategory: 'Documents', isProtected: false, indexable: false, mounted: true },
  { path: '/portal/activate', name: 'Account Activation', group: 'CUSTOMER_PORTAL', subcategory: 'Auth', isProtected: false, indexable: false, mounted: true },
  { path: '/green-halo/portal', name: 'Green Halo Login', group: 'CUSTOMER_PORTAL', subcategory: 'Green Halo', isProtected: false, indexable: false, mounted: true },
  { path: '/green-halo/portal/dashboard', name: 'Green Halo Dashboard', group: 'CUSTOMER_PORTAL', subcategory: 'Green Halo', isProtected: false, indexable: false, mounted: true },
  { path: '/green-halo/portal/project/:projectId', name: 'Green Halo Project', group: 'CUSTOMER_PORTAL', subcategory: 'Green Halo', isProtected: false, indexable: false, mounted: true, isDynamic: true },
  { path: '/green-halo/portal/report', name: 'Sustainability Report', group: 'CUSTOMER_PORTAL', subcategory: 'Green Halo', isProtected: false, indexable: false, mounted: true },
];

// ─── COMBINED REGISTRY ───────────────────────────────────────────
export const ALL_ROUTES: RouteEntry[] = [
  ...publicCore,
  ...publicQuoteContact,
  ...publicSEO,
  ...publicBlog,
  ...publicLegal,
  ...publicRedirects,
  ...publicMarketing,
  ...crmAuth,
  ...crmControlCenter,
  ...crmSales,
  ...crmCustomerService,
  ...crmDispatch,
  ...crmDriver,
  ...crmMaintenance,
  ...crmFinance,
  ...crmOperations,
  ...crmConfiguration,
  ...crmTelephony,
  ...crmGoogleAds,
  ...crmSeoAdmin,
  ...crmLocalSearch,
  ...crmMarketingAnalytics,
  ...crmAnalytics,
  ...crmAI,
  ...crmIntegrations,
  ...crmQA,
  ...crmSystem,
  ...crmInternal,
  ...crmDriverSidebar,
  ...crmFleetSidebar,
  ...portalRoutes,
];

// ─── SIDEBAR SECTION METADATA ────────────────────────────────────
export interface SidebarSectionMeta {
  id: SidebarSectionId;
  title: string;
  icon: LucideIcon;
  defaultOpen?: boolean;
  /** Roles that can see this section (empty = all) */
  visibleTo?: VisibleRole[];
}

export const SIDEBAR_SECTIONS: SidebarSectionMeta[] = [
  { id: 'control-center', title: 'Control Center', icon: Home, defaultOpen: true, visibleTo: ['admin', 'executive', 'read_only', 'sales', 'cs', 'dispatcher', 'ops_admin', 'finance', 'fleet_maintenance', 'marketing_seo'] },
  { id: 'analytics', title: 'Analytics', icon: BarChart3, visibleTo: ['admin', 'executive', 'read_only', 'sales', 'cs', 'finance', 'dispatcher', 'ops_admin'] },
  { id: 'sales', title: 'Sales', icon: TrendingUp, visibleTo: ['admin', 'sales', 'cs', 'executive'] },
  { id: 'customers', title: 'Customer Service', icon: Users, visibleTo: ['admin', 'cs', 'sales', 'finance', 'dispatcher', 'ops_admin', 'executive'] },
  { id: 'operations', title: 'Operations', icon: Package, visibleTo: ['admin', 'dispatcher', 'ops_admin', 'cs', 'finance'] },
  { id: 'driver', title: 'Driver App', icon: Truck, visibleTo: ['admin', 'dispatcher', 'ops_admin', 'driver'] },
  { id: 'fleet', title: 'Fleet & Maintenance', icon: Boxes, visibleTo: ['admin', 'ops_admin', 'fleet_maintenance', 'dispatcher'] },
  { id: 'finance', title: 'Finance', icon: DollarSign, visibleTo: ['admin', 'finance', 'executive', 'read_only'] },
  { id: 'seo-marketing', title: 'SEO & Marketing', icon: Globe, visibleTo: ['admin', 'marketing_seo', 'executive'] },
  { id: 'integrations', title: 'Integrations', icon: Link2, visibleTo: ['admin'] },
  { id: 'configuration', title: 'Configuration', icon: Settings, visibleTo: ['admin', 'ops_admin'] },
  { id: 'ai', title: 'AI Copilots', icon: Brain, visibleTo: ['admin', 'sales', 'cs', 'dispatcher', 'ops_admin', 'driver', 'fleet_maintenance', 'finance', 'marketing_seo', 'executive'] },
  { id: 'admin-qa', title: 'Admin & QA', icon: Shield, visibleTo: ['admin'] },
];

/** Get sidebar items for a section, optionally filtered by role */
export function getSidebarItems(sectionId: SidebarSectionId, userRoles?: VisibleRole[]): RouteEntry[] {
  return ALL_ROUTES
    .filter(r => r.showInSidebar && r.sidebarSection === sectionId && r.mounted)
    .filter(r => {
      if (!userRoles || !r.visibleTo || r.visibleTo.length === 0) return true;
      return r.visibleTo.some(role => userRoles.includes(role));
    })
    .sort((a, b) => (a.sidebarOrder ?? 99) - (b.sidebarOrder ?? 99));
}

/** Get visible sections for a user's roles */
export function getVisibleSections(userRoles?: VisibleRole[]): SidebarSectionMeta[] {
  return SIDEBAR_SECTIONS.filter(s => {
    if (!userRoles || !s.visibleTo || s.visibleTo.length === 0) return true;
    return s.visibleTo.some(role => userRoles.includes(role));
  });
}

/** Search sidebar items by label, path, or section title */
export function searchSidebarItems(query: string, userRoles?: VisibleRole[]): RouteEntry[] {
  const q = query.toLowerCase().trim();
  if (!q) return [];
  return ALL_ROUTES
    .filter(r => r.showInSidebar && r.mounted)
    .filter(r => {
      if (!userRoles || !r.visibleTo || r.visibleTo.length === 0) return true;
      return r.visibleTo.some(role => userRoles.includes(role));
    })
    .filter(r => {
      const label = (r.sidebarLabel || r.name).toLowerCase();
      const path = r.path.toLowerCase();
      const section = SIDEBAR_SECTIONS.find(s => s.id === r.sidebarSection);
      const sectionTitle = section?.title.toLowerCase() || '';
      return label.includes(q) || path.includes(q) || sectionTitle.includes(q);
    })
    .sort((a, b) => (a.sidebarOrder ?? 99) - (b.sidebarOrder ?? 99));
}

// ─── HELPERS ─────────────────────────────────────────────────────
export function getRoutesByGroup(group: RouteGroup) {
  return ALL_ROUTES.filter(r => r.group === group);
}

export function getRoutesBySubcategory(sub: Subcategory) {
  return ALL_ROUTES.filter(r => r.subcategory === sub);
}

export function getMountedRoutes() {
  return ALL_ROUTES.filter(r => r.mounted);
}

export function getOrphanedRoutes() {
  return ALL_ROUTES.filter(r => !r.mounted);
}

export function getAliasRoutes() {
  return ALL_ROUTES.filter(r => !!r.canonicalAlias);
}

export function getGroupSummary() {
  const groups: Record<RouteGroup, number> = { PUBLIC_WEBSITE: 0, CRM_INTERNAL: 0, CUSTOMER_PORTAL: 0 };
  ALL_ROUTES.forEach(r => { groups[r.group]++; });
  return groups;
}

export function getSubcategorySummary() {
  const subs: Record<string, number> = {};
  ALL_ROUTES.forEach(r => { subs[r.subcategory] = (subs[r.subcategory] || 0) + 1; });
  return subs;
}

/**
 * BEST PRACTICES FOR NEW PAGES
 * 
 * 1. BEFORE creating a page file, add its entry to this registry.
 * 2. Assign group (PUBLIC/CRM/PORTAL) and subcategory.
 * 3. Set indexable=true ONLY for public marketing pages.
 * 4. Set isProtected=true for all CRM and portal auth-guarded pages.
 * 5. If the route is dynamic, mark isDynamic=true.
 * 6. If this is an alias for another route, set canonicalAlias.
 * 7. Never mount CRM routes on public-facing path prefixes.
 * 8. Never mount public pages behind auth guards.
 * 9. For sidebar items, set showInSidebar=true + sidebarSection + sidebarIcon.
 * 10. Run /admin/qa/page-organization to verify after adding.
 */
