import { useState, useEffect } from "react";
import { MessageSquare, Mail, Send, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { useToast } from "@/hooks/use-toast";
import {
  getMessageTemplates,
  renderTemplate,
  sendMessageDirect,
  getDefaultVariables,
  getMessagingMode,
  type MessageTemplate,
} from "@/lib/ghlMessaging";

interface SendMessageDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  channel: "sms" | "email";
  toAddress: string;
  contactId?: string;
  entityType?: string;
  entityId?: string;
  presetVariables?: Record<string, string>;
  allowedCategories?: string[];
  onSuccess?: () => void;
}

export function SendMessageDialog({
  open,
  onOpenChange,
  channel,
  toAddress,
  contactId,
  entityType,
  entityId,
  presetVariables = {},
  allowedCategories,
  onSuccess,
}: SendMessageDialogProps) {
  const [templates, setTemplates] = useState<MessageTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");
  const [subject, setSubject] = useState("");
  const [body, setBody] = useState("");
  const [sending, setSending] = useState(false);
  const [mode, setMode] = useState<"DRY_RUN" | "LIVE">("DRY_RUN");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadData();
    }
  }, [open, channel]);

  async function loadData() {
    setLoading(true);
    try {
      const [templatesData, modeVal] = await Promise.all([
        getMessageTemplates(channel),
        getMessagingMode(),
      ]);

      let filtered = templatesData;
      if (allowedCategories?.length) {
        filtered = templatesData.filter(
          (t) => t.category && allowedCategories.includes(t.category)
        );
      }

      setTemplates(filtered);
      setMode(modeVal);
    } catch (err) {
      console.error("Failed to load templates:", err);
    }
    setLoading(false);
  }

  async function handleTemplateSelect(templateKey: string) {
    setSelectedTemplate(templateKey);

    if (!templateKey) {
      setSubject("");
      setBody("");
      return;
    }

    const variables = {
      ...getDefaultVariables(),
      ...presetVariables,
    };

    try {
      const rendered = await renderTemplate(templateKey, variables);
      setSubject(rendered.subject || "");
      setBody(rendered.body);
    } catch (err) {
      console.error("Failed to render template:", err);
    }
  }

  async function handleSend() {
    if (!body.trim()) {
      toast({ title: "Message body is required", variant: "destructive" });
      return;
    }

    setSending(true);
    try {
      const result = await sendMessageDirect({
        channel,
        to_address: toAddress,
        subject: channel === "email" ? subject : undefined,
        body,
        contact_id: contactId,
        entity_type: entityType,
        entity_id: entityId,
      });

      if (result.success || result.status === "DRY_RUN") {
        toast({
          title: result.status === "DRY_RUN" ? "Message logged (DRY_RUN)" : "Message sent",
          description:
            result.status === "DRY_RUN"
              ? "Message was logged but not actually sent"
              : `${channel.toUpperCase()} sent to ${toAddress}`,
        });
        onOpenChange(false);
        onSuccess?.();
      } else {
        toast({
          title: "Failed to send",
          description: result.error || "Unknown error",
          variant: "destructive",
        });
      }
    } catch (err: any) {
      toast({
        title: "Error",
        description: err.message,
        variant: "destructive",
      });
    }
    setSending(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            {channel === "sms" ? (
              <MessageSquare className="w-5 h-5 text-blue-600" />
            ) : (
              <Mail className="w-5 h-5 text-purple-600" />
            )}
            Send {channel.toUpperCase()}
          </DialogTitle>
          <DialogDescription>
            Send a message to {toAddress}
          </DialogDescription>
        </DialogHeader>

        {mode === "DRY_RUN" && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-sm">
            <strong className="text-yellow-800">DRY_RUN Mode:</strong>{" "}
            <span className="text-yellow-700">
              Messages will be logged but not actually sent.
            </span>
          </div>
        )}

        <div className="space-y-4">
          <div>
            <Label>Template</Label>
            <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
              <SelectTrigger>
                <SelectValue placeholder="Select a template..." />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="">Custom Message</SelectItem>
                {templates.map((t) => (
                  <SelectItem key={t.key} value={t.key}>
                    {t.name}
                    {t.category && (
                      <span className="text-muted-foreground ml-2">({t.category})</span>
                    )}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {channel === "email" && (
            <div>
              <Label>Subject</Label>
              <input
                type="text"
                value={subject}
                onChange={(e) => setSubject(e.target.value)}
                className="w-full border rounded-md px-3 py-2"
                placeholder="Email subject..."
              />
            </div>
          )}

          <div>
            <Label>Message</Label>
            <Textarea
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={6}
              placeholder="Enter your message..."
            />
            {channel === "sms" && (
              <p className="text-xs text-muted-foreground mt-1">
                {body.length} characters
                {body.length > 160 && ` (${Math.ceil(body.length / 160)} segments)`}
              </p>
            )}
          </div>

          <div className="flex justify-between items-center pt-2">
            <Badge variant={mode === "LIVE" ? "default" : "secondary"}>
              {mode}
            </Badge>
            <div className="flex gap-2">
              <Button variant="outline" onClick={() => onOpenChange(false)}>
                Cancel
              </Button>
              <Button onClick={handleSend} disabled={sending || !body.trim()}>
                {sending ? (
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                ) : (
                  <Send className="w-4 h-4 mr-2" />
                )}
                {mode === "DRY_RUN" ? "Log Message" : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
