import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { useToast } from '@/hooks/use-toast';
import { MapPin, RefreshCw, Settings, AlertTriangle } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { getAdsMode, setAdsMode, type AdsMarket } from '@/lib/adsService';

export default function AdsMarketsPage() {
  const [markets, setMarkets] = useState<AdsMarket[]>([]);
  const [adsMode, setLocalAdsMode] = useState<'DRY_RUN' | 'LIVE'>('DRY_RUN');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [mode, { data: marketsData }] = await Promise.all([
        getAdsMode(),
        supabase.from('ads_markets' as any).select('*').order('priority')
      ]);
      
      setLocalAdsMode(mode);
      setMarkets((marketsData || []) as unknown as AdsMarket[]);
    } catch (error) {
      toast({ title: 'Error loading data', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  }

  async function handleModeSwitch(newMode: 'DRY_RUN' | 'LIVE') {
    setSaving(true);
    try {
      await setAdsMode(newMode);
      setLocalAdsMode(newMode);
      toast({
        title: `Ads mode switched to ${newMode}`,
        description: newMode === 'LIVE' 
          ? 'Campaigns will now sync with Google Ads API' 
          : 'Changes will only be saved to DB'
      });
    } catch (error) {
      toast({ title: 'Failed to switch mode', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  async function updateMarket(id: string, updates: Partial<AdsMarket>) {
    const { error } = await (supabase.from('ads_markets' as any) as any)
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      toast({ title: 'Failed to update market', variant: 'destructive' });
    } else {
      toast({ title: 'Market updated' });
      loadData();
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex items-center justify-center">
        <RefreshCw className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Ads Markets</h1>
          <p className="text-muted-foreground">Configure markets for Google Ads campaigns</p>
        </div>
        <Button onClick={loadData} variant="outline" size="sm">
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Ads Mode Control */}
      <Card className="border-amber-200 bg-amber-50/50 dark:border-amber-900 dark:bg-amber-950/20">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-2">
            <Settings className="w-5 h-5 text-amber-600" />
            <CardTitle className="text-lg">Ads Engine Mode</CardTitle>
          </div>
          <CardDescription>
            Control whether the ads engine syncs with Google Ads API or only updates the database
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-3">
              <Label htmlFor="ads-mode" className={adsMode === 'DRY_RUN' ? 'font-bold text-amber-700' : 'text-muted-foreground'}>
                DRY_RUN
              </Label>
              <Switch
                id="ads-mode"
                checked={adsMode === 'LIVE'}
                onCheckedChange={(checked) => handleModeSwitch(checked ? 'LIVE' : 'DRY_RUN')}
                disabled={saving}
              />
              <Label htmlFor="ads-mode" className={adsMode === 'LIVE' ? 'font-bold text-green-700' : 'text-muted-foreground'}>
                LIVE
              </Label>
            </div>
            <Badge variant={adsMode === 'LIVE' ? 'default' : 'secondary'}>
              {adsMode === 'LIVE' ? 'Syncing with Google Ads' : 'DB Only'}
            </Badge>
          </div>
          {adsMode === 'DRY_RUN' && (
            <p className="text-sm text-amber-700 mt-3 flex items-center gap-2">
              <AlertTriangle className="w-4 h-4" />
              Campaigns are NOT being synced with Google Ads. Switch to LIVE to enable real ad delivery.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Markets Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MapPin className="w-5 h-5" />
            Active Markets
          </CardTitle>
          <CardDescription>
            Configure thresholds for inventory-based campaign management
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>City</TableHead>
                <TableHead>Daily Budget</TableHead>
                <TableHead>Inventory Threshold</TableHead>
                <TableHead>Utilization Thresholds</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {markets.map((market) => (
                <TableRow key={market.id}>
                  <TableCell className="font-medium">{market.market_code}</TableCell>
                  <TableCell>{market.city}</TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <span>$</span>
                      <Input
                        type="number"
                        value={market.daily_budget}
                        onChange={(e) => updateMarket(market.id, { daily_budget: Number(e.target.value) })}
                        className="w-20 h-8"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Input
                      type="number"
                      value={market.inventory_threshold}
                      onChange={(e) => updateMarket(market.id, { inventory_threshold: Number(e.target.value) })}
                      className="w-16 h-8"
                    />
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2 text-sm">
                      <span className="text-muted-foreground">Core:</span>
                      <Input
                        type="number"
                        value={market.utilization_premium_threshold}
                        onChange={(e) => updateMarket(market.id, { utilization_premium_threshold: Number(e.target.value) })}
                        className="w-14 h-7 text-xs"
                      />
                      <span className="text-muted-foreground">Premium:</span>
                      <Input
                        type="number"
                        value={market.utilization_pause_threshold}
                        onChange={(e) => updateMarket(market.id, { utilization_pause_threshold: Number(e.target.value) })}
                        className="w-14 h-7 text-xs"
                      />
                    </div>
                  </TableCell>
                  <TableCell>
                    <Switch
                      checked={market.is_active}
                      onCheckedChange={(checked) => updateMarket(market.id, { is_active: checked })}
                    />
                  </TableCell>
                </TableRow>
              ))}
              {markets.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center text-muted-foreground py-8">
                    No markets configured. Add markets to start generating campaigns.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
