import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  CreditCard, Search, Filter, Loader2, RefreshCw,
  CheckCircle2, XCircle, Clock, ChevronLeft, ChevronRight
} from 'lucide-react';
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

interface Payment {
  id: string;
  order_id: string;
  amount: number;
  payment_type: string;
  status: string;
  provider: string;
  transaction_id: string | null;
  customer_email: string | null;
  customer_phone: string | null;
  card_type: string | null;
  card_last_four: string | null;
  response_message: string | null;
  created_at: string;
}

export default function FinancePayments() {
  const navigate = useNavigate();
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchPayments();
  }, [page, statusFilter]);

  const fetchPayments = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('payments')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setPayments(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch payments:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'captured':
      case 'settled':
        return (
          <Badge className="bg-green-100 text-green-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {status}
          </Badge>
        );
      case 'failed':
        return (
          <Badge className="bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Failed
          </Badge>
        );
      case 'initiated':
        return (
          <Badge className="bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending
          </Badge>
        );
      default:
        return <Badge variant="outline">{status}</Badge>;
    }
  };

  const filteredPayments = payments.filter((payment) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      payment.transaction_id?.toLowerCase().includes(search) ||
      payment.customer_email?.toLowerCase().includes(search) ||
      payment.customer_phone?.includes(search) ||
      payment.order_id.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Payments</h1>
          <p className="text-muted-foreground">View all payment transactions</p>
        </div>
        <Button variant="outline" onClick={fetchPayments} disabled={isLoading}>
          <RefreshCw className={`w-4 h-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
          Refresh
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="pt-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search by transaction ID, email, or phone..."
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
                <SelectItem value="all">All Statuses</SelectItem>
                <SelectItem value="initiated">Pending</SelectItem>
                <SelectItem value="captured">Captured</SelectItem>
                <SelectItem value="settled">Settled</SelectItem>
                <SelectItem value="failed">Failed</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Payments Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CreditCard className="w-5 h-5" />
            Transactions ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredPayments.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No payments found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Date</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Transaction</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Type</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Card</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredPayments.map((payment) => (
                      <tr 
                        key={payment.id} 
                        className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/finance/payments/${payment.id}`)}
                      >
                        <td className="py-3 px-2 text-sm">
                          {new Date(payment.created_at).toLocaleDateString()}
                          <br />
                          <span className="text-xs text-muted-foreground">
                            {new Date(payment.created_at).toLocaleTimeString()}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <span className="font-mono text-xs">
                            {payment.transaction_id || '—'}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          <Badge variant="outline" className="capitalize">
                            {payment.payment_type}
                          </Badge>
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {formatCurrency(payment.amount)}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {payment.card_type && payment.card_last_four ? (
                            <span className="text-muted-foreground">
                              {payment.card_type} •••• {payment.card_last_four}
                            </span>
                          ) : (
                            '—'
                          )}
                        </td>
                        <td className="py-3 px-2">
                          {getStatusBadge(payment.status)}
                        </td>
                        <td className="py-3 px-2 text-sm">
                          {payment.customer_email || payment.customer_phone || '—'}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-4 border-t">
                  <p className="text-sm text-muted-foreground">
                    Page {page} of {totalPages}
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                      disabled={page === totalPages}
                    >
                      <ChevronRight className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
