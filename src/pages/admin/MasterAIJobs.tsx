import { useState, useEffect } from 'react';
import { 
  ArrowLeft, Loader2, RefreshCw, RotateCcw, Clock, 
  CheckCircle, XCircle, AlertTriangle, Zap
} from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { useMasterAI } from '@/hooks/useMasterAI';
import { cn } from '@/lib/utils';

interface AIJob {
  id: string;
  job_type: string;
  status: string;
  priority: number;
  scheduled_for: string;
  attempt_count: number;
  max_attempts?: number;
  last_error?: string;
  created_at: string;
  updated_at?: string;
}

const statusConfig: Record<string, { color: string; icon: React.ElementType }> = {
  PENDING: { color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  RUNNING: { color: 'bg-blue-100 text-blue-800', icon: Zap },
  DONE: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
  FAILED: { color: 'bg-red-100 text-red-800', icon: XCircle },
  RETRYING: { color: 'bg-orange-100 text-orange-800', icon: RotateCcw },
};

export default function MasterAIJobs() {
  const { toast } = useToast();
  const { fetchJobs, retryJob } = useMasterAI();
  const [jobs, setJobs] = useState<AIJob[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');
  const [retryingId, setRetryingId] = useState<string | null>(null);

  const loadJobs = async (status?: string) => {
    setIsLoading(true);
    try {
      const data = await fetchJobs(status === 'all' ? undefined : status, 100);
      setJobs(data);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to load jobs', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadJobs(activeTab);
  }, [activeTab]);

  const handleRetry = async (jobId: string) => {
    setRetryingId(jobId);
    try {
      await retryJob(jobId);
      toast({ title: 'Job retried', description: 'Job has been queued for retry' });
      loadJobs(activeTab);
    } catch (err) {
      toast({ title: 'Error', description: 'Failed to retry job', variant: 'destructive' });
    } finally {
      setRetryingId(null);
    }
  };

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center gap-4">
        <NavLink to="/admin/master-ai">
          <Button variant="ghost" size="icon">
            <ArrowLeft className="w-5 h-5" />
          </Button>
        </NavLink>
        <div className="flex-1">
          <h1 className="text-2xl font-bold">AI Job Queue</h1>
          <p className="text-muted-foreground">View and manage scheduled AI jobs</p>
        </div>
        <Button variant="outline" onClick={() => loadJobs(activeTab)}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="all">All</TabsTrigger>
          <TabsTrigger value="PENDING">Pending</TabsTrigger>
          <TabsTrigger value="RUNNING">Running</TabsTrigger>
          <TabsTrigger value="FAILED">Failed</TabsTrigger>
          <TabsTrigger value="DONE">Completed</TabsTrigger>
        </TabsList>

        <TabsContent value={activeTab} className="mt-4">
          <Card>
            <CardHeader>
              <CardTitle>Jobs</CardTitle>
              <CardDescription>
                {jobs.length} job{jobs.length !== 1 ? 's' : ''} found
              </CardDescription>
            </CardHeader>
            <CardContent>
              {isLoading ? (
                <div className="flex justify-center py-8">
                  <Loader2 className="w-6 h-6 animate-spin text-primary" />
                </div>
              ) : jobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No jobs found</p>
              ) : (
                <div className="space-y-3">
                  {jobs.map((job) => {
                    const StatusIcon = statusConfig[job.status]?.icon || Clock;
                    return (
                      <div 
                        key={job.id} 
                        className="flex items-start gap-4 p-4 rounded-lg border bg-card"
                      >
                        <div className={cn(
                          'p-2 rounded-full',
                          statusConfig[job.status]?.color || 'bg-muted'
                        )}>
                          <StatusIcon className="w-4 h-4" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <Badge variant="outline">{job.job_type}</Badge>
                            <Badge className={statusConfig[job.status]?.color}>
                              {job.status}
                            </Badge>
                            <span className="text-xs text-muted-foreground">
                              Priority: {job.priority}
                            </span>
                          </div>
                          <p className="text-sm text-muted-foreground mt-1">
                            Scheduled: {new Date(job.scheduled_for).toLocaleString()}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            Attempts: {job.attempt_count}/{job.max_attempts}
                          </p>
                          {job.last_error && (
                            <div className="mt-2 p-2 rounded bg-destructive/10 text-destructive text-sm">
                              <AlertTriangle className="w-3 h-3 inline mr-1" />
                              {job.last_error}
                            </div>
                          )}
                        </div>
                        <div className="flex flex-col gap-2">
                          <p className="text-xs text-muted-foreground">
                            {new Date(job.created_at).toLocaleDateString()}
                          </p>
                          {job.status === 'FAILED' && (
                            <Button 
                              size="sm" 
                              variant="outline"
                              onClick={() => handleRetry(job.id)}
                              disabled={retryingId === job.id}
                            >
                              {retryingId === job.id ? (
                                <Loader2 className="w-3 h-3 animate-spin mr-1" />
                              ) : (
                                <RotateCcw className="w-3 h-3 mr-1" />
                              )}
                              Retry
                            </Button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
