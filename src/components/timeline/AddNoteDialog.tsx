import { useState } from 'react';
import { StickyNote, Loader2 } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { useToast } from '@/hooks/use-toast';
import { addTimelineNote, type TimelineEntityType, type TimelineVisibility } from '@/lib/timelineService';

interface AddNoteDialogProps {
  entityType: TimelineEntityType;
  entityId: string;
  customerId?: string;
  orderId?: string;
  onNoteAdded?: () => void;
}

export function AddNoteDialog({
  entityType,
  entityId,
  customerId,
  orderId,
  onNoteAdded,
}: AddNoteDialogProps) {
  const [open, setOpen] = useState(false);
  const [note, setNote] = useState('');
  const [isCustomerVisible, setIsCustomerVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async () => {
    if (!note.trim()) {
      toast({
        title: 'Note required',
        description: 'Please enter a note.',
        variant: 'destructive',
      });
      return;
    }

    setIsSubmitting(true);
    const result = await addTimelineNote({
      entityType,
      entityId,
      note: note.trim(),
      customerId,
      orderId,
      visibility: isCustomerVisible ? 'CUSTOMER' : 'INTERNAL' as TimelineVisibility,
    });

    setIsSubmitting(false);

    if (result.success) {
      toast({
        title: 'Note added',
        description: 'Your note has been added to the timeline.',
      });
      setNote('');
      setIsCustomerVisible(false);
      setOpen(false);
      onNoteAdded?.();
    } else {
      toast({
        title: 'Failed to add note',
        description: result.error || 'Please try again.',
        variant: 'destructive',
      });
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm">
          <StickyNote className="w-4 h-4 mr-2" />
          Add Note
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Add Internal Note</DialogTitle>
          <DialogDescription>
            Add a note to the timeline. Notes are visible to staff by default.
          </DialogDescription>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Enter your note..."
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={4}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="customer-visible">Customer visible</Label>
              <p className="text-xs text-muted-foreground">
                Show this note in the customer portal
              </p>
            </div>
            <Switch
              id="customer-visible"
              checked={isCustomerVisible}
              onCheckedChange={setIsCustomerVisible}
            />
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => setOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleSubmit} disabled={isSubmitting}>
            {isSubmitting && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
            Add Note
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
