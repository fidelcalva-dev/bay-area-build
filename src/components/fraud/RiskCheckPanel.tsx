import { useState, useEffect } from 'react';
import {
  Shield, ShieldAlert, ShieldCheck, ShieldX,
  Loader2, AlertTriangle, CheckCircle2, Info,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Separator } from '@/components/ui/separator';
import {
  runRiskCheck,
  getLatestRiskCheck,
  type RiskCheckResult,
  type RiskCheckInput,
  type RiskBand,
} from '@/services/riskCheckService';

interface RiskCheckPanelProps {
  entityType: 'LEAD' | 'CUSTOMER' | 'CONTACT' | 'ORDER';
  entityId?: string;
  email?: string | null;
  phone?: string | null;
  customerName?: string | null;
  companyName?: string | null;
  address?: string | null;
  zip?: string | null;
  customerId?: string | null;
  onCheckComplete?: (result: RiskCheckResult) => void;
  compact?: boolean;
}

const BAND_CONFIG: Record<RiskBand, {
  color: string;
  bg: string;
  border: string;
  icon: typeof Shield;
  label: string;
}> = {
  GREEN: {
    color: 'text-green-700',
    bg: 'bg-green-50',
    border: 'border-green-200',
    icon: ShieldCheck,
    label: 'Low Risk',
  },
  AMBER: {
    color: 'text-yellow-700',
    bg: 'bg-yellow-50',
    border: 'border-yellow-200',
    icon: ShieldAlert,
    label: 'Medium Risk',
  },
  RED: {
    color: 'text-red-700',
    bg: 'bg-red-50',
    border: 'border-red-200',
    icon: ShieldX,
    label: 'High Risk',
  },
};

export function RiskCheckPanel({
  entityType,
  entityId,
  email,
  phone,
  customerName,
  companyName,
  address,
  zip,
  customerId,
  onCheckComplete,
  compact = false,
}: RiskCheckPanelProps) {
  const [result, setResult] = useState<RiskCheckResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const [hasRun, setHasRun] = useState(false);

  // Load existing check
  useEffect(() => {
    if (entityId) {
      getLatestRiskCheck(entityType, entityId).then(existing => {
        if (existing) {
          setResult(existing);
          setHasRun(true);
        }
      });
    }
  }, [entityType, entityId]);

  const handleRunCheck = async () => {
    setIsRunning(true);
    try {
      const input: RiskCheckInput = {
        entityType,
        entityId,
        email,
        phone,
        customerName,
        companyName,
        address,
        zip,
        customerId,
      };
      const res = await runRiskCheck(input);
      setResult(res);
      setHasRun(true);
      onCheckComplete?.(res);
    } finally {
      setIsRunning(false);
    }
  };

  if (!result && !hasRun) {
    return (
      <Card className={compact ? 'border-dashed' : ''}>
        <CardContent className={compact ? 'p-3' : 'p-4'}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Shield className="w-4 h-4" />
              <span>Scam Risk Check</span>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleRunCheck}
              disabled={isRunning || (!email && !phone)}
            >
              {isRunning ? (
                <><Loader2 className="w-3.5 h-3.5 mr-1 animate-spin" /> Checking...</>
              ) : (
                <><Shield className="w-3.5 h-3.5 mr-1" /> Run Risk Check</>
              )}
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (!result) return null;

  const config = BAND_CONFIG[result.riskBand];
  const BandIcon = config.icon;
  const positiveReasons = result.reasons.filter(r => r.weight < 0);
  const negativeReasons = result.reasons.filter(r => r.weight > 0);
  const neutralReasons = result.reasons.filter(r => r.weight === 0);

  if (compact) {
    return (
      <div className={`flex items-center gap-2 px-3 py-2 rounded-lg border ${config.border} ${config.bg}`}>
        <BandIcon className={`w-4 h-4 ${config.color}`} />
        <span className={`text-sm font-medium ${config.color}`}>
          {config.label} ({result.riskScore})
        </span>
        <Button size="sm" variant="ghost" className="ml-auto h-7 text-xs" onClick={handleRunCheck} disabled={isRunning}>
          {isRunning ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Re-check'}
        </Button>
      </div>
    );
  }

  return (
    <Card className={`border ${config.border}`}>
      <CardHeader className={`pb-3 ${config.bg} rounded-t-lg`}>
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm flex items-center gap-2">
            <BandIcon className={`w-5 h-5 ${config.color}`} />
            <span className={config.color}>{config.label}</span>
            <Badge variant="outline" className={`${config.color} ${config.border}`}>
              Score: {result.riskScore}/100
            </Badge>
          </CardTitle>
          <Button size="sm" variant="outline" onClick={handleRunCheck} disabled={isRunning}>
            {isRunning ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : 'Re-check'}
          </Button>
        </div>
        <Progress value={result.riskScore} className="h-2 mt-2" />
      </CardHeader>
      <CardContent className="pt-4 space-y-4">
        {/* Recommended Action */}
        <div className={`p-3 rounded-lg ${config.bg} border ${config.border}`}>
          <p className={`text-sm font-medium ${config.color} mb-1`}>Recommended Action</p>
          <p className="text-sm text-foreground">{result.recommendedAction}</p>
        </div>

        {/* Risk Factors */}
        {negativeReasons.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Risk Factors</p>
            <div className="space-y-1.5">
              {negativeReasons.sort((a, b) => b.weight - a.weight).slice(0, 5).map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">{r.label}</span>
                    <span className="text-muted-foreground ml-1">(+{r.weight})</span>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Positive Signals */}
        {positiveReasons.length > 0 && (
          <div>
            <p className="text-xs font-semibold text-muted-foreground uppercase mb-2">Positive Signals</p>
            <div className="space-y-1.5">
              {positiveReasons.map((r, i) => (
                <div key={i} className="flex items-start gap-2 text-sm">
                  <CheckCircle2 className="w-3.5 h-3.5 text-green-500 mt-0.5 shrink-0" />
                  <div>
                    <span className="font-medium">{r.label}</span>
                    <span className="text-muted-foreground ml-1">({r.weight})</span>
                    <p className="text-xs text-muted-foreground">{r.detail}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Neutral */}
        {neutralReasons.length > 0 && (
          <div>
            <div className="space-y-1">
              {neutralReasons.map((r, i) => (
                <div key={i} className="flex items-center gap-2 text-xs text-muted-foreground">
                  <Info className="w-3 h-3" />
                  <span>{r.label}: {r.detail}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        <Separator />
        <p className="text-xs text-muted-foreground italic">
          Internal use only. Never share risk results with customers.
        </p>
      </CardContent>
    </Card>
  );
}
