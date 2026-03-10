/**
 * ContractsTab — Customer 360 tab showing all contracts with actions.
 */
import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import {
  FileText, Send, Eye, Upload, CheckCircle, Clock,
  Plus, MoreHorizontal, Copy, FileSignature,
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu, DropdownMenuContent, DropdownMenuItem,
  DropdownMenuTrigger, DropdownMenuSeparator,
} from '@/components/ui/dropdown-menu';
import { useToast } from '@/hooks/use-toast';

interface ContractRow {
  id: string;
  customer_id: string;
  contract_type: string;
  status: string;
  service_address: string | null;
  terms_content: string | null;
  signed_at: string | null;
  sent_at: string | null;
  viewed_at: string | null;
  signer_name: string | null;
  signer_email: string | null;
  file_url: string | null;
  expires_at: string | null;
  quote_id: string | null;
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
}

export function ContractsTab({ customerId, customerPhone, customerEmail, customerName }: Props) {
  const [contracts, setContracts] = useState<ContractRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => { loadContracts(); }, [customerId]);

  async function loadContracts() {
    setIsLoading(true);
    const { data } = await supabase
      .from('contracts' as 'orders')
      .select('*')
      .eq('customer_id' as 'id', customerId)
      .order('created_at', { ascending: false });
    setContracts((data as unknown as ContractRow[]) || []);
    setIsLoading(false);
  }

  function getSigningLink(contractId: string) {
    return `${window.location.origin}/contract/${contractId}`;
  }

  async function handleSendContract(contractId: string, method: 'sms' | 'email') {
    try {
      const link = getSigningLink(contractId);

      // Update sent_at
      await supabase
        .from('contracts' as 'orders')
        .update({ sent_at: new Date().toISOString() } as never)
        .eq('id' as 'id', contractId);

      // Log event
      await supabase
        .from('contract_events' as 'orders')
        .insert({
          contract_id: contractId,
          event_type: `sent_${method}`,
          metadata: { link, method },
        } as never);

      // Timeline event
      await supabase.from('timeline_events').insert({
        entity_type: 'CUSTOMER',
        entity_id: customerId,
        customer_id: customerId,
        event_type: 'SYSTEM',
        summary: `Contract sent via ${method.toUpperCase()}`,
        details_json: { contract_id: contractId, method, event: 'CONTRACT_SENT' },
      });

      // Try edge function for actual delivery
      try {
        await supabase.functions.invoke('send-contract', {
          body: { contractId, method, phone: customerPhone, email: customerEmail },
        });
      } catch {
        // Edge function may not exist yet; link still works
      }

      toast({ title: 'Contract sent', description: `Signing link sent via ${method}` });
      loadContracts();
    } catch {
      toast({ title: 'Error', description: 'Failed to send contract', variant: 'destructive' });
    }
  }

  async function handleMarkSigned(contractId: string) {
    await supabase
      .from('contracts' as 'orders')
      .update({
        status: 'signed',
        signed_at: new Date().toISOString(),
        signature_method: 'manual',
        signer_name: customerName || 'Manual',
      } as never)
      .eq('id' as 'id', contractId);

    await supabase.from('timeline_events').insert({
      entity_type: 'CUSTOMER',
      entity_id: customerId,
      customer_id: customerId,
      event_type: 'SYSTEM',
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

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-lg">Contracts</CardTitle>
            <CardDescription>{contracts.length} total contracts</CardDescription>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {contracts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <FileSignature className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p>No contracts yet</p>
            <p className="text-xs mt-1">Contracts will appear here when created from quotes or orders</p>
          </div>
        ) : (
          <div className="space-y-3">
            {contracts.map(contract => {
              const cfg = STATUS_CONFIG[contract.status] || STATUS_CONFIG.pending;
              const isPending = contract.status === 'pending';
              const Icon = cfg.icon;

              return (
                <div key={contract.id} className="rounded-lg border p-3 space-y-2.5">
                  {/* Header */}
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

                  {/* Signed info */}
                  {contract.status === 'signed' && (
                    <div className="text-xs text-muted-foreground bg-green-50 dark:bg-green-900/10 rounded p-2">
                      Signed by <span className="font-medium">{contract.signer_name || 'Unknown'}</span>
                      {contract.signed_at && ` on ${format(new Date(contract.signed_at), 'MMM d, yyyy h:mm a')}`}
                    </div>
                  )}

                  {/* Sent/Viewed info */}
                  {contract.sent_at && !contract.signed_at && (
                    <div className="text-xs text-muted-foreground">
                      Sent {format(new Date(contract.sent_at), 'MMM d, yyyy')}
                      {contract.viewed_at && ` · Viewed ${format(new Date(contract.viewed_at), 'MMM d h:mm a')}`}
                    </div>
                  )}

                  {/* Actions */}
                  <div className="flex items-center gap-1.5 flex-wrap">
                    {contract.file_url && (
                      <Button size="sm" variant="outline" className="h-8 text-xs gap-1" asChild>
                        <a href={contract.file_url} target="_blank" rel="noopener noreferrer">
                          <Eye className="w-3 h-3" />View
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
                              <DropdownMenuItem onClick={() => handleSendContract(contract.id, 'sms')}>
                                Send via SMS
                              </DropdownMenuItem>
                            )}
                            {customerEmail && (
                              <DropdownMenuItem onClick={() => handleSendContract(contract.id, 'email')}>
                                Send via Email
                              </DropdownMenuItem>
                            )}
                          </DropdownMenuContent>
                        </DropdownMenu>

                        <Button
                          size="sm"
                          variant="outline"
                          className="h-8 text-xs gap-1"
                          onClick={() => handleMarkSigned(contract.id)}
                        >
                          <CheckCircle className="w-3 h-3" />Mark Signed
                        </Button>
                      </>
                    )}

                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button size="sm" variant="ghost" className="h-8 w-8 p-0">
                          <MoreHorizontal className="w-3.5 h-3.5" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuItem onClick={() => handleCopyLink(contract.id)}>
                          <Copy className="w-3.5 h-3.5 mr-1.5" />Copy Signing Link
                        </DropdownMenuItem>
                        {isPending && (
                          <DropdownMenuItem onClick={() => handleSendContract(contract.id, 'sms')}>
                            <Send className="w-3.5 h-3.5 mr-1.5" />Resend
                          </DropdownMenuItem>
                        )}
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
