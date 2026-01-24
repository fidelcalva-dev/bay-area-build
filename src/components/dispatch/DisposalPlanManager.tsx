/**
 * DisposalPlanManager - Full Dispatch Control Panel
 * Shows disposal plan with mode display, customer requests, driver preferences, and override controls
 */
import { useState, useEffect } from 'react';
import { 
  MapPin, Navigation, Clock, Phone, Leaf, Check, ChevronDown, ChevronUp, 
  Loader2, AlertTriangle, ExternalLink, RefreshCw, User, Truck, Shield,
  CheckCircle, XCircle, MessageSquare
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Separator } from '@/components/ui/separator';
import { Textarea } from '@/components/ui/textarea';
import { 
  Dialog, DialogContent, DialogDescription, DialogFooter, 
  DialogHeader, DialogTitle 
} from '@/components/ui/dialog';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { 
  type DisposalPlan, 
  type SuggestedFacility,
  type DisposalRequest,
  parseSuggestedFacilities,
  getDisposalRequests,
  approveDisposalRequest,
  denyDisposalRequest,
  selectFacilityWithMode,
  FACILITY_MODE_LABELS,
  MATERIAL_CLASS_LABELS,
  FACILITY_TYPE_LABELS,
} from '@/lib/facilityService';

interface DisposalPlanManagerProps {
  orderId: string;
  orderCity?: string;
  orderLat?: number;
  orderLng?: number;
  materialClassification?: string;
  onPlanUpdated?: () => void;
}

export function DisposalPlanManager({
  orderId,
  orderCity,
  orderLat,
  orderLng,
  materialClassification,
  onPlanUpdated,
}: DisposalPlanManagerProps) {
  const { toast } = useToast();
  const [plan, setPlan] = useState<DisposalPlan | null>(null);
  const [requests, setRequests] = useState<DisposalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [showAlternatives, setShowAlternatives] = useState(false);
  const [showRequests, setShowRequests] = useState(true);
  
  // Override dialog state
  const [overrideDialogOpen, setOverrideDialogOpen] = useState(false);
  const [overrideFacility, setOverrideFacility] = useState<SuggestedFacility | null>(null);
  const [overrideReason, setOverrideReason] = useState('');
  const [isOverriding, setIsOverriding] = useState(false);
  
  // Request review dialog state
  const [reviewDialogOpen, setReviewDialogOpen] = useState(false);
  const [reviewingRequest, setReviewingRequest] = useState<DisposalRequest | null>(null);
  const [reviewAction, setReviewAction] = useState<'approve' | 'deny'>('approve');
  const [reviewNotes, setReviewNotes] = useState('');
  const [isReviewing, setIsReviewing] = useState(false);

  useEffect(() => {
    fetchData();
  }, [orderId]);

  async function fetchData() {
    setIsLoading(true);
    await Promise.all([fetchDisposalPlan(), fetchRequests()]);
    setIsLoading(false);
  }

  async function fetchDisposalPlan() {
    const { data, error } = await supabase
      .from('order_disposal_plans' as 'order_disposal_plans')
      .select('*')
      .eq('order_id', orderId)
      .single();

    if (!error && data) {
      setPlan(data as unknown as DisposalPlan);
    }
  }

  async function fetchRequests() {
    const reqs = await getDisposalRequests(orderId);
    setRequests(reqs);
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

      toast({ title: 'Disposal plan refreshed' });
      await fetchData();
      onPlanUpdated?.();
    } catch (err) {
      console.error('Error refreshing plan:', err);
      toast({
        title: 'Error',
        description: 'Could not refresh disposal plan.',
        variant: 'destructive',
      });
    } finally {
      setIsRefreshing(false);
    }
  }

  function openOverrideDialog(facility: SuggestedFacility) {
    setOverrideFacility(facility);
    setOverrideReason('');
    setOverrideDialogOpen(true);
  }

  async function confirmOverride() {
    if (!overrideFacility) return;
    
    setIsOverriding(true);
    try {
      await selectFacilityWithMode(
        orderId,
        overrideFacility.facility_id,
        'dispatch_override',
        'dispatch',
        overrideReason || 'Dispatch override',
        overrideFacility.distance_miles,
        overrideFacility.duration_minutes
      );

      toast({ title: `Override: ${overrideFacility.facility_name}` });
      setOverrideDialogOpen(false);
      await fetchData();
      onPlanUpdated?.();
    } catch (err) {
      console.error('Error overriding:', err);
      toast({
        title: 'Error',
        description: 'Could not override facility selection.',
        variant: 'destructive',
      });
    } finally {
      setIsOverriding(false);
    }
  }

  function openReviewDialog(request: DisposalRequest, action: 'approve' | 'deny') {
    setReviewingRequest(request);
    setReviewAction(action);
    setReviewNotes('');
    setReviewDialogOpen(true);
  }

  async function confirmReview() {
    if (!reviewingRequest) return;
    
    setIsReviewing(true);
    try {
      if (reviewAction === 'approve') {
        await approveDisposalRequest(reviewingRequest.id, 'dispatch', reviewNotes);
        toast({ title: 'Request approved' });
      } else {
        await denyDisposalRequest(reviewingRequest.id, 'dispatch', reviewNotes);
        toast({ title: 'Request denied, reverted to auto' });
      }

      setReviewDialogOpen(false);
      await fetchData();
      onPlanUpdated?.();
    } catch (err) {
      console.error('Error reviewing:', err);
      toast({
        title: 'Error',
        description: 'Could not process request.',
        variant: 'destructive',
      });
    } finally {
      setIsReviewing(false);
    }
  }

  function openDirections(facility: SuggestedFacility) {
    const url = `https://www.google.com/maps/dir/?api=1&destination=${encodeURIComponent(facility.address)}&travelmode=driving`;
    window.open(url, '_blank');
  }

  function getModeIcon(mode: string) {
    switch (mode) {
      case 'customer_requested': return <User className="w-3 h-3" />;
      case 'driver_preferred': return <Truck className="w-3 h-3" />;
      case 'dispatch_override': return <Shield className="w-3 h-3" />;
      default: return <MapPin className="w-3 h-3" />;
    }
  }

  function getModeColor(mode: string) {
    switch (mode) {
      case 'customer_requested': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'driver_preferred': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'dispatch_override': return 'bg-orange-100 text-orange-800 border-orange-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
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
  const selectedFacility = plan?.selected_facility_id 
    ? suggestedFacilities.find(f => f.facility_id === plan.selected_facility_id) || suggestedFacilities[0]
    : suggestedFacilities[0];
  const alternatives = suggestedFacilities.filter(f => f.facility_id !== selectedFacility?.facility_id);
  const pendingRequests = requests.filter(r => r.status === 'submitted');

  return (
    <>
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
          {/* Mode & Material Info */}
          {plan && (
            <div className="flex flex-wrap gap-2">
              {/* Current Mode */}
              <Badge className={getModeColor(plan.facility_selection_mode || 'auto')}>
                {getModeIcon(plan.facility_selection_mode || 'auto')}
                <span className="ml-1">
                  {FACILITY_MODE_LABELS[plan.facility_selection_mode as keyof typeof FACILITY_MODE_LABELS] || 'Auto'}
                </span>
              </Badge>
              
              {/* Material */}
              <Badge variant="outline">
                {MATERIAL_CLASS_LABELS[plan.material_classification] || plan.material_classification}
              </Badge>
              
              {/* Facility Type */}
              <Badge variant="secondary">
                → {FACILITY_TYPE_LABELS[plan.required_facility_type as keyof typeof FACILITY_TYPE_LABELS] || plan.required_facility_type}
              </Badge>
              
              {/* Green Halo */}
              {plan.green_halo_required && (
                <Badge className="bg-green-100 text-green-800 border-green-200">
                  <Leaf className="w-3 h-3 mr-1" />
                  Green Halo
                </Badge>
              )}
              
              {/* Fee Flags */}
              {plan.dump_fee_at_cost && (
                <Badge variant="outline" className="border-amber-300 text-amber-700">
                  At Cost
                </Badge>
              )}
            </div>
          )}

          {/* Pending Customer/Driver Requests */}
          {pendingRequests.length > 0 && (
            <Collapsible open={showRequests} onOpenChange={setShowRequests}>
              <CollapsibleTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="w-full justify-between border-amber-300 bg-amber-50"
                >
                  <span className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    {pendingRequests.length} Pending Request{pendingRequests.length > 1 ? 's' : ''}
                  </span>
                  {showRequests ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="space-y-2 pt-2">
                {pendingRequests.map((request) => (
                  <div key={request.id} className="p-3 border rounded-lg bg-amber-50/50">
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {request.requested_by === 'customer' ? (
                            <User className="w-4 h-4 text-blue-600" />
                          ) : (
                            <Truck className="w-4 h-4 text-purple-600" />
                          )}
                          <span className="font-medium text-sm capitalize">
                            {request.requested_by} Request
                          </span>
                        </div>
                        <p className="text-sm">
                          {request.facility?.name || request.requested_facility_name_text || 'Unknown facility'}
                        </p>
                        {request.notes && (
                          <p className="text-xs text-muted-foreground mt-1">
                            "{request.notes}"
                          </p>
                        )}
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="default"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => openReviewDialog(request, 'approve')}
                        >
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Approve
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          className="border-red-300 text-red-700 hover:bg-red-50"
                          onClick={() => openReviewDialog(request, 'deny')}
                        >
                          <XCircle className="w-3 h-3" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* No Plan */}
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
                    <Button size="sm" variant="ghost" asChild>
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

          {/* Request Reason */}
          {plan?.request_reason && (
            <div className="p-2 bg-muted/50 rounded-md">
              <p className="text-xs text-muted-foreground flex items-start gap-2">
                <MessageSquare className="w-3 h-3 mt-0.5 flex-shrink-0" />
                <span>"{plan.request_reason}"</span>
              </p>
            </div>
          )}

          <Separator />

          {/* Alternative Facilities / Override Options */}
          {alternatives.length > 0 && (
            <Collapsible open={showAlternatives} onOpenChange={setShowAlternatives}>
              <CollapsibleTrigger asChild>
                <Button variant="ghost" size="sm" className="w-full justify-between">
                  <span>Override / Alternatives ({alternatives.length})</span>
                  {showAlternatives ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
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
                        onClick={() => openOverrideDialog(facility)}
                      >
                        <Shield className="w-3 h-3 mr-1" />
                        Override
                      </Button>
                    </div>
                  </div>
                ))}
              </CollapsibleContent>
            </Collapsible>
          )}

          {/* Selection Info */}
          {plan?.selection_method && (
            <p className="text-xs text-muted-foreground text-right">
              Selected by: {plan.requested_by || plan.selection_method}
            </p>
          )}
        </CardContent>
      </Card>

      {/* Override Dialog */}
      <Dialog open={overrideDialogOpen} onOpenChange={setOverrideDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Dispatch Override
            </DialogTitle>
            <DialogDescription>
              Overriding to: <strong>{overrideFacility?.facility_name}</strong>
              <br />
              This will log the change as a dispatch override.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Reason for override (optional)..."
            value={overrideReason}
            onChange={(e) => setOverrideReason(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setOverrideDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={confirmOverride} disabled={isOverriding}>
              {isOverriding ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              Confirm Override
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Review Request Dialog */}
      <Dialog open={reviewDialogOpen} onOpenChange={setReviewDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              {reviewAction === 'approve' ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <XCircle className="w-5 h-5 text-red-600" />
              )}
              {reviewAction === 'approve' ? 'Approve Request' : 'Deny Request'}
            </DialogTitle>
            <DialogDescription>
              {reviewAction === 'approve' ? (
                <>
                  Approving request for: <strong>{reviewingRequest?.facility?.name || reviewingRequest?.requested_facility_name_text}</strong>
                  <br />
                  This will set the facility and enable at-cost dump fees.
                </>
              ) : (
                <>
                  Denying this request will revert to auto-selected facility.
                </>
              )}
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder={reviewAction === 'approve' ? "Notes (optional)..." : "Reason for denial..."}
            value={reviewNotes}
            onChange={(e) => setReviewNotes(e.target.value)}
            rows={3}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setReviewDialogOpen(false)}>
              Cancel
            </Button>
            <Button 
              onClick={confirmReview} 
              disabled={isReviewing}
              className={reviewAction === 'approve' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'}
            >
              {isReviewing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : null}
              {reviewAction === 'approve' ? 'Approve' : 'Deny'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}