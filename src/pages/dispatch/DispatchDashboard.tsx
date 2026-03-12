import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  Truck, Clock, MapPin, AlertTriangle, CheckCircle, 
  Loader2, Calendar, GitBranch, BarChart3
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { DispatchLifecycleDashboard } from '@/components/lifecycle/dashboards';
import { DispatchOperationsPanel } from '@/components/dispatch/DispatchOperationsPanel';
import { OperationsIntelligencePanel } from '@/components/dispatch/OperationsIntelligencePanel';

interface DashboardStats {
  todayDeliveries: number;
  todayPickups: number;
  unassigned: number;
  flags: number;
}

export default function DispatchDashboard() {
  const navigate = useNavigate();
  const [stats, setStats] = useState<DashboardStats>({
    todayDeliveries: 0,
    todayPickups: 0,
    unassigned: 0,
    flags: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setIsLoading(true);
    try {
      const today = format(new Date(), 'yyyy-MM-dd');

      const [deliveries, pickups, unassigned, flagged] = await Promise.all([
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('scheduled_delivery_date', today)
          .not('status', 'in', '("completed","cancelled")'),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .eq('scheduled_pickup_date', today)
          .not('status', 'in', '("completed","cancelled")'),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .is('assigned_driver_id', null)
          .not('status', 'in', '("pending","completed","cancelled")')
          .or(`scheduled_delivery_date.gte.${today},scheduled_pickup_date.gte.${today}`),
        supabase
          .from('orders')
          .select('id', { count: 'exact', head: true })
          .or('overfill_flagged.eq.true,wrong_material_flagged.eq.true,is_dry_run.eq.true'),
      ]);

      setStats({
        todayDeliveries: deliveries.count || 0,
        todayPickups: pickups.count || 0,
        unassigned: unassigned.count || 0,
        flags: flagged.count || 0,
      });
    } catch (err) {
      console.error('Error fetching dispatch stats:', err);
    } finally {
      setIsLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <Tabs defaultValue="overview">
        <TabsList className="w-full md:w-auto">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="operations">Operations</TabsTrigger>
          <TabsTrigger value="intelligence"><BarChart3 className="w-3 h-3 mr-1" />Intel</TabsTrigger>
          <TabsTrigger value="lifecycle"><GitBranch className="w-3 h-3 mr-1" />Lifecycle</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Dispatch Dashboard</h1>
        <p className="text-muted-foreground">
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </p>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/dispatch/today')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayDeliveries}</p>
                <p className="text-xs text-muted-foreground">Today's Deliveries</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow"
          onClick={() => navigate('/dispatch/today')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                <Truck className="w-5 h-5 text-orange-600 rotate-180" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.todayPickups}</p>
                <p className="text-xs text-muted-foreground">Today's Pickups</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-yellow-200"
          onClick={() => navigate('/dispatch/today')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-yellow-100 flex items-center justify-center">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.unassigned}</p>
                <p className="text-xs text-muted-foreground">Unassigned</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card 
          className="cursor-pointer hover:shadow-md transition-shadow border-red-200"
          onClick={() => navigate('/dispatch/flags')}
        >
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center">
                <AlertTriangle className="w-5 h-5 text-red-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.flags}</p>
                <p className="text-xs text-muted-foreground">Flags</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Button 
          size="lg" 
          className="h-14 text-base"
          onClick={() => navigate('/dispatch/today')}
        >
          <Truck className="w-5 h-5 mr-2" />
          Today's Jobs
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 text-base"
          onClick={() => navigate('/dispatch/calendar')}
        >
          <Calendar className="w-5 h-5 mr-2" />
          Calendar
        </Button>
        <Button 
          size="lg" 
          variant="outline"
          className="h-14 text-base"
          onClick={() => navigate('/admin/dispatch/control-tower')}
        >
          <MapPin className="w-5 h-5 mr-2" />
          Control Tower
        </Button>
      </div>
          </div>
        </TabsContent>

        <TabsContent value="operations">
          <DispatchOperationsPanel />
        </TabsContent>

        <TabsContent value="intelligence">
          <OperationsIntelligencePanel />
        </TabsContent>

        <TabsContent value="lifecycle">
          <DispatchLifecycleDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
