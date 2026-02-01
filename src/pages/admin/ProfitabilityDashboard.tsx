import { useState, useEffect } from 'react';
import { TrendingDown, AlertTriangle, Truck, DollarSign, RefreshCw, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  getLowMarginEstimates,
  getMarginSummaryByMarket,
  getModelDistribution,
  getProfitGuardrailEvents,
  getMarginDisplay,
  getCostModelDisplay,
} from '@/services/serviceCostService';
import type { ServiceCostEstimate, ProfitGuardrailEvent, CostModel } from '@/types/serviceCost';
import { PieChart, Pie, Cell, ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip } from 'recharts';

export default function ProfitabilityDashboard() {
  const [isLoading, setIsLoading] = useState(true);
  const [lowMarginJobs, setLowMarginJobs] = useState<ServiceCostEstimate[]>([]);
  const [marketSummary, setMarketSummary] = useState<{ market_code: string; avg_margin_pct: number; count: number }[]>([]);
  const [modelDist, setModelDist] = useState<{ cost_model: CostModel; count: number }[]>([]);
  const [guardrailEvents, setGuardrailEvents] = useState<ProfitGuardrailEvent[]>([]);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [lowMargin, markets, models, events] = await Promise.all([
        getLowMarginEstimates(30, 25),
        getMarginSummaryByMarket(),
        getModelDistribution(),
        getProfitGuardrailEvents(undefined, undefined, true),
      ]);
      setLowMarginJobs(lowMargin);
      setMarketSummary(markets);
      setModelDist(models);
      setGuardrailEvents(events);
    } catch (err) {
      console.error('Failed to load profitability data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  const COLORS = ['#3b82f6', '#8b5cf6'];

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profitability Dashboard</h1>
          <p className="text-muted-foreground">Internal cost analysis and margin monitoring</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Low Margin Jobs</p>
                <p className="text-2xl font-bold text-red-600">{lowMarginJobs.length}</p>
              </div>
              <TrendingDown className="w-8 h-8 text-red-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Open Guardrails</p>
                <p className="text-2xl font-bold text-amber-600">{guardrailEvents.length}</p>
              </div>
              <AlertTriangle className="w-8 h-8 text-amber-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">In-House Runs</p>
                <p className="text-2xl font-bold text-blue-600">
                  {modelDist.find(m => m.cost_model === 'IN_HOUSE')?.count || 0}
                </p>
              </div>
              <Truck className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Owner-Op Runs</p>
                <p className="text-2xl font-bold text-purple-600">
                  {modelDist.find(m => m.cost_model === 'OWNER_OPERATOR')?.count || 0}
                </p>
              </div>
              <DollarSign className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="low-margin" className="space-y-4">
        <TabsList>
          <TabsTrigger value="low-margin">Low Margin Jobs</TabsTrigger>
          <TabsTrigger value="by-market">By Market</TabsTrigger>
          <TabsTrigger value="model-dist">Model Distribution</TabsTrigger>
          <TabsTrigger value="guardrails">Guardrail Events</TabsTrigger>
        </TabsList>

        {/* Low Margin Jobs */}
        <TabsContent value="low-margin">
          <Card>
            <CardHeader>
              <CardTitle>Lowest Margin Jobs</CardTitle>
              <CardDescription>Jobs with margin below 30%</CardDescription>
            </CardHeader>
            <CardContent>
              {lowMarginJobs.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No low margin jobs found</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Entity</TableHead>
                      <TableHead>Service</TableHead>
                      <TableHead>Market</TableHead>
                      <TableHead>Model</TableHead>
                      <TableHead>Price</TableHead>
                      <TableHead>Cost</TableHead>
                      <TableHead>Margin</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {lowMarginJobs.map((job) => {
                      const margin = getMarginDisplay(job.estimated_margin_pct);
                      const model = getCostModelDisplay(job.cost_model_used);
                      return (
                        <TableRow key={job.id}>
                          <TableCell>
                            <Badge variant="outline">{job.entity_type}</Badge>
                            <span className="text-xs text-muted-foreground ml-1">
                              {job.entity_id.slice(0, 8)}...
                            </span>
                          </TableCell>
                          <TableCell>{job.service_type}</TableCell>
                          <TableCell>{job.market_code}</TableCell>
                          <TableCell className={model.color}>
                            {model.icon} {model.label}
                          </TableCell>
                          <TableCell>${job.customer_price}</TableCell>
                          <TableCell>${job.estimated_total_cost}</TableCell>
                          <TableCell>
                            <Badge className={`${margin.bgColor} ${margin.color}`}>
                              {margin.text}
                            </Badge>
                          </TableCell>
                        </TableRow>
                      );
                    })}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* By Market */}
        <TabsContent value="by-market">
          <Card>
            <CardHeader>
              <CardTitle>Average Margin by Market</CardTitle>
            </CardHeader>
            <CardContent>
              {marketSummary.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No market data available</p>
              ) : (
                <div className="h-64">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={marketSummary}>
                      <XAxis dataKey="market_code" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip 
                        formatter={(value: number) => [`${value.toFixed(1)}%`, 'Avg Margin']}
                      />
                      <Bar 
                        dataKey="avg_margin_pct" 
                        fill="#3b82f6"
                        radius={[4, 4, 0, 0]}
                      />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Model Distribution */}
        <TabsContent value="model-dist">
          <Card>
            <CardHeader>
              <CardTitle>Cost Model Distribution</CardTitle>
              <CardDescription>In-House vs Owner-Operator runs</CardDescription>
            </CardHeader>
            <CardContent>
              {modelDist.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No model data available</p>
              ) : (
                <div className="h-64 flex items-center justify-center">
                  <ResponsiveContainer width="50%" height="100%">
                    <PieChart>
                      <Pie
                        data={modelDist}
                        dataKey="count"
                        nameKey="cost_model"
                        cx="50%"
                        cy="50%"
                        outerRadius={80}
                        label={({ cost_model, count }) => `${cost_model === 'IN_HOUSE' ? 'In-House' : 'Owner-Op'}: ${count}`}
                      >
                        {modelDist.map((entry, index) => (
                          <Cell key={entry.cost_model} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="space-y-2">
                    {modelDist.map((m, i) => (
                      <div key={m.cost_model} className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full" 
                          style={{ backgroundColor: COLORS[i % COLORS.length] }}
                        />
                        <span>{m.cost_model === 'IN_HOUSE' ? 'In-House' : 'Owner-Operator'}</span>
                        <span className="font-bold">{m.count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Guardrail Events */}
        <TabsContent value="guardrails">
          <Card>
            <CardHeader>
              <CardTitle>Open Guardrail Events</CardTitle>
              <CardDescription>Margin violations requiring attention</CardDescription>
            </CardHeader>
            <CardContent>
              {guardrailEvents.length === 0 ? (
                <p className="text-center text-muted-foreground py-8">No open guardrail events</p>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Severity</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Reason</TableHead>
                      <TableHead>Recommendation</TableHead>
                      <TableHead>Created</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {guardrailEvents.map((event) => (
                      <TableRow key={event.id}>
                        <TableCell>
                          <Badge 
                            variant={event.severity === 'CRITICAL' ? 'destructive' : 'secondary'}
                          >
                            {event.severity}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-xs">{event.entity_type} {event.entity_id.slice(0, 8)}...</span>
                        </TableCell>
                        <TableCell className="max-w-xs truncate">{event.reason}</TableCell>
                        <TableCell className="max-w-xs truncate text-xs text-muted-foreground">
                          {event.recommended_action}
                        </TableCell>
                        <TableCell className="text-xs text-muted-foreground">
                          {new Date(event.created_at).toLocaleDateString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
