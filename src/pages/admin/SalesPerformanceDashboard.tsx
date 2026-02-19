import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Loader2, Users, Clock, TrendingUp, AlertTriangle } from 'lucide-react';

interface AgentStats {
  user_id: string;
  email: string;
  total_assigned: number;
  active_leads: number;
  sla_breaches: number;
  avg_response_minutes: number | null;
  converted: number;
  lost: number;
}

export default function SalesPerformanceDashboard() {
  const [agents, setAgents] = useState<AgentStats[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      // Get all leads with owners
      const { data: leads } = await supabase
        .from('sales_leads')
        .select('owner_user_id, assigned_to, lead_status, is_sla_breached, first_contact_at, created_at, escalation_level');

      if (!leads) { setLoading(false); return; }

      // Get user display names
      const ownerIds = new Set<string>();
      leads.forEach(l => {
        const id = l.owner_user_id || l.assigned_to;
        if (id) ownerIds.add(id);
      });

      const profileMap: Record<string, string> = {};
      if (ownerIds.size > 0) {
        const { data: profiles } = await supabase
          .from('user_profiles')
          .select('user_id, display_name')
          .in('user_id', Array.from(ownerIds));

        (profiles || []).forEach((p: any) => {
          profileMap[p.user_id] = p.display_name || p.user_id.slice(0, 8);
        });
      }

      // Compute per-agent stats
      const statsMap: Record<string, AgentStats> = {};

      leads.forEach(l => {
        const uid = l.owner_user_id || l.assigned_to;
        if (!uid) return;

        if (!statsMap[uid]) {
          statsMap[uid] = {
            user_id: uid,
            email: profileMap[uid] || uid.slice(0, 8),
            total_assigned: 0,
            active_leads: 0,
            sla_breaches: 0,
            avg_response_minutes: null,
            converted: 0,
            lost: 0,
          };
        }

        const s = statsMap[uid];
        s.total_assigned++;

        if (['new', 'contacted', 'qualified', 'quoted'].includes(l.lead_status)) {
          s.active_leads++;
        }
        if (l.is_sla_breached) s.sla_breaches++;
        if (l.lead_status === 'converted') s.converted++;
        if (l.lead_status === 'lost') s.lost++;

        if (l.first_contact_at && l.created_at) {
          const responseMin = (new Date(l.first_contact_at).getTime() - new Date(l.created_at).getTime()) / 60000;
          if (s.avg_response_minutes === null) {
            s.avg_response_minutes = responseMin;
          } else {
            s.avg_response_minutes = (s.avg_response_minutes + responseMin) / 2;
          }
        }
      });

      setAgents(Object.values(statsMap).sort((a, b) => b.total_assigned - a.total_assigned));
      setLoading(false);
    }

    fetchStats();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  const totalLeads = agents.reduce((s, a) => s + a.total_assigned, 0);
  const totalBreaches = agents.reduce((s, a) => s + a.sla_breaches, 0);
  const totalConverted = agents.reduce((s, a) => s + a.converted, 0);
  const breachRate = totalLeads > 0 ? Math.round((totalBreaches / totalLeads) * 100) : 0;
  const conversionRate = totalLeads > 0 ? Math.round((totalConverted / totalLeads) * 100) : 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Users className="w-6 h-6" /> Sales Performance
        </h1>
        <p className="text-sm text-muted-foreground">Per-agent metrics: response times, SLA compliance, conversions</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{totalLeads}</div>
            <p className="text-xs text-muted-foreground">Total Assigned</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold">{agents.length}</div>
            <p className="text-xs text-muted-foreground">Active Agents</p>
          </CardContent>
        </Card>
        <Card className={breachRate > 20 ? 'border-destructive/50' : ''}>
          <CardContent className="pt-4 pb-3">
            <div className={`text-2xl font-bold ${breachRate > 20 ? 'text-destructive' : ''}`}>{breachRate}%</div>
            <p className="text-xs text-muted-foreground">SLA Breach Rate</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="text-2xl font-bold text-emerald-600">{conversionRate}%</div>
            <p className="text-xs text-muted-foreground">Conversion Rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Agent Table */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Agent Breakdown</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Agent</TableHead>
                <TableHead className="text-center">Assigned</TableHead>
                <TableHead className="text-center">Active</TableHead>
                <TableHead className="text-center">Avg Response</TableHead>
                <TableHead className="text-center">SLA Breaches</TableHead>
                <TableHead className="text-center">Converted</TableHead>
                <TableHead className="text-center">Lost</TableHead>
                <TableHead className="text-center">Conv %</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {agents.map(agent => {
                const convPct = agent.total_assigned > 0 ? Math.round((agent.converted / agent.total_assigned) * 100) : 0;
                const breachPct = agent.total_assigned > 0 ? Math.round((agent.sla_breaches / agent.total_assigned) * 100) : 0;

                return (
                  <TableRow key={agent.user_id}>
                    <TableCell className="font-medium">{agent.email}</TableCell>
                    <TableCell className="text-center">{agent.total_assigned}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant="secondary">{agent.active_leads}</Badge>
                    </TableCell>
                    <TableCell className="text-center">
                      {agent.avg_response_minutes !== null ? (
                        <span className={agent.avg_response_minutes > 15 ? 'text-destructive font-medium' : 'text-emerald-600'}>
                          {Math.round(agent.avg_response_minutes)}m
                        </span>
                      ) : '--'}
                    </TableCell>
                    <TableCell className="text-center">
                      {agent.sla_breaches > 0 ? (
                        <Badge variant="destructive" className="text-xs">
                          {agent.sla_breaches} ({breachPct}%)
                        </Badge>
                      ) : (
                        <span className="text-muted-foreground">0</span>
                      )}
                    </TableCell>
                    <TableCell className="text-center text-emerald-600 font-medium">{agent.converted}</TableCell>
                    <TableCell className="text-center text-muted-foreground">{agent.lost}</TableCell>
                    <TableCell className="text-center">
                      <Badge variant={convPct >= 30 ? 'default' : 'secondary'} className="text-xs">
                        {convPct}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                );
              })}
              {agents.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                    No agent data available yet
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
