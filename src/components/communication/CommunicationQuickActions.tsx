import { useState } from "react";
import { MessageSquare, Mail, Phone, Send, FileSignature, CreditCard, Calendar } from "lucide-react";
import { Button } from "@/components/ui/button";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger, DropdownMenuSeparator } from "@/components/ui/dropdown-menu";
import { SendMessageDialog } from "@/components/messaging/SendMessageDialog";

interface CommunicationQuickActionsProps {
  entityType: "customer" | "lead" | "order" | "quote";
  entityId: string;
  phone?: string | null;
  email?: string | null;
  contactId?: string;
  customerId?: string;
  leadId?: string;
  customerName?: string;
  /** Show inline buttons instead of dropdown */
  inline?: boolean;
  /** Which actions to show */
  actions?: ("sms" | "email" | "call" | "quote" | "contract" | "payment" | "callback")[];
  /** Called after successful send */
  onActionComplete?: () => void;
  /** Compact mode for mobile */
  compact?: boolean;
}

export function CommunicationQuickActions({
  entityType,
  entityId,
  phone,
  email,
  contactId,
  customerId,
  leadId,
  customerName,
  inline = false,
  actions = ["sms", "email", "call"],
  onActionComplete,
  compact = false,
}: CommunicationQuickActionsProps) {
  const [smsDialogOpen, setSmsDialogOpen] = useState(false);
  const [emailDialogOpen, setEmailDialogOpen] = useState(false);

  const handleCall = () => {
    if (phone) {
      window.open(`tel:${phone}`, "_self");
    }
  };

  const presetVars: Record<string, string> = {};
  if (customerName) presetVars.customer_name = customerName;

  if (inline) {
    return (
      <>
        <div className="flex items-center gap-1.5 flex-wrap">
          {actions.includes("sms") && phone && (
            <Button
              size={compact ? "icon" : "sm"}
              variant="outline"
              onClick={() => setSmsDialogOpen(true)}
              title="Send SMS"
            >
              <MessageSquare className="w-4 h-4" />
              {!compact && <span className="ml-1.5">SMS</span>}
            </Button>
          )}
          {actions.includes("email") && email && (
            <Button
              size={compact ? "icon" : "sm"}
              variant="outline"
              onClick={() => setEmailDialogOpen(true)}
              title="Send Email"
            >
              <Mail className="w-4 h-4" />
              {!compact && <span className="ml-1.5">Email</span>}
            </Button>
          )}
          {actions.includes("call") && phone && (
            <Button
              size={compact ? "icon" : "sm"}
              variant="outline"
              onClick={handleCall}
              title="Call"
            >
              <Phone className="w-4 h-4" />
              {!compact && <span className="ml-1.5">Call</span>}
            </Button>
          )}
        </div>

        {phone && (
          <SendMessageDialog
            open={smsDialogOpen}
            onOpenChange={setSmsDialogOpen}
            channel="sms"
            toAddress={phone}
            contactId={contactId}
            entityType={entityType.toUpperCase()}
            entityId={entityId}
            presetVariables={presetVars}
            onSuccess={onActionComplete}
          />
        )}
        {email && (
          <SendMessageDialog
            open={emailDialogOpen}
            onOpenChange={setEmailDialogOpen}
            channel="email"
            toAddress={email}
            contactId={contactId}
            entityType={entityType.toUpperCase()}
            entityId={entityId}
            presetVariables={presetVars}
            onSuccess={onActionComplete}
          />
        )}
      </>
    );
  }

  return (
    <>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size={compact ? "icon" : "sm"} variant="outline">
            <Send className="w-4 h-4" />
            {!compact && <span className="ml-1.5">Communicate</span>}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="w-56">
          {actions.includes("sms") && phone && (
            <DropdownMenuItem onClick={() => setSmsDialogOpen(true)}>
              <MessageSquare className="w-4 h-4 mr-2 text-blue-600" />
              Send SMS
              <span className="ml-auto text-xs text-muted-foreground">{phone}</span>
            </DropdownMenuItem>
          )}
          {actions.includes("email") && email && (
            <DropdownMenuItem onClick={() => setEmailDialogOpen(true)}>
              <Mail className="w-4 h-4 mr-2 text-purple-600" />
              Send Email
            </DropdownMenuItem>
          )}
          {actions.includes("call") && phone && (
            <DropdownMenuItem onClick={handleCall}>
              <Phone className="w-4 h-4 mr-2 text-green-600" />
              Call
              <span className="ml-auto text-xs text-muted-foreground">{phone}</span>
            </DropdownMenuItem>
          )}

          {(actions.includes("quote") || actions.includes("contract") || actions.includes("payment")) && (
            <>
              <DropdownMenuSeparator />
              {actions.includes("quote") && (
                <DropdownMenuItem onClick={() => setSmsDialogOpen(true)}>
                  <FileSignature className="w-4 h-4 mr-2" />
                  Send Quote Link
                </DropdownMenuItem>
              )}
              {actions.includes("contract") && (
                <DropdownMenuItem onClick={() => setSmsDialogOpen(true)}>
                  <FileSignature className="w-4 h-4 mr-2" />
                  Send Contract
                </DropdownMenuItem>
              )}
              {actions.includes("payment") && (
                <DropdownMenuItem onClick={() => setSmsDialogOpen(true)}>
                  <CreditCard className="w-4 h-4 mr-2" />
                  Send Payment Reminder
                </DropdownMenuItem>
              )}
            </>
          )}

          {actions.includes("callback") && (
            <>
              <DropdownMenuSeparator />
              <DropdownMenuItem>
                <Calendar className="w-4 h-4 mr-2" />
                Schedule Callback
              </DropdownMenuItem>
            </>
          )}

          {!phone && !email && (
            <DropdownMenuItem disabled>
              No contact info available
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

      {phone && (
        <SendMessageDialog
          open={smsDialogOpen}
          onOpenChange={setSmsDialogOpen}
          channel="sms"
          toAddress={phone}
          contactId={contactId}
          entityType={entityType.toUpperCase()}
          entityId={entityId}
          presetVariables={presetVars}
          onSuccess={onActionComplete}
        />
      )}
      {email && (
        <SendMessageDialog
          open={emailDialogOpen}
          onOpenChange={setEmailDialogOpen}
          channel="email"
          toAddress={email}
          contactId={contactId}
          entityType={entityType.toUpperCase()}
          entityId={entityId}
          presetVariables={presetVars}
          onSuccess={onActionComplete}
        />
      )}
    </>
  );
}
