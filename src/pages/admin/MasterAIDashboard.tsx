import { useState, useEffect } from 'react';
import { 
  Brain, Play, RefreshCw, Loader2, AlertTriangle, CheckCircle, 
  Clock, Zap, BarChart3, Bell, ChevronRight, TestTube, Activity,
  TrendingUp, Users, AlertCircle, Trash2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMasterAI } from '@/hooks/useMasterAI';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';

const JOB_TYPES = [
  { type: 'CONTROL_TOWER', label: 'Control Tower', icon: Brain, description: 'Full system health check' },
  { type: 'DAILY_BRIEF', label: 'Daily Brief', icon: BarChart3, description: 'CEO morning report' },
  { type: 'EOD_REPORT', label: 'EOD Report', icon: Clock, description: 'End of day summary' },
  { type: 'KPI_SNAPSHOT', label: 'KPI Snapshot', icon: TrendingUp, description: 'Record current metrics' },
  { type: 'DISPATCH_HEALTH', label: 'Dispatch Health', icon: Zap, description: 'Check runs & logistics' },
  { type: 'OVERDUE_CHECK', label: 'Overdue Check', icon: AlertTriangle, description: 'Find overdue assets' },
];

const severityColors: Record<string, string> = {
  LOW: 'bg-muted text-muted-foreground',
  MED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CRITICAL: 'bg-destructive text-destructive-foreground',
};

interface JobStats {
  pending_24h: number;
  running_24h: number;
  done_24h: number;
  failed_24h: number;
}

interface LastRun {
  id: string;
  job_type: string;
  status: string;
  updated_at: string;
  payload?: { summary?: { decisions_created?: number; tasks_created?: number; drafts_created?: number } };
}

export default function MasterAIDashboard() {
  const { toast } = useToast();
  const { 
    config, 
    queueStats, 
    recentDecisions, 
    isLoading, 
    error,
    refresh,
    triggerJob,
    updateConfig 
  } = useMasterAI();
  
  const [triggeringJob, setTriggeringJob] = useState<string | null>(null);
  const [togglingMode, setTogglingMode] = useState(false);
  const [jobStats, setJobStats] = useState<JobStats>({ pending_24h: 0, running_24h: 0, done_24h: 0, failed_24h: 0 });
  const [lastRun, setLastRun] = useState<LastRun | null>(null);
  const [creatingTestData, setCreatingTestData] = useState(false);
  const [bootTimestamp, setBootTimestamp] = useState<string | null>(null);

  // Fetch extended stats
  useEffect(() => {
    const fetchStats = async () => {
      const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      
      // Get 24h job stats
      const { data: jobs } = await supabase
        .from('ai_jobs')
        .select('status')
        .gte('created_at', yesterday);
      
      if (jobs) {
        setJobStats({
          pending_24h: jobs.filter(j => j.status === 'PENDING').length,
          running_24h: jobs.filter(j => j.status === 'RUNNING').length,
          done_24h: jobs.filter(j => j.status === 'DONE').length,
          failed_24h: jobs.filter(j => j.status === 'FAILED').length,
        });
      }
      
      // Get last completed run
      const { data: lastJob } = await supabase
        .from('ai_jobs')
        .select('id, job_type, status, updated_at, payload')
        .eq('status', 'DONE')
        .order('updated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      
      if (lastJob) {
        setLastRun(lastJob as LastRun);
      }
      
      // Get boot timestamp
      const { data: bootConfig } = await supabase
        .from('config_settings')
        .select('value')
        .eq('category', 'master_ai')
        .eq('key', 'last_boot_at')
        .maybeSingle();
      
      if (bootConfig?.value) {
        setBootTimestamp(String(bootConfig.value).replace(/"/g, ''));
      }
    };
    
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const handleTriggerJob = async (jobType: string) => {
    setTriggeringJob(jobType);
    try {
      await triggerJob(jobType, 1);
      toast({ title: 'Job triggered', description: `${jobType} job enqueued successfully` });
      // Refresh after a moment to show updated stats
      setTimeout(refresh, 2000);
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to trigger job',
        variant: 'destructive'
      });
    } finally {
      setTriggeringJob(null);
    }
  };

  const handleToggleMode = async () => {
    if (!config) return;
    setTogglingMode(true);
    try {
      const newMode = config.mode === 'DRY_RUN' ? 'LIVE' : 'DRY_RUN';
      await updateConfig('mode', newMode);
      toast({ 
        title: 'Mode updated', 
        description: `Master AI is now in ${newMode} mode` 
      });
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to update mode',
        variant: 'destructive'
      });
    } finally {
      setTogglingMode(false);
    }
  };

  const handleToggleEnabled = async () => {
    if (!config) return;
    try {
      await updateConfig('enabled', !config.enabled);
      toast({ 
        title: config.enabled ? 'Master AI disabled' : 'Master AI enabled',
        description: config.enabled ? 'AI supervisor is now paused' : 'AI supervisor is now active'
      });
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to update',
        variant: 'destructive'
      });
    }
  };

  const handleCreateTestScenarios = async () => {
    setCreatingTestData(true);
    try {
      const now = new Date();
      const tenMinsAgo = new Date(now.getTime() - 10 * 60 * 1000).toISOString();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
      const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const fortyFiveMinsAgo = new Date(now.getTime() - 45 * 60 * 1000);
      
      // 1. Create test lead (NEW, 10 mins old)
      const { error: leadError } = await supabase.from('sales_leads').insert({
        source_key: 'test_master_ai',
        lead_source: 'test',
        customer_name: 'Test Lead - Master AI',
        customer_phone: '5551234567',
        customer_email: 'test@masterai.test',
        lead_status: 'new',
        assignment_type: 'sales',
        created_at: tenMinsAgo,
        notes: 'Auto-generated test data for Master AI verification',
      } as never);
      if (leadError) console.error('Lead error:', leadError);
      
      // 2. Create test quote (SENT, 2h old) - using type bypass for complex table
      const { error: quoteError } = await supabase.from('quotes').insert({
        customer_name: 'Test Quote Customer',
        customer_phone: '5559876543',
        customer_email: 'quote@masterai.test',
        delivery_address: '123 Test St, Oakland, CA',
        zip_code: '94612',
        user_type: 'homeowner',
        material_type: 'debris',
        rental_days: 7,
        subtotal: 450.00,
        estimated_min: 400.00,
        estimated_max: 500.00,
        is_calsan_fulfillment: true,
        status: 'quoted',
        created_at: twoHoursAgo,
      } as never);
      if (quoteError) console.error('Quote error:', quoteError);
      
      // 3. Create test run (SCHEDULED, past window)
      const { data: firstYard } = await supabase.from('yards').select('id').limit(1).maybeSingle();
      if (firstYard) {
        const { error: runError } = await supabase.from('runs').insert({
          run_type: 'DELIVERY',
          origin_type: 'yard',
          origin_yard_id: firstYard.id,
          destination_type: 'customer',
          destination_address: '456 Late Run Ave, San Jose, CA',
          scheduled_date: yesterday,
          scheduled_window: `${String(fortyFiveMinsAgo.getHours()).padStart(2, '0')}:00-${String(fortyFiveMinsAgo.getHours() + 2).padStart(2, '0')}:00`,
          customer_name: 'Test Delayed Run Customer',
          status: 'SCHEDULED',
          priority: 2,
          notes: 'Auto-generated test run for Master AI verification',
        } as never);
        if (runError) console.error('Run error:', runError);
      }
      
      toast({ 
        title: 'Test scenarios created', 
        description: 'Created: 1 stale lead, 1 stale quote, 1 delayed run. Run Control Tower to see them.',
      });
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to create test data',
        variant: 'destructive'
      });
    } finally {
      setCreatingTestData(false);
    }
  };

  const topBlockers = recentDecisions.filter(d => d.severity === 'HIGH' || d.severity === 'CRITICAL').slice(0, 5);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <Card className="border-destructive">
          <CardContent className="pt-6">
            <div className="flex items-center gap-3 text-destructive">
              <AlertTriangle className="w-5 h-5" />
              <p>Error loading Master AI: {error}</p>
            </div>
            <Button onClick={refresh} variant="outline" className="mt-4">
              <RefreshCw className="w-4 h-4 mr-2" />
              Retry
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <Brain className="w-8 h-8 text-primary" />
            CALSAN Master AI
          </h1>
          <p className="text-muted-foreground mt-1">
            24/7 Autonomous Operations Supervisor • {config?.mode || 'DRY_RUN'} Mode
          </p>
          {bootTimestamp && (
            <p className="text-xs text-muted-foreground mt-1">
              Last boot: {new Date(bootTimestamp).toLocaleString()}
            </p>
          )}
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Cards Row 1 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Enabled Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">
                  {config?.enabled ? (
                    <span className="text-green-600 dark:text-green-400 flex items-center gap-2">
                      <Activity className="w-5 h-5" /> Active
                    </span>
                  ) : (
                    <span className="text-muted-foreground">Paused</span>
                  )}
                </p>
              </div>
              <Switch 
                checked={config?.enabled} 
                onCheckedChange={handleToggleEnabled}
              />
            </div>
          </CardContent>
        </Card>

        {/* Mode */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Mode</p>
                <Badge 
                  variant={config?.mode === 'LIVE' ? 'default' : 'secondary'}
                  className="text-lg px-3 py-1"
                >
                  {config?.mode || 'DRY_RUN'}
                </Badge>
              </div>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleMode}
                disabled={togglingMode}
              >
                {togglingMode ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Toggle'}
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* 24h Job Stats */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Jobs (24h)</p>
            <div className="grid grid-cols-4 gap-2 text-center">
              <div>
                <p className="text-xl font-bold text-yellow-600">{jobStats.pending_24h}</p>
                <p className="text-[10px] text-muted-foreground">Pending</p>
              </div>
              <div>
                <p className="text-xl font-bold text-blue-600">{jobStats.running_24h}</p>
                <p className="text-[10px] text-muted-foreground">Running</p>
              </div>
              <div>
                <p className="text-xl font-bold text-green-600">{jobStats.done_24h}</p>
                <p className="text-[10px] text-muted-foreground">Done</p>
              </div>
              <div>
                <p className="text-xl font-bold text-red-600">{jobStats.failed_24h}</p>
                <p className="text-[10px] text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</p>
            <div className="flex flex-wrap gap-2">
              <Button 
                size="sm" 
                onClick={() => handleTriggerJob('CONTROL_TOWER')}
                disabled={triggeringJob !== null}
              >
                {triggeringJob === 'CONTROL_TOWER' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Brain className="w-4 h-4 mr-1" />
                )}
                Tower
              </Button>
              <Button 
                size="sm" 
                variant="outline"
                onClick={() => handleTriggerJob('DAILY_BRIEF')}
                disabled={triggeringJob !== null}
              >
                {triggeringJob === 'DAILY_BRIEF' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <BarChart3 className="w-4 h-4 mr-1" />
                )}
                Brief
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Last Run Info */}
      {lastRun && (
        <Card className="border-primary/20 bg-primary/5">
          <CardContent className="py-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-4">
                <CheckCircle className="w-5 h-5 text-green-500" />
                <div>
                  <p className="font-medium">Last Run: {lastRun.job_type}</p>
                  <p className="text-sm text-muted-foreground">
                    {new Date(lastRun.updated_at).toLocaleString()}
                  </p>
                </div>
              </div>
              {lastRun.payload?.summary && (
                <div className="flex gap-4 text-sm">
                  <span className="text-muted-foreground">
                    {lastRun.payload.summary.decisions_created || 0} decisions
                  </span>
                  <span className="text-muted-foreground">
                    {lastRun.payload.summary.tasks_created || 0} tasks
                  </span>
                  <span className="text-muted-foreground">
                    {lastRun.payload.summary.drafts_created || 0} drafts
                  </span>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Trigger Jobs</TabsTrigger>
          <TabsTrigger value="blockers">Top Blockers</TabsTrigger>
          <TabsTrigger value="test">Test Data</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <NavLink to="/admin/master-ai/jobs">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Zap className="w-4 h-4 text-primary" />
                      Job Queue
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription className="text-xs">View all jobs, retry failed</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>

            <NavLink to="/admin/master-ai/decisions">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Brain className="w-4 h-4 text-primary" />
                      AI Decisions
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription className="text-xs">Decision history & actions</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>

            <NavLink to="/admin/master-ai/notifications">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-primary" />
                      Notifications
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription className="text-xs">Outbox & delivery status</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>

            <NavLink to="/admin/master-ai/kpis">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer h-full">
                <CardHeader className="pb-2">
                  <CardTitle className="flex items-center justify-between text-base">
                    <span className="flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-primary" />
                      KPI History
                    </span>
                    <ChevronRight className="w-4 h-4 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription className="text-xs">Metrics snapshots</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>
          </div>

          {/* Recent Decisions Feed */}
          <Card>
            <CardHeader>
              <CardTitle>Recent AI Decisions</CardTitle>
              <CardDescription>Last 10 decisions made by the AI supervisor</CardDescription>
            </CardHeader>
            <CardContent>
              {recentDecisions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No decisions yet. Trigger a Control Tower job to start.
                </p>
              ) : (
                <div className="space-y-3">
                  {recentDecisions.slice(0, 10).map((decision) => (
                    <div 
                      key={decision.id} 
                      className="flex items-start gap-3 p-3 rounded-lg border bg-card"
                    >
                      <Badge className={cn('shrink-0', severityColors[decision.severity])}>
                        {decision.severity}
                      </Badge>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {decision.decision_type}
                          </Badge>
                          <span className="text-xs text-muted-foreground">
                            {decision.entity_type}
                          </span>
                        </div>
                        <p className="text-sm mt-1">{decision.summary}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {new Date(decision.created_at).toLocaleString()}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="jobs">
          <Card>
            <CardHeader>
              <CardTitle>Trigger AI Jobs</CardTitle>
              <CardDescription>
                Manually trigger specific job types. Jobs run in {config?.mode || 'DRY_RUN'} mode.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {JOB_TYPES.map((job) => {
                  const Icon = job.icon;
                  return (
                    <Card key={job.type} className="border-dashed">
                      <CardContent className="pt-6">
                        <div className="flex items-start gap-3">
                          <div className="p-2 rounded-lg bg-primary/10">
                            <Icon className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex-1">
                            <h3 className="font-semibold">{job.label}</h3>
                            <p className="text-sm text-muted-foreground">{job.description}</p>
                            <Button 
                              size="sm" 
                              className="mt-3"
                              onClick={() => handleTriggerJob(job.type)}
                              disabled={triggeringJob !== null}
                            >
                              {triggeringJob === job.type ? (
                                <Loader2 className="w-4 h-4 animate-spin mr-1" />
                              ) : (
                                <Play className="w-4 h-4 mr-1" />
                              )}
                              Run Now
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="blockers">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <AlertCircle className="w-5 h-5 text-orange-500" />
                Top Blockers
              </CardTitle>
              <CardDescription>
                HIGH and CRITICAL severity issues requiring immediate attention
              </CardDescription>
            </CardHeader>
            <CardContent>
              {topBlockers.length === 0 ? (
                <div className="text-center py-8">
                  <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
                  <p className="text-muted-foreground">No critical blockers detected.</p>
                  <p className="text-sm text-muted-foreground">All systems operating normally.</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {topBlockers.map((decision) => (
                    <div 
                      key={decision.id} 
                      className={cn(
                        "p-4 rounded-lg border-l-4",
                        decision.severity === 'CRITICAL' ? 'border-l-red-500 bg-red-50 dark:bg-red-950/20' : 'border-l-orange-500 bg-orange-50 dark:bg-orange-950/20'
                      )}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2 mb-1">
                            <Badge className={severityColors[decision.severity]}>
                              {decision.severity}
                            </Badge>
                            <Badge variant="outline">{decision.decision_type}</Badge>
                          </div>
                          <p className="font-medium">{decision.summary}</p>
                          {decision.recommendation && (
                            <p className="text-sm text-muted-foreground mt-1">
                              → {decision.recommendation}
                            </p>
                          )}
                        </div>
                        <span className="text-xs text-muted-foreground whitespace-nowrap">
                          {new Date(decision.created_at).toLocaleTimeString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="test">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TestTube className="w-5 h-5 text-purple-500" />
                Test Scenarios
              </CardTitle>
              <CardDescription>
                Create test data to verify Control Tower detection. Safe for DRY_RUN testing.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="p-4 rounded-lg border border-dashed bg-muted/30">
                <h4 className="font-medium mb-2">What will be created:</h4>
                <ul className="text-sm text-muted-foreground space-y-1">
                  <li>• 1 NEW lead created 10 minutes ago (should trigger stale lead alert)</li>
                  <li>• 1 QUOTED quote created 2 hours ago (should trigger stale quote alert)</li>
                  <li>• 1 SCHEDULED run from yesterday (should trigger delayed run alert)</li>
                </ul>
              </div>
              
              <div className="flex gap-3">
                <Button 
                  onClick={handleCreateTestScenarios}
                  disabled={creatingTestData}
                  className="flex-1"
                >
                  {creatingTestData ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <TestTube className="w-4 h-4 mr-2" />
                  )}
                  Create Test Scenarios
                </Button>
                
                <Button 
                  variant="default"
                  onClick={() => handleTriggerJob('CONTROL_TOWER')}
                  disabled={triggeringJob !== null}
                  className="flex-1"
                >
                  {triggeringJob === 'CONTROL_TOWER' ? (
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                  ) : (
                    <Brain className="w-4 h-4 mr-2" />
                  )}
                  Run Control Tower
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground text-center">
                After creating test data, run Control Tower to see the AI detect and respond to issues.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}