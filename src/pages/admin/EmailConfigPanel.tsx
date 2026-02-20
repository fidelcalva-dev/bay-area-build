import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Mail, Shield, AlertTriangle, CheckCircle, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';

interface EmailConfig {
  'email.mode': string;
  'email.domain_verified': string;
  'email.from_name': string;
  'email.from_email': string;
  'email.reply_to': string;
}

const DEFAULT_CONFIG: EmailConfig = {
  'email.mode': 'DRY_RUN',
  'email.domain_verified': 'false',
  'email.from_name': 'Calsan Dumpsters Pro',
  'email.from_email': 'noreply@calsandumpsterspro.com',
  'email.reply_to': 'info@calsandumpsterspro.com',
};

export default function EmailConfigPanel() {
  const [config, setConfig] = useState<EmailConfig>(DEFAULT_CONFIG);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [recentLogs, setRecentLogs] = useState<any[]>([]);

  const fetchConfig = useCallback(async () => {
    setLoading(true);
    const { data } = await supabase
      .from('config_settings')
      .select('key, value')
      .in('key', Object.keys(DEFAULT_CONFIG));

    if (data) {
      const loaded = { ...DEFAULT_CONFIG };
      data.forEach((row: any) => {
        const val = typeof row.value === 'string' ? row.value.replace(/^"|"$/g, '') : row.value;
        (loaded as any)[row.key] = val;
      });
      setConfig(loaded);
    }

    // Fetch recent message logs
    const { data: logs } = await supabase
      .from('message_logs')
      .select('id, channel, to_address, subject, status, created_at, error_message')
      .eq('channel', 'EMAIL')
      .order('created_at', { ascending: false })
      .limit(10);

    if (logs) setRecentLogs(logs);
    setLoading(false);
  }, []);

  useEffect(() => { fetchConfig(); }, [fetchConfig]);

  const updateSetting = async (key: string, value: string) => {
    setSaving(true);
    const jsonValue = JSON.stringify(value);

    const { error } = await supabase
      .from('config_settings')
      .upsert({ key, value: jsonValue } as any, { onConflict: 'key' });

    if (error) {
      toast.error(`Failed to update ${key}`);
    } else {
      setConfig(prev => ({ ...prev, [key]: value }));
      toast.success(`${key} updated`);
    }
    setSaving(false);
  };

  const isLive = config['email.mode'] === 'LIVE';
  const isDomainVerified = config['email.domain_verified'] === 'true';

  if (loading) {
    return (
      <div className="container mx-auto py-6 space-y-4">
        <Skeleton className="h-8 w-64" />
        <Skeleton className="h-48 w-full" />
        <Skeleton className="h-48 w-full" />
      </div>
    );
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Mail className="h-6 w-6" />
            Email Pipeline Configuration
          </h1>
          <p className="text-muted-foreground">Control email delivery mode and domain verification</p>
        </div>
        <Button variant="outline" onClick={fetchConfig} disabled={loading}>
          <RefreshCw className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Status Banner */}
      {!isLive && (
        <Alert>
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Email pipeline is in <strong>DRY_RUN</strong> mode. No external emails are being sent. 
            All attempts are logged to message_logs for review.
          </AlertDescription>
        </Alert>
      )}

      {isLive && !isDomainVerified && (
        <Alert variant="destructive">
          <AlertTriangle className="h-4 w-4" />
          <AlertDescription>
            Email mode is LIVE but domain is <strong>NOT verified</strong>. 
            Resend will reject all sends. Verify your domain DNS first, then enable the toggle below.
          </AlertDescription>
        </Alert>
      )}

      {isLive && isDomainVerified && (
        <Alert>
          <CheckCircle className="h-4 w-4" />
          <AlertDescription>
            Email pipeline is <strong>LIVE</strong> and domain is verified. Emails are being delivered via Resend.
          </AlertDescription>
        </Alert>
      )}

      {/* Mode Toggle */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Delivery Mode</CardTitle>
          <CardDescription>Switch between DRY_RUN (log only) and LIVE (actually send)</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium">Email Mode</p>
              <p className="text-sm text-muted-foreground">
                {isLive ? 'Emails are being sent via Resend' : 'Emails are logged but NOT sent'}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isLive ? 'default' : 'secondary'}>
                {isLive ? 'LIVE' : 'DRY_RUN'}
              </Badge>
              <Switch
                checked={isLive}
                disabled={saving}
                onCheckedChange={(checked) => updateSetting('email.mode', checked ? 'LIVE' : 'DRY_RUN')}
              />
            </div>
          </div>

          <div className="flex items-center justify-between p-4 border rounded-lg">
            <div>
              <p className="font-medium flex items-center gap-2">
                <Shield className="h-4 w-4" />
                Domain Verified
              </p>
              <p className="text-sm text-muted-foreground">
                Set to true ONLY after completing Resend DNS verification for {config['email.from_email']}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <Badge variant={isDomainVerified ? 'default' : 'destructive'}>
                {isDomainVerified ? 'Verified' : 'Not Verified'}
              </Badge>
              <Switch
                checked={isDomainVerified}
                disabled={saving}
                onCheckedChange={(checked) => updateSetting('email.domain_verified', checked ? 'true' : 'false')}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Sender Details */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Sender Configuration</CardTitle>
          <CardDescription>From name, email, and reply-to address</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>From Name</Label>
              <Input
                value={config['email.from_name']}
                onChange={(e) => setConfig(prev => ({ ...prev, 'email.from_name': e.target.value }))}
                onBlur={() => updateSetting('email.from_name', config['email.from_name'])}
              />
            </div>
            <div className="space-y-2">
              <Label>From Email</Label>
              <Input
                value={config['email.from_email']}
                onChange={(e) => setConfig(prev => ({ ...prev, 'email.from_email': e.target.value }))}
                onBlur={() => updateSetting('email.from_email', config['email.from_email'])}
              />
            </div>
            <div className="space-y-2">
              <Label>Reply-To</Label>
              <Input
                value={config['email.reply_to']}
                onChange={(e) => setConfig(prev => ({ ...prev, 'email.reply_to': e.target.value }))}
                onBlur={() => updateSetting('email.reply_to', config['email.reply_to'])}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Email Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">Recent Email Logs</CardTitle>
          <CardDescription>Last 10 email attempts from message_logs</CardDescription>
        </CardHeader>
        <CardContent>
          {recentLogs.length === 0 ? (
            <p className="text-center py-6 text-muted-foreground">No email logs yet</p>
          ) : (
            <div className="space-y-2">
              {recentLogs.map((log) => (
                <div key={log.id} className="flex items-center justify-between p-3 border rounded-lg text-sm">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium truncate">{log.to_address}</p>
                    <p className="text-muted-foreground truncate">{log.subject}</p>
                  </div>
                  <div className="flex items-center gap-2 flex-shrink-0">
                    <Badge variant={
                      log.status === 'SENT' ? 'default' :
                      log.status === 'DRY_RUN' ? 'secondary' : 'destructive'
                    }>
                      {log.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(log.created_at).toLocaleDateString()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      <p className="text-xs text-muted-foreground text-center">
        Internal operations tool. Not visible to customers.
      </p>
    </div>
  );
}
