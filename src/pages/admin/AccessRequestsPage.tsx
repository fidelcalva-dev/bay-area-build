import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useToast } from '@/hooks/use-toast';
import { Loader2, CheckCircle, XCircle, Clock, UserCog } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { format } from 'date-fns';

const ASSIGNABLE_ROLES = [
  { value: 'sales', label: 'Sales' },
  { value: 'dispatcher', label: 'Dispatch' },
  { value: 'finance', label: 'Finance' },
  { value: 'driver', label: 'Driver' },
  { value: 'owner_operator', label: 'Owner Operator' },
  { value: 'admin', label: 'Admin' },
];

interface AccessRequest {
  id: string;
  user_id: string;
  email: string;
  requested_role: string | null;
  status: string;
  notes: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by_user_id: string | null;
}

export default function AccessRequestsPage() {
  const { user } = useAdminAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [selectedRole, setSelectedRole] = useState<Record<string, string>>({});
  const [rejectNotes, setRejectNotes] = useState('');
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [confirmAdminId, setConfirmAdminId] = useState<string | null>(null);

  const { data: requests, isLoading } = useQuery({
    queryKey: ['access-requests'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('access_requests')
        .select('*')
        .order('created_at', { ascending: false });
      if (error) throw error;
      return data as AccessRequest[];
    },
  });

  const approveMutation = useMutation({
    mutationFn: async ({ requestId, userId, email, role }: {
      requestId: string; userId: string; email: string; role: string;
    }) => {
      // 1. Upsert user_roles
      const { error: roleError } = await supabase
        .from('user_roles')
        .upsert(
          { user_id: userId, role: role as any },
          { onConflict: 'user_id,role' }
        );
      if (roleError) throw roleError;

      // 2. Update access_requests
      const { error: reqError } = await supabase
        .from('access_requests')
        .update({
          status: 'APPROVED',
          resolved_at: new Date().toISOString(),
          resolved_by_user_id: user?.id,
        })
        .eq('id', requestId);
      if (reqError) throw reqError;

      // 3. Insert audit log
      const { error: auditError } = await supabase
        .from('role_assignments_audit')
        .insert({
          target_user_id: userId,
          target_email: email,
          assigned_role: role,
          assigned_by_user_id: user!.id,
          assigned_by_email: user!.email,
          source: 'ACCESS_REQUEST',
        });
      if (auditError) throw auditError;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      toast({ title: 'Approved', description: 'Role assigned successfully.' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error', description: err.message, variant: 'destructive' });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: async ({ requestId, notes }: { requestId: string; notes: string }) => {
      const { error } = await supabase
        .from('access_requests')
        .update({
          status: 'REJECTED',
          notes,
          resolved_at: new Date().toISOString(),
          resolved_by_user_id: user?.id,
        })
        .eq('id', requestId);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['access-requests'] });
      setRejectingId(null);
      setRejectNotes('');
      toast({ title: 'Rejected', description: 'Access request rejected.' });
    },
  });

  const handleApprove = (req: AccessRequest) => {
    const role = selectedRole[req.id];
    if (!role) {
      toast({ title: 'Select a role', description: 'Choose a role before approving.', variant: 'destructive' });
      return;
    }
    if (role === 'admin') {
      setConfirmAdminId(req.id);
      return;
    }
    approveMutation.mutate({ requestId: req.id, userId: req.user_id, email: req.email, role });
  };

  const confirmAdminApprove = () => {
    if (!confirmAdminId) return;
    const req = requests?.find(r => r.id === confirmAdminId);
    if (!req) return;
    const role = selectedRole[req.id];
    approveMutation.mutate({ requestId: req.id, userId: req.user_id, email: req.email, role });
    setConfirmAdminId(null);
  };

  const statusBadge = (status: string) => {
    switch (status) {
      case 'OPEN': return <Badge variant="outline" className="gap-1"><Clock className="w-3 h-3" /> Pending</Badge>;
      case 'APPROVED': return <Badge className="gap-1 bg-primary"><CheckCircle className="w-3 h-3" /> Approved</Badge>;
      case 'REJECTED': return <Badge variant="destructive" className="gap-1"><XCircle className="w-3 h-3" /> Rejected</Badge>;
      default: return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const openRequests = requests?.filter(r => r.status === 'OPEN') || [];
  const closedRequests = requests?.filter(r => r.status !== 'OPEN') || [];

  return (
    <div className="p-6 space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center">
          <UserCog className="w-5 h-5 text-primary" />
        </div>
        <div>
          <h1 className="text-2xl font-bold text-foreground">Access Requests</h1>
          <p className="text-sm text-muted-foreground">Review and assign roles to new users</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : (
        <>
          {/* Open Requests */}
          <div className="space-y-2">
            <h2 className="text-lg font-semibold text-foreground">
              Pending Requests ({openRequests.length})
            </h2>
            {openRequests.length === 0 ? (
              <p className="text-sm text-muted-foreground py-4">No pending access requests.</p>
            ) : (
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Requested</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Assign Role</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {openRequests.map(req => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.email}</TableCell>
                        <TableCell>{req.requested_role || '--'}</TableCell>
                        <TableCell className="text-muted-foreground text-sm">
                          {format(new Date(req.created_at), 'MMM d, yyyy HH:mm')}
                        </TableCell>
                        <TableCell>
                          <Select
                            value={selectedRole[req.id] || ''}
                            onValueChange={(v) => setSelectedRole(prev => ({ ...prev, [req.id]: v }))}
                          >
                            <SelectTrigger className="w-40">
                              <SelectValue placeholder="Select role" />
                            </SelectTrigger>
                            <SelectContent>
                              {ASSIGNABLE_ROLES.map(r => (
                                <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          <div className="flex gap-2">
                            <Button
                              size="sm"
                              onClick={() => handleApprove(req)}
                              disabled={approveMutation.isPending}
                            >
                              {approveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : 'Approve'}
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              onClick={() => setRejectingId(req.id)}
                            >
                              Reject
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>

          {/* History */}
          {closedRequests.length > 0 && (
            <div className="space-y-2">
              <h2 className="text-lg font-semibold text-foreground">History</h2>
              <div className="border rounded-lg">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Notes</TableHead>
                      <TableHead>Resolved</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {closedRequests.map(req => (
                      <TableRow key={req.id}>
                        <TableCell className="font-medium">{req.email}</TableCell>
                        <TableCell>{statusBadge(req.status)}</TableCell>
                        <TableCell className="text-sm text-muted-foreground max-w-xs truncate">
                          {req.notes || '--'}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {req.resolved_at ? format(new Date(req.resolved_at), 'MMM d, yyyy HH:mm') : '--'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
        </>
      )}

      {/* Reject Dialog */}
      <AlertDialog open={!!rejectingId} onOpenChange={() => setRejectingId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Reject Access Request</AlertDialogTitle>
            <AlertDialogDescription>
              Provide a reason for rejecting this request (optional).
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rejection..."
            value={rejectNotes}
            onChange={(e) => setRejectNotes(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={() => rejectingId && rejectMutation.mutate({ requestId: rejectingId, notes: rejectNotes })}
            >
              Reject
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Admin Confirmation Dialog */}
      <AlertDialog open={!!confirmAdminId} onOpenChange={() => setConfirmAdminId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Admin Role Assignment</AlertDialogTitle>
            <AlertDialogDescription>
              Assigning the admin role grants full access to all system features, configuration, and user management. This action is logged in the audit trail.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={confirmAdminApprove}>
              Confirm Admin Assignment
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
