// Master Calculator Input Panel with Address Autocomplete

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calculator, MapPin, Truck, Package, Users, Clock, Calendar, Navigation, CheckCircle } from 'lucide-react';
import { AddressAutocomplete, type AddressResult } from '@/components/quote/v3/AddressAutocomplete';
import { useYards } from '@/hooks/useOperationalTime';
import type { CalculatorInputs as CalculatorInputsType, CustomerType, CustomerTier, ServiceType, MaterialCategory } from '@/types/calculator';

interface MasterCalculatorInputsProps {
  onCalculate: (inputs: CalculatorInputsType & { 
    destination_lat?: number; 
    destination_lng?: number;
    delivery_date?: string;
    delivery_window?: string;
    access_notes?: string;
  }) => void;
  isCalculating: boolean;
  userRole: string;
}

const SERVICE_TYPES: { value: ServiceType; label: string; description: string }[] = [
  { value: 'DELIVERY', label: 'Delivery', description: 'Drop off empty container' },
  { value: 'PICKUP', label: 'Pickup', description: 'Pick up full container' },
  { value: 'SWAP', label: 'Swap', description: 'Swap full for empty' },
];

const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string; icon: string }[] = [
  { value: 'DEBRIS', label: 'General Debris', icon: 'construction' },
  { value: 'HEAVY', label: 'Heavy (Concrete, Dirt)', icon: 'weight' },
  { value: 'DEBRIS_HEAVY', label: 'Mixed Heavy', icon: 'mix' },
  { value: 'CLEAN_RECYCLING', label: 'Clean Recycling', icon: 'recycle' },
];

const DUMPSTER_SIZES = [6, 8, 10, 20, 30, 40, 50];

const CUSTOMER_TYPES: { value: CustomerType; label: string }[] = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'commercial', label: 'Commercial' },
];

const CUSTOMER_TIERS: { value: CustomerTier; label: string }[] = [
  { value: 'standard', label: 'Standard' },
  { value: 'preferred', label: 'Preferred' },
  { value: 'vip', label: 'VIP / Volume' },
];

const DELIVERY_WINDOWS = [
  { value: 'morning', label: 'Morning (6am-10am)' },
  { value: 'midday', label: 'Midday (10am-2pm)' },
  { value: 'afternoon', label: 'Afternoon (2pm-6pm)' },
];

export function MasterCalculatorInputs({ onCalculate, isCalculating, userRole }: MasterCalculatorInputsProps) {
  const { data: yards = [], isLoading: yardsLoading } = useYards();
  const [useAddress, setUseAddress] = useState(false);
  const [addressResult, setAddressResult] = useState<AddressResult | null>(null);

  const [inputs, setInputs] = useState({
    market_code: '',
    yard_id: '',
    service_type: 'DELIVERY' as ServiceType,
    material_category: 'DEBRIS' as MaterialCategory,
    dumpster_size: 20,
    customer_type: 'homeowner' as CustomerType,
    customer_tier: 'standard' as CustomerTier,
    destination_address: '',
    destination_lat: undefined as number | undefined,
    destination_lng: undefined as number | undefined,
    is_same_day: false,
    traffic_mode: 'AVERAGE' as 'REAL_TIME' | 'AVERAGE',
    zip_code: '',
    delivery_date: '',
    delivery_window: '',
    access_notes: '',
  });

  // Auto-set market + yard from address
  useEffect(() => {
    if (addressResult && yards.length > 0) {
      // Find nearest yard by distance
      let nearestYard = yards[0];
      let minDist = Infinity;
      for (const yard of yards) {
        const dist = Math.sqrt(
          Math.pow(yard.latitude - addressResult.lat, 2) +
          Math.pow(yard.longitude - addressResult.lng, 2)
        );
        if (dist < minDist) {
          minDist = dist;
          nearestYard = yard;
        }
      }
      setInputs(prev => ({
        ...prev,
        yard_id: nearestYard.id,
        market_code: nearestYard.market || '',
        destination_address: addressResult.formattedAddress,
        destination_lat: addressResult.lat,
        destination_lng: addressResult.lng,
        zip_code: addressResult.zip,
      }));
    }
  }, [addressResult, yards]);

  // Auto-set market from selected yard (manual selection)
  useEffect(() => {
    if (inputs.yard_id && !addressResult) {
      const selectedYard = yards.find(y => y.id === inputs.yard_id);
      if (selectedYard) {
        setInputs(prev => ({ ...prev, market_code: selectedYard.market || '' }));
      }
    }
  }, [inputs.yard_id, yards, addressResult]);

  // Filter dumpster sizes based on material
  const availableSizes = (inputs.material_category === 'HEAVY')
    ? DUMPSTER_SIZES.filter(s => s <= 10)
    : DUMPSTER_SIZES;

  const handleSubmit = () => {
    if (!inputs.service_type || !inputs.material_category || !inputs.dumpster_size) return;
    // If no yard selected and no address, require one
    if (!inputs.yard_id && !inputs.destination_address && !inputs.zip_code) return;

    onCalculate({
      ...inputs,
      facility_id: undefined,
    } as any);
  };

  return (
    <Card className="h-fit">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Service Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        {/* Location Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Location
          </div>

          {/* ZIP or Address toggle */}
          {!useAddress ? (
            <div className="space-y-2">
              <Label>ZIP Code</Label>
              <Input
                placeholder="Enter ZIP code"
                value={inputs.zip_code}
                onChange={(e) => setInputs(prev => ({ ...prev, zip_code: e.target.value }))}
                maxLength={5}
              />
              <button
                type="button"
                onClick={() => setUseAddress(true)}
                className="flex items-center gap-1.5 text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                <Navigation className="w-3.5 h-3.5" />
                Enter full address instead
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Job Site Address</Label>
              <AddressAutocomplete
                onAddressSelect={(result) => setAddressResult(result)}
                onClear={() => {
                  setAddressResult(null);
                  setInputs(prev => ({ ...prev, destination_address: '', destination_lat: undefined, destination_lng: undefined, zip_code: '' }));
                }}
              />
              {addressResult && (
                <div className="flex items-center gap-2 text-xs">
                  <CheckCircle className="w-3.5 h-3.5 text-green-600" />
                  <span className="text-muted-foreground">
                    ZIP: <span className="font-medium text-foreground">{addressResult.zip}</span>
                  </span>
                </div>
              )}
              <button
                type="button"
                onClick={() => {
                  setUseAddress(false);
                  setAddressResult(null);
                }}
                className="text-xs font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Use ZIP code instead
              </button>
            </div>
          )}

          {/* Yard selection */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Origin Yard</Label>
              <Select
                value={inputs.yard_id}
                onValueChange={(value) => setInputs(prev => ({ ...prev, yard_id: value }))}
                disabled={yardsLoading}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder={yardsLoading ? 'Loading...' : 'Auto / Select'} />
                </SelectTrigger>
                <SelectContent>
                  {yards.map(yard => (
                    <SelectItem key={yard.id} value={yard.id}>
                      {yard.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Market</Label>
              <Input
                value={inputs.market_code || 'Auto-detected'}
                disabled
                className="bg-muted h-9 text-sm"
              />
            </div>
          </div>
        </div>

        <Separator />

        {/* Service Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Truck className="h-4 w-4" />
            Service Details
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Service Type</Label>
            <div className="grid grid-cols-3 gap-2">
              {SERVICE_TYPES.map(type => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setInputs(prev => ({ ...prev, service_type: type.value }))}
                  className={`p-2.5 rounded-lg border text-center text-sm transition-all ${
                    inputs.service_type === type.value
                      ? 'border-primary bg-primary/5 text-primary font-medium'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Material Category</Label>
            <Select
              value={inputs.material_category}
              onValueChange={(value) => setInputs(prev => ({
                ...prev,
                material_category: value as MaterialCategory,
                dumpster_size: value === 'HEAVY' && prev.dumpster_size > 10 ? 10 : prev.dumpster_size,
              }))}
            >
              <SelectTrigger className="h-9 text-sm">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {MATERIAL_CATEGORIES.map(cat => (
                  <SelectItem key={cat.value} value={cat.value}>
                    {cat.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-1.5">
            <Label className="text-xs">Dumpster Size</Label>
            <div className="flex flex-wrap gap-1.5">
              {availableSizes.map(size => (
                <button
                  key={size}
                  type="button"
                  onClick={() => setInputs(prev => ({ ...prev, dumpster_size: size }))}
                  className={`px-3 py-1.5 rounded-md border text-sm transition-all ${
                    inputs.dumpster_size === size
                      ? 'border-primary bg-primary text-primary-foreground font-medium'
                      : 'border-border hover:border-primary/40'
                  }`}
                >
                  {size}yd
                </button>
              ))}
            </div>
            {inputs.material_category === 'HEAVY' && (
              <p className="text-xs text-amber-600">Heavy materials limited to 10yd max</p>
            )}
          </div>
        </div>

        <Separator />

        {/* Customer Section */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Customer
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Customer Type</Label>
              <Select
                value={inputs.customer_type}
                onValueChange={(value) => setInputs(prev => ({ ...prev, customer_type: value as CustomerType }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>{type.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Tier</Label>
              <Select
                value={inputs.customer_tier}
                onValueChange={(value) => setInputs(prev => ({ ...prev, customer_tier: value as CustomerTier }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TIERS.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>{tier.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Schedule + Options */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Calendar className="h-4 w-4" />
            Schedule & Options
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label className="text-xs">Delivery Date</Label>
              <Input
                type="date"
                value={inputs.delivery_date}
                onChange={(e) => setInputs(prev => ({ ...prev, delivery_date: e.target.value }))}
                className="h-9 text-sm"
              />
            </div>
            <div className="space-y-1.5">
              <Label className="text-xs">Time Window</Label>
              <Select
                value={inputs.delivery_window}
                onValueChange={(value) => setInputs(prev => ({ ...prev, delivery_window: value }))}
              >
                <SelectTrigger className="h-9 text-sm">
                  <SelectValue placeholder="Select window" />
                </SelectTrigger>
                <SelectContent>
                  {DELIVERY_WINDOWS.map(w => (
                    <SelectItem key={w.value} value={w.value}>{w.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs">Same Day</Label>
            </div>
            <Switch
              checked={inputs.is_same_day}
              onCheckedChange={(checked) => setInputs(prev => ({ ...prev, is_same_day: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label className="text-xs">Real-Time Traffic</Label>
            </div>
            <Switch
              checked={inputs.traffic_mode === 'REAL_TIME'}
              onCheckedChange={(checked) => setInputs(prev => ({
                ...prev,
                traffic_mode: checked ? 'REAL_TIME' : 'AVERAGE'
              }))}
            />
          </div>
        </div>

        <Separator />

        {/* Notes */}
        <div className="space-y-1.5">
          <Label className="text-xs">Access Notes</Label>
          <Textarea
            placeholder="Gate code, narrow street, slope, etc."
            value={inputs.access_notes}
            onChange={(e) => setInputs(prev => ({ ...prev, access_notes: e.target.value }))}
            rows={2}
            className="text-sm"
          />
        </div>

        {/* Calculate Button */}
        <Button
          className="w-full"
          size="lg"
          onClick={handleSubmit}
          disabled={isCalculating || (!inputs.yard_id && !inputs.zip_code && !inputs.destination_address)}
        >
          {isCalculating ? (
            <span className="flex items-center gap-2">
              <span className="animate-spin h-4 w-4 border-2 border-primary-foreground border-t-transparent rounded-full" />
              Calculating...
            </span>
          ) : (
            <span className="flex items-center gap-2">
              <Calculator className="h-4 w-4" />
              Calculate
            </span>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
