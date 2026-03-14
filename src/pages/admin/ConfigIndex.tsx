import { useNavigate } from 'react-router-dom';
import { 
  Warehouse, MapPin, DollarSign, Layers, AlertTriangle, Plus, 
  ChevronRight, Settings, Banknote, Scale, Zap, Users, Map
} from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

const configModules = [
  {
    title: 'Yards',
    description: 'Manage operational yards and locations',
    icon: Warehouse,
    path: '/admin/yards',
    color: 'text-blue-600',
    bgColor: 'bg-blue-100',
  },
  {
    title: 'ZIP-to-Zone',
    description: 'Map ZIP codes to pricing zones',
    icon: MapPin,
    path: '/admin/zones',
    color: 'text-green-600',
    bgColor: 'bg-green-100',
  },
  {
    title: 'Zone Surcharges',
    description: 'Distance-based pricing zones per yard',
    icon: Map,
    path: '/admin/pricing/zone-surcharges',
    color: 'text-cyan-600',
    bgColor: 'bg-cyan-100',
  },
  {
    title: 'City Rates',
    description: 'Configure per-city overage and prepay rates',
    icon: Banknote,
    path: '/admin/city-rates',
    color: 'text-yellow-600',
    bgColor: 'bg-yellow-100',
  },
  {
    title: 'Toll Surcharges',
    description: 'Manage bridge and route surcharges',
    icon: DollarSign,
    path: '/admin/toll-surcharges',
    color: 'text-orange-600',
    bgColor: 'bg-orange-100',
  },
  {
    title: 'Heavy Pricing',
    description: 'Material increments and size factors',
    icon: Scale,
    path: '/admin/heavy-pricing',
    color: 'text-red-600',
    bgColor: 'bg-red-100',
  },
  {
    title: 'Mixed Rules',
    description: 'Overage rates and included tonnage',
    icon: Layers,
    path: '/admin/mixed-rules',
    color: 'text-purple-600',
    bgColor: 'bg-purple-100',
  },
  {
    title: 'Rush Delivery',
    description: 'Same-day, next-day, and priority fees',
    icon: Zap,
    path: '/admin/pricing/rush-delivery',
    color: 'text-pink-600',
    bgColor: 'bg-pink-100',
  },
  {
    title: 'Contractor Pricing',
    description: 'Tier-based discounts and account rules',
    icon: Users,
    path: '/admin/pricing/contractor-pricing',
    color: 'text-indigo-600',
    bgColor: 'bg-indigo-100',
  },
  {
    title: 'Extras Catalog',
    description: 'Add-ons and optional services',
    icon: Plus,
    path: '/admin/extras',
    color: 'text-teal-600',
    bgColor: 'bg-teal-100',
  },
  {
    title: 'Warnings & Caps',
    description: 'Distance limits and ZIP warnings',
    icon: AlertTriangle,
    path: '/admin/warnings-caps',
    color: 'text-amber-600',
    bgColor: 'bg-amber-100',
  },
  {
    title: 'Business Rules',
    description: 'Office hours and system settings',
    icon: Settings,
    path: '/admin/config',
    color: 'text-gray-600',
    bgColor: 'bg-gray-100',
  },
];

export default function ConfigIndex() {
  const navigate = useNavigate();

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Configuration</h1>
        <p className="text-muted-foreground mt-1">
          Manage pricing rules, zones, and operational settings (v58 source of truth)
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {configModules.map((module) => {
          const Icon = module.icon;
          return (
            <Card
              key={module.path}
              className="cursor-pointer hover:shadow-lg transition-shadow"
              onClick={() => navigate(module.path)}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className={`p-2 rounded-lg ${module.bgColor}`}>
                    <Icon className={`w-5 h-5 ${module.color}`} />
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground" />
                </div>
                <CardTitle className="text-lg">{module.title}</CardTitle>
                <CardDescription>{module.description}</CardDescription>
              </CardHeader>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
