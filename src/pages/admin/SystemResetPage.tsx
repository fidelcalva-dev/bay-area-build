import { useState } from 'react';
import { Shield, AlertTriangle, Trash2, Archive, CheckCircle2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Checkbox } from '@/components/ui/checkbox';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

type ResetMode = 'leads_only' | 'sales_quotes' | 'operations' | 'full';

interface ModeConfig {
  label: string;
  description: string;
  color: string;
  tables: string[];
  preserves: string[];
}

const MODES: Record<ResetMode, ModeConfig> = {
  leads_only: {
    label: 'Leads Only',
    description: 'Clears leads, events, AI chat sessions, and lifecycle data. Keeps quotes, customers, orders.',
    color: 'bg-amber-500',
    tables: [
      'sales_leads', 'lead_events', 'lead_actions', 'lead_activity_log', 'lead_addresses',
      'lead_alerts', 'lead_card_info', 'lead_dedup_keys', 'lead_handoff_packets',
      'ai_chat_messages', 'ai_chat_sessions', 'lifecycle_alerts', 'lifecycle_events',
      'lifecycle_entities', 'lead_fallback_queue', 'assistant_learning',
    ],
    preserves: ['quotes', 'customers', 'orders', 'invoices', 'runs', 'config', 'assets', 'SEO'],
  },
  sales_quotes: {
    label: 'Sales + Quotes',
    description: 'Clears leads and all quote data. Keeps customers, orders, and invoices.',
    color: 'bg-orange-500',
    tables: [
      'sales_leads', 'lead_events', 'quotes', 'quote_events', 'quote_contracts',
      'calculator_estimates', 'calculator_logs', 'ai_chat_messages', 'ai_chat_sessions',
      'lifecycle_alerts', 'lifecycle_events', 'lifecycle_entities',
    ],
    preserves: ['customers', 'orders', 'invoices', 'runs', 'config', 'assets', 'SEO'],
  },
  operations: {
    label: 'Operations Reset',
    description: 'Clears leads, quotes, orders, runs, and dispatch. Keeps master data and config.',
    color: 'bg-red-500',
    tables: [
      'sales_leads', 'lead_events', 'quotes', 'orders', 'runs', 'run_events',
      'run_checkpoints', 'run_routes', 'facility_assignments', 'call_events',
      'message_logs', 'inventory_movements',
    ],
    preserves: ['customers', 'invoices', 'config', 'assets', 'drivers', 'trucks', 'SEO', 'pricing'],
  },
  full: {
    label: 'Full Operational Reset',
    description: 'Clears ALL operational data: leads, quotes, customers, orders, invoices, logs. Preserves system config, assets, pricing, SEO.',
    color: 'bg-red-700',
    tables: [
      'sales_leads', 'lead_events', 'quotes', 'customers', 'orders', 'invoices',
      'payments', 'runs', 'run_events', 'call_events', 'message_logs',
      'assistant_learning', 'ai_chat_sessions', 'ai_chat_messages',
      'lifecycle_events', 'lifecycle_entities', 'approval_requests',
    ],
    preserves: ['config_settings', 'yards', 'facilities', 'assets_dumpsters', 'drivers', 'trucks', 'pricing_zones', 'dumpster_sizes', 'SEO tables', 'user_roles'],
  },
};

export default function SystemResetPage() {
  const [selectedMode, setSelectedMode] = useState<ResetMode | null>(null);
  const [understood, setUnderstood] = useState(false);
  const [confirmText, setConfirmText] = useState('');
  const [isExecuting, setIsExecuting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const canExecute = selectedMode && understood && confirmText === 'RESET CALSAN CRM';

  const executeReset = async () => {
    if (!canExecute || !selectedMode) return;

    setIsExecuting(true);
    setResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('system-reset', {
        body: { mode: selectedMode, confirmation: 'RESET CALSAN CRM' },
      });

      if (error) throw error;

      setResult(data);
      toast.success(`Reset completed: ${data.tables_cleared?.length || 0} tables cleared`);
    } catch (err: any) {
      toast.error(`Reset failed: ${err.message}`);
      setResult({ error: err.message });
    } finally {
      setIsExecuting(false);
      setUnderstood(false);
      setConfirmText('');
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-8">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center">
          <Shield className="w-6 h-6 text-destructive" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">System Reset</h1>
          <p className="text-sm text-muted-foreground">Archive and clear operational data safely</p>
        </div>
      </div>

      {/* Warning Banner */}
      <Card className="border-destructive/50 bg-destructive/5">
        <CardContent className="flex items-start gap-3 pt-4">
          <AlertTriangle className="w-5 h-5 text-destructive shrink-0 mt-0.5" />
          <div className="text-sm">
            <p className="font-semibold text-destructive">Danger Zone</p>
            <p className="text-muted-foreground">
              This tool archives operational data and then clears active tables. 
              System configuration, assets, pricing, SEO, and user accounts are never affected.
              All data is copied to archive tables before deletion.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Mode Selection */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Select Reset Mode</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {(Object.entries(MODES) as [ResetMode, ModeConfig][]).map(([key, cfg]) => (
            <Card
              key={key}
              className={`cursor-pointer transition-all ${
                selectedMode === key ? 'ring-2 ring-primary border-primary' : 'hover:border-muted-foreground/40'
              }`}
              onClick={() => { setSelectedMode(key); setResult(null); }}
            >
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base">{cfg.label}</CardTitle>
                  <div className={`w-3 h-3 rounded-full ${cfg.color}`} />
                </div>
                <CardDescription className="text-xs">{cfg.description}</CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="text-xs text-muted-foreground">
                  <span className="font-medium">Clears:</span>{' '}
                  {cfg.tables.slice(0, 4).join(', ')}
                  {cfg.tables.length > 4 && ` +${cfg.tables.length - 4} more`}
                </div>
                <div className="text-xs text-emerald-600 mt-1">
                  <span className="font-medium">Preserves:</span>{' '}
                  {cfg.preserves.join(', ')}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      {/* Selected Mode Detail */}
      {selectedMode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-base">
              <Archive className="w-4 h-4" />
              Tables to Archive & Clear — {MODES[selectedMode].label}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1.5">
              {MODES[selectedMode].tables.map((t) => (
                <Badge key={t} variant="outline" className="text-xs font-mono">
                  <Trash2 className="w-3 h-3 mr-1 text-destructive" />
                  {t}
                </Badge>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t">
              <p className="text-xs font-medium text-emerald-600 mb-2">Protected (never cleared):</p>
              <div className="flex flex-wrap gap-1.5">
                {MODES[selectedMode].preserves.map((t) => (
                  <Badge key={t} variant="secondary" className="text-xs">
                    <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-600" />
                    {t}
                  </Badge>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Triple Confirmation */}
      {selectedMode && (
        <Card className="border-destructive/30">
          <CardHeader>
            <CardTitle className="text-base text-destructive">Confirm Reset</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {/* Step 1: Checkbox */}
            <div className="flex items-start gap-3">
              <Checkbox
                id="understood"
                checked={understood}
                onCheckedChange={(v) => setUnderstood(v === true)}
              />
              <Label htmlFor="understood" className="text-sm leading-5 cursor-pointer">
                I understand this will archive and permanently clear operational data from active tables. 
                This action cannot be undone from this interface.
              </Label>
            </div>

            {/* Step 2: Type confirmation */}
            <div className="space-y-2">
              <Label className="text-sm">
                Type <span className="font-mono font-bold text-destructive">RESET CALSAN CRM</span> to confirm:
              </Label>
              <Input
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder="Type confirmation text..."
                className="font-mono"
                disabled={!understood}
              />
            </div>

            {/* Step 3: Execute */}
            <Button
              variant="destructive"
              size="lg"
              className="w-full"
              disabled={!canExecute || isExecuting}
              onClick={executeReset}
            >
              {isExecuting ? (
                <>
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Executing Reset...
                </>
              ) : (
                <>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Execute {MODES[selectedMode].label} Reset
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Results */}
      {result && (
        <Card className={result.error ? 'border-destructive' : 'border-emerald-500'}>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              {result.error ? (
                <AlertTriangle className="w-4 h-4 text-destructive" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              )}
              {result.error ? 'Reset Failed' : 'Reset Complete'}
            </CardTitle>
          </CardHeader>
          <CardContent>
            {result.error ? (
              <p className="text-sm text-destructive">{result.error}</p>
            ) : (
              <div className="space-y-3 text-sm">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <p className="font-medium">Mode</p>
                    <p className="text-muted-foreground">{result.mode}</p>
                  </div>
                  <div>
                    <p className="font-medium">Batch ID</p>
                    <p className="text-muted-foreground font-mono text-xs">{result.archive_batch_id?.slice(0, 8)}...</p>
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">Tables Archived ({result.tables_archived?.length || 0})</p>
                  <div className="flex flex-wrap gap-1">
                    {result.tables_archived?.map((t: string) => (
                      <Badge key={t} variant="secondary" className="text-xs font-mono">
                        {t}: {result.records_archived_count?.[t] || 0} rows
                      </Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <p className="font-medium mb-1">Tables Cleared ({result.tables_cleared?.length || 0})</p>
                  <div className="flex flex-wrap gap-1">
                    {result.tables_cleared?.map((t: string) => (
                      <Badge key={t} variant="outline" className="text-xs font-mono">{t}</Badge>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}
