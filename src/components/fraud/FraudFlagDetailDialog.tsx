import { useState } from 'react';
import { 
  Shield, Loader2, AlertTriangle, CheckCircle, Ban, 
  DollarSign, UserCheck, Clock, Phone, MapPin, FileText
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import type { FraudFlag, FraudSeverity, FraudStatus } from '@/lib/fraudService';
import { 
  resolveFraudFlag, 
  requireDeposit, 
  blockScheduling, 
  whitelistEntity 
} from '@/lib/fraudService';
import { useFraudFlagActions } from '@/hooks/useFraudFlags';
import { toast } from 'sonner';

interface FraudFlagDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  flag: FraudFlag;
  onSuccess?: () => void;
}

export function FraudFlagDetailDialog({
  open,
  onOpenChange,
  flag,
  onSuccess,
}: FraudFlagDetailDialogProps) {
  const [notes, setNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeAction, setActiveAction] = useState<string | null>(null);

  const { actions, loading: actionsLoading } = useFraudFlagActions(flag.id);

  const getSeverityBadge = (severity: FraudSeverity) => {
    const variants: Record<FraudSeverity, string> = {
      high: 'bg-red-100 text-red-800 border-red-200',
      medium: 'bg-orange-100 text-orange-800 border-orange-200',
      low: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    };
    return <Badge className={variants[severity]}>{severity.toUpperCase()}</Badge>;
  };

  const getStatusBadge = (status: FraudStatus) => {
    const variants: Record<FraudStatus, string> = {
      open: 'bg-blue-100 text-blue-800',
      reviewing: 'bg-purple-100 text-purple-800',
      resolved: 'bg-green-100 text-green-800',
      blocked: 'bg-red-100 text-red-800',
    };
    return <Badge className={variants[status]}>{status}</Badge>;
  };

  const getFlagTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      velocity_phone: 'Velocity (Phone)',
      multi_address: 'Multiple Addresses',
      out_of_range: 'Out of Range',
      identity_mismatch: 'Identity Mismatch',
      high_risk_combo: 'High Risk Combo',
    };
    return labels[type] || type;
  };

  const handleAction = async (action: 'resolve' | 'deposit' | 'block' | 'whitelist') => {
    if (!notes.trim() && action !== 'whitelist') {
      toast.error('Please add notes before taking action');
      return;
    }

    setIsProcessing(true);
    setActiveAction(action);

    try {
      let result;
      switch (action) {
        case 'resolve':
          result = await resolveFraudFlag(flag.id, notes);
          break;
        case 'deposit':
          if (!flag.order_id) {
            toast.error('No order associated with this flag');
            return;
          }
          result = await requireDeposit(flag.id, flag.order_id, notes);
          break;
        case 'block':
          if (!flag.order_id) {
            toast.error('No order associated with this flag');
            return;
          }
          result = await blockScheduling(flag.id, flag.order_id, notes);
          break;
        case 'whitelist':
          result = await whitelistEntity(flag.id, notes || 'Whitelisted by staff');
          break;
      }

      if (result?.success) {
        toast.success('Action completed successfully');
        onSuccess?.();
      } else {
        toast.error(result?.error || 'Action failed');
      }
    } catch (err) {
      toast.error('Failed to perform action');
    } finally {
      setIsProcessing(false);
      setActiveAction(null);
    }
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
    });
  };

  const evidence = flag.evidence_json as Record<string, unknown> || {};

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" />
            Fraud Flag Details
          </DialogTitle>
          <DialogDescription>
            Review the flag details and take appropriate action
          </DialogDescription>
        </DialogHeader>

        <ScrollArea className="max-h-[60vh] pr-4">
          <div className="space-y-6">
            {/* Summary */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-muted-foreground">Severity</p>
                {getSeverityBadge(flag.severity)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Status</p>
                {getStatusBadge(flag.status)}
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Type</p>
                <p className="font-medium">{getFlagTypeLabel(flag.flag_type)}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Created</p>
                <p className="font-medium">{formatDate(flag.created_at)}</p>
              </div>
            </div>

            <Separator />

            {/* Details */}
            <div className="space-y-3">
              {flag.phone && (
                <div className="flex items-center gap-2 text-sm">
                  <Phone className="w-4 h-4 text-muted-foreground" />
                  <span className="font-mono">{flag.phone}</span>
                </div>
              )}
              <div className="flex items-start gap-2 text-sm">
                <AlertTriangle className="w-4 h-4 text-muted-foreground mt-0.5" />
                <span>{flag.reason}</span>
              </div>
            </div>

            {/* Evidence */}
            {Object.keys(evidence).length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Evidence</p>
                  <div className="bg-muted/50 rounded-lg p-3 text-sm font-mono overflow-x-auto">
                    <pre className="whitespace-pre-wrap text-xs">
                      {JSON.stringify(evidence, null, 2)}
                    </pre>
                  </div>
                </div>
              </>
            )}

            {/* Resolution info */}
            {flag.status === 'resolved' && flag.resolved_at && (
              <>
                <Separator />
                <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                  <p className="text-sm font-medium text-green-800 mb-1">Resolved</p>
                  <p className="text-xs text-green-700">{formatDate(flag.resolved_at)}</p>
                  {flag.resolved_notes && (
                    <p className="text-sm mt-2">{flag.resolved_notes}</p>
                  )}
                </div>
              </>
            )}

            {/* Actions history */}
            {actions.length > 0 && (
              <>
                <Separator />
                <div>
                  <p className="text-sm font-medium mb-2">Action History</p>
                  <div className="space-y-2">
                    {actions.map((action: any) => (
                      <div key={action.id} className="flex items-start gap-2 text-sm border-l-2 border-muted pl-3">
                        <Clock className="w-3 h-3 text-muted-foreground mt-1" />
                        <div>
                          <p className="font-medium capitalize">{action.action_type.replace('_', ' ')}</p>
                          {action.notes && <p className="text-muted-foreground">{action.notes}</p>}
                          <p className="text-xs text-muted-foreground">{formatDate(action.created_at)}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}

            {/* Action input (only for open flags) */}
            {flag.status === 'open' && (
              <>
                <Separator />
                <div className="space-y-2">
                  <Label>Notes / Resolution Reason</Label>
                  <Textarea
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="Add notes about your decision..."
                    rows={3}
                  />
                </div>
              </>
            )}
          </div>
        </ScrollArea>

        {flag.status === 'open' && (
          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="outline"
              onClick={() => handleAction('whitelist')}
              disabled={isProcessing}
            >
              {activeAction === 'whitelist' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <UserCheck className="w-4 h-4 mr-2" />
              Whitelist
            </Button>
            {flag.order_id && (
              <>
                <Button
                  variant="outline"
                  onClick={() => handleAction('deposit')}
                  disabled={isProcessing}
                >
                  {activeAction === 'deposit' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <DollarSign className="w-4 h-4 mr-2" />
                  Require Deposit
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => handleAction('block')}
                  disabled={isProcessing}
                >
                  {activeAction === 'block' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                  <Ban className="w-4 h-4 mr-2" />
                  Block
                </Button>
              </>
            )}
            <Button
              onClick={() => handleAction('resolve')}
              disabled={isProcessing}
            >
              {activeAction === 'resolve' && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              <CheckCircle className="w-4 h-4 mr-2" />
              Resolve
            </Button>
          </DialogFooter>
        )}
      </DialogContent>
    </Dialog>
  );
}
