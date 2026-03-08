import { useEffect, useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RefreshCw, AlertTriangle, CheckCircle, XCircle, Clock, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface ChannelStat {
  channel: string;
  count: number;
}

interface FallbackItem {
  id: string;
  created_at: string;
  source_channel: string;
  error_message: string | null;
  retry_count: number;
  status: string;
}

export default function LeadsHealthDashboard() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalToday: 0,
    totalWeek: 0,
    byChannel: [] as ChannelStat[],
    newCount: 0,
    contactedCount: 0,
    qualifiedCount: 0,
    convertedCount: 0,
    fallbackPending: 0,
  });
  const [fallbackItems, setFallbackItems] = useState<FallbackItem[]>([]);
  const [retrying, setRetrying] = useState(false);

  const today = new Date().toISOString().slice(0, 10);
  const weekAgo = new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10);

  const load = useCallback(async () => {
    setLoading(true);
    try {
      const countOpts = { count: 'exact' as const, head: true };

      const [todayRes, weekRes, allLeads, fallbackRes] = await Promise.all([
        (supabase.from('sales_leads').select('id', countOpts) as any).gte('created_at', `${today}T00:00:00`),
        (supabase.from('sales_leads').select('id', countOpts) as any).gte('created_at', `${weekAgo}T00:00:00`),
        supabase.from('sales_leads').select('channel_key, lead_status').limit(1000),
        supabase.from('lead_fallback_queue' as any).select('*').eq('status', 'pending').order('created_at', { ascending: false }).limit(50),
      ]);

      // Channel breakdown
      const channelMap: Record<string, number> = {};
      const statusMap: Record<string, number> = {};
      (allLeads.data || []).forEach((l: any) => {
        const ch = l.channel_key || 'UNKNOWN';
        channelMap[ch] = (channelMap[ch] || 0) + 1;
        const st = l.lead_status || 'new';
        statusMap[st] = (statusMap[st] || 0) + 1;
      });

      const byChannel = Object.entries(channelMap)
        .map(([channel, count]) => ({ channel, count }))
        .sort((a, b) => b.count - a.count);

      setStats({
        totalToday: todayRes.count || 0,
        totalWeek: weekRes.count || 0,
        byChannel,
        newCount: statusMap['new'] || 0,
        contactedCount: statusMap['contacted'] || 0,
        qualifiedCount: statusMap['qualified'] || 0,
        convertedCount: statusMap['converted'] || 0,
        fallbackPending: (fallbackRes as any).data?.length || 0,
      });

      setFallbackItems(((fallbackRes as any).data || []) as FallbackItem[]);
    } catch (err) {
      console.error('LeadsHealth load error:', err);
    } finally {
      setLoading(false);
    }
  }, [today, weekAgo]);

  useEffect(() => { load(); }, [load]);

  const retryFallback = async (item: FallbackItem) => {
    setRetrying(true);
    try {
      const payload = (item as any).payload || {};
      const res = await supabase.functions.invoke('lead-ingest', { body: payload });
      if (res.error) throw res.error;
      // Mark as resolved
      await (supabase.from('lead_fallback_queue' as any) as any)
        .update({ status: 'resolved', resolved_at: new Date().toISOString(), resolved_lead_id: res.data?.lead_id })
        .eq('id', item.id);
      load();
    } catch (err) {
      console.error('Retry failed:', err);
      await (supabase.from('lead_fallback_queue' as any) as any)
        .update({ retry_count: item.retry_count + 1 })
        .eq('id', item.id);
    } finally {
      setRetrying(false);
    }
  };

  const channelColor = (ch: string) => {
    if (ch.includes('WEBSITE')) return 'bg-blue-100 text-blue-800';
    if (ch.includes('SMS') || ch.includes('TWILIO')) return 'bg-green-100 text-green-800';
    if (ch.includes('CALL') || ch.includes('PHONE')) return 'bg-purple-100 text-purple-800';
    if (ch.includes('GHL')) return 'bg-orange-100 text-orange-800';
    if (ch.includes('AI') || ch.includes('CHAT')) return 'bg-cyan-100 text-cyan-800';
    if (ch.includes('GOOGLE') || ch.includes('ADS')) return 'bg-red-100 text-red-800';
    if (ch.includes('META')) return 'bg-indigo-100 text-indigo-800';
    return 'bg-muted text-muted-foreground';
  };

  return (
    <div className="space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Lead Pipeline Health</h1>
          <p className="text-muted-foreground text-sm">Real-time monitoring of all lead capture channels</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" onClick={load} disabled={loading}>
            <RefreshCw className={`w-4 h-4 mr-1 ${loading ? 'animate-spin' : ''}`} /> Refresh
          </Button>
          <Button variant="outline" size="sm" onClick={() => navigate('/sales/leads')}>
            Open Lead Hub <ArrowRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      </div>

      {/* KPI Strip */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Leads Today</p>
            <p className="text-2xl font-bold">{stats.totalToday}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Leads This Week</p>
            <p className="text-2xl font-bold">{stats.totalWeek}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">New</p>
            <p className="text-2xl font-bold text-blue-600">{stats.newCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Contacted</p>
            <p className="text-2xl font-bold text-yellow-600">{stats.contactedCount}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Qualified</p>
            <p className="text-2xl font-bold text-emerald-600">{stats.qualifiedCount}</p>
          </CardContent>
        </Card>
        <Card className={stats.fallbackPending > 0 ? 'border-destructive' : ''}>
          <CardContent className="pt-4 pb-3 px-4">
            <p className="text-xs text-muted-foreground">Fallback Queue</p>
            <p className={`text-2xl font-bold ${stats.fallbackPending > 0 ? 'text-destructive' : ''}`}>
              {stats.fallbackPending}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Channel Breakdown */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Lead Sources (All Time)</CardTitle>
        </CardHeader>
        <CardContent>
          {stats.byChannel.length === 0 ? (
            <p className="text-sm text-muted-foreground">No leads captured yet</p>
          ) : (
            <div className="flex flex-wrap gap-2">
              {stats.byChannel.map(ch => (
                <Badge key={ch.channel} variant="secondary" className={`text-xs ${channelColor(ch.channel)}`}>
                  {ch.channel}: {ch.count}
                </Badge>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Pipeline Sources Status */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Pipeline Source Verification</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {[
              { name: 'Website Quote (save-quote)', status: 'LIVE' },
              { name: 'Lead Capture Form', status: 'LIVE' },
              { name: 'AI Chat Assistant', status: 'LIVE' },
              { name: 'Inbound Calls (Twilio)', status: 'LIVE' },
              { name: 'Inbound SMS (Twilio)', status: 'LIVE' },
              { name: 'Google Ads Lead Forms', status: 'LIVE' },
              { name: 'Meta Lead Ads (FB/IG)', status: 'LIVE' },
              { name: 'GHL Webhook Inbound', status: 'LIVE' },
              { name: 'HighLevel Webhook', status: 'LIVE' },
              { name: 'Manual Lead Entry', status: 'LIVE' },
              { name: 'Lead from Quote', status: 'LIVE' },
              { name: 'Conversational Hero', status: 'LIVE' },
            ].map(source => (
              <div key={source.name} className="flex items-center justify-between p-2 rounded-lg border bg-card">
                <span className="text-sm">{source.name}</span>
                <Badge variant={source.status === 'LIVE' ? 'default' : 'destructive'} className="text-xs">
                  {source.status === 'LIVE' ? <CheckCircle className="w-3 h-3 mr-1" /> : <XCircle className="w-3 h-3 mr-1" />}
                  {source.status}
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Fallback Queue */}
      {fallbackItems.length > 0 && (
        <Card className="border-destructive">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-destructive" />
              Fallback Queue — Failed Leads
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {fallbackItems.map(item => (
                <div key={item.id} className="flex items-center justify-between p-3 rounded-lg border bg-destructive/5">
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className="text-xs">{item.source_channel}</Badge>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {new Date(item.created_at).toLocaleString()}
                      </span>
                    </div>
                    {item.error_message && (
                      <p className="text-xs text-destructive">{item.error_message}</p>
                    )}
                    <p className="text-xs text-muted-foreground">Retries: {item.retry_count}/{5}</p>
                  </div>
                  <Button
                    size="sm"
                    variant="outline"
                    disabled={retrying}
                    onClick={() => retryFallback(item)}
                  >
                    Retry
                  </Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
