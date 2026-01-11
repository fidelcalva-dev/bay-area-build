import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { MapPin, DollarSign, Users, Plus, ArrowRight, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  zones: number;
  zipCodes: number;
  sizes: number;
  vendors: number;
  extras: number;
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      const [zones, zipCodes, sizes, vendors, extras] = await Promise.all([
        supabase.from('pricing_zones').select('id', { count: 'exact', head: true }),
        supabase.from('zone_zip_codes').select('id', { count: 'exact', head: true }),
        supabase.from('dumpster_sizes').select('id', { count: 'exact', head: true }),
        supabase.from('vendors').select('id', { count: 'exact', head: true }),
        supabase.from('pricing_extras').select('id', { count: 'exact', head: true }),
      ]);

      setStats({
        zones: zones.count || 0,
        zipCodes: zipCodes.count || 0,
        sizes: sizes.count || 0,
        vendors: vendors.count || 0,
        extras: extras.count || 0,
      });
      setIsLoading(false);
    }

    fetchStats();
  }, []);

  const cards = [
    {
      title: 'ZIP-to-Zone Mapping',
      description: 'Manage service zones and their ZIP code coverage',
      icon: MapPin,
      color: 'bg-blue-500',
      link: '/admin/zones',
      stats: stats ? `${stats.zones} zones, ${stats.zipCodes} ZIP codes` : 'Loading...',
    },
    {
      title: 'Pricing Tables',
      description: 'Configure base prices and zone-specific pricing',
      icon: DollarSign,
      color: 'bg-green-500',
      link: '/admin/pricing',
      stats: stats ? `${stats.sizes} dumpster sizes` : 'Loading...',
    },
    {
      title: 'Vendors & Partners',
      description: 'Manage hauler partners and their service zones',
      icon: Users,
      color: 'bg-purple-500',
      link: '/admin/vendors',
      stats: stats ? `${stats.vendors} vendors` : 'Loading...',
    },
    {
      title: 'Extras Catalog',
      description: 'Configure additional services and fees',
      icon: Plus,
      color: 'bg-amber-500',
      link: '/admin/extras',
      stats: stats ? `${stats.extras} extras` : 'Loading...',
    },
  ];

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Admin Dashboard</h1>
        <p className="text-muted-foreground mt-1">Manage your pricing engine and service configuration</p>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="w-8 h-8 animate-spin text-primary" />
        </div>
      ) : (
        <div className="grid md:grid-cols-2 gap-6">
          {cards.map((card) => {
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
                    <h2 className="text-lg font-semibold text-foreground group-hover:text-primary transition-colors">
                      {card.title}
                    </h2>
                    <p className="text-sm text-muted-foreground mt-1">{card.description}</p>
                    <p className="text-sm font-medium text-primary mt-3">{card.stats}</p>
                  </div>
                  <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary group-hover:translate-x-1 transition-all" />
                </div>
              </Link>
            );
          })}
        </div>
      )}

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
            to="/admin/vendors?action=new"
            className="px-4 py-2 bg-primary/10 text-primary rounded-lg text-sm font-medium hover:bg-primary/20 transition-colors"
          >
            Add New Vendor
          </Link>
        </div>
      </div>
    </div>
  );
}
