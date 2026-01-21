import { useEffect, useState } from 'react';
import { Loader2, Send, MessageSquare, Phone, Clock, ArrowUpRight, ArrowDownLeft } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { format } from 'date-fns';

interface Message {
  id: string;
  customer_phone: string;
  direction: string;
  channel: string;
  template_key: string | null;
  message_body: string;
  status: string;
  created_at: string;
}

interface Template {
  template_key: string;
  template_name: string;
  template_body: string;
  variables: string[];
}

export default function CSMessages() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSending, setIsSending] = useState(false);
  const [phone, setPhone] = useState('');
  const [selectedTemplate, setSelectedTemplate] = useState<string>('');
  const [customMessage, setCustomMessage] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [messagesRes, templatesRes] = await Promise.all([
      supabase
        .from('message_history')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100),
      supabase
        .from('sms_templates')
        .select('template_key, template_name, template_body, variables')
        .eq('is_active', true),
    ]);

    if (messagesRes.data) setMessages(messagesRes.data);
    if (templatesRes.data) setTemplates(templatesRes.data);
    setIsLoading(false);
  }

  function handleTemplateSelect(key: string) {
    setSelectedTemplate(key);
    const template = templates.find((t) => t.template_key === key);
    if (template) {
      setCustomMessage(template.template_body);
    }
  }

  async function handleSendMessage() {
    if (!phone || !customMessage) {
      toast({ title: 'Error', description: 'Phone and message are required', variant: 'destructive' });
      return;
    }

    setIsSending(true);

    // In production, this would call an edge function to send via Twilio
    const { error } = await supabase.from('message_history').insert([
      {
        customer_phone: phone,
        direction: 'outbound',
        channel: 'sms',
        template_key: selectedTemplate || null,
        message_body: customMessage,
        status: 'sent',
      },
    ]);

    if (error) {
      toast({ title: 'Error sending message', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Message sent' });
      setPhone('');
      setCustomMessage('');
      setSelectedTemplate('');
      fetchData();
    }
    setIsSending(false);
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Messages</h1>
        <p className="text-muted-foreground mt-1">
          Send templated or custom SMS messages
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Compose Panel */}
        <Card className="lg:col-span-1">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Send className="w-5 h-5" />
              Send Message
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium">Phone Number</label>
              <Input
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+15101234567"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Template (optional)</label>
              <Select value={selectedTemplate} onValueChange={handleTemplateSelect}>
                <SelectTrigger>
                  <SelectValue placeholder="Select template..." />
                </SelectTrigger>
                <SelectContent>
                  {templates.map((t) => (
                    <SelectItem key={t.template_key} value={t.template_key}>
                      {t.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={customMessage}
                onChange={(e) => setCustomMessage(e.target.value)}
                placeholder="Type your message..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {customMessage.length} characters
              </p>
            </div>

            <Button className="w-full" onClick={handleSendMessage} disabled={isSending}>
              {isSending ? (
                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              ) : (
                <Send className="w-4 h-4 mr-2" />
              )}
              Send SMS
            </Button>
          </CardContent>
        </Card>

        {/* Message History */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageSquare className="w-5 h-5" />
              Recent Messages
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-[600px] overflow-y-auto">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`p-3 rounded-lg border ${
                    msg.direction === 'outbound' ? 'bg-primary/5 border-primary/20' : 'bg-muted'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-2">
                      {msg.direction === 'outbound' ? (
                        <ArrowUpRight className="w-4 h-4 text-primary" />
                      ) : (
                        <ArrowDownLeft className="w-4 h-4 text-muted-foreground" />
                      )}
                      <span className="font-mono text-sm">{msg.customer_phone}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      <Clock className="w-3 h-3" />
                      {format(new Date(msg.created_at), 'MMM d, HH:mm')}
                    </div>
                  </div>
                  <p className="text-sm">{msg.message_body}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {msg.channel.toUpperCase()}
                    </Badge>
                    {msg.template_key && (
                      <Badge variant="secondary" className="text-xs">
                        {msg.template_key}
                      </Badge>
                    )}
                    <Badge
                      className={`text-xs ${
                        msg.status === 'sent'
                          ? 'bg-green-100 text-green-800'
                          : msg.status === 'failed'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {msg.status}
                    </Badge>
                  </div>
                </div>
              ))}
              {messages.length === 0 && (
                <p className="text-center text-muted-foreground py-8">
                  No messages yet
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
