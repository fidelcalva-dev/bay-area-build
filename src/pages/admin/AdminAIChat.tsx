// Admin AI Chat Dashboard - View and manage chat conversations
import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { ScrollArea } from '@/components/ui/scroll-area';
import { 
  MessageCircle, Search, Check, ExternalLink, User, Bot, 
  Phone, Mail, Calendar, ArrowRight, Filter
} from 'lucide-react';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';

interface Conversation {
  id: string;
  status: string;
  customer_name: string | null;
  customer_phone: string | null;
  customer_email: string | null;
  context_json: Record<string, unknown>;
  source: string;
  created_at: string;
  updated_at: string;
  escalation_reason: string | null;
}

interface Message {
  id: string;
  role: string;
  content: string;
  created_at: string;
  quick_replies: string[] | null;
}

const statusColors: Record<string, string> = {
  active: 'bg-blue-100 text-blue-800',
  handled: 'bg-green-100 text-green-800',
  escalated: 'bg-amber-100 text-amber-800',
  closed: 'bg-muted text-muted-foreground',
};

export default function AdminAIChat() {
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch conversations
  const { data: conversations = [], isLoading } = useQuery({
    queryKey: ['ai-chat-conversations', statusFilter],
    queryFn: async () => {
      let query = supabase
        .from('chat_conversations')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(100);
      if (statusFilter !== 'all') query = query.eq('status', statusFilter);
      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as Conversation[];
    },
  });

  // Fetch messages for selected conversation
  const { data: messages = [] } = useQuery({
    queryKey: ['ai-chat-messages', selectedId],
    queryFn: async () => {
      if (!selectedId) return [];
      const { data, error } = await supabase
        .from('chat_messages')
        .select('*')
        .eq('conversation_id', selectedId)
        .order('created_at', { ascending: true });
      if (error) throw error;
      return (data || []) as Message[];
    },
    enabled: !!selectedId,
  });

  // Mark as handled
  const markHandled = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('chat_conversations')
        .update({ status: 'handled', handled_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['ai-chat-conversations'] }),
  });

  const filtered = conversations.filter(c => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      c.customer_name?.toLowerCase().includes(s) ||
      c.customer_phone?.includes(s) ||
      c.customer_email?.toLowerCase().includes(s)
    );
  });

  const selected = conversations.find(c => c.id === selectedId);

  return (
    <div className="flex h-[calc(100vh-120px)] gap-4">
      {/* Conversation List */}
      <div className="w-96 flex flex-col border rounded-lg bg-card shrink-0">
        <div className="p-3 border-b space-y-2">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            <MessageCircle className="w-5 h-5" /> AI Chat Conversations
          </h2>
          <div className="relative">
            <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-muted-foreground" />
            <Input placeholder="Search by name, phone, email..." value={search} onChange={e => setSearch(e.target.value)} className="pl-8 h-9 text-sm" />
          </div>
          <div className="flex gap-1.5">
            {['all', 'active', 'escalated', 'handled', 'closed'].map(s => (
              <button key={s} onClick={() => setStatusFilter(s)} className={cn("px-2.5 py-1 text-xs rounded-full capitalize", statusFilter === s ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground hover:bg-muted/80')}>
                {s}
              </button>
            ))}
          </div>
        </div>
        <ScrollArea className="flex-1">
          {isLoading ? (
            <p className="p-4 text-sm text-muted-foreground">Loading...</p>
          ) : filtered.length === 0 ? (
            <p className="p-4 text-sm text-muted-foreground">No conversations found.</p>
          ) : (
            filtered.map(conv => (
              <button key={conv.id} onClick={() => setSelectedId(conv.id)} className={cn("w-full text-left p-3 border-b hover:bg-muted/50 transition-colors", selectedId === conv.id && "bg-muted")}>
                <div className="flex items-center justify-between mb-1">
                  <span className="font-medium text-sm truncate">{conv.customer_name || 'Anonymous visitor'}</span>
                  <Badge className={cn("text-[10px] px-1.5", statusColors[conv.status])}>{conv.status}</Badge>
                </div>
                <div className="flex items-center gap-3 text-xs text-muted-foreground">
                  {conv.customer_phone && <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{conv.customer_phone}</span>}
                  <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{format(new Date(conv.created_at), 'MMM d, h:mm a')}</span>
                </div>
                {conv.context_json && (conv.context_json as Record<string, unknown>).zip && (
                  <p className="text-xs text-muted-foreground mt-1">ZIP: {String((conv.context_json as Record<string, unknown>).zip)}</p>
                )}
              </button>
            ))
          )}
        </ScrollArea>
      </div>

      {/* Chat Detail */}
      <div className="flex-1 border rounded-lg bg-card flex flex-col">
        {!selectedId ? (
          <div className="flex-1 flex items-center justify-center text-muted-foreground">
            <p>Select a conversation to view details</p>
          </div>
        ) : (
          <>
            {/* Detail Header */}
            <div className="p-4 border-b flex items-center justify-between">
              <div>
                <h3 className="font-semibold">{selected?.customer_name || 'Anonymous Visitor'}</h3>
                <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                  {selected?.customer_phone && <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" />{selected.customer_phone}</span>}
                  {selected?.customer_email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" />{selected.customer_email}</span>}
                </div>
              </div>
              <div className="flex gap-2">
                {selected?.status !== 'handled' && (
                  <Button size="sm" variant="outline" onClick={() => markHandled.mutate(selectedId!)} disabled={markHandled.isPending}>
                    <Check className="w-4 h-4 mr-1" /> Mark Handled
                  </Button>
                )}
                <Button size="sm" variant="outline" onClick={() => window.open(`/sales/quotes/new?zip=${(selected?.context_json as Record<string, unknown>)?.zip || ''}`, '_blank')}>
                  <ExternalLink className="w-4 h-4 mr-1" /> Create Quote
                </Button>
              </div>
            </div>

            {/* Messages */}
            <ScrollArea className="flex-1 p-4">
              {messages.map(msg => (
                <div key={msg.id} className={cn("flex gap-2 mb-3", msg.role === 'user' ? 'flex-row-reverse' : 'flex-row')}>
                  <div className={cn("w-7 h-7 rounded-full flex items-center justify-center shrink-0", msg.role === 'user' ? 'bg-primary text-primary-foreground' : 'bg-muted')}>
                    {msg.role === 'user' ? <User className="w-3.5 h-3.5" /> : <Bot className="w-3.5 h-3.5" />}
                  </div>
                  <div className={cn("max-w-[70%]", msg.role === 'user' ? 'text-right' : 'text-left')}>
                    <div className={cn("inline-block px-3 py-2 rounded-2xl text-sm", msg.role === 'user' ? 'bg-primary text-primary-foreground rounded-br-md' : 'bg-muted rounded-bl-md')}>
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{format(new Date(msg.created_at), 'h:mm a')}</p>
                  </div>
                </div>
              ))}
            </ScrollArea>
          </>
        )}
      </div>
    </div>
  );
}
