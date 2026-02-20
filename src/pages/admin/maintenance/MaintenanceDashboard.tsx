/**
 * Maintenance Dashboard — Fleet overview with stats, issues, work orders
 */
import { useState, useEffect } from 'react';
import { useNavigate, Outlet, NavLink, useLocation } from 'react-router-dom';
import {
  Truck, AlertTriangle, Wrench, ClipboardList, Loader2, Shield,
  CheckCircle2, XCircle, Clock
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getFleetStats } from '@/lib/fleetService';

export default function MaintenanceDashboard() {
  const [stats, setStats] = useState<{
    available: number; inService: number; outOfService: number;
    maintenance: number; openIssues: number; activeWorkOrders: number;
  } | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      const s = await getFleetStats();
      setStats(s);
      setIsLoading(false);
    })();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Fleet & Maintenance</h1>
        <p className="text-muted-foreground">Vehicle status, inspections, issues, and work orders</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={<Truck className="w-5 h-5" />} label="Available" value={stats?.available || 0} color="text-green-600 bg-green-50" />
        <StatCard icon={<Truck className="w-5 h-5" />} label="In Service" value={stats?.inService || 0} color="text-blue-600 bg-blue-50" />
        <StatCard icon={<XCircle className="w-5 h-5" />} label="Out of Service" value={stats?.outOfService || 0} color="text-red-600 bg-red-50" />
        <StatCard icon={<Wrench className="w-5 h-5" />} label="Maintenance" value={stats?.maintenance || 0} color="text-amber-600 bg-amber-50" />
        <StatCard icon={<AlertTriangle className="w-5 h-5" />} label="Open Issues" value={stats?.openIssues || 0} color="text-orange-600 bg-orange-50" />
        <StatCard icon={<ClipboardList className="w-5 h-5" />} label="Active WOs" value={stats?.activeWorkOrders || 0} color="text-purple-600 bg-purple-50" />
      </div>

      {/* Sub-navigation */}
      <div className="flex gap-2 border-b pb-2">
        <NavLink to="/admin/maintenance/trucks" className={({ isActive }) => cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
        )}>
          <Truck className="w-4 h-4 inline mr-1.5" />Trucks
        </NavLink>
        <NavLink to="/admin/maintenance/issues" className={({ isActive }) => cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
        )}>
          <AlertTriangle className="w-4 h-4 inline mr-1.5" />Issues
        </NavLink>
        <NavLink to="/admin/maintenance/work-orders" className={({ isActive }) => cn(
          'px-4 py-2 rounded-lg text-sm font-medium transition-colors',
          isActive ? 'bg-primary text-primary-foreground' : 'text-muted-foreground hover:bg-muted'
        )}>
          <Wrench className="w-4 h-4 inline mr-1.5" />Work Orders
        </NavLink>
      </div>

      <Outlet />
    </div>
  );
}

function StatCard({ icon, label, value, color }: { icon: React.ReactNode; label: string; value: number; color: string }) {
  return (
    <div className={cn('rounded-xl p-4 border', color.split(' ')[1])}>
      <div className={cn('flex items-center gap-2 mb-2', color.split(' ')[0])}>
        {icon}
        <span className="text-xs font-medium">{label}</span>
      </div>
      <p className="text-2xl font-bold">{value}</p>
    </div>
  );
}
