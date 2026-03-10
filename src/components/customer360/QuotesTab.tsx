/**
 * QuotesTab — Shows all quotes linked to a customer in Customer 360.
 */
import { Link } from 'react-router-dom';
import { FileText, ArrowRight, Send } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
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

export function QuotesTab({ quotes, customerId }: Props) {
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
          <div className="space-y-2">
            {quotes.map(quote => (
              <Link
                key={quote.id}
                to={`/sales/quotes/${quote.id}`}
                className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 transition-colors gap-2"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <FileText className="w-5 h-5 text-muted-foreground shrink-0" />
                  <div className="min-w-0">
                    <p className="font-medium text-sm truncate">
                      {quote.customer_name || 'Quote'}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {new Date(quote.created_at).toLocaleDateString()}
                      {quote.material_type && ` · ${quote.material_type}`}
                      {quote.zip_code && ` · ${quote.zip_code}`}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge className={`text-xs ${STATUS_STYLES[quote.status] || ''}`}>
                    {quote.status}
                  </Badge>
                  {quote.subtotal != null && (
                    <span className="font-medium text-sm">${quote.subtotal.toFixed(0)}</span>
                  )}
                  <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
                </div>
              </Link>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
