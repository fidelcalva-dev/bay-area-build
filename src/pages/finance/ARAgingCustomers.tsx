import { useState } from 'react';
import { Link } from 'react-router-dom';
import { 
  Users, Search, Loader2, ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useARAgingData } from '@/hooks/useARAgingData';

export default function ARAgingCustomers() {
  const [searchQuery, setSearchQuery] = useState('');
  const [page, setPage] = useState(1);
  const pageSize = 20;

  const { topDebtors, loading, refetch } = useARAgingData();

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

  const filteredDebtors = topDebtors.filter((debtor) => {
    if (!searchQuery) return true;
    const search = searchQuery.toLowerCase();
    return (
      debtor.customerName.toLowerCase().includes(search) ||
      debtor.customerPhone?.includes(search)
    );
  });

  const totalPages = Math.ceil(filteredDebtors.length / pageSize);
  const paginatedDebtors = filteredDebtors.slice(
    (page - 1) * pageSize,
    page * pageSize
  );

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
          <h1 className="text-2xl font-bold text-foreground">Top Debtors</h1>
          <p className="text-muted-foreground">Customers with outstanding balances</p>
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

      {/* Search */}
      <Card>
        <CardContent className="pt-6">
          <div className="relative max-w-md">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by customer name or phone..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </CardContent>
      </Card>

      {/* Debtors Table */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="w-5 h-5" />
            Customers ({filteredDebtors.length})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {paginatedDebtors.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">No customers with outstanding balances</p>
          ) : (
            <>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Customer</th>
                      <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Phone</th>
                      <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Total Balance</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Invoices</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Oldest Days</th>
                      <th className="text-center py-3 px-2 text-sm font-medium text-muted-foreground">Worst Bucket</th>
                    </tr>
                  </thead>
                  <tbody>
                    {paginatedDebtors.map((debtor, idx) => (
                      <tr
                        key={debtor.customerPhone || debtor.customerId || idx}
                        className="border-b last:border-b-0 hover:bg-muted/50"
                      >
                        <td className="py-3 px-2">
                          <p className="font-medium">{debtor.customerName}</p>
                        </td>
                        <td className="py-3 px-2 text-sm text-muted-foreground">
                          {debtor.customerPhone || '—'}
                        </td>
                        <td className="py-3 px-2 text-right font-bold text-red-600">
                          {formatCurrency(debtor.totalBalance)}
                        </td>
                        <td className="py-3 px-2 text-center">
                          {debtor.invoiceCount}
                        </td>
                        <td className="py-3 px-2 text-center">
                          <span className={debtor.oldestDaysPastDue >= 60 ? 'text-red-600 font-medium' : ''}>
                            {debtor.oldestDaysPastDue} days
                          </span>
                        </td>
                        <td className="py-3 px-2 text-center">
                          {getBucketBadge(debtor.worstBucket)}
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
    </div>
  );
}
