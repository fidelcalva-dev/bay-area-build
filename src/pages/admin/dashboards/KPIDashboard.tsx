import { useState, useEffect } from 'react';
import { subDays } from 'date-fns';
import { Target, Settings2, Save, BarChart3, TrendingUp, DollarSign, Users } from 'lucide-react';
import { 
  DashboardFilters, 
  type DashboardFilterValues,
  KPICardGrid,
  KPISummaryBar,
  KPITargetEditor,
} from '@/components/dashboard';
import { useKPIData, type KPIMetric } from '@/hooks/useKPIData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';

export default function KPIDashboard() {
  const [filters, setFilters] = useState<DashboardFilterValues>({
    startDate: subDays(new Date(), 30),
    endDate: new Date(),
  });
  const [activeTab, setActiveTab] = useState('all');
  const [editingKPI, setEditingKPI] = useState<KPIMetric | null>(null);

  const { loading, kpiData, error, saveSnapshot, updateTarget } = useKPIData(filters);

  // Auto-save snapshot on dashboard load (once per day)
  useEffect(() => {
    const lastSnapshot = localStorage.getItem('lastKPISnapshot');
    const today = new Date().toDateString();
    
    if (lastSnapshot !== today && !loading && kpiData.sales.length > 0) {
      saveSnapshot();
      localStorage.setItem('lastKPISnapshot', today);
    }
  }, [loading, kpiData, saveSnapshot]);

  const allKPIs = [...kpiData.sales, ...kpiData.ops, ...kpiData.finance, ...kpiData.customer];

  const handleSaveSnapshot = async () => {
    try {
      await saveSnapshot();
      toast.success('Daily snapshot saved');
    } catch (err) {
      toast.error('Failed to save snapshot');
    }
  };

  const categoryConfig = [
    { key: 'sales', label: 'Sales', icon: TrendingUp, kpis: kpiData.sales },
    { key: 'ops', label: 'Operations', icon: BarChart3, kpis: kpiData.ops },
    { key: 'finance', label: 'Finance', icon: DollarSign, kpis: kpiData.finance },
    { key: 'customer', label: 'Customers', icon: Users, kpis: kpiData.customer },
  ];

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <Target className="w-6 h-6" />
            KPI Optimization
          </h1>
          <p className="text-muted-foreground">Track and optimize key performance indicators</p>
        </div>
        <Button onClick={handleSaveSnapshot} variant="outline" size="sm">
          <Save className="w-4 h-4 mr-2" />
          Save Snapshot
        </Button>
      </div>

      <DashboardFilters
        filters={filters}
        onFiltersChange={setFilters}
        showCustomerTypeFilter
      />

      {error && (
        <Card className="border-destructive">
          <CardContent className="p-4 text-destructive">
            Error loading KPI data: {error}
          </CardContent>
        </Card>
      )}

      {/* Overall Health Summary */}
      <KPISummaryBar kpis={allKPIs} loading={loading} />

      {/* Category Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="all">All KPIs</TabsTrigger>
          {categoryConfig.map(cat => (
            <TabsTrigger key={cat.key} value={cat.key} className="flex items-center gap-1">
              <cat.icon className="w-4 h-4" />
              {cat.label}
            </TabsTrigger>
          ))}
        </TabsList>

        <TabsContent value="all" className="space-y-6 mt-6">
          {categoryConfig.map(cat => (
            <Card key={cat.key}>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <cat.icon className="w-5 h-5" />
                  {cat.label} KPIs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <KPICardGrid 
                  kpis={cat.kpis} 
                  loading={loading}
                  showSparkline
                />
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        {categoryConfig.map(cat => (
          <TabsContent key={cat.key} value={cat.key} className="mt-6">
            <Card>
              <CardHeader className="pb-3 flex flex-row items-center justify-between">
                <CardTitle className="text-lg flex items-center gap-2">
                  <cat.icon className="w-5 h-5" />
                  {cat.label} KPIs
                </CardTitle>
                <Button 
                  variant="ghost" 
                  size="sm"
                  onClick={() => cat.kpis[0] && setEditingKPI(cat.kpis[0])}
                >
                  <Settings2 className="w-4 h-4 mr-2" />
                  Edit Targets
                </Button>
              </CardHeader>
              <CardContent className="space-y-6">
                <KPICardGrid 
                  kpis={cat.kpis} 
                  loading={loading}
                  showSparkline
                />

                {/* Detailed table for each category */}
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b">
                        <th className="text-left py-2 px-3 font-medium">KPI</th>
                        <th className="text-right py-2 px-3 font-medium">Actual</th>
                        <th className="text-right py-2 px-3 font-medium">Target</th>
                        <th className="text-right py-2 px-3 font-medium">Gap</th>
                        <th className="text-right py-2 px-3 font-medium">7d Trend</th>
                        <th className="text-right py-2 px-3 font-medium">30d Trend</th>
                        <th className="text-center py-2 px-3 font-medium">Status</th>
                        <th className="text-center py-2 px-3 font-medium"></th>
                      </tr>
                    </thead>
                    <tbody>
                      {cat.kpis.map(kpi => {
                        const gap = kpi.higherIsBetter 
                          ? kpi.actual - kpi.target 
                          : kpi.target - kpi.actual;
                        const gapPercent = kpi.target > 0 ? (gap / kpi.target) * 100 : 0;

                        return (
                          <tr key={kpi.key} className="border-b hover:bg-muted/50">
                            <td className="py-2 px-3 font-medium">{kpi.name}</td>
                            <td className="py-2 px-3 text-right">
                              {kpi.unit === '$' && '$'}{kpi.actual}{kpi.unit === '%' && '%'}
                            </td>
                            <td className="py-2 px-3 text-right text-muted-foreground">
                              {kpi.unit === '$' && '$'}{kpi.target}{kpi.unit === '%' && '%'}
                            </td>
                            <td className={`py-2 px-3 text-right ${gap >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                              {gap >= 0 ? '+' : ''}{gapPercent.toFixed(1)}%
                            </td>
                            <td className={`py-2 px-3 text-right ${
                              kpi.trend7d === null ? 'text-muted-foreground' :
                              (kpi.higherIsBetter ? kpi.trend7d >= 0 : kpi.trend7d <= 0) ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {kpi.trend7d !== null ? `${kpi.trend7d > 0 ? '+' : ''}${kpi.trend7d}%` : '—'}
                            </td>
                            <td className={`py-2 px-3 text-right ${
                              kpi.trend30d === null ? 'text-muted-foreground' :
                              (kpi.higherIsBetter ? kpi.trend30d >= 0 : kpi.trend30d <= 0) ? 'text-emerald-600' : 'text-red-600'
                            }`}>
                              {kpi.trend30d !== null ? `${kpi.trend30d > 0 ? '+' : ''}${kpi.trend30d}%` : '—'}
                            </td>
                            <td className="py-2 px-3 text-center">
                              <span className={`inline-block w-3 h-3 rounded-full ${
                                kpi.status === 'green' ? 'bg-emerald-500' :
                                kpi.status === 'yellow' ? 'bg-amber-500' : 'bg-red-500'
                              }`} />
                            </td>
                            <td className="py-2 px-3 text-center">
                              <Button 
                                variant="ghost" 
                                size="sm"
                                onClick={() => setEditingKPI(kpi)}
                              >
                                <Settings2 className="w-4 h-4" />
                              </Button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>

      {/* Target Editor Dialog */}
      <KPITargetEditor
        kpi={editingKPI}
        open={!!editingKPI}
        onOpenChange={(open) => !open && setEditingKPI(null)}
        onSave={updateTarget}
      />
    </div>
  );
}
