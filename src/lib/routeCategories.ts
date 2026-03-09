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

export interface RouteEntry {
  path: string;
  name: string;
  group: RouteGroup;
  subcategory: Subcategory;
  isProtected: boolean;
  indexable: boolean;
  /** If this is an alias, the canonical path it maps to */
  canonicalAlias?: string;
  /** Whether the route is currently mounted in App.tsx */
  mounted: boolean;
  /** Dynamic route parameter */
  isDynamic?: boolean;
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
  { path: '/locations', name: 'Locations', group: 'PUBLIC_WEBSITE', subcategory: 'Core', isProtected: false, indexable: true, mounted: true },
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
  { path: '/quick-order', name: 'Quick Order', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: true, mounted: true },
  { path: '/thank-you', name: 'Thank You', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: false, mounted: true },
  { path: '/download-price-list', name: 'Download Price List', group: 'PUBLIC_WEBSITE', subcategory: 'Quote/Contact', isProtected: false, indexable: false, mounted: true },
];

const publicSEO: RouteEntry[] = [
  // Dynamic SEO city engine
  { path: '/dumpster-rental/:citySlug', name: 'City Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/dumpster-rental/:citySlug/:sizeSlug-yard', name: 'City + Size', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/dumpster-rental/:citySlug/:materialSlug', name: 'City + Material', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/service-area/:zip/dumpster-rental', name: 'ZIP Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/county/:countySlug/dumpster-rental', name: 'County Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/use-cases/:useCaseSlug', name: 'Use Case Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/yards/:yardSlug', name: 'Yard Hub', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  // Service-specific city routes
  { path: '/concrete-disposal/:citySlug', name: 'Concrete Disposal City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/yard-waste-removal/:citySlug', name: 'Yard Waste Removal City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/debris-removal/:citySlug', name: 'Debris Removal City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/construction-debris/:citySlug', name: 'Construction Debris City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  { path: '/yard-waste-disposal/:citySlug', name: 'Yard Waste Disposal City', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true, isDynamic: true },
  // Hub pages
  { path: '/california-dumpster-rental', name: 'California Hub', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/bay-area-dumpster-rental', name: 'Bay Area Hub', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/southern-california-dumpster-rental', name: 'SoCal Hub', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/central-valley-dumpster-rental', name: 'Central Valley Hub', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  // Static SEO pages
  { path: '/dumpster-rental-oakland-ca', name: 'Oakland SEO', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dumpster-rental-san-jose-ca', name: 'San Jose SEO', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dumpster-rental-san-francisco-ca', name: 'San Francisco SEO', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dumpster-rental-east-bay', name: 'East Bay Regional', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/dumpster-rental-south-bay', name: 'South Bay Regional', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/commercial-dumpster-rental', name: 'Commercial Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/construction-dumpsters', name: 'Construction Dumpsters', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/warehouse-cleanout-dumpsters', name: 'Warehouse Cleanout', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  // Size intent pages
  { path: '/10-yard-dumpster-rental', name: '10 Yard Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/20-yard-dumpster-rental', name: '20 Yard Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/30-yard-dumpster-rental', name: '30 Yard Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  { path: '/40-yard-dumpster-rental', name: '40 Yard Landing', group: 'PUBLIC_WEBSITE', subcategory: 'SEO', isProtected: false, indexable: true, mounted: true },
  // Material intent pages
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
  { path: '/admin', name: 'Calsan Control Center', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/modules', name: 'Module Registry', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/executive', name: 'Executive Dashboard', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/legacy-dashboard', name: 'Legacy Dashboard', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/activity', name: 'Activity Feed', group: 'CRM_INTERNAL', subcategory: 'Control Center', isProtected: true, indexable: false, mounted: true },
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
  { path: '/admin/leads', name: 'Admin Lead Hub', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/leads-health', name: 'Lead Health Dashboard', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/leads/settings', name: 'Lead Engine Settings', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/sales-performance', name: 'Sales Performance', group: 'CRM_INTERNAL', subcategory: 'Sales', isProtected: true, indexable: false, mounted: true },
];

const crmCustomerService: RouteEntry[] = [
  // CS portal routes are imported but NOT mounted — orphaned
  { path: '/cs', name: 'CS Dashboard', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: false },
  { path: '/cs/orders', name: 'CS Orders', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: false },
  { path: '/cs/requests', name: 'CS Requests', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: false },
  { path: '/cs/templates', name: 'CS Templates', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: false },
  { path: '/cs/messages', name: 'CS Messages', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: false },
  { path: '/cs/calls', name: 'CS Calls', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: false },
  { path: '/cs/lead-inbox', name: 'CS Lead Inbox', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: false },
  { path: '/admin/activation', name: 'Customer Activation', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/customers', name: 'Customers Manager', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/customers/:id', name: 'Customer Detail', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true, isDynamic: true },
  { path: '/admin/customer-health', name: 'Customer Health', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/customer-type-rules', name: 'Customer Type Rules', group: 'CRM_INTERNAL', subcategory: 'Customer Service', isProtected: true, indexable: false, mounted: true },
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
  { path: '/driver/legacy', name: 'Legacy Driver App', group: 'CRM_INTERNAL', subcategory: 'Driver', isProtected: true, indexable: false, mounted: true },
];

const crmMaintenance: RouteEntry[] = [
  // Maintenance routes are imported but NOT mounted — orphaned
  { path: '/admin/maintenance', name: 'Maintenance Dashboard', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: false },
  { path: '/admin/maintenance/trucks', name: 'Maintenance Trucks', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: false },
  { path: '/admin/maintenance/issues', name: 'Maintenance Issues', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: false },
  { path: '/admin/maintenance/work-orders', name: 'Work Orders', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: false },
  { path: '/admin/vehicles/:id', name: 'Vehicle Profile', group: 'CRM_INTERNAL', subcategory: 'Maintenance', isProtected: true, indexable: false, mounted: false, isDynamic: true },
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
  { path: '/admin/tickets', name: 'Tickets & Receipts', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/overdue', name: 'Overdue Billing', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/approval-queue', name: 'Approval Queue', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/compensation', name: 'Compensation', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/profitability', name: 'Profitability', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/heavy-risk', name: 'Heavy Risk', group: 'CRM_INTERNAL', subcategory: 'Finance', isProtected: true, indexable: false, mounted: true },
];

const crmOperations: RouteEntry[] = [
  { path: '/admin/orders', name: 'Orders Manager', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/assets', name: 'Asset Control Tower', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/inventory', name: 'Inventory (Legacy)', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/movements', name: 'Movement Log', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/fleet/cameras', name: 'Fleet Cameras', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/markets', name: 'Markets Manager', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/markets/new-location', name: 'New Location Wizard', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/facilities', name: 'Facilities Manager', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/disposal-search', name: 'Disposal Search', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/facilities/finder', name: 'Facilities Finder', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/quick-links', name: 'Quick Links', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
];

const crmConfiguration: RouteEntry[] = [
  { path: '/admin/configuration', name: 'Config Center', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/yards', name: 'Yard Manager', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/zones', name: 'ZIP-to-Zone', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/pricing', name: 'Pricing Tables', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/pricing/locations', name: 'Location Pricing', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/vendors', name: 'Vendors', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/extras', name: 'Extras Catalog', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/config', name: 'Business Rules', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/city-rates', name: 'City Rates', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/toll-surcharges', name: 'Toll Surcharges', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/volume-commitments', name: 'Volume Discounts', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/config/health', name: 'Config Health', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/materials/catalog', name: 'Material Catalog', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/materials/categories', name: 'Project Categories', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/materials/offers', name: 'Material Offers', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/email-config', name: 'Email Config', group: 'CRM_INTERNAL', subcategory: 'Configuration', isProtected: true, indexable: false, mounted: true },
];

const crmTelephony: RouteEntry[] = [
  { path: '/admin/telephony/calls', name: 'Call Logs', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/telephony/numbers', name: 'Phone Numbers', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/telephony/analytics', name: 'Call Analytics', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/telephony/migration', name: 'GHL Migration', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/telephony/test', name: 'Test Call', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/telephony/import', name: 'Import History', group: 'CRM_INTERNAL', subcategory: 'Telephony', isProtected: true, indexable: false, mounted: true },
];

const crmGoogleAds: RouteEntry[] = [
  { path: '/admin/ads', name: 'Ads Overview', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ads/campaigns', name: 'Campaigns', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ads/rules', name: 'Automation Rules', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ads/markets', name: 'Ads Markets Config', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ads/logs', name: 'Ads Sync Logs', group: 'CRM_INTERNAL', subcategory: 'Google Ads', isProtected: true, indexable: false, mounted: true },
];

const crmSeoAdmin: RouteEntry[] = [
  { path: '/admin/seo/dashboard', name: 'SEO Dashboard', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/cities', name: 'SEO Cities', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/pages', name: 'SEO Pages', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/sitemap', name: 'SEO Sitemap', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/gbp-plan', name: 'GBP Domination Plan', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/health', name: 'SEO Health', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/repair', name: 'SEO Repair', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/indexing', name: 'SEO Indexing', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/queue', name: 'SEO Queue', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/rules', name: 'SEO Rules', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/metrics', name: 'SEO Metrics', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/generate', name: 'SEO Generate', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/grid', name: 'SEO Grid', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/seo/audit', name: 'SEO Audit', group: 'CRM_INTERNAL', subcategory: 'SEO Admin', isProtected: true, indexable: false, mounted: true },
];

const crmMarketingAnalytics: RouteEntry[] = [
  { path: '/admin/marketing/visitors', name: 'Visitors Dashboard', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/marketing/sessions', name: 'Sessions Dashboard', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/marketing/google-setup', name: 'Google Setup Wizard', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/marketing/dashboard', name: 'Marketing Dashboard', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/marketing/ga4-debug', name: 'GA4 Debug Panel', group: 'CRM_INTERNAL', subcategory: 'Marketing Analytics', isProtected: true, indexable: false, mounted: true },
];

const crmAnalytics: RouteEntry[] = [
  { path: '/admin/dashboards/overview', name: 'Analytics Overview', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/dashboards/sales', name: 'Sales Funnel', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/dashboards/operations', name: 'Operations Dashboard', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/dashboards/finance', name: 'Finance Dashboard', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/dashboards/customers', name: 'Customers Dashboard', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/dashboards/kpis', name: 'KPI Optimization', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/dashboards/leads', name: 'Lead Performance', group: 'CRM_INTERNAL', subcategory: 'Analytics', isProtected: true, indexable: false, mounted: true },
];

const crmAI: RouteEntry[] = [
  { path: '/admin/ai/chat', name: 'AI Chat', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ai/performance', name: 'AI Performance', group: 'CRM_INTERNAL', subcategory: 'AI', isProtected: true, indexable: false, mounted: true },
];

const crmIntegrations: RouteEntry[] = [
  { path: '/admin/google', name: 'Google Workspace', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/google/setup', name: 'Google Setup', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/google/logs', name: 'Google Logs', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/messaging', name: 'Messaging', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/email-test', name: 'Email Test', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/ghl', name: 'GHL Integration', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/setup/functions', name: 'Functions Map', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/setup/what-missing', name: "What's Missing", group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/setup/search-index', name: 'Search Index', group: 'CRM_INTERNAL', subcategory: 'Integrations', isProtected: true, indexable: false, mounted: true },
];

const crmQA: RouteEntry[] = [
  { path: '/admin/qa/control-center', name: 'QA Control Center', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/workflows', name: 'Workflows Explorer', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/workflow-graph', name: 'Workflow Graph', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/photo-ai-test', name: 'Photo AI Test', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/build-info', name: 'Build Info', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/env-health', name: 'Env Health', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/build-health', name: 'Build Health', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/seo-health', name: 'SEO Health Check', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/route-health', name: 'Route Health', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/duplicate-pages', name: 'Duplicate Pages', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/qa/public-vs-crm', name: 'Public vs CRM', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/calculator/logs', name: 'Calculator Logs', group: 'CRM_INTERNAL', subcategory: 'QA/Diagnostics', isProtected: true, indexable: false, mounted: true },
];

const crmSystem: RouteEntry[] = [
  { path: '/admin/alerts', name: 'Alerts', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/notifications/internal', name: 'Internal Alerts', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/security', name: 'Security Health', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/fraud-flags', name: 'Fraud Flags', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/risk', name: 'Risk Review', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/users', name: 'User Management', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/access-requests', name: 'Access Requests', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/audit-logs', name: 'Audit Logs', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/system/reset', name: 'System Reset', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
  { path: '/admin/docs', name: 'Internal Docs', group: 'CRM_INTERNAL', subcategory: 'System', isProtected: true, indexable: false, mounted: true },
];

const crmInternal: RouteEntry[] = [
  { path: '/internal/calculator', name: 'Internal Calculator', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true },
  { path: '/ops/calculator', name: 'Ops Calculator Alias', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/internal/calculator' },
  { path: '/sales/calculator', name: 'Sales Calculator Alias', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/internal/calculator' },
  { path: '/cs/calculator', name: 'CS Calculator Alias', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/internal/calculator' },
  { path: '/dispatch/calculator', name: 'Dispatch Calculator Alias', group: 'CRM_INTERNAL', subcategory: 'Operations', isProtected: true, indexable: false, mounted: true, canonicalAlias: '/internal/calculator' },
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
  // Green Halo Portal (demo)
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
  ...crmMarketingAnalytics,
  ...crmAnalytics,
  ...crmAI,
  ...crmIntegrations,
  ...crmQA,
  ...crmSystem,
  ...crmInternal,
  ...portalRoutes,
];

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
 * 9. Update AdminLayout navSections if adding a new admin page.
 * 10. Run /admin/qa/page-organization to verify after adding.
 */
