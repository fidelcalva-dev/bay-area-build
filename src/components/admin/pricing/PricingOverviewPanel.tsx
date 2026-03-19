// ══════════════════════════════════════════════════════════════
// PRICING OVERVIEW PANEL — Summary dashboard for the Master Hub
// Shows key pricing metrics, health status, and quick nav
// ══════════════════════════════════════════════════════════════

import { DollarSign, Scale, MapPin, Zap, Users, Plus, AlertTriangle, CheckCircle2, Activity } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  GENERAL_DEBRIS_SIZES,
  POLICIES,
  formatPrice,
} from '@/config/pricingConfig';
import {
  HEAVY_MATERIAL_GROUPS,
  HEAVY_SERVICE_COSTS,
  HEAVY_ALLOWED_SIZES,
  calculateHeavyTotalPrice,
  type HeavySize,
} from '@/config/heavyMaterialConfig';

interface PricingOverviewPanelProps {
  onNavigateTab: (tab: string) => void;
}

export default function PricingOverviewPanel({ onNavigateTab }: PricingOverviewPanelProps) {
  const generalMin = Math.min(...GENERAL_DEBRIS_SIZES.map(s => s.price));
  const generalMax = Math.max(...GENERAL_DEBRIS_SIZES.map(s => s.price));
  const heavySizes = [...HEAVY_ALLOWED_SIZES] as HeavySize[];
  const heavyMin = Math.min(...heavySizes.map(s => calculateHeavyTotalPrice(s, 'CLEAN_NO_1')));
  const heavyMax = Math.max(...heavySizes.map(s => calculateHeavyTotalPrice(s, 'ALL_MIXED')));

  const summaryCards = [
    {
      title: 'General Debris',
      icon: DollarSign,
      value: `${formatPrice(generalMin)} – ${formatPrice(generalMax)}`,
      subtitle: `${GENERAL_DEBRIS_SIZES.length} sizes configured`,
      tab: 'overview',
      color: 'text-emerald-600',
    },
    {
      title: 'Heavy Materials',
      icon: Scale,
      value: `${formatPrice(heavyMin)} – ${formatPrice(heavyMax)}`,
      subtitle: `${HEAVY_MATERIAL_GROUPS.length} groups × ${HEAVY_ALLOWED_SIZES.length} sizes`,
      tab: 'heavy-rates',
      color: 'text-amber-600',
    },
    {
      title: 'Overage Rate',
      icon: AlertTriangle,
      value: `${formatPrice(POLICIES.overweightCostPerTon)}/ton`,
      subtitle: 'Green Halo compliance rate',
      tab: 'mixed-rules',
      color: 'text-red-500',
    },
    {
      title: 'Rush / Same-Day',
      icon: Zap,
      value: `${formatPrice(POLICIES.sameDayDeliveryFee)}+`,
      subtitle: 'Same-day delivery fee',
      tab: 'rush',
      color: 'text-blue-600',
    },
    {
      title: 'Standard Rental',
      icon: Activity,
      value: `${POLICIES.standardRentalDays} days`,
      subtitle: `Extra day: ${formatPrice(POLICIES.extraDayCost)}`,
      tab: 'extras',
      color: 'text-purple-600',
    },
    {
      title: 'Contamination',
      icon: AlertTriangle,
      value: formatPrice(POLICIES.contaminationFee),
      subtitle: 'Surcharge per incident',
      tab: 'warnings-caps',
      color: 'text-orange-600',
    },
  ];

  const quickNav = [
    { label: 'General Debris Config', tab: 'overview', icon: DollarSign },
    { label: 'Heavy Material Rates', tab: 'heavy-rates', icon: Scale },
    { label: 'Zone Surcharges', tab: 'zones', icon: MapPin },
    { label: 'Rush Delivery', tab: 'rush', icon: Zap },
    { label: 'Contractor Tiers', tab: 'contractor', icon: Users },
    { label: 'Extras Catalog', tab: 'extras', icon: Plus },
    { label: 'City SEO Display', tab: 'cities', icon: MapPin },
    { label: 'Pricing Simulator', tab: 'simulator', icon: Activity },
    { label: 'Health & Readiness', tab: 'readiness', icon: CheckCircle2 },
  ];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground">Pricing Overview</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Canonical pricing summary — all costs, fees, and rules managed from this hub.
        </p>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {summaryCards.map(card => {
          const Icon = card.icon;
          return (
            <Card
              key={card.title}
              className="cursor-pointer hover:border-primary/40 transition-colors"
              onClick={() => onNavigateTab(card.tab)}
            >
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                  <Icon className={`w-4 h-4 ${card.color}`} />
                  {card.title}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-2xl font-bold text-foreground">{card.value}</p>
                <p className="text-xs text-muted-foreground mt-1">{card.subtitle}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Heavy Materials Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium flex items-center gap-2">
            <Scale className="w-4 h-4 text-amber-600" />
            Heavy Material Price Matrix (V2 Model)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left py-2 text-muted-foreground font-medium">Group</th>
                  <th className="text-left py-2 text-muted-foreground font-medium">$/yd</th>
                  {heavySizes.map(s => (
                    <th key={s} className="text-right py-2 text-muted-foreground font-medium">{s}yd</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEAVY_MATERIAL_GROUPS.map(g => (
                  <tr key={g.id} className="border-b border-border/50">
                    <td className="py-2 font-medium text-foreground">{g.label}</td>
                    <td className="py-2 text-muted-foreground">{formatPrice(g.dumpFeePerYard)}</td>
                    {heavySizes.map(s => (
                      <td key={s} className="text-right py-2 font-mono text-foreground">
                        {formatPrice(calculateHeavyTotalPrice(s, g.id))}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr>
                  <td className="py-2 text-xs text-muted-foreground" colSpan={2}>Service Cost →</td>
                  {heavySizes.map(s => (
                    <td key={s} className="text-right py-2 text-xs text-muted-foreground font-mono">
                      {formatPrice(HEAVY_SERVICE_COSTS[s])}
                    </td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
          <p className="text-xs text-muted-foreground mt-2">
            Total = Service Cost + (Size × Dump Fee/yd). Formula: V2 Service Cost + Dump Fee model.
          </p>
        </CardContent>
      </Card>

      {/* Quick Navigation */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Quick Navigation</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
            {quickNav.map(item => {
              const Icon = item.icon;
              return (
                <button
                  key={item.tab}
                  onClick={() => onNavigateTab(item.tab)}
                  className="flex items-center gap-2 px-3 py-2 rounded-md text-sm text-muted-foreground hover:bg-muted hover:text-foreground transition-colors text-left"
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  {item.label}
                </button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Policies Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Active Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Standard Rental</span>
            <Badge variant="outline">{POLICIES.standardRentalDays} days</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extra Day Fee</span>
            <Badge variant="outline">{formatPrice(POLICIES.extraDayCost)}/day</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overweight Rate</span>
            <Badge variant="outline">{formatPrice(POLICIES.overweightCostPerTon)}/ton</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Contamination Surcharge</span>
            <Badge variant="outline">{formatPrice(POLICIES.contaminationFee)}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Misdeclared Material</span>
            <Badge variant="outline">{formatPrice(POLICIES.misdeclaredMaterialFee)}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Trip Fee</span>
            <Badge variant="outline">{formatPrice(POLICIES.tripFee)}</Badge>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Relocation Fee</span>
            <Badge variant="outline">{formatPrice(POLICIES.relocationFee)}</Badge>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
