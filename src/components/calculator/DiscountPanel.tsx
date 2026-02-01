// Discount Panel Component for Calculator

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Percent, DollarSign, Gift, AlertTriangle, Lock } from 'lucide-react';
import { getDiscountLimits, canApplyDiscount, getMarginClass, getMarginDisplayInfo } from '@/services/calculatorService';
import type { DiscountType, CustomerTier } from '@/types/calculator';

interface DiscountPanelProps {
  userRole: string;
  customerTier: CustomerTier;
  currentPrice: number;
  internalCost: number;
  onApplyDiscount: (type: DiscountType, value: number, reason?: string) => void;
}

export function DiscountPanel({ 
  userRole, 
  customerTier, 
  currentPrice, 
  internalCost,
  onApplyDiscount 
}: DiscountPanelProps) {
  const [discountType, setDiscountType] = useState<DiscountType>('PERCENTAGE');
  const [discountValue, setDiscountValue] = useState<number>(0);
  const [reason, setReason] = useState('');

  const limits = getDiscountLimits(userRole);
  const canDiscount = canApplyDiscount(userRole, customerTier);

  // Calculate preview
  let previewPrice = currentPrice;
  if (discountType === 'PERCENTAGE') {
    previewPrice = currentPrice * (1 - discountValue / 100);
  } else if (discountType === 'FLAT') {
    previewPrice = currentPrice - discountValue;
  }
  
  const previewMargin = previewPrice - internalCost;
  const previewMarginPct = previewPrice > 0 ? (previewMargin / previewPrice) * 100 : 0;
  const previewMarginClass = getMarginClass(previewMarginPct);
  const marginInfo = getMarginDisplayInfo(previewMarginClass);

  const isValidDiscount = discountValue > 0 && 
    (discountType !== 'PERCENTAGE' || discountValue <= limits.maxPercentage) &&
    previewPrice > internalCost;

  const handleApply = () => {
    if (isValidDiscount) {
      onApplyDiscount(discountType, discountValue, reason);
    }
  };

  if (!canDiscount) {
    return (
      <Card className="border-muted">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base text-muted-foreground">
            <Lock className="h-4 w-4" />
            Discounts Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {userRole === 'dispatcher' 
              ? 'Dispatch role cannot apply discounts.'
              : customerTier === 'standard'
                ? 'Discounts only available for Preferred or VIP customers.'
                : 'You do not have permission to apply discounts.'}
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <Percent className="h-4 w-4" />
            Apply Discount
          </CardTitle>
          <Badge variant="outline" className="text-xs">
            Max: {limits.maxPercentage}%
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Discount Type */}
        <div className="space-y-2">
          <Label>Discount Type</Label>
          <Select
            value={discountType}
            onValueChange={(value) => setDiscountType(value as DiscountType)}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE" disabled={limits.maxPercentage === 0}>
                <div className="flex items-center gap-2">
                  <Percent className="h-4 w-4" />
                  Percentage
                </div>
              </SelectItem>
              <SelectItem value="FLAT" disabled={!limits.canApplyFlat}>
                <div className="flex items-center gap-2">
                  <DollarSign className="h-4 w-4" />
                  Flat Amount
                </div>
              </SelectItem>
              <SelectItem value="FREE_DAY" disabled={!limits.canApplyFreeDay}>
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4" />
                  Free Extra Day
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Discount Value */}
        {discountType !== 'FREE_DAY' && (
          <div className="space-y-2">
            <Label>
              {discountType === 'PERCENTAGE' ? 'Discount %' : 'Discount Amount ($)'}
            </Label>
            <Input
              type="number"
              value={discountValue}
              onChange={(e) => setDiscountValue(parseFloat(e.target.value) || 0)}
              max={discountType === 'PERCENTAGE' ? limits.maxPercentage : undefined}
              min={0}
              step={discountType === 'PERCENTAGE' ? 0.5 : 5}
            />
            {discountType === 'PERCENTAGE' && discountValue > limits.maxPercentage && (
              <p className="text-xs text-destructive">
                Max discount for your role is {limits.maxPercentage}%
              </p>
            )}
          </div>
        )}

        {/* Reason */}
        <div className="space-y-2">
          <Label>Reason (required for audit)</Label>
          <Textarea
            placeholder="e.g., Loyal customer, bulk order, price match..."
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={2}
          />
        </div>

        {/* Preview */}
        <div className="p-3 rounded-lg bg-muted/50 space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Original Price</span>
            <span>${currentPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">Discount</span>
            <span className="text-destructive">
              {discountType === 'PERCENTAGE' 
                ? `-${discountValue}%`
                : discountType === 'FLAT' 
                  ? `-$${discountValue}`
                  : 'Free Day'}
            </span>
          </div>
          <div className="flex items-center justify-between font-medium border-t pt-2">
            <span>New Price</span>
            <span>${previewPrice.toFixed(2)}</span>
          </div>
          <div className="flex items-center justify-between text-sm">
            <span className="text-muted-foreground">New Margin</span>
            <Badge className={`${marginInfo.bgColor} ${marginInfo.color} border-0`}>
              {previewMarginPct.toFixed(1)}%
            </Badge>
          </div>
        </div>

        {/* Warning for low margin */}
        {previewMarginPct < 20 && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              This discount will require manager approval (margin below 20%)
            </AlertDescription>
          </Alert>
        )}

        {previewPrice <= internalCost && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Discount would result in a loss. Cannot apply.
            </AlertDescription>
          </Alert>
        )}

        {/* Apply Button */}
        <Button 
          className="w-full" 
          onClick={handleApply}
          disabled={!isValidDiscount || !reason.trim()}
        >
          Apply Discount
        </Button>
      </CardContent>
    </Card>
  );
}
