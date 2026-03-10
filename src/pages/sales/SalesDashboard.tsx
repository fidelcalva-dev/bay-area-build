import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { 
  Users, FileText, TrendingUp, DollarSign, 
  ArrowUpRight, ArrowDownRight, Clock, Loader2, GitBranch
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { supabase } from "@/integrations/supabase/client";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { format } from "date-fns";
import { SalesLifecycleDashboard } from "@/components/lifecycle/dashboards";
import { HotAILeadsQueue } from "@/components/sales/HotAILeadsQueue";
import { SalesPipelineCards } from "@/components/sales/SalesPipelineCards";
import { SalesScriptLibrary } from "@/components/sales/SalesScriptLibrary";

interface DashboardStats {
  leads: { total: number; new: number; converted: number };
  quotes: { total: number; saved: number; pipelineValue: number };
  recentActivity: Array<{
    type: "lead" | "quote";
    name: string;
    action: string;
    time: string;
  }>;
}

export default function SalesDashboard() {
  const { user } = useAdminAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState<DashboardStats>({
    leads: { total: 0, new: 0, converted: 0 },
    quotes: { total: 0, saved: 0, pipelineValue: 0 },
    recentActivity: [],
  });

  useEffect(() => {
    fetchStats();
  }, []);

  async function fetchStats() {
    setIsLoading(true);
    try {
      const [leadsRes, quotesRes] = await Promise.all([
        supabase.from("sales_leads").select("lead_status, created_at"),
        supabase.from("quotes").select("status, subtotal, created_at, customer_name").order("created_at", { ascending: false }).limit(100),
      ]);

      const leads = leadsRes.data || [];
      const quotes = quotesRes.data || [];

      // Build recent activity
      const recentActivity = [
        ...leads.slice(0, 3).map((l) => ({
          type: "lead" as const,
          name: "New Lead",
          action: `Status: ${l.lead_status}`,
          time: l.created_at,
        })),
        ...quotes.slice(0, 3).map((q) => ({
          type: "quote" as const,
          name: q.customer_name || "Quote",
          action: `$${q.subtotal?.toFixed(0) || 0}`,
          time: q.created_at,
        })),
      ].sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime()).slice(0, 5);

      setStats({
        leads: {
          total: leads.length,
          new: leads.filter((l) => l.lead_status === "new").length,
          converted: leads.filter((l) => l.lead_status === "converted").length,
        },
        quotes: {
          total: quotes.length,
          saved: quotes.filter((q) => q.status === "saved").length,
          pipelineValue: quotes.reduce((sum, q) => sum + (q.subtotal || 0), 0),
        },
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

  return (
    <div className="space-y-6">
      <Tabs defaultValue="overview">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="lifecycle"><GitBranch className="w-3 h-3 mr-1" />Lifecycle Pipeline</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">

      {/* Hot AI Leads */}
      <HotAILeadsQueue />

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Total Leads</CardTitle>
            <Users className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.leads.total}</div>
            <p className="text-xs text-muted-foreground">
              <span className="text-blue-600 font-medium">{stats.leads.new} new</span> this week
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Converted</CardTitle>
            <TrendingUp className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">{stats.leads.converted}</div>
            <p className="text-xs text-muted-foreground">
              {stats.leads.total > 0 
                ? `${((stats.leads.converted / stats.leads.total) * 100).toFixed(0)}% conversion rate`
                : "No leads yet"
              }
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Active Quotes</CardTitle>
            <FileText className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.quotes.saved}</div>
            <p className="text-xs text-muted-foreground">
              Ready to convert
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">Pipeline Value</CardTitle>
            <DollarSign className="w-4 h-4 text-amber-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-amber-600">
              ${(stats.quotes.pipelineValue / 1000).toFixed(1)}k
            </div>
            <p className="text-xs text-muted-foreground">
              {stats.quotes.total} total quotes
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Quick Actions</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Button className="w-full justify-start" asChild>
              <Link to="/sales/quotes/new">
                <FileText className="w-4 h-4 mr-2" /> Create New Quote
              </Link>
            </Button>
            <Button variant="outline" className="w-full justify-start" asChild>
              <Link to="/sales/leads">
                <Users className="w-4 h-4 mr-2" /> Add Lead
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
                stats.recentActivity.map((activity, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${
                        activity.type === "lead" ? "bg-blue-100" : "bg-green-100"
                      }`}>
                        {activity.type === "lead" ? (
                          <Users className="w-3 h-3 text-blue-600" />
                        ) : (
                          <FileText className="w-3 h-3 text-green-600" />
                        )}
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
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>
          </div>
        </TabsContent>

        <TabsContent value="lifecycle">
          <SalesLifecycleDashboard />
        </TabsContent>
      </Tabs>
    </div>
  );
}