// Calculator Results Display Component

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { 
  Clock, 
  DollarSign, 
  TrendingUp, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle,
  Lightbulb,
  Save,
  FileText,
  ShoppingCart,
} from 'lucide-react';
import { formatDuration, getSlaClassInfo } from '@/services/operationalTimeService';
import { getMarginDisplayInfo } from '@/services/calculatorService';
import type { CalculatorResult, MarginClass } from '@/types/calculator';

interface CalculatorResultsProps {
  result: CalculatorResult;
  onSave: () => void;
  onConvertToQuote?: () => void;
  onConvertToOrder?: () => void;
  userRole: string;
}

export function CalculatorResults({ 
  result, 
  onSave, 
  onConvertToQuote,
  onConvertToOrder,
  userRole 
}: CalculatorResultsProps) {
  const { estimate, is_blocked, block_reason, alternative_suggestions } = result;

  // If blocked, show block message
  if (is_blocked) {
    return (
      <Card className="border-destructive">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg text-destructive">
            <XCircle className="h-5 w-5" />
            Service Blocked
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Cannot Proceed</AlertTitle>
            <AlertDescription>{block_reason}</AlertDescription>
          </Alert>

          {alternative_suggestions && alternative_suggestions.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium flex items-center gap-2">
                <Lightbulb className="h-4 w-4 text-amber-500" />
                Alternatives
              </h4>
              {alternative_suggestions.map((suggestion, idx) => (
                <div 
                  key={idx}
                  className="p-3 rounded-lg border bg-muted/50"
                >
                  <p className="font-medium">{suggestion.label}</p>
                  <p className="text-sm text-muted-foreground">{suggestion.description}</p>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    );
  }

  const marginClass = estimate.margin_class || 'GREEN';
  const marginInfo = getMarginDisplayInfo(marginClass);
  const slaInfo = estimate.sla_class ? getSlaClassInfo(estimate.sla_class) : null;

  const canSeePricing = userRole !== 'dispatcher';
  const canSave = true;
  const canConvert = userRole === 'admin' || userRole === 'sales';

  return (
    <div className="space-y-4">
      {/* Main Result Card */}
      <Card>
        <CardHeader className="pb-4">
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center gap-2 text-lg">
              <CheckCircle2 className="h-5 w-5 text-green-600" />
              Estimate Ready
            </CardTitle>
            <Badge className={`${marginInfo.bgColor} ${marginInfo.color} border-0`}>
              {marginInfo.icon} {marginInfo.label}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Time Breakdown */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Clock className="h-4 w-4" />
              Time Estimate
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="p-3 rounded-lg bg-muted/50">
                <p className="text-2xl font-bold">
                  {estimate.total_time_minutes ? formatDuration(estimate.total_time_minutes) : '--'}
                </p>
                <p className="text-sm text-muted-foreground">Total Service Time</p>
              </div>
              {slaInfo && (
                <div className={`p-3 rounded-lg ${slaInfo.bgColor}`}>
                  <p className={`text-lg font-semibold ${slaInfo.color}`}>
                    {slaInfo.label}
                  </p>
                  <p className="text-sm text-muted-foreground">SLA Classification</p>
                </div>
              )}
            </div>

            {estimate.time_breakdown && (
              <div className="grid grid-cols-4 gap-2 text-sm">
                <div className="text-center p-2 rounded bg-muted/30">
                  <p className="font-medium">{estimate.time_breakdown.yard_time}m</p>
                  <p className="text-xs text-muted-foreground">Yard</p>
                </div>
                <div className="text-center p-2 rounded bg-muted/30">
                  <p className="font-medium">{estimate.time_breakdown.drive_time}m</p>
                  <p className="text-xs text-muted-foreground">Drive</p>
                </div>
                <div className="text-center p-2 rounded bg-muted/30">
                  <p className="font-medium">{estimate.time_breakdown.jobsite_time}m</p>
                  <p className="text-xs text-muted-foreground">Site</p>
                </div>
                <div className="text-center p-2 rounded bg-muted/30">
                  <p className="font-medium">{estimate.time_breakdown.dump_time}m</p>
                  <p className="text-xs text-muted-foreground">Dump</p>
                </div>
              </div>
            )}
          </div>

          <Separator />

          {/* Pricing (if allowed) */}
          {canSeePricing && (
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm font-medium">
                <DollarSign className="h-4 w-4" />
                Pricing
              </div>
              <div className="grid grid-cols-3 gap-4">
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold">${estimate.customer_price?.toFixed(0) || '--'}</p>
                  <p className="text-sm text-muted-foreground">Customer Price</p>
                </div>
                <div className="p-3 rounded-lg bg-muted/50">
                  <p className="text-xl font-bold">${estimate.internal_cost?.toFixed(0) || '--'}</p>
                  <p className="text-sm text-muted-foreground">Internal Cost</p>
                </div>
                <div className={`p-3 rounded-lg ${marginInfo.bgColor}`}>
                  <p className={`text-xl font-bold ${marginInfo.color}`}>
                    {estimate.margin_pct?.toFixed(1)}%
                  </p>
                  <p className="text-sm text-muted-foreground">Margin</p>
                </div>
              </div>

              {estimate.final_price && estimate.final_price !== estimate.customer_price && (
                <div className="p-3 rounded-lg border-2 border-dashed border-primary/30 bg-primary/5">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-medium">After Discount</p>
                      <p className="text-2xl font-bold text-primary">${estimate.final_price.toFixed(0)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">Final Margin</p>
                      <p className={`font-semibold ${getMarginDisplayInfo(estimate.margin_class || 'GREEN').color}`}>
                        {estimate.final_margin_pct?.toFixed(1)}%
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Warnings */}
          {estimate.warnings && estimate.warnings.length > 0 && (
            <>
              <Separator />
              <div className="space-y-2">
                {estimate.warnings.map((warning, idx) => (
                  <Alert key={idx} variant="default" className="bg-amber-50 border-amber-200">
                    <AlertTriangle className="h-4 w-4 text-amber-600" />
                    <AlertDescription className="text-amber-800">{warning}</AlertDescription>
                  </Alert>
                ))}
              </div>
            </>
          )}

          {/* Approval Required */}
          {estimate.requires_approval && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertTitle>Approval Required</AlertTitle>
              <AlertDescription>
                This estimate has a margin below 20% and requires manager approval before proceeding.
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      {/* Recommendations */}
      {estimate.recommendations && estimate.recommendations.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="flex items-center gap-2 text-base">
              <Lightbulb className="h-4 w-4 text-amber-500" />
              Recommendations
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            {estimate.recommendations.map((rec, idx) => (
              <div 
                key={idx}
                className="p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{rec.label}</p>
                    <p className="text-sm text-muted-foreground">{rec.description}</p>
                  </div>
                  {rec.estimated_margin_pct && (
                    <Badge variant="outline" className="text-green-600">
                      ~{rec.estimated_margin_pct.toFixed(0)}% margin
                    </Badge>
                  )}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Actions */}
      <Card>
        <CardContent className="pt-4">
          <div className="flex flex-wrap gap-2">
            {canSave && (
              <Button onClick={onSave} variant="outline">
                <Save className="h-4 w-4 mr-2" />
                Save Estimate
              </Button>
            )}
            {canConvert && onConvertToQuote && (
              <Button onClick={onConvertToQuote} variant="outline">
                <FileText className="h-4 w-4 mr-2" />
                Create Quote
              </Button>
            )}
            {canConvert && onConvertToOrder && (
              <Button onClick={onConvertToOrder}>
                <ShoppingCart className="h-4 w-4 mr-2" />
                Create Order
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
