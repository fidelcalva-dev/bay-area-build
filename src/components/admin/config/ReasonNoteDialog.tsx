import { useState } from 'react';
import { FileText, AlertTriangle } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Alert, AlertDescription } from '@/components/ui/alert';

interface ReasonNoteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (reasonNote: string) => void;
  title?: string;
  description?: string;
  isCritical?: boolean;
  requiresApproval?: boolean;
  isLoading?: boolean;
}

export function ReasonNoteDialog({
  open,
  onOpenChange,
  onConfirm,
  title = 'Save Changes',
  description = 'Please provide a reason for this change. This will be recorded in the audit log.',
  isCritical = false,
  requiresApproval = false,
  isLoading = false,
}: ReasonNoteDialogProps) {
  const [reasonNote, setReasonNote] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reasonNote.trim()) {
      setError('Reason note is required');
      return;
    }
    if (reasonNote.trim().length < 10) {
      setError('Please provide a more detailed reason (at least 10 characters)');
      return;
    }
    onConfirm(reasonNote.trim());
    setReasonNote('');
    setError('');
  };

  const handleClose = () => {
    setReasonNote('');
    setError('');
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            {title}
          </DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          {isCritical && (
            <Alert variant="destructive">
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This is a critical configuration change that affects pricing or operations.
              </AlertDescription>
            </Alert>
          )}

          {requiresApproval && (
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                This change requires approval from a system administrator before it takes effect.
              </AlertDescription>
            </Alert>
          )}

          <div className="space-y-2">
            <Label htmlFor="reason-note">
              Reason for Change <span className="text-destructive">*</span>
            </Label>
            <Textarea
              id="reason-note"
              placeholder="Describe why this change is being made..."
              value={reasonNote}
              onChange={(e) => {
                setReasonNote(e.target.value);
                setError('');
              }}
              className={error ? 'border-destructive' : ''}
              rows={4}
            />
            {error && <p className="text-sm text-destructive">{error}</p>}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={handleClose} disabled={isLoading}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={isLoading}>
            {isLoading ? 'Saving...' : requiresApproval ? 'Submit for Approval' : 'Save Changes'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
