import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
  BarChart3, TrendingUp, Search, MapPin, Phone, Globe, MousePointer,
  Navigation, Image, RefreshCw, Users, Clock, Target, Percent,
} from 'lucide-react';
import { toast } from 'sonner';

type DateRange = '7' | '30' | '90';

export default function MarketingDashboard() {
  const [dateRange, setDateRange] = useState<DateRange>('30');
  const [market, setMarket] = useState('all');

  const startDate = new Date(Date.now() - parseInt(dateRange) * 86400000).toISOString().split('T')[0];
  const endDate = new Date().toISOString().split('T')[0];

  // GA4 Data
  const { data: ga4, isLoading: ga4Loading, refetch: refetchGA4 } = useQuery({
    queryKey: ['ga4-data', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('ga4-fetch', {
        body: { start_date: startDate, end_date: endDate },
      });
      if (error) throw error;
      return data;
    },
  });

  // GSC Data
  const { data: gsc, isLoading: gscLoading, refetch: refetchGSC } = useQuery({
    queryKey: ['gsc-data', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('gsc-fetch', {
        body: { start_date: startDate, end_date: endDate },
      });
      if (error) throw error;
      return data;
    },
  });

  // GBP Data
  const { data: gbp, isLoading: gbpLoading, refetch: refetchGBP } = useQuery({
    queryKey: ['gbp-data', dateRange],
    queryFn: async () => {
      const { data, error } = await supabase.functions.invoke('gbp-fetch-insights', {
        body: { start_date: startDate, end_date: endDate },
      });
      if (error) throw error;
      return data;
    },
  });

  const handleRefreshAll = () => {
    refetchGA4();
    refetchGSC();
    refetchGBP();
    toast.info('Refreshing all data...');
  };

  const ga4Data = ga4?.data;
  const gscData = gsc?.data;
  const gbpData = gbp?.data;
  const isAnyLoading = ga4Loading || gscLoading || gbpLoading;
  const currentMode = ga4?.mode || gsc?.mode || gbp?.mode || 'DRY_RUN';

  // Filter GBP by market
  const filteredGBPLocations = gbpData?.locations?.filter(
    (l: { market: string }) => market === 'all' || l.market.toLowerCase().includes(market.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Marketing Intelligence</h1>
          <p className="text-muted-foreground">GA4 · Search Console · Google Business Profile</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={currentMode === 'LIVE' ? 'default' : 'secondary'}>
            {currentMode}
          </Badge>
          <Select value={market} onValueChange={setMarket}>
            <SelectTrigger className="w-[140px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              <SelectItem value="oakland">Oakland</SelectItem>
              <SelectItem value="san jose">San Jose</SelectItem>
              <SelectItem value="san francisco">San Francisco</SelectItem>
            </SelectContent>
          </Select>
          <Select value={dateRange} onValueChange={(v) => setDateRange(v as DateRange)}>
            <SelectTrigger className="w-[120px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7">Last 7 days</SelectItem>
              <SelectItem value="30">Last 30 days</SelectItem>
              <SelectItem value="90">Last 90 days</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline" size="sm" onClick={handleRefreshAll} disabled={isAnyLoading}>
            <RefreshCw className={`h-4 w-4 mr-1 ${isAnyLoading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <MetricCard icon={<Users className="h-4 w-4" />} title="Sessions" value={ga4Data?.sessions ?? '—'} />
        <MetricCard icon={<Target className="h-4 w-4" />} title="Quotes Started" value={ga4Data?.conversions?.quote_started ?? '—'} />
        <MetricCard icon={<Search className="h-4 w-4" />} title="Organic Clicks" value={gscData?.totals?.clicks ?? '—'} />
        <MetricCard icon={<Percent className="h-4 w-4" />} title="Avg Position" value={gscData?.totals?.position ? gscData.totals.position.toFixed(1) : '—'} />
        <MetricCard icon={<Phone className="h-4 w-4" />} title="GBP Calls" value={gbpData?.totals?.calls ?? '—'} />
        <MetricCard icon={<MousePointer className="h-4 w-4" />} title="GBP Website Clicks" value={gbpData?.totals?.website_clicks ?? '—'} />
        <MetricCard icon={<Navigation className="h-4 w-4" />} title="GBP Directions" value={gbpData?.totals?.direction_requests ?? '—'} />
        <MetricCard icon={<Image className="h-4 w-4" />} title="GBP Photo Views" value={gbpData?.totals?.photo_views ?? '—'} />
      </div>

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="ga4">GA4 Traffic</TabsTrigger>
          <TabsTrigger value="gsc">Search Console</TabsTrigger>
          <TabsTrigger value="gbp">Business Profile</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* GA4 Summary */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <BarChart3 className="h-4 w-4" /> GA4 Summary
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ga4Loading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between"><span>Users</span><span className="font-medium">{ga4Data?.users?.toLocaleString() ?? '—'}</span></div>
                    <div className="flex justify-between"><span>Sessions</span><span className="font-medium">{ga4Data?.sessions?.toLocaleString() ?? '—'}</span></div>
                    <div className="flex justify-between"><span>Engagement Rate</span><span className="font-medium">{ga4Data?.engagement_rate ? (ga4Data.engagement_rate * 100).toFixed(1) + '%' : '—'}</span></div>
                    <div className="flex justify-between"><span>Bounce Rate</span><span className="font-medium">{ga4Data?.bounce_rate ? (ga4Data.bounce_rate * 100).toFixed(1) + '%' : '—'}</span></div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Conversion Funnel */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" /> Quote Funnel
                </CardTitle>
              </CardHeader>
              <CardContent>
                {ga4Loading ? <p className="text-muted-foreground text-sm">Loading...</p> : (
                  <div className="space-y-2 text-sm">
                    <FunnelRow label="Quote Started" value={ga4Data?.conversions?.quote_started} />
                    <FunnelRow label="Quote Completed" value={ga4Data?.conversions?.quote_completed} />
                    <FunnelRow label="Click to Call" value={ga4Data?.conversions?.click_call} />
                    <FunnelRow label="Payment Started" value={ga4Data?.conversions?.payment_started} />
                    <FunnelRow label="Payment Completed" value={ga4Data?.conversions?.payment_completed} />
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="ga4" className="space-y-4 mt-4">
          <div className="grid md:grid-cols-2 gap-4">
            {/* Traffic Sources */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Traffic Sources</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Source / Medium</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ga4Data?.traffic_sources?.map((t: { source: string; medium: string; sessions: number }, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm">{t.source} / {t.medium}</TableCell>
                        <TableCell className="text-right font-medium">{t.sessions}</TableCell>
                      </TableRow>
                    )) ?? <TableRow><TableCell colSpan={2} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Top Pages */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Top Pages</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead className="text-right">Sessions</TableHead>
                      <TableHead className="text-right">Avg Time (s)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {ga4Data?.top_pages?.map((p: { page: string; sessions: number; avg_time: number }, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm font-mono">{p.page}</TableCell>
                        <TableCell className="text-right">{p.sessions}</TableCell>
                        <TableCell className="text-right">{p.avg_time}s</TableCell>
                      </TableRow>
                    )) ?? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gsc" className="space-y-4 mt-4">
          {/* GSC Totals */}
          <div className="grid grid-cols-4 gap-4">
            <MetricCard icon={<MousePointer className="h-4 w-4" />} title="Total Clicks" value={gscData?.totals?.clicks ?? '—'} />
            <MetricCard icon={<Globe className="h-4 w-4" />} title="Impressions" value={gscData?.totals?.impressions?.toLocaleString() ?? '—'} />
            <MetricCard icon={<Percent className="h-4 w-4" />} title="CTR" value={gscData?.totals?.ctr ? (gscData.totals.ctr * 100).toFixed(1) + '%' : '—'} />
            <MetricCard icon={<TrendingUp className="h-4 w-4" />} title="Avg Position" value={gscData?.totals?.position?.toFixed(1) ?? '—'} />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            {/* Top Queries */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Top Search Queries</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Query</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Impr</TableHead>
                      <TableHead className="text-right">CTR</TableHead>
                      <TableHead className="text-right">Pos</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gscData?.queries?.map((q: { query: string; clicks: number; impressions: number; ctr: number; position: number }, i: number) => (
                      <TableRow key={i}>
                        <TableCell className="text-sm max-w-[200px] truncate">{q.query}</TableCell>
                        <TableCell className="text-right font-medium">{q.clicks}</TableCell>
                        <TableCell className="text-right">{q.impressions.toLocaleString()}</TableCell>
                        <TableCell className="text-right">{(q.ctr * 100).toFixed(1)}%</TableCell>
                        <TableCell className="text-right">{q.position.toFixed(1)}</TableCell>
                      </TableRow>
                    )) ?? <TableRow><TableCell colSpan={5} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Device Breakdown */}
            <Card>
              <CardHeader><CardTitle className="text-sm">Device Breakdown</CardTitle></CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Device</TableHead>
                      <TableHead className="text-right">Clicks</TableHead>
                      <TableHead className="text-right">Impressions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {gscData?.devices?.map((d: { device: string; clicks: number; impressions: number }, i: number) => (
                      <TableRow key={i}>
                        <TableCell>{d.device}</TableCell>
                        <TableCell className="text-right font-medium">{d.clicks}</TableCell>
                        <TableCell className="text-right">{d.impressions.toLocaleString()}</TableCell>
                      </TableRow>
                    )) ?? <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground">No data</TableCell></TableRow>}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="gbp" className="space-y-4 mt-4">
          {/* GBP Location Cards */}
          <div className="grid md:grid-cols-3 gap-4">
            {(filteredGBPLocations || gbpData?.locations)?.map((loc: {
              market: string;
              searches_shown: number;
              maps_views: number;
              search_views: number;
              website_clicks: number;
              calls: number;
              direction_requests: number;
              photo_views: number;
              messages: number;
            }, i: number) => (
              <Card key={i}>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-base">
                    <MapPin className="h-4 w-4" /> {loc.market}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 text-sm">
                  <div className="flex justify-between"><span>Searches Shown</span><span className="font-medium">{loc.searches_shown?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Maps Views</span><span className="font-medium">{loc.maps_views?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Search Views</span><span className="font-medium">{loc.search_views?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1"><MousePointer className="h-3 w-3" /> Website Clicks</span><span className="font-bold text-primary">{loc.website_clicks}</span></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1"><Phone className="h-3 w-3" /> Calls</span><span className="font-bold text-green-600">{loc.calls}</span></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1"><Navigation className="h-3 w-3" /> Directions</span><span className="font-bold">{loc.direction_requests}</span></div>
                  <div className="flex justify-between"><span className="flex items-center gap-1"><Image className="h-3 w-3" /> Photo Views</span><span className="font-medium">{loc.photo_views?.toLocaleString()}</span></div>
                  <div className="flex justify-between"><span>Messages</span><span className="font-medium">{loc.messages}</span></div>
                </CardContent>
              </Card>
            )) ?? (
              <Card>
                <CardContent className="py-8 text-center text-muted-foreground">
                  No GBP data available
                </CardContent>
              </Card>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}

function MetricCard({ icon, title, value }: { icon: React.ReactNode; title: string; value: string | number }) {
  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm font-medium flex items-center gap-1">
          {icon} {title}
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
}

function FunnelRow({ label, value }: { label: string; value?: number }) {
  return (
    <div className="flex justify-between items-center">
      <span>{label}</span>
      <span className="font-medium">{value ?? '—'}</span>
    </div>
  );
}
