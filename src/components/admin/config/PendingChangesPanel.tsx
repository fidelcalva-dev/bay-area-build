import { useState, useEffect } from 'react';
import { Clock, CheckCircle, XCircle, User, ChevronRight } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { 
  getPendingChanges, 
  approvePendingChange, 
  rejectPendingChange,
  type PendingChange 
} from '@/lib/configVersioning';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';

interface PendingChangesPanelProps {
  module?: string;
  onChangeApplied?: () => void;
}

export function PendingChangesPanel({ module, onChangeApplied }: PendingChangesPanelProps) {
  const [changes, setChanges] = useState<PendingChange[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedChange, setSelectedChange] = useState<PendingChange | null>(null);
  const [reviewNote, setReviewNote] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const { toast } = useToast();
  const { isSystemAdmin } = useAdminPermissions();

  useEffect(() => {
    loadChanges();
  }, [module]);

  async function loadChanges() {
    setIsLoading(true);
    const pending = await getPendingChanges(module);
    setChanges(pending);
    setIsLoading(false);
  }

  async function handleApprove() {
    if (!selectedChange) return;

    setIsProcessing(true);
    const result = await approvePendingChange(selectedChange.id, reviewNote);
    setIsProcessing(false);

    if (result.success) {
      toast({ title: 'Change approved', description: 'The configuration change has been approved.' });
      setSelectedChange(null);
      setReviewNote('');
      loadChanges();
      onChangeApplied?.();
    } else {
      toast({ title: 'Approval failed', description: result.error, variant: 'destructive' });
    }
  }

  async function handleReject() {
    if (!selectedChange || !reviewNote.trim()) {
      toast({ title: 'Reason required', description: 'Please provide a reason for rejection.', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    const result = await rejectPendingChange(selectedChange.id, reviewNote);
    setIsProcessing(false);

    if (result.success) {
      toast({ title: 'Change rejected', description: 'The configuration change has been rejected.' });
      setSelectedChange(null);
      setReviewNote('');
      loadChanges();
    } else {
      toast({ title: 'Rejection failed', description: result.error, variant: 'destructive' });
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-8 text-center text-muted-foreground">
          Loading pending changes...
        </CardContent>
      </Card>
    );
  }

  if (changes.length === 0) {
    return null;
  }

  return (
    <>
      <Card className="border-amber-200 bg-amber-50/50">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Clock className="w-5 h-5 text-amber-600" />
            <div>
              <CardTitle className="text-base text-amber-800">
                Pending Changes ({changes.length})
              </CardTitle>
              <CardDescription className="text-amber-700">
                Changes awaiting approval from a system administrator
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {changes.map((change) => (
              <div
                key={change.id}
                className="bg-white border rounded-lg p-3 flex items-center justify-between"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-1">
                    <Badge variant="secondary">{change.module}</Badge>
                    <Badge variant="outline">{change.entityType}</Badge>
                  </div>
                  <p className="text-sm">{change.reasonNote}</p>
                  <div className="flex items-center gap-3 mt-2 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <User className="w-3 h-3" />
                      {change.proposedByEmail}
                    </span>
                    <span>
                      {format(new Date(change.createdAt), 'MMM d, h:mm a')}
                    </span>
                    <span className="text-amber-600">
                      Expires {format(new Date(change.expiresAt), 'MMM d')}
                    </span>
                  </div>
                </div>

                {isSystemAdmin() && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setSelectedChange(change)}
                  >
                    Review
                    <ChevronRight className="w-4 h-4 ml-1" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Dialog open={!!selectedChange} onOpenChange={() => setSelectedChange(null)}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Review Configuration Change</DialogTitle>
            <DialogDescription>
              Review the proposed changes and approve or reject them.
            </DialogDescription>
          </DialogHeader>

          {selectedChange && (
            <div className="space-y-4">
              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Current Value</p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                    {JSON.stringify(selectedChange.currentData, null, 2) || 'N/A'}
                  </pre>
                </div>
                <div>
                  <p className="text-sm font-medium text-muted-foreground mb-2">Proposed Value</p>
                  <pre className="text-xs bg-muted p-3 rounded overflow-auto max-h-48">
                    {JSON.stringify(selectedChange.proposedData, null, 2)}
                  </pre>
                </div>
              </div>

              <div className="bg-muted/50 p-3 rounded">
                <p className="text-sm">
                  <span className="font-medium">Reason:</span> {selectedChange.reasonNote}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  Proposed by {selectedChange.proposedByEmail} on{' '}
                  {format(new Date(selectedChange.createdAt), 'MMMM d, yyyy')}
                </p>
              </div>

              <div>
                <p className="text-sm font-medium mb-2">Review Note (required for rejection)</p>
                <Textarea
                  placeholder="Add a note about your decision..."
                  value={reviewNote}
                  onChange={(e) => setReviewNote(e.target.value)}
                />
              </div>
            </div>
          )}

          <DialogFooter className="gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={isProcessing}
            >
              <XCircle className="w-4 h-4 mr-2" />
              Reject
            </Button>
            <Button
              onClick={handleApprove}
              disabled={isProcessing}
            >
              <CheckCircle className="w-4 h-4 mr-2" />
              Approve & Apply
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
