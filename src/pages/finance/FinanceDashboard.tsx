import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { 
  DollarSign, FileText, TrendingUp, AlertCircle, 
  Clock, CheckCircle2, ArrowRight, Loader2
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';

interface DashboardStats {
  totalUnpaid: number;
  totalPaid: number;
  overdueCount: number;
  pendingPayments: number;
}

interface RecentInvoice {
  id: string;
  invoice_number: string;
  order_id: string;
  amount_due: number;
  balance_due: number;
  payment_status: string;
  due_date: string | null;
  created_at: string;
}

export default function FinanceDashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalUnpaid: 0,
    totalPaid: 0,
    overdueCount: 0,
    pendingPayments: 0,
  });
  const [recentInvoices, setRecentInvoices] = useState<RecentInvoice[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch invoices for stats
      const { data: invoices, error: invoicesError } = await supabase
        .from('invoices')
        .select('*')
        .order('created_at', { ascending: false });

      if (invoicesError) throw invoicesError;

      // Calculate stats
      const today = new Date().toISOString().split('T')[0];
      const unpaid = invoices?.filter(i => i.payment_status !== 'paid') || [];
      const paid = invoices?.filter(i => i.payment_status === 'paid') || [];
      const overdue = invoices?.filter(i => 
        i.payment_status !== 'paid' && 
        i.due_date && 
        i.due_date < today
      ) || [];

      // Fetch pending payments
      const { count: pendingPaymentsCount } = await supabase
        .from('payments')
        .select('*', { count: 'exact', head: true })
        .eq('status', 'initiated');

      setStats({
        totalUnpaid: unpaid.reduce((sum, i) => sum + (i.balance_due || 0), 0),
        totalPaid: paid.reduce((sum, i) => sum + (i.amount_paid || 0), 0),
        overdueCount: overdue.length,
        pendingPayments: pendingPaymentsCount || 0,
      });

      setRecentInvoices(invoices?.slice(0, 10) || []);
    } catch (error) {
      console.error('Failed to fetch dashboard data:', error);
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

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Finance Dashboard</h1>
          <p className="text-muted-foreground">Manage invoices and payment requests</p>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Outstanding Balance</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.totalUnpaid)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-red-100 flex items-center justify-center">
                <DollarSign className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Collected This Month</p>
                <p className="text-2xl font-bold text-foreground">
                  {formatCurrency(stats.totalPaid)}
                </p>
              </div>
              <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center">
                <TrendingUp className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue Invoices</p>
                <p className="text-2xl font-bold text-foreground">{stats.overdueCount}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center">
                <AlertCircle className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Pending Payments</p>
                <p className="text-2xl font-bold text-foreground">{stats.pendingPayments}</p>
              </div>
              <div className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center">
                <Clock className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Invoices */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Recent Invoices
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link to="/finance/invoices">
              View All
              <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentInvoices.length === 0 ? (
            <p className="text-center text-muted-foreground py-8">No invoices found</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Invoice</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Amount Due</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Balance</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Status</th>
                    <th className="text-left py-3 px-2 text-sm font-medium text-muted-foreground">Due Date</th>
                    <th className="text-right py-3 px-2 text-sm font-medium text-muted-foreground">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {recentInvoices.map((invoice) => (
                    <tr key={invoice.id} className="border-b last:border-b-0 hover:bg-muted/50">
                      <td className="py-3 px-2">
                        <span className="font-mono text-sm">{invoice.invoice_number}</span>
                      </td>
                      <td className="py-3 px-2 font-medium">
                        {formatCurrency(invoice.amount_due)}
                      </td>
                      <td className="py-3 px-2">
                        {formatCurrency(invoice.balance_due)}
                      </td>
                      <td className="py-3 px-2">
                        {getStatusBadge(invoice.payment_status)}
                      </td>
                      <td className="py-3 px-2 text-sm text-muted-foreground">
                        {invoice.due_date || '—'}
                      </td>
                      <td className="py-3 px-2 text-right">
                        <Button variant="ghost" size="sm" asChild>
                          <Link to={`/finance/invoices/${invoice.order_id}`}>
                            View
                          </Link>
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
