import { useState, useEffect } from 'react';
import { Phone, Play, CheckCircle2, XCircle, Clock, User, Voicemail, RefreshCw, Database, MessageSquare } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneDisplay } from '@/lib/phoneUtils';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

interface PhoneNumber {
  id: string;
  twilio_number: string;
  purpose: string;
  friendly_name?: string;
}

export default function TelephonyTestCall() {
  const [fromNumber, setFromNumber] = useState('+14155551234');
  const [toNumber, setToNumber] = useState('');
  const [callSource, setCallSource] = useState<'NATIVE' | 'GHL_FORWARD'>('NATIVE');
  const [simulateForwarding, setSimulateForwarding] = useState(false);
  const [originalDid, setOriginalDid] = useState('+18005551234');
  const [phoneNumbers, setPhoneNumbers] = useState<PhoneNumber[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const [recentCalls, setRecentCalls] = useState<any[]>([]);
  const { toast } = useToast();

  // Fetch phone numbers on mount
  useEffect(() => {
    const fetchData = async () => {
      const [numbersRes, callsRes] = await Promise.all([
        supabase.from('phone_numbers').select('*').eq('is_active', true),
        supabase.from('call_events')
          .select('id, from_number, to_number, call_status, call_source, created_at, caller_name')
          .order('created_at', { ascending: false })
          .limit(10)
      ]);
      
      if (numbersRes.data) setPhoneNumbers(numbersRes.data);
      if (callsRes.data) setRecentCalls(callsRes.data);
    };
    
    fetchData();
  }, []);

  const runTest = async () => {
    if (!toNumber) {
      toast({ title: 'Error', description: 'Select a destination number', variant: 'destructive' });
      return;
    }

    setIsRunning(true);
    setTestResults([]);

    const results: TestResult[] = [];

    // Step 1: Validate phone number exists
    results.push({ step: 'Phone Number Lookup', status: 'pending', message: 'Checking if number is configured...' });
    setTestResults([...results]);

    const { data: phoneNum } = await supabase
      .from('phone_numbers')
      .select('*')
      .eq('twilio_number', toNumber)
      .eq('is_active', true)
      .maybeSingle();

    if (phoneNum) {
      results[0] = { 
        step: 'Phone Number Lookup', 
        status: 'success', 
        message: `Found: ${phoneNum.purpose} line (${phoneNum.friendly_name || 'No name'})`,
        data: phoneNum 
      };
    } else {
      results[0] = { step: 'Phone Number Lookup', status: 'error', message: 'Number not found in phone_numbers table' };
      setTestResults([...results]);
      setIsRunning(false);
      return;
    }
    setTestResults([...results]);

    // Step 2: Find available agent
    results.push({ step: 'Agent Routing', status: 'pending', message: 'Finding available agent...' });
    setTestResults([...results]);

    const { data: agentId, error: agentError } = await supabase.rpc('find_available_agent', {
      p_purpose: phoneNum.purpose
    });

    if (agentError) {
      results[1] = { step: 'Agent Routing', status: 'error', message: agentError.message };
    } else if (agentId) {
      results[1] = { step: 'Agent Routing', status: 'success', message: `Found agent: ${agentId.slice(0, 8)}...`, data: { agentId } };
    } else {
      results[1] = { step: 'Agent Routing', status: 'success', message: 'No agents online - will go to voicemail' };
    }
    setTestResults([...results]);

    // Step 3: Create test call event with proper source and metadata
    results.push({ step: 'Create Call Event', status: 'pending', message: 'Creating call_events record...' });
    setTestResults([...results]);

    const callSid = `TEST_${Date.now()}`;
    const effectiveSource = simulateForwarding ? 'GHL_FORWARD' : callSource;
    
    // Build metadata for forwarded calls
    const metadata: Record<string, any> = {};
    if (effectiveSource === 'GHL_FORWARD') {
      metadata.original_did = originalDid;
      metadata.forwarded_to = toNumber;
      metadata.forwarding_method = 'DUAL_RING';
    }

    const { data: callEvent, error: callError } = await supabase
      .from('call_events')
      .insert({
        twilio_call_sid: callSid,
        direction: 'INBOUND',
        from_number: fromNumber,
        to_number: toNumber,
        phone_number_id: phoneNum.id,
        assigned_user_id: agentId || null,
        call_status: 'RINGING',
        caller_name: 'Test Caller (DRY_RUN)',
        call_source: effectiveSource,
        is_historical: false,
        notes: `DRY_RUN test call simulating ${effectiveSource} source`,
      } as never)
      .select()
      .single();

    if (callError) {
      results[2] = { step: 'Create Call Event', status: 'error', message: callError.message };
      setTestResults([...results]);
      setIsRunning(false);
      return;
    }

    results[2] = { 
      step: 'Create Call Event', 
      status: 'success', 
      message: `Created event: ${callEvent.id.slice(0, 8)}... (source: ${effectiveSource})`,
      data: { ...callEvent, metadata } 
    };
    setTestResults([...results]);

    // Step 4: Create call assignment if agent found
    if (agentId) {
      results.push({ step: 'Create Assignment', status: 'pending', message: 'Creating call_assignments record...' });
      setTestResults([...results]);

      const { error: assignError } = await supabase
        .from('call_assignments')
        .insert({
          call_id: callEvent.id,
          user_id: agentId,
          role: phoneNum.purpose,
        });

      if (assignError) {
        results[results.length - 1] = { step: 'Create Assignment', status: 'error', message: assignError.message };
      } else {
        results[results.length - 1] = { step: 'Create Assignment', status: 'success', message: 'Assignment created for agent' };
      }
      setTestResults([...results]);
    }

    // Step 5: Test voicemail fallback (if no agent)
    if (!agentId) {
      results.push({ step: 'Voicemail Fallback', status: 'pending', message: 'Creating callback task...' });
      setTestResults([...results]);

      const { error: taskError } = await supabase
        .from('call_tasks')
        .insert({
          call_id: callEvent.id,
          task_type: 'CALLBACK',
          priority: 2,
          scheduled_for: new Date(Date.now() + 15 * 60 * 1000).toISOString(),
          notes: `Test missed call from ${fromNumber}` + (effectiveSource === 'GHL_FORWARD' ? ` (forwarded from GHL: ${originalDid})` : ''),
        });

      if (taskError) {
        results[results.length - 1] = { step: 'Voicemail Fallback', status: 'error', message: taskError.message };
      } else {
        results[results.length - 1] = { step: 'Voicemail Fallback', status: 'success', message: 'Callback task created for 15 min' };
      }
      setTestResults([...results]);
    }

    // Step 6: Verify source tagging
    results.push({ step: 'Source Tagging', status: 'pending', message: 'Verifying call source tag...' });
    setTestResults([...results]);

    const { data: verifyCall } = await supabase
      .from('call_events')
      .select('id, call_source')
      .eq('id', callEvent.id)
      .single();

    if (verifyCall && verifyCall.call_source === effectiveSource) {
      results[results.length - 1] = { 
        step: 'Source Tagging', 
        status: 'success', 
        message: `call_source correctly set to '${effectiveSource}'` 
      };
    } else {
      results[results.length - 1] = { step: 'Source Tagging', status: 'error', message: 'Source tag mismatch' };
    }
    setTestResults([...results]);

    // Cleanup: Mark test call as completed
    await supabase
      .from('call_events')
      .update({ 
        call_status: 'COMPLETED', 
        notes: `DRY_RUN test call completed. Source: ${effectiveSource}`,
        ended_at: new Date().toISOString()
      })
      .eq('id', callEvent.id);

    // Refresh recent calls
    const { data: refreshedCalls } = await supabase
      .from('call_events')
      .select('id, from_number, to_number, call_status, call_source, created_at, caller_name')
      .order('created_at', { ascending: false })
      .limit(10);
    if (refreshedCalls) setRecentCalls(refreshedCalls);

    toast({ title: 'Test Complete', description: `All ${results.length} steps executed. Source: ${effectiveSource}` });
    setIsRunning(false);
  };

  const getStatusIcon = (status: TestResult['status']) => {
    switch (status) {
      case 'success': return <CheckCircle2 className="w-5 h-5 text-green-600" />;
      case 'error': return <XCircle className="w-5 h-5 text-red-600" />;
      default: return <Clock className="w-5 h-5 text-yellow-600 animate-spin" />;
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">DRY_RUN Test Call Simulation</h1>
        <p className="text-muted-foreground">
          Simulate inbound calls to validate routing, logging, source tagging, and voicemail fallback
        </p>
        <Badge variant="outline" className="mt-2">
          telephony.mode = DRY_RUN (no live Twilio calls)
        </Badge>
      </div>

      <Tabs defaultValue="simulate">
        <TabsList>
          <TabsTrigger value="simulate">Simulate Call</TabsTrigger>
          <TabsTrigger value="recent">Recent Test Calls</TabsTrigger>
        </TabsList>

        <TabsContent value="simulate">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="w-5 h-5" />
                  Test Configuration
                </CardTitle>
                <CardDescription>Configure the simulated inbound call parameters</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <Label>Caller Number (From)</Label>
                  <Input
                    placeholder="+14155551234"
                    value={fromNumber}
                    onChange={(e) => setFromNumber(e.target.value)}
                  />
                </div>
                <div>
                  <Label>Destination Number (To)</Label>
                  <Select value={toNumber} onValueChange={setToNumber}>
                    <SelectTrigger>
                      <SelectValue placeholder="Select your Twilio number" />
                    </SelectTrigger>
                    <SelectContent>
                      {phoneNumbers.map((num) => (
                        <SelectItem key={num.id} value={num.twilio_number}>
                          {formatPhoneDisplay(num.twilio_number)} - {num.purpose}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div>
                    <Label>Simulate GHL Forwarding</Label>
                    <p className="text-xs text-muted-foreground">Test forwarded call tagging</p>
                  </div>
                  <Switch
                    checked={simulateForwarding}
                    onCheckedChange={setSimulateForwarding}
                  />
                </div>

                {simulateForwarding && (
                  <div className="bg-muted/50 p-3 rounded-lg space-y-3">
                    <div>
                      <Label>Original GHL Number (original_did)</Label>
                      <Input
                        placeholder="+18005551234"
                        value={originalDid}
                        onChange={(e) => setOriginalDid(e.target.value)}
                      />
                      <p className="text-xs text-muted-foreground mt-1">
                        This simulates the GHL number that forwarded the call
                      </p>
                    </div>
                  </div>
                )}

                <Button 
                  className="w-full" 
                  onClick={runTest} 
                  disabled={isRunning || !toNumber}
                >
                  <Play className="w-4 h-4 mr-2" />
                  {isRunning ? 'Running Test...' : 'Run DRY_RUN Test'}
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Test Results</CardTitle>
                <CardDescription>Step-by-step validation of the telephony pipeline</CardDescription>
              </CardHeader>
              <CardContent>
                {testResults.length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground">
                    <Database className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p>Run a test to see results</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {testResults.map((result, idx) => (
                      <div 
                        key={idx} 
                        className={`flex items-start gap-3 p-3 rounded-lg ${
                          result.status === 'success' ? 'bg-green-50' :
                          result.status === 'error' ? 'bg-red-50' : 'bg-yellow-50'
                        }`}
                      >
                        {getStatusIcon(result.status)}
                        <div className="flex-1">
                          <p className="font-medium">{result.step}</p>
                          <p className="text-sm text-muted-foreground">{result.message}</p>
                          {result.data && (
                            <pre className="text-xs bg-white/50 p-2 rounded mt-1 overflow-x-auto">
                              {JSON.stringify(result.data, null, 2).slice(0, 200)}...
                            </pre>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="recent">
          <Card>
            <CardHeader>
              <CardTitle>Recent Test Calls</CardTitle>
              <CardDescription>Last 10 call events created (including test calls)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {recentCalls.map((call) => (
                  <div key={call.id} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div className="flex items-center gap-3">
                      <Phone className="w-4 h-4 text-muted-foreground" />
                      <div>
                        <p className="font-mono text-sm">{formatPhoneDisplay(call.from_number)}</p>
                        <p className="text-xs text-muted-foreground">{call.caller_name || 'Unknown'}</p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={call.call_source === 'GHL_FORWARD' ? 'secondary' : 'outline'}>
                        {call.call_source || 'NATIVE'}
                      </Badge>
                      <Badge variant={call.call_status === 'COMPLETED' ? 'default' : 'outline'}>
                        {call.call_status}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        {new Date(call.created_at).toLocaleTimeString()}
                      </span>
                    </div>
                  </div>
                ))}
                {recentCalls.length === 0 && (
                  <p className="text-center text-muted-foreground py-8">No recent calls</p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <Card>
        <CardHeader>
          <CardTitle>What This Test Validates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Phone Number Lookup</p>
                <p className="text-sm text-muted-foreground">Verifies number exists in phone_numbers table</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-green-100 rounded-lg">
                <User className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="font-medium">Agent Routing</p>
                <p className="text-sm text-muted-foreground">Tests find_available_agent function</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-purple-100 rounded-lg">
                <Voicemail className="w-5 h-5 text-purple-600" />
              </div>
              <div>
                <p className="font-medium">Voicemail Fallback</p>
                <p className="text-sm text-muted-foreground">Creates callback task if no agents online</p>
              </div>
            </div>
            <div className="flex items-start gap-3">
              <div className="p-2 bg-orange-100 rounded-lg">
                <MessageSquare className="w-5 h-5 text-orange-600" />
              </div>
              <div>
                <p className="font-medium">Source Tagging</p>
                <p className="text-sm text-muted-foreground">Verifies GHL_FORWARD vs NATIVE source</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
