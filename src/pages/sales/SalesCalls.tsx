import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Phone, PhoneOutgoing, History, Users, Brain } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useTelephony } from '@/hooks/useTelephony';
import {
  IncomingCallModal,
  ActiveCallPanel,
  AgentStatusSelector,
  CallHistoryTable,
  LiveCoachPanel,
  AfterCallPanel,
} from '@/components/telephony';

export default function SalesCalls() {
  const navigate = useNavigate();
  const [userId, setUserId] = useState<string>();
  const [dialNumber, setDialNumber] = useState('');
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);
  const [selectedCallId, setSelectedCallId] = useState<string | null>(null);

  const {
    incomingCall,
    currentCall,
    agentStatus,
    isLoading,
    updateStatus,
    makeCall,
    saveCallNotes,
  } = useTelephony(userId);

  // Get current user
  useEffect(() => {
    supabase.auth.getUser().then(({ data }) => {
      if (data.user) {
        setUserId(data.user.id);
      }
    });
  }, []);

  // Fetch call history
  useEffect(() => {
    if (!userId) return;

    const fetchHistory = async () => {
      setIsLoadingHistory(true);
      const { data } = await supabase
        .from('call_events')
        .select(`
          *,
          contact:customers(full_name)
        `)
        .eq('assigned_user_id', userId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (data) {
        setCallHistory(data);
      }
      setIsLoadingHistory(false);
    };

    fetchHistory();
  }, [userId]);

  const handleMakeCall = async () => {
    if (!dialNumber) return;
    try {
      await makeCall(dialNumber, { purpose: 'SALES' });
      setDialNumber('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleAnswerCall = () => {
    // In a real implementation, this would connect to Twilio Client SDK
    console.log('Answering call...');
  };

  const handleDeclineCall = () => {
    // In a real implementation, this would reject the call
    console.log('Declining call...');
  };

  const handleEndCall = () => {
    // In a real implementation, this would disconnect the call
    console.log('Ending call...');
  };

  const handleCreateQuote = (data: { zip?: string; material?: string; size?: number }) => {
    // Navigate to internal calculator with prefilled data
    const params = new URLSearchParams();
    if (data.zip) params.set('zip', data.zip);
    if (data.material) params.set('material', data.material);
    if (data.size) params.set('size', data.size.toString());
    navigate(`/internal/calculator?${params.toString()}`);
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Sales Calls</h1>
          <p className="text-muted-foreground">
            Manage inbound and outbound sales calls
          </p>
        </div>
        <AgentStatusSelector
          status={agentStatus.status}
          callsToday={agentStatus.calls_today}
          onStatusChange={updateStatus}
          disabled={isLoading}
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Dialer & Active Call & AI Coach */}
        <div className="space-y-6">
          {/* Dialer */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PhoneOutgoing className="w-5 h-5" />
                Quick Dial
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="tel"
                placeholder="Enter phone number..."
                value={dialNumber}
                onChange={(e) => setDialNumber(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleMakeCall()}
              />
              <Button
                className="w-full"
                onClick={handleMakeCall}
                disabled={!dialNumber || agentStatus.status === 'OFFLINE'}
              >
                <Phone className="w-4 h-4 mr-2" />
                Call Now
              </Button>
            </CardContent>
          </Card>

          {/* Active Call Panel */}
          {currentCall && (
            <ActiveCallPanel
              call={currentCall}
              onEndCall={handleEndCall}
              onSaveNotes={(notes) => saveCallNotes(currentCall.id, notes)}
            />
          )}

          {/* Live AI Coach Panel - During Active Call */}
          {currentCall && (
            <LiveCoachPanel
              callId={currentCall.id}
              isActive={true}
              onCreateQuote={handleCreateQuote}
            />
          )}

          {/* After-Call Panel - When viewing completed call */}
          {selectedCallId && !currentCall && (
            <AfterCallPanel
              callId={selectedCallId}
              onCreateQuote={handleCreateQuote}
            />
          )}

          {/* Stats */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="w-5 h-5" />
                Today's Stats
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">{agentStatus.calls_today}</p>
                  <p className="text-sm text-muted-foreground">Calls</p>
                </div>
                <div className="text-center p-3 bg-muted rounded-lg">
                  <p className="text-2xl font-bold">
                    {callHistory.filter((c) => c.call_status === 'COMPLETED').length}
                  </p>
                  <p className="text-sm text-muted-foreground">Completed</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Call History */}
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <History className="w-5 h-5" />
                Call History
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Tabs defaultValue="all">
                <TabsList>
                  <TabsTrigger value="all">All Calls</TabsTrigger>
                  <TabsTrigger value="missed">Missed</TabsTrigger>
                  <TabsTrigger value="voicemail">Voicemails</TabsTrigger>
                </TabsList>
                <TabsContent value="all" className="mt-4">
                  <CallHistoryTable
                    calls={callHistory}
                    onCallBack={(phone) => {
                      setDialNumber(phone);
                    }}
                    onViewDetails={(callId) => {
                      setSelectedCallId(callId);
                    }}
                  />
                </TabsContent>
                <TabsContent value="missed" className="mt-4">
                  <CallHistoryTable
                    calls={callHistory.filter((c) => c.call_status === 'MISSED')}
                    onCallBack={(phone) => setDialNumber(phone)}
                    onViewDetails={(callId) => setSelectedCallId(callId)}
                  />
                </TabsContent>
                <TabsContent value="voicemail" className="mt-4">
                  <CallHistoryTable
                    calls={callHistory.filter((c) => c.call_status === 'VOICEMAIL')}
                    onCallBack={(phone) => setDialNumber(phone)}
                    onViewDetails={(callId) => setSelectedCallId(callId)}
                  />
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Incoming Call Modal */}
      <IncomingCallModal
        call={incomingCall}
        onAnswer={handleAnswerCall}
        onDecline={handleDeclineCall}
      />
    </div>
  );
}
