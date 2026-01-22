import { useState } from 'react';
import { Bell, Lightbulb, RefreshCw, Play, Settings } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { AlertsPanel } from '@/components/alerts/AlertsPanel';
import { RecommendationsList } from '@/components/alerts/RecommendationCard';
import { useAlerts, useRecommendations } from '@/hooks/useAlerts';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';

export default function AlertsPage() {
  const [running, setRunning] = useState(false);
  const { refetch: refetchAlerts, unreadCount, criticalCount } = useAlerts({ resolved: false });
  const { 
    recommendations, 
    loading: recLoading, 
    refetch: refetchRecs,
    acceptRecommendation,
    dismissRecommendation,
  } = useRecommendations();

  const runAutomations = async () => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke('run-automations');
      
      if (error) throw error;
      
      toast.success(
        `Automations complete: ${data.alerts_created} alerts, ${data.recommendations_created} recommendations`
      );
      
      refetchAlerts();
      refetchRecs();
    } catch (err) {
      toast.error('Failed to run automations');
      console.error(err);
    } finally {
      setRunning(false);
    }
  };

  const handleRecommendationAction = (rec: any) => {
    // Handle specific recommendation actions
    switch (rec.rec_type) {
      case 'prepay_upsell':
        toast.info(`Opening quote ${rec.entity_id} to add prepay...`);
        window.open(`/admin/orders?quote=${rec.entity_id}`, '_blank');
        break;
      case 'contractor_program':
        toast.info(`Opening customer ${rec.entity_id} to upgrade...`);
        window.open(`/admin/customers?id=${rec.entity_id}`, '_blank');
        break;
      default:
        toast.info('Action initiated');
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Bell className="w-6 h-6" />
            Alerts & Automations
          </h1>
          <p className="text-muted-foreground">
            Proactive alerts and AI-powered recommendations
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Button variant="outline" onClick={() => { refetchAlerts(); refetchRecs(); }}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={runAutomations} disabled={running}>
            <Play className={`w-4 h-4 mr-2 ${running ? 'animate-spin' : ''}`} />
            {running ? 'Running...' : 'Run Automations'}
          </Button>
        </div>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className={criticalCount > 0 ? 'border-red-300 bg-red-50' : ''}>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{criticalCount}</div>
            <div className="text-sm text-muted-foreground">Critical Alerts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{unreadCount}</div>
            <div className="text-sm text-muted-foreground">Unread Alerts</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">{recommendations.length}</div>
            <div className="text-sm text-muted-foreground">Active Recommendations</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-2xl font-bold">5</div>
            <div className="text-sm text-muted-foreground">Automation Rules</div>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <Tabs defaultValue="alerts">
        <TabsList>
          <TabsTrigger value="alerts" className="flex items-center gap-2">
            <Bell className="w-4 h-4" />
            Alerts
            {unreadCount > 0 && (
              <span className="bg-primary text-primary-foreground text-xs px-2 py-0.5 rounded-full">
                {unreadCount}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="recommendations" className="flex items-center gap-2">
            <Lightbulb className="w-4 h-4" />
            Recommendations
            {recommendations.length > 0 && (
              <span className="bg-amber-500 text-white text-xs px-2 py-0.5 rounded-full">
                {recommendations.length}
              </span>
            )}
          </TabsTrigger>
          <TabsTrigger value="settings" className="flex items-center gap-2">
            <Settings className="w-4 h-4" />
            Settings
          </TabsTrigger>
        </TabsList>

        <TabsContent value="alerts" className="mt-6">
          <AlertsPanel maxHeight={600} />
        </TabsContent>

        <TabsContent value="recommendations" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="w-5 h-5" />
                Smart Recommendations
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RecommendationsList
                recommendations={recommendations}
                onAccept={acceptRecommendation}
                onDismiss={dismissRecommendation}
                onAction={handleRecommendationAction}
                loading={recLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="settings" className="mt-6">
          <Card>
            <CardHeader>
              <CardTitle>Automation Rules</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {[
                  { name: 'Low Inventory Alert', trigger: 'inventory.available < threshold', active: true },
                  { name: 'Schedule Overload Alert', trigger: 'schedule.load > 90%', active: true },
                  { name: 'Overdue Invoice Alert', trigger: 'invoice.due_date < today', active: true },
                  { name: 'Prepay Recommendation', trigger: 'quote.material = heavy AND no prepay', active: true },
                  { name: 'Contractor Program', trigger: 'customer.orders >= 3', active: true },
                ].map((rule, i) => (
                  <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                    <div>
                      <p className="font-medium">{rule.name}</p>
                      <p className="text-sm text-muted-foreground font-mono">{rule.trigger}</p>
                    </div>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      rule.active ? 'bg-emerald-100 text-emerald-700' : 'bg-gray-100 text-gray-600'
                    }`}>
                      {rule.active ? 'Active' : 'Disabled'}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
