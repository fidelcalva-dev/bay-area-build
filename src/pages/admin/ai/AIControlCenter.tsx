import { useNavigate } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Brain, TrendingUp, Users, Truck, Wrench, DollarSign, Globe, Shield, ArrowRight } from 'lucide-react';

const copilots = [
  { type: 'SALES', title: 'AI Sales Copilot', icon: TrendingUp, route: '/admin/ai/sales', description: 'Lead scoring, follow-up drafts, conversion optimization', color: 'text-emerald-500' },
  { type: 'CS', title: 'AI Customer Service Copilot', icon: Users, route: '/admin/ai/customer-service', description: 'Customer summaries, response drafts, escalation detection', color: 'text-blue-500' },
  { type: 'DISPATCH', title: 'AI Dispatch Copilot', icon: Truck, route: '/admin/ai/dispatch', description: 'Route optimization, driver assignment, scheduling risks', color: 'text-orange-500' },
  { type: 'DRIVER', title: 'AI Driver Copilot', icon: Truck, route: '/admin/ai/driver', description: 'Job summaries, missing step detection, next action reminders', color: 'text-purple-500' },
  { type: 'FLEET', title: 'AI Fleet Copilot', icon: Wrench, route: '/admin/ai/fleet', description: 'Maintenance patterns, downtime risk, preventive scheduling', color: 'text-red-500' },
  { type: 'FINANCE', title: 'AI Finance Copilot', icon: DollarSign, route: '/admin/ai/finance', description: 'Collection priorities, overdue flags, reconciliation gaps', color: 'text-yellow-600' },
  { type: 'SEO', title: 'AI SEO Copilot', icon: Globe, route: '/admin/ai/seo', description: 'Page health, content gaps, ranking opportunities', color: 'text-cyan-500' },
  { type: 'ADMIN', title: 'AI Admin Copilot', icon: Shield, route: '/admin/ai/admin', description: 'System health, workflow detection, build priorities', color: 'text-primary' },
];

export default function AIControlCenter() {
  const navigate = useNavigate();

  return (
    <>
      <Helmet><title>AI Control Center | Calsan</title></Helmet>
      <div className="space-y-6 p-6">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6 text-primary" />
            AI Control Center
          </h1>
          <p className="text-muted-foreground mt-1">Manage all AI copilots from one dashboard</p>
        </div>

        {/* Global Status */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">Mode</p>
              <Badge variant="outline" className="mt-1">DRY_RUN</Badge>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">Active Copilots</p>
              <p className="text-2xl font-bold mt-1">8</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">Recommendations Today</p>
              <p className="text-2xl font-bold mt-1">—</p>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground uppercase">Pending Actions</p>
              <p className="text-2xl font-bold mt-1">—</p>
            </CardContent>
          </Card>
        </div>

        {/* Copilot Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
          {copilots.map(c => {
            const Icon = c.icon;
            return (
              <Card key={c.type} className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => navigate(c.route)}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <Icon className={`h-5 w-5 ${c.color}`} />
                    <Badge variant="secondary" className="text-[10px]">DRY_RUN</Badge>
                  </div>
                  <CardTitle className="text-sm mt-2">{c.title}</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-3">{c.description}</p>
                  <div className="flex items-center justify-between text-xs text-muted-foreground">
                    <span>0 recommendations</span>
                    <ArrowRight className="h-3.5 w-3.5 opacity-0 group-hover:opacity-100 transition-opacity text-primary" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </>
  );
}
