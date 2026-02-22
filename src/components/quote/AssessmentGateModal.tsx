// Assessment Gate Modal
// Shows when high-risk conditions are detected before checkout
// Never blocks completely — always provides fallback paths

import { useState, useRef } from 'react';
import { Camera, Phone, ChevronRight, Shield, AlertTriangle, Upload, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';

interface AssessmentGateModalProps {
  open: boolean;
  onClose: () => void;
  mode: 'RECOMMEND' | 'REQUIRE';
  reasons: string[];
  leadId?: string | null;
  quoteId?: string | null;
  isStaff?: boolean;
  onUploadMedia: () => void;
  onContinueWithout: () => void;
  onContactDispatch: () => void;
}

const OVERRIDE_REASONS = [
  { value: 'customer_confirmed', label: 'Customer confirmed material and size' },
  { value: 'repeat_customer', label: 'Repeat customer — known job type' },
  { value: 'dispatch_reviewed', label: 'Dispatch reviewed photos separately' },
  { value: 'other', label: 'Other' },
];

export function AssessmentGateModal({
  open,
  onClose,
  mode,
  reasons,
  leadId,
  quoteId,
  isStaff = false,
  onUploadMedia,
  onContinueWithout,
  onContactDispatch,
}: AssessmentGateModalProps) {
  const [showOverride, setShowOverride] = useState(false);
  const [overrideReason, setOverrideReason] = useState('');
  const [overrideNote, setOverrideNote] = useState('');
  const [overriding, setOverriding] = useState(false);

  const logGateEvent = async (eventType: string, details?: Record<string, unknown>) => {
    try {
      if (leadId) {
        await supabase.from('lead_events').insert({
          lead_id: leadId,
          event_type: eventType,
          details_json: { reasons, mode, quoteId, ...details },
        } as never);
      }
    } catch (err) {
      console.error('[AssessmentGate] Event log error:', err);
    }
  };

  const handleUpload = () => {
    logGateEvent('ASSESSMENT_GATE_UPLOAD_CLICKED');
    onUploadMedia();
    onClose();
  };

  const handleContinue = () => {
    logGateEvent('ASSESSMENT_SKIPPED', { action: 'continue_without' });
    onContinueWithout();
    onClose();
  };

  const handleContact = () => {
    logGateEvent('ASSESSMENT_GATE_CONTACT_DISPATCH');
    onContactDispatch();
    onClose();
  };

  const handleStaffOverride = async () => {
    if (!overrideReason) return;
    setOverriding(true);
    try {
      await logGateEvent('ASSESSMENT_OVERRIDDEN', {
        override_reason: overrideReason,
        override_note: overrideNote,
        action: 'staff_override',
      });
      onContinueWithout();
      onClose();
    } finally {
      setOverriding(false);
    }
  };

  // Log gate trigger on mount
  const logged = useRef(false);
  if (open && !logged.current) {
    logged.current = true;
    logGateEvent('ASSESSMENT_GATE_TRIGGERED');
  }

  const isRequired = mode === 'REQUIRE';

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-2">
            <div className="w-10 h-10 rounded-full bg-warning/10 flex items-center justify-center">
              {isRequired ? (
                <AlertTriangle className="w-5 h-5 text-warning" />
              ) : (
                <Camera className="w-5 h-5 text-primary" />
              )}
            </div>
            <div>
              <DialogTitle className="text-lg">
                Project Size Assessment {isRequired ? 'Required' : 'Recommended'}
              </DialogTitle>
            </div>
          </div>
          <DialogDescription className="mt-2">
            For this type of project, a quick photo helps confirm the right dumpster size and avoid delays.
          </DialogDescription>
        </DialogHeader>

        {/* Reasons */}
        {reasons.length > 0 && (
          <div className="bg-muted/50 rounded-lg p-3 text-sm space-y-1">
            {reasons.map((r, i) => (
              <div key={i} className="flex items-start gap-2">
                <Shield className="w-3.5 h-3.5 text-muted-foreground mt-0.5 shrink-0" />
                <span className="text-muted-foreground">{r}</span>
              </div>
            ))}
          </div>
        )}

        {/* Actions */}
        <div className="space-y-3 pt-2">
          {/* Primary: Upload */}
          <Button
            variant="cta"
            size="lg"
            className="w-full gap-2"
            onClick={handleUpload}
          >
            <Upload className="w-5 h-5" />
            Upload Photo / Short Video
          </Button>

          {/* Secondary: Continue without */}
          {isRequired ? (
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={isStaff ? handleContinue : handleContact}
            >
              <Phone className="w-5 h-5" />
              {isStaff ? 'Continue with Dispatch Approval' : 'Continue with Dispatch Review'}
            </Button>
          ) : (
            <Button
              variant="outline"
              size="lg"
              className="w-full gap-2"
              onClick={handleContinue}
            >
              <ChevronRight className="w-5 h-5" />
              Continue without upload
            </Button>
          )}

          {/* Tertiary: Contact Dispatch */}
          {!isRequired && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full gap-2 text-muted-foreground"
              onClick={handleContact}
            >
              <Phone className="w-4 h-4" />
              Speak to Dispatch
            </Button>
          )}

          {/* Staff Override */}
          {isStaff && (
            <>
              {!showOverride ? (
                <Button
                  variant="ghost"
                  size="sm"
                  className="w-full text-xs text-muted-foreground"
                  onClick={() => setShowOverride(true)}
                >
                  Staff: Override Assessment Gate
                </Button>
              ) : (
                <div className="border border-border rounded-lg p-3 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">Override Assessment</span>
                    <Button variant="ghost" size="sm" className="h-6 w-6 p-0" onClick={() => setShowOverride(false)}>
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  <Select value={overrideReason} onValueChange={setOverrideReason}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select reason..." />
                    </SelectTrigger>
                    <SelectContent>
                      {OVERRIDE_REASONS.map((r) => (
                        <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Textarea
                    placeholder="Additional notes (optional)"
                    value={overrideNote}
                    onChange={(e) => setOverrideNote(e.target.value)}
                    rows={2}
                  />
                  <Button
                    variant="default"
                    size="sm"
                    className="w-full"
                    onClick={handleStaffOverride}
                    disabled={!overrideReason || overriding}
                  >
                    Confirm Override & Continue
                  </Button>
                </div>
              )}
            </>
          )}
        </div>

        {/* Safety disclaimer for skipped assessments */}
        <p className="text-xs text-muted-foreground text-center pt-1">
          Final pricing and disposal category depend on confirmed material type.
        </p>
      </DialogContent>
    </Dialog>
  );
}
