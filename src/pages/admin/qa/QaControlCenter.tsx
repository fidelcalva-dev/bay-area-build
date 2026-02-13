import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { 
  Play, RefreshCw, Download, CheckCircle2, XCircle, AlertTriangle, 
  SkipForward, Shield, Calculator, DollarSign, Package, Users,
  MessageSquare, Phone, Truck, Receipt, TrendingUp, Bot, Globe, Lock,
  ExternalLink, ToggleLeft, Eye
} from 'lucide-react';
import { 
  fetchFeatureFlags, 
  updateFeatureFlag, 
  type FeatureFlags 
} from '@/lib/featureFlags';
import { toast } from 'sonner';
import { format } from 'date-fns';

interface QaResult {
  id: string;
  check_key: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'SKIP';
  details_json: Record<string, unknown>;
  fix_suggestion: string | null;
  evidence: string | null;
  admin_route: string | null;
  created_at: string;
}

interface QaCheck {
  id: string;
  category: string;
  check_key: string;
  title: string;
  description: string;
  severity: string;
  is_active: boolean;
}

interface QaRun {
  id: string;
  started_at: string;
  completed_at: string | null;
  status: string;
  summary_json: {
    total?: number;
    pass?: number;
    fail?: number;
    warn?: number;
    skip?: number;
    by_category?: Record<string, { pass: number; fail: number; warn: number; skip: number }>;
  };
}

const categoryIcons: Record<string, typeof Shield> = {
  WEBSITE: Globe,
  CALCULATOR: Calculator,
  PRICING: DollarSign,
  HEAVY: Package,
  CRM: Users,
  LEADS: Users,
  MESSAGING: MessageSquare,
  TELEPHONY: Phone,
  DISPATCH: Truck,
  DRIVER: Truck,
  BILLING: Receipt,
  ADS: TrendingUp,
  MASTER_AI: Bot,
  GOOGLE: Globe,
  SECURITY: Lock,
};

const statusColors: Record<string, string> = {
  PASS: 'bg-green-500/10 text-green-600 border-green-500/20',
  FAIL: 'bg-red-500/10 text-red-600 border-red-500/20',
  WARN: 'bg-yellow-500/10 text-yellow-600 border-yellow-500/20',
  SKIP: 'bg-muted text-muted-foreground border-border',
};

const severityColors: Record<string, string> = {
  P0: 'bg-red-500 text-white',
  P1: 'bg-yellow-500 text-black',
  P2: 'bg-blue-500 text-white',
};

export default function QaControlCenter() {
  const queryClient = useQueryClient();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [featureFlags, setFeatureFlags] = useState<FeatureFlags | null>(null);
  const [updatingFlag, setUpdatingFlag] = useState<string | null>(null);

  // Fetch feature flags
  useEffect(() => {
    fetchFeatureFlags().then(setFeatureFlags);
  }, []);

  // Fetch checks
  const { data: checks = [] } = useQuery({
    queryKey: ['qa-checks'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_checks')
        .select('*')
        .eq('is_active', true)
        .order('category', { ascending: true });
      if (error) throw error;
      return data as QaCheck[];
    },
  });

  // Fetch latest run
  const { data: latestRun, isLoading: runLoading } = useQuery({
    queryKey: ['qa-latest-run'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('qa_runs')
        .select('*')
        .order('started_at', { ascending: false })
        .limit(1)
        .single();
      if (error && error.code !== 'PGRST116') throw error;
      return data as QaRun | null;
    },
  });

  // Fetch results for latest run
  const { data: results = [] } = useQuery({
    queryKey: ['qa-results', latestRun?.id],
    queryFn: async () => {
      if (!latestRun?.id) return [];
      const { data, error } = await supabase
        .from('qa_results')
        .select('*')
        .eq('qa_run_id', latestRun.id)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return data as QaResult[];
    },
    enabled: !!latestRun?.id,
  });

  // Run checks mutation
  const runChecksMutation = useMutation({
    mutationFn: async () => {
      const response = await supabase.functions.invoke('qa-runner', {
        body: { run_all: true },
      });
      if (response.error) throw response.error;
      return response.data;
    },
    onSuccess: () => {
      toast.success('QA checks completed');
      queryClient.invalidateQueries({ queryKey: ['qa-latest-run'] });
      queryClient.invalidateQueries({ queryKey: ['qa-results'] });
    },
    onError: (error: Error) => {
      toast.error(`Failed to run checks: ${error.message}`);
    },
  });

  // Get unique categories
  const categories = [...new Set(checks.map(c => c.category))];

  // Filter results by category
  const filteredResults = selectedCategory === 'all' 
    ? results 
    : results.filter(r => {
        const check = checks.find(c => c.check_key === r.check_key);
        return check?.category === selectedCategory;
      });

  // Get P0 failures
  const p0Failures = results.filter(r => {
    const check = checks.find(c => c.check_key === r.check_key);
    return check?.severity === 'P0' && r.status === 'FAIL';
  });

  // Calculate Go-Live readiness
  const isGoLiveReady = p0Failures.length === 0 && results.length > 0;

  // Handle feature flag toggle
  const handleFlagToggle = async (key: keyof FeatureFlags, currentValue: boolean) => {
    // Block enabling v2 themes if not go-live ready
    if (!currentValue && !isGoLiveReady && (key === 'public_theme.v2_uber' || key === 'quote_flow.v2_minimal' || key === 'quote_flow.v3')) {
      toast.error('Cannot enable v2/v3 features until all P0 checks pass');
      return;
    }

    setUpdatingFlag(key);
    const result = await updateFeatureFlag(key, !currentValue);
    
    if (result.success) {
      setFeatureFlags(prev => prev ? { ...prev, [key]: !currentValue } : null);
      toast.success(`Feature flag ${key} ${!currentValue ? 'enabled' : 'disabled'}`);
    } else {
      toast.error(`Failed to update: ${result.error}`);
    }
    setUpdatingFlag(null);
  };

  // Generate report
  const generateReport = () => {
    const summary = latestRun?.summary_json || {};
    let report = `# QA CONTROL CENTER REPORT\n`;
    report += `## Generated: ${format(new Date(), 'yyyy-MM-dd HH:mm:ss')}\n\n`;
    report += `---\n\n`;
    report += `## SUMMARY\n\n`;
    report += `| Metric | Count |\n`;
    report += `|--------|-------|\n`;
    report += `| Total Checks | ${summary.total || 0} |\n`;
    report += `| Passed | ${summary.pass || 0} |\n`;
    report += `| Failed | ${summary.fail || 0} |\n`;
    report += `| Warnings | ${summary.warn || 0} |\n`;
    report += `| Skipped | ${summary.skip || 0} |\n\n`;

    report += `## GO-LIVE READINESS: ${isGoLiveReady ? '✅ READY' : '❌ NOT READY'}\n\n`;

    if (p0Failures.length > 0) {
      report += `### P0 Failures (Blocking)\n\n`;
      for (const failure of p0Failures) {
        const check = checks.find(c => c.check_key === failure.check_key);
        report += `- **${check?.title || failure.check_key}**: ${failure.evidence || 'No evidence'}\n`;
        if (failure.fix_suggestion) {
          report += `  - Fix: ${failure.fix_suggestion}\n`;
        }
      }
      report += `\n`;
    }

    report += `## DETAILED RESULTS BY CATEGORY\n\n`;

    for (const category of categories) {
      const categoryResults = results.filter(r => {
        const check = checks.find(c => c.check_key === r.check_key);
        return check?.category === category;
      });

      report += `### ${category}\n\n`;
      report += `| Check | Status | Evidence | Fix |\n`;
      report += `|-------|--------|----------|-----|\n`;

      for (const result of categoryResults) {
        const check = checks.find(c => c.check_key === result.check_key);
        report += `| ${check?.title || result.check_key} | ${result.status} | ${result.evidence || '-'} | ${result.fix_suggestion || '-'} |\n`;
      }
      report += `\n`;
    }

    report += `---\n\n`;
    report += `*Report generated by QA Control Center*\n`;

    // Download
    const blob = new Blob([report], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `QA-CONTROL-CENTER-REPORT-${format(new Date(), 'yyyy-MM-dd')}.md`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Report downloaded');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">QA Control Center</h1>
          <p className="text-muted-foreground">Platform-wide automated testing and Go-Live readiness</p>
        </div>
        <div className="flex items-center gap-3">
          <Button 
            variant="outline" 
            onClick={generateReport}
            disabled={results.length === 0}
          >
            <Download className="w-4 h-4 mr-2" />
            Export Report
          </Button>
          <Button 
            onClick={() => runChecksMutation.mutate()}
            disabled={runChecksMutation.isPending}
          >
            {runChecksMutation.isPending ? (
              <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Play className="w-4 h-4 mr-2" />
            )}
            Run All Checks
          </Button>
        </div>
      </div>

      {/* Go-Live Status */}
      <Card className={isGoLiveReady ? 'border-green-500/50 bg-green-500/5' : 'border-red-500/50 bg-red-500/5'}>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {isGoLiveReady ? (
                <CheckCircle2 className="w-8 h-8 text-green-500" />
              ) : (
                <XCircle className="w-8 h-8 text-red-500" />
              )}
              <div>
                <h2 className="text-lg font-semibold">
                  Go-Live Status: {isGoLiveReady ? 'READY' : 'NOT READY'}
                </h2>
                <p className="text-sm text-muted-foreground">
                  {p0Failures.length === 0 
                    ? 'All P0 checks passed' 
                    : `${p0Failures.length} P0 failure(s) must be resolved`}
                </p>
              </div>
            </div>
            {latestRun && (
              <div className="text-right text-sm text-muted-foreground">
                <p>Last run: {format(new Date(latestRun.started_at), 'MMM d, yyyy HH:mm')}</p>
                <p>Status: {latestRun.status}</p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Summary Cards */}
      {latestRun?.summary_json && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold">{latestRun.summary_json.total || 0}</div>
              <p className="text-sm text-muted-foreground">Total Checks</p>
            </CardContent>
          </Card>
          <Card className="border-green-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-green-600">{latestRun.summary_json.pass || 0}</div>
              <p className="text-sm text-muted-foreground">Passed</p>
            </CardContent>
          </Card>
          <Card className="border-red-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-red-600">{latestRun.summary_json.fail || 0}</div>
              <p className="text-sm text-muted-foreground">Failed</p>
            </CardContent>
          </Card>
          <Card className="border-yellow-500/20">
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-yellow-600">{latestRun.summary_json.warn || 0}</div>
              <p className="text-sm text-muted-foreground">Warnings</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="pt-4">
              <div className="text-2xl font-bold text-muted-foreground">{latestRun.summary_json.skip || 0}</div>
              <p className="text-sm text-muted-foreground">Skipped</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Feature Flags Control */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <ToggleLeft className="w-5 h-5" />
            Feature Flags - Rollout Control
          </CardTitle>
          <CardDescription>
            Manage v2 Uber-like experience rollout. V2 flags require all P0 checks to pass.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            {featureFlags && (
              <>
                {/* Public Theme v2 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Globe className="w-5 h-5 text-primary" />
                    <div>
                      <Label>public_theme.v2_uber</Label>
                      <p className="text-xs text-muted-foreground">Uber-like public website design</p>
                    </div>
                  </div>
                  <Switch
                    checked={featureFlags['public_theme.v2_uber']}
                    onCheckedChange={() => handleFlagToggle('public_theme.v2_uber', featureFlags['public_theme.v2_uber'])}
                    disabled={updatingFlag === 'public_theme.v2_uber' || (!isGoLiveReady && !featureFlags['public_theme.v2_uber'])}
                  />
                </div>

                {/* Quote Flow v2 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-primary" />
                    <div>
                      <Label>quote_flow.v2_minimal</Label>
                      <p className="text-xs text-muted-foreground">Minimal 6-step quote flow</p>
                    </div>
                  </div>
                  <Switch
                    checked={featureFlags['quote_flow.v2_minimal']}
                    onCheckedChange={() => handleFlagToggle('quote_flow.v2_minimal', featureFlags['quote_flow.v2_minimal'])}
                    disabled={updatingFlag === 'quote_flow.v2_minimal' || (!isGoLiveReady && !featureFlags['quote_flow.v2_minimal'])}
                  />
                </div>

                {/* Quote Flow v3 */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Calculator className="w-5 h-5 text-primary" />
                    <div>
                      <Label>quote_flow.v3</Label>
                      <p className="text-xs text-muted-foreground">V3 Uber-style project cards flow</p>
                    </div>
                  </div>
                  <Switch
                    checked={featureFlags['quote_flow.v3']}
                    onCheckedChange={() => handleFlagToggle('quote_flow.v3', featureFlags['quote_flow.v3'])}
                    disabled={updatingFlag === 'quote_flow.v3' || (!isGoLiveReady && !featureFlags['quote_flow.v3'])}
                  />
                </div>

                {/* Portal Tracking */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Eye className="w-5 h-5 text-primary" />
                    <div>
                      <Label>portal.tracking_enabled</Label>
                      <p className="text-xs text-muted-foreground">Customer order tracking timeline</p>
                    </div>
                  </div>
                  <Switch
                    checked={featureFlags['portal.tracking_enabled']}
                    onCheckedChange={() => handleFlagToggle('portal.tracking_enabled', featureFlags['portal.tracking_enabled'])}
                    disabled={updatingFlag === 'portal.tracking_enabled'}
                  />
                </div>

                {/* Portal Placement */}
                <div className="flex items-center justify-between p-4 border rounded-lg">
                  <div className="flex items-center gap-3">
                    <Truck className="w-5 h-5 text-primary" />
                    <div>
                      <Label>portal.placement_enabled</Label>
                      <p className="text-xs text-muted-foreground">Site placement mapping tool</p>
                    </div>
                  </div>
                  <Switch
                    checked={featureFlags['portal.placement_enabled']}
                    onCheckedChange={() => handleFlagToggle('portal.placement_enabled', featureFlags['portal.placement_enabled'])}
                    disabled={updatingFlag === 'portal.placement_enabled'}
                  />
                </div>
              </>
            )}
          </div>
          
          {/* Preview Links */}
          <div className="mt-6 p-4 bg-muted/50 rounded-lg">
            <h4 className="font-medium mb-2 flex items-center gap-2">
              <Eye className="w-4 h-4" />
              Preview Mode (Always Uses v2)
            </h4>
            <div className="flex gap-3">
              <Button variant="outline" size="sm" asChild>
                <a href="/preview/quote" target="_blank">Preview Quote Flow</a>
              </Button>
              <Button variant="outline" size="sm" asChild>
                <a href="/preview/home" target="_blank">Preview Homepage</a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* P0 Failures - Pinned */}
      {p0Failures.length > 0 && (
        <Card className="border-red-500/50">
          <CardHeader>
            <CardTitle className="text-red-600 flex items-center gap-2">
              <XCircle className="w-5 h-5" />
              P0 Failures - Must Fix Before Go-Live
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {p0Failures.map(failure => {
                const check = checks.find(c => c.check_key === failure.check_key);
                return (
                  <div key={failure.id} className="p-4 bg-red-500/5 rounded-lg border border-red-500/20">
                    <div className="flex items-start justify-between">
                      <div>
                        <h4 className="font-medium">{check?.title || failure.check_key}</h4>
                        <p className="text-sm text-muted-foreground mt-1">{failure.evidence}</p>
                        {failure.fix_suggestion && (
                          <p className="text-sm text-red-600 mt-2">
                            <strong>Fix:</strong> {failure.fix_suggestion}
                          </p>
                        )}
                      </div>
                      {failure.admin_route && (
                        <Button variant="outline" size="sm" asChild>
                          <a href={failure.admin_route}>
                            <ExternalLink className="w-4 h-4 mr-1" />
                            Go to Fix
                          </a>
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Results by Category */}
      <Card>
        <CardHeader>
          <CardTitle>Check Results</CardTitle>
          <CardDescription>Detailed results by category</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs value={selectedCategory} onValueChange={setSelectedCategory}>
            <TabsList className="flex flex-wrap h-auto gap-1 mb-4">
              <TabsTrigger value="all">All</TabsTrigger>
              {categories.map(cat => {
                const Icon = categoryIcons[cat] || Shield;
                const catResults = results.filter(r => {
                  const check = checks.find(c => c.check_key === r.check_key);
                  return check?.category === cat;
                });
                const hasFailure = catResults.some(r => r.status === 'FAIL');
                const hasWarn = catResults.some(r => r.status === 'WARN');
                
                return (
                  <TabsTrigger 
                    key={cat} 
                    value={cat}
                    className={hasFailure ? 'text-red-600' : hasWarn ? 'text-yellow-600' : ''}
                  >
                    <Icon className="w-4 h-4 mr-1" />
                    {cat}
                  </TabsTrigger>
                );
              })}
            </TabsList>

            <ScrollArea className="h-[500px]">
              <div className="space-y-3">
                {filteredResults.length === 0 && !runLoading && (
                  <div className="text-center py-8 text-muted-foreground">
                    No results yet. Click "Run All Checks" to start.
                  </div>
                )}
                {filteredResults.map(result => {
                  const check = checks.find(c => c.check_key === result.check_key);
                  const Icon = categoryIcons[check?.category || ''] || Shield;
                  
                  return (
                    <div 
                      key={result.id}
                      className={`p-4 rounded-lg border ${statusColors[result.status]}`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex items-start gap-3">
                          <div className="mt-0.5">
                            {result.status === 'PASS' && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                            {result.status === 'FAIL' && <XCircle className="w-5 h-5 text-red-600" />}
                            {result.status === 'WARN' && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                            {result.status === 'SKIP' && <SkipForward className="w-5 h-5 text-muted-foreground" />}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-medium">{check?.title || result.check_key}</h4>
                              <Badge variant="outline" className={severityColors[check?.severity || 'P2']}>
                                {check?.severity || 'P2'}
                              </Badge>
                              <Badge variant="outline" className="text-xs">
                                <Icon className="w-3 h-3 mr-1" />
                                {check?.category}
                              </Badge>
                            </div>
                            <p className="text-sm text-muted-foreground mt-1">
                              {check?.description}
                            </p>
                            {result.evidence && (
                              <p className="text-sm mt-2">
                                <strong>Evidence:</strong> {result.evidence}
                              </p>
                            )}
                            {result.fix_suggestion && (
                              <p className="text-sm mt-1 text-amber-600">
                                <strong>Fix:</strong> {result.fix_suggestion}
                              </p>
                            )}
                          </div>
                        </div>
                        {result.admin_route && (
                          <Button variant="ghost" size="sm" asChild>
                            <a href={result.admin_route}>
                              <ExternalLink className="w-4 h-4" />
                            </a>
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}
