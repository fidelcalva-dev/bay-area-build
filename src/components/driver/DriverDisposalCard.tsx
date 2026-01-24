/**
 * DriverDisposalCard - Driver App Component
 * Shows selected facility with directions and backup options
 */
import { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Clock, Phone, Leaf, 
  ChevronDown, ChevronUp, Loader2, AlertCircle, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  type DisposalPlan, 
  type SuggestedFacility,
  selectFacility,
  parseSuggestedFacilities,
  logDisposalEvent,
} from '@/lib/facilityService';

interface DriverDisposalCardProps {
  orderId: string;
  onFacilityChanged?: () => void;
}

export function DriverDisposalCard({ orderId, onFacilityChanged }: DriverDisposalCardProps) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<DisposalPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [showBackups, setShowBackups] = useState(false);
  const [changeDialogOpen, setChangeDialogOpen] = useState(false);
  const [changeReason, setChangeReason] = useState('');
  const [pendingFacility, setPendingFacility] = useState<SuggestedFacility | null>(null);
  const [isChanging, setIsChanging] = useState(false);

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

      setPlan(data as unknown as DisposalPlan | null);
    } catch (err) {
      console.error('Error fetching disposal plan:', err);
    } finally {
      setIsLoading(false);
    }
  }

  function getSelectedFacility(): SuggestedFacility | null {
    if (!plan) return null;
    const suggested = parseSuggestedFacilities(plan);
    return suggested.find(f => f.facility_id === plan.selected_facility_id) || suggested[0] || null;
  }

  function getBackupFacilities(): SuggestedFacility[] {
    if (!plan) return [];
    const suggested = parseSuggestedFacilities(plan);
    const selectedId = plan.selected_facility_id || suggested[0]?.facility_id;
    return suggested.filter(f => f.facility_id !== selectedId);
  }

  function openDirections(facility: SuggestedFacility) {
    // Open Google Maps with driving directions
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.address)}&travelmode=driving`;
    window.open(url, '_blank');
  }

  function initiateChange(facility: SuggestedFacility) {
    setPendingFacility(facility);
    setChangeReason('');
    setChangeDialogOpen(true);
  }

  async function confirmChange() {
    if (!pendingFacility || !changeReason.trim()) {
      toast({
        title: 'Reason required',
        description: 'Please provide a reason for changing the facility.',
        variant: 'destructive',
      });
      return;
    }

    setIsChanging(true);
    try {
      // Log the change event first
      await logDisposalEvent(orderId, 'FACILITY_CHANGED_BY_DRIVER', {
        from_facility_id: plan?.selected_facility_id,
        to_facility_id: pendingFacility.facility_id,
        to_facility_name: pendingFacility.facility_name,
        reason: changeReason,
      });

      // Update the selection
      const result = await selectFacility(
        orderId,
        pendingFacility.facility_id,
        'driver',
        pendingFacility.distance_miles,
        pendingFacility.duration_minutes
      );

      if (!result.success) throw new Error(result.error);

      toast({ title: `Facility changed to ${pendingFacility.facility_name}` });
      setChangeDialogOpen(false);
      fetchDisposalPlan();
      onFacilityChanged?.();
    } catch (err) {
      console.error('Error changing facility:', err);
      toast({
        title: 'Error changing facility',
        variant: 'destructive',
      });
    } finally {
      setIsChanging(false);
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

  if (!plan) {
    return (
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center gap-2 text-muted-foreground">
            <AlertCircle className="w-4 h-4" />
            <span className="text-sm">No disposal plan assigned</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const selectedFacility = getSelectedFacility();
  const backups = getBackupFacilities();

  return (
    <>
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-base flex items-center gap-2">
            <MapPin className="w-4 h-4" />
            Disposal Facility
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {/* Green Halo Badge */}
          {plan.green_halo_required && (
            <Badge className="bg-green-100 text-green-800 border-green-200">
              <Leaf className="w-3 h-3 mr-1" />
              Green Halo Certified Required
            </Badge>
          )}

          {/* Selected Facility */}
          {selectedFacility ? (
            <div className="p-3 bg-primary/5 border border-primary/20 rounded-lg">
              <div className="flex items-start gap-3">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-semibold">{selectedFacility.facility_name}</span>
                    {selectedFacility.green_halo_certified && (
                      <Leaf className="w-4 h-4 text-green-600" />
                    )}
                  </div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {selectedFacility.address}
                  </p>
                  <div className="flex flex-wrap gap-4 text-sm">
                    <span className="flex items-center gap-1">
                      <Navigation className="w-4 h-4" />
                      {selectedFacility.distance_miles} mi
                    </span>
                    <span className="flex items-center gap-1">
                      <Clock className="w-4 h-4" />
                      ~{selectedFacility.duration_minutes} min
                    </span>
                  </div>
                  {selectedFacility.hours && (
                    <p className="text-xs text-muted-foreground mt-2">
                      Hours: {selectedFacility.hours}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-2 mt-3">
                <Button
                  className="flex-1"
                  onClick={() => openDirections(selectedFacility)}
                >
                  <Navigation className="w-4 h-4 mr-2" />
                  Get Directions
                </Button>
                {selectedFacility.phone && (
                  <Button variant="outline" asChild>
                    <a href={`tel:${selectedFacility.phone}`}>
                      <Phone className="w-4 h-4" />
                    </a>
                  </Button>
                )}
              </div>
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              <AlertCircle className="w-8 h-8 mx-auto mb-2" />
              <p className="text-sm">No facility selected</p>
            </div>
          )}

          {/* Backup Facilities */}
          {backups.length > 0 && (
            <Collapsible open={showBackups} onOpenChange={setShowBackups}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>Backup Facilities ({backups.length})</span>
                  {showBackups ? (
                    <ChevronUp className="w-4 h-4" />
                  ) : (
                    <ChevronDown className="w-4 h-4" />
                  )}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {backups.map((facility) => (
                  <div
                    key={facility.facility_id}
                    className="p-2 border rounded-lg"
                  >
                    <div className="flex items-center justify-between gap-2 mb-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium">{facility.facility_name}</span>
                        {facility.green_halo_certified && (
                          <Leaf className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {facility.distance_miles} mi
                      </span>
                    </div>
                    <div className="flex gap-2 mt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        className="flex-1"
                        onClick={() => openDirections(facility)}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Directions
                      </Button>
                      <Button
                        size="sm"
                        variant="secondary"
                        onClick={() => initiateChange(facility)}
                      >
                        Use This
                      </Button>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}
        </CardContent>
      </Card>

      {/* Change Facility Dialog */}
      <Dialog open={changeDialogOpen} onOpenChange={setChangeDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Change Facility</DialogTitle>
            <DialogDescription>
              Changing to: <strong>{pendingFacility?.facility_name}</strong>
              <br />
              Please provide a reason for this change.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="e.g., Original facility was closed, traffic conditions, customer request..."
            value={changeReason}
            onChange={(e) => setChangeReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setChangeDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmChange} disabled={isChanging || !changeReason.trim()}>
              {isChanging ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : null}
              Confirm Change
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
