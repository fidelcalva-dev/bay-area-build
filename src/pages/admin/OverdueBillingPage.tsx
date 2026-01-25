import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { 
  AlertTriangle, Clock, DollarSign, RefreshCw, Play, 
  Calendar, User, Phone, FileText, Loader2, CheckCircle2
} from 'lucide-react';
import { format } from 'date-fns';

interface OverdueAsset {
  asset_id: string;
  asset_code: string;
  days_out: number;
  order_id: string;
  order_status: string;
  included_days: number;
  overdue_days: number;
  customer_id: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  billed_overdue_days_total: number;
  billable_days: number;
  invoice_id: string | null;
  invoice_number: string | null;
  last_billed_at: string | null;
}

interface Config {
  daily_rate: number;
  escalation_days: number;
  max_auto_bill: number;
  messaging_mode: string;
}

export default function OverdueBillingPage() {
  const { toast } = useToast();
  const [overdueAssets, setOverdueAssets] = useState<OverdueAsset[]>([]);
  const [config, setConfig] = useState<Config>({ daily_rate: 35, escalation_days: 3, max_auto_bill: 250, messaging_mode: 'DRY_RUN' });
  const [isLoading, setIsLoading] = useState(true);
  const [isRunning, setIsRunning] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [lastRun, setLastRun] = useState<{ status: string; records_processed: number; created_at: string } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      // Fetch overdue assets - use type assertion since view isn't in types
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: assets, error } = await (supabase as any)
        .from('overdue_assets_billing_vw')
        .select('*')
        .order('overdue_days', { ascending: false });

      if (error) throw error;
      setOverdueAssets(assets || []);

      // Fetch config using canonical keys (2026_Q1_ALIGNMENT)
      const { data: configRows } = await supabase
        .from('config_settings')
        .select('category, key, value')
        .in('category', ['overdue', 'messaging']);

      if (configRows) {
        // Build a map keyed by "category.key"
        const configMap = new Map<string, unknown>();
        for (const row of configRows) {
          const fullKey = `${row.category}.${row.key}`;
          let value: unknown = row.value;
          if (typeof value === 'string') {
            try { value = JSON.parse(value); } catch { value = (value as string).replace(/^"|"$/g, ''); }
          }
          configMap.set(fullKey, value);
        }
        setConfig({
          daily_rate: Number(configMap.get('overdue.daily_rate')) || 35,
          escalation_days: Number(configMap.get('overdue.escalation_days')) || 3,
          max_auto_bill: Number(configMap.get('overdue.auto_bill_max')) || 250,
          messaging_mode: String(configMap.get('messaging.mode') || 'DRY_RUN'),
        });
      }

      // Fetch last run - automation_runs has different columns
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data: runs } = await (supabase as any)
        .from('automation_runs')
        .select('automation_type, alerts_created, created_at')
        .eq('automation_type', 'overdue_billing')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();

      if (runs) {
        setLastRun({
          status: 'success',
          records_processed: runs.alerts_created || 0,
          created_at: runs.created_at,
        });
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({ title: 'Error', description: 'Failed to load overdue data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function runBillingNow() {
    setIsRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('overdue-billing-daily');
      
      if (error) throw error;
      
      toast({ 
        title: 'Billing Run Complete', 
        description: `Processed: ${data.results.processed}, Billed: ${data.results.billed}, Approvals: ${data.results.approvals_created}` 
      });
      
      fetchData();
    } catch (err) {
      console.error('Error running billing:', err);
      toast({ title: 'Error', description: 'Failed to run billing', variant: 'destructive' });
    } finally {
      setIsRunning(false);
    }
  }

  async function createApproval(asset: OverdueAsset) {
    const amount = asset.billable_days * config.daily_rate;
    
    try {
      const { error } = await supabase.from('approval_requests').insert({
        request_type: 'overdue_billing',
        entity_type: 'order',
        entity_id: asset.order_id,
        requested_by: (await supabase.auth.getUser()).data.user?.id,
        requested_value: {
          asset_id: asset.asset_id,
          asset_code: asset.asset_code,
          billable_days: asset.billable_days,
          amount: amount,
          daily_rate: config.daily_rate,
          customer_name: asset.customer_name,
        },
        reason: 'Manual approval request for overdue billing',
        status: 'pending',
      });

      if (error) throw error;
      
      toast({ title: 'Approval Created', description: `Request for $${amount} submitted for approval` });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create approval', variant: 'destructive' });
    }
  }

  async function schedulePickup(asset: OverdueAsset) {
    try {
      const { error } = await supabase.from('alerts').insert({
        alert_type: 'overdue_pickup_needed',
        entity_type: 'order',
        entity_id: asset.order_id,
        severity: 'critical',
        title: `Schedule pickup ASAP: ${asset.asset_code}`,
        message: `Asset ${asset.asset_code} is ${asset.overdue_days} days overdue. Customer: ${asset.customer_name || 'Unknown'}`,
        metadata: {
          asset_id: asset.asset_id,
          customer_id: asset.customer_id,
          days_out: asset.days_out,
          overdue_days: asset.overdue_days,
        },
      });

      if (error) throw error;
      
      toast({ title: 'Task Created', description: 'Pickup task added to dispatch queue' });
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to create task', variant: 'destructive' });
    }
  }

  const totalBillable = overdueAssets.reduce((sum, a) => sum + a.billable_days * config.daily_rate, 0);
  const criticalCount = overdueAssets.filter(a => a.overdue_days >= config.escalation_days).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Overdue Billing</h1>
          <p className="text-muted-foreground">
            Track and bill overdue rental periods • Mode: <Badge variant={config.messaging_mode === 'LIVE' ? 'default' : 'secondary'}>{config.messaging_mode}</Badge>
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={runBillingNow} disabled={isRunning}>
            {isRunning ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run Billing Now
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Overdue Assets</CardDescription>
            <CardTitle className="text-2xl">{overdueAssets.length}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-3 h-3 text-amber-500" />
              {criticalCount} critical (≥{config.escalation_days} days)
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Billable Today</CardDescription>
            <CardTitle className="text-2xl text-green-600">${totalBillable.toFixed(2)}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">@ ${config.daily_rate}/day rate</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Auto-Bill Limit</CardDescription>
            <CardTitle className="text-2xl">${config.max_auto_bill}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">Higher amounts need approval</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Last Run</CardDescription>
            <CardTitle className="text-lg">
              {lastRun ? (
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-green-500" />
                  {lastRun.records_processed} processed
                </span>
              ) : (
                'Never'
              )}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {lastRun ? format(new Date(lastRun.created_at), 'MMM d, h:mm a') : 'Run billing to start'}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Overdue Table */}
      <Card>
        <CardHeader>
          <CardTitle>Overdue Assets</CardTitle>
          <CardDescription>Assets past their included rental period</CardDescription>
        </CardHeader>
        <CardContent>
          {overdueAssets.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Clock className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No overdue assets at this time</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Asset</TableHead>
                  <TableHead>Customer</TableHead>
                  <TableHead className="text-center">Days Out</TableHead>
                  <TableHead className="text-center">Included</TableHead>
                  <TableHead className="text-center">Overdue</TableHead>
                  <TableHead className="text-center">Billed</TableHead>
                  <TableHead className="text-center">Billable</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {overdueAssets.map((asset) => {
                  const amount = asset.billable_days * config.daily_rate;
                  const isCritical = asset.overdue_days >= config.escalation_days;
                  const needsApproval = amount > config.max_auto_bill;

                  return (
                    <TableRow key={asset.asset_id} className={isCritical ? 'bg-red-50 dark:bg-red-950/20' : ''}>
                      <TableCell>
                        <div className="font-medium">{asset.asset_code}</div>
                        <div className="text-xs text-muted-foreground">{asset.order_id.slice(0, 8)}...</div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <div>
                            <div className="font-medium">{asset.customer_name || 'Unknown'}</div>
                            {asset.customer_phone && (
                              <div className="text-xs text-muted-foreground flex items-center gap-1">
                                <Phone className="w-3 h-3" />
                                {asset.customer_phone}
                              </div>
                            )}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell className="text-center">
                        <Badge variant="outline">{asset.days_out}</Badge>
                      </TableCell>
                      <TableCell className="text-center">{asset.included_days}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant={isCritical ? 'destructive' : 'secondary'}>
                          +{asset.overdue_days}
                        </Badge>
                      </TableCell>
                      <TableCell className="text-center">{asset.billed_overdue_days_total}</TableCell>
                      <TableCell className="text-center">
                        <Badge variant="default">{asset.billable_days}</Badge>
                      </TableCell>
                      <TableCell className="text-right font-medium">
                        ${amount.toFixed(2)}
                        {needsApproval && (
                          <div className="text-xs text-amber-600">Needs approval</div>
                        )}
                      </TableCell>
                      <TableCell>
                        <div className="flex gap-1">
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={() => createApproval(asset)}
                          >
                            <FileText className="w-3 h-3 mr-1" />
                            Approval
                          </Button>
                          <Button 
                            variant={isCritical ? 'destructive' : 'outline'} 
                            size="sm"
                            onClick={() => schedulePickup(asset)}
                          >
                            <Calendar className="w-3 h-3 mr-1" />
                            Pickup
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  );
                })}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
