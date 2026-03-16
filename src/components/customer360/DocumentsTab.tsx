/**
 * DocumentsTab — Customer 360 unified document view.
 * Shows contracts, quotes, invoices, dump tickets, permits, and uploaded files.
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  FileText, ScrollText, CreditCard, Download, ExternalLink,
  Upload, FolderOpen, Eye, Loader2, RefreshCw, Truck,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import type { TimelineEvent } from '@/lib/timelineService';

interface DocumentEntry {
  id: string;
  type: 'contract' | 'addendum' | 'quote' | 'invoice' | 'dump_ticket' | 'permit' | 'upload';
  title: string;
  subtitle: string;
  status: string | null;
  url: string | null;
  createdAt: string;
}

interface Props {
  customerId: string;
  timelineEvents?: TimelineEvent[];
}

const TYPE_ICONS: Record<string, typeof FileText> = {
  contract: ScrollText,
  addendum: ScrollText,
  quote: FileText,
  invoice: CreditCard,
  dump_ticket: Truck,
  permit: FileText,
  upload: Upload,
};

const TYPE_LABELS: Record<string, string> = {
  contract: 'Contract',
  addendum: 'Addendum',
  quote: 'Quote',
  invoice: 'Invoice',
  dump_ticket: 'Dump Ticket',
  permit: 'Permit',
  upload: 'Upload',
};

export function DocumentsTab({ customerId, timelineEvents = [] }: Props) {
  const [documents, setDocuments] = useState<DocumentEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => { loadDocuments(); }, [customerId]);

  async function loadDocuments() {
    setIsLoading(true);
    const docs: DocumentEntry[] = [];

    try {
      // Contracts
      const { data: contracts } = await supabase
        .from('contracts')
        .select('id, contract_type, status, service_address, signed_at, pdf_url, created_at, contract_version')
        .eq('customer_id', customerId)
        .order('created_at', { ascending: false });

      (contracts || []).forEach((c: any) => {
        docs.push({
          id: c.id,
          type: c.contract_type === 'msa' ? 'contract' : 'addendum',
          title: c.contract_type === 'msa' ? 'Master Service Agreement' : 'Service Addendum',
          subtitle: [
            c.status === 'signed' ? 'Signed' : c.status,
            c.service_address,
            c.contract_version && `v${c.contract_version}`,
          ].filter(Boolean).join(' · '),
          status: c.status,
          url: c.pdf_url,
          createdAt: c.created_at,
        });
      });

      // Quotes with PDFs (from outbound_quotes)
      const { data: outbound } = await supabase
        .from('outbound_quotes')
        .select('id, quote_id, status, created_at')
        .eq('customer_id' as 'id', customerId)
        .order('created_at', { ascending: false });

      // Timeline document events
      const docEvents = timelineEvents.filter(e => {
        const details = e.details_json as Record<string, unknown> | null;
        return details?.document_url || details?.file_url;
      });
      docEvents.forEach(ev => {
        const details = ev.details_json as Record<string, unknown> | null;
        const url = (details?.document_url || details?.file_url) as string | undefined;
        docs.push({
          id: ev.id,
          type: 'upload',
          title: ev.summary,
          subtitle: format(new Date(ev.created_at), 'MMM d, yyyy'),
          status: null,
          url: url || null,
          createdAt: ev.created_at,
        });
      });
    } catch (err) {
      console.error('Failed to load documents', err);
    }

    // Sort by date
    docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setDocuments(docs);
    setIsLoading(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Documents</CardTitle>
            <CardDescription>{documents.length} documents</CardDescription>
          </div>
          <div className="flex items-center gap-1.5">
            <Button variant="outline" size="sm" disabled className="gap-1">
              <Upload className="w-3.5 h-3.5" />Upload
            </Button>
            <Button variant="ghost" size="sm" onClick={loadDocuments}>
              <RefreshCw className="w-3.5 h-3.5" />
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {documents.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FolderOpen className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No documents yet</p>
            <p className="text-xs mt-1">Contracts, dump tickets, and uploaded files will appear here</p>
          </div>
        ) : (
          <div className="space-y-2">
            {documents.map(doc => {
              const Icon = TYPE_ICONS[doc.type] || FileText;
              return (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground truncate">{doc.subtitle}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {doc.status && (
                      <Badge variant={doc.status === 'signed' ? 'default' : 'secondary'} className="text-[10px]">
                        {doc.status}
                      </Badge>
                    )}
                    <Badge variant="outline" className="text-[10px]">
                      {TYPE_LABELS[doc.type]}
                    </Badge>
                    {doc.url && (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(doc.url!, '_blank')}>
                        <ExternalLink className="w-3.5 h-3.5" />
                      </Button>
                    )}
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
