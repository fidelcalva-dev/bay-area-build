import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { 
  CallAIInsight, 
  CallTranscript, 
  CallFollowup, 
  CallCoachingState,
  AnalyzeCallResponse 
} from '@/types/callAI';

export function useCallAIInsights(callId: string | null) {
  const [insight, setInsight] = useState<CallAIInsight | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchInsight = useCallback(async () => {
    if (!callId) return;
    
    setIsLoading(true);
    try {
      // Use REST API to handle new tables before type regeneration
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/call_ai_insights?call_id=eq.${callId}&order=created_at.desc&limit=1`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setInsight(data[0] as CallAIInsight);
        }
      }
    } catch (error) {
      console.error('Error fetching call AI insight:', error);
    } finally {
      setIsLoading(false);
    }
  }, [callId]);

  useEffect(() => {
    fetchInsight();
  }, [fetchInsight]);

  return { insight, isLoading, refetch: fetchInsight };
}

export function useCallTranscript(callId: string | null) {
  const [transcript, setTranscript] = useState<CallTranscript | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const fetchTranscript = useCallback(async () => {
    if (!callId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/call_transcripts?call_id=eq.${callId}&order=created_at.desc&limit=1`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        if (data && data.length > 0) {
          setTranscript(data[0] as CallTranscript);
        }
      }
    } catch (error) {
      console.error('Error fetching transcript:', error);
    } finally {
      setIsLoading(false);
    }
  }, [callId]);

  useEffect(() => {
    fetchTranscript();
  }, [fetchTranscript]);

  return { transcript, isLoading, refetch: fetchTranscript };
}

export function useCallFollowups(callId: string | null) {
  const [followups, setFollowups] = useState<CallFollowup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const { toast } = useToast();

  const fetchFollowups = useCallback(async () => {
    if (!callId) return;
    
    setIsLoading(true);
    try {
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/call_followups?call_id=eq.${callId}&order=created_at.desc`,
        {
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
          },
        }
      );
      
      if (response.ok) {
        const data = await response.json();
        setFollowups(data as CallFollowup[]);
      }
    } catch (error) {
      console.error('Error fetching followups:', error);
    } finally {
      setIsLoading(false);
    }
  }, [callId]);

  const updateFollowupStatus = async (followupId: string, status: 'SENT' | 'DISCARDED') => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      const updateData = status === 'SENT' 
        ? { status, sent_at: new Date().toISOString(), sent_by: user?.id }
        : { status, discarded_at: new Date().toISOString(), discarded_by: user?.id };
      
      const response = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/rest/v1/call_followups?id=eq.${followupId}`,
        {
          method: 'PATCH',
          headers: {
            'apikey': import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
            'Content-Type': 'application/json',
            'Prefer': 'return=representation',
          },
          body: JSON.stringify(updateData),
        }
      );

      if (response.ok) {
        toast({
          title: status === 'SENT' ? 'Follow-up sent' : 'Follow-up discarded',
        });
        fetchFollowups();
      }
    } catch (error) {
      toast({
        title: 'Error updating follow-up',
        variant: 'destructive',
      });
    }
  };

  useEffect(() => {
    fetchFollowups();
  }, [fetchFollowups]);

  return { followups, isLoading, refetch: fetchFollowups, updateFollowupStatus };
}

export function useCallAIAnalyze() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const { toast } = useToast();

  const analyzeCall = async (
    callId: string, 
    transcriptChunk?: string, 
    fullTranscript?: string,
    isFinal?: boolean
  ): Promise<AnalyzeCallResponse | null> => {
    setIsAnalyzing(true);
    try {
      const { data, error } = await supabase.functions.invoke('call-ai-analyze', {
        body: { callId, transcriptChunk, fullTranscript, isFinal },
      });

      if (error) throw error;
      return data as AnalyzeCallResponse;
    } catch (error) {
      console.error('Error analyzing call:', error);
      toast({
        title: 'Analysis failed',
        description: error instanceof Error ? error.message : 'Unknown error',
        variant: 'destructive',
      });
      return null;
    } finally {
      setIsAnalyzing(false);
    }
  };

  const finalizeCall = async (callId: string) => {
    try {
      const { data, error } = await supabase.functions.invoke('call-ai-finalize', {
        body: { callId },
      });

      if (error) throw error;
      
      toast({
        title: 'Call finalized',
        description: 'Summary and follow-ups generated',
      });
      
      return data;
    } catch (error) {
      console.error('Error finalizing call:', error);
      toast({
        title: 'Finalization failed',
        variant: 'destructive',
      });
      return null;
    }
  };

  return { analyzeCall, finalizeCall, isAnalyzing };
}

export function useCallCoaching(callId: string | null) {
  const { insight, refetch: refetchInsight } = useCallAIInsights(callId);
  const { transcript, refetch: refetchTranscript } = useCallTranscript(callId);
  const { followups, refetch: refetchFollowups, updateFollowupStatus } = useCallFollowups(callId);
  const { analyzeCall, finalizeCall, isAnalyzing } = useCallAIAnalyze();

  const [coachingState, setCoachingState] = useState<CallCoachingState>({
    isLive: false,
    transcript: '',
    recentSegments: [],
    insight: null,
    followups: [],
    lastUpdated: null,
  });

  useEffect(() => {
    setCoachingState(prev => ({
      ...prev,
      transcript: transcript?.transcript_text || '',
      recentSegments: (transcript?.speaker_segments || []).slice(-5),
      insight,
      followups,
      isLive: transcript?.status === 'LIVE',
      lastUpdated: new Date().toISOString(),
    }));
  }, [insight, transcript, followups]);

  const refresh = useCallback(() => {
    refetchInsight();
    refetchTranscript();
    refetchFollowups();
  }, [refetchInsight, refetchTranscript, refetchFollowups]);

  return {
    coachingState,
    isAnalyzing,
    analyzeCall,
    finalizeCall,
    refresh,
    updateFollowupStatus,
  };
}
