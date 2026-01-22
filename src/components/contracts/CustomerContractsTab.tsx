import { useState, useEffect } from 'react';
import { FileText, Plus, Send, Clock, CheckCircle } from 'lucide-react';
import { format } from 'date-fns';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ContractStatusBadge } from './ContractStatusBadge';
import { 
  Contract, 
  ContractType, 
  createContract, 
  getCustomerContracts 
} from '@/lib/contractService';

interface CustomerContractsTabProps {
  customerId: string;
  customerPhone?: string;
  customerEmail?: string;
}

export function CustomerContractsTab({ 
  customerId, 
  customerPhone,
  customerEmail 
}: CustomerContractsTabProps) {
  const [contracts, setContracts] = useState<Contract[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    loadContracts();
  }, [customerId]);

  async function loadContracts() {
    setIsLoading(true);
    const data = await getCustomerContracts(customerId);
    setContracts(data);
    setIsLoading(false);
  }

  async function handleCreateContract(type: ContractType, address?: string) {
    const { contract, error } = await createContract({
      customerId,
      contractType: type,
      serviceAddress: address,
    });

    if (error) {
      toast({ title: 'Error', description: error, variant: 'destructive' });
      return;
    }

    toast({ title: 'Contract Created', description: `${type.toUpperCase()} created successfully` });
    loadContracts();
  }

  async function handleSendContract(contractId: string, method: 'sms' | 'email') {
    setIsSending(contractId);
    
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const { data, error } = await supabase.functions.invoke('send-contract', {
        body: {
          contractId,
          method,
          phone: customerPhone,
          email: customerEmail,
          actorId: user?.id,
          actorRole: 'staff',
        },
      });

      if (error) throw error;

      toast({ 
        title: 'Contract Sent', 
        description: `Contract sent via ${method.toUpperCase()}` 
      });
    } catch (err) {
      toast({ 
        title: 'Error', 
        description: err instanceof Error ? err.message : 'Failed to send contract',
        variant: 'destructive' 
      });
    } finally {
      setIsSending(null);
    }
  }

  const msaContract = contracts.find(c => c.contract_type === 'msa' && c.status === 'signed');
  const pendingMsa = contracts.find(c => c.contract_type === 'msa' && c.status === 'pending');
  const addendums = contracts.filter(c => c.contract_type === 'addendum');

  if (isLoading) {
    return <div className="p-4 text-muted-foreground">Loading contracts...</div>;
  }

  return (
    <div className="space-y-6">
      {/* MSA Section */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Master Service Agreement
          </h3>
          {!msaContract && !pendingMsa && (
            <Button size="sm" onClick={() => handleCreateContract('msa')}>
              <Plus className="w-4 h-4 mr-1" />
              Create MSA
            </Button>
          )}
        </div>

        {msaContract ? (
          <div className="flex items-center gap-4 p-3 bg-green-500/10 rounded-lg">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <div>
              <p className="font-medium text-green-700">MSA Signed</p>
              <p className="text-sm text-muted-foreground">
                Signed on {format(new Date(msaContract.signed_at!), 'MMM d, yyyy')}
                {msaContract.expires_at && ` • Expires ${format(new Date(msaContract.expires_at), 'MMM d, yyyy')}`}
              </p>
            </div>
          </div>
        ) : pendingMsa ? (
          <div className="flex items-center justify-between p-3 bg-amber-500/10 rounded-lg">
            <div className="flex items-center gap-4">
              <Clock className="w-5 h-5 text-amber-600" />
              <div>
                <p className="font-medium text-amber-700">MSA Pending Signature</p>
                <p className="text-sm text-muted-foreground">
                  Created {format(new Date(pendingMsa.created_at), 'MMM d, yyyy')}
                </p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  size="sm" 
                  variant="outline"
                  disabled={isSending === pendingMsa.id}
                >
                  <Send className="w-4 h-4 mr-1" />
                  {isSending === pendingMsa.id ? 'Sending...' : 'Send'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                <DropdownMenuItem onClick={() => handleSendContract(pendingMsa.id, 'sms')}>
                  Send via SMS
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleSendContract(pendingMsa.id, 'email')}>
                  Send via Email
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        ) : (
          <p className="text-muted-foreground text-sm">No MSA on file</p>
        )}
      </div>

      {/* Addendums Section */}
      <div className="bg-card rounded-lg border p-4">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold flex items-center gap-2">
            <FileText className="w-4 h-4" />
            Service Addendums
          </h3>
        </div>

        {addendums.length > 0 ? (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Address</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Date</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {addendums.map((addendum) => (
                <TableRow key={addendum.id}>
                  <TableCell className="font-medium">
                    {addendum.service_address || 'N/A'}
                  </TableCell>
                  <TableCell>
                    <ContractStatusBadge status={addendum.status} />
                  </TableCell>
                  <TableCell>
                    {addendum.signed_at 
                      ? format(new Date(addendum.signed_at), 'MMM d, yyyy')
                      : format(new Date(addendum.created_at), 'MMM d, yyyy')
                    }
                  </TableCell>
                  <TableCell className="text-right">
                    {addendum.status === 'pending' && (
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button 
                            size="sm" 
                            variant="ghost"
                            disabled={isSending === addendum.id}
                          >
                            <Send className="w-4 h-4" />
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent>
                          <DropdownMenuItem onClick={() => handleSendContract(addendum.id, 'sms')}>
                            Send via SMS
                          </DropdownMenuItem>
                          <DropdownMenuItem onClick={() => handleSendContract(addendum.id, 'email')}>
                            Send via Email
                          </DropdownMenuItem>
                        </DropdownMenuContent>
                      </DropdownMenu>
                    )}
                    {addendum.pdf_url && (
                      <Button size="sm" variant="ghost" asChild>
                        <a href={addendum.pdf_url} target="_blank" rel="noopener noreferrer">
                          View PDF
                        </a>
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        ) : (
          <p className="text-muted-foreground text-sm">No addendums on file</p>
        )}
      </div>
    </div>
  );
}
