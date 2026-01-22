import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Filter, Loader2, ExternalLink,
  ChevronLeft, ChevronRight, RefreshCw
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

interface Invoice {
  id: string;
  invoice_number: string;
  order_id: string;
  customer_id: string | null;
  amount_due: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  due_date: string | null;
  created_at: string;
  notes: string | null;
}

interface InvoiceWithOrder extends Invoice {
  orders?: {
    id: string;
    status: string;
    quotes?: {
      customer_name: string | null;
      customer_email: string | null;
      customer_phone: string | null;
      delivery_address: string | null;
    } | null;
  } | null;
}

export default function FinanceInvoices() {
  const navigate = useNavigate();
  const [invoices, setInvoices] = useState<InvoiceWithOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const pageSize = 20;

  useEffect(() => {
    fetchInvoices();
  }, [page, statusFilter]);

  const fetchInvoices = async () => {
    setIsLoading(true);
    try {
      let query = supabase
        .from('invoices')
        .select(`
          *,
          orders (
            id,
            status,
            quotes (
              customer_name,
              customer_email,
              customer_phone,
              delivery_address
            )
          )
        `, { count: 'exact' })
        .order('created_at', { ascending: false })
        .range((page - 1) * pageSize, page * pageSize - 1);

      if (statusFilter !== 'all') {
        query = query.eq('payment_status', statusFilter);
      }

      const { data, error, count } = await query;

      if (error) throw error;

      setInvoices(data || []);
      setTotalCount(count || 0);
    } catch (error) {
      console.error('Failed to fetch invoices:', error);
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
      case 'paid':
        return <Badge className="bg-green-100 text-green-800">Paid</Badge>;
      case 'partial':
        return <Badge className="bg-yellow-100 text-yellow-800">Partial</Badge>;
      default:
        return <Badge className="bg-red-100 text-red-800">Unpaid</Badge>;
    }
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(search) ||
      invoice.orders?.quotes?.customer_name?.toLowerCase().includes(search) ||
      invoice.orders?.quotes?.customer_phone?.includes(search) ||
      invoice.order_id.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(totalCount / pageSize);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Invoices</h1>
          <p className="text-muted-foreground">Manage and send payment requests</p>
        </div>
        <Button variant="outline" onClick={fetchInvoices} disabled={isLoading}>
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
                placeholder="Search by invoice #, customer, or phone..."
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
                <SelectItem value="unpaid">Unpaid</SelectItem>
                <SelectItem value="partial">Partial</SelectItem>
                <SelectItem value="paid">Paid</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Invoices Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Invoices ({totalCount})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <Loader2 className="w-8 h-8 animate-spin text-primary" />
            </div>
          ) : filteredInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No invoices found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount Due</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Balance</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Due Date</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredInvoices.map((invoice) => (
                      <tr 
                        key={invoice.id} 
                        className="border-b last:border-b-0 hover:bg-muted/50 cursor-pointer"
                        onClick={() => navigate(`/finance/invoices/${invoice.order_id}`)}
                      >
                        <td className="py-3 px-2">
                          <span className="font-mono text-sm">{invoice.invoice_number}</span>
                        </td>
                        <td className="py-3 px-2">
                          <div>
                            <p className="font-medium text-sm">
                              {invoice.orders?.quotes?.customer_name || 'Unknown'}
                            </p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.orders?.quotes?.customer_phone || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2 font-medium">
                          {formatCurrency(invoice.amount_due)}
                        </td>
                        <td className="py-3 px-2">
                          <span className={invoice.balance_due > 0 ? 'text-red-600 font-medium' : 'text-green-600'}>
                            {formatCurrency(invoice.balance_due)}
                          </span>
                        </td>
                        <td className="py-3 px-2">
                          {getStatusBadge(invoice.payment_status)}
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {invoice.due_date || '—'}
                        </td>
                        <td className="py-3 px-2 text-right">
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              navigate(`/finance/invoices/${invoice.order_id}`);
                            }}
                          >
                            <ExternalLink className="w-4 h-4" />
                          </Button>
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
