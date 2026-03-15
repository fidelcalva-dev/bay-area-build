/**
 * ZIP Health Dashboard — Admin QA tool
 * Shows all active ZIPs, assigned yards/zones/markets, and flags issues
 */
import { useState, useEffect, useMemo } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertTriangle, CheckCircle, Search } from 'lucide-react';

interface ZipRecord {
  zip_code: string;
  city_name: string | null;
  county: string | null;
  market_id: string | null;
  zone_name: string | null;
  zone_slug: string | null;
}

export default function ZipHealthDashboard() {
  const [zips, setZips] = useState<ZipRecord[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterMarket, setFilterMarket] = useState('all');
  const [filterIssue, setFilterIssue] = useState('all');
  const [fixing, setFixing] = useState(false);

  async function load() {
    const { data } = await supabase
      .from('zone_zip_codes')
      .select(`
        zip_code, city_name, county, market_id,
        zone:pricing_zones!inner(name, slug)
      `)
      .order('zip_code');

    const records: ZipRecord[] = (data || []).map((d: any) => ({
      zip_code: d.zip_code,
      city_name: d.city_name,
      county: d.county,
      market_id: d.market_id,
      zone_name: (d.zone as any)?.name || null,
      zone_slug: (d.zone as any)?.slug || null,
    }));
    setZips(records);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  // Auto-fix: assign market_id based on county for ZIPs missing it
  async function autoFixMarkets() {
    setFixing(true);
    const countyMarketMap: Record<string, string> = {
      'Alameda': 'oakland_east_bay',
      'Contra Costa': 'oakland_east_bay',
      'Marin': 'oakland_east_bay',
      'Napa': 'oakland_east_bay',
      'Solano': 'oakland_east_bay',
      'Sonoma': 'oakland_east_bay',
      'San Francisco': 'san_francisco_peninsula',
      'San Mateo': 'san_francisco_peninsula',
      'Santa Clara': 'san_jose_south_bay',
    };
    const toFix = zips.filter(z => !z.market_id && z.county && countyMarketMap[z.county]);
    for (const z of toFix) {
      await supabase
        .from('zone_zip_codes')
        .update({ market_id: countyMarketMap[z.county!] })
        .eq('zip_code', z.zip_code);
    }
    await load();
    setFixing(false);
  }

  const markets = useMemo(() => {
    const m = new Set(zips.map(z => z.market_id || 'unassigned'));
    return ['all', ...Array.from(m).sort()];
  }, [zips]);

  const stats = useMemo(() => {
    const total = zips.length;
    const noMarket = zips.filter(z => !z.market_id).length;
    const noCity = zips.filter(z => !z.city_name).length;
    const dups = zips.length - new Set(zips.map(z => z.zip_code)).size;
    return { total, noMarket, noCity, dups };
  }, [zips]);

  const filtered = useMemo(() => {
    return zips.filter(z => {
      if (search && !z.zip_code.includes(search) && !(z.city_name || '').toLowerCase().includes(search.toLowerCase())) return false;
      if (filterMarket !== 'all' && (z.market_id || 'unassigned') !== filterMarket) return false;
      if (filterIssue === 'no-market' && z.market_id) return false;
      if (filterIssue === 'no-city' && z.city_name) return false;
      return true;
    });
  }, [zips, search, filterMarket, filterIssue]);

  if (loading) return <div className="p-6 text-muted-foreground">Loading ZIP data...</div>;

  return (
    <div className="space-y-6 p-4 md:p-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">ZIP Health Dashboard</h1>
        <p className="text-muted-foreground">Active ZIPs, market assignments, and coverage gaps</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{stats.total}</div>
            <div className="text-xs text-muted-foreground">Total ZIPs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.noMarket}</div>
            <div className="text-xs text-muted-foreground">No Market ID</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-amber-600">{stats.noCity}</div>
            <div className="text-xs text-muted-foreground">No City Name</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className={`text-2xl font-bold ${stats.dups > 0 ? 'text-destructive' : 'text-green-600'}`}>{stats.dups}</div>
            <div className="text-xs text-muted-foreground">Duplicates</div>
          </CardContent>
        </Card>
      </div>

      {/* Actions */}
      {stats.noMarket > 0 && (
        <div className="flex items-center gap-3 p-3 rounded-lg bg-amber-50 border border-amber-200">
          <AlertTriangle className="h-5 w-5 text-amber-600 shrink-0" />
          <span className="text-sm text-amber-800 flex-1">{stats.noMarket} ZIPs missing market assignment</span>
          <button
            onClick={autoFixMarkets}
            disabled={fixing}
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-amber-600 text-white hover:bg-amber-700 disabled:opacity-50"
          >
            {fixing ? 'Fixing...' : 'Auto-Fix by County'}
          </button>
        </div>
      )}

      {/* Filters */}
      <div className="flex gap-3 flex-wrap">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search ZIP or city..." value={search} onChange={e => setSearch(e.target.value)} className="pl-9" />
        </div>
        <Select value={filterMarket} onValueChange={setFilterMarket}>
          <SelectTrigger className="w-[200px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            {markets.map(m => <SelectItem key={m} value={m}>{m === 'all' ? 'All Markets' : m}</SelectItem>)}
          </SelectContent>
        </Select>
        <Select value={filterIssue} onValueChange={setFilterIssue}>
          <SelectTrigger className="w-[160px]"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Issues</SelectItem>
            <SelectItem value="no-market">No Market</SelectItem>
            <SelectItem value="no-city">No City</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardHeader><CardTitle className="text-lg">ZIP Codes ({filtered.length})</CardTitle></CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-3">ZIP</th>
                  <th className="py-2 pr-3">City</th>
                  <th className="py-2 pr-3">County</th>
                  <th className="py-2 pr-3">Market</th>
                  <th className="py-2 pr-3">Zone</th>
                  <th className="py-2">Status</th>
                </tr>
              </thead>
              <tbody>
                {filtered.slice(0, 200).map((z, i) => (
                  <tr key={i} className="border-b border-border/50 last:border-0">
                    <td className="py-1.5 pr-3 font-mono text-foreground">{z.zip_code}</td>
                    <td className="py-1.5 pr-3 text-foreground">{z.city_name || <span className="text-amber-600 italic">—</span>}</td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{z.county || '—'}</td>
                    <td className="py-1.5 pr-3">
                      {z.market_id ? (
                        <Badge variant="outline" className="text-xs">{z.market_id}</Badge>
                      ) : (
                        <Badge variant="secondary" className="text-xs text-amber-700">unassigned</Badge>
                      )}
                    </td>
                    <td className="py-1.5 pr-3 text-muted-foreground">{z.zone_name || '—'}</td>
                    <td className="py-1.5">
                      {z.market_id && z.city_name ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filtered.length > 200 && (
              <p className="text-xs text-muted-foreground mt-2">Showing first 200 of {filtered.length} results</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
