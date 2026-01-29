// Operational Time Calculator Component (Internal Use Only)

import { useState, useEffect } from 'react';
import { Clock, Truck, MapPin, Factory, Timer, Zap, Calendar, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { Progress } from '@/components/ui/progress';
import { useOperationalTimeCalculation, useYards, useFacilitiesForMaterial } from '@/hooks/useOperationalTime';
import { formatDuration, getSlaClassInfo, getRunRecommendationInfo } from '@/services/operationalTimeService';
import type { ServiceType, MaterialCategory, OperationalTimeResult } from '@/types/operationalTime';

interface OperationalTimeCalculatorProps {
  // Pre-fill values if coming from order/quote context
  initialYardId?: string;
  initialAddress?: string;
  initialLat?: number;
  initialLng?: number;
  initialServiceType?: ServiceType;
  initialMaterialCategory?: MaterialCategory;
  initialFacilityId?: string;
  // Callback when calculation completes
  onResult?: (result: OperationalTimeResult) => void;
  // Compact mode for inline display
  compact?: boolean;
}

export function OperationalTimeCalculator({
  initialYardId,
  initialAddress,
  initialLat,
  initialLng,
  initialServiceType = 'DELIVERY',
  initialMaterialCategory = 'DEBRIS',
  initialFacilityId,
  onResult,
  compact = false,
}: OperationalTimeCalculatorProps) {
  const [yardId, setYardId] = useState(initialYardId || '');
  const [address, setAddress] = useState(initialAddress || '');
  const [serviceType, setServiceType] = useState<ServiceType>(initialServiceType);
  const [materialCategory, setMaterialCategory] = useState<MaterialCategory>(initialMaterialCategory);
  const [facilityId, setFacilityId] = useState(initialFacilityId || '');

  const { data: yards = [] } = useYards();
  const { data: facilities = [] } = useFacilitiesForMaterial(
    serviceType !== 'DELIVERY' ? materialCategory : null
  );
  const { result, calculate, isLoading, reset } = useOperationalTimeCalculation();

  // Update state when initial values change
  useEffect(() => {
    if (initialYardId) setYardId(initialYardId);
    if (initialAddress) setAddress(initialAddress);
    if (initialServiceType) setServiceType(initialServiceType);
    if (initialMaterialCategory) setMaterialCategory(initialMaterialCategory);
    if (initialFacilityId) setFacilityId(initialFacilityId);
  }, [initialYardId, initialAddress, initialServiceType, initialMaterialCategory, initialFacilityId]);

  // Notify parent when result changes
  useEffect(() => {
    if (result && onResult) {
      onResult(result);
    }
  }, [result, onResult]);

  const handleCalculate = () => {
    if (!yardId) return;

    calculate({
      origin_yard_id: yardId,
      destination_address: address || undefined,
      destination_lat: initialLat,
      destination_lng: initialLng,
      service_type: serviceType,
      material_category: materialCategory,
      disposal_facility_id: facilityId || undefined,
    });
  };

  const needsFacility = serviceType === 'PICKUP' || serviceType === 'SWAP';

  if (compact && result) {
    return <CompactResult result={result} onRecalculate={() => reset()} />;
  }

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Timer className="h-5 w-5 text-primary" />
          Operational Time Calculator
        </CardTitle>
        <CardDescription>Internal use only - not visible to customers</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Inputs */}
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Origin Yard</Label>
            <Select value={yardId} onValueChange={setYardId}>
              <SelectTrigger>
                <SelectValue placeholder="Select yard" />
              </SelectTrigger>
              <SelectContent>
                {yards.map((yard) => (
                  <SelectItem key={yard.id} value={yard.id}>
                    {yard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Service Type</Label>
            <Select value={serviceType} onValueChange={(v) => setServiceType(v as ServiceType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DELIVERY">Delivery</SelectItem>
                <SelectItem value="PICKUP">Pickup</SelectItem>
                <SelectItem value="SWAP">Swap</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Job Site Address</Label>
            <Input
              placeholder="Enter address or city"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label>Material Category</Label>
            <Select value={materialCategory} onValueChange={(v) => setMaterialCategory(v as MaterialCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DEBRIS">General Debris</SelectItem>
                <SelectItem value="HEAVY">Heavy (Concrete/Dirt)</SelectItem>
                <SelectItem value="DEBRIS_HEAVY">Mixed Debris + Heavy</SelectItem>
                <SelectItem value="CLEAN_RECYCLING">Clean Recycling</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {needsFacility && (
            <div className="space-y-2 md:col-span-2">
              <Label>Disposal Facility (Optional)</Label>
              <Select value={facilityId} onValueChange={setFacilityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Auto-select nearest" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Auto-select nearest</SelectItem>
                  {facilities.map((f) => (
                    <SelectItem key={f.id} value={f.id}>
                      {f.name} ({f.facility_type})
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
        </div>

        <Button
          onClick={handleCalculate}
          disabled={!yardId || isLoading}
          className="w-full"
        >
          {isLoading ? (
            <>
              <Timer className="h-4 w-4 mr-2 animate-spin" />
              Calculating...
            </>
          ) : (
            <>
              <Clock className="h-4 w-4 mr-2" />
              Calculate Time
            </>
          )}
        </Button>

        {/* Results */}
        {result && result.success && (
          <div className="space-y-4 pt-4">
            <Separator />
            <ResultDisplay result={result} />
          </div>
        )}

        {result && !result.success && (
          <div className="p-4 bg-destructive/10 rounded-lg text-destructive flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            <span>{result.error || 'Calculation failed'}</span>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ResultDisplay({ result }: { result: OperationalTimeResult }) {
  const slaInfo = getSlaClassInfo(result.sla_class);
  const runInfo = getRunRecommendationInfo(result.recommended_run_type);
  const totalMinutes = result.total_time_minutes;
  const maxMinutes = 360; // 6 hours for progress bar

  return (
    <div className="space-y-4">
      {/* Summary */}
      <div className="flex items-center justify-between">
        <div>
          <div className="text-2xl font-bold">{formatDuration(totalMinutes)}</div>
          <div className="text-sm text-muted-foreground">Total estimated time</div>
        </div>
        <div className="text-right space-y-1">
          <Badge className={`${slaInfo.bgColor} ${slaInfo.color} border-0`}>
            {slaInfo.label}
          </Badge>
          <div className={`text-sm ${runInfo.color}`}>{runInfo.label}</div>
        </div>
      </div>

      <Progress value={Math.min((totalMinutes / maxMinutes) * 100, 100)} className="h-2" />

      {/* Route Info */}
      <div className="grid gap-2 text-sm">
        <div className="flex items-center gap-2">
          <Truck className="h-4 w-4 text-muted-foreground" />
          <span className="font-medium">{result.origin_yard}</span>
          <span className="text-muted-foreground">→</span>
          <MapPin className="h-4 w-4 text-muted-foreground" />
          <span>{result.job_site_city || 'Job Site'}</span>
          {result.facility && (
            <>
              <span className="text-muted-foreground">→</span>
              <Factory className="h-4 w-4 text-muted-foreground" />
              <span>{result.facility}</span>
            </>
          )}
        </div>
      </div>

      {/* Time Breakdown */}
      <div className="bg-muted/50 rounded-lg p-4 space-y-3">
        <div className="font-medium text-sm">Time Breakdown</div>
        <div className="grid gap-2 text-sm">
          <TimeRow label="Yard handling" minutes={result.breakdown.yard_time} icon={<Truck className="h-4 w-4" />} />
          <TimeRow label="Drive time" minutes={result.breakdown.drive_time} icon={<MapPin className="h-4 w-4" />} />
          <TimeRow label="Job site handling" minutes={result.breakdown.jobsite_time} icon={<Clock className="h-4 w-4" />} />
          {result.breakdown.dump_time > 0 && (
            <TimeRow label="Dump/unload time" minutes={result.breakdown.dump_time} icon={<Factory className="h-4 w-4" />} />
          )}
          <TimeRow label="Buffer" minutes={result.breakdown.buffer} icon={<Timer className="h-4 w-4" />} />
        </div>
      </div>

      {/* Route Details */}
      {result.route_details && Object.keys(result.route_details).length > 0 && (
        <div className="text-xs text-muted-foreground space-y-1">
          <div className="font-medium">Route Distances:</div>
          {result.route_details.yard_to_site_miles && (
            <div>Yard → Site: {result.route_details.yard_to_site_miles} mi</div>
          )}
          {result.route_details.site_to_dump_miles && (
            <div>Site → Facility: {result.route_details.site_to_dump_miles} mi</div>
          )}
          {result.route_details.dump_to_yard_miles && (
            <div>Facility → Yard: {result.route_details.dump_to_yard_miles} mi</div>
          )}
          {result.route_details.dump_to_site_miles && (
            <div>Facility → Site: {result.route_details.dump_to_site_miles} mi</div>
          )}
          {result.route_details.site_to_yard_miles && (
            <div>Site → Yard: {result.route_details.site_to_yard_miles} mi</div>
          )}
        </div>
      )}
    </div>
  );
}

function TimeRow({ label, minutes, icon }: { label: string; minutes: number; icon: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <div className="flex items-center gap-2 text-muted-foreground">
        {icon}
        <span>{label}</span>
      </div>
      <span className="font-medium">{formatDuration(minutes)}</span>
    </div>
  );
}

function CompactResult({ result, onRecalculate }: { result: OperationalTimeResult; onRecalculate: () => void }) {
  const slaInfo = getSlaClassInfo(result.sla_class);
  const runInfo = getRunRecommendationInfo(result.recommended_run_type);

  return (
    <div className="border rounded-lg p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Timer className="h-4 w-4 text-primary" />
          <span className="font-medium">Operational Time</span>
        </div>
        <Button variant="ghost" size="sm" onClick={onRecalculate}>
          Recalculate
        </Button>
      </div>
      
      <div className="flex items-center justify-between">
        <div className="text-xl font-bold">{formatDuration(result.total_time_minutes)}</div>
        <Badge className={`${slaInfo.bgColor} ${slaInfo.color} border-0`}>
          {slaInfo.label}
        </Badge>
      </div>

      <div className="text-sm text-muted-foreground flex items-center gap-1">
        {result.recommended_run_type === 'SAME_DAY' && <Zap className="h-4 w-4 text-green-500" />}
        {result.recommended_run_type === 'SCHEDULED' && <Calendar className="h-4 w-4 text-amber-500" />}
        <span className={runInfo.color}>{runInfo.label}</span>
      </div>

      {result.facility && (
        <div className="text-xs text-muted-foreground">
          Facility: {result.facility}
        </div>
      )}
    </div>
  );
}
