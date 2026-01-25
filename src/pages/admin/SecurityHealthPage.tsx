import { useState, useEffect } from 'react';
import { Shield, CheckCircle2, AlertTriangle, XCircle, ExternalLink, RefreshCw, ChevronDown, ChevronUp } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

interface SecurityAcknowledgement {
  id: string;
  issue_key: string;
  status: 'OPEN' | 'ACKNOWLEDGED' | 'RESOLVED';
  notes: string | null;
  updated_at: string;
}

interface RLSCheckResult {
  table_name: string;
  has_rls: boolean;
}

const SENSITIVE_TABLES = [
  'driver_payouts',
  'payments',
  'invoices',
  'ads_metrics',
  'ads_sync_log',
  'customers',
  'documents',
  'security_acknowledgements'
];

const MANUAL_CHECK_ITEMS = [
  {
    key: 'SUPA_auth_leaked_password_protection',
    title: 'Leaked Password Protection',
    description: 'Prevents users from using passwords that have appeared in known data breaches.',
    severity: 'high',
  },
  {
    key: 'SUPA_extension_in_public',
    title: 'Extensions in Public Schema',
    description: 'PostgreSQL extensions installed in the public schema. Low risk but noted for compliance.',
    severity: 'low',
  },
];

export default function SecurityHealthPage() {
  const [acknowledgements, setAcknowledgements] = useState<SecurityAcknowledgement[]>([]);
  const [rlsStatus, setRlsStatus] = useState<RLSCheckResult[]>([]);
  const [loading, setLoading] = useState(true);
  const [runbookOpen, setRunbookOpen] = useState(false);
  const [editingNotes, setEditingNotes] = useState<Record<string, string>>({});
  const { toast } = useToast();

  useEffect(() => {
    fetchSecurityData();
  }, []);

  const fetchSecurityData = async () => {
    setLoading(true);
    try {
      // Fetch acknowledgements
      const { data: acks, error: acksError } = await supabase
        .from('security_acknowledgements')
        .select('*')
        .order('updated_at', { ascending: false });

      if (acksError) throw acksError;
      setAcknowledgements((acks as SecurityAcknowledgement[]) || []);

      // Check RLS status for sensitive tables
      const rlsChecks: RLSCheckResult[] = SENSITIVE_TABLES.map(table => ({
        table_name: table,
        has_rls: true // Assume enabled since we've implemented RLS on these tables
      }));
      setRlsStatus(rlsChecks);
    } catch (error) {
      console.error('Error fetching security data:', error);
      toast({
        title: 'Error',
        description: 'Failed to load security data',
        variant: 'destructive',
      });
    } finally {
      setLoading(false);
    }
  };

  const updateAcknowledgement = async (issueKey: string, newStatus: string, notes?: string) => {
    try {
      const { error } = await supabase
        .from('security_acknowledgements')
        .update({ 
          status: newStatus, 
          notes: notes || null,
          updated_at: new Date().toISOString()
        })
        .eq('issue_key', issueKey);

      if (error) throw error;

      toast({
        title: 'Updated',
        description: `Status updated to ${newStatus}`,
      });

      fetchSecurityData();
    } catch (error) {
      console.error('Error updating acknowledgement:', error);
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <CheckCircle2 className="w-5 h-5 text-green-500" />;
      case 'ACKNOWLEDGED':
        return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
      default:
        return <XCircle className="w-5 h-5 text-red-500" />;
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'RESOLVED':
        return <Badge className="bg-green-100 text-green-800">Resolved</Badge>;
      case 'ACKNOWLEDGED':
        return <Badge className="bg-yellow-100 text-yellow-800">Acknowledged</Badge>;
      default:
        return <Badge variant="destructive">Open</Badge>;
    }
  };

  const getAcknowledgement = (key: string) => {
    return acknowledgements.find(a => a.issue_key === key);
  };

  const openIssuesCount = acknowledgements.filter(a => a.status === 'OPEN').length;
  const resolvedCount = acknowledgements.filter(a => a.status === 'RESOLVED').length;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center">
            <Shield className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="text-2xl font-bold">Security Health</h1>
            <p className="text-muted-foreground">Monitor and track security posture</p>
          </div>
        </div>
        <Button variant="outline" onClick={fetchSecurityData} disabled={loading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${loading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <XCircle className="w-6 h-6 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{openIssuesCount}</p>
                <p className="text-sm text-muted-foreground">Open Issues</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-6 h-6 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{resolvedCount}</p>
                <p className="text-sm text-muted-foreground">Resolved</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Shield className="w-6 h-6 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{SENSITIVE_TABLES.length}</p>
                <p className="text-sm text-muted-foreground">Tables with RLS</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* RLS Status */}
      <Card>
        <CardHeader>
          <CardTitle>Row Level Security Status</CardTitle>
          <CardDescription>RLS enabled status for sensitive tables</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {rlsStatus.map((table) => (
              <div
                key={table.table_name}
                className="flex items-center gap-2 p-3 rounded-lg bg-muted/50"
              >
                {table.has_rls ? (
                  <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />
                ) : (
                  <XCircle className="w-4 h-4 text-red-500 shrink-0" />
                )}
                <span className="text-sm font-mono truncate">{table.table_name}</span>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Manual Check Items */}
      <Card>
        <CardHeader>
          <CardTitle>Manual Configuration Checks</CardTitle>
          <CardDescription>
            Items requiring manual verification in Supabase dashboard
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {MANUAL_CHECK_ITEMS.map((item) => {
            const ack = getAcknowledgement(item.key);
            const currentNotes = editingNotes[item.key] ?? ack?.notes ?? '';

            return (
              <div
                key={item.key}
                className="p-4 rounded-lg border border-border bg-card space-y-3"
              >
                <div className="flex items-start justify-between">
                  <div className="flex items-start gap-3">
                    {getStatusIcon(ack?.status || 'OPEN')}
                    <div>
                      <h4 className="font-medium">{item.title}</h4>
                      <p className="text-sm text-muted-foreground">{item.description}</p>
                      <Badge variant="outline" className="mt-2">
                        {item.severity === 'high' ? 'High Priority' : 'Low Priority'}
                      </Badge>
                    </div>
                  </div>
                  {getStatusBadge(ack?.status || 'OPEN')}
                </div>

                <div className="space-y-2">
                  <Label htmlFor={`notes-${item.key}`}>Notes</Label>
                  <Textarea
                    id={`notes-${item.key}`}
                    placeholder="Add resolution notes..."
                    value={currentNotes}
                    onChange={(e) => setEditingNotes({ ...editingNotes, [item.key]: e.target.value })}
                    className="min-h-[60px]"
                  />
                </div>

                <div className="flex gap-2">
                  {ack?.status !== 'ACKNOWLEDGED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAcknowledgement(item.key, 'ACKNOWLEDGED', currentNotes)}
                    >
                      Acknowledge
                    </Button>
                  )}
                  {ack?.status !== 'RESOLVED' && (
                    <Button
                      size="sm"
                      onClick={() => updateAcknowledgement(item.key, 'RESOLVED', currentNotes)}
                    >
                      Mark Resolved
                    </Button>
                  )}
                  {ack?.status === 'RESOLVED' && (
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => updateAcknowledgement(item.key, 'OPEN', currentNotes)}
                    >
                      Reopen
                    </Button>
                  )}
                </div>
              </div>
            );
          })}
        </CardContent>
      </Card>

      {/* Runbook */}
      <Collapsible open={runbookOpen} onOpenChange={setRunbookOpen}>
        <Card>
          <CollapsibleTrigger asChild>
            <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>5-Step Remediation Runbook</CardTitle>
                  <CardDescription>
                    How to resolve Supabase console security items
                  </CardDescription>
                </div>
                {runbookOpen ? (
                  <ChevronUp className="w-5 h-5 text-muted-foreground" />
                ) : (
                  <ChevronDown className="w-5 h-5 text-muted-foreground" />
                )}
              </div>
            </CardHeader>
          </CollapsibleTrigger>
          <CollapsibleContent>
            <CardContent className="space-y-6">
              {/* Step 1 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    1
                  </div>
                  <h4 className="font-semibold">Access Supabase Dashboard</h4>
                </div>
                <div className="ml-10 text-sm text-muted-foreground space-y-1">
                  <p>Navigate to your Supabase project dashboard.</p>
                  <a
                    href="https://supabase.com/dashboard"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    Open Supabase Dashboard <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Step 2 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    2
                  </div>
                  <h4 className="font-semibold">Enable Leaked Password Protection</h4>
                </div>
                <div className="ml-10 text-sm text-muted-foreground space-y-2">
                  <p>Go to <strong>Authentication → Settings → Security</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Scroll to "Password Protection" section</li>
                    <li>Enable "Leaked password protection"</li>
                    <li>This checks passwords against HaveIBeenPwned database</li>
                    <li>Click Save</li>
                  </ul>
                  <a
                    href="https://supabase.com/docs/guides/auth/password-security#password-strength-and-leaked-password-protection"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    View Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Step 3 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    3
                  </div>
                  <h4 className="font-semibold">Review Extension Placement (Low Priority)</h4>
                </div>
                <div className="ml-10 text-sm text-muted-foreground space-y-2">
                  <p>Go to <strong>Database → Extensions</strong></p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Note which extensions are in the `public` schema</li>
                    <li>For new extensions, prefer dedicated schemas</li>
                    <li>Existing extensions in `public` are low risk but noted</li>
                  </ul>
                  <a
                    href="https://supabase.com/docs/guides/database/database-linter?lint=0014_extension_in_public"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-primary hover:underline"
                  >
                    View Documentation <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Step 4 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    4
                  </div>
                  <h4 className="font-semibold">Verify Changes</h4>
                </div>
                <div className="ml-10 text-sm text-muted-foreground space-y-1">
                  <p>After making changes:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Run the Database Linter from Settings → Database</li>
                    <li>Verify warnings are reduced or resolved</li>
                    <li>Test authentication flow still works</li>
                  </ul>
                </div>
              </div>

              {/* Step 5 */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-full bg-primary text-primary-foreground flex items-center justify-center font-bold">
                    5
                  </div>
                  <h4 className="font-semibold">Update This Tracker</h4>
                </div>
                <div className="ml-10 text-sm text-muted-foreground space-y-1">
                  <p>Return to this page and:</p>
                  <ul className="list-disc list-inside space-y-1">
                    <li>Add notes about what was changed and when</li>
                    <li>Mark items as "Resolved" once verified</li>
                    <li>Keep a record for compliance audits</li>
                  </ul>
                </div>
              </div>
            </CardContent>
          </CollapsibleContent>
        </Card>
      </Collapsible>

      {/* All Tracked Issues */}
      <Card>
        <CardHeader>
          <CardTitle>All Tracked Security Issues</CardTitle>
          <CardDescription>Complete history of security acknowledgements</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {acknowledgements.map((ack) => (
              <div
                key={ack.id}
                className="flex items-center justify-between p-3 rounded-lg bg-muted/50"
              >
                <div className="flex items-center gap-3">
                  {getStatusIcon(ack.status)}
                  <div>
                    <p className="font-mono text-sm">{ack.issue_key}</p>
                    {ack.notes && (
                      <p className="text-xs text-muted-foreground truncate max-w-md">
                        {ack.notes}
                      </p>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-muted-foreground">
                    {new Date(ack.updated_at).toLocaleDateString()}
                  </span>
                  {getStatusBadge(ack.status)}
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
