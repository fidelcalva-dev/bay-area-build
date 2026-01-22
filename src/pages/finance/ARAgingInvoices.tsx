import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { 
  FileText, Search, Filter, Loader2, ChevronLeft, 
  ChevronRight, RefreshCw, MessageSquare, Mail, 
  CreditCard, Flag, AlertTriangle, StickyNote
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
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useARAgingData, ARInvoice } from '@/hooks/useARAgingData';
import { ARActionDialog } from '@/components/finance/ARActionDialog';
import { toast } from 'sonner';

export default function ARAgingInvoices() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState('');
  const [bucketFilter, setBucketFilter] = useState<string>('all');
  const [page, setPage] = useState(1);
  const pageSize = 25;

  const { invoices, loading, refetch } = useARAgingData({ bucket: bucketFilter });

  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    invoice: ARInvoice | null;
    actionType: 'reminder' | 'payment_request' | 'dispute' | 'collections' | 'note';
  }>({ open: false, invoice: null, actionType: 'reminder' });

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);

  const getBucketBadge = (bucket: string) => {
    const variants: Record<string, string> = {
      'current': 'bg-primary/10 text-primary',
      '0-7': 'bg-green-100 text-green-800',
      '8-30': 'bg-yellow-100 text-yellow-800',
      '31-60': 'bg-orange-100 text-orange-800',
      '61-90': 'bg-red-100 text-red-800',
      '90+': 'bg-red-200 text-red-900',
    };
    const labels: Record<string, string> = {
      'current': 'Current',
      '0-7': '1-7 Days',
      '8-30': '8-30 Days',
      '31-60': '31-60 Days',
      '61-90': '61-90 Days',
      '90+': '90+ Days',
    };
    return <Badge className={variants[bucket] || 'bg-muted'}>{labels[bucket] || bucket}</Badge>;
  };

  const filteredInvoices = invoices.filter((invoice) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      invoice.invoice_number.toLowerCase().includes(search) ||
      invoice.customer_name?.toLowerCase().includes(search) ||
      invoice.customer_phone?.includes(search) ||
      invoice.order_id.toLowerCase().includes(search)
    );
  });

  const totalPages = Math.ceil(filteredInvoices.length / pageSize);
  const paginatedInvoices = filteredInvoices.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

  const openAction = (invoice: ARInvoice, actionType: typeof actionDialog.actionType) => {
    setActionDialog({ open: true, invoice, actionType });
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground">AR Invoices</h1>
          <p className="text-muted-foreground">All invoices with outstanding balances</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" asChild>
            <Link to="/finance/ar-aging">← Back to Dashboard</Link>
          </Button>
          <Button variant="outline" onClick={refetch}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
        </div>
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
            <Select value={bucketFilter} onValueChange={(v) => { setBucketFilter(v); setPage(1); }}>
              <SelectTrigger className="w-[180px]">
                <Filter className="w-4 h-4 mr-2" />
                <SelectValue placeholder="Aging bucket" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Buckets</SelectItem>
                <SelectItem value="current">Current</SelectItem>
                <SelectItem value="0-7">1-7 Days</SelectItem>
                <SelectItem value="8-30">8-30 Days</SelectItem>
                <SelectItem value="31-60">31-60 Days</SelectItem>
                <SelectItem value="61-90">61-90 Days</SelectItem>
                <SelectItem value="90+">90+ Days</SelectItem>
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
            Invoices ({filteredInvoices.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No invoices found</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Location</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Balance</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Days</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Bucket</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedInvoices.map((invoice) => (
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
                            <p className="font-medium text-sm">{invoice.customer_name}</p>
                            <p className="text-xs text-muted-foreground">
                              {invoice.customer_phone || '—'}
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {invoice.delivery_city || invoice.delivery_zip || '—'}
                        </td>
                        <td className="py-3 px-2 text-right font-medium text-red-600">
                          {formatCurrency(invoice.balance_due)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={invoice.days_past_due >= 60 ? 'text-red-600 font-medium' : ''}>
                            {invoice.days_past_due}
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {getBucketBadge(invoice.aging_bucket)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <div className="flex items-center justify-center gap-1">
                            {invoice.collections_flagged && (
                              <Badge variant="destructive" className="text-xs">Collections</Badge>
                            )}
                            {invoice.payment_status === 'disputed' && (
                              <Badge variant="outline" className="text-xs">Disputed</Badge>
                            )}
                          </div>
                        </td>
                        <td className="py-3 px-2 text-right">
                          <DropdownMenu>
                            <DropdownMenuTrigger asChild onClick={(e) => e.stopPropagation()}>
                              <Button variant="ghost" size="sm">
                                Actions
                              </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAction(invoice, 'reminder'); }}>
                                <MessageSquare className="w-4 h-4 mr-2" />
                                Send Reminder
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAction(invoice, 'payment_request'); }}>
                                <CreditCard className="w-4 h-4 mr-2" />
                                Payment Request
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAction(invoice, 'dispute'); }}>
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Mark Dispute
                              </DropdownMenuItem>
                              <DropdownMenuItem onClick={(e) => { e.stopPropagation(); openAction(invoice, 'note'); }}>
                                <StickyNote className="w-4 h-4 mr-2" />
                                Add Note
                              </DropdownMenuItem>
                              <DropdownMenuItem 
                                onClick={(e) => { e.stopPropagation(); openAction(invoice, 'collections'); }}
                                className="text-red-600"
                              >
                                <Flag className="w-4 h-4 mr-2" />
                                Flag Collections
                              </DropdownMenuItem>
                            </DropdownMenuContent>
                          </DropdownMenu>
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
                    Page {page} of {totalPages} ({filteredInvoices.length} invoices)
                  </p>
                  <div className="flex gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.max(1, p - 1))}
                      disabled={page === 1}
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
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

      {/* Action Dialog */}
      {actionDialog.invoice && (
        <ARActionDialog
          open={actionDialog.open}
          onOpenChange={(open) => setActionDialog({ ...actionDialog, open })}
          invoice={actionDialog.invoice}
          actionType={actionDialog.actionType}
          onSuccess={() => {
            toast.success('Action completed successfully');
            refetch();
          }}
        />
      )}
    </div>
  );
}
