/**
 * Driver Today Screen — Mobile-first dashboard
 * Clock in/out, status, counters, run cards sorted by time
 */
import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import {
  Truck, Package, RefreshCw, Loader2, Clock, MapPin,
  Camera, FileText, ChevronRight, LogIn, LogOut as LogOutIcon,
  AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  getRunsForDriver,
  type Run,
  type RunType,
  RUN_TYPE_CONFIG,
  RUN_STATUS_FLOW,
} from '@/lib/runsService';

type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

const STATUS_CONFIG: Record<DriverStatus, { label: string; color: string; bg: string }> = {
  AVAILABLE: { label: 'Available', color: 'text-green-700', bg: 'bg-green-100 border-green-300' },
  BUSY: { label: 'On Break', color: 'text-yellow-700', bg: 'bg-yellow-100 border-yellow-300' },
  OFFLINE: { label: 'Offline', color: 'text-gray-500', bg: 'bg-gray-100 border-gray-300' },
};

const TYPE_ICONS: Record<RunType, React.ReactNode> = {
  DELIVERY: <Truck className="w-6 h-6" />,
  PICKUP: <Package className="w-6 h-6" />,
  HAUL: <Truck className="w-6 h-6" />,
  SWAP: <RefreshCw className="w-6 h-6" />,
  DUMP_AND_RETURN: <Truck className="w-6 h-6" />,
  YARD_TRANSFER: <Truck className="w-6 h-6" />,
};

export default function DriverHome() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { user, driverId, isLoading: authLoading } = useAdminAuth();

  const [isLoading, setIsLoading] = useState(true);
  const [runs, setRuns] = useState<Run[]>([]);
  const [status, setStatus] = useState<DriverStatus>('OFFLINE');
  const [clockedIn, setClockedIn] = useState(false);
  const [clockInTime, setClockInTime] = useState<string | null>(null);

  const fetchAll = useCallback(async () => {
    if (!driverId || !user?.id) return;
    setIsLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');
      const [runsData, statusData] = await Promise.all([
        getRunsForDriver(driverId, today),
        supabase.from('agent_availability').select('status').eq('user_id', user.id).maybeSingle(),
      ]);
      // Include completed runs for today's counters
      const query: any = supabase.from('runs');
      const { data: allRuns } = await query
        .select('*, assets_dumpsters:asset_id(asset_code, size_id)')
        .eq('assigned_driver_id', driverId)
        .eq('scheduled_date', today)
        .order('scheduled_window', { ascending: true });

      setRuns((allRuns || runsData) as Run[]);
      if (statusData.data?.status) {
        const s = statusData.data.status as DriverStatus;
        setStatus(s);
        setClockedIn(s !== 'OFFLINE');
      }
    } catch (err) {
      console.error(err);
      toast({ title: 'Error loading runs', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [driverId, user?.id, toast]);

  useEffect(() => { fetchAll(); }, [fetchAll]);

  async function toggleClockIn() {
    if (!user?.id) return;
    const newStatus: DriverStatus = clockedIn ? 'OFFLINE' : 'AVAILABLE';
    await supabase.from('agent_availability').upsert({
      user_id: user.id,
      status: newStatus,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setStatus(newStatus);
    setClockedIn(!clockedIn);
    if (!clockedIn) setClockInTime(format(new Date(), 'h:mm a'));
    else setClockInTime(null);
    toast({ title: clockedIn ? 'Clocked out' : 'Clocked in ✓' });
  }

  async function cycleStatus() {
    if (!user?.id || !clockedIn) return;
    const next: DriverStatus = status === 'AVAILABLE' ? 'BUSY' : 'AVAILABLE';
    await supabase.from('agent_availability').upsert({
      user_id: user.id,
      status: next,
      updated_at: new Date().toISOString(),
    }, { onConflict: 'user_id' });
    setStatus(next);
  }

  // Counters
  const counters = {
    deliveries: runs.filter(r => r.run_type === 'DELIVERY' && r.status !== 'CANCELLED').length,
    pickups: runs.filter(r => r.run_type === 'PICKUP' && r.status !== 'CANCELLED').length,
    swaps: runs.filter(r => r.run_type === 'SWAP' && r.status !== 'CANCELLED').length,
    dumpReturn: runs.filter(r => r.run_type === 'DUMP_AND_RETURN' && r.status !== 'CANCELLED').length,
    completed: runs.filter(r => r.status === 'COMPLETED').length,
    total: runs.filter(r => r.status !== 'CANCELLED').length,
  };

  const activeRuns = runs.filter(r => !['COMPLETED', 'CANCELLED'].includes(r.status));

  if (authLoading || isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const needsPhotoBadge = (run: Run) => {
    return ['PICKUP', 'SWAP', 'DUMP_AND_RETURN'].includes(run.run_type) || run.is_heavy_material;
  };
  const needsTicketBadge = (run: Run) => {
    return ['PICKUP', 'SWAP', 'DUMP_AND_RETURN'].includes(run.run_type);
  };

  // Extract city + zip from address
  const getCityZip = (address: string | null) => {
    if (!address) return '—';
    const parts = address.split(',');
    if (parts.length >= 2) {
      const cityState = parts[parts.length - 2]?.trim();
      const zip = parts[parts.length - 1]?.trim()?.match(/\d{5}/)?.[0];
      return zip ? `${cityState?.split(' ')[0]} ${zip}` : cityState || address.slice(0, 30);
    }
    return address.slice(0, 30);
  };

  return (
    <div className="p-4 space-y-5 max-w-lg mx-auto pb-24 overflow-x-hidden">
      {/* Clock In / Status Bar */}
      <div className="flex gap-3">
        <Button
          onClick={toggleClockIn}
          size="lg"
          className={cn(
            'flex-1 h-16 text-lg font-bold gap-3',
            clockedIn
              ? 'bg-red-500 hover:bg-red-600 text-white'
              : 'bg-green-500 hover:bg-green-600 text-white'
          )}
        >
          {clockedIn ? <LogOutIcon className="w-6 h-6" /> : <LogIn className="w-6 h-6" />}
          {clockedIn ? 'Clock Out' : 'Clock In'}
        </Button>
        {clockedIn && (
          <Button
            onClick={cycleStatus}
            size="lg"
            variant="outline"
            className={cn('h-16 px-6 border-2 font-bold', STATUS_CONFIG[status].bg, STATUS_CONFIG[status].color)}
          >
            {STATUS_CONFIG[status].label}
          </Button>
        )}
      </div>
      {clockInTime && (
        <p className="text-xs text-center text-muted-foreground">
          Clocked in at {clockInTime}
        </p>
      )}

      {/* Counters */}
      <div className="grid grid-cols-4 gap-2">
        {[
          { label: 'Delivery', count: counters.deliveries, color: 'bg-blue-500' },
          { label: 'Pickup', count: counters.pickups, color: 'bg-green-500' },
          { label: 'Swap', count: counters.swaps, color: 'bg-purple-500' },
          { label: 'D&R', count: counters.dumpReturn, color: 'bg-amber-500' },
        ].map(c => (
          <div key={c.label} className="text-center">
            <div className={cn('w-12 h-12 mx-auto rounded-xl flex items-center justify-center text-white text-xl font-bold', c.color)}>
              {c.count}
            </div>
            <p className="text-xs text-muted-foreground mt-1 font-medium">{c.label}</p>
          </div>
        ))}
      </div>

      {/* Progress bar */}
      <div className="flex items-center gap-3">
        <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
          <div
            className="h-full bg-green-500 rounded-full transition-all"
            style={{ width: counters.total > 0 ? `${(counters.completed / counters.total) * 100}%` : '0%' }}
          />
        </div>
        <span className="text-sm font-bold text-muted-foreground">
          {counters.completed}/{counters.total}
        </span>
      </div>

      {/* Refresh */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-bold">Today's Runs</h2>
        <Button variant="ghost" size="sm" onClick={fetchAll}>
          <RefreshCw className="w-4 h-4" />
        </Button>
      </div>

      {/* Run Cards */}
      {activeRuns.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No active runs</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">
            {counters.completed > 0 ? `${counters.completed} completed today 🎉` : 'Check back later for assignments'}
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          {activeRuns.map((run) => {
            const addr = run.destination_address || run.origin_address;
            const statusFlow = RUN_STATUS_FLOW[run.status];
            const isActive = ['ACCEPTED', 'EN_ROUTE', 'ARRIVED', 'PAUSED'].includes(run.status);

            return (
              <button
                key={run.id}
                onClick={() => navigate(`/driver/runs/${run.id}`)}
                className={cn(
                  'w-full text-left rounded-2xl border-2 p-4 transition-all active:scale-[0.98]',
                  isActive
                    ? 'border-primary bg-primary/5 shadow-lg'
                    : 'border-border bg-card hover:shadow-md'
                )}
              >
                <div className="flex items-start gap-3">
                  {/* Type icon */}
                  <div className={cn(
                    'w-12 h-12 rounded-xl flex items-center justify-center text-white shrink-0',
                    RUN_TYPE_CONFIG[run.run_type].color
                  )}>
                    {TYPE_ICONS[run.run_type]}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-base">
                        {RUN_TYPE_CONFIG[run.run_type].label}
                      </span>
                      <Badge variant="outline" className={cn('text-xs font-semibold', statusFlow.color)}>
                        {run.status.replace(/_/g, ' ')}
                      </Badge>
                    </div>

                    {/* Time + Location */}
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Clock className="w-3.5 h-3.5 shrink-0" />
                      <span className="font-medium">{run.scheduled_window || 'TBD'}</span>
                      <span className="text-muted-foreground/50">•</span>
                      <MapPin className="w-3.5 h-3.5 shrink-0" />
                      <span className="truncate">{getCityZip(addr)}</span>
                    </div>

                    {/* Asset + Customer */}
                    <div className="flex items-center gap-2 mt-1 text-sm">
                      {run.assets_dumpsters && (
                        <Badge variant="secondary" className="text-xs font-mono">
                          {run.assets_dumpsters.asset_code}
                        </Badge>
                      )}
                      <span className="text-muted-foreground truncate">{run.customer_name || ''}</span>
                    </div>

                    {/* Requirement badges */}
                    <div className="flex gap-1.5 mt-2">
                      {needsPhotoBadge(run) && (
                        <Badge variant="outline" className="text-xs gap-1 border-amber-300 text-amber-700 bg-amber-50">
                          <Camera className="w-3 h-3" /> Photos
                        </Badge>
                      )}
                      {needsTicketBadge(run) && (
                        <Badge variant="outline" className="text-xs gap-1 border-blue-300 text-blue-700 bg-blue-50">
                          <FileText className="w-3 h-3" /> Ticket
                        </Badge>
                      )}
                      {run.is_heavy_material && (
                        <Badge variant="outline" className="text-xs gap-1 border-red-300 text-red-700 bg-red-50">
                          <AlertTriangle className="w-3 h-3" /> Heavy
                        </Badge>
                      )}
                    </div>
                  </div>

                  <ChevronRight className="w-5 h-5 text-muted-foreground/50 shrink-0 mt-1" />
                </div>
              </button>
            );
          })}
        </div>
      )}

      {/* Completed runs section */}
      {runs.filter(r => r.status === 'COMPLETED').length > 0 && (
        <div>
          <h3 className="text-sm font-semibold text-muted-foreground mb-2">
            Completed ({runs.filter(r => r.status === 'COMPLETED').length})
          </h3>
          <div className="space-y-2 opacity-60">
            {runs.filter(r => r.status === 'COMPLETED').map(run => (
              <div key={run.id} className="flex items-center gap-3 p-3 rounded-xl bg-muted/50 min-h-[44px]">
                <div className={cn('w-8 h-8 rounded-lg flex items-center justify-center text-white', RUN_TYPE_CONFIG[run.run_type].color)}>
                  {TYPE_ICONS[run.run_type]}
                </div>
                <span className="text-sm font-medium flex-1">{RUN_TYPE_CONFIG[run.run_type].label}</span>
                <span className="text-xs text-muted-foreground">{run.customer_name}</span>
                <Badge variant="outline" className="text-xs bg-green-50 text-green-700">Done</Badge>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
