/**
 * Facility / Dump Site Cost Dashboard — Admin QA tool
 * Shows all disposal sites, material acceptance, cost models, and flags mismatches
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { CheckCircle, AlertTriangle, Building2, Scale, Truck } from 'lucide-react';
import { POLICIES } from '@/config/pricingConfig';

interface DisposalSite {
  id: string;
  name: string;
  city: string;
  state: string;
  lat: number | null;
  lng: number | null;
  type: string;
  materials_accepted: string[];
  is_active: boolean;
  dump_fee_per_ton: number;
  flat_rate_json: Record<string, number>;
  clean_only_flag: boolean;
  mixed_allowed_flag: boolean;
  green_halo_supported_flag: boolean;
  contamination_surcharge: number;
  reroute_surcharge: number;
}

interface DumpFeeProfile {
  id: string;
  market_code: string;
  material_category: string;
  material_stream: string | null;
  dump_cost_model: string;
  default_cost_per_ton: number | null;
  default_cost_per_load: number | null;
  min_charge: number | null;
  facility_name: string | null;
  notes: string | null;
  is_active: boolean;
}

export default function FacilityCostDashboard() {
  const [sites, setSites] = useState<DisposalSite[]>([]);
  const [profiles, setProfiles] = useState<DumpFeeProfile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function load() {
      const [sitesRes, profilesRes] = await Promise.all([
        supabase.from('disposal_sites').select('*').order('name'),
        supabase.from('dump_fee_profiles').select('*').eq('is_active', true).order('market_code'),
      ]);
      setSites((sitesRes.data || []).map((s: any) => ({
        ...s,
        dump_fee_per_ton: Number(s.dump_fee_per_ton || 0),
        flat_rate_json: (s.flat_rate_json as Record<string, number>) || {},
        contamination_surcharge: Number(s.contamination_surcharge || 0),
        reroute_surcharge: Number(s.reroute_surcharge || 0),
      })));
      setProfiles((profilesRes.data || []) as DumpFeeProfile[]);
      setLoading(false);
    }
    load();
  }, []);

  const activeSites = sites.filter(s => s.is_active);
  const cleanFillSites = activeSites.filter(s => s.clean_only_flag);
  const generalSites = activeSites.filter(s => !s.clean_only_flag);
  const surchargeConsistent = activeSites.every(
    s => s.contamination_surcharge === POLICIES.contaminationFee && s.reroute_surcharge === POLICIES.misdeclaredMaterialFee
  );

  if (loading) return <div className="p-6 text-muted-foreground">Loading facility data...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Facility Cost Dashboard</h1>
        <p className="text-muted-foreground">Disposal sites, cost models, and material acceptance audit</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{sites.length}</div>
          <div className="text-xs text-muted-foreground">Total Sites</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-green-600">{activeSites.length}</div>
          <div className="text-xs text-muted-foreground">Active</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{cleanFillSites.length}</div>
          <div className="text-xs text-muted-foreground">Clean Fill</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{generalSites.length}</div>
          <div className="text-xs text-muted-foreground">General / C&D</div>
        </CardContent></Card>
        <Card><CardContent className="p-4 text-center">
          <div className={`text-2xl font-bold ${surchargeConsistent ? 'text-green-600' : 'text-destructive'}`}>
            {surchargeConsistent ? 'OK' : 'MISMATCH'}
          </div>
          <div className="text-xs text-muted-foreground">Surcharge Sync</div>
        </CardContent></Card>
      </div>

      {/* Disposal Sites Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Building2 className="h-5 w-5" /> Disposal Sites (disposal_sites)
          </CardTitle>
          <CardDescription>Used by the Smart Pricing Engine for dump site selection and cost calculation</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Facility</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Materials</TableHead>
                <TableHead className="text-right">$/ton</TableHead>
                <TableHead>Flat Rates</TableHead>
                <TableHead className="text-right">Contam.</TableHead>
                <TableHead className="text-right">Reroute</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sites.map(site => (
                <TableRow key={site.id}>
                  <TableCell className="font-medium">{site.name}</TableCell>
                  <TableCell>{site.city}</TableCell>
                  <TableCell>
                    <Badge variant={site.clean_only_flag ? 'default' : 'outline'}>
                      {site.type}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-wrap gap-1">
                      {site.materials_accepted.map(m => (
                        <Badge key={m} variant="secondary" className="text-xs">{m}</Badge>
                      ))}
                    </div>
                  </TableCell>
                  <TableCell className="text-right font-mono">${site.dump_fee_per_ton}</TableCell>
                  <TableCell>
                    {Object.keys(site.flat_rate_json).length > 0 ? (
                      <div className="text-xs">
                        {Object.entries(site.flat_rate_json).map(([k, v]) => (
                          <span key={k} className="mr-2">{k}yd: ${v}</span>
                        ))}
                      </div>
                    ) : <span className="text-muted-foreground text-xs">—</span>}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={site.contamination_surcharge !== POLICIES.contaminationFee ? 'text-destructive' : ''}>
                      ${site.contamination_surcharge}
                    </span>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    <span className={site.reroute_surcharge !== POLICIES.misdeclaredMaterialFee ? 'text-destructive' : ''}>
                      ${site.reroute_surcharge}
                    </span>
                  </TableCell>
                  <TableCell>
                    <Badge variant={site.is_active ? 'default' : 'secondary'}>
                      {site.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Dump Fee Profiles */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <Scale className="h-5 w-5" /> Dump Fee Profiles (dump_fee_profiles)
          </CardTitle>
          <CardDescription>Market-level cost assumptions used for margin calculations in LocationPricingManager</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Category</TableHead>
                <TableHead>Stream</TableHead>
                <TableHead>Model</TableHead>
                <TableHead className="text-right">Rate</TableHead>
                <TableHead className="text-right">Min Charge</TableHead>
                <TableHead>Facility</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-medium">{p.market_code}</TableCell>
                  <TableCell><Badge variant="outline">{p.material_category}</Badge></TableCell>
                  <TableCell className="text-sm">{p.material_stream || '—'}</TableCell>
                  <TableCell>
                    <Badge variant={p.dump_cost_model === 'PER_TON' ? 'default' : 'secondary'}>
                      {p.dump_cost_model === 'PER_TON' ? 'Per Ton' : 'Per Load'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {p.dump_cost_model === 'PER_TON'
                      ? `$${p.default_cost_per_ton || 0}/ton`
                      : `$${p.default_cost_per_load || 0}/load`}
                  </TableCell>
                  <TableCell className="text-right font-mono">
                    {p.min_charge ? `$${p.min_charge}` : '—'}
                  </TableCell>
                  <TableCell className="text-sm text-muted-foreground">{p.facility_name || '—'}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Pricing Policy Reference */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Canonical Pricing Policy (pricingConfig.ts)</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Contamination Fee</div>
              <div className="font-bold text-foreground">${POLICIES.contaminationFee}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Reroute Fee</div>
              <div className="font-bold text-foreground">${POLICIES.misdeclaredMaterialFee}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Overage Per Ton</div>
              <div className="font-bold text-foreground">${POLICIES.overweightCostPerTon}</div>
            </div>
            <div className="p-3 rounded-lg bg-muted/50">
              <div className="text-xs text-muted-foreground">Green Halo/Ton</div>
              <div className="font-bold text-foreground">${POLICIES.greenHaloSurchargePerTon}</div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
