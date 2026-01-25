import { useState, useEffect } from 'react';
import { Phone, PhoneOutgoing, History, Users, Package, Clock } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useTelephony } from '@/hooks/useTelephony';
import {
  IncomingCallModal,
  ActiveCallPanel,
  AgentStatusSelector,
  CallHistoryTable,
} from '@/components/telephony';

export default function CSCalls() {
  const [userId, setUserId] = useState<string>();
  const [dialNumber, setDialNumber] = useState('');
  const [callHistory, setCallHistory] = useState<any[]>([]);
  const [pendingTasks, setPendingTasks] = useState<any[]>([]);
  const [isLoadingHistory, setIsLoadingHistory] = useState(true);

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

  // Fetch call history and tasks
  useEffect(() => {
    if (!userId) return;

    const fetchData = async () => {
      setIsLoadingHistory(true);
      
      // Fetch call history
      const { data: calls } = await supabase
        .from('call_events')
        .select(`
          *,
          contact:customers(full_name)
        `)
        .eq('assigned_user_id', userId)
        .order('started_at', { ascending: false })
        .limit(50);

      if (calls) {
        setCallHistory(calls);
      }

      // Fetch pending callback tasks
      const { data: tasks } = await supabase
        .from('call_tasks')
        .select(`
          *,
          call:call_events(from_number, caller_name, contact:customers(full_name))
        `)
        .eq('assigned_to', userId)
        .is('completed_at', null)
        .order('priority', { ascending: true })
        .limit(20);

      if (tasks) {
        setPendingTasks(tasks);
      }

      setIsLoadingHistory(false);
    };

    fetchData();
  }, [userId]);

  const handleMakeCall = async () => {
    if (!dialNumber) return;
    try {
      await makeCall(dialNumber, { purpose: 'CS' });
      setDialNumber('');
    } catch (error) {
      // Error handled in hook
    }
  };

  const handleCompleteTask = async (taskId: string) => {
    await supabase
      .from('call_tasks')
      .update({ completed_at: new Date().toISOString() })
      .eq('id', taskId);

    setPendingTasks((prev) => prev.filter((t) => t.id !== taskId));
  };

  const handleAnswerCall = () => {
    console.log('Answering call...');
  };

  const handleDeclineCall = () => {
    console.log('Declining call...');
  };

  const handleEndCall = () => {
    console.log('Ending call...');
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Service Calls</h1>
          <p className="text-muted-foreground">
            Manage customer support calls and callbacks
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
        {/* Left Column - Dialer, Active Call, Tasks */}
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

          {/* Pending Tasks */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Clock className="w-5 h-5" />
                Pending Callbacks
                {pendingTasks.length > 0 && (
                  <Badge variant="destructive">{pendingTasks.length}</Badge>
                )}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {pendingTasks.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-4">
                  No pending callbacks
                </p>
              ) : (
                <div className="space-y-3">
                  {pendingTasks.slice(0, 5).map((task) => (
                    <div
                      key={task.id}
                      className="flex items-center justify-between p-3 bg-muted rounded-lg"
                    >
                      <div>
                        <p className="font-medium text-sm">
                          {task.call?.caller_name || task.call?.contact?.full_name || 'Unknown'}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          {task.task_type.replace('_', ' ')}
                        </p>
                      </div>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            if (task.call?.from_number) {
                              setDialNumber(task.call.from_number);
                            }
                          }}
                        >
                          <Phone className="w-3 h-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleCompleteTask(task.id)}
                        >
                          Done
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

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
                  <p className="text-sm text-muted-foreground">Resolved</p>
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
                    onCallBack={(phone) => setDialNumber(phone)}
                    onViewDetails={(callId) => console.log('View:', callId)}
                  />
                </TabsContent>
                <TabsContent value="missed" className="mt-4">
                  <CallHistoryTable
                    calls={callHistory.filter((c) => c.call_status === 'MISSED')}
                    onCallBack={(phone) => setDialNumber(phone)}
                    onViewDetails={(callId) => console.log('View:', callId)}
                  />
                </TabsContent>
                <TabsContent value="voicemail" className="mt-4">
                  <CallHistoryTable
                    calls={callHistory.filter((c) => c.call_status === 'VOICEMAIL')}
                    onCallBack={(phone) => setDialNumber(phone)}
                    onViewDetails={(callId) => console.log('View:', callId)}
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
