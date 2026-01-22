import { useEffect, useState } from 'react';
import { Loader2, Search, Clock, Calendar, MapPin, Phone, Truck } from 'lucide-react';
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { format } from 'date-fns';
import {
  fetchServiceRequests,
  ServiceRequestWithOrder,
} from '@/lib/serviceRequestService';
import { RequestApprovalDialog } from '@/components/cs/RequestApprovalDialog';

const STATUS_CONFIG: Record<string, { label: string; color: string }> = {
  pending: { label: 'Pending', color: 'bg-yellow-100 text-yellow-800' },
  in_review: { label: 'In Review', color: 'bg-blue-100 text-blue-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  denied: { label: 'Denied', color: 'bg-red-100 text-red-800' },
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  pickup: 'Pickup',
  schedule_change: 'Schedule Change',
  extension: 'Extension',
};

export default function DispatchRequests() {
  const [requests, setRequests] = useState<ServiceRequestWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('pending');
  const [selectedRequest, setSelectedRequest] = useState<ServiceRequestWithOrder | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadRequests();
  }, []);

  async function loadRequests() {
    setIsLoading(true);
    const result = await fetchServiceRequests();
    if (result.error) {
      toast({ title: 'Error loading requests', description: result.error, variant: 'destructive' });
    } else {
      setRequests(result.data);
    }
    setIsLoading(false);
  }

  const filteredRequests = requests.filter((req) => {
    const matchesSearch =
      req.orders?.quotes?.customer_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.orders?.quotes?.customer_phone?.includes(searchTerm) ||
      req.orders?.quotes?.delivery_address?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      req.order_id.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesStatus = statusFilter === 'all' || req.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  // Count by status
  const pendingCount = requests.filter((r) => r.status === 'pending').length;
  const pickupCount = requests.filter(
    (r) => r.request_type === 'pickup' && r.status === 'pending'
  ).length;
  const scheduleCount = requests.filter(
    (r) => r.request_type === 'schedule_change' && r.status === 'pending'
  ).length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-foreground">Service Requests</h1>
        <p className="text-muted-foreground mt-1">
          Review and approve customer pickup and schedule change requests
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-3 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pending Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Clock className="w-5 h-5 text-yellow-600" />
              <span className="text-2xl font-bold">{pendingCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Pickup Requests
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Truck className="w-5 h-5 text-blue-600" />
              <span className="text-2xl font-bold">{pickupCount}</span>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              Schedule Changes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-2">
              <Calendar className="w-5 h-5 text-purple-600" />
              <span className="text-2xl font-bold">{scheduleCount}</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, phone, address..."
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
            <SelectItem value="in_review">In Review</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="denied">Denied</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Requests Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer / Address</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Requested Dates</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Submitted</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRequests.map((req) => {
              const quote = req.orders?.quotes;
              return (
                <TableRow key={req.id}>
                  <TableCell>
                    <div>
                      <p className="font-medium">{quote?.customer_name || 'Unknown'}</p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {quote?.delivery_address?.split(',')[0] || 'No address'}
                      </p>
                      <p className="text-xs text-muted-foreground flex items-center gap-1">
                        <Phone className="w-3 h-3" />
                        {quote?.customer_phone || req.customer_phone}
                      </p>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">
                      {REQUEST_TYPE_LABELS[req.request_type] || req.request_type}
                    </Badge>
                    {req.change_type && (
                      <p className="text-xs text-muted-foreground mt-1 capitalize">
                        {req.change_type}
                      </p>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="space-y-1 text-sm">
                      {req.requested_delivery_date && (
                        <p className="flex items-center gap-1">
                          <Truck className="w-3 h-3 text-muted-foreground" />
                          {format(new Date(req.requested_delivery_date), 'MMM d')}
                          {req.requested_delivery_window && (
                            <span className="text-xs text-muted-foreground">
                              ({req.requested_delivery_window})
                            </span>
                          )}
                        </p>
                      )}
                      {(req.requested_pickup_date || req.preferred_date) && (
                        <p className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-muted-foreground" />
                          {format(
                            new Date(req.requested_pickup_date || req.preferred_date!),
                            'MMM d'
                          )}
                          {(req.requested_pickup_window || req.preferred_window) && (
                            <span className="text-xs text-muted-foreground">
                              ({req.requested_pickup_window || req.preferred_window})
                            </span>
                          )}
                        </p>
                      )}
                    </div>
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
                      variant={req.status === 'pending' ? 'default' : 'outline'}
                      onClick={() => setSelectedRequest(req)}
                    >
                      {req.status === 'pending' ? 'Review' : 'View'}
                    </Button>
                  </TableCell>
                </TableRow>
              );
            })}
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

      <RequestApprovalDialog
        request={selectedRequest}
        open={!!selectedRequest}
        onOpenChange={() => setSelectedRequest(null)}
        onSuccess={loadRequests}
      />
    </div>
  );
}
