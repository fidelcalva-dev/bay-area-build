import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  TrendingUp, DollarSign, MousePointer, Target, 
  AlertTriangle, CheckCircle, Clock, RefreshCw,
  Play, Pause, Loader2
} from 'lucide-react';
import { 
  getTodayMetricsSummary, 
  getAdsCampaigns, 
  getUnresolvedAlerts,
  getSyncLogs,
  getAdsMarkets,
  type AdsMetricsSummary,
  type AdsCampaign,
  type AdsAlert,
  type AdsMarket
} from '@/lib/adsService';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export default function AdsOverview() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningCapacityCheck, setIsRunningCapacityCheck] = useState(false);
  const [isGeneratingCampaigns, setIsGeneratingCampaigns] = useState(false);
  
  const [todayMetrics, setTodayMetrics] = useState<AdsMetricsSummary | null>(null);
  const [campaigns, setCampaigns] = useState<AdsCampaign[]>([]);
  const [alerts, setAlerts] = useState<AdsAlert[]>([]);
  const [markets, setMarkets] = useState<AdsMarket[]>([]);
  const [syncLogs, setSyncLogs] = useState<Array<{
    id: string;
    sync_type: string;
    status: string;
    records_processed: number;
    duration_ms: number | null;
    created_at: string;
  }>>([]);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const [metricsData, campaignsData, alertsData, marketsData, logsData] = await Promise.all([
        getTodayMetricsSummary(),
        getAdsCampaigns(),
        getUnresolvedAlerts(),
        getAdsMarkets(),
        getSyncLogs(10)
      ]);

      setTodayMetrics(metricsData);
      setCampaigns(campaignsData);
      setAlerts(alertsData);
      setMarkets(marketsData);
      setSyncLogs(logsData);
    } catch (error) {
      console.error('Failed to load ads data:', error);
      toast({
        title: 'Error loading data',
        description: 'Could not load ads dashboard data',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function runCapacityCheck() {
    try {
      setIsRunningCapacityCheck(true);
      const { data, error } = await supabase.functions.invoke('ads-capacity-guard');
      
      if (error) throw error;

      toast({
        title: 'Capacity Check Complete',
        description: `Checked ${data.markets_checked} markets. ${data.campaigns_paused} paused, ${data.campaigns_updated} updated.`
      });

      loadData();
    } catch (error) {
      console.error('Capacity check failed:', error);
      toast({
        title: 'Capacity Check Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsRunningCapacityCheck(false);
    }
  }

  async function generateCampaigns() {
    try {
      setIsGeneratingCampaigns(true);
      const { data, error } = await supabase.functions.invoke('ads-generate-campaigns');
      
      if (error) throw error;

      toast({
        title: 'Campaigns Generated',
        description: `Created ${data.campaigns_created} campaigns, ${data.adgroups_created} ad groups, ${data.ads_created} ads.`
      });

      loadData();
    } catch (error) {
      console.error('Campaign generation failed:', error);
      toast({
        title: 'Campaign Generation Failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive'
      });
    } finally {
      setIsGeneratingCampaigns(false);
    }
  }

  const activeCampaigns = campaigns.filter(c => c.status === 'active').length;
  const pausedCampaigns = campaigns.filter(c => c.status === 'paused' || c.status === 'capacity_paused').length;

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'active':
        return <Badge className="bg-green-500">Active</Badge>;
      case 'paused':
        return <Badge variant="secondary">Paused</Badge>;
      case 'capacity_paused':
        return <Badge className="bg-orange-500">Capacity Paused</Badge>;
      case 'draft':
        return <Badge variant="outline">Draft</Badge>;
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const getTierBadge = (tier: string) => {
    switch (tier) {
      case 'BASE':
        return <Badge variant="outline" className="text-green-600 border-green-600">BASE</Badge>;
      case 'CORE':
        return <Badge variant="outline" className="text-blue-600 border-blue-600">CORE</Badge>;
      case 'PREMIUM':
        return <Badge variant="outline" className="text-purple-600 border-purple-600">PREMIUM</Badge>;
      default:
        return <Badge variant="outline">{tier}</Badge>;
    }
  };

  if (isLoading) {
    return (
      <div className="p-6 flex items-center justify-center min-h-[400px]">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Ads Engine</h1>
          <p className="text-muted-foreground">
            AI-powered campaign management tied to inventory and pricing
          </p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={runCapacityCheck}
            disabled={isRunningCapacityCheck}
          >
            {isRunningCapacityCheck ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <RefreshCw className="w-4 h-4 mr-2" />
            )}
            Check Capacity
          </Button>
          <Button
            onClick={generateCampaigns}
            disabled={isGeneratingCampaigns}
          >
            {isGeneratingCampaigns ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Generate Campaigns
          </Button>
        </div>
      </div>

      {/* Alerts Banner */}
      {alerts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-orange-500" />
              <span className="font-medium text-orange-800">
                {alerts.length} unresolved alert{alerts.length !== 1 ? 's' : ''}
              </span>
            </div>
            <div className="mt-2 space-y-1">
              {alerts.slice(0, 3).map(alert => (
                <p key={alert.id} className="text-sm text-orange-700">
                  • {alert.title}: {alert.message}
                </p>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Today's Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Spend Today</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <DollarSign className="w-5 h-5 text-muted-foreground" />
              ${todayMetrics?.cost.toFixed(2) || '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Clicks Today</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <MousePointer className="w-5 h-5 text-muted-foreground" />
              {todayMetrics?.clicks || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Conversions</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Target className="w-5 h-5 text-muted-foreground" />
              {todayMetrics?.conversions || 0}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>CPA Today</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-muted-foreground" />
              ${todayMetrics?.cpa.toFixed(2) || '0.00'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Campaign Status */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Campaigns</CardDescription>
            <CardTitle className="text-3xl text-green-600 flex items-center gap-2">
              <Play className="w-6 h-6" />
              {activeCampaigns}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Paused Campaigns</CardDescription>
            <CardTitle className="text-3xl text-orange-600 flex items-center gap-2">
              <Pause className="w-6 h-6" />
              {pausedCampaigns}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Active Markets</CardDescription>
            <CardTitle className="text-3xl text-blue-600">
              {markets.filter(m => m.is_active).length}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="campaigns">
        <TabsList>
          <TabsTrigger value="campaigns">Campaigns</TabsTrigger>
          <TabsTrigger value="markets">Markets</TabsTrigger>
          <TabsTrigger value="sync">Sync Log</TabsTrigger>
        </TabsList>

        <TabsContent value="campaigns" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Campaign Overview</CardTitle>
              <CardDescription>
                Campaigns by market with status and messaging tier
              </CardDescription>
            </CardHeader>
            <CardContent>
              {campaigns.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>No campaigns created yet.</p>
                  <p className="text-sm">Click "Generate Campaigns" to create campaigns for active markets.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {campaigns.map(campaign => (
                    <div 
                      key={campaign.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div>
                        <p className="font-medium">{campaign.campaign_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {campaign.market_code} · ${campaign.daily_budget}/day
                        </p>
                        {campaign.pause_reason && (
                          <p className="text-xs text-orange-600 mt-1">
                            {campaign.pause_reason}
                          </p>
                        )}
                      </div>
                      <div className="flex items-center gap-2">
                        {getTierBadge(campaign.messaging_tier)}
                        {getStatusBadge(campaign.status)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="markets" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Markets Configuration</CardTitle>
              <CardDescription>
                Geographic targeting with inventory thresholds
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {markets.map(market => (
                  <div 
                    key={market.id} 
                    className="flex items-center justify-between p-3 border rounded-lg"
                  >
                    <div>
                      <p className="font-medium">{market.city}, {market.state}</p>
                      <p className="text-sm text-muted-foreground">
                        {market.market_code} · {market.zip_list.length} ZIPs · ${market.daily_budget}/day
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Pause threshold: {market.inventory_threshold} units · 
                        Premium at {market.utilization_premium_threshold}% utilization
                      </p>
                    </div>
                    <Badge variant={market.is_active ? 'default' : 'secondary'}>
                      {market.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sync" className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Sync History</CardTitle>
              <CardDescription>
                Recent automation runs and their results
              </CardDescription>
            </CardHeader>
            <CardContent>
              {syncLogs.length === 0 ? (
                <p className="text-center py-8 text-muted-foreground">
                  No sync logs yet
                </p>
              ) : (
                <div className="space-y-2">
                  {syncLogs.map(log => (
                    <div 
                      key={log.id} 
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        {log.status === 'completed' ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : log.status === 'failed' ? (
                          <AlertTriangle className="w-5 h-5 text-red-500" />
                        ) : (
                          <Clock className="w-5 h-5 text-blue-500" />
                        )}
                        <div>
                          <p className="font-medium capitalize">
                            {log.sync_type.replace('_', ' ')}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {new Date(log.created_at).toLocaleString()}
                          </p>
                        </div>
                      </div>
                      <div className="text-right text-sm">
                        <p>{log.records_processed} processed</p>
                        {log.duration_ms && (
                          <p className="text-muted-foreground">{log.duration_ms}ms</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
