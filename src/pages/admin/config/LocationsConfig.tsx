import { MapPin, Power, Truck, Globe, Eye, EyeOff, Shield, Building2, Loader2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { useLocationConfigs, useSaveLocationConfig, type LocationConfigRow } from '@/hooks/useLocationConfigs';

const MARKET_TYPE_COLORS: Record<string, string> = {
  CORE_DIRECT: 'bg-primary/10 text-primary border-primary/20',
  SUPPORT_RING: 'bg-accent/10 text-accent-foreground border-accent/20',
  OUTSIDE_CURRENT_FOCUS: 'bg-muted text-muted-foreground border-border',
  FUTURE_PARTNER: 'bg-secondary text-secondary-foreground border-border',
};

const MARKET_TYPE_LABELS: Record<string, string> = {
  CORE_DIRECT: 'Core Direct',
  SUPPORT_RING: 'Support Ring',
  OUTSIDE_CURRENT_FOCUS: 'Outside Focus',
  FUTURE_PARTNER: 'Future Partner',
};

const TYPE_ICONS: Record<string, typeof Truck> = {
  YARD: Truck,
  SERVICE_MARKET: Globe,
  OFFICE: Building2,
};

export default function LocationsConfig() {
  const { data: locations, isLoading } = useLocationConfigs();
  const saveMutation = useSaveLocationConfig();

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-primary" />
      </div>
    );
  }

  const allLocations = locations ?? [];
  const yards = allLocations.filter(l => l.location_type === 'YARD');
  const offices = allLocations.filter(l => l.location_type === 'OFFICE');

  const handleToggle = (loc: LocationConfigRow, field: 'is_active_for_quotes' | 'is_active_for_dispatch' | 'is_visible_publicly') => {
    saveMutation.mutate({ id: loc.id, [field]: !loc[field] });
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-6 h-6 text-primary" />
          Location & Yard Configuration
        </h1>
        <p className="text-muted-foreground mt-1">
          Control which yards and markets are active for quoting, dispatch, and public visibility. Changes persist immediately.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{yards.filter(y => y.is_active_for_quotes).length}</div>
            <div className="text-xs text-muted-foreground">Active for Quotes</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-primary">{yards.filter(y => y.is_active_for_dispatch).length}</div>
            <div className="text-xs text-muted-foreground">Active for Dispatch</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{allLocations.filter(l => l.is_visible_publicly).length}</div>
            <div className="text-xs text-muted-foreground">Publicly Visible</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4 text-center">
            <div className="text-2xl font-bold text-foreground">{allLocations.length}</div>
            <div className="text-xs text-muted-foreground">Total Locations</div>
          </CardContent>
        </Card>
      </div>

      {/* Offices */}
      {offices.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
            <Building2 className="w-5 h-5" />
            Offices
          </h2>
          <div className="space-y-3">
            {offices.map(loc => (
              <LocationCard key={loc.id} location={loc} onToggle={handleToggle} />
            ))}
          </div>
        </div>
      )}

      {/* Operational Yards */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Truck className="w-5 h-5" />
          Operational Yards
        </h2>
        <div className="space-y-3">
          {yards.map(loc => (
            <LocationCard key={loc.id} location={loc} onToggle={handleToggle} />
          ))}
        </div>
      </div>

      {/* Rules */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm flex items-center gap-2">
            <Shield className="w-4 h-4 text-primary" />
            Activation Rules
          </CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-muted-foreground space-y-2">
          <p>• When a yard is disabled for quotes, pricing falls back to the <strong>nearest active yard</strong>.</p>
          <p>• If no active yard serves a ZIP code, the quote flow shows a "Manual Review / Coordinated Service" state.</p>
          <p>• Disabling dispatch does NOT affect existing scheduled runs — only new assignments.</p>
          <p>• Public visibility controls whether the yard appears on the website footer, areas page, and schema.</p>
        </CardContent>
      </Card>
    </div>
  );
}

function LocationCard({
  location,
  onToggle,
}: {
  location: LocationConfigRow;
  onToggle: (loc: LocationConfigRow, field: 'is_active_for_quotes' | 'is_active_for_dispatch' | 'is_visible_publicly') => void;
}) {
  const Icon = TYPE_ICONS[location.location_type] || Globe;

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-start gap-3 flex-1 min-w-0">
            <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Icon className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-sm">{location.name}</h3>
                <Badge variant="outline" className={`text-[10px] ${MARKET_TYPE_COLORS[location.market_type] || ''}`}>
                  {MARKET_TYPE_LABELS[location.market_type] || location.market_type}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                {location.address || `${location.city}, ${location.state} ${location.zip}`}
              </p>
              {location.service_radius_miles > 0 && (
                <p className="text-xs text-muted-foreground">
                  Service radius: {location.service_radius_miles} miles
                </p>
              )}
              {location.nearest_fallback_yard_id && (
                <p className="text-xs text-muted-foreground/60">
                  Fallback: {location.nearest_fallback_yard_id}
                </p>
              )}
            </div>
          </div>

          {location.location_type === 'YARD' && (
            <div className="flex items-center gap-6 md:gap-4 flex-wrap">
              <div className="flex items-center gap-2">
                <Switch
                  id={`${location.id}-quotes`}
                  checked={location.is_active_for_quotes}
                  onCheckedChange={() => onToggle(location, 'is_active_for_quotes')}
                />
                <Label htmlFor={`${location.id}-quotes`} className="text-xs cursor-pointer">
                  Quotes
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id={`${location.id}-dispatch`}
                  checked={location.is_active_for_dispatch}
                  onCheckedChange={() => onToggle(location, 'is_active_for_dispatch')}
                />
                <Label htmlFor={`${location.id}-dispatch`} className="text-xs cursor-pointer">
                  Dispatch
                </Label>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  id={`${location.id}-public`}
                  checked={location.is_visible_publicly}
                  onCheckedChange={() => onToggle(location, 'is_visible_publicly')}
                />
                <Label htmlFor={`${location.id}-public`} className="text-xs cursor-pointer flex items-center gap-1">
                  {location.is_visible_publicly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                  Public
                </Label>
              </div>
            </div>
          )}

          {location.location_type === 'OFFICE' && (
            <div className="flex items-center gap-2">
              <Switch
                id={`${location.id}-public`}
                checked={location.is_visible_publicly}
                onCheckedChange={() => onToggle(location, 'is_visible_publicly')}
              />
              <Label htmlFor={`${location.id}-public`} className="text-xs cursor-pointer flex items-center gap-1">
                {location.is_visible_publicly ? <Eye className="w-3 h-3" /> : <EyeOff className="w-3 h-3" />}
                Public
              </Label>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
