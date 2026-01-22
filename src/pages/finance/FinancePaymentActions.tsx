import { useState, useEffect } from 'react';
import { 
  RotateCcw, Search, Filter, Loader2, RefreshCw,
  CheckCircle, XCircle, Clock, Eye, Play
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { createAuditLog } from '@/lib/auditLog';
import { ProcessActionDialog } from '@/components/finance/ProcessActionDialog';

interface PaymentAction {
  id: string;
  payment_id: string;
  order_id: string;
  invoice_id: string | null;
  action_type: string;
  amount: number;
  reason_code: string;
  reason_notes: string | null;
  status: string;
  provider_transaction_id: string | null;
  provider_refund_transaction_id: string | null;
  evidence_url: string | null;
  error_message: string | null;
  created_at: string;
}

const STATUS_OPTIONS = [
  { value: 'all', label: 'All Statuses' },
  { value: 'requested', label: 'Requested' },
  { value: 'approved', label: 'Approved' },
  { value: 'processing', label: 'Processing' },
  { value: 'completed', label: 'Completed' },
  { value: 'failed', label: 'Failed' },
  { value: 'canceled', label: 'Canceled' },
];

export default function FinancePaymentActions() {
  const [actions, setActions] = useState<PaymentAction[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedAction, setSelectedAction] = useState<PaymentAction | null>(null);
  const [showProcessDialog, setShowProcessDialog] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchActions();
  }, [statusFilter]);

  const fetchActions = async () => {
    setIsLoading(true);
    try {
      // Table just created, using explicit types
      let query = (supabase as any)
        .from('payment_actions')
        .select('*')
        .order('created_at', { ascending: false });

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error } = await query;

      if (error) throw error;
      setActions((data as PaymentAction[]) || []);
    } catch (error) {
      console.error('Failed to fetch actions:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleApprove = async (action: PaymentAction) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('Not authenticated');

      // Table just created, using explicit types
      const { error } = await (supabase as any)
        .from('payment_actions')
        .update({ 
          status: 'approved',
          approved_by: user.id,
        })
        .eq('id', action.id);

      if (error) throw error;

      await createAuditLog({
        action: 'update',
        entityType: 'approval_request',
        entityId: action.id,
        beforeData: { status: 'requested' },
        afterData: { status: 'approved', approved_by: user.id },
        changesSummary: `${action.action_type} of $${action.amount.toFixed(2)} approved`,
      });

      toast({ title: 'Action approved' });
      fetchActions();
    } catch (err) {
      console.error('Approval error:', err);
      toast({ title: 'Failed to approve', variant: 'destructive' });
    }
  };

  const handleCancel = async (action: PaymentAction) => {
    try {
      // Table just created, using explicit types
      const { error } = await (supabase as any)
        .from('payment_actions')
        .update({ status: 'canceled' })
        .eq('id', action.id);

      if (error) throw error;

      await createAuditLog({
        action: 'update',
        entityType: 'approval_request',
        entityId: action.id,
        beforeData: { status: action.status },
        afterData: { status: 'canceled' },
        changesSummary: `${action.action_type} request canceled`,
      });

      toast({ title: 'Action canceled' });
      fetchActions();
    } catch (err) {
      console.error('Cancel error:', err);
      toast({ title: 'Failed to cancel', variant: 'destructive' });
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const config: Record<string, { className: string; icon: React.ReactNode }> = {
      requested: { className: 'bg-yellow-100 text-yellow-800', icon: <Clock className="w-3 h-3 mr-1" /> },
      approved: { className: 'bg-blue-100 text-blue-800', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      processing: { className: 'bg-purple-100 text-purple-800', icon: <Loader2 className="w-3 h-3 mr-1 animate-spin" /> },
      completed: { className: 'bg-green-100 text-green-800', icon: <CheckCircle className="w-3 h-3 mr-1" /> },
      failed: { className: 'bg-red-100 text-red-800', icon: <XCircle className="w-3 h-3 mr-1" /> },
      canceled: { className: 'bg-muted text-muted-foreground', icon: <XCircle className="w-3 h-3 mr-1" /> },
    };
    const c = config[status] || { className: 'bg-muted', icon: null };
    return (
      <Badge className={c.className}>
        {c.icon}
        {status}
      </Badge>
    );
  };

  const filteredActions = actions.filter((action) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      action.id.toLowerCase().includes(search) ||
      action.order_id.toLowerCase().includes(search) ||
      action.reason_code.toLowerCase().includes(search)
    );
  });

  // Stats
  const pendingCount = actions.filter(a => a.status === 'requested' || a.status === 'approved').length;
  const completedCount = actions.filter(a => a.status === 'completed').length;
  const totalRefunded = actions
    .filter(a => a.status === 'completed')
    .reduce((sum, a) => sum + a.amount, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <RotateCcw className="w-6 h-6" />
            Refund/Void Actions
          </h1>
          <p className="text-muted-foreground">Manage refund and void requests</p>
        </div>
        <Button variant="outline" onClick={fetchActions} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-yellow-600">{pendingCount}</p>
              <p className="text-sm text-muted-foreground">Pending Review</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-green-600">{completedCount}</p>
              <p className="text-sm text-muted-foreground">Completed</p>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-2xl font-bold text-primary">{formatCurrency(totalRefunded)}</p>
              <p className="text-sm text-muted-foreground">Total Refunded</p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by ID, order, or reason..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                {STATUS_OPTIONS.map((opt) => (
                  <SelectItem key={opt.value} value={opt.value}>
                    {opt.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Actions Table */}
      <Card>
        <CardHeader>
          <CardTitle>Actions ({filteredActions.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredActions.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No actions found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Reason</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredActions.map((action) => (
                    <tr key={action.id} className="border-b last:border-b-0 hover:bg-muted/50">
                      <td className="py-3 px-2 text-sm">
                        {new Date(action.created_at).toLocaleDateString()}
                        <br />
                        <span className="text-xs text-muted-foreground">
                          {new Date(action.created_at).toLocaleTimeString()}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <Badge variant="outline" className="capitalize">
                          {action.action_type}
                        </Badge>
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {formatCurrency(action.amount)}
                      </td>
                      <td className="py-3 px-2 text-sm">
                        <span className="capitalize">{action.reason_code.replace('_', ' ')}</span>
                        {action.error_message && (
                          <p className="text-xs text-red-600 mt-1">{action.error_message}</p>
                        )}
                      </td>
                      <td className="py-3 px-2">
                        {getStatusBadge(action.status)}
                      </td>
                      <td className="py-3 px-2">
                        <div className="flex gap-1">
                          <Button variant="ghost" size="icon" asChild>
                            <Link to={`/finance/payments/${action.payment_id}`}>
                              <Eye className="w-4 h-4" />
                            </Link>
                          </Button>
                          
                          {action.status === 'requested' && (
                            <>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-green-600 hover:text-green-700"
                                onClick={() => handleApprove(action)}
                              >
                                <CheckCircle className="w-4 h-4" />
                              </Button>
                              <Button 
                                variant="ghost" 
                                size="icon"
                                className="text-red-600 hover:text-red-700"
                                onClick={() => handleCancel(action)}
                              >
                                <XCircle className="w-4 h-4" />
                              </Button>
                            </>
                          )}
                          
                          {action.status === 'approved' && (
                            <Button 
                              variant="ghost" 
                              size="icon"
                              className="text-primary"
                              onClick={() => {
                                setSelectedAction(action);
                                setShowProcessDialog(true);
                              }}
                            >
                              <Play className="w-4 h-4" />
                            </Button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Process Dialog */}
      {selectedAction && (
        <ProcessActionDialog
          open={showProcessDialog}
          onOpenChange={setShowProcessDialog}
          action={selectedAction}
          onSuccess={fetchActions}
        />
      )}
    </div>
  );
}
