/**
 * Facility Recommendation Panel - Dispatch Order Detail
 * Shows top 3 recommended facilities with route info
 */
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  MapPin, Navigation, CheckCircle, Clock, Phone, 
  ExternalLink, Building2, FileCheck, AlertCircle, ChevronDown
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { cn } from '@/lib/utils';
import {
  getFacilityRecommendation,
  selectRecommendedFacility,
  CERTIFICATION_LABELS,
  getComplianceBadgeColor,
  type FacilityRecommendation,
  type RecommendedFacilityInfo,
} from '@/lib/certifiedFacilityService';

interface FacilityRecommendationPanelProps {
  orderId: string;
  onFacilitySelect?: (facilityId: string) => void;
}

export function FacilityRecommendationPanel({ 
  orderId,
  onFacilitySelect,
}: FacilityRecommendationPanelProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isOpen, setIsOpen] = useState(true);

  // Fetch recommendation
  const { data: recommendation, isLoading } = useQuery({
    queryKey: ['facility-recommendation', orderId],
    queryFn: () => getFacilityRecommendation(orderId),
    enabled: !!orderId,
  });

  // Select facility mutation
  const selectFacility = useMutation({
    mutationFn: async (facilityId: string) => {
      return selectRecommendedFacility(orderId, facilityId, 'dispatch');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['facility-recommendation', orderId] });
      toast({ title: 'Facility selected' });
    },
    onError: (error) => {
      toast({ 
        title: 'Error selecting facility', 
        description: error.message,
        variant: 'destructive' 
      });
    },
  });

  const handleSelect = (facilityId: string) => {
    selectFacility.mutate(facilityId);
    onFacilitySelect?.(facilityId);
  };

  const handleGetDirections = (address: string) => {
    window.open(`https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(address)}`, '_blank');
  };

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 text-center text-muted-foreground">
          Loading recommendations...
        </CardContent>
      </Card>
    );
  }

  if (!recommendation) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span>No facility recommendations generated yet</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const { 
    recommended_facilities, 
    recommended_reason, 
    compliance_guidance,
    compliance_required,
    project_type,
    selected_facility_id,
    selection_method,
  } = recommendation;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <Card>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "p-2 rounded-full",
                  compliance_required 
                    ? "bg-emerald-100 text-emerald-700" 
                    : "bg-blue-100 text-blue-700"
                )}>
                  {compliance_required ? (
                    <FileCheck className="w-4 h-4" />
                  ) : (
                    <Building2 className="w-4 h-4" />
                  )}
                </div>
                <div>
                  <CardTitle className="text-base">
                    Recommended Facilities
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {recommended_reason}
                  </CardDescription>
                </div>
              </div>
              <div className="flex items-center gap-2">
                {compliance_required && (
                  <Badge className="bg-emerald-100 text-emerald-800 border-emerald-300">
                    Compliance Job
                  </Badge>
                )}
                <ChevronDown className={cn(
                  "w-4 h-4 transition-transform",
                  isOpen && "rotate-180"
                )} />
              </div>
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0 space-y-4">
            {/* Compliance Guidance */}
            {compliance_guidance && (
              <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-sm text-amber-800">
                <strong>Note:</strong> {compliance_guidance}
              </div>
            )}

            {/* Facility List */}
            <div className="space-y-3">
              {recommended_facilities.map((facility, index) => {
                const isSelected = facility.facility_id === selected_facility_id;
                
                return (
                  <FacilityCard
                    key={facility.facility_id}
                    facility={facility}
                    rank={index + 1}
                    isSelected={isSelected}
                    selectionMethod={isSelected ? selection_method : undefined}
                    onSelect={() => handleSelect(facility.facility_id)}
                    onGetDirections={() => handleGetDirections(facility.address)}
                    isSelecting={selectFacility.isPending}
                  />
                );
              })}
            </div>

            {/* Empty State */}
            {recommended_facilities.length === 0 && (
              <div className="text-center py-6 text-muted-foreground">
                <Building2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
                <p>No facilities available for this location</p>
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Card>
    </Collapsible>
  );
}

interface FacilityCardProps {
  facility: RecommendedFacilityInfo;
  rank: number;
  isSelected: boolean;
  selectionMethod?: string;
  onSelect: () => void;
  onGetDirections: () => void;
  isSelecting: boolean;
}

function FacilityCard({
  facility,
  rank,
  isSelected,
  selectionMethod,
  onSelect,
  onGetDirections,
  isSelecting,
}: FacilityCardProps) {
  return (
    <div className={cn(
      "p-4 rounded-lg border transition-colors",
      isSelected 
        ? "border-primary bg-primary/5 ring-1 ring-primary" 
        : "border-border hover:border-muted-foreground/30"
    )}>
      <div className="flex items-start gap-3">
        {/* Rank Badge */}
        <div className={cn(
          "w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold shrink-0",
          rank === 1 
            ? "bg-amber-100 text-amber-800" 
            : "bg-muted text-muted-foreground"
        )}>
          {rank}
        </div>

        {/* Facility Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h4 className="font-medium text-sm">{facility.facility_name}</h4>
            {facility.is_city_certified && (
              <Badge className={getComplianceBadgeColor(facility.certification_type)}>
                {CERTIFICATION_LABELS[facility.certification_type] || 'Certified'}
              </Badge>
            )}
            {facility.green_halo_related && (
              <Badge variant="outline" className="bg-green-50 text-green-700 border-green-300 text-xs">
                GH
              </Badge>
            )}
            {isSelected && (
              <Badge className="bg-primary text-primary-foreground text-xs">
                <CheckCircle className="w-3 h-3 mr-1" />
                Selected
              </Badge>
            )}
          </div>

          <div className="flex items-center gap-1 text-xs text-muted-foreground mt-1">
            <MapPin className="w-3 h-3" />
            <span className="truncate">{facility.address}</span>
          </div>

          {/* Distance info if available */}
          {(facility.distance_miles || facility.duration_minutes) && (
            <div className="flex items-center gap-3 text-xs text-muted-foreground mt-1">
              {facility.distance_miles && (
                <span className="flex items-center gap-1">
                  <Navigation className="w-3 h-3" />
                  {facility.distance_miles.toFixed(1)} mi
                </span>
              )}
              {facility.duration_minutes && (
                <span className="flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  {facility.duration_minutes} min
                </span>
              )}
            </div>
          )}

          {/* Selection method */}
          {isSelected && selectionMethod && (
            <div className="text-xs text-muted-foreground mt-1 capitalize">
              Selected by: {selectionMethod}
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-2 shrink-0">
          {!isSelected && (
            <Button 
              size="sm" 
              onClick={onSelect}
              disabled={isSelecting}
            >
              Select
            </Button>
          )}
          <Button 
            size="sm" 
            variant="outline"
            onClick={onGetDirections}
          >
            <Navigation className="w-3 h-3 mr-1" />
            Directions
          </Button>
        </div>
      </div>
    </div>
  );
}

export default FacilityRecommendationPanel;
