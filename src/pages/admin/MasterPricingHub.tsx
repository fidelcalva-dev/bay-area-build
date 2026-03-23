// ══════════════════════════════════════════════════════════════
// MASTER PRICING CONTROL CENTER
// Canonical pricing hub at /admin/pricing
// Consolidates all pricing config into one tabbed interface
// ══════════════════════════════════════════════════════════════

import { useState, lazy, Suspense } from 'react';
import { useSearchParams } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import PricingOverviewPanel from '@/components/admin/pricing/PricingOverviewPanel';
import {
  DollarSign, Scale, MapPin, Users, Plus, Gauge, LayoutDashboard,
  Calculator, Activity, Building2, Zap, AlertTriangle, Globe,
  Loader2, ShieldCheck, FileText, Truck
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';

// Lazy-load each tab panel from existing pages
const PricingManager = lazy(() => import('@/pages/admin/PricingManager'));
const LocationPricingManager = lazy(() => import('@/pages/admin/pricing/LocationPricingManager'));
const ZoneSurchargesConfig = lazy(() => import('@/pages/admin/pricing/ZoneSurchargesConfig'));
const RushDeliveryConfig = lazy(() => import('@/pages/admin/pricing/RushDeliveryConfig'));
const ContractorPricingConfig = lazy(() => import('@/pages/admin/pricing/ContractorPricingConfig'));
const ExtrasCatalogConfig = lazy(() => import('@/pages/admin/pricing/ExtrasCatalogConfig'));
const MaterialRulesDashboard = lazy(() => import('@/pages/admin/pricing/MaterialRulesDashboard'));
const CityDisplayZips = lazy(() => import('@/pages/admin/pricing/CityDisplayZips'));
const ZipHealthDashboard = lazy(() => import('@/pages/admin/pricing/ZipHealthDashboard'));
const YardHealthDashboard = lazy(() => import('@/pages/admin/pricing/YardHealthDashboard'));
const FacilityCostDashboard = lazy(() => import('@/pages/admin/pricing/FacilityCostDashboard'));
const PricingSimulator = lazy(() => import('@/pages/admin/PricingSimulator'));
const PricingReadinessDashboard = lazy(() => import('@/pages/admin/pricing/PricingReadinessDashboard'));
const RushHealthDashboard = lazy(() => import('@/pages/admin/pricing/RushHealthDashboard'));
const ContractorRulesHealth = lazy(() => import('@/pages/admin/pricing/ContractorRulesHealth'));
const ExtrasHealthDashboard = lazy(() => import('@/pages/admin/pricing/ExtrasHealthDashboard'));
// Consolidated panels
const MixedRulesManager = lazy(() => import('@/pages/admin/MixedRulesManager'));
const WarningsCapsManager = lazy(() => import('@/pages/admin/WarningsCapsManager'));
const CityRatesManager = lazy(() => import('@/pages/admin/CityRatesManager'));
const TollSurchargesManager = lazy(() => import('@/pages/admin/TollSurchargesManager'));
const VolumeCommitmentsManager = lazy(() => import('@/pages/admin/VolumeCommitmentsManager'));
const CustomerTypeRulesPage = lazy(() => import('@/pages/admin/CustomerTypeRulesPage'));
// New editable DB-backed panels
const EditableGeneralDebrisPanel = lazy(() => import('@/components/admin/pricing/EditableGeneralDebrisPanel'));
const EditableHeavyPricingPanel = lazy(() => import('@/components/admin/pricing/EditableHeavyPricingPanel'));
const EditablePoliciesPanel = lazy(() => import('@/components/admin/pricing/EditablePoliciesPanel'));
const PricingAuditLogPanel = lazy(() => import('@/components/admin/pricing/PricingAuditLogPanel'));

const TabSpinner = () => (
  <div className="flex items-center justify-center py-20">
    <Loader2 className="w-8 h-8 animate-spin text-primary" />
  </div>
);

interface TabDef {
  value: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
  description: string;
}

const TABS: TabDef[] = [
  // ── Core Pricing ──
  { value: 'dashboard', label: 'Overview', icon: LayoutDashboard, group: 'Core', description: 'Pricing summary, key metrics, quick navigation' },
  { value: 'overview', label: 'General Debris', icon: DollarSign, group: 'Core', description: 'Sizes, base prices, included tons, rental periods' },
  { value: 'general-edit', label: 'Edit General Prices', icon: DollarSign, group: 'Core', description: 'DB-backed editable general debris pricing' },
  { value: 'heavy', label: 'Heavy (Location)', icon: MapPin, group: 'Core', description: 'Market-based dump fees, size pricing by tier' },
  { value: 'heavy-rates', label: 'Edit Heavy Rates', icon: Scale, group: 'Core', description: 'Editable heavy material service costs and dump fees' },
  { value: 'materials', label: 'Material Rules', icon: AlertTriangle, group: 'Core', description: 'Material classes, dump fees, review rules' },
  { value: 'policies', label: 'Fees & Policies', icon: ShieldCheck, group: 'Core', description: 'Editable operational fees and surcharges' },
  // ── Geography ──
  { value: 'zones', label: 'Zone Surcharges', icon: MapPin, group: 'Geography', description: 'Distance-based zone surcharges (A-E)' },
  { value: 'tolls', label: 'Toll Surcharges', icon: Truck, group: 'Geography', description: 'Toll-based surcharges by zone and yard' },
  { value: 'zips', label: 'ZIP Health', icon: MapPin, group: 'Geography', description: 'ZIP → zone → market mapping and health' },
  { value: 'yards', label: 'Yard Health', icon: Building2, group: 'Geography', description: 'Yard coordinates, service radius, status' },
  { value: 'facilities', label: 'Facility Costs', icon: Building2, group: 'Geography', description: 'Disposal site costs and surcharge rules' },
  { value: 'cities', label: 'City Display', icon: Globe, group: 'Geography', description: 'City principal ZIPs for SEO pricing display' },
  { value: 'city-rates', label: 'City Rates', icon: DollarSign, group: 'Geography', description: 'Per-city extra ton rates and heavy base pricing' },
  // ── Fees & Tiers ──
  { value: 'rush', label: 'Rush Delivery', icon: Zap, group: 'Fees', description: 'Same-day, next-day, and priority fees' },
  { value: 'contractor', label: 'Contractor Tiers', icon: Users, group: 'Fees', description: 'Tier discounts and commercial rules' },
  { value: 'extras', label: 'Extras Catalog', icon: Plus, group: 'Fees', description: 'Add-on fees, driver-selectable items' },
  // ── Rules & Overrides ──
  { value: 'mixed-rules', label: 'Mixed / Overage', icon: FileText, group: 'Rules', description: 'Mixed material rules, overage rates, included tons' },
  { value: 'warnings-caps', label: 'Warnings & Caps', icon: ShieldCheck, group: 'Rules', description: 'Warning thresholds, price caps, overrides' },
  { value: 'volume', label: 'Volume Commitments', icon: Users, group: 'Rules', description: 'Volume tier discounts and commitments' },
  { value: 'customer-rules', label: 'Customer Type Rules', icon: Users, group: 'Rules', description: 'Auto-detection rules for customer type scoring' },
  // ── Analysis ──
  { value: 'simulator', label: 'Simulator', icon: Calculator, group: 'Analysis', description: 'Test pricing for any ZIP / material / size' },
  { value: 'readiness', label: 'Readiness', icon: Gauge, group: 'Analysis', description: 'System-wide pricing integrity score' },
  { value: 'rush-health', label: 'Rush Health', icon: Activity, group: 'Analysis', description: 'Rush fee configuration health' },
  { value: 'contractor-health', label: 'Contractor Health', icon: Activity, group: 'Analysis', description: 'Contractor rules health checks' },
  { value: 'extras-health', label: 'Extras Health', icon: Activity, group: 'Analysis', description: 'Extras catalog completeness' },
  { value: 'audit-log', label: 'Audit Log', icon: Activity, group: 'Analysis', description: 'Pricing change history and version control' },
];

export default function MasterPricingHub() {
  const [searchParams, setSearchParams] = useSearchParams();
  const activeTab = searchParams.get('tab') || 'dashboard';

  const setTab = (tab: string) => {
    setSearchParams({ tab }, { replace: true });
  };

  // Group tabs
  const groups = ['Core', 'Geography', 'Fees', 'Rules', 'Analysis'];
  const tabsByGroup = groups.map(g => ({
    group: g,
    tabs: TABS.filter(t => t.group === g),
  }));

  return (
    <>
      <Helmet>
        <title>Pricing Control Center | Admin</title>
      </Helmet>

      <div className="flex flex-col h-full">
        {/* ── Header ── */}
        <div className="sticky top-0 z-10 bg-background border-b border-border px-6 py-4">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
                <DollarSign className="w-6 h-6 text-primary" />
                Master Pricing Control Center
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                All costs, sizes, materials, zones, fees, and rules — one place.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="text-xs">
                Canonical Hub
              </Badge>
            </div>
          </div>
        </div>

        {/* ── Body ── */}
        <div className="flex flex-1 overflow-hidden">
          {/* ── Left Sidebar Nav ── */}
          <aside className="w-56 shrink-0 border-r border-border bg-muted/30 overflow-y-auto hidden lg:block">
            <nav className="py-3">
              {tabsByGroup.map(({ group, tabs }) => (
                <div key={group} className="mb-2">
                  <p className="px-4 py-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">
                    {group}
                  </p>
                  {tabs.map(t => {
                    const Icon = t.icon;
                    const isActive = activeTab === t.value;
                    return (
                      <button
                        key={t.value}
                        onClick={() => setTab(t.value)}
                        className={`w-full flex items-center gap-2 px-4 py-2 text-sm transition-colors
                          ${isActive
                            ? 'bg-primary/10 text-primary font-medium border-r-2 border-primary'
                            : 'text-muted-foreground hover:bg-muted hover:text-foreground'
                          }`}
                      >
                        <Icon className="w-4 h-4 shrink-0" />
                        <span className="truncate">{t.label}</span>
                      </button>
                    );
                  })}
                </div>
              ))}
            </nav>
          </aside>

          {/* ── Mobile Tab Strip ── */}
          <div className="lg:hidden border-b border-border bg-muted/30">
            <ScrollArea className="w-full">
              <div className="flex gap-1 p-2">
                {TABS.map(t => (
                  <button
                    key={t.value}
                    onClick={() => setTab(t.value)}
                    className={`shrink-0 px-3 py-1.5 rounded-md text-xs font-medium transition-colors
                      ${activeTab === t.value
                        ? 'bg-primary text-primary-foreground'
                        : 'text-muted-foreground hover:bg-muted'
                      }`}
                  >
                    {t.label}
                  </button>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </div>

          {/* ── Main Content ── */}
          <main className="flex-1 overflow-y-auto">
             <Suspense fallback={<TabSpinner />}>
              {activeTab === 'dashboard' && <PricingOverviewPanel onNavigateTab={setTab} />}
              {activeTab === 'overview' && <PricingManager />}
              {activeTab === 'general-edit' && <EditableGeneralDebrisPanel />}
              {activeTab === 'heavy' && <LocationPricingManager />}
              {activeTab === 'heavy-rates' && <EditableHeavyPricingPanel />}
              {activeTab === 'materials' && <MaterialRulesDashboard />}
              {activeTab === 'policies' && <EditablePoliciesPanel />}
              {activeTab === 'zones' && <ZoneSurchargesConfig />}
              {activeTab === 'tolls' && <TollSurchargesManager />}
              {activeTab === 'zips' && <ZipHealthDashboard />}
              {activeTab === 'yards' && <YardHealthDashboard />}
              {activeTab === 'facilities' && <FacilityCostDashboard />}
              {activeTab === 'cities' && <CityDisplayZips />}
              {activeTab === 'city-rates' && <CityRatesManager />}
              {activeTab === 'rush' && <RushDeliveryConfig />}
              {activeTab === 'contractor' && <ContractorPricingConfig />}
              {activeTab === 'extras' && <ExtrasCatalogConfig />}
              {activeTab === 'mixed-rules' && <MixedRulesManager />}
              {activeTab === 'warnings-caps' && <WarningsCapsManager />}
              {activeTab === 'volume' && <VolumeCommitmentsManager />}
              {activeTab === 'customer-rules' && <CustomerTypeRulesPage />}
              {activeTab === 'simulator' && <PricingSimulator />}
              {activeTab === 'readiness' && <PricingReadinessDashboard />}
              {activeTab === 'rush-health' && <RushHealthDashboard />}
              {activeTab === 'contractor-health' && <ContractorRulesHealth />}
              {activeTab === 'extras-health' && <ExtrasHealthDashboard />}
              {activeTab === 'audit-log' && <PricingAuditLogPanel />}
            </Suspense>
          </main>
        </div>
      </div>
    </>
  );
}
