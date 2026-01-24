/**
 * FacilityRequestOption - Customer Quote/Order Component
 * Optional checkbox for customers to request a specific disposal facility
 */
import { useState, useEffect } from 'react';
import { MapPin, AlertCircle, Leaf, DollarSign } from 'lucide-react';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { type Facility } from '@/lib/facilityService';

interface FacilityRequestOptionProps {
  market?: string;
  greenHaloRequired?: boolean;
  onRequestChange: (request: FacilityRequest | null) => void;
}

export interface FacilityRequest {
  wantsSpecificFacility: boolean;
  facilityId?: string;
  facilityNameText?: string;
  notes?: string;
}

export function FacilityRequestOption({
  market,
  greenHaloRequired = false,
  onRequestChange,
}: FacilityRequestOptionProps) {
  const [wantsSpecific, setWantsSpecific] = useState(false);
  const [facilities, setFacilities] = useState<Facility[]>([]);
  const [selectedFacilityId, setSelectedFacilityId] = useState<string>('');
  const [customFacilityName, setCustomFacilityName] = useState('');
  const [notes, setNotes] = useState('');
  const [useCustomInput, setUseCustomInput] = useState(false);

  useEffect(() => {
    if (wantsSpecific && market) {
      fetchFacilities();
    }
  }, [wantsSpecific, market, greenHaloRequired]);

  useEffect(() => {
    if (!wantsSpecific) {
      onRequestChange(null);
      return;
    }

    onRequestChange({
      wantsSpecificFacility: true,
      facilityId: useCustomInput ? undefined : selectedFacilityId || undefined,
      facilityNameText: useCustomInput ? customFacilityName : undefined,
      notes: notes || undefined,
    });
  }, [wantsSpecific, selectedFacilityId, customFacilityName, notes, useCustomInput]);

  async function fetchFacilities() {
    let query = supabase
      .from('facilities')
      .select('*')
      .eq('status', 'active')
      .order('name');

    if (greenHaloRequired) {
      query = query.eq('green_halo_certified', true);
    }

    const { data } = await query;
    setFacilities((data || []) as Facility[]);
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-start gap-3">
        <Checkbox
          id="specific-facility"
          checked={wantsSpecific}
          onCheckedChange={(checked) => setWantsSpecific(checked === true)}
        />
        <div className="flex-1">
          <Label 
            htmlFor="specific-facility" 
            className="font-medium cursor-pointer flex items-center gap-2"
          >
            <MapPin className="w-4 h-4" />
            Do you require a specific disposal/transfer station?
          </Label>
          <p className="text-sm text-muted-foreground mt-1">
            By default, we select the nearest approved facility for your material type.
          </p>
        </div>
      </div>

      {wantsSpecific && (
        <div className="space-y-4 pl-7">
          {/* Fee Warning */}
          <Alert className="border-amber-200 bg-amber-50">
            <DollarSign className="h-4 w-4 text-amber-600" />
            <AlertDescription className="text-amber-800">
              Customer-requested disposal is charged at cost for dump fees and may include 
              a handling fee due to routing/time.
            </AlertDescription>
          </Alert>

          {/* Facility Selection */}
          {!useCustomInput ? (
            <div className="space-y-2">
              <Label>Select Facility (Recommended)</Label>
              <Select value={selectedFacilityId} onValueChange={setSelectedFacilityId}>
                <SelectTrigger>
                  <SelectValue placeholder="Choose a facility..." />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map((facility) => (
                    <SelectItem key={facility.id} value={facility.id}>
                      <div className="flex items-center gap-2">
                        <span>{facility.name}</span>
                        {facility.green_halo_certified && (
                          <Leaf className="w-3 h-3 text-green-600" />
                        )}
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {facilities.length === 0 && (
                <p className="text-sm text-muted-foreground">
                  Loading facilities...
                </p>
              )}
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => setUseCustomInput(true)}
              >
                Can't find your facility? Enter name manually
              </button>
            </div>
          ) : (
            <div className="space-y-2">
              <Label>Facility Name / Address</Label>
              <Input
                placeholder="e.g., Davis Street Transfer Station"
                value={customFacilityName}
                onChange={(e) => setCustomFacilityName(e.target.value)}
              />
              <button
                type="button"
                className="text-sm text-primary hover:underline"
                onClick={() => {
                  setUseCustomInput(false);
                  setCustomFacilityName('');
                }}
              >
                Back to dropdown
              </button>
            </div>
          )}

          {/* Selected Facility Info */}
          {selectedFacilityId && !useCustomInput && (
            <>
              {(() => {
                const selected = facilities.find(f => f.id === selectedFacilityId);
                if (!selected) return null;
                return (
                  <div className="p-3 bg-background border rounded-md">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium flex items-center gap-2">
                          {selected.name}
                          {selected.green_halo_certified && (
                            <Badge className="bg-green-100 text-green-800 text-xs">
                              <Leaf className="w-3 h-3 mr-1" />
                              Certified
                            </Badge>
                          )}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {selected.address}, {selected.city}
                        </p>
                        {selected.hours && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Hours: {selected.hours}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })()}
            </>
          )}

          {/* Notes */}
          <div className="space-y-2">
            <Label>Additional Notes (Optional)</Label>
            <Textarea
              placeholder="Any specific instructions or requirements..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={2}
            />
          </div>

          {/* Green Halo Notice */}
          {greenHaloRequired && (
            <Alert className="border-green-200 bg-green-50">
              <Leaf className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800">
                For recycling/diversion compliance, only Green Halo certified facilities 
                are shown. Your material will be processed at an approved facility.
              </AlertDescription>
            </Alert>
          )}
        </div>
      )}
    </div>
  );
}