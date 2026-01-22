import { useState, useEffect } from 'react';
import { Search, Loader2, Package, User, CreditCard, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';

interface SearchResult {
  type: 'order' | 'customer' | 'payment';
  id: string;
  title: string;
  subtitle: string;
  badge?: string;
  badgeVariant?: 'default' | 'secondary' | 'destructive' | 'outline';
}

interface MobileGlobalSearchProps {
  basePath: string;
}

export function MobileGlobalSearch({ basePath }: MobileGlobalSearchProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (query.length < 2) {
      setResults([]);
      return;
    }

    const searchTimeout = setTimeout(async () => {
      setIsSearching(true);
      try {
        const searchResults: SearchResult[] = [];
        const searchTerm = query.toLowerCase();

        // Search orders
        const { data: orders } = await supabase
          .from('orders')
          .select(`
            id, status, payment_status,
            quotes(customer_phone, customer_name, street_address, zip_code)
          `)
          .or(`id.ilike.%${searchTerm}%`)
          .limit(5);

        orders?.forEach(order => {
          const quote = order.quotes as any;
          if (
            order.id.toLowerCase().includes(searchTerm) ||
            quote?.customer_phone?.includes(searchTerm) ||
            quote?.customer_name?.toLowerCase().includes(searchTerm) ||
            quote?.street_address?.toLowerCase().includes(searchTerm)
          ) {
            searchResults.push({
              type: 'order',
              id: order.id,
              title: quote?.customer_name || 'Order',
              subtitle: quote?.street_address || order.id.slice(0, 8),
              badge: order.status,
              badgeVariant: order.status === 'completed' ? 'secondary' : 'default',
            });
          }
        });

        // Search customers
        const { data: customers } = await supabase
          .from('customers')
          .select('id, company_name, billing_email, billing_phone')
          .or(`company_name.ilike.%${searchTerm}%,billing_email.ilike.%${searchTerm}%,billing_phone.ilike.%${searchTerm}%`)
          .limit(5);

        customers?.forEach(customer => {
          searchResults.push({
            type: 'customer',
            id: customer.id,
            title: customer.company_name || customer.billing_email || 'Customer',
            subtitle: customer.billing_phone || customer.billing_email || '',
          });
        });

        // Search payments
        const { data: payments } = await supabase
          .from('payments')
          .select('id, amount, status, transaction_id, customer_email, customer_phone')
          .or(`transaction_id.ilike.%${searchTerm}%,customer_email.ilike.%${searchTerm}%,customer_phone.ilike.%${searchTerm}%`)
          .limit(5);

        payments?.forEach(payment => {
          searchResults.push({
            type: 'payment',
            id: payment.id,
            title: `$${payment.amount?.toFixed(2) || '0.00'}`,
            subtitle: payment.transaction_id || payment.customer_email || '',
            badge: payment.status,
            badgeVariant: payment.status === 'captured' ? 'secondary' : 
                          payment.status === 'failed' ? 'destructive' : 'outline',
          });
        });

        setResults(searchResults);
      } catch (error) {
        console.error('Search error:', error);
      } finally {
        setIsSearching(false);
      }
    }, 300);

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleResultClick = (result: SearchResult) => {
    switch (result.type) {
      case 'order':
        navigate(`/admin/orders?id=${result.id}`);
        break;
      case 'customer':
        navigate(`/admin/customers`);
        break;
      case 'payment':
        navigate(`/finance/payments/${result.id}`);
        break;
    }
    setQuery('');
    setResults([]);
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'order': return <Package className="w-4 h-4 text-primary" />;
      case 'customer': return <User className="w-4 h-4 text-blue-500" />;
      case 'payment': return <CreditCard className="w-4 h-4 text-green-500" />;
      default: return null;
    }
  };

  return (
    <div className="p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders, customers, payments..."
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={() => { setQuery(''); setResults([]); }}
          >
            <X className="w-4 h-4" />
          </Button>
        )}
      </div>

      {isSearching && (
        <div className="flex items-center justify-center py-8">
          <Loader2 className="w-6 h-6 animate-spin text-primary" />
        </div>
      )}

      {!isSearching && results.length > 0 && (
        <div className="mt-4 space-y-2">
          {results.map((result) => (
            <Card
              key={`${result.type}-${result.id}`}
              className="p-3 cursor-pointer active:bg-muted"
              onClick={() => handleResultClick(result)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getIcon(result.type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                </div>
                {result.badge && (
                  <Badge variant={result.badgeVariant} className="text-xs capitalize">
                    {result.badge}
                  </Badge>
                )}
              </div>
            </Card>
          ))}
        </div>
      )}

      {!isSearching && query.length >= 2 && results.length === 0 && (
        <p className="text-center text-muted-foreground py-8">
          No results found for "{query}"
        </p>
      )}

      {query.length === 0 && (
        <div className="mt-8 text-center">
          <Search className="w-12 h-12 mx-auto text-muted-foreground/50" />
          <p className="mt-2 text-muted-foreground">
            Search by phone, order ID, address, or name
          </p>
        </div>
      )}
    </div>
  );
}
