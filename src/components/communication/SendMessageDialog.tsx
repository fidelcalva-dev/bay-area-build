import { useState, useEffect } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { Send, AlertCircle, CheckCircle, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { toast } from "sonner";
import { sendOutboundMessage, getGHLMessagingMode } from "@/lib/ghlCommunication";
import { getMessageTemplates, type MessageTemplate } from "@/lib/ghlMessaging";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  // Target entity
  entityType: "customer" | "contact" | "lead" | "order";
  entityId: string;
  // Pre-filled contact info
  contactId?: string;
  customerId?: string;
  leadId?: string;
  phone?: string;
  email?: string;
  contactName?: string;
  // Default channel
  defaultChannel?: "sms" | "email";
}

export function SendMessageDialog({
  open,
  onOpenChange,
  entityType,
  entityId,
  contactId,
  customerId,
  leadId,
  phone,
  email,
  contactName,
  defaultChannel = "sms",
}: SendMessageDialogProps) {
  const queryClient = useQueryClient();
  const [channel, setChannel] = useState<"sms" | "email">(defaultChannel);
  const [templateKey, setTemplateKey] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [customPhone, setCustomPhone] = useState(phone || "");
  const [customEmail, setCustomEmail] = useState(email || "");

  // Get messaging mode
  const { data: messagingMode } = useQuery({
    queryKey: ["ghl-messaging-mode"],
    queryFn: getGHLMessagingMode,
  });

  // Get templates
  const { data: templates } = useQuery({
    queryKey: ["message-templates", channel],
    queryFn: () => getMessageTemplates(channel),
  });

  // Send mutation
  const sendMutation = useMutation({
    mutationFn: sendOutboundMessage,
    onSuccess: (result) => {
      if (result.success) {
        toast.success(
          result.status === "DRY_RUN" 
            ? "Message drafted (DRY_RUN mode)" 
            : "Message sent successfully"
        );
        queryClient.invalidateQueries({ queryKey: ["communication-timeline"] });
        onOpenChange(false);
        resetForm();
      } else {
        toast.error(result.error || "Failed to send message");
      }
    },
    onError: (error: Error) => {
      toast.error(error.message);
    },
  });

  // Reset form when dialog closes
  useEffect(() => {
    if (!open) {
      resetForm();
    }
  }, [open]);

  // Update body when template changes
  useEffect(() => {
    if (templateKey && templates) {
      const template = templates.find(t => t.key === templateKey);
      if (template) {
        setBody(template.body);
        setSubject(template.subject || "");
      }
    }
  }, [templateKey, templates]);

  // Reset channel-dependent fields when channel changes
  useEffect(() => {
    setTemplateKey("");
    setSubject("");
    if (channel === "sms") {
      setCustomPhone(phone || "");
    } else {
      setCustomEmail(email || "");
    }
  }, [channel, phone, email]);

  const resetForm = () => {
    setTemplateKey("");
    setSubject("");
    setBody("");
    setCustomPhone(phone || "");
    setCustomEmail(email || "");
  };

  const handleSend = () => {
    const targetPhone = channel === "sms" ? (customPhone || phone) : undefined;
    const targetEmail = channel === "email" ? (customEmail || email) : undefined;

    if (channel === "sms" && !targetPhone) {
      toast.error("Phone number is required for SMS");
      return;
    }
    if (channel === "email" && !targetEmail) {
      toast.error("Email address is required");
      return;
    }
    if (!body.trim()) {
      toast.error("Message body is required");
      return;
    }

    sendMutation.mutate({
      channel,
      contact_id: contactId,
      customer_id: customerId,
      lead_id: leadId,
      phone: targetPhone,
      email: targetEmail,
      template_key: templateKey || undefined,
      subject: channel === "email" ? subject : undefined,
      body,
      entity_type: entityType.toUpperCase(),
      entity_id: entityId,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Send className="w-5 h-5" />
            Send Message
            {contactName && (
              <span className="text-muted-foreground font-normal">
                to {contactName}
              </span>
            )}
          </DialogTitle>
          <DialogDescription>
            Send an SMS or Email via GoHighLevel
          </DialogDescription>
        </DialogHeader>

        {messagingMode === "DRY_RUN" && (
          <Alert>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              <strong>DRY_RUN mode active.</strong> Messages will be drafted but not actually sent.
            </AlertDescription>
          </Alert>
        )}

        <div className="space-y-4 py-4">
          {/* Channel Selection */}
          <div className="space-y-2">
            <Label>Channel</Label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={channel === "sms" ? "default" : "outline"}
                onClick={() => setChannel("sms")}
                className="flex-1"
              >
                SMS
              </Button>
              <Button
                type="button"
                variant={channel === "email" ? "default" : "outline"}
                onClick={() => setChannel("email")}
                className="flex-1"
              >
                Email
              </Button>
            </div>
          </div>

          {/* Recipient */}
          <div className="space-y-2">
            <Label>{channel === "sms" ? "Phone Number" : "Email Address"}</Label>
            {channel === "sms" ? (
              <Input
                type="tel"
                placeholder="(510) 555-1234"
                value={customPhone}
                onChange={(e) => setCustomPhone(e.target.value)}
              />
            ) : (
              <Input
                type="email"
                placeholder="customer@example.com"
                value={customEmail}
                onChange={(e) => setCustomEmail(e.target.value)}
              />
            )}
          </div>

          {/* Template Selection */}
          {templates && templates.length > 0 && (
            <div className="space-y-2">
              <Label>Template (optional)</Label>
              <Select value={templateKey} onValueChange={setTemplateKey}>
                <SelectTrigger>
                  <SelectValue placeholder="Select a template..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">No template</SelectItem>
                  {templates.map((t) => (
                    <SelectItem key={t.key} value={t.key}>
                      {t.name}
                      {t.category && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          {t.category}
                        </Badge>
                      )}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}

          {/* Subject (Email only) */}
          {channel === "email" && (
            <div className="space-y-2">
              <Label>Subject</Label>
              <Input
                placeholder="Email subject..."
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
              />
            </div>
          )}

          {/* Message Body */}
          <div className="space-y-2">
            <Label>Message</Label>
            <Textarea
              placeholder={channel === "sms" ? "Type your SMS message..." : "Type your email message..."}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={channel === "sms" ? 3 : 6}
              className="resize-none"
            />
            {channel === "sms" && (
              <p className="text-xs text-muted-foreground">
                {body.length} / 160 characters
                {body.length > 160 && ` (${Math.ceil(body.length / 160)} segments)`}
              </p>
            )}
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSend} disabled={sendMutation.isPending}>
            {sendMutation.isPending ? (
              <>
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                Sending...
              </>
            ) : (
              <>
                <Send className="w-4 h-4 mr-2" />
                {messagingMode === "DRY_RUN" ? "Save Draft" : "Send"}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
