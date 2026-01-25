import { useState, useEffect } from 'react';
import { format, subDays, startOfDay, endOfDay } from 'date-fns';
import {
  Phone,
  TrendingUp,
  TrendingDown,
  Clock,
  Users,
  PhoneIncoming,
  PhoneOutgoing,
  PhoneMissed,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import { supabase } from '@/integrations/supabase/client';

interface DailyStats {
  date: string;
  total: number;
  inbound: number;
  outbound: number;
  missed: number;
  avgDuration: number;
}

interface AgentStats {
  userId: string;
  name: string;
  totalCalls: number;
  avgDuration: number;
  missedRate: number;
}

export default function CallAnalyticsPage() {
  const [dateRange, setDateRange] = useState('7');
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
  const [agentStats, setAgentStats] = useState<AgentStats[]>([]);
  const [summary, setSummary] = useState({
    totalCalls: 0,
    avgDuration: 0,
    missedRate: 0,
    peakHour: '10:00',
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      setIsLoading(true);
      const days = parseInt(dateRange);
      const startDate = startOfDay(subDays(new Date(), days)).toISOString();
      const endDate = endOfDay(new Date()).toISOString();

      // Fetch calls in date range
      const { data: calls } = await supabase
        .from('call_events')
        .select('*')
        .gte('started_at', startDate)
        .lte('started_at', endDate)
        .order('started_at', { ascending: true });

      if (calls) {
        // Calculate daily stats
        const dailyMap = new Map<string, DailyStats>();
        
        calls.forEach((call) => {
          const date = format(new Date(call.started_at), 'MMM d');
          const existing = dailyMap.get(date) || {
            date,
            total: 0,
            inbound: 0,
            outbound: 0,
            missed: 0,
            avgDuration: 0,
          };

          existing.total++;
          if (call.direction === 'INBOUND') existing.inbound++;
          else existing.outbound++;
          if (call.call_status === 'MISSED') existing.missed++;
          existing.avgDuration = (existing.avgDuration + (call.duration_seconds || 0)) / 2;

          dailyMap.set(date, existing);
        });

        setDailyStats(Array.from(dailyMap.values()));

        // Calculate summary
        const totalDuration = calls.reduce((sum, c) => sum + (c.duration_seconds || 0), 0);
        const missedCalls = calls.filter((c) => c.call_status === 'MISSED').length;
        
        // Find peak hour
        const hourCounts = new Map<number, number>();
        calls.forEach((call) => {
          const hour = new Date(call.started_at).getHours();
          hourCounts.set(hour, (hourCounts.get(hour) || 0) + 1);
        });
        let peakHour = 10;
        let peakCount = 0;
        hourCounts.forEach((count, hour) => {
          if (count > peakCount) {
            peakCount = count;
            peakHour = hour;
          }
        });

        setSummary({
          totalCalls: calls.length,
          avgDuration: calls.length > 0 ? Math.round(totalDuration / calls.length) : 0,
          missedRate: calls.length > 0 ? Math.round((missedCalls / calls.length) * 100) : 0,
          peakHour: `${peakHour}:00`,
        });

        // Calculate agent stats
        const agentMap = new Map<string, {
          totalCalls: number;
          totalDuration: number;
          missedCalls: number;
        }>();

        calls.forEach((call) => {
          if (!call.assigned_user_id) return;
          const existing = agentMap.get(call.assigned_user_id) || {
            totalCalls: 0,
            totalDuration: 0,
            missedCalls: 0,
          };

          existing.totalCalls++;
          existing.totalDuration += call.duration_seconds || 0;
          if (call.call_status === 'MISSED') existing.missedCalls++;

          agentMap.set(call.assigned_user_id, existing);
        });

        const agentStatsArray: AgentStats[] = [];
        agentMap.forEach((stats, userId) => {
          agentStatsArray.push({
            userId,
            name: `Agent ${userId.slice(0, 8)}`,
            totalCalls: stats.totalCalls,
            avgDuration: Math.round(stats.totalDuration / stats.totalCalls),
            missedRate: Math.round((stats.missedCalls / stats.totalCalls) * 100),
          });
        });

        setAgentStats(agentStatsArray.sort((a, b) => b.totalCalls - a.totalCalls));
      }

      setIsLoading(false);
    };

    fetchAnalytics();
  }, [dateRange]);

  const formatDuration = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, '0')}`;
  };

  const COLORS = ['#3b82f6', '#22c55e', '#ef4444', '#f59e0b'];

  const pieData = [
    { name: 'Completed', value: dailyStats.reduce((sum, d) => sum + (d.total - d.missed), 0) },
    { name: 'Missed', value: dailyStats.reduce((sum, d) => sum + d.missed, 0) },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Call Analytics</h1>
          <p className="text-muted-foreground">
            Monitor call performance and trends
          </p>
        </div>
        <Select value={dateRange} onValueChange={setDateRange}>
          <SelectTrigger className="w-40">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="7">Last 7 days</SelectItem>
            <SelectItem value="14">Last 14 days</SelectItem>
            <SelectItem value="30">Last 30 days</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Total Calls</p>
                <p className="text-2xl font-bold">{summary.totalCalls}</p>
              </div>
              <Phone className="w-8 h-8 text-primary" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{formatDuration(summary.avgDuration)}</p>
              </div>
              <Clock className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Missed Rate</p>
                <p className="text-2xl font-bold">{summary.missedRate}%</p>
              </div>
              <PhoneMissed className="w-8 h-8 text-destructive" />
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Peak Hour</p>
                <p className="text-2xl font-bold">{summary.peakHour}</p>
              </div>
              <TrendingUp className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily Trend */}
        <Card>
          <CardHeader>
            <CardTitle>Daily Call Volume</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={dailyStats}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="date" />
                  <YAxis />
                  <Tooltip />
                  <Line type="monotone" dataKey="total" stroke="#3b82f6" name="Total" />
                  <Line type="monotone" dataKey="inbound" stroke="#22c55e" name="Inbound" />
                  <Line type="monotone" dataKey="outbound" stroke="#f59e0b" name="Outbound" />
                </LineChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Call Outcomes */}
        <Card>
          <CardHeader>
            <CardTitle>Call Outcomes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="h-64 flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={index === 0 ? '#22c55e' : '#ef4444'} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Agent Performance */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="w-5 h-5" />
              Agent Performance
            </CardTitle>
          </CardHeader>
          <CardContent>
            {agentStats.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">
                No agent data available for this period
              </p>
            ) : (
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={agentStats}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="totalCalls" fill="#3b82f6" name="Total Calls" />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
