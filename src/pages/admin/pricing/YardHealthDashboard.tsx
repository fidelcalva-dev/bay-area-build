/**
 * Yard Health Dashboard — Admin QA tool
 * Shows canonical yard addresses, public vs internal references, mismatches,
 * and active location audit with fallback logic.
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, MapPin, Truck, Building2, Navigation } from 'lucide-react';
import { LOCATION_CONFIGS, type LocationConfig } from '@/config/locationConfig';

interface YardRecord {
  id: string;
  name: string;
  slug: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  latitude: number;
  longitude: number;
  market: string;
  is_active: boolean;
  priority_rank: number;
  service_radius_miles: number;
  base_delivery_fee: number;
  base_pickup_fee: number;
  base_fuel_cost: number;
  base_labor_cost: number;
  overhead_pct: number;
}

interface HealthCheck {
  label: string;
  status: 'ok' | 'warning' | 'error';
  detail: string;
  category: 'address' | 'coordinates' | 'config' | 'coverage' | 'sync';
}

// Canonical public references for verification
const CANONICAL_ADDRESSES: Record<string, string> = {
  oakland: '1000 46th Ave, Oakland, CA 94601',
  'san-jose': '2071 Ringwood Ave, San Jose, CA 95131',
};

const MAILING_ADDRESS = '1930 12th Ave #201, Oakland, CA 94606';

export default function YardHealthDashboard() {
  const [yards, setYards] = useState<YardRecord[]>([]);
  const [checks, setChecks] = useState<HealthCheck[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const { data } = await supabase.from('yards').select('*').order('priority_rank');
      const yardList: YardRecord[] = (data || []).map((y: any) => ({
        id: y.id, name: y.name, slug: y.slug, address: y.address || '',
        city: y.city || '', state: y.state || '', zip: y.zip || '',
        latitude: Number(y.latitude), longitude: Number(y.longitude),
        market: y.market || '', is_active: y.is_active,
        priority_rank: y.priority_rank, service_radius_miles: Number(y.service_radius_miles || 0),
        base_delivery_fee: Number(y.base_delivery_fee || 0),
        base_pickup_fee: Number(y.base_pickup_fee || 0),
        base_fuel_cost: Number(y.base_fuel_cost || 0),
        base_labor_cost: Number(y.base_labor_cost || 0),
        overhead_pct: Number(y.overhead_pct || 0),
      }));
      setYards(yardList);

      const healthChecks: HealthCheck[] = [];

      // 1. Verify no mailing address in yards table
      for (const yard of yardList) {
        if (yard.address.includes('1930 12th') || yard.address.includes('Suite 201')) {
          healthChecks.push({
            label: `${yard.name}: mailing address in yards table`,
            status: 'error',
            detail: `DB has "${yard.address}" — this is the MAILING address, not operational`,
            category: 'address',
          });
        }
      }

      // 2. Verify canonical addresses match
      for (const yard of yardList) {
        const canonical = CANONICAL_ADDRESSES[yard.slug];
        if (canonical) {
          const matches = yard.address?.includes(canonical.split(',')[0]);
          healthChecks.push({
            label: `${yard.name} address`,
            status: matches ? 'ok' : 'warning',
            detail: matches
              ? `DB matches canonical: ${yard.address}`
              : `DB: "${yard.address}" vs Canonical: "${canonical}"`,
            category: 'address',
          });
        }
      }

      // 3. Coordinates check
      for (const yard of yardList) {
        healthChecks.push({
          label: `${yard.name} coordinates`,
          status: yard.latitude !== 0 && yard.longitude !== 0 ? 'ok' : 'error',
          detail: `${yard.latitude.toFixed(4)}, ${yard.longitude.toFixed(4)}`,
          category: 'coordinates',
        });
      }

      // 4. locationConfig.ts sync check
      for (const yard of yardList) {
        const configMatch = LOCATION_CONFIGS.find(
          (l) => l.type === 'YARD' && (l.id.includes(yard.slug) || l.city.toLowerCase() === yard.city.toLowerCase())
        );
        if (configMatch) {
          const latDiff = Math.abs(configMatch.lat - yard.latitude);
          const lngDiff = Math.abs(configMatch.lng - yard.longitude);
          if (latDiff > 0.01 || lngDiff > 0.01) {
            healthChecks.push({
              label: `${yard.name} coord sync with locationConfig`,
              status: 'warning',
              detail: `DB: ${yard.latitude.toFixed(4)},${yard.longitude.toFixed(4)} vs Config: ${configMatch.lat.toFixed(4)},${configMatch.lng.toFixed(4)}`,
              category: 'sync',
            });
          } else {
            healthChecks.push({
              label: `${yard.name} config sync`,
              status: 'ok',
              detail: 'DB and locationConfig.ts coords aligned',
              category: 'sync',
            });
          }
        } else {
          healthChecks.push({
            label: `${yard.name} missing from locationConfig.ts`,
            status: 'warning',
            detail: `No matching entry in LOCATION_CONFIGS for slug "${yard.slug}"`,
            category: 'sync',
          });
        }
      }

      // 5. Check for config entries not in DB
      const dbYardSlugs = yardList.map(y => y.slug);
      for (const config of LOCATION_CONFIGS.filter(l => l.type === 'YARD')) {
        const matchesDB = dbYardSlugs.some(slug => config.id.includes(slug) || config.city.toLowerCase() === slug);
        if (!matchesDB) {
          healthChecks.push({
            label: `Config yard "${config.name}" not in database`,
            status: 'warning',
            detail: `locationConfig.ts has ${config.id} but no matching DB yard record`,
            category: 'sync',
          });
        }
      }

      // 6. Active/inactive check
      for (const yard of yardList) {
        healthChecks.push({
          label: `${yard.name} active`,
          status: yard.is_active ? 'ok' : 'warning',
          detail: yard.is_active ? 'Active' : 'Inactive',
          category: 'config',
        });
      }

      // 7. Cost config check
      for (const yard of yardList) {
        const hasCosts = yard.base_delivery_fee > 0 && yard.base_pickup_fee > 0;
        healthChecks.push({
          label: `${yard.name} cost config`,
          status: hasCosts ? 'ok' : 'error',
          detail: hasCosts
            ? `Del: $${yard.base_delivery_fee} | Pick: $${yard.base_pickup_fee} | Fuel: $${yard.base_fuel_cost} | Labor: $${yard.base_labor_cost}`
            : 'Missing cost configuration',
          category: 'config',
        });
      }

      setChecks(healthChecks);
      setLoading(false);
    }
    load();
  }, []);

  const statusIcon = (s: HealthCheck['status']) =>
    s === 'ok' ? <CheckCircle className="h-4 w-4 text-green-600" /> :
    s === 'warning' ? <AlertTriangle className="h-4 w-4 text-amber-600" /> :
    <AlertTriangle className="h-4 w-4 text-destructive" />;

  const errorCount = checks.filter(c => c.status === 'error').length;
  const warnCount = checks.filter(c => c.status === 'warning').length;
  const okCount = checks.filter(c => c.status === 'ok').length;

  if (loading) return <div className="p-6 text-muted-foreground">Loading yard health data...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Yard Health Dashboard</h1>
        <p className="text-muted-foreground">Canonical yard addresses, config sync, and pricing parameters</p>
      </div>

      {/* Summary Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{yards.length}</div>
          <div className="text-xs text-muted-foreground">DB Yards</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{yards.filter(y => y.is_active).length}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{okCount}</div>
          <div className="text-xs text-muted-foreground">Checks OK</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-amber-600">{warnCount}</div>
          <div className="text-xs text-muted-foreground">Warnings</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className={`text-2xl font-bold ${errorCount > 0 ? 'text-destructive' : 'text-green-600'}`}>{errorCount}</div>
          <div className="text-xs text-muted-foreground">Errors</div>
        </CardContent></Card>
      </div>

      {/* Canonical Address Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Address Model
          </CardTitle>
          <CardDescription>
            Mailing address is for public contact only. Operational yards drive pricing, dispatch, and routing.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
            <Badge variant="secondary" className="mt-0.5 shrink-0">MAILING</Badge>
            <div>
              <p className="text-sm font-medium text-foreground">{MAILING_ADDRESS}</p>
              <p className="text-xs text-muted-foreground">Public contact only. NOT used for pricing or dispatch.</p>
            </div>
          </div>
          {Object.entries(CANONICAL_ADDRESSES).map(([slug, addr]) => (
            <div key={slug} className="flex items-start gap-3 p-3 rounded-lg bg-muted/50">
              <Badge variant="default" className="mt-0.5 shrink-0">OPERATIONAL</Badge>
              <div>
                <p className="text-sm font-medium text-foreground">{addr}</p>
                <p className="text-xs text-muted-foreground">Slug: {slug} — Used for pricing, dispatch, and routing.</p>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>

      {/* Health Checks */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Health Checks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                {statusIcon(c.status)}
                <Badge variant="outline" className="text-xs shrink-0">{c.category}</Badge>
                <span className="font-medium text-sm text-foreground">{c.label}</span>
                <span className="text-xs text-muted-foreground ml-auto max-w-[50%] text-right truncate">{c.detail}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Yard Detail Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Yard Details</CardTitle></CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Yard</TableHead>
                <TableHead>Address</TableHead>
                <TableHead>Market</TableHead>
                <TableHead className="text-right">Radius</TableHead>
                <TableHead className="text-right">Delivery</TableHead>
                <TableHead className="text-right">Pickup</TableHead>
                <TableHead className="text-right">Overhead</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {yards.map(yard => (
                <TableRow key={yard.id}>
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      <Truck className="h-4 w-4 text-muted-foreground" />
                      {yard.name}
                    </div>
                    <span className="text-xs text-muted-foreground">#{yard.priority_rank}</span>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1 text-sm">
                      <MapPin className="h-3 w-3 text-muted-foreground shrink-0" />
                      <span>{yard.address || 'No address'}</span>
                    </div>
                    <span className="text-xs text-muted-foreground">{yard.latitude.toFixed(4)}, {yard.longitude.toFixed(4)}</span>
                  </TableCell>
                  <TableCell><Badge variant="outline">{yard.market}</Badge></TableCell>
                  <TableCell className="text-right">{yard.service_radius_miles} mi</TableCell>
                  <TableCell className="text-right font-mono">${yard.base_delivery_fee}</TableCell>
                  <TableCell className="text-right font-mono">${yard.base_pickup_fee}</TableCell>
                  <TableCell className="text-right">{yard.overhead_pct}%</TableCell>
                  <TableCell>
                    <Badge variant={yard.is_active ? 'default' : 'secondary'}>
                      {yard.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pricing Rules Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Navigation className="h-5 w-5" /> Distance Pricing Rules
          </CardTitle>
          <CardDescription>Per-mile cost and zone brackets from pricing_rules and distance_brackets tables</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Per-Mile Cost</div>
              <div className="font-bold text-foreground">$2.00/mi</div>
              <div className="text-xs text-muted-foreground">after 15mi threshold</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Base Delivery</div>
              <div className="font-bold text-foreground">$85</div>
              <div className="text-xs text-muted-foreground">pricing_rules default</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Base Pickup</div>
              <div className="font-bold text-foreground">$65</div>
              <div className="text-xs text-muted-foreground">pricing_rules default</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Surge Multiplier</div>
              <div className="font-bold text-foreground">1.08x</div>
              <div className="text-xs text-muted-foreground">at 85%+ utilization</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
