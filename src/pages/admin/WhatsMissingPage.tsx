import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2, AlertTriangle, XCircle, RefreshCw, Loader2,
  Copy, Check, ChevronDown, ChevronRight, Shield, Zap,
  Phone, MessageSquare, Mail, CreditCard, MapPin, Users,
  TrendingUp, Settings, Globe
} from 'lucide-react';
import { toast } from 'sonner';

interface EnvVar { name: string; present: boolean; }
interface Webhook { service: string; label: string; url: string; configured: boolean; }

interface MissingConnection {
  id: string;
  category: string;
  item_key: string;
  title: string;
  priority: string;
  status: string;
  detected_reason: string;
  required_env_vars_json: EnvVar[];
  required_webhooks_json: Webhook[];
  manual_steps_json: string[];
  verification_steps_json: string[];
  last_scanned_at: string | null;
  created_at: string;
}

const CATEGORY_CONFIG: Record<string, { label: string; icon: any; color: string }> = {
  TELEPHONY: { label: 'Telephony', icon: Phone, color: 'text-blue-600' },
  MESSAGING: { label: 'Messaging', icon: MessageSquare, color: 'text-purple-600' },
  EMAIL: { label: 'Email', icon: Mail, color: 'text-orange-600' },
  PAYMENTS: { label: 'Payments', icon: CreditCard, color: 'text-green-600' },
  MAPS: { label: 'Maps & Routing', icon: MapPin, color: 'text-red-600' },
  LEADS: { label: 'Lead Sources', icon: Users, color: 'text-cyan-600' },
  ADS: { label: 'Google Ads', icon: TrendingUp, color: 'text-yellow-600' },
  GOOGLE_WORKSPACE: { label: 'Google Workspace', icon: Globe, color: 'text-indigo-600' },
  SECURITY: { label: 'Security', icon: Shield, color: 'text-rose-600' },
  OTHER: { label: 'Other', icon: Settings, color: 'text-gray-600' },
};

const PRIORITY_COLORS: Record<string, string> = {
  P0: 'bg-red-100 text-red-800 border-red-200',
  P1: 'bg-amber-100 text-amber-800 border-amber-200',
  P2: 'bg-blue-100 text-blue-800 border-blue-200',
};

export default function WhatsMissingPage() {
  const [items, setItems] = useState<MissingConnection[]>([]);
  const [scanning, setScanning] = useState(false);
  const [loading, setLoading] = useState(true);
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set());
  const [noteText, setNoteText] = useState<Record<string, string>>({});
  const [copiedUrl, setCopiedUrl] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchItems();
  }, []);

  const fetchItems = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('missing_connections')
      .select('*')
      .order('priority')
      .order('category');

    if (!error && data) {
      setItems(data as unknown as MissingConnection[]);
    }
    setLoading(false);
  };

  const runScan = async () => {
    setScanning(true);
    try {
      const { data, error } = await supabase.functions.invoke('scan-missing-connections');
      if (error) throw error;
      if (data?.items) {
        setItems(data.items as MissingConnection[]);
        toast.success(`Scan complete: ${data.total_items} items checked, ${data.p0_open} P0 blockers`);
      }
    } catch (err: any) {
      toast.error('Scan failed: ' + (err.message || 'Unknown error'));
    }
    setScanning(false);
  };

  const markStatus = async (id: string, newStatus: string) => {
    const note = noteText[id] || '';
    await supabase.from('missing_connections').update({ status: newStatus }).eq('id', id);
    await supabase.from('missing_connections_log').insert({
      item_id: id,
      action: newStatus === 'DONE' ? 'MARK_DONE' : 'MARK_OPEN',
      note: note || null,
    });
    setNoteText((prev) => ({ ...prev, [id]: '' }));
    toast.success(`Marked as ${newStatus}`);
    fetchItems();
  };

  const addNote = async (id: string) => {
    const note = noteText[id];
    if (!note?.trim()) return;
    await supabase.from('missing_connections_log').insert({
      item_id: id,
      action: 'NOTE',
      note,
    });
    setNoteText((prev) => ({ ...prev, [id]: '' }));
    toast.success('Note added');
  };

  const toggleExpand = (id: string) => {
    setExpandedItems((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });
  };

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopiedUrl(url);
    setTimeout(() => setCopiedUrl(null), 2000);
  };

  const p0Open = items.filter((i) => i.priority === 'P0' && i.status === 'OPEN');
  const goLiveReady = p0Open.length === 0 && items.length > 0;

  const filteredItems =
    activeTab === 'all'
      ? items
      : activeTab === 'open'
      ? items.filter((i) => i.status === 'OPEN')
      : activeTab === 'done'
      ? items.filter((i) => i.status === 'DONE')
      : items.filter((i) => i.priority === activeTab);

  const grouped = filteredItems.reduce((acc, item) => {
    (acc[item.category] = acc[item.category] || []).push(item);
    return acc;
  }, {} as Record<string, MissingConnection[]>);

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">What's Missing to Connect</h1>
          <p className="text-muted-foreground text-sm">
            Production readiness scanner — external integrations & manual setup items
          </p>
        </div>
        <Button onClick={runScan} disabled={scanning} className="gap-2">
          {scanning ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCw className="h-4 w-4" />}
          {scanning ? 'Scanning...' : 'Run Scan Now'}
        </Button>
      </div>

      {/* Go-Live Readiness Banner */}
      <Card className={goLiveReady
        ? 'border-green-300 bg-green-50 dark:bg-green-950/20'
        : 'border-red-300 bg-red-50 dark:bg-red-950/20'
      }>
        <CardContent className="p-4 flex items-center gap-4">
          {goLiveReady ? (
            <>
              <CheckCircle2 className="h-8 w-8 text-green-600 shrink-0" />
              <div>
                <h2 className="font-bold text-green-800 dark:text-green-300 text-lg">GO-LIVE READY</h2>
                <p className="text-green-700 dark:text-green-400 text-sm">All P0 blockers resolved. Platform is ready for production activation.</p>
              </div>
            </>
          ) : (
            <>
              <XCircle className="h-8 w-8 text-red-600 shrink-0" />
              <div>
                <h2 className="font-bold text-red-800 dark:text-red-300 text-lg">NOT READY — {p0Open.length} P0 Blocker{p0Open.length !== 1 ? 's' : ''}</h2>
                <p className="text-red-700 dark:text-red-400 text-sm">
                  {p0Open.map((i) => i.title).join(', ')}
                </p>
              </div>
            </>
          )}
        </CardContent>
      </Card>

      {/* Summary stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        <Card className="p-3 text-center cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('all')}>
          <div className="text-2xl font-bold">{items.length}</div>
          <div className="text-xs text-muted-foreground">Total Items</div>
        </Card>
        <Card className="p-3 text-center cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('P0')}>
          <div className="text-2xl font-bold text-red-600">{items.filter(i => i.priority === 'P0').length}</div>
          <div className="text-xs text-muted-foreground">P0 Blockers</div>
        </Card>
        <Card className="p-3 text-center cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('P1')}>
          <div className="text-2xl font-bold text-amber-600">{items.filter(i => i.priority === 'P1').length}</div>
          <div className="text-xs text-muted-foreground">P1 Important</div>
        </Card>
        <Card className="p-3 text-center cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('open')}>
          <div className="text-2xl font-bold text-orange-600">{items.filter(i => i.status === 'OPEN').length}</div>
          <div className="text-xs text-muted-foreground">Open</div>
        </Card>
        <Card className="p-3 text-center cursor-pointer hover:bg-muted/50" onClick={() => setActiveTab('done')}>
          <div className="text-2xl font-bold text-green-600">{items.filter(i => i.status === 'DONE').length}</div>
          <div className="text-xs text-muted-foreground">Done</div>
        </Card>
      </div>

      {/* Filter Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="open">Open</TabsTrigger>
          <TabsTrigger value="P0">P0</TabsTrigger>
          <TabsTrigger value="P1">P1</TabsTrigger>
          <TabsTrigger value="P2">P2</TabsTrigger>
          <TabsTrigger value="done">Done</TabsTrigger>
        </TabsList>
      </Tabs>

      {/* Loading State */}
      {loading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : items.length === 0 ? (
        <Card className="p-8 text-center">
          <Zap className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
          <h3 className="font-semibold text-lg mb-2">No scan data yet</h3>
          <p className="text-muted-foreground mb-4">Click "Run Scan Now" to detect missing connections.</p>
        </Card>
      ) : (
        /* Items grouped by category */
        <div className="space-y-6">
          {Object.entries(grouped).map(([category, catItems]) => {
            const config = CATEGORY_CONFIG[category] || CATEGORY_CONFIG.OTHER;
            const Icon = config.icon;

            return (
              <div key={category}>
                <div className="flex items-center gap-2 mb-3">
                  <Icon className={`h-5 w-5 ${config.color}`} />
                  <h3 className="font-semibold text-lg">{config.label}</h3>
                  <Badge variant="outline" className="ml-1">{catItems.length}</Badge>
                </div>

                <div className="space-y-3">
                  {catItems.map((item) => {
                    const expanded = expandedItems.has(item.id);
                    const envVars = item.required_env_vars_json || [];
                    const webhooks = item.required_webhooks_json || [];
                    const steps = item.manual_steps_json || [];
                    const verifySteps = item.verification_steps_json || [];

                    return (
                      <Card key={item.id} className={item.status === 'DONE' ? 'opacity-60' : ''}>
                        <CardHeader
                          className="p-4 cursor-pointer"
                          onClick={() => toggleExpand(item.id)}
                        >
                          <div className="flex items-center gap-3">
                            {expanded ? (
                              <ChevronDown className="h-4 w-4 text-muted-foreground shrink-0" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
                            )}

                            <Badge className={PRIORITY_COLORS[item.priority] + ' text-xs shrink-0'}>
                              {item.priority}
                            </Badge>

                            {item.status === 'DONE' ? (
                              <CheckCircle2 className="h-4 w-4 text-green-600 shrink-0" />
                            ) : item.priority === 'P0' ? (
                              <XCircle className="h-4 w-4 text-red-500 shrink-0" />
                            ) : (
                              <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0" />
                            )}

                            <div className="flex-1 min-w-0">
                              <CardTitle className="text-sm font-medium">{item.title}</CardTitle>
                              <p className="text-xs text-muted-foreground mt-0.5 truncate">
                                {item.detected_reason}
                              </p>
                            </div>

                            <Badge variant={item.status === 'DONE' ? 'default' : 'outline'} className="shrink-0">
                              {item.status}
                            </Badge>
                          </div>
                        </CardHeader>

                        {expanded && (
                          <CardContent className="px-4 pb-4 pt-0 space-y-4">
                            {/* Env vars */}
                            {envVars.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                  Environment Variables
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-1">
                                  {envVars.map((v) => (
                                    <div key={v.name} className="flex items-center gap-2 text-sm font-mono">
                                      {v.present ? (
                                        <CheckCircle2 className="h-3.5 w-3.5 text-green-600" />
                                      ) : (
                                        <XCircle className="h-3.5 w-3.5 text-red-500" />
                                      )}
                                      <span className={v.present ? 'text-muted-foreground' : 'text-foreground'}>
                                        {v.name}
                                      </span>
                                      <span className="text-xs">
                                        {v.present ? '✓ present' : '✗ missing'}
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Webhooks */}
                            {webhooks.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                  Webhook URLs (copy & paste into {webhooks[0]?.service})
                                </h4>
                                <div className="space-y-2">
                                  {webhooks.map((wh, idx) => (
                                    <div key={idx} className="flex items-center gap-2 bg-muted/50 rounded p-2">
                                      <div className="flex-1 min-w-0">
                                        <div className="text-xs text-muted-foreground">{wh.label}</div>
                                        <code className="text-xs break-all">{wh.url}</code>
                                      </div>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() => copyUrl(wh.url)}
                                        className="shrink-0"
                                      >
                                        {copiedUrl === wh.url ? (
                                          <Check className="h-3.5 w-3.5 text-green-600" />
                                        ) : (
                                          <Copy className="h-3.5 w-3.5" />
                                        )}
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}

                            {/* Steps */}
                            {steps.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                  Setup Steps
                                </h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm">
                                  {steps.map((s, idx) => (
                                    <li key={idx}>{s}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Verification */}
                            {verifySteps.length > 0 && (
                              <div>
                                <h4 className="text-xs font-semibold text-muted-foreground uppercase mb-2">
                                  Verification
                                </h4>
                                <ol className="list-decimal list-inside space-y-1 text-sm text-muted-foreground">
                                  {verifySteps.map((s, idx) => (
                                    <li key={idx}>{s}</li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Actions */}
                            <div className="flex items-end gap-3 pt-2 border-t">
                              <div className="flex-1">
                                <Textarea
                                  placeholder="Add a note (optional)..."
                                  value={noteText[item.id] || ''}
                                  onChange={(e) =>
                                    setNoteText((prev) => ({ ...prev, [item.id]: e.target.value }))
                                  }
                                  className="min-h-[60px] text-sm"
                                />
                              </div>
                              <div className="flex flex-col gap-2 shrink-0">
                                {item.status === 'OPEN' ? (
                                  <Button
                                    size="sm"
                                    onClick={() => markStatus(item.id, 'DONE')}
                                    className="gap-1"
                                  >
                                    <CheckCircle2 className="h-3.5 w-3.5" />
                                    Mark Done
                                  </Button>
                                ) : (
                                  <Button
                                    size="sm"
                                    variant="outline"
                                    onClick={() => markStatus(item.id, 'OPEN')}
                                    className="gap-1"
                                  >
                                    Re-open
                                  </Button>
                                )}
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => addNote(item.id)}
                                  disabled={!noteText[item.id]?.trim()}
                                >
                                  Add Note
                                </Button>
                              </div>
                            </div>
                          </CardContent>
                        )}
                      </Card>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
