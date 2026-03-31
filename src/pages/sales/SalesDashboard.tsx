import { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Users, FileText, DollarSign,
  Clock, Loader2, Zap, HardHat,
  Layers, Plus, AlertTriangle, CheckCircle,
  Bot, Mail, UserCheck, Calendar
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format } from "date-fns";

interface DashboardStats {
  leadsNew: number;
  followUpsDue: number;
  quotesPending: number;
  contractorApps: number;
  bundleLeads: number;
  cleanupLeads: number;
  highRisk: number;
  wonThisWeek: number;
  existingCustomers: number;
  scheduledJobs: number;
  aiChatLeads: number;
  contactFormLeads: number;
  pipelineValue: number;
  recentActivity: Array<{
    type: "lead" | "quote" | "contract" | "payment";
    name: string;
    action: string;
    time: string;
    link?: string;
  }>;
}

export default function SalesDashboard() {
  useAdminAuth();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    leadsNew: 0, followUpsDue: 0, quotesPending: 0,
    contractorApps: 0, bundleLeads: 0, cleanupLeads: 0,
    highRisk: 0, wonThisWeek: 0, existingCustomers: 0,
    scheduledJobs: 0, aiChatLeads: 0, contactFormLeads: 0,
    pipelineValue: 0, recentActivity: [],
  });

  useEffect(() => { fetchStats(); }, []);

  async function fetchStats() {
    setIsLoading(true);
    try {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString();

      const [leadsRes, quotesRes, ordersRes] = await Promise.all([
        supabase.from("sales_leads").select("lead_status, lead_quality_label, urgency_score, is_existing_customer, contractor_flag, service_line, bundle_opportunity_flag, source_channel, created_at, customer_name"),
        supabase.from("quotes").select("id, status, subtotal, created_at, customer_name").order("created_at", { ascending: false }).limit(200),
        supabase.from("orders").select("id, status").in("status", ["confirmed", "scheduled"]),
      ]);

      const leads = leadsRes.data || [];
      const quotes = quotesRes.data || [];
      const orders = ordersRes.data || [];

      const followupStatuses = ['contacted', 'qualified', 'quoted'];
      const aiSources = ['AI_CHAT', 'AI_ASSISTANT', 'WEBSITE_CHAT', 'WEBSITE_ASSISTANT'];
      const contactSources = ['CONTACT_FORM', 'CLEANUP_CONTACT', 'CALLBACK_REQUEST'];

      const recentActivity = [
        ...leads.filter(l => l.lead_status === 'new').slice(0, 3).map(l => ({
          type: "lead" as const,
          name: l.customer_name || "New Lead",
          action: `Status: New`,
          time: l.created_at,
          link: "/sales/leads",
        })),
        ...quotes.slice(0, 2).map(q => ({
          type: "quote" as const,
          name: q.customer_name || "Quote",
          action: `$${q.subtotal?.toFixed(0) || 0} — ${q.status}`,
          time: q.created_at,
          link: "/sales/quotes",
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setStats({
        leadsNew: leads.filter(l => l.lead_status === 'new').length,
        followUpsDue: leads.filter(l => followupStatuses.includes(l.lead_status)).length,
        quotesPending: quotes.filter(q => ['saved', 'draft', 'sent', 'viewed'].includes(q.status)).length,
        contractorApps: leads.filter(l => l.contractor_flag).length,
        bundleLeads: leads.filter(l => l.service_line === 'BOTH' || l.bundle_opportunity_flag).length,
        cleanupLeads: leads.filter(l => ['CLEANUP', 'BOTH'].includes(l.service_line || '')).length,
        highRisk: leads.filter(l => l.lead_quality_label === 'RED').length,
        wonThisWeek: leads.filter(l => l.lead_status === 'converted' && l.created_at >= weekAgo).length,
        existingCustomers: leads.filter(l => l.is_existing_customer).length,
        scheduledJobs: orders.length,
        aiChatLeads: leads.filter(l => aiSources.includes(l.source_channel || '')).length,
        contactFormLeads: leads.filter(l => contactSources.includes(l.source_channel || '')).length,
        pipelineValue: quotes.filter(q => q.status === 'saved').reduce((sum, q) => sum + (q.subtotal || 0), 0),
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

  const quickActions = [
    { label: "New Lead", icon: Plus, href: "/sales/leads", variant: "default" as const },
    { label: "New Quote", icon: FileText, href: "/sales/quotes/new", variant: "default" as const },
    { label: "Open Leads", icon: Users, href: "/sales/leads", variant: "outline" as const },
    { label: "Open Quotes", icon: FileText, href: "/sales/quotes", variant: "outline" as const },
    { label: "Contractors", icon: HardHat, href: "/sales/leads?tab=contractor", variant: "outline" as const },
    { label: "Cleanup Board", icon: HardHat, href: "/sales/leads?view=cleanup-board", variant: "outline" as const },
  ];

  const primaryKpis = [
    { label: "New Leads", value: stats.leadsNew, icon: Zap, alert: stats.leadsNew > 0, href: "/sales/leads?tab=new" },
    { label: "Follow-Up Today", value: stats.followUpsDue, icon: Clock, alert: stats.followUpsDue > 0, href: "/sales/leads?tab=needs_followup" },
    { label: "Quotes Pending", value: stats.quotesPending, icon: FileText, alert: stats.quotesPending > 0, href: "/sales/quotes?status=saved" },
    { label: "Contractor Apps", value: stats.contractorApps, icon: HardHat, href: "/sales/leads?tab=contractor" },
    { label: "Bundle Leads", value: stats.bundleLeads, icon: Layers, href: "/sales/leads?tab=bundle" },
  ];

  const secondaryKpis = [
    { label: "AI Chat Leads", value: stats.aiChatLeads, icon: Bot, href: "/sales/leads?tab=ai_chat" },
    { label: "Contact Form", value: stats.contactFormLeads, icon: Mail, href: "/sales/leads?tab=contact_form" },
    { label: "High Risk", value: stats.highRisk, icon: AlertTriangle, href: "/sales/leads?tab=high_risk" },
    { label: "Won This Week", value: stats.wonThisWeek, icon: CheckCircle },
    { label: "Existing Customers", value: stats.existingCustomers, icon: UserCheck, href: "/sales/leads?tab=existing_customer" },
    { label: "Scheduled Jobs", value: stats.scheduledJobs, icon: Calendar, href: "/admin/orders" },
    { label: "Pipeline Value", value: `$${(stats.pipelineValue / 1000).toFixed(1)}k`, icon: DollarSign, href: "/sales/quotes" },
    { label: "Cleanup Leads", value: stats.cleanupLeads, icon: HardHat, href: "/sales/leads?tab=cleanup" },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold">Sales Dashboard</h1>
        <p className="text-sm text-muted-foreground">Quick access to leads, quotes, and pipeline</p>
      </div>

      {/* Quick Actions */}
      <div className="flex flex-wrap gap-2">
        {quickActions.map(action => {
          const Icon = action.icon;
          return (
            <Button key={action.label} variant={action.variant} size="sm" asChild>
              <Link to={action.href}>
                <Icon className="w-4 h-4 mr-1.5" />
                {action.label}
              </Link>
            </Button>
          );
        })}
      </div>

      {/* Primary KPIs — clickable */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
        {primaryKpis.map(kpi => {
          const Icon = kpi.icon;
          return (
            <Card
              key={kpi.label}
              className={`cursor-pointer hover:border-primary/50 transition-colors ${kpi.alert ? 'border-destructive/30' : ''}`}
              onClick={() => kpi.href && navigate(kpi.href)}
            >
              <CardContent className="flex items-center gap-3 pt-4 pb-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${kpi.alert ? 'bg-destructive/10' : 'bg-muted'}`}>
                  <Icon className={`w-4 h-4 ${kpi.alert ? 'text-destructive' : 'text-primary'}`} />
                </div>
                <div className="min-w-0">
                  <p className="text-xs text-muted-foreground truncate">{kpi.label}</p>
                  <p className={`text-lg font-bold ${kpi.alert ? 'text-destructive' : ''}`}>{kpi.value}</p>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Secondary KPIs + Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Secondary metrics */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-base">Pipeline Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {secondaryKpis.map(kpi => {
                  const Icon = kpi.icon;
                  return (
                    <div
                      key={kpi.label}
                      className={`flex items-center gap-2 p-2 rounded-lg hover:bg-muted/50 transition-colors ${kpi.href ? 'cursor-pointer' : ''}`}
                      onClick={() => kpi.href && navigate(kpi.href)}
                    >
                      <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                      <div className="min-w-0">
                        <p className="text-sm font-semibold">{kpi.value}</p>
                        <p className="text-[11px] text-muted-foreground truncate">{kpi.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {stats.recentActivity.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">No recent activity</p>
              ) : (
                stats.recentActivity.map((activity, i) => (
                  <div
                    key={i}
                    className={`flex items-center justify-between ${activity.link ? 'cursor-pointer hover:bg-muted/50 rounded-md p-1 -m-1' : ''}`}
                    onClick={() => activity.link && navigate(activity.link)}
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{activity.name}</p>
                      <p className="text-xs text-muted-foreground">{activity.action}</p>
                    </div>
                    <span className="text-[11px] text-muted-foreground shrink-0 ml-2">
                      {format(new Date(activity.time), "h:mm a")}
                    </span>
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
