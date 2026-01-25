import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { 
  Table, TableBody, TableCell, TableHead, 
  TableHeader, TableRow 
} from '@/components/ui/table';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { 
  Play, Pause, MoreVertical, Loader2, 
  TrendingUp, DollarSign, MousePointer
} from 'lucide-react';
import { 
  getAdsCampaigns, 
  getAdsMarkets,
  updateCampaignStatus,
  updateCampaignMessagingTier,
  getCampaignMetrics,
  type AdsCampaign,
  type AdsMarket,
  type AdsMetricsSummary
} from '@/lib/adsService';
import { useToast } from '@/hooks/use-toast';
import { format, subDays } from 'date-fns';

export default function AdsCampaigns() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [campaigns, setCampaigns] = useState<AdsCampaign[]>([]);
  const [markets, setMarkets] = useState<AdsMarket[]>([]);
  const [selectedMarket, setSelectedMarket] = useState<string>('all');
  const [campaignMetrics, setCampaignMetrics] = useState<Record<string, AdsMetricsSummary>>({});

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    try {
      setIsLoading(true);
      const [campaignsData, marketsData] = await Promise.all([
        getAdsCampaigns(),
        getAdsMarkets()
      ]);

      setCampaigns(campaignsData);
      setMarkets(marketsData);

      // Load metrics for each campaign (last 7 days)
      const endDate = format(new Date(), 'yyyy-MM-dd');
      const startDate = format(subDays(new Date(), 7), 'yyyy-MM-dd');
      
      const metricsPromises = campaignsData.map(async (campaign) => {
        try {
          const metrics = await getCampaignMetrics(campaign.id, startDate, endDate);
          return { id: campaign.id, metrics };
        } catch {
          return { id: campaign.id, metrics: null };
        }
      });

      const metricsResults = await Promise.all(metricsPromises);
      const metricsMap: Record<string, AdsMetricsSummary> = {};
      metricsResults.forEach(result => {
        if (result.metrics) {
          metricsMap[result.id] = result.metrics;
        }
      });
      setCampaignMetrics(metricsMap);

    } catch (error) {
      console.error('Failed to load campaigns:', error);
      toast({
        title: 'Error loading campaigns',
        variant: 'destructive'
      });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleStatusChange(campaignId: string, newStatus: 'active' | 'paused') {
    try {
      await updateCampaignStatus(campaignId, newStatus);
      toast({
        title: 'Campaign updated',
        description: `Campaign ${newStatus === 'active' ? 'activated' : 'paused'}`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Failed to update campaign',
        variant: 'destructive'
      });
    }
  }

  async function handleTierChange(campaignId: string, tier: 'BASE' | 'CORE' | 'PREMIUM') {
    try {
      await updateCampaignMessagingTier(campaignId, tier);
      toast({
        title: 'Messaging tier updated',
        description: `Campaign switched to ${tier} tier`
      });
      loadData();
    } catch (error) {
      toast({
        title: 'Failed to update tier',
        variant: 'destructive'
      });
    }
  }

  const filteredCampaigns = selectedMarket === 'all' 
    ? campaigns 
    : campaigns.filter(c => c.market_code === selectedMarket);

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
          <h1 className="text-2xl font-bold">Campaigns</h1>
          <p className="text-muted-foreground">
            Manage campaigns by market with status and messaging tier controls
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Select value={selectedMarket} onValueChange={setSelectedMarket}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filter by market" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Markets</SelectItem>
              {markets.map(market => (
                <SelectItem key={market.market_code} value={market.market_code}>
                  {market.city}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Campaigns Table */}
      <Card>
        <CardHeader>
          <CardTitle>Campaign Performance</CardTitle>
          <CardDescription>Last 7 days metrics</CardDescription>
        </CardHeader>
        <CardContent>
          {filteredCampaigns.length === 0 ? (
            <p className="text-center py-8 text-muted-foreground">
              No campaigns found
            </p>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Campaign</TableHead>
                  <TableHead>Market</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Tier</TableHead>
                  <TableHead className="text-right">Spend</TableHead>
                  <TableHead className="text-right">Clicks</TableHead>
                  <TableHead className="text-right">Conv.</TableHead>
                  <TableHead className="text-right">CPA</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredCampaigns.map(campaign => {
                  const metrics = campaignMetrics[campaign.id];
                  return (
                    <TableRow key={campaign.id}>
                      <TableCell>
                        <div>
                          <p className="font-medium">{campaign.campaign_name}</p>
                          <p className="text-xs text-muted-foreground">
                            ${campaign.daily_budget}/day
                          </p>
                        </div>
                      </TableCell>
                      <TableCell>{campaign.market_code}</TableCell>
                      <TableCell>{getStatusBadge(campaign.status)}</TableCell>
                      <TableCell>{getTierBadge(campaign.messaging_tier)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <DollarSign className="w-3 h-3 text-muted-foreground" />
                          {metrics?.cost.toFixed(2) || '0.00'}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <MousePointer className="w-3 h-3 text-muted-foreground" />
                          {metrics?.clicks || 0}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        {metrics?.conversions || 0}
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex items-center justify-end gap-1">
                          <TrendingUp className="w-3 h-3 text-muted-foreground" />
                          ${metrics?.cpa.toFixed(2) || '0.00'}
                        </div>
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreVertical className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            {campaign.status === 'active' ? (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(campaign.id, 'paused')}
                              >
                                <Pause className="w-4 h-4 mr-2" />
                                Pause Campaign
                              </DropdownMenuItem>
                            ) : (
                              <DropdownMenuItem 
                                onClick={() => handleStatusChange(campaign.id, 'active')}
                              >
                                <Play className="w-4 h-4 mr-2" />
                                Activate Campaign
                              </DropdownMenuItem>
                            )}
                            <DropdownMenuItem 
                              onClick={() => handleTierChange(campaign.id, 'BASE')}
                            >
                              Switch to BASE
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleTierChange(campaign.id, 'CORE')}
                            >
                              Switch to CORE
                            </DropdownMenuItem>
                            <DropdownMenuItem 
                              onClick={() => handleTierChange(campaign.id, 'PREMIUM')}
                            >
                              Switch to PREMIUM
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
