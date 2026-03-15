/**
 * ContractsTab — Customer 360 tab showing contracts from both
 * `contracts` (MSA-style by customer) and `quote_contracts` (per-quote signing).
 * Shows version history, e-sign status, document actions, and acceptance log.
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  FileText, Send, Eye, CheckCircle, Clock, RefreshCw,
  MoreHorizontal, Copy, Upload, ShieldCheck, Plus, FileSignature,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';
import { CONTRACT_VERSION, ADDENDUM_VERSION, POLICY_VERSION } from '@/lib/policyLanguage';
import { createContract } from '@/lib/contractService';
import { buildMSATerms, buildAddendumTerms, getAddendumTemplateType } from '@/lib/contractTemplates';

interface ContractRow {
  id: string;
  source: 'msa' | 'quote';
  contract_type: string;
  status: string;
  service_address: string | null;
  signed_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signer_name: string | null;
  signer_email: string | null;
  file_url: string | null;
  quote_id: string | null;
  contract_version: string | null;
  terms_version: string | null;
  esign_consent_at: string | null;
  parent_contract_id: string | null;
  delivery_method: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; className: string; icon: typeof CheckCircle }> = {
  pending: { label: 'Pending', className: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300', icon: Clock },
  signed: { label: 'Signed', className: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300', icon: CheckCircle },
  declined: { label: 'Declined', className: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300', icon: Clock },
  expired: { label: 'Expired', className: 'bg-muted text-muted-foreground', icon: Clock },
};

interface Props {
  customerId: string;
  customerPhone?: string | null;
  customerEmail?: string | null;
  customerName?: string | null;
  customerType?: string | null;
}

export function ContractsTab({ customerId, customerPhone, customerEmail, customerName, customerType }: Props) {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreating, setIsCreating] = useState(false);
  const { toast } = useToast();

  useEffect(() => { loadContracts(); }, [customerId]);

  async function loadContracts() {
    setIsLoading(true);
    try {
      const [msaRes, quoteRes] = await Promise.all([
        supabase.from('contracts')
          .select('id, contract_type, status, service_address, signed_at, pdf_url, created_at, contract_version, terms_version, signer_name, signer_email, esign_consent_at, parent_contract_id, viewed_at, quote_id, delivery_method')
          .eq('customer_id', customerId)
          .order('created_at', { ascending: false }),
        supabase.from('quote_contracts')
          .select('id, status, service_address, signed_at, sent_at, customer_name, quote_id, created_at')
          .order('created_at', { ascending: false }),
      ]);

      const msaContracts: ContractRow[] = (msaRes.data || []).map((c: any) => ({
        id: c.id,
        source: 'msa' as const,
        contract_type: c.contract_type || 'msa',
        status: c.status,
        service_address: c.service_address,
        signed_at: c.signed_at,
        sent_at: null,
        viewed_at: c.viewed_at,
        signer_name: c.signer_name,
        signer_email: c.signer_email,
        file_url: c.pdf_url,
        quote_id: c.quote_id,
        contract_version: c.contract_version,
        terms_version: c.terms_version,
        esign_consent_at: c.esign_consent_at,
        parent_contract_id: c.parent_contract_id,
        delivery_method: c.delivery_method,
        created_at: c.created_at,
      }));

      const quoteContracts: ContractRow[] = (quoteRes.data || []).map((c: any) => ({
        id: c.id,
        source: 'quote' as const,
        contract_type: 'service_addendum',
        status: c.status,
        service_address: c.service_address,
        signed_at: c.signed_at,
        sent_at: c.sent_at,
        viewed_at: null,
        signer_name: c.customer_name,
        signer_email: null,
        file_url: null,
        quote_id: c.quote_id,
        contract_version: null,
        terms_version: null,
        esign_consent_at: null,
        parent_contract_id: null,
        delivery_method: null,
        created_at: c.created_at,
      }));

      setContracts([...msaContracts, ...quoteContracts].sort((a, b) =>
        new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
      ));
    } catch (err) {
      console.error('Failed to load contracts', err);
    }
    setIsLoading(false);
  }

  function getSigningLink(contractId: string) {
    return `${window.location.origin}/contract/${contractId}`;
  }

  async function handleCreateMSA() {
    setIsCreating(true);
    try {
      const termsContent = buildMSATerms({
        customerName: customerName || 'Customer',
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || undefined,
      });
      const { contract, error } = await createContract({
        customerId,
        contractType: 'msa',
        termsContent,
      });
      if (error) throw new Error(error);

      // Timeline event
      await supabase.from('timeline_events').insert({
        entity_type: 'CUSTOMER' as const,
        entity_id: customerId,
        customer_id: customerId,
        event_type: 'SYSTEM' as const,
        event_action: 'CREATED' as const,
        summary: 'Master Service Agreement created',
        details_json: { contract_id: contract?.id, event: 'CONTRACT_CREATED' },
      });

      toast({ title: 'MSA created', description: 'Ready to send for signature' });
      loadContracts();
    } catch {
      toast({ title: 'Error', description: 'Failed to create MSA', variant: 'destructive' });
    }
    setIsCreating(false);
  }

  async function handleCreateAddendum(serviceAddress: string) {
    setIsCreating(true);
    try {
      const templateType = getAddendumTemplateType(customerType || 'residential');
      const termsContent = buildAddendumTerms(templateType, {
        customerName: customerName || 'Customer',
        customerPhone: customerPhone || '',
        customerEmail: customerEmail || undefined,
        serviceAddress,
        dumpsterSize: 'TBD',
        materialType: 'TBD',
        rentalDays: 7,
      });

      // Find MSA for parent reference
      const msaContract = contracts.find(c => c.contract_type === 'msa' && c.status === 'signed');

      const { contract, error } = await createContract({
        customerId,
        contractType: 'addendum',
        serviceAddress,
        termsContent,
      });
      if (error) throw new Error(error);

      // Timeline event
      await supabase.from('timeline_events').insert({
        entity_type: 'CUSTOMER' as const,
        entity_id: customerId,
        customer_id: customerId,
        event_type: 'SYSTEM' as const,
        event_action: 'CREATED' as const,
        summary: `Service Addendum created for ${serviceAddress}`,
        details_json: { contract_id: contract?.id, parent_msa_id: msaContract?.id, event: 'ADDENDUM_CREATED' },
      });

      toast({ title: 'Addendum created', description: `For ${serviceAddress}` });
      loadContracts();
    } catch {
      toast({ title: 'Error', description: 'Failed to create addendum', variant: 'destructive' });
    }
    setIsCreating(false);
  }

  async function handleSendContract(contractId: string, method: 'sms' | 'email') {
    try {
      await supabase.from('timeline_events').insert({
        entity_type: 'CUSTOMER' as const,
        entity_id: customerId,
        customer_id: customerId,
        event_type: 'SYSTEM' as const,
        event_action: 'SENT' as const,
        summary: `Contract sent via ${method.toUpperCase()}`,
        details_json: { contract_id: contractId, method, event: 'CONTRACT_SENT' },
      });

      try {
        await supabase.functions.invoke('send-contract', {
          body: { contractId, method, phone: customerPhone, email: customerEmail },
        });
      } catch { /* edge function may not exist yet */ }

      toast({ title: 'Contract sent', description: `Signing link sent via ${method}` });
      loadContracts();
    } catch {
      toast({ title: 'Error', description: 'Failed to send contract', variant: 'destructive' });
    }
  }

  async function handleMarkSigned(contractId: string, source: 'msa' | 'quote') {
    const table = source === 'msa' ? 'contracts' : 'quote_contracts';
    await supabase
      .from(table as 'contracts')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
      } as never)
      .eq('id', contractId);

    await supabase.from('timeline_events').insert({
      entity_type: 'CUSTOMER' as const,
      entity_id: customerId,
      customer_id: customerId,
      event_type: 'SYSTEM' as const,
      event_action: 'COMPLETED' as const,
      summary: 'Contract manually marked as signed',
      details_json: { contract_id: contractId, event: 'CONTRACT_SIGNED' },
    });

    toast({ title: 'Contract marked as signed' });
    loadContracts();
  }

  function handleCopyLink(contractId: string) {
    navigator.clipboard.writeText(getSigningLink(contractId));
    toast({ title: 'Signing link copied' });
  }

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading contracts...</div>;
  }

  const msaContracts = contracts.filter(c => c.contract_type === 'msa');
  const addenda = contracts.filter(c => c.contract_type !== 'msa');
  const hasMSA = msaContracts.some(c => c.status === 'signed');
  const hasPendingMSA = msaContracts.some(c => c.status === 'pending');

  return (
    <div className="space-y-4">
      {/* Summary */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-lg">Contracts & Agreements</CardTitle>
              <CardDescription>
                {msaContracts.length} MSA · {addenda.length} Addenda · Policy v{POLICY_VERSION}
              </CardDescription>
            </div>
            <div className="flex items-center gap-1.5">
              {!hasMSA && !hasPendingMSA && (
                <Button size="sm" variant="default" className="gap-1" onClick={handleCreateMSA} disabled={isCreating}>
                  <Plus className="w-3.5 h-3.5" />Create MSA
                </Button>
              )}
              {hasMSA && (
                <Button
                  size="sm"
                  variant="outline"
                  className="gap-1"
                  disabled={isCreating}
                  onClick={() => {
                    const address = prompt('Enter service address for the addendum:');
                    if (address?.trim()) handleCreateAddendum(address.trim());
                  }}
                >
                  <FileSignature className="w-3.5 h-3.5" />New Addendum
                </Button>
              )}
              <Button size="sm" variant="ghost" onClick={loadContracts}>
                <RefreshCw className="w-3.5 h-3.5" />
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* MSA Section */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Master Service Agreement</CardTitle>
        </CardHeader>
        <CardContent>
          {msaContracts.length === 0 ? (
            <div className="text-sm text-muted-foreground space-y-2">
              <p>No MSA on file</p>
              {!hasPendingMSA && (
                <Button size="sm" variant="outline" className="gap-1" onClick={handleCreateMSA} disabled={isCreating}>
                  <Plus className="w-3.5 h-3.5" />Create MSA
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-3">
              {msaContracts.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onSend={handleSendContract}
                  onMarkSigned={handleMarkSigned}
                  onCopyLink={handleCopyLink}
                  customerPhone={customerPhone}
                  customerEmail={customerEmail}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Addenda Section */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base">Service Addenda</CardTitle>
            {hasMSA && (
              <Button
                size="sm"
                variant="ghost"
                className="gap-1 text-xs"
                disabled={isCreating}
                onClick={() => {
                  const address = prompt('Enter service address:');
                  if (address?.trim()) handleCreateAddendum(address.trim());
                }}
              >
                <Plus className="w-3 h-3" />Add
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent>
          {addenda.length === 0 ? (
            <p className="text-sm text-muted-foreground">No addenda on file</p>
          ) : (
            <div className="space-y-3">
              {addenda.map(contract => (
                <ContractCard
                  key={contract.id}
                  contract={contract}
                  onSend={handleSendContract}
                  onMarkSigned={handleMarkSigned}
                  onCopyLink={handleCopyLink}
                  customerPhone={customerPhone}
                  customerEmail={customerEmail}
                />
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

function ContractCard({
  contract,
  onSend,
  onMarkSigned,
  onCopyLink,
  customerPhone,
  customerEmail,
}: {
  contract: ContractRow;
  onSend: (id: string, method: 'sms' | 'email') => void;
  onMarkSigned: (id: string, source: 'msa' | 'quote') => void;
  onCopyLink: (id: string) => void;
  customerPhone?: string | null;
  customerEmail?: string | null;
}) {
  const cfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
  const isPending = contract.status === 'pending';
  const isSigned = contract.status === 'signed';
  const Icon = cfg.icon;

  return (
    <div className="rounded-lg border p-3 space-y-2.5">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0 flex-1">
          <p className="font-medium text-sm">
            {contract.contract_type === 'msa' ? 'Master Service Agreement' : 'Service Addendum'}
          </p>
          <p className="text-xs text-muted-foreground">
            {format(new Date(contract.created_at), 'MMM d, yyyy')}
            {contract.service_address && ` · ${contract.service_address}`}
          </p>
        </div>
        <Badge className={`text-[10px] ${cfg.className}`}>
          <Icon className="w-3 h-3 mr-1" />{cfg.label}
        </Badge>
      </div>

      {/* Signed details */}
      {isSigned && (
        <div className="text-xs text-muted-foreground bg-primary/5 rounded p-2 space-y-1">
          <div>
            Signed by <span className="font-medium">{contract.signer_name || 'Unknown'}</span>
            {contract.signed_at && ` on ${format(new Date(contract.signed_at), 'MMM d, yyyy h:mm a')}`}
          </div>
          {contract.signer_email && (
            <div>Email: {contract.signer_email}</div>
          )}
          {contract.delivery_method && (
            <div>Delivered via: {contract.delivery_method}</div>
          )}
          {contract.esign_consent_at && (
            <div className="flex items-center gap-1 text-green-700 dark:text-green-400">
              <ShieldCheck className="w-3 h-3" />
              E-sign consent recorded
            </div>
          )}
          {(contract.contract_version || contract.terms_version) && (
            <div className="text-muted-foreground/70">
              Contract v{contract.contract_version || '—'} · Terms v{contract.terms_version || '—'}
            </div>
          )}
        </div>
      )}

      {/* Viewed but not signed */}
      {contract.viewed_at && !contract.signed_at && (
        <div className="text-xs text-muted-foreground">
          Viewed {format(new Date(contract.viewed_at), 'MMM d, yyyy h:mm a')}
        </div>
      )}

      {contract.sent_at && !contract.signed_at && (
        <div className="text-xs text-muted-foreground">
          Sent {format(new Date(contract.sent_at), 'MMM d, yyyy')}
        </div>
      )}

      {/* Actions */}
      <div className="flex items-center gap-1.5 flex-wrap">
        {contract.file_url && (
          <Button size="sm" variant="outline" className="h-8 text-xs gap-1" asChild>
            <a href={contract.file_url} target="_blank" rel="noopener noreferrer">
              <Eye className="w-3 h-3" />View PDF
            </a>
          </Button>
        )}

        {isPending && (
          <>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                  <Send className="w-3 h-3" />Send
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {customerPhone && (
                  <DropdownMenuItem onClick={() => onSend(contract.id, 'sms')}>
                    Send via SMS
                  </DropdownMenuItem>
                )}
                {customerEmail && (
                  <DropdownMenuItem onClick={() => onSend(contract.id, 'email')}>
                    Send via Email
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>

            <Button
              size="sm"
              variant="outline"
              className="h-8 text-xs gap-1"
              onClick={() => onMarkSigned(contract.id, contract.source)}
            >
              <CheckCircle className="w-3 h-3" />Mark Signed
            </Button>
          </>
        )}

        {isSigned && (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button size="sm" variant="outline" className="h-8 text-xs gap-1">
                <Send className="w-3 h-3" />Resend
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              {customerPhone && (
                <DropdownMenuItem onClick={() => onSend(contract.id, 'sms')}>
                  Resend via SMS
                </DropdownMenuItem>
              )}
              {customerEmail && (
                <DropdownMenuItem onClick={() => onSend(contract.id, 'email')}>
                  Resend via Email
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        )}

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
              <MoreHorizontal className="w-3.5 h-3.5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => onCopyLink(contract.id)}>
              <Copy className="w-3.5 h-3.5 mr-1.5" />Copy Signing Link
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => window.open(`/contract/${contract.id}`, '_blank')}>
              <Eye className="w-3.5 h-3.5 mr-1.5" />View Contract
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}
