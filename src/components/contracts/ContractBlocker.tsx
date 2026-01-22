import { AlertTriangle, FileSignature, Send } from 'lucide-react';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Button } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

interface ContractBlockerProps {
  blockers: string[];
  onSendSMS?: () => void;
  onSendEmail?: () => void;
  isSending?: boolean;
}

export function ContractBlocker({ 
  blockers, 
  onSendSMS, 
  onSendEmail,
  isSending 
}: ContractBlockerProps) {
  if (blockers.length === 0) return null;

  return (
    <Alert variant="destructive" className="border-amber-500/50 bg-amber-500/10">
      <AlertTriangle className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-700">Contract Signature Required</AlertTitle>
      <AlertDescription className="mt-2">
        <ul className="list-disc list-inside space-y-1 text-amber-700">
          {blockers.map((blocker, idx) => (
            <li key={idx}>{blocker}</li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-amber-600">
          No service can be performed until contracts are signed.
        </p>
        
        {(onSendSMS || onSendEmail) && (
          <div className="mt-4">
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button 
                  variant="outline" 
                  size="sm"
                  disabled={isSending}
                  className="border-amber-500 text-amber-700 hover:bg-amber-500/20"
                >
                  <Send className="w-4 h-4 mr-2" />
                  {isSending ? 'Sending...' : 'Send Contract'}
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent>
                {onSendSMS && (
                  <DropdownMenuItem onClick={onSendSMS}>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Send via SMS
                  </DropdownMenuItem>
                )}
                {onSendEmail && (
                  <DropdownMenuItem onClick={onSendEmail}>
                    <FileSignature className="w-4 h-4 mr-2" />
                    Send via Email
                  </DropdownMenuItem>
                )}
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        )}
      </AlertDescription>
    </Alert>
  );
}
