import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Users, FileText, TrendingUp, DollarSign,
  Clock, Loader2, GitBranch, ScrollText, CreditCard,
  Phone, MessageSquare, Zap, Target, Mail, Send, Truck,
  StickyNote, Package,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format } from "date-fns";
import { SalesLifecycleDashboard } from "@/components/lifecycle/dashboards";
import { HotAILeadsQueue } from "@/components/sales/HotAILeadsQueue";
import { SalesPipelineCards } from "@/components/sales/SalesPipelineCards";
import { SalesScriptLibrary } from "@/components/sales/SalesScriptLibrary";
import { SalesReadinessPanel } from "@/components/sales/SalesReadinessPanel";

interface DashboardStats {
  leadsTotal: number;
  leadsNew: number;
  leadsConverted: number;
  leadsHot: number;
  quotesTotal: number;
  quotesSaved: number;
  pipelineValue: number;
  contractsSent: number;
  paymentsSent: number;
  ordersCreated: number;
  followUpsDue: number;
  recentActivity: Array<{
    type: "lead" | "quote" | "contract" | "payment";
    name: string;
    action: string;
    time: string;
  }>;
}

export default function SalesDashboard() {
  const { user } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    leadsTotal: 0, leadsNew: 0, leadsConverted: 0, leadsHot: 0,
    quotesTotal: 0, quotesSaved: 0, pipelineValue: 0,
    contractsSent: 0, paymentsSent: 0, ordersCreated: 0, followUpsDue: 0,
    recentActivity: [],
  });

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    setIsLoading(true);
    try {
      const now = new Date();
      const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
      const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();

      const [leadsRes, quotesRes, contractsRes, paymentsRes, ordersRes, followUpRes] = await Promise.all([
        supabase.from("sales_leads").select("lead_status, created_at, lead_quality_label"),
        supabase.from("quotes").select("status, subtotal, created_at, customer_name").order("created_at", { ascending: false }).limit(200),
        supabase.from("quote_contracts").select("status, created_at, customer_name").order("created_at", { ascending: false }).limit(50),
        supabase.from("payment_requests" as "orders").select("status, amount, created_at" as "*").order("created_at", { ascending: false }).limit(50),
        supabase.from("orders").select("id, created_at").gte("created_at", todayStart),
        supabase.from("sales_leads").select("id").eq("lead_status", "contacted").not("last_contacted_at", "is", null),
      ]);

      const leads = leadsRes.data || [];
      const quotes = quotesRes.data || [];
      const contracts = (contractsRes.data || []) as any[];
      const payments = ((paymentsRes.data || []) as any[]);
      const orders = ordersRes.data || [];
      const followUps = followUpRes.data || [];

      const hotLeads = leads.filter(l => l.lead_status === "new" && l.created_at >= twoHoursAgo).length;

      const recentActivity = [
        ...leads.slice(0, 2).map((l) => ({
          type: "lead" as const,
          name: "New Lead",
          action: `Status: ${l.lead_status}`,
          time: l.created_at,
        })),
        ...quotes.slice(0, 2).map((q) => ({
          type: "quote" as const,
          name: q.customer_name || "Quote",
          action: `$${q.subtotal?.toFixed(0) || 0}`,
          time: q.created_at,
        })),
        ...contracts.slice(0, 1).map((c: any) => ({
          type: "contract" as const,
          name: c.customer_name || "Contract",
          action: `Status: ${c.status}`,
          time: c.created_at,
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 6);

      setStats({
        leadsTotal: leads.length,
        leadsNew: leads.filter((l) => l.lead_status === "new").length,
        leadsConverted: leads.filter((l) => l.lead_status === "converted").length,
        leadsHot: hotLeads,
        quotesTotal: quotes.length,
        quotesSaved: quotes.filter((q) => q.status === "saved").length,
        pipelineValue: quotes.filter(q => q.status === "saved").reduce((sum, q) => sum + (q.subtotal || 0), 0),
        contractsSent: contracts.filter((c: any) => c.status === "pending").length,
        paymentsSent: payments.filter((p: any) => p.status === "sent").length,
        ordersCreated: orders.length,
        followUpsDue: followUps.length,
        recentActivity,
      });
    } catch (err) {
      console.error(err);
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

  const kpis = [
    { label: "New Leads", value: stats.leadsNew, icon: Users, alert: stats.leadsNew > 0 },
    { label: "Hot Leads", value: stats.leadsHot, icon: Zap, alert: stats.leadsHot > 0 },
    { label: "Quotes Ready", value: stats.quotesSaved, icon: FileText },
    { label: "Pipeline Value", value: `$${(stats.pipelineValue / 1000).toFixed(1)}k`, icon: DollarSign },
    { label: "Contracts Pending", value: stats.contractsSent, icon: ScrollText },
    { label: "Payments Pending", value: stats.paymentsSent, icon: CreditCard },
    { label: "Orders Today", value: stats.ordersCreated, icon: Target },
    { label: "Follow-Ups Due", value: stats.followUpsDue, icon: Clock, alert: stats.followUpsDue > 0 },
  ];

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="readiness"><CheckCircle className="w-3 h-3 mr-1" />Readiness</TabsTrigger>
          <TabsTrigger value="lifecycle"><GitBranch className="w-3 h-3 mr-1" />Lifecycle Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">

      {/* Hot AI Leads */}
      <HotAILeadsQueue />

      {/* KPI Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(kpi => (
          <Card key={kpi.label}>
            <CardContent className="flex items-center gap-3 pt-4 pb-3">
              <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${kpi.alert ? 'bg-destructive/10' : 'bg-muted'}`}>
                <kpi.icon className={`w-4 h-4 ${kpi.alert ? 'text-destructive' : 'text-primary'}`} />
              </div>
              <div className="min-w-0">
                <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                <p className={`text-lg font-bold ${kpi.alert ? 'text-destructive' : ''}`}>{kpi.value}</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pipeline Cards */}
      <SalesPipelineCards />

      {/* Quick Actions + Recent Activity */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="grid grid-cols-2 gap-2">
            <Button className="justify-start" asChild>
              <Link to="/sales/quotes/new">
                <FileText className="w-4 h-4 mr-2" /> New Quote
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/sales/leads">
                <Users className="w-4 h-4 mr-2" /> Lead Hub
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/admin/customers">
                <Users className="w-4 h-4 mr-2" /> Customers
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/sales/quotes">
                <FileText className="w-4 h-4 mr-2" /> All Quotes
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/sales/calls">
                <Phone className="w-4 h-4 mr-2" /> Call Log
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/admin/orders">
                <Package className="w-4 h-4 mr-2" /> Orders
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/finance/payments">
                <CreditCard className="w-4 h-4 mr-2" /> Payments
              </Link>
            </Button>
            <Button variant="outline" className="justify-start" asChild>
              <Link to="/dispatch">
                <Truck className="w-4 h-4 mr-2" /> Dispatch
              </Link>
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                stats.recentActivity.map((activity, i) => {
                  const iconMap = {
                    lead: { Icon: Users, bg: "bg-primary/10", fg: "text-primary" },
                    quote: { Icon: FileText, bg: "bg-primary/10", fg: "text-primary" },
                    contract: { Icon: ScrollText, bg: "bg-primary/10", fg: "text-primary" },
                    payment: { Icon: CreditCard, bg: "bg-primary/10", fg: "text-primary" },
                  }[activity.type];
                  return (
                    <div key={i} className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-lg ${iconMap.bg}`}>
                          <iconMap.Icon className={`w-3 h-3 ${iconMap.fg}`} />
                        </div>
                        <div>
                          <p className="text-sm font-medium">{activity.name}</p>
                          <p className="text-xs text-muted-foreground">{activity.action}</p>
                        </div>
                      </div>
                      <span className="text-xs text-muted-foreground flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {format(new Date(activity.time), "h:mm a")}
                      </span>
                    </div>
                  );
                })
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Sales Scripts */}
      <SalesScriptLibrary />
          </div>
        </TabsContent>

        <TabsContent value="readiness">
          <SalesReadinessPanel />
        </TabsContent>

        <TabsContent value="lifecycle">
          <SalesLifecycleDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}
