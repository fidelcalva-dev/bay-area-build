import { useState } from 'react';
import { Phone, Play, CheckCircle2, XCircle, Clock, User, Voicemail } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneDisplay } from '@/lib/phoneUtils';

interface TestResult {
  step: string;
  status: 'pending' | 'success' | 'error';
  message: string;
  data?: any;
}

export default function TelephonyTestCall() {
  const [fromNumber, setFromNumber] = useState('+14155551234');
  const [toNumber, setToNumber] = useState('');
  const [callSource, setCallSource] = useState('NATIVE');
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [testResults, setTestResults] = useState<TestResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);
  const { toast } = useToast();

  // Fetch phone numbers on mount
  useState(() => {
    supabase.from('phone_numbers').select('*').eq('is_active', true).then(({ data }) => {
      if (data) setPhoneNumbers(data);
    });
  });

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
        message: `Found: ${phoneNum.purpose} line`,
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
      results[1] = { step: 'Agent Routing', status: 'success', message: `Found agent: ${agentId.slice(0, 8)}...` };
    } else {
      results[1] = { step: 'Agent Routing', status: 'success', message: 'No agents online - will go to voicemail' };
    }
    setTestResults([...results]);

    // Step 3: Create test call event
    results.push({ step: 'Create Call Event', status: 'pending', message: 'Creating call_events record...' });
    setTestResults([...results]);

    const callSid = `TEST_${Date.now()}`;
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
        caller_name: 'Test Caller',
        call_source: callSource,
      })
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
      message: `Created event: ${callEvent.id.slice(0, 8)}...`,
      data: callEvent 
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
        results[3] = { step: 'Create Assignment', status: 'error', message: assignError.message };
      } else {
        results[3] = { step: 'Create Assignment', status: 'success', message: 'Assignment created' };
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
          notes: `Test missed call from ${fromNumber}`,
        });

      if (taskError) {
        results[results.length - 1] = { step: 'Voicemail Fallback', status: 'error', message: taskError.message };
      } else {
        results[results.length - 1] = { step: 'Voicemail Fallback', status: 'success', message: 'Callback task created' };
      }
      setTestResults([...results]);
    }

    // Cleanup: Mark test call as completed
    await supabase
      .from('call_events')
      .update({ call_status: 'COMPLETED', notes: 'Test call - auto-completed' })
      .eq('id', callEvent.id);

    toast({ title: 'Test Complete', description: 'All test steps executed' });
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
        <h1 className="text-2xl font-bold">Test Call Simulation</h1>
        <p className="text-muted-foreground">
          Simulate inbound calls to validate routing, logging, and voicemail fallback
        </p>
      </div>

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
            <div>
              <Label>Call Source</Label>
              <Select value={callSource} onValueChange={setCallSource}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="NATIVE">Native (Direct Twilio)</SelectItem>
                  <SelectItem value="GHL_FORWARD">GHL Forward</SelectItem>
                  <SelectItem value="GHL_DUAL_RING">GHL Dual Ring</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <Button 
              className="w-full" 
              onClick={runTest} 
              disabled={isRunning || !toNumber}
            >
              <Play className="w-4 h-4 mr-2" />
              {isRunning ? 'Running Test...' : 'Run Test Call'}
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
                Run a test to see results
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
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>What This Test Validates</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="p-2 bg-blue-100 rounded-lg">
                <Phone className="w-5 h-5 text-blue-600" />
              </div>
              <div>
                <p className="font-medium">Phone Number Lookup</p>
                <p className="text-sm text-muted-foreground">Verifies the number exists in phone_numbers table</p>
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
