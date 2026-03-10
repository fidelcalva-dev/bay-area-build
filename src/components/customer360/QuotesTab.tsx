/**
 * QuotesTab — Shows all quotes linked to a customer with action buttons and status badges.
 */
import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  FileText, Send, CreditCard, Package, ExternalLink,
  Copy, MoreHorizontal
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import type { Quote } from './types';

interface Props {
  quotes: Quote[];
  customerId: string;
}

const STATUS_STYLES: Record<string, string> = {
  saved: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  sent: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300',
  accepted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  converted: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  declined: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  expired: 'bg-muted text-muted-foreground',
};

const STATUS_LABELS: Record<string, string> = {
  saved: 'Draft',
  sent: 'Sent',
  accepted: 'Accepted',
  converted: 'Converted',
  declined: 'Declined',
  expired: 'Expired',
};

export function QuotesTab({ quotes, customerId }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleCopyLink = (quoteId: string) => {
    const url = `${window.location.origin}/sales/quotes/${quoteId}`;
    navigator.clipboard.writeText(url);
    toast({ title: 'Quote link copied' });
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
              const isActionable = ['saved', 'sent', 'accepted'].includes(quote.status);
              const canSend = quote.status === 'saved';
              const canConvert = quote.status === 'accepted';

              return (
                <div key={quote.id} className="rounded-lg border p-3 space-y-2.5">
                  {/* Header row */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="min-w-0 flex-1">
                      <p className="font-medium text-sm truncate">
                        {quote.customer_name || 'Quote'}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(quote.created_at).toLocaleDateString()}
                        {quote.material_type && ` · ${quote.material_type}`}
                        {quote.zip_code && ` · ${quote.zip_code}`}
                      </p>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Badge className={`text-[10px] ${STATUS_STYLES[quote.status] || ''}`}>
                        {STATUS_LABELS[quote.status] || quote.status}
                      </Badge>
                      {quote.subtotal != null && (
                        <span className="font-semibold text-sm">${quote.subtotal.toFixed(0)}</span>
                      )}
                    </div>
                  </div>

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
                        <FileText className="w-3 h-3" />Send Contract
                      </Button>
                    )}

                    {isActionable && (
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-8 text-xs gap-1"
                        onClick={() => navigate(`/finance/payment-actions?customer=${customerId}`)}
                      >
                        <CreditCard className="w-3 h-3" />Payment Link
                      </Button>
                    )}

                    {canConvert && (
                      <Button
                        size="sm"
                        className="h-8 text-xs gap-1"
                        onClick={() => navigate(`/admin/orders?action=new&quote=${quote.id}&customer=${customerId}`)}
                      >
                        <Package className="w-3 h-3" />Convert to Order
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
