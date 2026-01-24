/**
 * Markets Manager - Admin page for managing service markets
 * Markets are the primary key for operations, pricing, and facilities
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, Plus, Settings, Search, Building2, Truck, 
  DollarSign, Package, BarChart3, Edit, MoreHorizontal,
  CheckCircle, AlertCircle, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getAllMarkets,
  getAllMarketRates,
  upsertMarket,
  upsertMarketRates,
  getMarketStats,
  getZipsForMarket,
  getUnassignedZips,
  assignZipsToMarket,
  MARKET_STATUS_LABELS,
  MARKET_STATUS_COLORS,
  type Market,
  type MarketRates,
  type ZipMarketMapping,
} from '@/lib/marketService';
import { supabase } from '@/integrations/supabase/client';

export default function MarketsManager() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const [search, setSearch] = useState('');
  const [showAddDialog, setShowAddDialog] = useState(false);
  const [showRatesDialog, setShowRatesDialog] = useState(false);
  const [showZipsDialog, setShowZipsDialog] = useState(false);
  const [selectedMarket, setSelectedMarket] = useState<Market | null>(null);
  
  const [marketForm, setMarketForm] = useState({
    id: '',
    name: '',
    status: 'active' as Market['status'],
    default_yard_id: '',
    timezone: 'America/Los_Angeles',
    notes: '',
  });

  const [ratesForm, setRatesForm] = useState({
    extra_ton_rate_standard: 165,
    prepay_discount_pct: 5,
    heavy_base_10yd: 638,
    mixed_small_overage_rate: 30,
  });

  // Fetch markets
  const { data: markets = [], isLoading } = useQuery({
    queryKey: ['markets-admin'],
    queryFn: getAllMarkets,
  });

  // Fetch market rates
  const { data: rates = [] } = useQuery({
    queryKey: ['market-rates-admin'],
    queryFn: getAllMarketRates,
  });

  // Fetch yards for default selection
  const { data: yards = [] } = useQuery({
    queryKey: ['yards-for-markets'],
    queryFn: async () => {
      const { data } = await supabase
        .from('yards')
        .select('id, name')
        .eq('is_active', true)
        .order('name');
      return data || [];
    },
  });

  // Fetch unassigned ZIPs
  const { data: unassignedZips = [] } = useQuery({
    queryKey: ['unassigned-zips'],
    queryFn: getUnassignedZips,
  });

  // Get rates for a market
  const getRatesForMarket = (marketId: string) => 
    rates.find(r => r.market_id === marketId);

  // Filter markets
  const filteredMarkets = markets.filter(m =>
    m.name.toLowerCase().includes(search.toLowerCase()) ||
    m.id.toLowerCase().includes(search.toLowerCase())
  );

  // Save market mutation
  const saveMarket = useMutation({
    mutationFn: async (data: typeof marketForm) => {
      const result = await upsertMarket({
        id: data.id,
        name: data.name,
        status: data.status,
        default_yard_id: data.default_yard_id || null,
        timezone: data.timezone,
        notes: data.notes || null,
      });
      if (!result.success) throw new Error(result.error);
      
      // Create default rates if new market
      const existingRates = rates.find(r => r.market_id === data.id);
      if (!existingRates) {
        await upsertMarketRates({ market_id: data.id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['markets-admin'] });
      queryClient.invalidateQueries({ queryKey: ['market-rates-admin'] });
      setShowAddDialog(false);
      toast({ title: 'Market saved successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error saving market', description: error.message, variant: 'destructive' });
    },
  });

  // Save rates mutation
  const saveRates = useMutation({
    mutationFn: async (data: typeof ratesForm & { market_id: string }) => {
      const result = await upsertMarketRates(data);
      if (!result.success) throw new Error(result.error);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['market-rates-admin'] });
      setShowRatesDialog(false);
      toast({ title: 'Rates updated successfully' });
    },
    onError: (error) => {
      toast({ title: 'Error saving rates', description: error.message, variant: 'destructive' });
    },
  });

  const handleAddMarket = () => {
    setSelectedMarket(null);
    setMarketForm({
      id: '',
      name: '',
      status: 'active',
      default_yard_id: '',
      timezone: 'America/Los_Angeles',
      notes: '',
    });
    setShowAddDialog(true);
  };

  const handleEditMarket = (market: Market) => {
    setSelectedMarket(market);
    setMarketForm({
      id: market.id,
      name: market.name,
      status: market.status,
      default_yard_id: market.default_yard_id || '',
      timezone: market.timezone,
      notes: market.notes || '',
    });
    setShowAddDialog(true);
  };

  const handleEditRates = (market: Market) => {
    setSelectedMarket(market);
    const marketRates = getRatesForMarket(market.id);
    setRatesForm({
      extra_ton_rate_standard: marketRates?.extra_ton_rate_standard || 165,
      prepay_discount_pct: marketRates?.prepay_discount_pct || 5,
      heavy_base_10yd: marketRates?.heavy_base_10yd || 638,
      mixed_small_overage_rate: marketRates?.mixed_small_overage_rate || 30,
    });
    setShowRatesDialog(true);
  };

  const handleManageZips = (market: Market) => {
    setSelectedMarket(market);
    setShowZipsDialog(true);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active':
        return <CheckCircle className="w-4 h-4 text-green-600" />;
      case 'inactive':
        return <AlertCircle className="w-4 h-4 text-gray-500" />;
      case 'coming_soon':
        return <Clock className="w-4 h-4 text-blue-500" />;
      default:
        return null;
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold">Markets Manager</h1>
          <p className="text-muted-foreground">
            Manage service markets - the primary key for pricing, facilities, and operations
          </p>
        </div>
        <Button onClick={handleAddMarket}>
          <Plus className="w-4 h-4 mr-2" />
          Add Market
        </Button>
      </div>

      {/* Unassigned ZIPs Warning */}
      {unassignedZips.length > 0 && (
        <Card className="border-amber-200 bg-amber-50">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-800">
                  {unassignedZips.length} ZIPs without market assignment
                </p>
                <p className="text-sm text-amber-700">
                  These ZIPs will flag for manual review. Assign them to a market below.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <MapPin className="w-4 h-4 text-primary" />
              </div>
              <div>
                <div className="text-2xl font-bold">{markets.length}</div>
                <div className="text-sm text-muted-foreground">Total Markets</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-green-100">
                <CheckCircle className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-green-600">
                  {markets.filter(m => m.status === 'active').length}
                </div>
                <div className="text-sm text-muted-foreground">Active</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-100">
                <Clock className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-blue-600">
                  {markets.filter(m => m.status === 'coming_soon').length}
                </div>
                <div className="text-sm text-muted-foreground">Coming Soon</div>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-amber-100">
                <AlertCircle className="w-4 h-4 text-amber-600" />
              </div>
              <div>
                <div className="text-2xl font-bold text-amber-600">
                  {unassignedZips.length}
                </div>
                <div className="text-sm text-muted-foreground">Unassigned ZIPs</div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <CardContent className="p-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search markets..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9"
            />
          </div>
        </CardContent>
      </Card>

      {/* Markets Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Market</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Rates</TableHead>
                <TableHead>Default Yard</TableHead>
                <TableHead className="w-[50px]"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    Loading markets...
                  </TableCell>
                </TableRow>
              ) : filteredMarkets.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No markets found
                  </TableCell>
                </TableRow>
              ) : (
                filteredMarkets.map((market) => {
                  const marketRates = getRatesForMarket(market.id);
                  const yard = yards.find(y => y.id === market.default_yard_id);

                  return (
                    <TableRow key={market.id}>
                      <TableCell>
                        <div className="space-y-1">
                          <div className="font-medium">{market.name}</div>
                          <div className="text-xs text-muted-foreground font-mono">
                            {market.id}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={MARKET_STATUS_COLORS[market.status]}>
                          {getStatusIcon(market.status)}
                          <span className="ml-1">{MARKET_STATUS_LABELS[market.status]}</span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {marketRates ? (
                          <div className="text-sm space-y-0.5">
                            <div className="flex items-center gap-1">
                              <DollarSign className="w-3 h-3 text-muted-foreground" />
                              <span>${marketRates.extra_ton_rate_standard}/ton extra</span>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Heavy: ${marketRates.heavy_base_10yd} base
                            </div>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">Not configured</span>
                        )}
                      </TableCell>
                      <TableCell>
                        {yard ? (
                          <div className="flex items-center gap-1">
                            <Truck className="w-3 h-3 text-muted-foreground" />
                            <span className="text-sm">{yard.name}</span>
                          </div>
                        ) : (
                          <span className="text-muted-foreground text-sm">—</span>
                        )}
                      </TableCell>
                      <TableCell>
                        <DropdownMenu>
                          <DropdownMenuTrigger asChild>
                            <Button variant="ghost" size="icon">
                              <MoreHorizontal className="w-4 h-4" />
                            </Button>
                          </DropdownMenuTrigger>
                          <DropdownMenuContent align="end">
                            <DropdownMenuItem onClick={() => handleEditMarket(market)}>
                              <Edit className="w-4 h-4 mr-2" />
                              Edit Market
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleEditRates(market)}>
                              <DollarSign className="w-4 h-4 mr-2" />
                              Edit Rates
                            </DropdownMenuItem>
                            <DropdownMenuItem onClick={() => handleManageZips(market)}>
                              <MapPin className="w-4 h-4 mr-2" />
                              Manage ZIPs
                            </DropdownMenuItem>
                          </DropdownMenuContent>
                        </DropdownMenu>
                      </TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Add/Edit Market Dialog */}
      <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {selectedMarket ? 'Edit Market' : 'Add New Market'}
            </DialogTitle>
            <DialogDescription>
              Markets define service areas with shared pricing and operations.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Market ID (slug) *</Label>
                <Input 
                  value={marketForm.id} 
                  onChange={(e) => setMarketForm({ ...marketForm, id: e.target.value.toLowerCase().replace(/\s+/g, '_') })}
                  placeholder="e.g., san_francisco_peninsula"
                  disabled={!!selectedMarket}
                />
              </div>
              <div className="space-y-2">
                <Label>Display Name *</Label>
                <Input 
                  value={marketForm.name} 
                  onChange={(e) => setMarketForm({ ...marketForm, name: e.target.value })}
                  placeholder="e.g., San Francisco / Peninsula"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Status</Label>
                <Select 
                  value={marketForm.status} 
                  onValueChange={(v) => setMarketForm({ ...marketForm, status: v as Market['status'] })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">Active</SelectItem>
                    <SelectItem value="coming_soon">Coming Soon</SelectItem>
                    <SelectItem value="inactive">Inactive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Default Yard</Label>
                <Select 
                  value={marketForm.default_yard_id} 
                  onValueChange={(v) => setMarketForm({ ...marketForm, default_yard_id: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select yard..." />
                  </SelectTrigger>
                  <SelectContent>
                    {yards.map(yard => (
                      <SelectItem key={yard.id} value={yard.id}>{yard.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Notes</Label>
              <Textarea 
                value={marketForm.notes} 
                onChange={(e) => setMarketForm({ ...marketForm, notes: e.target.value })}
                placeholder="Cities included, coverage notes, etc."
              />
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowAddDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => saveMarket.mutate(marketForm)}
              disabled={!marketForm.id || !marketForm.name || saveMarket.isPending}
            >
              {saveMarket.isPending ? 'Saving...' : 'Save Market'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Rates Dialog */}
      <Dialog open={showRatesDialog} onOpenChange={setShowRatesDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              Edit Rates: {selectedMarket?.name}
            </DialogTitle>
            <DialogDescription>
              Pricing rates for this market
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Extra Ton Rate (Standard)</Label>
                <Input 
                  type="number"
                  value={ratesForm.extra_ton_rate_standard} 
                  onChange={(e) => setRatesForm({ ...ratesForm, extra_ton_rate_standard: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Prepay Discount %</Label>
                <Input 
                  type="number"
                  value={ratesForm.prepay_discount_pct} 
                  onChange={(e) => setRatesForm({ ...ratesForm, prepay_discount_pct: Number(e.target.value) })}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Heavy Base (10yd)</Label>
                <Input 
                  type="number"
                  value={ratesForm.heavy_base_10yd} 
                  onChange={(e) => setRatesForm({ ...ratesForm, heavy_base_10yd: Number(e.target.value) })}
                />
              </div>
              <div className="space-y-2">
                <Label>Mixed Small Overage Rate</Label>
                <Input 
                  type="number"
                  value={ratesForm.mixed_small_overage_rate} 
                  onChange={(e) => setRatesForm({ ...ratesForm, mixed_small_overage_rate: Number(e.target.value) })}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowRatesDialog(false)}>
              Cancel
            </Button>
            <Button 
              onClick={() => selectedMarket && saveRates.mutate({ ...ratesForm, market_id: selectedMarket.id })}
              disabled={saveRates.isPending}
            >
              {saveRates.isPending ? 'Saving...' : 'Save Rates'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Manage ZIPs Dialog */}
      <Dialog open={showZipsDialog} onOpenChange={setShowZipsDialog}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>
              Manage ZIPs: {selectedMarket?.name}
            </DialogTitle>
            <DialogDescription>
              ZIPs assigned to this market
            </DialogDescription>
          </DialogHeader>

          <MarketZipsManager marketId={selectedMarket?.id || ''} />

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowZipsDialog(false)}>
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Sub-component for ZIP management
function MarketZipsManager({ marketId }: { marketId: string }) {
  const { data: zips = [], isLoading } = useQuery({
    queryKey: ['market-zips', marketId],
    queryFn: () => getZipsForMarket(marketId),
    enabled: !!marketId,
  });

  const { data: unassignedZips = [] } = useQuery({
    queryKey: ['unassigned-zips'],
    queryFn: getUnassignedZips,
  });

  if (isLoading) {
    return <div className="py-4 text-center text-muted-foreground">Loading...</div>;
  }

  return (
    <div className="space-y-4 py-4">
      <Tabs defaultValue="assigned">
        <TabsList className="w-full">
          <TabsTrigger value="assigned" className="flex-1">
            Assigned ({zips.length})
          </TabsTrigger>
          <TabsTrigger value="unassigned" className="flex-1">
            Unassigned ({unassignedZips.length})
          </TabsTrigger>
        </TabsList>

        <TabsContent value="assigned" className="mt-4">
          {zips.length === 0 ? (
            <div className="text-center py-6 text-muted-foreground">
              No ZIPs assigned to this market yet
            </div>
          ) : (
            <div className="max-h-[300px] overflow-y-auto border rounded-md">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>ZIP</TableHead>
                    <TableHead>City</TableHead>
                    <TableHead>County</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {zips.map(zip => (
                    <TableRow key={zip.zip_code}>
                      <TableCell className="font-mono">{zip.zip_code}</TableCell>
                      <TableCell>{zip.city_name}</TableCell>
                      <TableCell>{zip.county || '—'}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </TabsContent>

        <TabsContent value="unassigned" className="mt-4">
          <UnassignedZipsPanel marketId={marketId} zips={unassignedZips} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

function UnassignedZipsPanel({ marketId, zips }: { marketId: string; zips: ZipMarketMapping[] }) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [selectedZips, setSelectedZips] = useState<string[]>([]);

  const assignMutation = useMutation({
    mutationFn: () => assignZipsToMarket(selectedZips, marketId),
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['market-zips', marketId] });
      queryClient.invalidateQueries({ queryKey: ['unassigned-zips'] });
      toast({ title: `Assigned ${result.updated} ZIPs to market` });
      setSelectedZips([]);
    },
    onError: (error) => {
      toast({ title: 'Error assigning ZIPs', description: error.message, variant: 'destructive' });
    },
  });

  const toggleZip = (zip: string) => {
    setSelectedZips(prev => 
      prev.includes(zip) ? prev.filter(z => z !== zip) : [...prev, zip]
    );
  };

  if (zips.length === 0) {
    return (
      <div className="text-center py-6 text-muted-foreground">
        All ZIPs are assigned to markets
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {selectedZips.length > 0 && (
        <div className="flex items-center justify-between p-3 bg-primary/5 rounded-lg">
          <span className="text-sm">{selectedZips.length} ZIPs selected</span>
          <Button 
            size="sm" 
            onClick={() => assignMutation.mutate()}
            disabled={assignMutation.isPending}
          >
            Assign to Market
          </Button>
        </div>
      )}

      <div className="max-h-[300px] overflow-y-auto border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[50px]"></TableHead>
              <TableHead>ZIP</TableHead>
              <TableHead>City</TableHead>
              <TableHead>County</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {zips.map(zip => (
              <TableRow 
                key={zip.zip_code}
                className={cn(
                  "cursor-pointer",
                  selectedZips.includes(zip.zip_code) && "bg-primary/5"
                )}
                onClick={() => toggleZip(zip.zip_code)}
              >
                <TableCell>
                  <input
                    type="checkbox"
                    checked={selectedZips.includes(zip.zip_code)}
                    onChange={() => toggleZip(zip.zip_code)}
                    className="rounded"
                  />
                </TableCell>
                <TableCell className="font-mono">{zip.zip_code}</TableCell>
                <TableCell>{zip.city_name}</TableCell>
                <TableCell>{zip.county || '—'}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
