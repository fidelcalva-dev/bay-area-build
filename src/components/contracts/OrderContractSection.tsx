import { useState } from 'react';
import { 
  FileSignature, 
  FileText, 
  Send, 
  Plus, 
  CheckCircle, 
  AlertTriangle,
  Loader2 
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { useOrderContracts } from '@/hooks/useOrderContracts';
import { ContractStatusBadge } from './ContractStatusBadge';
import { 
  getAddendumTemplateType, 
  AddendumTemplateType 
} from '@/lib/contractTemplates';
import { Contract } from '@/lib/contractService';

interface OrderContractSectionProps {
  orderId: string;
  customerId: string;
  serviceAddress: string;
  customerName: string;
  customerPhone: string;
  customerEmail?: string;
  customerType?: string;
  companyName?: string;
  dumpsterSize?: string;
  materialType?: string;
  rentalDays?: number;
  deliveryDate?: string;
  deliveryWindow?: string;
}

export function OrderContractSection({
  orderId,
  customerId,
  serviceAddress,
  customerName,
  customerPhone,
  customerEmail,
  customerType = 'homeowner',
  companyName,
  dumpsterSize = 'N/A',
  materialType = 'general',
  rentalDays = 7,
  deliveryDate,
  deliveryWindow,
}: OrderContractSectionProps) {
  const [generateDialogOpen, setGenerateDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<AddendumTemplateType>(
    getAddendumTemplateType(customerType)
  );

  const {
    msaContract,
    addendumContract,
    contractsValid,
    blockers,
    isLoading,
    isSending,
    isGenerating,
    generateAddendum,
    generateMSA,
    sendContract,
  } = useOrderContracts({
    orderId,
    customerId,
    serviceAddress,
    customerType,
  });

  const handleGenerateAddendum = async () => {
    await generateAddendum({
      customerName,
      customerPhone,
      customerEmail,
      companyName,
      serviceAddress,
      dumpsterSize,
      materialType,
      rentalDays,
      deliveryDate,
      deliveryWindow,
    });
    setGenerateDialogOpen(false);
  };

  const handleGenerateMSA = async () => {
    await generateMSA({
      customerName,
      companyName,
      customerPhone,
      customerEmail,
    });
  };

  const handleSend = (contract: Contract, method: 'sms' | 'email') => {
    sendContract(
      contract.id, 
      method, 
      customerPhone, 
      customerEmail
    );
  };

  if (isLoading) {
    return (
      <div className="bg-muted/50 rounded-lg p-4">
        <div className="flex items-center gap-2 text-muted-foreground">
          <Loader2 className="w-4 h-4 animate-spin" />
          Checking contracts...
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Contract Status Alert */}
      {!contractsValid && blockers.length > 0 && (
        <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
          <AlertTriangle className="h-4 w-4 text-amber-600" />
          <AlertTitle className="text-amber-700">Contract Signature Required</AlertTitle>
          <AlertDescription className="mt-2">
            <ul className="list-disc list-inside space-y-1 text-amber-700">
              {blockers.map((blocker, idx) => (
                <li key={idx}>{blocker}</li>
              ))}
            </ul>
            <p className="mt-2 text-sm text-amber-600">
              Scheduling cannot proceed until all required contracts are signed.
            </p>
          </AlertDescription>
        </Alert>
      )}

      {/* Contract Cards */}
      <div className="bg-muted/50 rounded-lg p-4">
        <h3 className="font-semibold flex items-center gap-2 mb-4">
          <FileSignature className="w-4 h-4" />
          Contracts
          {contractsValid && (
            <Badge variant="outline" className="bg-green-500/10 text-green-600 ml-2">
              <CheckCircle className="w-3 h-3 mr-1" />
              Valid
            </Badge>
          )}
        </h3>

        <div className="grid grid-cols-2 gap-4">
          {/* MSA Status */}
          <div className="border rounded-lg p-3 bg-background">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">MSA</span>
              {msaContract ? (
                <ContractStatusBadge status={msaContract.status} />
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Not Created
                </Badge>
              )}
            </div>

            {msaContract?.status === 'signed' ? (
              <p className="text-xs text-muted-foreground">
                Signed • Valid until expiration
              </p>
            ) : msaContract?.status === 'pending' ? (
              <div className="flex gap-2 mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={isSending}>
                      <Send className="w-3 h-3 mr-1" />
                      {isSending ? 'Sending...' : 'Send'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSend(msaContract, 'sms')}>
                      Send via SMS
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSend(msaContract, 'email')}>
                      Send via Email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Button 
                size="sm" 
                variant="outline" 
                onClick={handleGenerateMSA}
                disabled={isGenerating}
                className="mt-2"
              >
                {isGenerating ? (
                  <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                ) : (
                  <Plus className="w-3 h-3 mr-1" />
                )}
                Create MSA
              </Button>
            )}
          </div>

          {/* Addendum Status */}
          <div className="border rounded-lg p-3 bg-background">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium">Addendum</span>
              {addendumContract ? (
                <ContractStatusBadge status={addendumContract.status} />
              ) : (
                <Badge variant="outline" className="text-muted-foreground">
                  Not Created
                </Badge>
              )}
            </div>

            {addendumContract?.status === 'signed' ? (
              <p className="text-xs text-muted-foreground truncate" title={serviceAddress}>
                {serviceAddress?.slice(0, 30)}...
              </p>
            ) : addendumContract?.status === 'pending' ? (
              <div className="flex gap-2 mt-2">
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button size="sm" variant="outline" disabled={isSending}>
                      <Send className="w-3 h-3 mr-1" />
                      {isSending ? 'Sending...' : 'Send'}
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent>
                    <DropdownMenuItem onClick={() => handleSend(addendumContract, 'sms')}>
                      Send via SMS
                    </DropdownMenuItem>
                    <DropdownMenuItem onClick={() => handleSend(addendumContract, 'email')}>
                      Send via Email
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            ) : (
              <Dialog open={generateDialogOpen} onOpenChange={setGenerateDialogOpen}>
                <DialogTrigger asChild>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    disabled={isGenerating}
                    className="mt-2"
                  >
                    {isGenerating ? (
                      <Loader2 className="w-3 h-3 mr-1 animate-spin" />
                    ) : (
                      <Plus className="w-3 h-3 mr-1" />
                    )}
                    Generate Addendum
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Generate Service Addendum</DialogTitle>
                    <DialogDescription>
                      Create a service addendum for this order location
                    </DialogDescription>
                  </DialogHeader>

                  <div className="space-y-4 py-4">
                    <div className="space-y-2">
                      <Label>Template Type</Label>
                      <Select 
                        value={selectedTemplate} 
                        onValueChange={(v) => setSelectedTemplate(v as AddendumTemplateType)}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="residential">
                            Residential Service Addendum
                          </SelectItem>
                          <SelectItem value="contractor">
                            Contractor Service Addendum
                          </SelectItem>
                          <SelectItem value="commercial">
                            Commercial Service Addendum
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="bg-muted rounded-lg p-3 text-sm space-y-1">
                      <p><strong>Customer:</strong> {customerName}</p>
                      <p><strong>Address:</strong> {serviceAddress}</p>
                      <p><strong>Size:</strong> {dumpsterSize}</p>
                      <p><strong>Material:</strong> {materialType}</p>
                      <p><strong>Rental:</strong> {rentalDays} days</p>
                    </div>
                  </div>

                  <DialogFooter>
                    <Button 
                      variant="outline" 
                      onClick={() => setGenerateDialogOpen(false)}
                    >
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleGenerateAddendum}
                      disabled={isGenerating}
                    >
                      {isGenerating ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Generating...
                        </>
                      ) : (
                        <>
                          <FileText className="w-4 h-4 mr-2" />
                          Generate
                        </>
                      )}
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
