import { useState, useEffect } from 'react';
import { 
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, 
  Shield, Zap, Settings, Loader2, Play, AlertCircle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { useToast } from '@/hooks/use-toast';
import { Separator } from '@/components/ui/separator';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  validateConfigHealth, 
  applyMissingConfigs, 
  canSwitchToLive,
  getConfig,
  setConfig,
  invalidateConfigCache,
  ConfigHealthResult 
} from '@/lib/configService';

export default function ConfigHealthPage() {
  const { toast } = useToast();
  const [health, setHealth] = useState<ConfigHealthResult | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isApplying, setIsApplying] = useState(false);
  const [messagingMode, setMessagingMode] = useState<string>('DRY_RUN');
  const [isSwitching, setIsSwitching] = useState(false);

  useEffect(() => {
    runHealthCheck();
  }, []);

  async function runHealthCheck() {
    setIsLoading(true);
    try {
      invalidateConfigCache();
      const result = await validateConfigHealth();
      setHealth(result);
      
      const mode = await getConfig('messaging.mode');
      setMessagingMode(String(mode));
    } catch (err) {
      console.error('Health check failed:', err);
      toast({ title: 'Error', description: 'Failed to run health check', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApplyMissing() {
    setIsApplying(true);
    try {
      const { applied, errors } = await applyMissingConfigs();
      
      if (applied.length > 0) {
        toast({ title: 'Configs Applied', description: `Applied ${applied.length} missing configuration(s)` });
      }
      if (errors.length > 0) {
        toast({ title: 'Some Errors', description: errors.join(', '), variant: 'destructive' });
      }
      
      await runHealthCheck();
    } catch (err) {
      console.error('Apply failed:', err);
      toast({ title: 'Error', description: 'Failed to apply configs', variant: 'destructive' });
    } finally {
      setIsApplying(false);
    }
  }

  async function handleModeSwitch(toLive: boolean) {
    if (toLive) {
      // Run preflight checks
      const { ready, blockers } = await canSwitchToLive();
      if (!ready) {
        toast({ 
          title: 'Cannot Switch to LIVE', 
          description: blockers.join('. '), 
          variant: 'destructive' 
        });
        return;
      }
    }

    setIsSwitching(true);
    try {
      const newMode = toLive ? 'LIVE' : 'DRY_RUN';
      const success = await setConfig('messaging.mode', newMode);
      
      if (success) {
        setMessagingMode(newMode);
        toast({ 
          title: `Messaging Mode: ${newMode}`, 
          description: toLive 
            ? '⚠️ Real SMS/emails will now be sent!' 
            : 'Messaging is in test mode - no real messages sent'
        });
        await runHealthCheck();
      }
    } catch (err) {
      console.error('Mode switch failed:', err);
      toast({ title: 'Error', description: 'Failed to switch mode', variant: 'destructive' });
    } finally {
      setIsSwitching(false);
    }
  }

  const StatusIcon = ({ status }: { status: ConfigHealthResult['status'] }) => {
    switch (status) {
      case 'PASS':
        return <CheckCircle2 className="h-8 w-8 text-green-500" />;
      case 'WARN':
        return <AlertTriangle className="h-8 w-8 text-yellow-500" />;
      case 'FAIL':
        return <XCircle className="h-8 w-8 text-red-500" />;
    }
  };

  const statusColors = {
    PASS: 'bg-green-100 text-green-800 border-green-200',
    WARN: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    FAIL: 'bg-red-100 text-red-800 border-red-200',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">System Configuration Health</h1>
          <p className="text-muted-foreground mt-1">
            Alignment verification for $1M/month scaling
          </p>
        </div>
        <Button onClick={runHealthCheck} variant="outline">
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Overall Status */}
      {health && (
        <Card className={`border-2 ${statusColors[health.status]}`}>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <StatusIcon status={health.status} />
              <div className="flex-1">
                <h2 className="text-2xl font-bold">
                  {health.status === 'PASS' && 'All Systems Aligned'}
                  {health.status === 'WARN' && 'Configuration Warnings'}
                  {health.status === 'FAIL' && 'Critical Configuration Issues'}
                </h2>
                <p className="text-sm mt-1">{health.summary}</p>
              </div>
              <Badge variant={health.status === 'PASS' ? 'default' : health.status === 'WARN' ? 'secondary' : 'destructive'}>
                {health.status}
              </Badge>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Messaging Mode Switch */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-5 w-5" />
            Messaging Mode
          </CardTitle>
          <CardDescription>
            Control whether real SMS/emails are sent to customers
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-muted rounded-lg">
            <div className="flex items-center gap-3">
              {messagingMode === 'LIVE' ? (
                <Badge className="bg-green-500">LIVE</Badge>
              ) : (
                <Badge variant="secondary">DRY_RUN</Badge>
              )}
              <div>
                <p className="font-medium">
                  {messagingMode === 'LIVE' ? 'Real messages are being sent' : 'Test mode - no real messages'}
                </p>
                <p className="text-sm text-muted-foreground">
                  {messagingMode === 'LIVE' 
                    ? 'Customers will receive actual SMS and email notifications'
                    : 'Messages are logged but not delivered'}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Label htmlFor="live-mode">Enable LIVE</Label>
              <Switch
                id="live-mode"
                checked={messagingMode === 'LIVE'}
                onCheckedChange={handleModeSwitch}
                disabled={isSwitching}
              />
            </div>
          </div>
          
          {health && !health.messaging_preflight.ready && (
            <Alert variant="destructive" className="mt-4">
              <AlertCircle className="h-4 w-4" />
              <AlertTitle>Preflight Checks Failed</AlertTitle>
              <AlertDescription>
                <ul className="list-disc list-inside mt-2">
                  {health.messaging_preflight.issues.map((issue, i) => (
                    <li key={i}>{issue}</li>
                  ))}
                </ul>
              </AlertDescription>
            </Alert>
          )}
        </CardContent>
      </Card>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Missing Keys */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Settings className="h-5 w-5" />
              Missing Configuration Keys
            </CardTitle>
            <CardDescription>
              Required keys that need to be added to the database
            </CardDescription>
          </CardHeader>
          <CardContent>
            {health?.missing_keys.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>All required keys present</span>
              </div>
            ) : (
              <div className="space-y-3">
                <ul className="space-y-1 text-sm">
                  {health?.missing_keys.map((key) => (
                    <li key={key} className="flex items-center gap-2">
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                      <code className="bg-muted px-1 rounded">{key}</code>
                    </li>
                  ))}
                </ul>
                <Button 
                  onClick={handleApplyMissing} 
                  disabled={isApplying}
                  size="sm"
                >
                  {isApplying ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Play className="h-4 w-4 mr-2" />
                  )}
                  Apply Missing Defaults
                </Button>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Dangerous Values */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Shield className="h-5 w-5" />
              Dangerous Values
            </CardTitle>
            <CardDescription>
              Configuration values that may cause issues
            </CardDescription>
          </CardHeader>
          <CardContent>
            {health?.dangerous_values.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>No dangerous values detected</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {health?.dangerous_values.map((item, i) => (
                  <li key={i} className="p-2 bg-red-50 rounded border border-red-200">
                    <code className="text-sm font-medium text-red-800">{item.key}</code>
                    <p className="text-sm text-red-600 mt-1">{item.reason}</p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Drift Warnings */}
        <Card>
          <CardHeader>
            <CardTitle>Configuration Drift</CardTitle>
            <CardDescription>
              Settings that may be out of sync with best practices
            </CardDescription>
          </CardHeader>
          <CardContent>
            {health?.drift_warnings.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>No drift detected</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {health?.drift_warnings.map((warning, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <AlertTriangle className="h-4 w-4 text-yellow-500 mt-0.5" />
                    <span>{warning}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>

        {/* Overdue Contradictions */}
        <Card>
          <CardHeader>
            <CardTitle>Billing Policy Consistency</CardTitle>
            <CardDescription>
              Overdue billing configuration checks
            </CardDescription>
          </CardHeader>
          <CardContent>
            {health?.overdue_contradictions.length === 0 ? (
              <div className="flex items-center gap-2 text-green-600">
                <CheckCircle2 className="h-5 w-5" />
                <span>Billing policies are consistent</span>
              </div>
            ) : (
              <ul className="space-y-2">
                {health?.overdue_contradictions.map((issue, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm">
                    <XCircle className="h-4 w-4 text-red-500 mt-0.5" />
                    <span>{issue}</span>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
        </Card>
      </div>

      <Separator />

      {/* Quick Reference */}
      <Card>
        <CardHeader>
          <CardTitle>Configuration Quick Reference</CardTitle>
          <CardDescription>
            Current canonical values for key business rules
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3 text-sm">
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Pricing</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>Extra Ton Rate: $165</li>
                <li>Prepay Discount: 5%</li>
                <li>Same-Day Fee: $100</li>
                <li>Weekend Fee: $75</li>
              </ul>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Overdue Billing</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>Daily Rate: $35</li>
                <li>Included Days: 7</li>
                <li>Auto-bill Max: $250</li>
                <li>Escalation: 3 days</li>
              </ul>
            </div>
            <div className="p-3 bg-muted rounded-lg">
              <h4 className="font-semibold mb-2">Dispatch</h4>
              <ul className="space-y-1 text-muted-foreground">
                <li>Runs as Source: ✓</li>
                <li>Auto-create Delivery: ✓</li>
                <li>Require Photos: ✓</li>
                <li>Default Window: 2 hrs</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
