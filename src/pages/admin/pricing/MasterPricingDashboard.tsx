// ══════════════════════════════════════════════════════════════
// MASTER PRICING DASHBOARD — Unified pricing overview
// Single-screen summary of all pricing configuration + health
// ══════════════════════════════════════════════════════════════

import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DollarSign, Package, Scale, MapPin, Truck, Users, Plus, AlertTriangle,
  CheckCircle, XCircle, ExternalLink, RefreshCw, Gauge, ChevronRight,
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { GENERAL_DEBRIS_SIZES, HEAVY_ALLOWED_SIZES } from '@/config/pricingConfig';
import {
  HEAVY_MATERIAL_GROUPS,
  HEAVY_SERVICE_COSTS,
  calculateHeavyTotalPrice,
  type HeavySize,
} from '@/config/heavyMaterialConfig';

interface PricingRow {
  size_yd: number;
  material_type: string;
  market_code: string;
  total_price: number;
  included_tons: number;
  is_active: boolean;
}

interface MarketRow {
  id: string;
  name: string;
  status: string;
}

interface YardRow {
  id: string;
  name: string;
  is_active: boolean;
}

interface HealthCheck {
  label: string;
  status: 'ok' | 'warn' | 'error';
  detail: string;
}

export default function MasterPricingDashboard() {
  const navigate = useNavigate();
  const [pricing, setPricing] = useState<PricingRow[]>([]);
  const [markets, setMarkets] = useState<MarketRow[]>([]);
  const [yards, setYards] = useState<YardRow[]>([]);
  const [zipCount, setZipCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [pricingRes, marketsRes, yardsRes, zipRes] = await Promise.all([
        supabase.from('dumpster_pricing').select('size_yd, material_type, market_code, total_price, included_tons, is_active').eq('is_active', true),
        supabase.from('markets').select('id, name, status'),
        supabase.from('yards').select('id, name, is_active'),
        supabase.from('zone_zip_codes').select('id', { count: 'exact', head: true }),
      ]);
      setPricing((pricingRes.data || []) as PricingRow[]);
      setMarkets((marketsRes.data || []) as MarketRow[]);
      setYards((yardsRes.data || []) as YardRow[]);
      setZipCount(zipRes.count || 0);
      setLoading(false);
    }
    load();
  }, []);

  const activeMarkets = markets.filter(m => m.status === 'active');
  const activeYards = yards.filter(y => y.is_active);
  const generalPricing = pricing.filter(p => p.material_type === 'general');
  const heavyPricing = pricing.filter(p => p.material_type === 'heavy');

  // Health checks
  const healthChecks: HealthCheck[] = [];
  
  // Check all 7 general sizes exist per active market
  const expectedGeneralSizes = [5, 8, 10, 20, 30, 40, 50];
  for (const market of activeMarkets) {
    const marketGeneral = generalPricing.filter(p => p.market_code === market.id);
    const missingSizes = expectedGeneralSizes.filter(s => !marketGeneral.some(p => p.size_yd === s));
    if (missingSizes.length > 0) {
      healthChecks.push({ label: `${market.name} general`, status: 'error', detail: `Missing sizes: ${missingSizes.join(', ')}yd` });
    } else {
      healthChecks.push({ label: `${market.name} general`, status: 'ok', detail: `${marketGeneral.length} sizes configured` });
    }
  }

  // Check heavy sizes per market
  const expectedHeavySizes = [5, 8, 10];
  for (const market of activeMarkets) {
    const marketHeavy = heavyPricing.filter(p => p.market_code === market.id);
    const missingSizes = expectedHeavySizes.filter(s => !marketHeavy.some(p => p.size_yd === s));
    if (missingSizes.length > 0) {
      healthChecks.push({ label: `${market.name} heavy`, status: 'error', detail: `Missing sizes: ${missingSizes.join(', ')}yd` });
    } else {
      healthChecks.push({ label: `${market.name} heavy`, status: 'ok', detail: `${marketHeavy.length} sizes configured` });
    }
  }

  if (activeYards.length === 0) {
    healthChecks.push({ label: 'Yards', status: 'error', detail: 'No active yards' });
  } else {
    healthChecks.push({ label: 'Yards', status: 'ok', detail: `${activeYards.length} active` });
  }

  if (zipCount === 0) {
    healthChecks.push({ label: 'ZIP Codes', status: 'warn', detail: 'No ZIP codes mapped' });
  } else {
    healthChecks.push({ label: 'ZIP Codes', status: 'ok', detail: `${zipCount} mapped` });
  }

  const okCount = healthChecks.filter(h => h.status === 'ok').length;
  const score = healthChecks.length > 0 ? Math.round((okCount / healthChecks.length) * 100) : 0;

  const quickLinks = [
    { label: 'Base Pricing', path: '/admin/pricing/locations', icon: DollarSign },
    { label: 'Sizes & Materials', path: '/admin/pricing', icon: Package },
    { label: 'Heavy Pricing', path: '/admin/heavy-pricing', icon: Scale },
    { label: 'Zone Surcharges', path: '/admin/pricing/zone-surcharges', icon: MapPin },
    { label: 'City Display ZIPs', path: '/admin/pricing/city-display-zips', icon: MapPin },
    { label: 'Contractor Tiers', path: '/admin/pricing/contractor-pricing', icon: Users },
    { label: 'Extras Catalog', path: '/admin/pricing/extras-catalog', icon: Plus },
    { label: 'Rush Delivery', path: '/admin/pricing/rush-delivery', icon: Truck },
    { label: 'Pricing Readiness', path: '/admin/pricing/readiness', icon: Gauge },
    { label: 'Pricing Simulator', path: '/admin/pricing/simulator', icon: RefreshCw },
  ];

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Master Pricing Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Unified overview of all pricing configuration across markets, materials, and sizes
        </p>
      </div>

      {/* Health Score */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4 text-center">
            <div className={`text-3xl font-bold ${score >= 80 ? 'text-green-600' : score >= 50 ? 'text-amber-600' : 'text-red-600'}`}>
              {score}%
            </div>
            <div className="text-xs text-muted-foreground mt-1">Health Score</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{activeMarkets.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Active Markets</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{activeYards.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Active Yards</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{pricing.length}</div>
            <div className="text-xs text-muted-foreground mt-1">Price Rows</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 text-center">
            <div className="text-3xl font-bold text-foreground">{zipCount}</div>
            <div className="text-xs text-muted-foreground mt-1">ZIP Codes</div>
          </CardContent>
        </Card>
      </div>

      {/* General Debris Pricing Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Package className="w-5 h-5" />
            General Debris Base Pricing
          </CardTitle>
          <CardDescription>7-day rental, overage at $165/ton</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Size</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Tons</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">Config</th>
                  {activeMarkets.map(m => (
                    <th key={m.id} className="text-center py-2 px-3 font-medium text-muted-foreground">{m.name.split('/')[0].trim()}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {expectedGeneralSizes.map(size => {
                  const configSize = GENERAL_DEBRIS_SIZES.find(s => s.size === size);
                  return (
                    <tr key={size} className="border-b border-border/50 hover:bg-muted/30">
                      <td className="py-2 px-3 font-semibold">{size} yd</td>
                      <td className="py-2 px-3 text-center">{configSize?.includedTons ?? '–'}T</td>
                      <td className="py-2 px-3 text-center font-mono">${configSize?.price ?? '–'}</td>
                      {activeMarkets.map(m => {
                        const row = generalPricing.find(p => p.market_code === m.id && p.size_yd === size);
                        return (
                          <td key={m.id} className="py-2 px-3 text-center font-mono">
                            {row ? `$${row.total_price}` : <span className="text-red-500">–</span>}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Heavy Material Pricing Table */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="w-5 h-5" />
            Heavy Material Pricing (V2 — Service Cost + Dump Fee)
          </CardTitle>
          <CardDescription>
            Flat-fee, disposal included. Service: 5yd=$290, 8yd=$340, 10yd=$390
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-2 px-3 font-medium text-muted-foreground">Group</th>
                  <th className="text-center py-2 px-3 font-medium text-muted-foreground">$/yd</th>
                  {expectedHeavySizes.map(s => (
                    <th key={s} className="text-center py-2 px-3 font-medium text-muted-foreground">{s} yd</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {HEAVY_MATERIAL_GROUPS.filter(g => g.id !== 'OTHER_HEAVY').map(group => (
                  <tr key={group.id} className="border-b border-border/50 hover:bg-muted/30">
                    <td className="py-2 px-3">
                      <div className="font-semibold">{group.label}</div>
                      <div className="text-xs text-muted-foreground">{group.materials.join(', ')}</div>
                    </td>
                    <td className="py-2 px-3 text-center font-mono">${group.dumpFeePerYard}</td>
                    {expectedHeavySizes.map(size => (
                      <td key={size} className="py-2 px-3 text-center font-mono font-semibold">
                        ${calculateHeavyTotalPrice(size as HeavySize, group.id)}
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <div className="mt-4 grid grid-cols-3 gap-3">
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Service Costs</div>
              <div className="font-mono text-sm mt-1">
                5yd=${HEAVY_SERVICE_COSTS[5]} · 8yd=${HEAVY_SERVICE_COSTS[8]} · 10yd=${HEAVY_SERVICE_COSTS[10]}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">DB Prices (Oakland)</div>
              <div className="font-mono text-sm mt-1">
                {expectedHeavySizes.map(s => {
                  const row = heavyPricing.find(p => p.market_code === 'oakland_east_bay' && p.size_yd === s);
                  return `${s}yd=$${row?.total_price ?? '–'}`;
                }).join(' · ')}
              </div>
            </div>
            <div className="bg-muted/50 rounded-lg p-3 text-center">
              <div className="text-xs text-muted-foreground">Formula</div>
              <div className="text-xs mt-1">Total = ServiceCost + (Size × DumpFee/yd)</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Health Checks */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <Gauge className="w-5 h-5" />
            Configuration Health
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
            {healthChecks.map((check, i) => (
              <div key={i} className="flex items-center gap-2 p-2 rounded-lg bg-muted/30">
                {check.status === 'ok' && <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />}
                {check.status === 'warn' && <AlertTriangle className="w-4 h-4 text-amber-500 shrink-0" />}
                {check.status === 'error' && <XCircle className="w-4 h-4 text-red-500 shrink-0" />}
                <div className="min-w-0">
                  <div className="text-sm font-medium truncate">{check.label}</div>
                  <div className="text-xs text-muted-foreground truncate">{check.detail}</div>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Links */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Pricing Admin Center</CardTitle>
          <CardDescription>Manage all pricing configuration without code changes</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
            {quickLinks.map(link => (
              <Button
                key={link.path}
                variant="outline"
                className="h-auto py-3 px-3 flex flex-col items-center gap-1.5 text-xs"
                onClick={() => navigate(link.path)}
              >
                <link.icon className="w-4 h-4" />
                {link.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}