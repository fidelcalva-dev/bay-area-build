import { useEffect, useState } from 'react';
import { Loader2, Search, CheckCircle2, XCircle, Clock, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { format } from 'date-fns';
import { createAuditLog } from '@/lib/auditLog';

interface ServiceRequest {
  id: string;
  order_id: string;
  request_type: string;
  status: string;
  priority: string;
  notes: string | null;
  preferred_date: string | null;
  preferred_window: string | null;
  resolution_notes: string | null;
  created_at: string;
  orders?: {
    quotes?: {
      customer_name: string | null;
      customer_phone: string | null;
      delivery_address: string | null;
    };
  };
}

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  in_progress: { label: 'In Progress', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-800' },
  completed: { label: 'Completed', color: 'bg-gray-100 text-gray-800' },
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  pickup: 'Pickup Request',
  schedule_change: 'Schedule Change',
  extension: 'Rental Extension',
  swap: 'Container Swap',
  issue: 'Report Issue',
};

export default function CSRequests() {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequest | null>(null);
  const [resolutionNotes, setResolutionNotes] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchRequests();
  }, []);

  async function fetchRequests() {
    const { data, error } = await supabase
      .from('service_requests')
      .select(`
        *,
        orders (
          quotes (
            customer_name,
            customer_phone,
            delivery_address
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (error) {
      toast({ title: 'Error loading requests', description: error.message, variant: 'destructive' });
    } else {
      setRequests(data || []);
    }
    setIsLoading(false);
  }

  async function handleResolve(status: 'approved' | 'denied') {
    if (!selectedRequest) return;
    setIsSubmitting(true);

    const { error } = await supabase
      .from('service_requests')
      .update({
        status,
        resolution_notes: resolutionNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', selectedRequest.id);

    if (error) {
      toast({ title: 'Error updating request', description: error.message, variant: 'destructive' });
    } else {
      await createAuditLog({
        action: 'status_change',
        entityType: 'service_request',
        entityId: selectedRequest.id,
        beforeData: { status: selectedRequest.status },
        afterData: { status, resolution_notes: resolutionNotes },
        changesSummary: `Request ${status}: ${resolutionNotes || 'No notes'}`,
      });

      toast({ title: `Request ${status}` });
      setSelectedRequest(null);
      setResolutionNotes('');
      fetchRequests();
    }
    setIsSubmitting(false);
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.orders?.quotes?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.orders?.quotes?.customer_phone?.includes(searchTerm) ||
      req.order_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Service Requests</h1>
        <p className="text-muted-foreground mt-1">
          Manage pickup requests, schedule changes, and customer issues
        </p>
      </div>

      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, or order ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="in_progress">In Progress</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer</TableHead>
              <TableHead>Request Type</TableHead>
              <TableHead>Preferred Date</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Created</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((req) => (
              <TableRow key={req.id}>
                <TableCell>
                  <div>
                    <p className="font-medium">{req.orders?.quotes?.customer_name || 'Unknown'}</p>
                    <p className="text-sm text-muted-foreground">{req.orders?.quotes?.customer_phone}</p>
                  </div>
                </TableCell>
                <TableCell>
                  <span className="font-medium">
                    {REQUEST_TYPE_LABELS[req.request_type] || req.request_type}
                  </span>
                  {req.notes && (
                    <p className="text-xs text-muted-foreground mt-1 truncate max-w-[200px]">
                      {req.notes}
                    </p>
                  )}
                </TableCell>
                <TableCell>
                  {req.preferred_date ? (
                    <div>
                      <p>{format(new Date(req.preferred_date), 'MMM d, yyyy')}</p>
                      {req.preferred_window && (
                        <p className="text-xs text-muted-foreground capitalize">{req.preferred_window}</p>
                      )}
                    </div>
                  ) : (
                    <span className="text-muted-foreground">Not specified</span>
                  )}
                </TableCell>
                <TableCell>
                  <Badge className={STATUS_CONFIG[req.status]?.color || 'bg-gray-100'}>
                    {STATUS_CONFIG[req.status]?.label || req.status}
                  </Badge>
                </TableCell>
                <TableCell>
                  <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <Clock className="w-4 h-4" />
                    {format(new Date(req.created_at), 'MMM d, HH:mm')}
                  </div>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      setSelectedRequest(req);
                      setResolutionNotes(req.resolution_notes || '');
                    }}
                  >
                    Review
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredRequests.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  No requests found
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!selectedRequest} onOpenChange={() => setSelectedRequest(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>Review Request</DialogTitle>
          </DialogHeader>

          {selectedRequest && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer</label>
                  <p className="font-medium">{selectedRequest.orders?.quotes?.customer_name}</p>
                  <p className="text-sm text-muted-foreground">{selectedRequest.orders?.quotes?.customer_phone}</p>
                </div>
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Request Type</label>
                  <p className="font-medium">
                    {REQUEST_TYPE_LABELS[selectedRequest.request_type] || selectedRequest.request_type}
                  </p>
                </div>
              </div>

              {selectedRequest.notes && (
                <div>
                  <label className="text-sm font-medium text-muted-foreground">Customer Notes</label>
                  <p className="mt-1 p-3 bg-muted rounded-lg text-sm">{selectedRequest.notes}</p>
                </div>
              )}

              <div>
                <label className="text-sm font-medium text-muted-foreground">Resolution Notes</label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Add notes about this resolution..."
                  className="mt-1"
                  rows={3}
                />
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  className="flex-1"
                  variant="outline"
                  onClick={() => handleResolve('denied')}
                  disabled={isSubmitting}
                >
                  <XCircle className="w-4 h-4 mr-2" />
                  Deny
                </Button>
                <Button
                  className="flex-1"
                  onClick={() => handleResolve('approved')}
                  disabled={isSubmitting}
                >
                  <CheckCircle2 className="w-4 h-4 mr-2" />
                  Approve
                </Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
