import { Search, Loader2, Package, User, CreditCard, X, FileText, Truck, Box, ClipboardList, Receipt, MapPin } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card } from '@/components/ui/card';
import { useGlobalSearch } from '@/hooks/useGlobalSearch';

interface MobileGlobalSearchProps {
  basePath: string;
}

const ENTITY_CONFIG: Record<string, { icon: React.ReactNode; route: (id: string) => string }> = {
  CUSTOMER: { 
    icon: <User className="w-4 h-4 text-blue-500" />, 
    route: () => '/admin/customers' 
  },
  ORDER: { 
    icon: <Package className="w-4 h-4 text-primary" />, 
    route: (id) => `/admin/orders?id=${id}` 
  },
  INVOICE: { 
    icon: <Receipt className="w-4 h-4 text-green-500" />, 
    route: (id) => `/finance/invoices/${id}` 
  },
  PAYMENT: { 
    icon: <CreditCard className="w-4 h-4 text-emerald-500" />, 
    route: (id) => `/finance/payments/${id}` 
  },
  RUN: { 
    icon: <Truck className="w-4 h-4 text-orange-500" />, 
    route: (id) => `/dispatch/runs/${id}` 
  },
  RUN_STOP: { 
    icon: <MapPin className="w-4 h-4 text-amber-500" />, 
    route: (id) => `/dispatch/runs` 
  },
  ASSET: { 
    icon: <Box className="w-4 h-4 text-purple-500" />, 
    route: () => '/assets' 
  },
  LEAD: { 
    icon: <ClipboardList className="w-4 h-4 text-cyan-500" />, 
    route: () => '/sales/leads' 
  },
  QUOTE: { 
    icon: <FileText className="w-4 h-4 text-indigo-500" />, 
    route: (id) => `/sales/quotes/${id}` 
  },
  YARD: { 
    icon: <MapPin className="w-4 h-4 text-teal-500" />, 
    route: () => '/admin/yards' 
  },
  FACILITY: { 
    icon: <MapPin className="w-4 h-4 text-rose-500" />, 
    route: () => '/admin/facilities' 
  },
  MARKET: { 
    icon: <MapPin className="w-4 h-4 text-sky-500" />, 
    route: () => '/admin/markets' 
  },
  PHONE_NUMBER: { 
    icon: <User className="w-4 h-4 text-gray-500" />, 
    route: () => '/admin/phone-numbers' 
  },
};

export function MobileGlobalSearch({ basePath }: MobileGlobalSearchProps) {
  const { query, setQuery, results, isSearching, clearSearch } = useGlobalSearch();
  const navigate = useNavigate();

  const handleResultClick = (entityType: string, entityId: string) => {
    const config = ENTITY_CONFIG[entityType];
    if (config) {
      navigate(config.route(entityId));
    }
    clearSearch();
  };

  const getIcon = (entityType: string) => {
    return ENTITY_CONFIG[entityType]?.icon || <Package className="w-4 h-4 text-muted-foreground" />;
  };

  const getBadgeVariant = (badge: string | null): 'default' | 'secondary' | 'destructive' | 'outline' => {
    if (!badge) return 'outline';
    const lower = badge.toLowerCase();
    if (['completed', 'paid', 'captured', 'active'].includes(lower)) return 'secondary';
    if (['failed', 'cancelled', 'overdue'].includes(lower)) return 'destructive';
    return 'default';
  };

  return (
    <div className="p-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search orders, customers, invoices, assets..."
          className="pl-10 pr-10 h-12 text-base"
        />
        {query && (
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-1 top-1/2 -translate-y-1/2"
            onClick={clearSearch}
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
              key={`${result.entity_type}-${result.entity_id}`}
              className="p-3 cursor-pointer active:bg-muted"
              onClick={() => handleResultClick(result.entity_type, result.entity_id)}
            >
              <div className="flex items-center gap-3">
                <div className="flex-shrink-0">
                  {getIcon(result.entity_type)}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-medium text-sm truncate">{result.title}</p>
                  <p className="text-xs text-muted-foreground truncate">{result.subtitle}</p>
                </div>
                {result.badge && (
                  <Badge variant={getBadgeVariant(result.badge)} className="text-xs capitalize">
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
            Search by phone, order ID, address, invoice, or name
          </p>
        </div>
      )}
    </div>
  );
}
