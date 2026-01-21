import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  MapPin, DollarSign, Users, Plus, ArrowRight, Loader2,
  Package, Warehouse, Settings, FileText, Truck, TrendingUp,
  Calendar, AlertCircle, Clock
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface DashboardStats {
  zones: number;
  zipCodes: number;
  sizes: number;
  vendors: number;
  extras: number;
  yards: number;
  orders: number;
  pendingOrders: number;
  activeOrders: number;
  customers: number;
  quotesToday: number;
}

interface RecentOrder {
  id: string;
  status: string;
  created_at: string;
  quotes?: {
    customer_name: string | null;
    zip_code: string;
    material_type: string;
  } | null;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const [zones, zipCodes, sizes, vendors, extras, yards, orders, customers, quotesToday, recent] = await Promise.all([
        supabase.from('pricing_zones').select('id', { count: 'exact', head: true }),
        supabase.from('zone_zip_codes').select('id', { count: 'exact', head: true }),
        supabase.from('dumpster_sizes').select('id', { count: 'exact', head: true }),
        supabase.from('vendors').select('id', { count: 'exact', head: true }),
        supabase.from('pricing_extras').select('id', { count: 'exact', head: true }),
        supabase.from('yards').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id, status', { count: 'exact' }),
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('quotes').select('id', { count: 'exact', head: true }).gte('created_at', today.toISOString()),
        supabase.from('orders').select(`
          id, status, created_at,
          quotes (customer_name, zip_code, material_type)
        `).order('created_at', { ascending: false }).limit(5),
      ]);

      const allOrders = orders.data || [];
      const pendingOrders = allOrders.filter((o: any) => o.status === 'pending').length;
      const activeOrders = allOrders.filter((o: any) => ['scheduled', 'en_route', 'delivered'].includes(o.status)).length;

      setStats({
        zones: zones.count || 0,
        zipCodes: zipCodes.count || 0,
        sizes: sizes.count || 0,
        vendors: vendors.count || 0,
        extras: extras.count || 0,
        yards: yards.count || 0,
        orders: orders.count || 0,
        pendingOrders,
        activeOrders,
        customers: customers.count || 0,
        quotesToday: quotesToday.count || 0,
      });
      setRecentOrders(recent.data || []);
      setIsLoading(false);
    }

    fetchStats();
  }, []);

  const operationalCards = [
    {
      title: 'Orders',
      description: 'Manage dumpster orders and deliveries',
      icon: Package,
      color: 'bg-blue-500',
      link: '/admin/orders',
      stats: stats ? `${stats.pendingOrders} pending, ${stats.activeOrders} active` : 'Loading...',
    },
    {
      title: 'Customers',
      description: 'View and manage customer profiles',
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/customers',
      stats: stats ? `${stats.customers} total` : 'Loading...',
    },
  ];

  const configCards = [
    {
      title: 'Yard Manager',
      description: 'Manage dispatch yard locations',
      icon: Warehouse,
      color: 'bg-orange-500',
      link: '/admin/yards',
      stats: stats ? `${stats.yards} yards` : 'Loading...',
    },
    {
      title: 'ZIP-to-Zone Mapping',
      description: 'Manage service zones and ZIP coverage',
      icon: MapPin,
      color: 'bg-cyan-500',
      link: '/admin/zones',
      stats: stats ? `${stats.zones} zones, ${stats.zipCodes} ZIPs` : 'Loading...',
    },
    {
      title: 'Pricing Tables',
      description: 'Configure base prices and overrides',
      icon: DollarSign,
      color: 'bg-green-500',
      link: '/admin/pricing',
      stats: stats ? `${stats.sizes} sizes` : 'Loading...',
    },
    {
      title: 'Vendors',
      description: 'Manage hauler partners',
      icon: Truck,
      color: 'bg-indigo-500',
      link: '/admin/vendors',
      stats: stats ? `${stats.vendors} vendors` : 'Loading...',
    },
    {
      title: 'Extras Catalog',
      description: 'Configure add-on services',
      icon: Plus,
      color: 'bg-amber-500',
      link: '/admin/extras',
      stats: stats ? `${stats.extras} extras` : 'Loading...',
    },
    {
      title: 'Business Rules',
      description: 'Office hours, rates, and settings',
      icon: Settings,
      color: 'bg-slate-500',
      link: '/admin/config',
      stats: 'View settings',
    },
  ];

  const STATUS_COLORS: Record<string, string> = {
    pending: 'bg-yellow-100 text-yellow-800',
    confirmed: 'bg-blue-100 text-blue-800',
    scheduled: 'bg-purple-100 text-purple-800',
    en_route: 'bg-orange-100 text-orange-800',
    delivered: 'bg-green-100 text-green-800',
    completed: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage operations, pricing, and configuration</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <>
          {/* Quick Stats */}
          <div className="grid grid-cols-4 gap-4 mb-8">
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-blue-500/10 flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-blue-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.quotesToday || 0}</p>
                  <p className="text-sm text-muted-foreground">Quotes Today</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-yellow-500/10 flex items-center justify-center">
                  <Clock className="w-5 h-5 text-yellow-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.pendingOrders || 0}</p>
                  <p className="text-sm text-muted-foreground">Pending Orders</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-green-500/10 flex items-center justify-center">
                  <Truck className="w-5 h-5 text-green-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.activeOrders || 0}</p>
                  <p className="text-sm text-muted-foreground">Active Deliveries</p>
                </div>
              </div>
            </div>
            <div className="bg-card rounded-xl border border-border p-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-purple-500/10 flex items-center justify-center">
                  <Package className="w-5 h-5 text-purple-500" />
                </div>
                <div>
                  <p className="text-2xl font-bold">{stats?.orders || 0}</p>
                  <p className="text-sm text-muted-foreground">Total Orders</p>
                </div>
              </div>
            </div>
          </div>

          {/* Operations Section */}
          <div className="mb-8">
            <h2 className="text-lg font-semibold text-foreground mb-4">Operations</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {operationalCards.map((card) => {
                const Icon = card.icon;
                return (
                  <Link
                    key={card.title}
                    to={card.link}
                    className="bg-card rounded-xl border border-border p-6 hover:shadow-lg transition-all group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg ${card.color} flex items-center justify-center`}>
                        <Icon className="w-6 h-6 text-white" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                          {card.title}
                        </h3>
                        <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                        <p className="text-sm font-medium text-primary mt-3">{card.stats}</p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Recent Orders + Configuration */}
          <div className="grid lg:grid-cols-3 gap-8">
            {/* Recent Orders */}
            <div className="lg:col-span-1 bg-card rounded-xl border border-border p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-foreground">Recent Orders</h2>
                <Link to="/admin/orders" className="text-sm text-primary hover:underline">
                  View all
                </Link>
              </div>
              <div className="space-y-3">
                {recentOrders.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No orders yet
                  </p>
                ) : (
                  recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center gap-3 p-3 rounded-lg bg-muted/50">
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium truncate">
                          {order.quotes?.customer_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {order.quotes?.zip_code} • {order.quotes?.material_type}
                        </p>
                      </div>
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        STATUS_COLORS[order.status] || 'bg-gray-100 text-gray-800'
                      }`}>
                        {order.status}
                      </span>
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Configuration Cards */}
            <div className="lg:col-span-2">
              <h2 className="text-lg font-semibold text-foreground mb-4">Configuration</h2>
              <div className="grid md:grid-cols-2 gap-4">
                {configCards.map((card) => {
                  const Icon = card.icon;
                  return (
                    <Link
                      key={card.title}
                      to={card.link}
                      className="bg-card rounded-xl border border-border p-4 hover:shadow-md transition-all group"
                    >
                      <div className="flex items-center gap-3">
                        <div className={`w-10 h-10 rounded-lg ${card.color} flex items-center justify-center`}>
                          <Icon className="w-5 h-5 text-white" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium text-foreground group-hover:text-primary transition-colors">
                            {card.title}
                          </h3>
                          <p className="text-xs text-muted-foreground truncate">{card.stats}</p>
                        </div>
                        <ArrowRight className="w-4 h-4 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                      </div>
                    </Link>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="mt-8 bg-card rounded-xl border border-border p-6">
            <h2 className="text-lg font-semibold text-foreground mb-4">Quick Actions</h2>
            <div className="flex flex-wrap gap-3">
              <Link
                to="/admin/zones?action=import"
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                Import ZIP Codes (CSV)
              </Link>
              <Link
                to="/admin/pricing?action=export"
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                Export Pricing (CSV)
              </Link>
              <Link
                to="/admin/yards"
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                Add New Yard
              </Link>
              <Link
                to="/admin/audit-logs"
                className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
              >
                View Audit Logs
              </Link>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
