import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useLeadChannels, useLeadStats } from '@/hooks/useLeadHub';
import { format, subDays } from 'date-fns';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import { 
  BarChart3, Settings, TrendingUp, TrendingDown, Users, 
  Inbox, ArrowRight, CheckCircle, XCircle, Activity
} from 'lucide-react';
import { toast } from 'sonner';

interface ChannelMetric {
  channel_key: string;
  total: number;
  new: number;
  converted: number;
  conversion_rate: number;
}

export default function AdminLeadsHub() {
  const [channelMetrics, setChannelMetrics] = useState<ChannelMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [updatingChannel, setUpdatingChannel] = useState<string | null>(null);

  const { channels, loading: channelsLoading } = useLeadChannels();
  const { stats: salesStats } = useLeadStats('sales');
  const { stats: csStats } = useLeadStats('cs');
  const { stats: allStats } = useLeadStats('all');

  useEffect(() => {
    async function fetchMetrics() {
      const sevenDaysAgo = subDays(new Date(), 7).toISOString();
      
      const { data: leads } = await supabase
        .from('sales_leads')
        .select('channel_key, lead_status')
        .gte('created_at', sevenDaysAgo);

      if (leads) {
        const metrics: Record<string, ChannelMetric> = {};
        
        leads.forEach(lead => {
          const key = lead.channel_key || 'unknown';
          if (!metrics[key]) {
            metrics[key] = { channel_key: key, total: 0, new: 0, converted: 0, conversion_rate: 0 };
          }
          metrics[key].total++;
          if (lead.lead_status === 'new') metrics[key].new++;
          if (lead.lead_status === 'booked') metrics[key].converted++;
        });

        // Calculate conversion rates
        Object.values(metrics).forEach(m => {
          m.conversion_rate = m.total > 0 ? Math.round((m.converted / m.total) * 100) : 0;
        });

        setChannelMetrics(Object.values(metrics).sort((a, b) => b.total - a.total));
      }
      setLoading(false);
    }

    fetchMetrics();
  }, []);

  const toggleChannel = async (channelKey: string, isActive: boolean) => {
    setUpdatingChannel(channelKey);
    
    const { error } = await supabase
      .from('lead_channels')
      .update({ is_active: isActive })
      .eq('channel_key', channelKey);

    if (error) {
      toast.error('Failed to update channel');
    } else {
      toast.success(`${channelKey} ${isActive ? 'enabled' : 'disabled'}`);
    }
    
    setUpdatingChannel(null);
  };

  const getChannelDisplay = (key: string) => {
    const channel = channels.find(c => c.channel_key === key);
    return channel ? `${channel.icon} ${channel.display_name}` : key;
  };

  const totalLeads = allStats.total;
  const conversionRate = totalLeads > 0 ? Math.round((allStats.booked / totalLeads) * 100) : 0;

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <BarChart3 className="h-6 w-6" />
            Lead Hub Admin
          </h1>
          <p className="text-muted-foreground">Channel health & conversion analytics</p>
        </div>
        <Button variant="outline">
          <Settings className="h-4 w-4 mr-2" />
          Settings
        </Button>
      </div>

      {/* Overview Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Inbox className="h-4 w-4 text-muted-foreground" />
              <span className="text-sm text-muted-foreground">Total Leads (7d)</span>
            </div>
            <p className="text-3xl font-bold">{totalLeads}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-green-500" />
              <span className="text-sm text-muted-foreground">Conversion Rate</span>
            </div>
            <p className="text-3xl font-bold text-green-600">{conversionRate}%</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-blue-500" />
              <span className="text-sm text-muted-foreground">Sales Pipeline</span>
            </div>
            <p className="text-3xl font-bold text-blue-600">{salesStats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-4 w-4 text-purple-500" />
              <span className="text-sm text-muted-foreground">CS Pipeline</span>
            </div>
            <p className="text-3xl font-bold text-purple-600">{csStats.total}</p>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Conversion Funnel</CardTitle>
          <CardDescription>Lead progression across all channels</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between gap-4">
            <div className="flex-1 text-center p-4 bg-blue-50 rounded-lg">
              <p className="text-sm text-muted-foreground">New</p>
              <p className="text-2xl font-bold text-blue-600">{allStats.new}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-center p-4 bg-yellow-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Contacted</p>
              <p className="text-2xl font-bold text-yellow-600">{allStats.contacted}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-center p-4 bg-green-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Qualified</p>
              <p className="text-2xl font-bold text-green-600">{allStats.qualified}</p>
            </div>
            <ArrowRight className="h-5 w-5 text-muted-foreground" />
            <div className="flex-1 text-center p-4 bg-emerald-50 rounded-lg">
              <p className="text-sm text-muted-foreground">Booked</p>
              <p className="text-2xl font-bold text-emerald-600">{allStats.booked}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Channel Performance */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Channel Performance (7 days)</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : channelMetrics.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No lead data in the last 7 days
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Channel</TableHead>
                  <TableHead className="text-right">Total</TableHead>
                  <TableHead className="text-right">New</TableHead>
                  <TableHead className="text-right">Converted</TableHead>
                  <TableHead className="text-right">Conv. Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {channelMetrics.map((metric) => (
                  <TableRow key={metric.channel_key}>
                    <TableCell className="font-medium">
                      {getChannelDisplay(metric.channel_key)}
                    </TableCell>
                    <TableCell className="text-right">{metric.total}</TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-blue-50">
                        {metric.new}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Badge variant="outline" className="bg-green-50">
                        {metric.converted}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <span className={metric.conversion_rate >= 10 ? 'text-green-600' : 'text-muted-foreground'}>
                        {metric.conversion_rate}%
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Channel Configuration */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Channel Configuration</CardTitle>
          <CardDescription>Enable or disable lead sources</CardDescription>
        </CardHeader>
        <CardContent>
          {channelsLoading ? (
            <div className="space-y-2">
              {[...Array(5)].map((_, i) => (
                <Skeleton key={i} className="h-12 w-full" />
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {channels.map((channel) => (
                <div
                  key={channel.channel_key}
                  className="flex items-center justify-between p-4 border rounded-lg"
                >
                  <div className="flex items-center gap-3">
                    <span className="text-xl">{channel.icon}</span>
                    <div>
                      <p className="font-medium">{channel.display_name}</p>
                      <p className="text-xs text-muted-foreground">{channel.channel_key}</p>
                    </div>
                  </div>
                  <Switch
                    checked={channel.is_active}
                    disabled={updatingChannel === channel.channel_key}
                    onCheckedChange={(checked) => toggleChannel(channel.channel_key, checked)}
                  />
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
