/**
 * DriverFacilitySelector - Driver App Component
 * Allows drivers to select between auto-recommended or their preferred facility
 */
import { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Star, Clock, Leaf, 
  ChevronDown, ChevronUp, Loader2, Check, AlertCircle
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  type DisposalPlan, 
  type SuggestedFacility,
  type DriverFacilityPreference,
  parseSuggestedFacilities,
  getDriverPreferences,
  selectFacilityWithMode,
  logDisposalEvent,
} from '@/lib/facilityService';

interface DriverFacilitySelectorProps {
  orderId: string;
  driverId: string;
  market?: string;
  onFacilitySelected?: () => void;
}

export function DriverFacilitySelector({
  orderId,
  driverId,
  market = 'bay_area',
  onFacilitySelected,
}: DriverFacilitySelectorProps) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<DisposalPlan | null>(null);
  const [preferences, setPreferences] = useState<DriverFacilityPreference[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectionMode, setSelectionMode] = useState<'auto' | 'preferred'>('auto');
  const [selectedPreferenceId, setSelectedPreferenceId] = useState<string>('');
  const [showPreferences, setShowPreferences] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    Promise.all([fetchDisposalPlan(), fetchDriverPreferences()])
      .finally(() => setIsLoading(false));
  }, [orderId, driverId]);

  async function fetchDisposalPlan() {
    const { data, error } = await supabase
      .from('order_disposal_plans' as 'order_disposal_plans')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (!error && data) {
      const planData = data as unknown as DisposalPlan;
      setPlan(planData);
      
      // Set initial mode based on current plan
      if (planData.facility_selection_mode === 'driver_preferred') {
        setSelectionMode('preferred');
      }
    }
  }

  async function fetchDriverPreferences() {
    const prefs = await getDriverPreferences(driverId, market, plan?.green_halo_required);
    setPreferences(prefs);
    
    // Set default preference if available
    const defaultPref = prefs.find(p => p.is_default) || prefs[0];
    if (defaultPref) {
      setSelectedPreferenceId(defaultPref.facility_id);
    }
  }

  function getRecommendedFacility(): SuggestedFacility | null {
    if (!plan) return null;
    const suggested = parseSuggestedFacilities(plan);
    return suggested[0] || null;
  }

  async function handleConfirmSelection() {
    if (!plan) return;
    
    setIsSubmitting(true);
    try {
      if (selectionMode === 'auto') {
        // Use auto-recommended facility
        const recommended = getRecommendedFacility();
        if (!recommended) {
          throw new Error('No recommended facility available');
        }

        await selectFacilityWithMode(
          orderId,
          recommended.facility_id,
          'auto',
          'system',
          undefined,
          recommended.distance_miles,
          recommended.duration_minutes
        );

        toast({ title: `Using recommended: ${recommended.facility_name}` });
      } else {
        // Use driver's preferred facility
        const preference = preferences.find(p => p.facility_id === selectedPreferenceId);
        if (!preference || !preference.facility) {
          throw new Error('Please select a preferred facility');
        }

        await selectFacilityWithMode(
          orderId,
          preference.facility_id,
          'driver_preferred',
          'driver',
          'Driver selected preferred facility',
        );

        await logDisposalEvent(orderId, 'FACILITY_SELECTED_BY_DRIVER', {
          facilityId: preference.facility_id,
          facilityName: preference.facility.name,
          driverId,
        });

        toast({ title: `Using your preferred: ${preference.facility.name}` });
      }

      onFacilitySelected?.();
    } catch (err) {
      console.error('Error selecting facility:', err);
      toast({
        title: 'Error',
        description: err instanceof Error ? err.message : 'Could not select facility',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="p-4 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  const recommended = getRecommendedFacility();

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MapPin className="w-4 h-4" />
          Facility Options
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Green Halo Badge */}
        {plan?.green_halo_required && (
          <Badge className="bg-green-100 text-green-800 border-green-200">
            <Leaf className="w-3 h-3 mr-1" />
            Green Halo Certified Only
          </Badge>
        )}

        <RadioGroup
          value={selectionMode}
          onValueChange={(val) => setSelectionMode(val as 'auto' | 'preferred')}
          className="space-y-3"
        >
          {/* Option 1: Auto/Recommended */}
          <div className={`p-3 border rounded-lg transition-colors ${
            selectionMode === 'auto' ? 'border-primary bg-primary/5' : 'border-border'
          }`}>
            <div className="flex items-start gap-3">
              <RadioGroupItem value="auto" id="auto" className="mt-1" />
              <div className="flex-1">
                <Label htmlFor="auto" className="font-medium cursor-pointer">
                  Use recommended (nearest)
                </Label>
                {recommended && (
                  <div className="mt-2 text-sm">
                    <p className="font-medium flex items-center gap-2">
                      {recommended.facility_name}
                      {recommended.green_halo_certified && (
                        <Leaf className="w-3 h-3 text-green-600" />
                      )}
                    </p>
                    <div className="flex gap-3 text-muted-foreground mt-1">
                      <span className="flex items-center gap-1">
                        <Navigation className="w-3 h-3" />
                        {recommended.distance_miles} mi
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        ~{recommended.duration_minutes} min
                      </span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Option 2: Driver's Preferred */}
          <div className={`p-3 border rounded-lg transition-colors ${
            selectionMode === 'preferred' ? 'border-primary bg-primary/5' : 'border-border'
          }`}>
            <div className="flex items-start gap-3">
              <RadioGroupItem 
                value="preferred" 
                id="preferred" 
                className="mt-1"
                disabled={preferences.length === 0}
              />
              <div className="flex-1">
                <Label htmlFor="preferred" className="font-medium cursor-pointer flex items-center gap-2">
                  <Star className="w-4 h-4" />
                  Use my usual facility
                </Label>
                <p className="text-sm text-muted-foreground">
                  {preferences.length > 0 
                    ? `${preferences.length} favorite${preferences.length > 1 ? 's' : ''} available`
                    : 'No favorites saved for this market'}
                </p>
              </div>
            </div>

            {/* Preferences List */}
            {selectionMode === 'preferred' && preferences.length > 0 && (
              <Collapsible 
                open={showPreferences} 
                onOpenChange={setShowPreferences}
                className="mt-3 ml-7"
              >
                <CollapsibleTrigger asChild>
                  <Button variant="ghost" size="sm" className="w-full justify-between">
                    <span>Select from favorites</span>
                    {showPreferences ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                  </Button>
                </CollapsibleTrigger>
                <CollapsibleContent className="space-y-2 mt-2">
                  {preferences.slice(0, 3).map((pref) => (
                    <button
                      key={pref.id}
                      type="button"
                      onClick={() => setSelectedPreferenceId(pref.facility_id)}
                      className={`w-full p-2 border rounded-lg text-left transition-colors ${
                        selectedPreferenceId === pref.facility_id 
                          ? 'border-primary bg-primary/10' 
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          {selectedPreferenceId === pref.facility_id && (
                            <Check className="w-4 h-4 text-primary" />
                          )}
                          <span className="font-medium text-sm">
                            {pref.facility?.name || 'Unknown Facility'}
                          </span>
                          {pref.facility?.green_halo_certified && (
                            <Leaf className="w-3 h-3 text-green-600" />
                          )}
                          {pref.is_default && (
                            <Star className="w-3 h-3 text-amber-500 fill-amber-500" />
                          )}
                        </div>
                        <Badge variant="outline" className="text-xs">
                          #{pref.rank}
                        </Badge>
                      </div>
                      {pref.facility?.address && (
                        <p className="text-xs text-muted-foreground mt-1 ml-6">
                          {pref.facility.address}
                        </p>
                      )}
                    </button>
                  ))}
                </CollapsibleContent>
              </Collapsible>
            )}
          </div>
        </RadioGroup>

        {/* Confirm Button */}
        <Button 
          className="w-full" 
          onClick={handleConfirmSelection}
          disabled={isSubmitting || (selectionMode === 'preferred' && !selectedPreferenceId)}
        >
          {isSubmitting ? (
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          ) : (
            <Check className="w-4 h-4 mr-2" />
          )}
          Confirm Facility
        </Button>

        {/* Warning for detour */}
        {selectionMode === 'preferred' && selectedPreferenceId && recommended && (
          <>
            {(() => {
              const pref = preferences.find(p => p.facility_id === selectedPreferenceId);
              // Simple check - if preferred facility exists, show a note
              // In production, we'd calculate actual route difference
              return (
                <p className="text-xs text-muted-foreground text-center">
                  Route will be updated after confirmation
                </p>
              );
            })()}
          </>
        )}
      </CardContent>
    </Card>
  );
}