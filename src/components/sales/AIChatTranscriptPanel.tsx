// ============================================================
// AI Chat Transcript Panel — for Lead Detail page
// Shows conversation history, extracted fields, and handoff packet
// ============================================================

import { useState, useEffect } from 'react';
import { MessageSquare, Bot, User, Package, Clock, AlertTriangle, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { ScrollArea } from '@/components/ui/scroll-area';
import { supabase } from '@/integrations/supabase/client';
import { format } from 'date-fns';

interface ChatMessage {
  id: string;
  role: string;
  message_text: string;
  meta_json: Record<string, unknown>;
  created_at: string;
}

interface HandoffPacket {
  id: string;
  assigned_team: string;
  summary_text: string;
  extracted_fields_json: Record<string, unknown>;
  recommended_next_action: string;
  risk_band: string;
  is_reviewed: boolean;
  created_at: string;
}

interface Props {
  leadId: string;
}

export function AIChatTranscriptPanel({ leadId }: Props) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [packets, setPackets] = useState<HandoffPacket[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchData();
  }, [leadId]);

  async function fetchData() {
    setIsLoading(true);
    try {
      // Find session linked to this lead
      const { data: sessions } = await supabase
        .from('ai_chat_sessions' as never)
        .select('id')
        .eq('lead_id', leadId)
        .order('created_at', { ascending: false })
        .limit(1);

      const sess = (sessions as any)?.[0];
      if (!sess) {
        setIsLoading(false);
        return;
      }
      setSessionId(sess.id);

      // Fetch messages and handoff packets in parallel
      const [msgRes, packetRes] = await Promise.all([
        supabase
          .from('ai_chat_messages' as never)
          .select('*')
          .eq('session_id', sess.id)
          .order('created_at', { ascending: true }),
        supabase
          .from('lead_handoff_packets' as never)
          .select('*')
          .eq('lead_id', leadId)
          .order('created_at', { ascending: false }),
      ]);

      setMessages((msgRes.data || []) as unknown as ChatMessage[]);
      setPackets((packetRes.data || []) as unknown as HandoffPacket[]);
    } catch (err) {
      console.error('Failed to load AI chat data:', err);
    } finally {
      setIsLoading(false);
    }
  }

  async function markPacketReviewed(packetId: string) {
    await supabase
      .from('lead_handoff_packets' as never)
      .update({ is_reviewed: true, reviewed_at: new Date().toISOString() } as never)
      .eq('id', packetId);
    setPackets(prev => prev.map(p => p.id === packetId ? { ...p, is_reviewed: true } : p));
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="py-6 text-center text-muted-foreground">Loading AI chat data...</CardContent>
      </Card>
    );
  }

  if (!sessionId || messages.length === 0) {
    return null; // No AI chat for this lead
  }

  const riskColors: Record<string, string> = {
    GREEN: 'bg-green-100 text-green-700',
    AMBER: 'bg-amber-100 text-amber-700',
    RED: 'bg-red-100 text-red-700',
  };

  const teamColors: Record<string, string> = {
    SALES: 'bg-blue-100 text-blue-700',
    CS: 'bg-purple-100 text-purple-700',
    DISPATCH: 'bg-orange-100 text-orange-700',
    BILLING: 'bg-emerald-100 text-emerald-700',
  };

  return (
    <div className="space-y-4">
      {/* Handoff Packet */}
      {packets.length > 0 && (
        <Card className="border-l-4 border-l-primary">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2">
              <Package className="w-4 h-4" />
              Handoff Packet
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {packets.map(packet => (
              <div key={packet.id} className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={teamColors[packet.assigned_team] || ''}>
                    {packet.assigned_team}
                  </Badge>
                  <Badge className={riskColors[packet.risk_band] || ''}>
                    Risk: {packet.risk_band}
                  </Badge>
                  <Badge variant="outline">{packet.recommended_next_action?.replace(/_/g, ' ')}</Badge>
                  {packet.is_reviewed ? (
                    <Badge className="bg-green-100 text-green-700">
                      <CheckCircle2 className="w-3 h-3 mr-1" /> Reviewed
                    </Badge>
                  ) : (
                    <Button size="sm" variant="outline" onClick={() => markPacketReviewed(packet.id)}>
                      Mark Reviewed
                    </Button>
                  )}
                </div>
                <p className="text-sm text-muted-foreground">{packet.summary_text}</p>

                {/* Extracted fields */}
                {Object.keys(packet.extracted_fields_json || {}).length > 0 && (
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-xs">
                    {Object.entries(packet.extracted_fields_json).map(([key, val]) => (
                      <div key={key} className="bg-muted rounded px-2 py-1">
                        <span className="font-medium capitalize">{key}:</span> {String(val)}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Chat Transcript */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2">
            <MessageSquare className="w-4 h-4" />
            AI Chat Transcript ({messages.length} messages)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="max-h-[400px]">
            <div className="space-y-3">
              {messages.map(msg => (
                <div key={msg.id} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : ''}`}>
                  {msg.role !== 'user' && (
                    <Bot className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                  )}
                  <div className={`rounded-lg px-3 py-2 text-sm max-w-[80%] ${
                    msg.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : msg.role === 'system'
                      ? 'bg-amber-50 text-amber-800 border border-amber-200'
                      : 'bg-muted'
                  }`}>
                    <p className="whitespace-pre-wrap">{msg.message_text}</p>
                    <span className="text-[10px] opacity-60 mt-1 block">
                      {format(new Date(msg.created_at), 'h:mm a')}
                    </span>
                  </div>
                  {msg.role === 'user' && (
                    <User className="w-4 h-4 mt-1 text-muted-foreground flex-shrink-0" />
                  )}
                </div>
              ))}
            </div>
          </ScrollArea>
        </CardContent>
      </Card>
    </div>
  );
}

export default AIChatTranscriptPanel;
