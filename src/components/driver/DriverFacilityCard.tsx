/**
 * Driver Facility Card - Driver App
 * Shows selected facility + 2 backups with Get Directions links
 */
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { 
  MapPin, Navigation, CheckCircle, Clock, Phone, 
  ExternalLink, Building2, FileCheck, AlertCircle, ChevronDown, Map
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { cn } from '@/lib/utils';
import {
  getFacilityRecommendation,
  CERTIFICATION_LABELS,
  getComplianceBadgeColor,
  type RecommendedFacilityInfo,
} from '@/lib/certifiedFacilityService';

interface DriverFacilityCardProps {
  orderId: string;
}

export function DriverFacilityCard({ orderId }: DriverFacilityCardProps) {
  const [showBackups, setShowBackups] = useState(false);

  // Fetch recommendation
  const { data: recommendation, isLoading } = useQuery({
    queryKey: ['facility-recommendation', orderId],
    queryFn: () => getFacilityRecommendation(orderId),
    enabled: !!orderId,
  });

  const handleGetDirections = (address: string) => {
    // Open in maps app (works on mobile)
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}&travelmode=driving`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Loading facility info...
        </CardContent>
      </Card>
    );
  }

  if (!recommendation || recommendation.recommended_facilities.length === 0) {
    return (
      <Card className="border-amber-200 bg-amber-50">
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-amber-700">
            <AlertCircle className="w-4 h-4" />
            <span className="font-medium">No facility assigned</span>
          </div>
          <p className="text-sm text-amber-600 mt-1">
            Contact dispatch for disposal instructions
          </p>
        </CardContent>
      </Card>
    );
  }

  const { 
    recommended_facilities, 
    selected_facility_id,
    compliance_required,
    compliance_guidance,
  } = recommendation;

  // Find selected and backup facilities
  const selectedFacility = recommended_facilities.find(
    f => f.facility_id === selected_facility_id
  ) || recommended_facilities[0];
  
  const backupFacilities = recommended_facilities
    .filter(f => f.facility_id !== selectedFacility.facility_id)
    .slice(0, 2);

  return (
    <div className="space-y-3">
      {/* Primary Facility Card */}
      <Card className="border-primary">
        <CardHeader className="pb-2">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Map className="w-4 h-4" />
              Disposal Facility
            </CardTitle>
            {compliance_required && (
              <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                <FileCheck className="w-3 h-3 mr-1" />
                Certified
              </Badge>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Selected Facility */}
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <div className="flex items-start gap-3">
              <CheckCircle className="w-5 h-5 text-primary mt-0.5 shrink-0" />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <h4 className="font-semibold">{selectedFacility.facility_name}</h4>
                  {selectedFacility.is_city_certified && (
                    <Badge className={cn(
                      "text-xs",
                      getComplianceBadgeColor(selectedFacility.certification_type)
                    )}>
                      {CERTIFICATION_LABELS[selectedFacility.certification_type]}
                    </Badge>
                  )}
                </div>
                
                <div className="flex items-center gap-1 text-sm text-muted-foreground mt-1">
                  <MapPin className="w-3 h-3 shrink-0" />
                  <span>{selectedFacility.address}</span>
                </div>

                {/* Distance/Time */}
                {(selectedFacility.distance_miles || selectedFacility.duration_minutes) && (
                  <div className="flex items-center gap-4 text-sm text-muted-foreground mt-2">
                    {selectedFacility.distance_miles && (
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {selectedFacility.distance_miles.toFixed(1)} miles
                      </span>
                    )}
                    {selectedFacility.duration_minutes && (
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{selectedFacility.duration_minutes} min
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Get Directions Button */}
            <Button 
              className="w-full mt-3"
              onClick={() => handleGetDirections(selectedFacility.address)}
            >
              <Navigation className="w-4 h-4 mr-2" />
              Get Directions
            </Button>
          </div>

          {/* Compliance Guidance */}
          {compliance_guidance && (
            <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm">
              <div className="flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-amber-600 mt-0.5 shrink-0" />
                <div className="text-amber-800">
                  <strong>Important:</strong> {compliance_guidance}
                </div>
              </div>
            </div>
          )}

          {/* Backup Facilities */}
          {backupFacilities.length > 0 && (
            <Collapsible open={showBackups} onOpenChange={setShowBackups}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" className="w-full justify-between">
                  <span className="text-sm">Backup Options ({backupFacilities.length})</span>
                  <ChevronDown className={cn(
                    "w-4 h-4 transition-transform",
                    showBackups && "rotate-180"
                  )} />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {backupFacilities.map((facility, index) => (
                  <div 
                    key={facility.facility_id}
                    className="p-3 rounded-lg border bg-muted/30"
                  >
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-xs text-muted-foreground">
                            Backup #{index + 1}
                          </span>
                          {facility.green_halo_related && (
                            <Badge variant="outline" className="text-xs bg-green-50 text-green-700 border-green-300">
                              GH
                            </Badge>
                          )}
                        </div>
                        <h5 className="font-medium text-sm">{facility.facility_name}</h5>
                        <p className="text-xs text-muted-foreground truncate">
                          {facility.address}
                        </p>
                      </div>
                      <Button 
                        size="sm" 
                        variant="outline"
                        onClick={() => handleGetDirections(facility.address)}
                      >
                        <Navigation className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

export default DriverFacilityCard;
