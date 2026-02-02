// Location-Based Pricing Manager
// Manage dump fees, market rates, and heavy material pricing by market

import { useState, useEffect } from 'react';
import { Helmet } from 'react-helmet-async';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import {
  getDumpFeeProfiles,
  getMarketSizePricing,
  getHeavyMaterialRates,
  getSizePricingDefaults,
  estimateMargin,
  formatCurrency,
  getMarginBadgeColor,
  MATERIAL_STREAM_LABELS,
  HEAVY_CATEGORY_LABELS,
  type DumpFeeProfile,
  type MarketSizePricing,
  type HeavyMaterialRate,
  type SizePricingDefault,
} from '@/services/locationPricingService';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Separator } from '@/components/ui/separator';
import { MapPin, DollarSign, Truck, Scale, AlertTriangle, Building2 } from 'lucide-react';

interface Market {
  id: string;
  name: string;
  status: string;
}

export default function LocationPricingManager() {
  const [selectedMarket, setSelectedMarket] = useState<string>('oakland_east_bay');
  const [selectedTier, setSelectedTier] = useState<'BASE' | 'CORE' | 'PREMIUM'>('BASE');

  // Fetch markets
  const { data: markets = [] } = useQuery({
    queryKey: ['markets'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('markets')
        .select('id, name, status')
        .eq('status', 'active')
        .order('name');
      if (error) throw error;
      return (data || []) as Market[];
    },
  });

  // Fetch dump fee profiles
  const { data: dumpFees = [] } = useQuery({
    queryKey: ['dump-fees', selectedMarket],
    queryFn: () => getDumpFeeProfiles(selectedMarket),
    enabled: !!selectedMarket,
  });

  // Fetch market size pricing
  const { data: sizePricing = [] } = useQuery({
    queryKey: ['market-size-pricing', selectedMarket, selectedTier],
    queryFn: () => getMarketSizePricing(selectedMarket, selectedTier),
    enabled: !!selectedMarket,
  });

  // Fetch heavy material rates
  const { data: heavyRates = [] } = useQuery({
    queryKey: ['heavy-rates', selectedMarket],
    queryFn: () => getHeavyMaterialRates(selectedMarket),
    enabled: !!selectedMarket,
  });

  // Fetch size defaults
  const { data: sizeDefaults = [] } = useQuery({
    queryKey: ['size-defaults'],
    queryFn: getSizePricingDefaults,
  });

  const selectedMarketName = markets.find(m => m.id === selectedMarket)?.name || selectedMarket;

  return (
    <>
      <Helmet>
        <title>Location Pricing | Admin</title>
      </Helmet>

      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-2">
              <MapPin className="h-6 w-6 text-primary" />
              Location-Based Pricing
            </h1>
            <p className="text-muted-foreground mt-1">
              Manage dump fees, customer prices, and heavy material rates by market
            </p>
          </div>

          <div className="flex items-center gap-4">
            <Select value={selectedMarket} onValueChange={setSelectedMarket}>
              <SelectTrigger className="w-[220px]">
                <SelectValue placeholder="Select market" />
              </SelectTrigger>
              <SelectContent>
                {markets.map((market) => (
                  <SelectItem key={market.id} value={market.id}>
                    {market.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="dump-fees">Dump Fees</TabsTrigger>
            <TabsTrigger value="size-pricing">Size Pricing</TabsTrigger>
            <TabsTrigger value="heavy-materials">Heavy Materials</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Dump Fee Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Truck className="h-4 w-4" />
                    Dump Fee Streams
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{dumpFees.length}</div>
                  <p className="text-xs text-muted-foreground">Active material streams</p>
                </CardContent>
              </Card>

              {/* Size Pricing Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <DollarSign className="h-4 w-4" />
                    Size Prices (BASE)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{sizePricing.length}</div>
                  <p className="text-xs text-muted-foreground">
                    Range: {sizePricing.length > 0 ? `${formatCurrency(Math.min(...sizePricing.map(s => s.base_price)))} - ${formatCurrency(Math.max(...sizePricing.map(s => s.base_price)))}` : 'N/A'}
                  </p>
                </CardContent>
              </Card>

              {/* Heavy Rates Summary */}
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium flex items-center gap-2">
                    <Scale className="h-4 w-4" />
                    Heavy Material Rates
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{heavyRates.length}</div>
                  <p className="text-xs text-muted-foreground">Flat-fee configurations</p>
                </CardContent>
              </Card>
            </div>

            {/* Quick View: BASE Tier Pricing */}
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">
                  {selectedMarketName} — BASE Tier Pricing
                </CardTitle>
                <CardDescription>
                  Standard customer prices with $165/ton overage, $35/day overdue
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Base Price</TableHead>
                      <TableHead className="text-right">Included Tons</TableHead>
                      <TableHead className="text-right">Included Days</TableHead>
                      <TableHead className="text-right">Service Fee</TableHead>
                      <TableHead className="text-right">Dump Cost</TableHead>
                      <TableHead className="text-right">Est. Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizePricing.map((price) => {
                      const margin = price.service_fee_component && price.dump_cost_assumption
                        ? estimateMargin(price.base_price, price.service_fee_component, price.dump_cost_assumption)
                        : null;
                      return (
                        <TableRow key={price.id}>
                          <TableCell className="font-medium">{price.size_yd} yd</TableCell>
                          <TableCell className="text-right font-mono">{formatCurrency(price.base_price)}</TableCell>
                          <TableCell className="text-right">{price.included_tons} tons</TableCell>
                          <TableCell className="text-right">{price.included_days} days</TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {price.service_fee_component ? formatCurrency(price.service_fee_component) : '—'}
                          </TableCell>
                          <TableCell className="text-right text-muted-foreground">
                            {price.dump_cost_assumption ? formatCurrency(price.dump_cost_assumption) : '—'}
                          </TableCell>
                          <TableCell className="text-right">
                            {margin ? (
                              <Badge className={getMarginBadgeColor(margin.marginPct)}>
                                {margin.marginPct}%
                              </Badge>
                            ) : '—'}
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Dump Fees Tab */}
          <TabsContent value="dump-fees" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Building2 className="h-5 w-5" />
                  Dump Fee Profiles — {selectedMarketName}
                </CardTitle>
                <CardDescription>
                  Real disposal costs by material stream. Used for margin calculations.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material Stream</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Cost Model</TableHead>
                      <TableHead className="text-right">Rate</TableHead>
                      <TableHead className="text-right">Min Charge</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Notes</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {dumpFees.map((fee) => (
                      <TableRow key={fee.id}>
                        <TableCell className="font-medium">
                          {MATERIAL_STREAM_LABELS[fee.material_stream || ''] || fee.material_stream || fee.material_category}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{fee.material_category}</Badge>
                        </TableCell>
                        <TableCell>
                          <Badge variant={fee.dump_cost_model === 'PER_TON' ? 'default' : 'secondary'}>
                            {fee.dump_cost_model === 'PER_TON' ? 'Per Ton' : 'Per Load'}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-mono">
                          {fee.dump_cost_model === 'PER_TON' 
                            ? `${formatCurrency(fee.default_cost_per_ton || 0)}/ton`
                            : `${formatCurrency(fee.default_cost_per_load || 0)}/load`
                          }
                        </TableCell>
                        <TableCell className="text-right">
                          {fee.min_charge ? formatCurrency(fee.min_charge) : '—'}
                        </TableCell>
                        <TableCell className="max-w-[200px] truncate">
                          {fee.facility_name || '—'}
                        </TableCell>
                        <TableCell className="max-w-[200px]">
                          {fee.notes?.includes('NEEDS_INPUT') ? (
                            <span className="flex items-center gap-1 text-amber-600">
                              <AlertTriangle className="h-3 w-3" />
                              <span className="text-xs">Needs verification</span>
                            </span>
                          ) : (
                            <span className="text-xs text-muted-foreground truncate">
                              {fee.notes || '—'}
                            </span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Size Pricing Tab */}
          <TabsContent value="size-pricing" className="space-y-4">
            <div className="flex items-center gap-4">
              <Select value={selectedTier} onValueChange={(v) => setSelectedTier(v as typeof selectedTier)}>
                <SelectTrigger className="w-[180px]">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="BASE">BASE Tier</SelectItem>
                  <SelectItem value="CORE">CORE Tier (+6%)</SelectItem>
                  <SelectItem value="PREMIUM">PREMIUM Tier (+15%)</SelectItem>
                </SelectContent>
              </Select>
              <span className="text-sm text-muted-foreground">
                {selectedTier === 'BASE' && 'Standard pricing for most areas'}
                {selectedTier === 'CORE' && 'Higher demand zones, +6% markup'}
                {selectedTier === 'PREMIUM' && 'Peak/constrained capacity, +15% markup'}
              </span>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>
                  {selectedMarketName} — {selectedTier} Tier
                </CardTitle>
                <CardDescription>
                  Customer prices derived from service fees + dump costs + margin buffer
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Customer Price</TableHead>
                      <TableHead className="text-right">Included Tons</TableHead>
                      <TableHead className="text-right">Extra Ton Rate</TableHead>
                      <TableHead className="text-right">Overdue Rate</TableHead>
                      <TableHead className="text-right">Same-Day Fee</TableHead>
                      <TableHead className="text-right">Target Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizePricing.map((price) => (
                      <TableRow key={price.id}>
                        <TableCell className="font-medium">{price.size_yd} yd</TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {formatCurrency(price.base_price)}
                        </TableCell>
                        <TableCell className="text-right">{price.included_tons} tons</TableCell>
                        <TableCell className="text-right">{formatCurrency(price.extra_ton_rate)}/ton</TableCell>
                        <TableCell className="text-right">{formatCurrency(price.overdue_daily_rate)}/day</TableCell>
                        <TableCell className="text-right">
                          {price.same_day_fee ? formatCurrency(price.same_day_fee) : '—'}
                        </TableCell>
                        <TableCell className="text-right">
                          {price.target_margin_pct ? (
                            <Badge className={getMarginBadgeColor(price.target_margin_pct)}>
                              {price.target_margin_pct}%
                            </Badge>
                          ) : '—'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Size Defaults Reference */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Size Pricing Defaults (Reference)</CardTitle>
                <CardDescription>
                  Canonical included tons and service fees used across all markets
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Default Included Tons</TableHead>
                      <TableHead className="text-right">Default Days</TableHead>
                      <TableHead className="text-right">Base Service Fee</TableHead>
                      <TableHead>Description</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {sizeDefaults.map((def) => (
                      <TableRow key={def.id}>
                        <TableCell className="font-medium">{def.size_yd} yd</TableCell>
                        <TableCell className="text-right">{def.included_tons_default} tons</TableCell>
                        <TableCell className="text-right">{def.included_days_default} days</TableCell>
                        <TableCell className="text-right font-mono">
                          {formatCurrency(def.base_service_fee)}
                        </TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {def.description}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Heavy Materials Tab */}
          <TabsContent value="heavy-materials" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Scale className="h-5 w-5" />
                  Heavy Material Flat Rates — {selectedMarketName}
                </CardTitle>
                <CardDescription>
                  Flat-fee pricing for clean heavy materials. Max 10 tons, sizes 5-10yd only.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Material</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Size</TableHead>
                      <TableHead className="text-right">Flat Price</TableHead>
                      <TableHead className="text-right">Max Tons</TableHead>
                      <TableHead>Facility</TableHead>
                      <TableHead>Reclass on Contamination</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {heavyRates.map((rate) => (
                      <TableRow key={rate.id}>
                        <TableCell className="font-medium">
                          {MATERIAL_STREAM_LABELS[rate.material_stream] || rate.material_stream}
                        </TableCell>
                        <TableCell>
                          <Badge variant={rate.heavy_category === 'GREEN_HALO' ? 'default' : 'secondary'}>
                            {HEAVY_CATEGORY_LABELS[rate.heavy_category] || rate.heavy_category}
                          </Badge>
                        </TableCell>
                        <TableCell>{rate.size_yd} yd</TableCell>
                        <TableCell className="text-right font-mono font-bold">
                          {formatCurrency(rate.base_price_flat)}
                        </TableCell>
                        <TableCell className="text-right">{rate.max_tons} tons</TableCell>
                        <TableCell className="max-w-[150px] truncate">
                          {rate.facility_name || '—'}
                        </TableCell>
                        <TableCell>
                          {rate.reclass_to_debris_heavy ? (
                            <Badge variant="outline" className="text-amber-600 border-amber-300">
                              Yes → $165/ton
                            </Badge>
                          ) : (
                            <span className="text-muted-foreground">No</span>
                          )}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
