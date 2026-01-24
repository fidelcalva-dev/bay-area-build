import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { 
  CheckCircle, XCircle, Clock, DollarSign, RefreshCw, 
  Loader2, AlertTriangle, FileCheck
} from 'lucide-react';
import { format } from 'date-fns';

interface RequestedValue {
  asset_id?: string;
  asset_code?: string;
  billable_days?: number;
  amount?: number;
  daily_rate?: number;
  customer_name?: string;
}

interface ApprovalRequest {
  id: string;
  request_type: string;
  entity_type: string;
  entity_id: string;
  requested_by: string;
  requested_value: RequestedValue;
  reason: string | null;
  status: string;
  reviewed_by: string | null;
  reviewed_at: string | null;
  review_notes: string | null;
  created_at: string;
}

export default function ApprovalQueuePage() {
  const { toast } = useToast();
  const [approvals, setApprovals] = useState<ApprovalRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedApproval, setSelectedApproval] = useState<ApprovalRequest | null>(null);
  const [reviewNotes, setReviewNotes] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [filter, setFilter] = useState<'pending' | 'all'>('pending');

  useEffect(() => {
    fetchApprovals();
  }, [filter]);

  async function fetchApprovals() {
    setIsLoading(true);
    try {
      let query = supabase
        .from('approval_requests')
        .select('*')
        .order('created_at', { ascending: false });

      if (filter === 'pending') {
        query = query.eq('status', 'pending');
      }

      const { data, error } = await query.limit(100);

      if (error) throw error;
      setApprovals((data || []) as unknown as ApprovalRequest[]);
    } catch (err) {
      console.error('Error fetching approvals:', err);
      toast({ title: 'Error', description: 'Failed to load approvals', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleApprove(approval: ApprovalRequest) {
    setIsProcessing(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      const value = approval.requested_value;

      // Create invoice line item for overdue billing
      if (approval.request_type === 'overdue_billing' && value.amount && value.billable_days) {
        // Get invoice for order
        const { data: invoice } = await supabase
          .from('invoices')
          .select('id')
          .eq('order_id', approval.entity_id)
          .single();

        let invoiceId = invoice?.id;

        // Create invoice if none exists
        if (!invoiceId) {
          const { data: newInvoice, error: invoiceError } = await supabase
            .from('invoices')
            .insert({
              order_id: approval.entity_id,
              invoice_number: `INV-OD-${Date.now()}`,
              amount_due: value.amount,
              amount_paid: 0,
              balance_due: value.amount,
              payment_status: 'pending',
              due_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
              notes: 'Overdue rental charges (approved)',
            })
            .select('id')
            .single();

          if (invoiceError) throw invoiceError;
          invoiceId = newInvoice.id;
        }

        // Create line item
        await supabase.from('invoice_line_items').insert({
          invoice_id: invoiceId,
          order_id: approval.entity_id,
          line_type: 'overdue_rental',
          description: `Overdue rental: ${value.billable_days} day(s) @ $${value.daily_rate}/day (Approved)`,
          quantity: value.billable_days,
          unit_price: value.daily_rate || 35,
          amount: value.amount,
          metadata: {
            asset_id: value.asset_id,
            asset_code: value.asset_code,
            approved_at: new Date().toISOString(),
            approved_by: userId,
          },
        });

        // Get messaging mode
        const { data: modeConfig } = await supabase
          .from('config_settings')
          .select('value')
          .eq('category', 'messaging')
          .eq('key', 'mode')
          .single();

        const mode = String(modeConfig?.value || 'DRY_RUN').replace(/"/g, '');

        // Create notification message
        await supabase.from('message_history').insert({
          order_id: approval.entity_id,
          direction: 'outbound',
          channel: 'sms',
          template_key: 'OVERDUE_NOTICE_1',
          message_body: `Hi ${value.customer_name || 'Customer'}, your dumpster rental overdue charges of $${value.amount} have been processed. Please reply to schedule pickup or extend rental. Thank you - Calsan Dumpsters`,
          status: mode === 'LIVE' ? 'pending' : 'dry_run',
          mode: mode,
        });

        // Update billing state
        if (value.asset_id) {
          await supabase.from('overdue_billing_state').upsert(
            {
              asset_id: value.asset_id,
              order_id: approval.entity_id,
              billed_overdue_days_total: value.billable_days,
              last_billed_at: new Date().toISOString(),
            },
            { onConflict: 'asset_id,order_id' }
          );
        }
      }

      // Update approval status
      const { error: updateError } = await supabase
        .from('approval_requests')
        .update({
          status: 'approved',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes || null,
        })
        .eq('id', approval.id);

      if (updateError) throw updateError;

      toast({ title: 'Approved', description: 'Request approved and processed' });
      setSelectedApproval(null);
      setReviewNotes('');
      fetchApprovals();
    } catch (err) {
      console.error('Error approving:', err);
      toast({ title: 'Error', description: 'Failed to approve request', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }

  async function handleDeny(approval: ApprovalRequest) {
    if (!reviewNotes.trim()) {
      toast({ title: 'Notes Required', description: 'Please provide a reason for denial', variant: 'destructive' });
      return;
    }

    setIsProcessing(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;

      const { error } = await supabase
        .from('approval_requests')
        .update({
          status: 'denied',
          reviewed_by: userId,
          reviewed_at: new Date().toISOString(),
          review_notes: reviewNotes,
        })
        .eq('id', approval.id);

      if (error) throw error;

      toast({ title: 'Denied', description: 'Request has been denied' });
      setSelectedApproval(null);
      setReviewNotes('');
      fetchApprovals();
    } catch (err) {
      console.error('Error denying:', err);
      toast({ title: 'Error', description: 'Failed to deny request', variant: 'destructive' });
    } finally {
      setIsProcessing(false);
    }
  }

  const pendingCount = approvals.filter(a => a.status === 'pending').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-96">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Approval Queue</h1>
          <p className="text-muted-foreground">
            Review and approve billing requests that exceed auto-bill limits
          </p>
        </div>
        <div className="flex gap-2">
          <Button 
            variant={filter === 'pending' ? 'default' : 'outline'} 
            onClick={() => setFilter('pending')}
          >
            Pending ({pendingCount})
          </Button>
          <Button 
            variant={filter === 'all' ? 'default' : 'outline'} 
            onClick={() => setFilter('all')}
          >
            All
          </Button>
          <Button variant="outline" onClick={fetchApprovals}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Approvals</CardDescription>
            <CardTitle className="text-2xl flex items-center gap-2">
              <Clock className="w-5 h-5 text-amber-500" />
              {pendingCount}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Pending Amount</CardDescription>
            <CardTitle className="text-2xl text-green-600">
              ${approvals
                .filter(a => a.status === 'pending')
                .reduce((sum, a) => sum + (a.requested_value?.amount || 0), 0)
                .toFixed(2)}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardDescription>Oldest Pending</CardDescription>
            <CardTitle className="text-lg">
              {pendingCount > 0 
                ? format(new Date(approvals.filter(a => a.status === 'pending').slice(-1)[0]?.created_at), 'MMM d, h:mm a')
                : 'None'}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Approvals Table */}
      <Card>
        <CardHeader>
          <CardTitle>Approval Requests</CardTitle>
          <CardDescription>Overdue billing and other requests requiring approval</CardDescription>
        </CardHeader>
        <CardContent>
          {approvals.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <FileCheck className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>No {filter === 'pending' ? 'pending ' : ''}approvals</p>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Details</TableHead>
                  <TableHead>Reason</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {approvals.map((approval) => (
                  <TableRow key={approval.id}>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {approval.request_type.replace(/_/g, ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <div className="font-medium">{approval.requested_value?.asset_code || approval.entity_id.slice(0, 8)}</div>
                      <div className="text-xs text-muted-foreground">
                        {approval.requested_value?.customer_name || 'Unknown customer'}
                      </div>
                      {approval.requested_value?.billable_days && (
                        <div className="text-xs text-muted-foreground">
                          {approval.requested_value.billable_days} days @ ${approval.requested_value.daily_rate}/day
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="max-w-xs truncate">
                      {approval.reason}
                    </TableCell>
                    <TableCell className="text-right font-medium">
                      ${(approval.requested_value?.amount || 0).toFixed(2)}
                    </TableCell>
                    <TableCell>
                      <Badge 
                        variant={
                          approval.status === 'approved' ? 'default' : 
                          approval.status === 'denied' ? 'destructive' : 
                          'secondary'
                        }
                      >
                        {approval.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-sm text-muted-foreground">
                      {format(new Date(approval.created_at), 'MMM d, h:mm a')}
                    </TableCell>
                    <TableCell>
                      {approval.status === 'pending' && (
                        <Button 
                          size="sm" 
                          onClick={() => setSelectedApproval(approval)}
                        >
                          Review
                        </Button>
                      )}
                      {approval.status !== 'pending' && approval.review_notes && (
                        <span className="text-xs text-muted-foreground">
                          {approval.review_notes.slice(0, 30)}...
                        </span>
                      )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      {/* Review Dialog */}
      <Dialog open={!!selectedApproval} onOpenChange={() => setSelectedApproval(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Review Approval Request</DialogTitle>
            <DialogDescription>
              {selectedApproval?.request_type.replace(/_/g, ' ')} for {selectedApproval?.requested_value?.asset_code || selectedApproval?.entity_id.slice(0, 8)}
            </DialogDescription>
          </DialogHeader>

          {selectedApproval && (
            <div className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Customer</span>
                  <span className="font-medium">{selectedApproval.requested_value?.customer_name || 'Unknown'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Asset</span>
                  <span className="font-medium">{selectedApproval.requested_value?.asset_code || 'N/A'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Billable Days</span>
                  <span className="font-medium">{selectedApproval.requested_value?.billable_days || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-muted-foreground">Rate</span>
                  <span className="font-medium">${selectedApproval.requested_value?.daily_rate || 35}/day</span>
                </div>
                <div className="flex justify-between border-t pt-2">
                  <span className="font-medium">Total Amount</span>
                  <span className="font-bold text-lg">${(selectedApproval.requested_value?.amount || 0).toFixed(2)}</span>
                </div>
              </div>

              {selectedApproval.reason && (
                <div className="bg-amber-50 dark:bg-amber-950/20 p-3 rounded-lg flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0" />
                  <p className="text-sm">{selectedApproval.reason}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium mb-2 block">Review Notes</label>
                <Textarea
                  placeholder="Add notes (required for denial)"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setSelectedApproval(null)}>
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={() => selectedApproval && handleDeny(selectedApproval)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <XCircle className="w-4 h-4 mr-2" />}
              Deny
            </Button>
            <Button 
              onClick={() => selectedApproval && handleApprove(selectedApproval)}
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <CheckCircle className="w-4 h-4 mr-2" />}
              Approve & Bill
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
