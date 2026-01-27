import { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2, Video, Plus } from 'lucide-react';
import { googleService } from '@/services/googleService';
import { useToast } from '@/hooks/use-toast';

interface CreateMeetDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  entityType: string;
  entityId: string;
  defaultTitle?: string;
  defaultAttendees?: string[];
  onSuccess?: () => void;
}

export function CreateMeetDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  defaultTitle = '',
  defaultAttendees = [],
  onSuccess,
}: CreateMeetDialogProps) {
  const { toast } = useToast();
  const [isCreating, setIsCreating] = useState(false);
  const [title, setTitle] = useState(defaultTitle);
  const [description, setDescription] = useState('');
  const [attendees, setAttendees] = useState(defaultAttendees.join(', '));
  const [date, setDate] = useState(() => {
    const now = new Date();
    now.setMinutes(now.getMinutes() + 30);
    return now.toISOString().slice(0, 16);
  });
  const [duration, setDuration] = useState('30');

  async function handleCreate() {
    if (!title || !date) {
      toast({ title: 'Please fill in required fields', variant: 'destructive' });
      return;
    }

    setIsCreating(true);
    try {
      const startTime = new Date(date).toISOString();
      const endTime = new Date(new Date(date).getTime() + parseInt(duration) * 60000).toISOString();
      const attendeeList = attendees.split(',').map(e => e.trim()).filter(Boolean);

      const result = await googleService.createMeet({
        title,
        description: description || undefined,
        startTime,
        endTime,
        attendees: attendeeList.length > 0 ? attendeeList : undefined,
        entityType,
        entityId,
      });

      if (result.success) {
        toast({
          title: result.mode === 'DRY_RUN' ? 'Meet would be created (DRY_RUN)' : 'Meet Created',
          description: result.meetLink ? (
            <a href={result.meetLink} target="_blank" rel="noopener noreferrer" className="underline">
              Open Meet Link
            </a>
          ) : undefined,
        });
        onOpenChange(false);
        onSuccess?.();
        // Reset
        setTitle(defaultTitle);
        setDescription('');
        setAttendees(defaultAttendees.join(', '));
      } else {
        toast({ title: 'Failed to create Meet', description: result.error, variant: 'destructive' });
      }
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Video className="w-5 h-5" />
            Create Google Meet
          </DialogTitle>
          <DialogDescription>
            Schedule a Google Meet video call
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="space-y-2">
            <Label htmlFor="title">Meeting Title *</Label>
            <Input
              id="title"
              placeholder="Meeting title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description (optional)</Label>
            <Textarea
              id="description"
              placeholder="Meeting description..."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={3}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="date">Start Time *</Label>
              <Input
                id="date"
                type="datetime-local"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration (minutes)</Label>
              <select
                id="duration"
                value={duration}
                onChange={(e) => setDuration(e.target.value)}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="15">15 min</option>
                <option value="30">30 min</option>
                <option value="45">45 min</option>
                <option value="60">1 hour</option>
                <option value="90">1.5 hours</option>
                <option value="120">2 hours</option>
              </select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="attendees">Attendees (comma-separated emails)</Label>
            <Input
              id="attendees"
              placeholder="email1@example.com, email2@example.com"
              value={attendees}
              onChange={(e) => setAttendees(e.target.value)}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isCreating}>
            Cancel
          </Button>
          <Button onClick={handleCreate} disabled={isCreating || !title || !date}>
            {isCreating ? (
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            ) : (
              <Plus className="w-4 h-4 mr-2" />
            )}
            Create Meet
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
