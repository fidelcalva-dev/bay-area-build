// Card 2: "Recommended Customer Quote" result card

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { DollarSign, TrendingUp, FileText, ShoppingCart, AlertTriangle, Save } from 'lucide-react';
import { getMarginDisplayInfo } from '@/services/calculatorService';
import type { CalculatorResult } from '@/types/calculator';

interface QuoteCardProps {
  result: CalculatorResult;
  userRole: string;
  onSave: () => void;
  onCreateQuote?: () => void;
  onCreateOrder?: () => void;
}

export function QuoteCard({ result, userRole, onSave, onCreateQuote, onCreateOrder }: QuoteCardProps) {
  const { estimate } = result;
  const marginClass = estimate.margin_class || 'GREEN';
  const marginInfo = getMarginDisplayInfo(marginClass);
  const canSeePricing = userRole !== 'dispatcher';
  const canConvert = userRole === 'admin' || userRole === 'sales';

  if (!canSeePricing) {
    return (
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5" />
            Pricing
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">Pricing details are restricted for this role.</p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center gap-2 text-base">
            <DollarSign className="h-5 w-5" />
            Recommended Customer Quote
          </CardTitle>
          <Badge className={`${marginInfo.bgColor} ${marginInfo.color} border-0`}>
            {marginInfo.label}
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Main pricing */}
        <div className="grid grid-cols-3 gap-3">
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold">${estimate.customer_price?.toFixed(0) || '--'}</p>
            <p className="text-xs text-muted-foreground">Customer Price</p>
          </div>
          <div className="p-3 rounded-lg bg-muted/50 text-center">
            <p className="text-xl font-bold">${estimate.internal_cost?.toFixed(0) || '--'}</p>
            <p className="text-xs text-muted-foreground">Internal Cost</p>
          </div>
          <div className={`p-3 rounded-lg ${marginInfo.bgColor} text-center`}>
            <p className={`text-xl font-bold ${marginInfo.color}`}>
              {estimate.margin_pct?.toFixed(1) || '--'}%
            </p>
            <p className="text-xs text-muted-foreground">Margin</p>
          </div>
        </div>

        {/* Inclusions */}
        <div className="p-3 rounded-lg border bg-muted/30 space-y-1.5 text-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Included Tons</span>
            <span className="font-medium">
              {estimate.dumpster_size <= 10 ? '0.5-1.0' : estimate.dumpster_size <= 20 ? '2.0' : `${Math.floor(estimate.dumpster_size / 10)}.0`} ton
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Included Days</span>
            <span className="font-medium">7 days</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Overage Rate</span>
            <span className="font-medium">$165/ton</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Extra Day</span>
            <span className="font-medium">$35/day</span>
          </div>
        </div>

        {/* Discount applied */}
        {estimate.final_price && estimate.final_price !== estimate.customer_price && (
          <div className="p-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium">After Discount</p>
                <p className="text-2xl font-bold text-primary">${estimate.final_price.toFixed(0)}</p>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Final Margin</p>
                <p className={`font-semibold ${getMarginDisplayInfo(estimate.margin_class || 'GREEN').color}`}>
                  {estimate.final_margin_pct?.toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Approval required */}
        {estimate.requires_approval && (
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription className="text-xs">
              Margin below 20% -- requires manager approval before proceeding.
            </AlertDescription>
          </Alert>
        )}

        <Separator />

        {/* Actions */}
        <div className="flex flex-wrap gap-2">
          <Button onClick={onSave} variant="outline" size="sm">
            <Save className="h-3.5 w-3.5 mr-1.5" />
            Save Estimate
          </Button>
          {canConvert && onCreateQuote && (
            <Button onClick={onCreateQuote} variant="outline" size="sm">
              <FileText className="h-3.5 w-3.5 mr-1.5" />
              Create Quote
            </Button>
          )}
          {canConvert && onCreateOrder && (
            <Button onClick={onCreateOrder} size="sm">
              <ShoppingCart className="h-3.5 w-3.5 mr-1.5" />
              Create Order
            </Button>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
