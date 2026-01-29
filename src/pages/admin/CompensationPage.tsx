import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { DollarSign, Users, CheckCircle, Clock, XCircle, TrendingUp, AlertTriangle } from "lucide-react";
import { useCompensationStats, useCompensationEarnings, useCompensationMode, useSetCompensationMode, useApproveEarnings, usePendingEarnings } from "@/hooks/useCompensation";
import { Loader2 } from "lucide-react";

export default function CompensationPage() {
  const [selectedTab, setSelectedTab] = useState("overview");
  const { data: stats, isLoading: statsLoading } = useCompensationStats();
  const { data: mode } = useCompensationMode();
  const { data: pendingEarnings } = usePendingEarnings();
  const { data: allEarnings } = useCompensationEarnings({ limit: 50 });
  const setModeMutation = useSetCompensationMode();
  const approveMutation = useApproveEarnings();

  const isLive = mode === "LIVE";

  const handleApproveAll = () => {
    const ids = pendingEarnings?.map(e => e.id) || [];
    if (ids.length > 0) approveMutation.mutate(ids);
  };

  if (statsLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Compensation Engine</h1>
          <p className="text-muted-foreground">Manage commissions, bonuses, and payouts</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm text-muted-foreground">Mode:</span>
            <Badge variant={isLive ? "default" : "secondary"}>
              {isLive ? "LIVE" : "DRY_RUN"}
            </Badge>
            <Switch
              checked={isLive}
              onCheckedChange={(checked) => setModeMutation.mutate(checked ? "LIVE" : "DRY_RUN")}
            />
          </div>
        </div>
      </div>

      {!isLive && (
        <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
          <AlertTriangle className="w-4 h-4 text-yellow-500" />
          <span className="text-sm">DRY_RUN mode: Earnings are calculated but cannot be marked as PAID</span>
        </div>
      )}

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total Earnings</CardTitle>
            <DollarSign className="w-4 h-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.totalEarnings?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">{stats?.earningsCount || 0} entries</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Pending Approval</CardTitle>
            <Clock className="w-4 h-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">${stats?.pendingAmount?.toFixed(2) || "0.00"}</div>
            <p className="text-xs text-muted-foreground">{pendingEarnings?.length || 0} pending</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Approved</CardTitle>
            <CheckCircle className="w-4 h-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">${stats?.approvedAmount?.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Paid Out</CardTitle>
            <TrendingUp className="w-4 h-4 text-primary" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${stats?.paidAmount?.toFixed(2) || "0.00"}</div>
          </CardContent>
        </Card>
      </div>

      <Tabs value={selectedTab} onValueChange={setSelectedTab}>
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="pending">Pending ({pendingEarnings?.length || 0})</TabsTrigger>
          <TabsTrigger value="all">All Earnings</TabsTrigger>
        </TabsList>

        <TabsContent value="pending" className="space-y-4">
          {(pendingEarnings?.length || 0) > 0 && (
            <Button onClick={handleApproveAll} disabled={approveMutation.isPending}>
              Approve All Pending
            </Button>
          )}
          <div className="space-y-2">
            {pendingEarnings?.map(earning => (
              <Card key={earning.id}>
                <CardContent className="flex items-center justify-between p-4">
                  <div>
                    <p className="font-medium">{earning.role} - ${earning.payout_amount?.toFixed(2)}</p>
                    <p className="text-sm text-muted-foreground">{earning.entity_type}: {earning.entity_id?.slice(0,8)}</p>
                  </div>
                  <Badge variant="outline">PENDING</Badge>
                </CardContent>
              </Card>
            ))}
            {!pendingEarnings?.length && (
              <p className="text-center text-muted-foreground py-8">No pending earnings</p>
            )}
          </div>
        </TabsContent>

        <TabsContent value="all" className="space-y-2">
          {allEarnings?.map(earning => (
            <Card key={earning.id}>
              <CardContent className="flex items-center justify-between p-4">
                <div>
                  <p className="font-medium">{earning.role} - ${earning.payout_amount?.toFixed(2)}</p>
                  <p className="text-sm text-muted-foreground">{earning.period} | {earning.entity_type}</p>
                </div>
                <Badge variant={earning.status === "PAID" ? "default" : earning.status === "APPROVED" ? "secondary" : "outline"}>
                  {earning.status}
                </Badge>
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="overview">
          <Card>
            <CardHeader>
              <CardTitle>Compensation Plans Active</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              <div className="flex justify-between"><span>Sales</span><Badge>5% base + bonuses</Badge></div>
              <div className="flex justify-between"><span>CS</span><Badge variant="secondary">KPI Bonus</Badge></div>
              <div className="flex justify-between"><span>Dispatch</span><Badge variant="secondary">Per-run + efficiency</Badge></div>
              <div className="flex justify-between"><span>Driver</span><Badge variant="secondary">$25/run + bonuses</Badge></div>
              <div className="flex justify-between"><span>Finance</span><Badge variant="secondary">2% collections</Badge></div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
