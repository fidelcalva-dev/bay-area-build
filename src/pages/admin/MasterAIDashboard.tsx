import { useState } from 'react';
import { 
  Brain, Play, RefreshCw, Loader2, AlertTriangle, CheckCircle, 
  Clock, Zap, BarChart3, Bell, Settings, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMasterAI } from '@/hooks/useMasterAI';
import { cn } from '@/lib/utils';
import { NavLink } from 'react-router-dom';

const JOB_TYPES = [
  { type: 'CONTROL_TOWER', label: 'Control Tower', icon: Brain, description: 'Full system health check' },
  { type: 'DAILY_BRIEF', label: 'Daily Brief', icon: BarChart3, description: 'CEO morning report' },
  { type: 'EOD_REPORT', label: 'EOD Report', icon: Clock, description: 'End of day summary' },
  { type: 'KPI_SNAPSHOT', label: 'KPI Snapshot', icon: BarChart3, description: 'Record current metrics' },
  { type: 'DISPATCH_HEALTH', label: 'Dispatch Health', icon: Zap, description: 'Check runs & logistics' },
  { type: 'OVERDUE_CHECK', label: 'Overdue Check', icon: AlertTriangle, description: 'Find overdue assets' },
];

const severityColors: Record<string, string> = {
  LOW: 'bg-muted text-muted-foreground',
  MED: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200',
  HIGH: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200',
  CRITICAL: 'bg-destructive text-destructive-foreground',
};

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

  const handleTriggerJob = async (jobType: string) => {
    setTriggeringJob(jobType);
    try {
      await triggerJob(jobType, 1);
      toast({ title: 'Job triggered', description: `${jobType} job enqueued successfully` });
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
            24/7 Autonomous Operations Supervisor
          </p>
        </div>
        <div className="flex items-center gap-4">
          <Button variant="outline" onClick={refresh}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Status Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        {/* Enabled Status */}
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Status</p>
                <p className="text-2xl font-bold">
                  {config?.enabled ? (
                    <span className="text-green-600 dark:text-green-400">Active</span>
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

        {/* Queue Stats */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Job Queue</p>
            <div className="flex items-center gap-4">
              <div className="text-center">
                <p className="text-2xl font-bold text-yellow-600">{queueStats.pending}</p>
                <p className="text-xs text-muted-foreground">Pending</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-blue-600">{queueStats.running}</p>
                <p className="text-xs text-muted-foreground">Running</p>
              </div>
              <div className="text-center">
                <p className="text-2xl font-bold text-red-600">{queueStats.failed}</p>
                <p className="text-xs text-muted-foreground">Failed</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Quick Actions */}
        <Card>
          <CardContent className="pt-6">
            <p className="text-sm font-medium text-muted-foreground mb-2">Quick Actions</p>
            <div className="flex gap-2">
              <Button 
                size="sm" 
                onClick={() => handleTriggerJob('CONTROL_TOWER')}
                disabled={triggeringJob !== null}
              >
                {triggeringJob === 'CONTROL_TOWER' ? (
                  <Loader2 className="w-4 h-4 animate-spin mr-1" />
                ) : (
                  <Play className="w-4 h-4 mr-1" />
                )}
                Run Tower
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

      {/* Main Content */}
      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="jobs">Trigger Jobs</TabsTrigger>
          <TabsTrigger value="decisions">Recent Decisions</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Navigation Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <NavLink to="/admin/master-ai/jobs">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Zap className="w-5 h-5 text-primary" />
                      Job Queue
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>View all jobs, retry failed ones</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>

            <NavLink to="/admin/master-ai/decisions">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Brain className="w-5 h-5 text-primary" />
                      AI Decisions
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>View decision history and actions</CardDescription>
                </CardHeader>
              </Card>
            </NavLink>

            <NavLink to="/admin/master-ai/notifications">
              <Card className="hover:bg-muted/50 transition-colors cursor-pointer">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span className="flex items-center gap-2">
                      <Bell className="w-5 h-5 text-primary" />
                      Notifications
                    </span>
                    <ChevronRight className="w-5 h-5 text-muted-foreground" />
                  </CardTitle>
                  <CardDescription>Outbox and delivery status</CardDescription>
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
                  {recentDecisions.map((decision) => (
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

        <TabsContent value="decisions">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>AI Decision Log</CardTitle>
                <CardDescription>Complete history of AI-generated decisions</CardDescription>
              </div>
              <NavLink to="/admin/master-ai/decisions">
                <Button variant="outline">
                  View All
                  <ChevronRight className="w-4 h-4 ml-1" />
                </Button>
              </NavLink>
            </CardHeader>
            <CardContent>
              {recentDecisions.length === 0 ? (
                <p className="text-muted-foreground text-center py-8">
                  No decisions recorded yet.
                </p>
              ) : (
                <div className="space-y-2">
                  {recentDecisions.map((decision) => (
                    <div 
                      key={decision.id} 
                      className="flex items-center gap-3 p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      {decision.severity === 'CRITICAL' || decision.severity === 'HIGH' ? (
                        <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
                      ) : (
                        <CheckCircle className="w-4 h-4 text-green-500 shrink-0" />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">{decision.summary}</p>
                        <p className="text-xs text-muted-foreground">
                          {decision.decision_type} • {decision.entity_type}
                        </p>
                      </div>
                      <Badge className={cn('shrink-0', severityColors[decision.severity])}>
                        {decision.severity}
                      </Badge>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
