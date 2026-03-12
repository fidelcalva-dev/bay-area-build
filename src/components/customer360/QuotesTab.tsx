/**
 * QuotesTab — Shows all quotes linked to a customer with full commercial status,
 * action buttons, and readiness badges.
 */
import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Send, CreditCard, Package, ExternalLink,
  Copy, MoreHorizontal, ScrollText, CheckCircle2,
  AlertTriangle, XCircle, ShieldCheck, Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import type { Quote } from './types';

interface Props {
  quotes: Quote[];
  customerId: string;
}

const STATUS_STYLES: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  pending: 'bg-muted text-muted-foreground',
  sent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  converted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  expired: 'bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<string, string> = {
  saved: 'Draft',
  pending: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  converted: 'Converted',
  declined: 'Declined',
  expired: 'Expired',
};

// Contract status from the contracts table
interface QuoteCommercial {
  contractStatus: string | null;
  quoteSent: boolean;
}

function getReadinessIcon(quote: Quote) {
  const hasCritical = !quote.customer_name || !quote.subtotal;
  if (hasCritical) return <XCircle className="w-3.5 h-3.5 text-destructive shrink-0" />;
  if (quote.status === 'converted') return <CheckCircle2 className="w-3.5 h-3.5 text-success shrink-0" />;
  return <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0" />;
}

export function QuotesTab({ quotes, customerId }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [commercialMap, setCommercialMap] = useState<Record<string, QuoteCommercial>>({});

  useEffect(() => {
    if (quotes.length === 0) return;
    fetchCommercialData();
  }, [quotes]);

  async function fetchCommercialData() {
    const quoteIds = quotes.map(q => q.id);
    const map: Record<string, QuoteCommercial> = {};
    quoteIds.forEach(id => { map[id] = { contractStatus: null, quoteSent: false }; });

    try {
      // Fetch contracts for these quotes
      const { data: contracts } = await supabase
        .from("contracts")
        .select("quote_id, status")
        .in("quote_id", quoteIds);

      if (contracts) {
        contracts.forEach(c => {
          if (c.quote_id && map[c.quote_id]) {
            map[c.quote_id].contractStatus = c.status;
          }
        });
      }

      // Fetch outbound quotes
      const { data: outbound } = await supabase
        .from("outbound_quotes")
        .select("quote_id, status")
        .in("quote_id", quoteIds);

      if (outbound) {
        outbound.forEach(o => {
          if (o.quote_id && map[o.quote_id] && o.status !== "draft") {
            map[o.quote_id].quoteSent = true;
          }
        });
      }
    } catch (err) {
      console.error("Failed to fetch commercial data", err);
    }

    setCommercialMap(map);
  }

  const handleCopyLink = (quoteId: string) => {
    const url = `${window.location.origin}/sales/quotes/${quoteId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Quote link copied' });
  };

  const getContractBadge = (status: string | null) => {
    if (!status) return null;
    const styles: Record<string, string> = {
      pending: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
      signed: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
      declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
      expired: 'bg-muted text-muted-foreground',
    };
    return (
      <Badge className={`text-[10px] ${styles[status] || ''}`}>
        Contract: {status}
      </Badge>
    );
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Quotes</CardTitle>
            <CardDescription>{quotes.length} total quotes</CardDescription>
          </div>
          <Button size="sm" asChild>
            <Link to="/sales/quotes/new">
              <FileText className="w-4 h-4 mr-1.5" />New Quote
            </Link>
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {quotes.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No quotes yet</p>
            <p className="text-xs mt-1">Create a quote to start the sales process</p>
          </div>
        ) : (
          <div className="space-y-3">
            {quotes.map(quote => {
              const isActionable = ['saved', 'pending', 'sent', 'accepted'].includes(quote.status);
              const canSend = quote.status === 'saved' || quote.status === 'pending';
              const canConvert = quote.status === 'accepted' || quote.status === 'sent';
              const commercial = commercialMap[quote.id];

              return (
                <div key={quote.id} className="rounded-lg border p-3 space-y-2.5">
                  {/* Header row */}
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5">
                        {getReadinessIcon(quote)}
                        <p className="font-medium text-sm truncate">
                          {quote.customer_name || 'Unnamed Quote'}
                        </p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-0.5">
                        {new Date(quote.created_at).toLocaleDateString()}
                        {quote.material_type && ` · ${quote.material_type}`}
                        {quote.zip_code && ` · ${quote.zip_code}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0 flex-wrap justify-end">
                      <Badge className={`text-[10px] ${STATUS_STYLES[quote.status] || ''}`}>
                        {STATUS_LABELS[quote.status] || quote.status}
                      </Badge>
                      {quote.subtotal != null && (
                        <span className="font-semibold text-sm">${quote.subtotal.toFixed(0)}</span>
                      )}
                    </div>
                  </div>

                  {/* Status badges row */}
                  {commercial && (
                    <div className="flex items-center gap-1.5 flex-wrap">
                      {commercial.quoteSent && (
                        <Badge variant="outline" className="text-[10px]">Quote Sent</Badge>
                      )}
                      {getContractBadge(commercial.contractStatus)}
                    </div>
                  )}

                  {/* Action buttons */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <Button size="sm" variant="outline" className="h-8 text-xs gap-1" asChild>
                      <Link to={`/sales/quotes/${quote.id}`}>
                        <ExternalLink className="w-3 h-3" />Open
                      </Link>
                    </Button>

                    {canSend && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => navigate(`/sales/quotes/${quote.id}?action=send`)}
                      >
                        <Send className="w-3 h-3" />Send Quote
                      </Button>
                    )}

                    {isActionable && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => navigate(`/sales/quotes/${quote.id}?action=contract`)}
                      >
                        <ScrollText className="w-3 h-3" />Contract
                      </Button>
                    )}

                    {isActionable && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        disabled
                        title="Coming soon"
                      >
                        <CreditCard className="w-3 h-3" />Payment
                      </Button>
                    )}

                    {canConvert && (
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => navigate(`/admin/orders?action=new&quote=${quote.id}&customer=${customerId}`)}
                      >
                        <Package className="w-3 h-3" />Convert
                      </Button>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyLink(quote.id)}>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />Copy Link
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
