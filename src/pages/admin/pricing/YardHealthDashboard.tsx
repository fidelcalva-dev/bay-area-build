/**
 * Yard Health Dashboard — Admin QA tool
 * Shows canonical yard addresses, public vs internal references, and mismatches
 */
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertTriangle, MapPin, Truck } from 'lucide-react';

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
}

interface HealthCheck {
  label: string;
  status: 'ok' | 'warning' | 'error';
  detail: string;
}

const PUBLIC_YARD_REFS: Record<string, string> = {
  oakland: '1000 46th Ave, Oakland, CA 94601',
  'san-jose': '2071 Ringwood Ave, San Jose, CA 95131',
};

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
      }));
      setYards(yardList);

      // Run health checks
      const healthChecks: HealthCheck[] = [];
      for (const yard of yardList) {
        const publicRef = PUBLIC_YARD_REFS[yard.slug];
        if (publicRef) {
          const matches = yard.address?.includes(publicRef.split(',')[0]);
          healthChecks.push({
            label: `${yard.name} address`,
            status: matches ? 'ok' : 'warning',
            detail: matches
              ? `DB matches public: ${yard.address}`
              : `DB: "${yard.address}" vs Public: "${publicRef}"`,
          });
        }
        healthChecks.push({
          label: `${yard.name} coordinates`,
          status: yard.latitude !== 0 && yard.longitude !== 0 ? 'ok' : 'error',
          detail: `${yard.latitude}, ${yard.longitude}`,
        });
        healthChecks.push({
          label: `${yard.name} active`,
          status: yard.is_active ? 'ok' : 'warning',
          detail: yard.is_active ? 'Active' : 'Inactive',
        });
      }

      // Check for missing yards
      for (const slug of Object.keys(PUBLIC_YARD_REFS)) {
        if (!yardList.find(y => y.slug === slug)) {
          healthChecks.push({
            label: `Missing yard: ${slug}`,
            status: 'error',
            detail: `Public references exist but no DB record found`,
          });
        }
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

  if (loading) return <div className="p-6 text-muted-foreground">Loading yard health data...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Yard Health Dashboard</h1>
        <p className="text-muted-foreground">Canonical yard addresses, public vs internal references</p>
      </div>

      {/* Health Checks */}
      <Card>
        <CardHeader><CardTitle className="text-lg">Health Checks</CardTitle></CardHeader>
        <CardContent>
          <div className="space-y-2">
            {checks.map((c, i) => (
              <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                {statusIcon(c.status)}
                <span className="font-medium text-sm text-foreground">{c.label}</span>
                <span className="text-xs text-muted-foreground ml-auto max-w-[60%] text-right truncate">{c.detail}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Yard Cards */}
      <div className="grid gap-4 md:grid-cols-2">
        {yards.map(yard => (
          <Card key={yard.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base flex items-center gap-2">
                  <Truck className="h-4 w-4" /> {yard.name}
                </CardTitle>
                <Badge variant={yard.is_active ? 'default' : 'secondary'}>
                  {yard.is_active ? 'Active' : 'Inactive'}
                </Badge>
              </div>
            </CardHeader>
            <CardContent className="text-sm space-y-1 text-muted-foreground">
              <p className="flex items-center gap-1"><MapPin className="h-3 w-3" /> {yard.address || 'No address set'}</p>
              <p>Market: {yard.market}</p>
              <p>Priority: #{yard.priority_rank} • Radius: {yard.service_radius_miles} mi</p>
              <p>Coords: {yard.latitude.toFixed(4)}, {yard.longitude.toFixed(4)}</p>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
