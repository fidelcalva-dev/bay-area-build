import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Users, Send, CheckCircle, Clock, AlertTriangle, BarChart3, Mail, MessageSquare, RefreshCw, Loader2 } from 'lucide-react';

export default function ActivationDashboard() {
  const queryClient = useQueryClient();
  const [sendingBatch, setSendingBatch] = useState(false);
  const [channelFilter, setChannelFilter] = useState<string>('all');

  // Fetch activation metrics
  const { data: metrics } = useQuery({
    queryKey: ['activation-metrics'],
    queryFn: async () => {
      const { data: customers } = await supabase
        .from('customers')
        .select('id, activation_status, activation_attempts, billing_email, phone')
        .order('created_at', { ascending: false });

      const total = customers?.length || 0;
      const notSent = customers?.filter(c => c.activation_status === 'not_sent').length || 0;
      const sent = customers?.filter(c => c.activation_status === 'sent').length || 0;
      const opened = customers?.filter(c => c.activation_status === 'opened').length || 0;
      const activated = customers?.filter(c => c.activation_status === 'activated').length || 0;
      const expired = customers?.filter(c => c.activation_status === 'expired').length || 0;

      const withPhone = customers?.filter(c => c.phone && c.phone.length >= 7).length || 0;
      const withEmail = customers?.filter(c => c.billing_email && c.billing_email.includes('@')).length || 0;
      const noContact = customers?.filter(c => 
        (!c.phone || c.phone.length < 7) && (!c.billing_email || !c.billing_email.includes('@'))
      ).length || 0;

      return { total, notSent, sent, opened, activated, expired, withPhone, withEmail, noContact };
    },
  });

  // Fetch token-level data for tracking
  const { data: tokens } = useQuery({
    queryKey: ['activation-tokens'],
    queryFn: async () => {
      const { data } = await supabase
        .from('activation_tokens')
        .select('id, customer_id, channel, status, sent_at, clicked_at, used_at, error_message, attempt_number, created_at')
        .order('created_at', { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  // Fetch failed contacts
  const { data: failedContacts } = useQuery({
    queryKey: ['activation-failed'],
    queryFn: async () => {
      const { data } = await supabase
        .from('activation_tokens')
        .select('id, customer_id, channel, error_message, created_at')
        .eq('status', 'failed')
        .order('created_at', { ascending: false })
        .limit(50);
      return data || [];
    },
  });

  // Batch send mutation
  const batchSend = useMutation({
    mutationFn: async ({ channel }: { channel: string }) => {
      // Get customers who haven't been sent yet
      const { data: customers } = await supabase
        .from('customers')
        .select('id')
        .eq('activation_status', 'not_sent')
        .limit(50);

      if (!customers || customers.length === 0) {
        throw new Error('No customers pending activation');
      }

      const { data, error } = await supabase.functions.invoke('send-activation', {
        body: {
          customer_ids: customers.map(c => c.id),
          channel,
        },
      });

      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Batch sent: ${data.sent} sent, ${data.skipped} skipped, ${data.failed} failed`);
      queryClient.invalidateQueries({ queryKey: ['activation-metrics'] });
      queryClient.invalidateQueries({ queryKey: ['activation-tokens'] });
      setSendingBatch(false);
    },
    onError: (err: Error) => {
      toast.error(err.message);
      setSendingBatch(false);
    },
  });

  const total = metrics?.total || 0;
  const activationRate = total > 0 ? ((metrics?.activated || 0) / total * 100) : 0;
  const deliveryRate = total > 0 ? (((metrics?.sent || 0) + (metrics?.opened || 0) + (metrics?.activated || 0)) / total * 100) : 0;
  const clickRate = (metrics?.sent || 0) > 0 ? (((metrics?.opened || 0) + (metrics?.activated || 0)) / (metrics?.sent || 1) * 100) : 0;

  // Token stats
  const smsSent = tokens?.filter(t => t.channel === 'sms' && t.status !== 'failed').length || 0;
  const emailSent = tokens?.filter(t => t.channel === 'email' && t.status !== 'failed').length || 0;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Activation</h1>
          <p className="text-muted-foreground">Portal onboarding campaign dashboard</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            onClick={() => {
              queryClient.invalidateQueries({ queryKey: ['activation-metrics'] });
              queryClient.invalidateQueries({ queryKey: ['activation-tokens'] });
            }}
          >
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
          <Button
            onClick={() => {
              setSendingBatch(true);
              batchSend.mutate({ channel: 'sms' });
            }}
            disabled={sendingBatch || (metrics?.notSent || 0) === 0}
          >
            {sendingBatch ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Send className="h-4 w-4 mr-2" />}
            Send Batch (SMS)
          </Button>
          <Button
            variant="secondary"
            onClick={() => {
              setSendingBatch(true);
              batchSend.mutate({ channel: 'email' });
            }}
            disabled={sendingBatch || (metrics?.notSent || 0) === 0}
          >
            {sendingBatch ? <Loader2 className="h-4 w-4 mr-2 animate-spin" /> : <Mail className="h-4 w-4 mr-2" />}
            Send Batch (Email)
          </Button>
        </div>
      </div>

      {/* Funnel Metrics */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="h-5 w-5 text-muted-foreground" />
              <div>
                <p className="text-2xl font-bold">{metrics?.total || 0}</p>
                <p className="text-xs text-muted-foreground">Total Uploaded</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Send className="h-5 w-5 text-blue-500" />
              <div>
                <p className="text-2xl font-bold">{(metrics?.sent || 0) + (metrics?.opened || 0) + (metrics?.activated || 0)}</p>
                <p className="text-xs text-muted-foreground">Delivered</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-yellow-500" />
              <div>
                <p className="text-2xl font-bold">{(metrics?.opened || 0) + (metrics?.activated || 0)}</p>
                <p className="text-xs text-muted-foreground">Clicked</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.activated || 0}</p>
                <p className="text-xs text-muted-foreground">Activated</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <div>
                <p className="text-2xl font-bold">{metrics?.expired || 0}</p>
                <p className="text-xs text-muted-foreground">Expired</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Conversion Funnel */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Conversion Funnel
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Uploaded → Delivered</span>
              <span className="font-medium">{deliveryRate.toFixed(1)}%</span>
            </div>
            <Progress value={deliveryRate} className="h-3" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Delivered → Clicked</span>
              <span className="font-medium">{clickRate.toFixed(1)}%</span>
            </div>
            <Progress value={clickRate} className="h-3" />
          </div>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Total → Activated</span>
              <span className="font-medium">{activationRate.toFixed(1)}%</span>
            </div>
            <Progress value={activationRate} className="h-3" />
          </div>
        </CardContent>
      </Card>

      {/* Channel Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <MessageSquare className="h-5 w-5" />
              <span className="font-medium">SMS Sent</span>
            </div>
            <p className="text-3xl font-bold">{smsSent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <Mail className="h-5 w-5" />
              <span className="font-medium">Emails Sent</span>
            </div>
            <p className="text-3xl font-bold">{emailSent}</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2 mb-2">
              <AlertTriangle className="h-5 w-5 text-red-500" />
              <span className="font-medium">No Contact Info</span>
            </div>
            <p className="text-3xl font-bold">{metrics?.noContact || 0}</p>
          </CardContent>
        </Card>
      </div>

      {/* Pending & Status */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>Activation Status</CardTitle>
            <span className="text-sm text-muted-foreground">{metrics?.notSent || 0} pending</span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex gap-3 flex-wrap">
            <Badge variant="outline" className="px-3 py-1">Not Sent: {metrics?.notSent || 0}</Badge>
            <Badge className="bg-blue-100 text-blue-800 px-3 py-1">Sent: {metrics?.sent || 0}</Badge>
            <Badge className="bg-yellow-100 text-yellow-800 px-3 py-1">Opened: {metrics?.opened || 0}</Badge>
            <Badge className="bg-green-100 text-green-800 px-3 py-1">Activated: {metrics?.activated || 0}</Badge>
            <Badge className="bg-red-100 text-red-800 px-3 py-1">Expired: {metrics?.expired || 0}</Badge>
          </div>
        </CardContent>
      </Card>

      {/* Failed Deliveries */}
      {failedContacts && failedContacts.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="text-red-600">Failed Deliveries</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Customer ID</TableHead>
                  <TableHead>Channel</TableHead>
                  <TableHead>Error</TableHead>
                  <TableHead>Date</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {failedContacts.map((f) => (
                  <TableRow key={f.id}>
                    <TableCell className="font-mono text-xs">{f.customer_id.slice(0, 8)}...</TableCell>
                    <TableCell>
                      <Badge variant="outline">{f.channel}</Badge>
                    </TableCell>
                    <TableCell className="text-sm text-red-600">{f.error_message || 'Unknown'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground">
                      {new Date(f.created_at).toLocaleDateString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
