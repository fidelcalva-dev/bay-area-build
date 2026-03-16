// Calculator Input Form Component

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Calculator, MapPin, Truck, Package, Users, Clock } from 'lucide-react';
import { useYards } from '@/hooks/useOperationalTime';
import type { CalculatorInputs as CalculatorInputsType, CustomerType, CustomerTier, ServiceType, MaterialCategory } from '@/types/calculator';

interface CalculatorInputsProps {
  onCalculate: (inputs: CalculatorInputsType) => void;
  isCalculating: boolean;
  userRole: string;
}

const SERVICE_TYPES: { value: ServiceType; label: string }[] = [
  { value: 'DELIVERY', label: 'Delivery' },
  { value: 'PICKUP', label: 'Pickup' },
  { value: 'SWAP', label: 'Swap' },
];

const MATERIAL_CATEGORIES: { value: MaterialCategory; label: string }[] = [
  { value: 'DEBRIS', label: 'Standard Debris' },
  { value: 'HEAVY', label: 'Heavy (Soil, Concrete)' },
  { value: 'DEBRIS_HEAVY', label: 'Mixed Heavy' },
  { value: 'CLEAN_RECYCLING', label: 'Clean Recycling' },
];

const DUMPSTER_SIZES = [5, 8, 10, 20, 30, 40, 50];

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

export function CalculatorInputs({ onCalculate, isCalculating, userRole }: CalculatorInputsProps) {
  const { data: yards = [], isLoading: yardsLoading } = useYards();
  
  const [inputs, setInputs] = useState<Partial<CalculatorInputsType>>({
    market_code: '',
    yard_id: '',
    service_type: 'DELIVERY',
    material_category: 'DEBRIS',
    dumpster_size: 20,
    customer_type: 'homeowner',
    customer_tier: 'standard',
    destination_address: '',
    is_same_day: false,
    traffic_mode: 'AVERAGE',
  });

  // Auto-set market from selected yard
  useEffect(() => {
    if (inputs.yard_id) {
      const selectedYard = yards.find(y => y.id === inputs.yard_id);
      if (selectedYard) {
        setInputs(prev => ({ ...prev, market_code: selectedYard.market || '' }));
      }
    }
  }, [inputs.yard_id, yards]);

  // Filter dumpster sizes based on material for heavy
  const availableSizes = inputs.material_category === 'HEAVY' 
    ? DUMPSTER_SIZES.filter(s => s <= 20) 
    : DUMPSTER_SIZES;

  const handleSubmit = () => {
    if (!inputs.yard_id || !inputs.service_type || !inputs.material_category || !inputs.dumpster_size) {
      return;
    }
    onCalculate(inputs as CalculatorInputsType);
  };

  const canOverrideVehicle = userRole === 'admin' || userRole === 'dispatcher';

  return (
    <Card>
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Calculator className="h-5 w-5" />
          Service Configuration
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Location Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <MapPin className="h-4 w-4" />
            Location
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Origin Yard *</Label>
              <Select
                value={inputs.yard_id}
                onValueChange={(value) => setInputs(prev => ({ ...prev, yard_id: value }))}
                disabled={yardsLoading}
              >
                <SelectTrigger>
                  <SelectValue placeholder={yardsLoading ? 'Loading...' : 'Select yard'} />
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

            <div className="space-y-2">
              <Label>Market</Label>
              <Input 
                value={inputs.market_code || 'Auto-detected'} 
                disabled 
                className="bg-muted"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>Destination Address</Label>
            <Input
              placeholder="Enter job site address"
              value={inputs.destination_address}
              onChange={(e) => setInputs(prev => ({ ...prev, destination_address: e.target.value }))}
            />
          </div>
        </div>

        {/* Service Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Truck className="h-4 w-4" />
            Service Details
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Service Type *</Label>
              <Select
                value={inputs.service_type}
                onValueChange={(value) => setInputs(prev => ({ ...prev, service_type: value as ServiceType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {SERVICE_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Material Category *</Label>
              <Select
                value={inputs.material_category}
                onValueChange={(value) => setInputs(prev => ({ 
                  ...prev, 
                  material_category: value as MaterialCategory,
                  // Reset size if it exceeds limit for heavy
                  dumpster_size: value === 'HEAVY' && (inputs.dumpster_size || 20) > 20 ? 20 : inputs.dumpster_size,
                }))}
              >
                <SelectTrigger>
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
          </div>

          <div className="space-y-2">
            <Label>Dumpster Size *</Label>
            <Select
              value={inputs.dumpster_size?.toString()}
              onValueChange={(value) => setInputs(prev => ({ ...prev, dumpster_size: parseInt(value) }))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {availableSizes.map(size => (
                  <SelectItem key={size} value={size.toString()}>
                    {size} Yard
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {inputs.material_category === 'HEAVY' && (
              <p className="text-xs text-amber-600">Heavy materials limited to 20yd max</p>
            )}
          </div>
        </div>

        {/* Customer Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Users className="h-4 w-4" />
            Customer
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Customer Type *</Label>
              <Select
                value={inputs.customer_type}
                onValueChange={(value) => setInputs(prev => ({ ...prev, customer_type: value as CustomerType }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TYPES.map(type => (
                    <SelectItem key={type.value} value={type.value}>
                      {type.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Customer Tier</Label>
              <Select
                value={inputs.customer_tier}
                onValueChange={(value) => setInputs(prev => ({ ...prev, customer_tier: value as CustomerTier }))}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CUSTOMER_TIERS.map(tier => (
                    <SelectItem key={tier.value} value={tier.value}>
                      {tier.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Options Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-sm font-medium text-muted-foreground">
            <Clock className="h-4 w-4" />
            Options
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Same Day Service</Label>
              <p className="text-xs text-muted-foreground">Request same-day delivery/pickup</p>
            </div>
            <Switch
              checked={inputs.is_same_day}
              onCheckedChange={(checked) => setInputs(prev => ({ ...prev, is_same_day: checked }))}
            />
          </div>

          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label>Real-Time Traffic</Label>
              <p className="text-xs text-muted-foreground">Use live traffic data for estimates</p>
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

        {/* Calculate Button */}
        <Button 
          className="w-full" 
          size="lg"
          onClick={handleSubmit}
          disabled={isCalculating || !inputs.yard_id}
        >
          {isCalculating ? (
            <>
              <span className="animate-spin mr-2">⏳</span>
              Calculating...
            </>
          ) : (
            <>
              <Calculator className="h-4 w-4 mr-2" />
              Calculate
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
