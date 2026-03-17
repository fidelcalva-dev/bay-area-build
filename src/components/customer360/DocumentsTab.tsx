/**
 * DocumentsTab — Customer 360 unified document view.
 * Shows signed documents prominently, plus contracts, quotes, invoices, dump tickets, permits, and uploaded files.
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import {
  FileText, ScrollText, CreditCard, Download, ExternalLink,
  Upload, FolderOpen, Eye, Loader2, RefreshCw, Truck,
  ShieldCheck, FileSignature, CheckCircle, Send, Copy,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { TimelineEvent } from '@/lib/timelineService';

interface DocumentEntry {
  id: string;
  type: 'contract' | 'addendum' | 'quote' | 'invoice' | 'dump_ticket' | 'permit' | 'upload';
  title: string;
  subtitle: string;
  status: string | null;
  url: string | null;
  createdAt: string;
  linkedId?: string; // quote_id or order_id for navigation
}

interface SignedDocument {
  id: string;
  docType: 'msa' | 'addendum';
  title: string;
  serviceAddress: string | null;
  signerName: string | null;
  signedAt: string | null;
  contractVersion: string | null;
  termsVersion: string | null;
  pdfUrl: string | null;
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
  const [signedDocs, setSignedDocs] = useState<SignedDocument[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => { loadDocuments(); }, [customerId]);

  async function loadDocuments() {
    setIsLoading(true);
    const docs: DocumentEntry[] = [];
    const signed: SignedDocument[] = [];

    try {
      const [contractsRes, quotesRes, invoicesRes] = await Promise.all([
        supabase
          .from('contracts')
          .select('id, contract_type, status, service_address, signed_at, pdf_url, created_at, contract_version, terms_version, signer_name')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase
          .from('quotes')
          .select('id, customer_name, subtotal, status, material_type, created_at')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(20),
        supabase
          .from('invoices')
          .select('id, invoice_number, amount_due, payment_status, created_at, order_id')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false })
          .limit(20),
      ]);

      (contractsRes.data || []).forEach((c: any) => {
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

        if (c.status === 'signed') {
          signed.push({
            id: c.id,
            docType: c.contract_type === 'msa' ? 'msa' : 'addendum',
            title: c.contract_type === 'msa' ? 'Master Service Agreement' : 'Service Addendum',
            serviceAddress: c.service_address,
            signerName: c.signer_name,
            signedAt: c.signed_at,
            contractVersion: c.contract_version,
            termsVersion: c.terms_version,
            pdfUrl: c.pdf_url,
          });
        }
      });

      // Quote documents
      (quotesRes.data || []).forEach((q: any) => {
        docs.push({
          id: q.id,
          type: 'quote',
          title: `Quote — ${q.customer_name || 'Unnamed'}`,
          subtitle: [
            q.status,
            q.material_type,
            q.subtotal ? `$${q.subtotal.toFixed(0)}` : null,
          ].filter(Boolean).join(' · '),
          status: q.status,
          url: null,
          createdAt: q.created_at,
          linkedId: q.id,
        });
      });

      // Invoice documents
      (invoicesRes.data || []).forEach((inv: any) => {
        docs.push({
          id: inv.id,
          type: 'invoice',
          title: `Invoice ${inv.invoice_number || inv.id.slice(0, 8)}`,
          subtitle: [
            inv.payment_status,
            inv.amount_due ? `$${inv.amount_due.toFixed(0)}` : null,
          ].filter(Boolean).join(' · '),
          status: inv.payment_status,
          url: null,
          createdAt: inv.created_at,
          linkedId: inv.order_id,
        });
      });

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

    docs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    setDocuments(docs);
    setSignedDocs(signed);
    setIsLoading(false);
  }

  function handleCopyLink(contractId: string) {
    navigator.clipboard.writeText(`${window.location.origin}/contract/${contractId}`);
    toast({ title: 'Signing link copied' });
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Quick Document Actions */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Quick Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" onClick={() => navigate(`/sales/quotes/new?customerId=${customerId}`)}>
              <FileText className="w-3.5 h-3.5" />New Quote
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled title="Create from Contracts tab">
              <ScrollText className="w-3.5 h-3.5" />New Contract
            </Button>
            <Button size="sm" variant="outline" className="gap-1.5 text-xs" disabled title="Coming soon">
              <Send className="w-3.5 h-3.5" />Send Payment Link
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Signed Documents Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-green-600 dark:text-green-400" />
            Signed Documents
          </CardTitle>
          <CardDescription>
            {signedDocs.length > 0 ? `${signedDocs.length} signed document(s) on file` : 'No signed documents yet'}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {signedDocs.length === 0 ? (
            <div className="text-center py-4 text-muted-foreground">
              <FileSignature className="w-6 h-6 mx-auto mb-1.5 opacity-50" />
              <p className="text-sm">No signed contracts or addenda</p>
              <p className="text-xs mt-0.5">Signed documents will appear here automatically</p>
            </div>
          ) : (
            <div className="space-y-2">
              {signedDocs.map(doc => (
                <div key={doc.id} className="flex items-center justify-between p-3 rounded-lg border border-green-200 dark:border-green-800/40 bg-green-50/50 dark:bg-green-900/10 gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <CheckCircle className="w-4 h-4 text-green-600 dark:text-green-400 shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm font-medium truncate">{doc.title}</p>
                      <p className="text-xs text-muted-foreground truncate">
                        {doc.signerName && `Signed by ${doc.signerName}`}
                        {doc.signedAt && ` · ${format(new Date(doc.signedAt), 'MMM d, yyyy')}`}
                        {doc.serviceAddress && ` · ${doc.serviceAddress}`}
                      </p>
                      {(doc.contractVersion || doc.termsVersion) && (
                        <p className="text-[10px] text-muted-foreground/70">
                          Contract v{doc.contractVersion || '—'} · Terms v{doc.termsVersion || '—'}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    <Badge className="text-[10px] bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300">
                      {doc.docType === 'msa' ? 'MSA' : 'Addendum'}
                    </Badge>
                    {doc.pdfUrl ? (
                      <>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(doc.pdfUrl!, '_blank')}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" asChild>
                          <a href={doc.pdfUrl} download><Download className="w-3.5 h-3.5" /></a>
                        </Button>
                      </>
                    ) : (
                      <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(`/contract/${doc.id}`, '_blank')}>
                        <Eye className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => handleCopyLink(doc.id)}>
                      <Copy className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* All Documents */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">All Documents</CardTitle>
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
                        <p className="text-xs text-muted-foreground truncate">
                          {format(new Date(doc.createdAt), 'MMM d, yyyy')} · {doc.subtitle}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-1.5 shrink-0">
                      {doc.status && (
                        <Badge variant={doc.status === 'signed' || doc.status === 'paid' ? 'default' : 'secondary'} className="text-[10px]">
                          {doc.status}
                        </Badge>
                      )}
                      <Badge variant="outline" className="text-[10px]">
                        {TYPE_LABELS[doc.type]}
                      </Badge>
                      {doc.type === 'quote' && doc.linkedId && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => navigate(`/sales/quotes/${doc.linkedId}`)}>
                          <ExternalLink className="w-3.5 h-3.5" />
                        </Button>
                      )}
                      {doc.type === 'contract' || doc.type === 'addendum' ? (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(`/contract/${doc.id}`, '_blank')}>
                          <Eye className="w-3.5 h-3.5" />
                        </Button>
                      ) : null}
                      {doc.url && (
                        <Button size="sm" variant="ghost" className="h-7 w-7 p-0" onClick={() => window.open(doc.url!, '_blank')}>
                          <Download className="w-3.5 h-3.5" />
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
    </div>
  );
}
