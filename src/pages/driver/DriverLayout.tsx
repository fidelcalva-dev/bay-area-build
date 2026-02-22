/**
 * Driver Layout - Mobile-first layout for driver app
 * Includes bottom navigation and header
 */
import { useState, useEffect } from 'react';
import { Navigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { 
  Truck, Home, User, LogOut, Loader2, Clock, RefreshCw
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import logoCalsan from "@/assets/logo-calsan.jpeg";
import { supabase } from '@/integrations/supabase/client';
import AiControlWidget from '@/components/ai/AiControlWidget';

const navItems = [
  { path: '/driver', label: 'Today', icon: Home, end: true },
  { path: '/driver/runs', label: 'Runs', icon: Truck },
  { path: '/driver/profile', label: 'Profile', icon: User },
];

type DriverStatus = 'AVAILABLE' | 'BUSY' | 'OFFLINE';

export default function DriverLayout() {
  const { user, isLoading, signOut, isDriver, isOwnerOperator, isAdmin, driverId } = useAdminAuth();
  const location = useLocation();
  const [status, setStatus] = useState<DriverStatus>('OFFLINE');
  const [runsCount, setRunsCount] = useState(0);

  const canAccess = isDriver || isOwnerOperator || isAdmin;

  useEffect(() => {
    if (driverId) {
      fetchDriverStatus();
      fetchTodayRunsCount();
    }
  }, [driverId]);

  async function fetchDriverStatus() {
    if (!user?.id) return;
    const { data } = await supabase
      .from('agent_availability')
      .select('status')
      .eq('user_id', user.id)
      .maybeSingle();
    
    if (data?.status) {
      setStatus(data.status as DriverStatus);
    }
  }

  async function fetchTodayRunsCount() {
    if (!driverId) return;
    const today = format(new Date(), 'yyyy-MM-dd');
    const { count } = await supabase
      .from('runs')
      .select('id', { count: 'exact', head: true })
      .eq('assigned_driver_id', driverId)
      .eq('scheduled_date', today)
      .not('status', 'in', '("COMPLETED","CANCELLED")');
    
    setRunsCount(count || 0);
  }

  async function toggleStatus() {
    if (!user?.id) return;
    const newStatus: DriverStatus = status === 'AVAILABLE' ? 'BUSY' : 
                                    status === 'BUSY' ? 'OFFLINE' : 'AVAILABLE';
    
    await supabase
      .from('agent_availability')
      .upsert({
        user_id: user.id,
        status: newStatus,
        updated_at: new Date().toISOString(),
      }, { onConflict: 'user_id' });
    
    setStatus(newStatus);
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-muted/30">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/admin/login" replace />;
  }

  if (!canAccess) {
    return <Navigate to="/app" replace />;
  }

  const statusColors: Record<DriverStatus, string> = {
    AVAILABLE: 'bg-green-500',
    BUSY: 'bg-yellow-500',
    OFFLINE: 'bg-gray-400',
  };

  return (
    <>
    <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
    <div className="min-h-screen bg-muted/30 flex flex-col">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-gradient-to-r from-amber-500 to-orange-600 text-white shadow-lg">
        <div className="px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <img src={logoCalsan} alt="Calsan" className="h-10 rounded-lg" />
            <div>
              <p className="font-bold text-sm">Driver App</p>
              <p className="text-xs text-amber-100">{format(new Date(), 'EEEE, MMM d')}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {runsCount > 0 && (
              <Badge className="bg-white/20 text-white">
                {runsCount} Runs
              </Badge>
            )}
            <Button
              size="sm"
              variant="ghost"
              className="text-white hover:bg-white/10"
              onClick={toggleStatus}
            >
              <span className={cn('w-2 h-2 rounded-full mr-2', statusColors[status])} />
              {status}
            </Button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="flex-1 overflow-auto pb-20">
        <Outlet />
      </main>

      {/* Bottom Navigation */}
      <nav className="fixed bottom-0 left-0 right-0 bg-card border-t border-border shadow-lg z-50">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = item.end 
              ? location.pathname === item.path
              : location.pathname.startsWith(item.path) && item.path !== '/driver';
            
            return (
              <NavLink
                key={item.path}
                to={item.path}
                end={item.end}
                className={cn(
                  'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors min-w-[70px]',
                  isActive
                    ? 'text-primary'
                    : 'text-muted-foreground'
                )}
              >
                <Icon className="w-5 h-5" />
                <span className="text-xs font-medium">{item.label}</span>
              </NavLink>
            );
          })}
          <button
            onClick={signOut}
            className="flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors text-muted-foreground hover:text-destructive min-w-[70px]"
          >
            <LogOut className="w-5 h-5" />
            <span className="text-xs font-medium">Logout</span>
          </button>
        </div>
      </nav>

      <AiControlWidget />
    </div>
    </>
  );
}
