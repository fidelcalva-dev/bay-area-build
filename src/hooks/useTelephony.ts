import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { RealtimeChannel } from '@supabase/supabase-js';

export interface CallEvent {
  id: string;
  twilio_call_sid: string | null;
  direction: 'INBOUND' | 'OUTBOUND';
  from_number: string;
  to_number: string;
  contact_id: string | null;
  order_id: string | null;
  assigned_user_id: string | null;
  call_status: 'RINGING' | 'ANSWERED' | 'MISSED' | 'VOICEMAIL' | 'COMPLETED' | 'FAILED';
  duration_seconds: number;
  notes: string | null;
  caller_name: string | null;
  started_at: string;
  answered_at: string | null;
  ended_at: string | null;
  contact?: {
    id: string;
    full_name: string | null;
    billing_email: string | null;
  } | null;
  order?: {
    id: string;
    status: string;
  } | null;
}

export interface AgentStatus {
  status: 'ONLINE' | 'BUSY' | 'AWAY' | 'OFFLINE';
  current_call_id: string | null;
  calls_today: number;
}

export function useTelephony(userId?: string) {
  const [activeCalls, setActiveCalls] = useState<CallEvent[]>([]);
  const [incomingCall, setIncomingCall] = useState<CallEvent | null>(null);
  const [currentCall, setCurrentCall] = useState<CallEvent | null>(null);
  const [agentStatus, setAgentStatus] = useState<AgentStatus>({
    status: 'OFFLINE',
    current_call_id: null,
    calls_today: 0,
  });
  const [isLoading, setIsLoading] = useState(true);
  const { toast } = useToast();

  // Fetch initial data
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoading(true);
      try {
        // Fetch active calls
        const { data: calls } = await supabase
          .from('call_events')
          .select(`
            *,
            contact:customers(id, full_name, billing_email),
            order:orders(id, status)
          `)
          .in('call_status', ['RINGING', 'ANSWERED'])
          .order('started_at', { ascending: false });

        if (calls) {
          setActiveCalls(calls as unknown as CallEvent[]);
          
          // Check for incoming call assigned to this user
          const myIncoming = calls.find(
            (c) => c.assigned_user_id === userId && c.call_status === 'RINGING' && c.direction === 'INBOUND'
          );
          if (myIncoming) {
            setIncomingCall(myIncoming as unknown as CallEvent);
          }

          // Check for current active call
          const myCurrent = calls.find(
            (c) => c.assigned_user_id === userId && c.call_status === 'ANSWERED'
          );
          if (myCurrent) {
            setCurrentCall(myCurrent as unknown as CallEvent);
          }
        }

        // Fetch agent status
        const { data: status } = await supabase
          .from('agent_availability')
          .select('status, current_call_id, calls_today')
          .eq('user_id', userId)
          .maybeSingle();

        if (status) {
          setAgentStatus(status as AgentStatus);
        }
      } catch (error) {
        console.error('Error fetching telephony data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchData();
  }, [userId]);

  // Subscribe to realtime updates
  useEffect(() => {
    if (!userId) return;

    let callsChannel: RealtimeChannel;
    let availabilityChannel: RealtimeChannel;

    const setupSubscriptions = () => {
      // Subscribe to call events
      callsChannel = supabase
        .channel('call_events_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'call_events',
          },
          async (payload) => {
            console.log('Call event change:', payload);
            
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const call = payload.new as CallEvent;
              
              // Handle incoming call notification
              if (
                call.assigned_user_id === userId &&
                call.call_status === 'RINGING' &&
                call.direction === 'INBOUND'
              ) {
                // Fetch full call data with relations
                const { data: fullCall } = await supabase
                  .from('call_events')
                  .select(`
                    *,
                    contact:customers(id, full_name, billing_email),
                    order:orders(id, status)
                  `)
                  .eq('id', call.id)
                  .single();

                if (fullCall) {
                  setIncomingCall(fullCall as unknown as CallEvent);
                  toast({
                    title: '📞 Incoming Call',
                    description: `From: ${call.caller_name || call.from_number}`,
                  });
                }
              }

              // Update current call
              if (call.assigned_user_id === userId && call.call_status === 'ANSWERED') {
                setCurrentCall(call);
                setIncomingCall(null);
              }

              // Call ended
              if (
                call.assigned_user_id === userId &&
                ['COMPLETED', 'MISSED', 'VOICEMAIL', 'FAILED'].includes(call.call_status)
              ) {
                setCurrentCall(null);
                setIncomingCall(null);
              }

              // Update active calls list
              setActiveCalls((prev) => {
                const index = prev.findIndex((c) => c.id === call.id);
                if (['COMPLETED', 'MISSED', 'VOICEMAIL', 'FAILED'].includes(call.call_status)) {
                  return prev.filter((c) => c.id !== call.id);
                }
                if (index >= 0) {
                  const updated = [...prev];
                  updated[index] = call;
                  return updated;
                }
                return [call, ...prev];
              });
            }
          }
        )
        .subscribe();

      // Subscribe to agent availability changes
      availabilityChannel = supabase
        .channel('agent_availability_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'agent_availability',
            filter: `user_id=eq.${userId}`,
          },
          (payload) => {
            if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
              const status = payload.new as AgentStatus;
              setAgentStatus(status);
            }
          }
        )
        .subscribe();
    };

    setupSubscriptions();

    return () => {
      if (callsChannel) supabase.removeChannel(callsChannel);
      if (availabilityChannel) supabase.removeChannel(availabilityChannel);
    };
  }, [userId, toast]);

  // Update agent status
  const updateStatus = useCallback(async (newStatus: AgentStatus['status']) => {
    if (!userId) return;

    const { error } = await supabase
      .from('agent_availability')
      .upsert({
        user_id: userId,
        status: newStatus,
        current_call_id: null,
      }, { onConflict: 'user_id' });

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to update status',
        variant: 'destructive',
      });
    }
  }, [userId, toast]);

  // Initiate outbound call
  const makeCall = useCallback(async (toNumber: string, options?: {
    orderId?: string;
    contactId?: string;
    purpose?: 'SALES' | 'CS' | 'BILLING';
  }) => {
    try {
      const { data, error } = await supabase.functions.invoke('calls-outbound-handler', {
        body: {
          toNumber,
          orderId: options?.orderId,
          contactId: options?.contactId,
          purpose: options?.purpose || 'SALES',
        },
      });

      if (error) throw error;

      toast({
        title: 'Call Initiated',
        description: `Calling ${toNumber}...`,
      });

      return data;
    } catch (error) {
      console.error('Error making call:', error);
      toast({
        title: 'Call Failed',
        description: 'Failed to initiate call',
        variant: 'destructive',
      });
      throw error;
    }
  }, [toast]);

  // Save call notes
  const saveCallNotes = useCallback(async (callId: string, notes: string) => {
    const { error } = await supabase
      .from('call_events')
      .update({ notes })
      .eq('id', callId);

    if (error) {
      toast({
        title: 'Error',
        description: 'Failed to save notes',
        variant: 'destructive',
      });
    } else {
      toast({
        title: 'Notes Saved',
        description: 'Call notes have been saved',
      });
    }
  }, [toast]);

  return {
    activeCalls,
    incomingCall,
    currentCall,
    agentStatus,
    isLoading,
    updateStatus,
    makeCall,
    saveCallNotes,
  };
}
