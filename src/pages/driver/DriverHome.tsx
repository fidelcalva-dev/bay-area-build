/**
 * Driver Home Page - Dashboard with today's summary
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { 
  Truck, Package, RefreshCw, Clock, MapPin, CheckCircle2,
  AlertTriangle, ArrowRight, Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  getRunsForDriver,
  type Run,
  type RunType,
  RUN_STATUS_FLOW,
  RUN_TYPE_CONFIG,
} from '@/lib/runsService';

const RUN_TYPE_ICONS: Record<RunType, React.ReactNode> = {
  DELIVERY: <Truck className="w-5 h-5" />,
  PICKUP: <Package className="w-5 h-5" />,
  HAUL: <Truck className="w-5 h-5" />,
  SWAP: <RefreshCw className="w-5 h-5" />,
  DUMP_AND_RETURN: <Truck className="w-5 h-5" />,
  YARD_TRANSFER: <Truck className="w-5 h-5" />,
};

export default function DriverHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { driverId, isLoading: authLoading } = useAdminAuth();
  
  const [isLoading, setIsLoading] = useState(true);
  const [runs, setRuns] = useState<Run[]>([]);
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    inProgress: 0,
    completed: 0,
  });

  useEffect(() => {
    if (driverId) fetchRuns();
  }, [driverId]);

  async function fetchRuns() {
    if (!driverId) return;
    
    setIsLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const data = await getRunsForDriver(driverId, today);
      setRuns(data);
      
      // Calculate stats
      const completed = data.filter(r => r.status === 'COMPLETED').length;
      const inProgress = data.filter(r => ['EN_ROUTE', 'ARRIVED', 'ACCEPTED'].includes(r.status)).length;
      const pending = data.filter(r => ['SCHEDULED', 'ASSIGNED'].includes(r.status)).length;
      
      setStats({
        total: data.length,
        pending,
        inProgress,
        completed,
      });
    } catch (err) {
      console.error(err);
      toast({ title: 'Error loading runs', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  // Get next/current run
  const activeRun = runs.find(r => ['ACCEPTED', 'EN_ROUTE', 'ARRIVED'].includes(r.status));
  const nextRun = runs.find(r => ['SCHEDULED', 'ASSIGNED'].includes(r.status));

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 space-y-4">
      {/* Stats Cards */}
      <div className="grid grid-cols-2 gap-3">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="w-4 h-4 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-xs text-muted-foreground">Today's Runs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.completed}</p>
                <p className="text-xs text-muted-foreground">Completed</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Active Run */}
      {activeRun && (
        <Card className="border-primary border-2">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-primary" />
                Current Run
              </CardTitle>
              <Badge className={RUN_STATUS_FLOW[activeRun.status].color}>
                {activeRun.status}
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0',
                RUN_TYPE_CONFIG[activeRun.run_type].color
              )}>
                {RUN_TYPE_ICONS[activeRun.run_type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{RUN_TYPE_CONFIG[activeRun.run_type].label}</p>
                <p className="text-sm text-muted-foreground">{activeRun.customer_name}</p>
                <p className="text-xs text-muted-foreground flex items-center gap-1 mt-1">
                  <MapPin className="w-3 h-3" />
                  {activeRun.destination_address || activeRun.origin_address || 'Address pending'}
                </p>
              </div>
            </div>
            <Button 
              className="w-full mt-4" 
              onClick={() => navigate(`/driver/runs`)}
            >
              View Details
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </CardContent>
        </Card>
      )}

      {/* Next Run (if no active) */}
      {!activeRun && nextRun && (
        <Card className="border-yellow-200">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-base flex items-center gap-2">
                <Clock className="w-4 h-4 text-yellow-600" />
                Next Up
              </CardTitle>
              <Badge variant="outline">{nextRun.scheduled_window}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="flex items-start gap-3">
              <div className={cn(
                'w-10 h-10 rounded-lg flex items-center justify-center text-white shrink-0',
                RUN_TYPE_CONFIG[nextRun.run_type].color
              )}>
                {RUN_TYPE_ICONS[nextRun.run_type]}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium">{RUN_TYPE_CONFIG[nextRun.run_type].label}</p>
                <p className="text-sm text-muted-foreground">{nextRun.customer_name}</p>
                {nextRun.is_heavy_material && (
                  <Badge variant="destructive" className="mt-1 text-xs">
                    <AlertTriangle className="w-3 h-3 mr-1" />
                    Heavy Material
                  </Badge>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quick Actions */}
      <div className="grid grid-cols-2 gap-3">
        <Button 
          variant="outline" 
          className="h-16 flex-col"
          onClick={() => navigate('/driver/runs')}
        >
          <Truck className="w-5 h-5 mb-1" />
          <span className="text-xs">View All Runs</span>
        </Button>
        <Button 
          variant="outline" 
          className="h-16 flex-col"
          onClick={fetchRuns}
        >
          <RefreshCw className="w-5 h-5 mb-1" />
          <span className="text-xs">Refresh</span>
        </Button>
      </div>

      {/* Pending Runs List */}
      {runs.filter(r => !['COMPLETED', 'CANCELLED'].includes(r.status)).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Pending Runs</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {runs
              .filter(r => !['COMPLETED', 'CANCELLED'].includes(r.status))
              .map((run) => (
                <div
                  key={run.id}
                  className="flex items-center gap-3 p-3 bg-muted/50 rounded-lg cursor-pointer hover:bg-muted"
                  onClick={() => navigate('/driver/runs')}
                >
                  <div className={cn(
                    'w-8 h-8 rounded-lg flex items-center justify-center text-white shrink-0',
                    RUN_TYPE_CONFIG[run.run_type].color
                  )}>
                    {RUN_TYPE_ICONS[run.run_type]}
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm">{run.customer_name || 'Customer'}</p>
                    <p className="text-xs text-muted-foreground">{run.scheduled_window || 'TBD'}</p>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {run.status}
                  </Badge>
                </div>
              ))}
          </CardContent>
        </Card>
      )}

      {/* Empty State */}
      {runs.length === 0 && (
        <Card className="text-center py-8">
          <CardContent>
            <Truck className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="font-medium">No runs scheduled</h3>
            <p className="text-sm text-muted-foreground">
              Check back later for new assignments
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
