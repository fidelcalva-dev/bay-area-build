import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, AlertTriangle, TrendingUp, TrendingDown, 
  RefreshCw, ChevronRight, Phone, Building2
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { HealthBadge, HealthIndicator } from '@/components/health';
import { 
  getHealthDistribution,
  getRiskyCustomers,
  getValuableCustomers,
  getRecentHealthChanges,
  type HealthStatus,
  type CustomerHealthScore,
  type CustomerHealthEvent
} from '@/lib/customerHealthService';
import { cn } from '@/lib/utils';

interface DistributionData {
  status: HealthStatus;
  count: number;
}

export default function CustomerHealthDashboard() {
  const [distribution, setDistribution] = useState<DistributionData[]>([]);
  const [riskyCustomers, setRiskyCustomers] = useState<(CustomerHealthScore & { customer?: { company_name: string | null; billing_phone: string | null } })[]>([]);
  const [valuableCustomers, setValuableCustomers] = useState<(CustomerHealthScore & { customer?: { company_name: string | null } })[]>([]);
  const [recentChanges, setRecentChanges] = useState<CustomerHealthEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    const [dist, risky, valuable, changes] = await Promise.all([
      getHealthDistribution(),
      getRiskyCustomers(10),
      getValuableCustomers(10),
      getRecentHealthChanges(30, 50),
    ]);
    setDistribution(dist);
    setRiskyCustomers(risky);
    setValuableCustomers(valuable);
    setRecentChanges(changes);
    setIsLoading(false);
  }

  const totalCustomers = distribution.reduce((sum, d) => sum + d.count, 0);
  const greenCount = distribution.find(d => d.status === 'GREEN')?.count || 0;
  const amberCount = distribution.find(d => d.status === 'AMBER')?.count || 0;
  const redCount = distribution.find(d => d.status === 'RED')?.count || 0;

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Users className="w-6 h-6" />
            Customer Health Dashboard
          </h1>
          <p className="text-muted-foreground mt-1">
            Monitor customer health scores and identify risks
          </p>
        </div>
        <Button onClick={loadData} disabled={isLoading}>
          <RefreshCw className={cn('w-4 h-4 mr-2', isLoading && 'animate-spin')} />
          Refresh
        </Button>
      </div>

      {/* Distribution Cards */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Total Customers</CardDescription>
            <CardTitle className="text-3xl">{totalCustomers}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">With health scores</p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-green-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <HealthIndicator status="GREEN" size="sm" />
              Healthy
            </CardDescription>
            <CardTitle className="text-3xl text-green-600">{greenCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalCustomers > 0 ? Math.round((greenCount / totalCustomers) * 100) : 0}% of customers
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-amber-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <HealthIndicator status="AMBER" size="sm" />
              Attention
            </CardDescription>
            <CardTitle className="text-3xl text-amber-600">{amberCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalCustomers > 0 ? Math.round((amberCount / totalCustomers) * 100) : 0}% of customers
            </p>
          </CardContent>
        </Card>
        
        <Card className="border-l-4 border-l-red-500">
          <CardHeader className="pb-2">
            <CardDescription className="flex items-center gap-2">
              <HealthIndicator status="RED" size="sm" />
              At Risk
            </CardDescription>
            <CardTitle className="text-3xl text-red-600">{redCount}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              {totalCustomers > 0 ? Math.round((redCount / totalCustomers) * 100) : 0}% of customers
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content */}
      <div className="grid gap-6 lg:grid-cols-2">
        {/* Risky Customers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-red-500" />
                  At-Risk Customers
                </CardTitle>
                <CardDescription>Lowest health scores requiring attention</CardDescription>
              </div>
              <Badge variant="destructive">{riskyCustomers.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {riskyCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No at-risk customers
                </p>
              ) : (
                <div className="space-y-2">
                  {riskyCustomers.map((customer) => (
                    <Link
                      key={customer.id}
                      to={`/admin/customers/${customer.customer_id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-red-100 flex items-center justify-center text-red-600 font-bold">
                          {customer.score}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {customer.customer?.company_name || 'Unknown Customer'}
                          </p>
                          {customer.customer?.billing_phone && (
                            <p className="text-xs text-muted-foreground flex items-center gap-1">
                              <Phone className="w-3 h-3" />
                              {customer.customer.billing_phone}
                            </p>
                          )}
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        {/* Valuable Customers */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-green-500" />
                  Top Customers
                </CardTitle>
                <CardDescription>Highest health scores - VIP treatment eligible</CardDescription>
              </div>
              <Badge className="bg-green-100 text-green-700">{valuableCustomers.length}</Badge>
            </div>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-[300px]">
              {valuableCustomers.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">
                  No top customers yet
                </p>
              ) : (
                <div className="space-y-2">
                  {valuableCustomers.map((customer) => (
                    <Link
                      key={customer.id}
                      to={`/admin/customers/${customer.customer_id}`}
                      className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center text-green-600 font-bold">
                          {customer.score}
                        </div>
                        <div>
                          <p className="font-medium flex items-center gap-2">
                            <Building2 className="w-4 h-4 text-muted-foreground" />
                            {customer.customer?.company_name || 'Unknown Customer'}
                          </p>
                          <HealthBadge status={customer.status} size="sm" />
                        </div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-muted-foreground" />
                    </Link>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>

      {/* Recent Changes */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingDown className="w-5 h-5" />
            Recent Score Changes
          </CardTitle>
          <CardDescription>Health score events from the last 30 days</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="all">
            <TabsList>
              <TabsTrigger value="all">All</TabsTrigger>
              <TabsTrigger value="negative">Negative</TabsTrigger>
              <TabsTrigger value="positive">Positive</TabsTrigger>
            </TabsList>
            
            <TabsContent value="all" className="mt-4">
              <EventsList events={recentChanges} />
            </TabsContent>
            
            <TabsContent value="negative" className="mt-4">
              <EventsList events={recentChanges.filter(e => e.delta_score < 0)} />
            </TabsContent>
            
            <TabsContent value="positive" className="mt-4">
              <EventsList events={recentChanges.filter(e => e.delta_score > 0)} />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </div>
  );
}

function EventsList({ events }: { events: CustomerHealthEvent[] }) {
  if (events.length === 0) {
    return (
      <p className="text-sm text-muted-foreground text-center py-8">
        No events to show
      </p>
    );
  }

  return (
    <ScrollArea className="h-[250px]">
      <div className="space-y-2">
        {events.map((event) => (
          <div 
            key={event.id}
            className="flex items-center justify-between p-3 rounded-lg border"
          >
            <div className="flex items-center gap-3">
              <div className={cn(
                'w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold',
                event.delta_score > 0 ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'
              )}>
                {event.delta_score > 0 ? '+' : ''}{event.delta_score}
              </div>
              <div>
                <p className="font-medium text-sm">
                  {event.event_type.replace(/_/g, ' ')}
                </p>
                <p className="text-xs text-muted-foreground">
                  {new Date(event.created_at).toLocaleString()}
                </p>
              </div>
            </div>
            {event.score_before !== null && event.score_after !== null && (
              <span className="text-sm text-muted-foreground">
                {event.score_before} → {event.score_after}
              </span>
            )}
          </div>
        ))}
      </div>
    </ScrollArea>
  );
}
