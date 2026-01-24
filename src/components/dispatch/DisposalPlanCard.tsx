/**
 * DisposalPlanCard - Dispatch Panel Component
 * Shows disposal plan with suggested facilities and selection controls
 */
import { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Clock, Phone, Leaf, 
  Check, ChevronDown, ChevronUp, Loader2, AlertTriangle,
  ExternalLink, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  type DisposalPlan, 
  type SuggestedFacility,
  selectFacility,
  parseSuggestedFacilities,
  FACILITY_TYPE_LABELS,
  MATERIAL_CLASS_LABELS,
} from '@/lib/facilityService';

interface DisposalPlanCardProps {
  orderId: string;
  orderCity?: string;
  orderLat?: number;
  orderLng?: number;
  materialClassification?: string;
  onPlanUpdated?: () => void;
}

export function DisposalPlanCard({
  orderId,
  orderCity,
  orderLat,
  orderLng,
  materialClassification,
  onPlanUpdated,
}: DisposalPlanCardProps) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<DisposalPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [selectedFacility, setSelectedFacility] = useState<SuggestedFacility | null>(null);

  useEffect(() => {
    fetchDisposalPlan();
  }, [orderId]);

  async function fetchDisposalPlan() {
    try {
      const { data, error } = await supabase
        .from('order_disposal_plans' as 'order_disposal_plans')
        .select('*')
        .eq('order_id', orderId)
        .single();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data) {
        const planData = data as unknown as DisposalPlan;
        setPlan(planData);
        const suggested = parseSuggestedFacilities(planData);
        if (suggested.length > 0 && planData.selected_facility_id) {
          const selected = suggested.find(f => f.facility_id === planData.selected_facility_id);
          setSelectedFacility(selected || suggested[0]);
        } else if (suggested.length > 0) {
          setSelectedFacility(suggested[0]);
        }
      }
    } catch (err) {
      console.error('Error fetching disposal plan:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function handleRefreshPlan() {
    if (!orderLat || !orderLng || !orderCity || !materialClassification) {
      toast({
        title: 'Missing order data',
        description: 'Order location and material details are required.',
        variant: 'destructive',
      });
      return;
    }

    setIsRefreshing(true);
    try {
      const response = await supabase.functions.invoke('nearest-facilities', {
        body: {
          orderId,
          originLat: orderLat,
          originLng: orderLng,
          materialClassification,
          city: orderCity,
        },
      });

      if (response.error) throw response.error;

      toast({ title: 'Disposal plan updated' });
      fetchDisposalPlan();
      onPlanUpdated?.();
    } catch (err) {
      console.error('Error refreshing plan:', err);
      toast({
        title: 'Error updating plan',
        description: 'Could not fetch nearest facilities.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  async function handleSelectFacility(facility: SuggestedFacility) {
    const result = await selectFacility(
      orderId,
      facility.facility_id,
      'dispatch',
      facility.distance_miles,
      facility.duration_minutes
    );

    if (result.success) {
      setSelectedFacility(facility);
      toast({ title: `Selected: ${facility.facility_name}` });
      fetchDisposalPlan();
      onPlanUpdated?.();
    } else {
      toast({
        title: 'Error selecting facility',
        description: result.error,
        variant: 'destructive',
      });
    }
  }

  function openDirections(facility: SuggestedFacility) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.address)}&travelmode=driving`;
    window.open(url, '_blank');
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const suggestedFacilities = plan ? parseSuggestedFacilities(plan) : [];
  const alternatives = suggestedFacilities.filter(f => f.facility_id !== selectedFacility?.facility_id);

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Disposal Plan
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={handleRefreshPlan}
            disabled={isRefreshing}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
          </Button>
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Material & Requirements */}
        {plan && (
          <div className="flex flex-wrap gap-2">
            <Badge variant="outline">
              {MATERIAL_CLASS_LABELS[plan.material_classification] || plan.material_classification}
            </Badge>
            <Badge variant="secondary">
              → {FACILITY_TYPE_LABELS[plan.required_facility_type as keyof typeof FACILITY_TYPE_LABELS] || plan.required_facility_type}
            </Badge>
            {plan.green_halo_required && (
              <Badge className="bg-green-100 text-green-800 border-green-200">
                <Leaf className="w-3 h-3 mr-1" />
                Green Halo Required
              </Badge>
            )}
          </div>
        )}

        {/* No Plan Yet */}
        {!plan && (
          <div className="text-center py-4">
            <AlertTriangle className="w-8 h-8 mx-auto text-muted-foreground mb-2" />
            <p className="text-sm text-muted-foreground mb-3">
              No disposal plan created yet
            </p>
            <Button onClick={handleRefreshPlan} disabled={isRefreshing}>
              {isRefreshing ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <RefreshCw className="w-4 h-4 mr-2" />
              )}
              Generate Plan
            </Button>
          </div>
        )}

        {/* Selected Facility */}
        {selectedFacility && (
          <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-1">
                  <Check className="w-4 h-4 text-primary" />
                  <span className="font-medium text-sm">{selectedFacility.facility_name}</span>
                  {selectedFacility.green_halo_certified && (
                    <Leaf className="w-3 h-3 text-green-600" />
                  )}
                </div>
                <p className="text-xs text-muted-foreground mb-2">
                  {selectedFacility.address}
                </p>
                <div className="flex flex-wrap gap-3 text-xs">
                  <span className="flex items-center gap-1">
                    <Navigation className="w-3 h-3" />
                    {selectedFacility.distance_miles} mi
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {selectedFacility.duration_minutes} min
                  </span>
                  {selectedFacility.hours && (
                    <span className="text-muted-foreground">
                      {selectedFacility.hours}
                    </span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => openDirections(selectedFacility)}
                >
                  <ExternalLink className="w-3 h-3 mr-1" />
                  Directions
                </Button>
                {selectedFacility.phone && (
                  <Button
                    size="sm"
                    variant="ghost"
                    asChild
                  >
                    <a href={`tel:${selectedFacility.phone}`}>
                      <Phone className="w-3 h-3 mr-1" />
                      Call
                    </a>
                  </Button>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Alternative Facilities */}
        {alternatives.length > 0 && (
          <Collapsible open={showAlternatives} onOpenChange={setShowAlternatives}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" size="sm" className="w-full justify-between">
                <span>Alternative Facilities ({alternatives.length})</span>
                {showAlternatives ? (
                  <ChevronUp className="w-4 h-4" />
                ) : (
                  <ChevronDown className="w-4 h-4" />
                )}
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-2 pt-2">
              {alternatives.map((facility) => (
                <div
                  key={facility.facility_id}
                  className="p-2 border rounded-lg hover:bg-muted/50 transition-colors"
                >
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium truncate">
                          {facility.facility_name}
                        </span>
                        {facility.green_halo_certified && (
                          <Leaf className="w-3 h-3 text-green-600 flex-shrink-0" />
                        )}
                      </div>
                      <div className="flex gap-2 text-xs text-muted-foreground mt-1">
                        <span>{facility.distance_miles} mi</span>
                        <span>•</span>
                        <span>{facility.duration_minutes} min</span>
                      </div>
                    </div>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleSelectFacility(facility)}
                    >
                      Select
                    </Button>
                  </div>
                </div>
              ))}
            </CollapsibleContent>
          </Collapsible>
        )}

        {/* Selection Method */}
        {plan?.selection_method && (
          <p className="text-xs text-muted-foreground text-right">
            Selected by: {plan.selection_method}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
