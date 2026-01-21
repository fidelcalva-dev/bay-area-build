import { useEffect, useState } from 'react';
import { Package, ClipboardList, MessageSquare, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface Stats {
  pendingRequests: number;
  todaysOrders: number;
  unconfirmedSchedules: number;
  messagesSentToday: number;
}

export default function CSDashboard() {
  const [stats, setStats] = useState<Stats>({
    pendingRequests: 0,
    todaysOrders: 0,
    unconfirmedSchedules: 0,
    messagesSentToday: 0,
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    const today = new Date().toISOString().split('T')[0];
    
    const [requestsRes, ordersRes, unconfirmedRes] = await Promise.all([
      supabase.from('service_requests').select('id', { count: 'exact' }).eq('status', 'pending'),
      supabase.from('orders').select('id', { count: 'exact' }).gte('scheduled_delivery_date', today),
      supabase.from('orders').select('id', { count: 'exact' }).eq('status', 'pending'),
    ]);

    setStats({
      pendingRequests: requestsRes.count || 0,
      todaysOrders: ordersRes.count || 0,
      unconfirmedSchedules: unconfirmedRes.count || 0,
      messagesSentToday: 0,
    });
    setIsLoading(false);
  }

  const statCards = [
    {
      title: 'Pending Requests',
      value: stats.pendingRequests,
      icon: ClipboardList,
      color: 'text-orange-600',
      bgColor: 'bg-orange-100',
    },
    {
      title: 'Unconfirmed Schedules',
      value: stats.unconfirmedSchedules,
      icon: AlertTriangle,
      color: 'text-yellow-600',
      bgColor: 'bg-yellow-100',
    },
    {
      title: 'Today\'s Orders',
      value: stats.todaysOrders,
      icon: Package,
      color: 'text-blue-600',
      bgColor: 'bg-blue-100',
    },
    {
      title: 'Messages Sent Today',
      value: stats.messagesSentToday,
      icon: MessageSquare,
      color: 'text-green-600',
      bgColor: 'bg-green-100',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">CS Dashboard</h1>
        <p className="text-muted-foreground mt-1">
          Customer service overview and quick actions
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((stat) => {
          const Icon = stat.icon;
          return (
            <Card key={stat.title}>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">
                  {stat.title}
                </CardTitle>
                <div className={`p-2 rounded-lg ${stat.bgColor}`}>
                  <Icon className={`w-4 h-4 ${stat.color}`} />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold">{stat.value}</div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="w-5 h-5" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-muted-foreground text-sm">
              Activity feed coming soon...
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5" />
              Quick Actions
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <p className="text-muted-foreground text-sm">
              • Confirm pending schedules<br />
              • Review pickup requests<br />
              • Send follow-up messages
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
