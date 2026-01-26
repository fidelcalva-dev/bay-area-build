// Heavy Risk Dashboard Page
// Phase 7: Admin visibility for heavy material orders

import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  AlertTriangle,
  Weight,
  Camera,
  AlertCircle,
  CheckCircle,
  Leaf,
  RefreshCw,
  Eye,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Link } from 'react-router-dom';

interface HeavyRiskOrder {
  order_id: string;
  customer_name: string;
  customer_phone: string;
  delivery_address: string;
  status: string;
  is_heavy_material: boolean;
  heavy_material_code: string;
  requested_green_halo: boolean;
  estimated_fill_pct: number;
  estimated_weight_tons_min: number;
  estimated_weight_tons_max: number;
  weight_risk_level: 'LOW' | 'MED' | 'HIGH';
  requires_fill_line: boolean;
  requires_pre_pickup_photos: boolean;
  contamination_detected: boolean;
  reclassified_to_debris: boolean;
  actual_weight_tons: number | null;
  included_tons_for_size: number | null;
  extra_tons_charged: number | null;
  created_at: string;
}

export default function HeavyRiskDashboard() {
  const [orders, setOrders] = useState<HeavyRiskOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('all');

  useEffect(() => {
    fetchHeavyOrders();
  }, []);

  async function fetchHeavyOrders() {
    setIsLoading(true);
    try {
      // Use type bypass for the view
      const { data, error } = await supabase
        .from('heavy_risk_orders_vw' as 'orders')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);

      if (error) throw error;
      setOrders((data as unknown as HeavyRiskOrder[]) || []);
    } catch (err) {
      console.error('Error fetching heavy orders:', err);
    } finally {
      setIsLoading(false);
    }
  }

  // Filter orders by tab
  const filteredOrders = orders.filter((order) => {
    switch (activeTab) {
      case 'high-risk':
        return order.weight_risk_level === 'HIGH';
      case 'contaminated':
        return order.contamination_detected;
      case 'pending-photos':
        return order.requires_pre_pickup_photos && !order.contamination_detected;
      default:
        return true;
    }
  });

  // Stats
  const stats = {
    total: orders.length,
    highRisk: orders.filter((o) => o.weight_risk_level === 'HIGH').length,
    medRisk: orders.filter((o) => o.weight_risk_level === 'MED').length,
    contaminated: orders.filter((o) => o.contamination_detected).length,
    greenHalo: orders.filter((o) => o.requested_green_halo && !o.contamination_detected).length,
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Heavy Risk Monitor</h1>
          <p className="text-muted-foreground">
            Track overweight risks, contamination, and photo compliance for heavy loads
          </p>
        </div>
        <Button variant="outline" onClick={fetchHeavyOrders} disabled={isLoading}>
          <RefreshCw className={cn("w-4 h-4 mr-2", isLoading && "animate-spin")} />
          Refresh
        </Button>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <StatCard
          label="Total Heavy"
          value={stats.total}
          icon={<Weight className="w-5 h-5" />}
          color="text-foreground"
        />
        <StatCard
          label="High Risk"
          value={stats.highRisk}
          icon={<AlertTriangle className="w-5 h-5" />}
          color="text-destructive"
          bgColor="bg-destructive/10"
        />
        <StatCard
          label="Medium Risk"
          value={stats.medRisk}
          icon={<AlertCircle className="w-5 h-5" />}
          color="text-amber-600"
          bgColor="bg-amber-50 dark:bg-amber-950/30"
        />
        <StatCard
          label="Contaminated"
          value={stats.contaminated}
          icon={<AlertCircle className="w-5 h-5" />}
          color="text-destructive"
          bgColor="bg-destructive/10"
        />
        <StatCard
          label="Green Halo"
          value={stats.greenHalo}
          icon={<Leaf className="w-5 h-5" />}
          color="text-success"
          bgColor="bg-success/10"
        />
      </div>

      {/* Tabs and Table */}
      <Card>
        <CardHeader>
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="all">All Heavy ({stats.total})</TabsTrigger>
              <TabsTrigger value="high-risk">
                High Risk ({stats.highRisk})
              </TabsTrigger>
              <TabsTrigger value="contaminated">
                Contaminated ({stats.contaminated})
              </TabsTrigger>
              <TabsTrigger value="pending-photos">Pending Photos</TabsTrigger>
            </TabsList>
          </Tabs>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => (
                <div key={i} className="h-12 bg-muted animate-pulse rounded" />
              ))}
            </div>
          ) : filteredOrders.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No orders found for this filter
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer</TableHead>
                  <TableHead>Material</TableHead>
                  <TableHead>Weight Est.</TableHead>
                  <TableHead>Risk</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Flags</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.order_id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{order.customer_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {order.customer_phone}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-xs">
                        {order.heavy_material_code?.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm">
                        {order.estimated_weight_tons_min?.toFixed(1)}–
                        {order.estimated_weight_tons_max?.toFixed(1)}T
                      </span>
                      {order.actual_weight_tons && (
                        <p className="text-xs text-muted-foreground">
                          Actual: {order.actual_weight_tons.toFixed(2)}T
                        </p>
                      )}
                    </TableCell>
                    <TableCell>
                      <RiskBadge level={order.weight_risk_level} />
                    </TableCell>
                    <TableCell>
                      <Badge variant="secondary" className="text-xs">
                        {order.status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex gap-1">
                        {order.requires_fill_line && (
                          <Badge variant="outline" className="text-xs bg-amber-50">
                            Fill Line
                          </Badge>
                        )}
                        {order.requested_green_halo && !order.contamination_detected && (
                          <Badge variant="outline" className="text-xs bg-success/10 text-success">
                            <Leaf className="w-3 h-3 mr-0.5" />
                            Halo
                          </Badge>
                        )}
                        {order.contamination_detected && (
                          <Badge variant="destructive" className="text-xs">
                            Contaminated
                          </Badge>
                        )}
                        {order.reclassified_to_debris && (
                          <Badge variant="outline" className="text-xs bg-destructive/10 text-destructive">
                            Reclassified
                          </Badge>
                        )}
                        {order.requires_pre_pickup_photos && (
                          <Camera className="w-4 h-4 text-muted-foreground" />
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <Button variant="ghost" size="sm" asChild>
                        <Link to={`/admin/orders?id=${order.order_id}`}>
                          <Eye className="w-4 h-4" />
                        </Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function StatCard({
  label,
  value,
  icon,
  color,
  bgColor,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
  color: string;
  bgColor?: string;
}) {
  return (
    <Card className={bgColor}>
      <CardContent className="p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-muted-foreground">{label}</p>
            <p className={cn("text-2xl font-bold", color)}>{value}</p>
          </div>
          <div className={color}>{icon}</div>
        </div>
      </CardContent>
    </Card>
  );
}

function RiskBadge({ level }: { level: 'LOW' | 'MED' | 'HIGH' | null }) {
  if (!level) return null;

  return (
    <Badge
      variant="outline"
      className={cn(
        "text-xs",
        level === 'HIGH' && "bg-destructive/20 border-destructive text-destructive",
        level === 'MED' && "bg-amber-100 border-amber-500 text-amber-700",
        level === 'LOW' && "bg-success/20 border-success text-success"
      )}
    >
      {level === 'HIGH' && <AlertTriangle className="w-3 h-3 mr-1" />}
      {level === 'MED' && <AlertCircle className="w-3 h-3 mr-1" />}
      {level === 'LOW' && <CheckCircle className="w-3 h-3 mr-1" />}
      {level}
    </Badge>
  );
}
