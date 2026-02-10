import { useState } from 'react';
import { UserPlus, Mail, Loader2, Send, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';

const INVITE_ROLES = [
  { value: 'sales', label: 'Sales' },
  { value: 'dispatcher', label: 'Dispatch' },
  { value: 'finance', label: 'Finance' },
  { value: 'driver', label: 'Driver' },
  { value: 'owner_operator', label: 'Owner Operator' },
  { value: 'ops_admin', label: 'Ops Admin' },
  { value: 'admin', label: 'Admin' },
];

interface StaffInviteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess?: () => void;
}

export function StaffInviteDialog({ open, onOpenChange, onSuccess }: StaffInviteDialogProps) {
  const { toast } = useToast();
  const [email, setEmail] = useState('');
  const [fullName, setFullName] = useState('');
  const [role, setRole] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [sent, setSent] = useState(false);

  const handleInvite = async () => {
    if (!email || !role) {
      toast({ title: 'Email and role are required', variant: 'destructive' });
      return;
    }

    setIsSubmitting(true);

    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error('Not authenticated');

      const response = await supabase.functions.invoke('invite-staff', {
        body: { email, role, full_name: fullName },
      });

      if (response.error) throw response.error;

      setSent(true);
      toast({ title: 'Invite Sent', description: `Temporary password sent to ${email}` });
      onSuccess?.();
    } catch (error: any) {
      console.error('Invite error:', error);
      toast({
        title: 'Invite Failed',
        description: error.message || 'Could not send invite',
        variant: 'destructive',
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleClose = () => {
    setEmail('');
    setFullName('');
    setRole('');
    setSent(false);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <UserPlus className="w-5 h-5" />
            Invite Staff Member
          </DialogTitle>
          <DialogDescription>
            Send a temporary password via email. User must change it on first login.
          </DialogDescription>
        </DialogHeader>

        {sent ? (
          <div className="text-center py-6">
            <CheckCircle className="w-12 h-12 text-green-500 mx-auto mb-3" />
            <p className="text-lg font-semibold text-foreground">Invite Sent!</p>
            <p className="text-sm text-muted-foreground mt-1">
              A temporary password has been emailed to <strong>{email}</strong>.
            </p>
            <p className="text-xs text-muted-foreground mt-2">
              Password expires in 24 hours. User must reset on first login.
            </p>
            <Button className="mt-4" onClick={handleClose}>Done</Button>
          </div>
        ) : (
          <>
            <div className="space-y-4">
              <div>
                <Label htmlFor="invite-name">Full Name</Label>
                <Input
                  id="invite-name"
                  placeholder="John Doe"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                />
              </div>

              <div>
                <Label htmlFor="invite-email">Email *</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    id="invite-email"
                    type="email"
                    placeholder="staff@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="invite-role">Role *</Label>
                <Select value={role} onValueChange={setRole}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select role" />
                  </SelectTrigger>
                  <SelectContent>
                    {INVITE_ROLES.map((r) => (
                      <SelectItem key={r.value} value={r.value}>
                        {r.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={handleClose}>Cancel</Button>
              <Button onClick={handleInvite} disabled={isSubmitting}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin mr-2" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send Invite
                  </>
                )}
              </Button>
            </DialogFooter>
          </>
        )}
      </DialogContent>
    </Dialog>
  );
}
