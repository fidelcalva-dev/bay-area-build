import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { CheckCircle, XCircle, AlertCircle, ExternalLink, RefreshCw, Settings } from 'lucide-react';
import { toast } from 'sonner';

export default function GoogleSetupWizard() {
  const [ga4PropertyId, setGa4PropertyId] = useState('');
  const [gscSiteUrl, setGscSiteUrl] = useState('https://calsandumpsterspro.com/');
  const [gbpAccountId, setGbpAccountId] = useState('');
  const [saving, setSaving] = useState(false);

  const { data: connection, refetch: refetchConn } = useQuery({
    queryKey: ['google-connection-status'],
    queryFn: async () => {
      const { data } = await supabase
        .from('google_connections' as never)
        .select('google_email, status, scopes_json, last_used_at')
        .limit(1)
        .single();
      return data as { google_email: string; status: string; scopes_json: string[]; last_used_at: string } | null;
    },
  });

  const { data: configs, refetch: refetchConfig } = useQuery({
    queryKey: ['marketing-config'],
    queryFn: async () => {
      const { data } = await supabase
        .from('config_settings' as never)
        .select('key, value')
        .in('key', [
          'google.marketing_mode',
          'google.ga4_property_id',
          'google.gsc_site_url',
          'google.gbp_account_id',
          'google.gbp_locations_json',
        ]);
      const map: Record<string, string> = {};
      for (const c of (data || []) as { key: string; value: string }[]) {
        try { map[c.key] = JSON.parse(c.value); } catch { map[c.key] = c.value; }
      }
      return map;
    },
  });

  const handleConnect = async () => {
    try {
      const { data, error } = await supabase.functions.invoke('google-oauth-start');
      if (error) throw error;
      if (data?.oauth_url) {
        const popup = window.open(data.oauth_url, 'google-auth', 'width=600,height=700');
        const handler = (e: MessageEvent) => {
          if (e.data?.type === 'google-oauth-success') {
            toast.success(`Connected: ${e.data.email}`);
            refetchConn();
            window.removeEventListener('message', handler);
          } else if (e.data?.type === 'google-oauth-error') {
            toast.error(`Error: ${e.data.error}`);
            window.removeEventListener('message', handler);
          }
        };
        window.addEventListener('message', handler);
      }
    } catch (err) {
      toast.error('Failed to start OAuth flow');
      console.error(err);
    }
  };

  const handleSaveConfig = async () => {
    setSaving(true);
    try {
      const updates = [
        { key: 'google.ga4_property_id', value: JSON.stringify(ga4PropertyId || configs?.['google.ga4_property_id'] || '') },
        { key: 'google.gsc_site_url', value: JSON.stringify(gscSiteUrl || configs?.['google.gsc_site_url'] || '') },
        { key: 'google.gbp_account_id', value: JSON.stringify(gbpAccountId || configs?.['google.gbp_account_id'] || '') },
      ];

      for (const u of updates) {
        await supabase
          .from('config_settings' as never)
          .update({ value: u.value } as never)
          .eq('key', u.key);
      }

      toast.success('Configuration saved');
      refetchConfig();
    } catch {
      toast.error('Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleTestFetch = async (fn: string, label: string) => {
    try {
      toast.info(`Testing ${label}...`);
      const { data, error } = await supabase.functions.invoke(fn, {
        body: { start_date: '2026-01-18', end_date: '2026-02-17' },
      });
      if (error) throw error;
      toast.success(`${label}: ${data?.mode || 'OK'}`);
      console.log(`[${label}] Response:`, data);
    } catch (err) {
      toast.error(`${label} test failed`);
      console.error(err);
    }
  };

  const isConnected = connection?.status === 'CONNECTED';
  const marketingMode = configs?.['google.marketing_mode'] || 'DRY_RUN';

  const requiredScopes = [
    'https://www.googleapis.com/auth/analytics.readonly',
    'https://www.googleapis.com/auth/webmasters.readonly',
    'https://www.googleapis.com/auth/business.manage',
  ];

  const hasMarketingScopes = requiredScopes.every(
    (s) => connection?.scopes_json?.includes(s)
  );

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Google Marketing Setup</h1>
        <p className="text-muted-foreground">Connect GA4, Search Console, and Business Profile</p>
      </div>

      {/* Mode Banner */}
      <Card className={marketingMode === 'LIVE' ? 'border-green-500' : 'border-amber-500'}>
        <CardContent className="pt-4 flex items-center gap-3">
          {marketingMode === 'LIVE' ? (
            <CheckCircle className="h-5 w-5 text-green-500" />
          ) : (
            <AlertCircle className="h-5 w-5 text-amber-500" />
          )}
          <span className="font-medium">Mode: {marketingMode}</span>
          <span className="text-sm text-muted-foreground">
            {marketingMode === 'DRY_RUN'
              ? 'Using mock data. Configure credentials and switch to LIVE for real data.'
              : 'Fetching live data from Google APIs.'}
          </span>
        </CardContent>
      </Card>

      {/* Step 1: Google Account */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">1</span>
            Connect Google Account
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isConnected ? (
            <div className="flex items-center gap-3">
              <CheckCircle className="h-5 w-5 text-green-500" />
              <div>
                <p className="font-medium">{connection.google_email}</p>
                <p className="text-sm text-muted-foreground">Connected</p>
              </div>
              <Badge variant={hasMarketingScopes ? 'default' : 'destructive'}>
                {hasMarketingScopes ? 'Marketing scopes OK' : 'Missing marketing scopes'}
              </Badge>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-muted-foreground">
                Connect a Google account with access to GA4, Search Console, and GBP.
              </p>
              <Button onClick={handleConnect}>
                <ExternalLink className="h-4 w-4 mr-2" /> Connect Google Account
              </Button>
            </div>
          )}

          {isConnected && !hasMarketingScopes && (
            <div className="bg-amber-50 dark:bg-amber-950 border border-amber-200 dark:border-amber-800 rounded-md p-3 text-sm">
              <p className="font-medium text-amber-800 dark:text-amber-200">Missing API scopes</p>
              <p className="text-amber-700 dark:text-amber-300 mt-1">
                The current OAuth connection doesn't include GA4, GSC, or GBP scopes.
                You'll need to re-authorize with the required scopes in Google Cloud Console.
              </p>
              <p className="text-xs text-amber-600 dark:text-amber-400 mt-2">
                Required: analytics.readonly, webmasters.readonly, business.manage
              </p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Step 2: Configure IDs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">2</span>
            Configure Property IDs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <div>
              <Label>GA4 Property ID</Label>
              <Input
                placeholder="e.g. 123456789"
                value={ga4PropertyId || configs?.['google.ga4_property_id'] || ''}
                onChange={(e) => setGa4PropertyId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find in GA4 → Admin → Property Settings
              </p>
            </div>
            <div>
              <Label>Search Console Site URL</Label>
              <Input
                placeholder="https://calsandumpsterspro.com/"
                value={gscSiteUrl || configs?.['google.gsc_site_url'] || ''}
                onChange={(e) => setGscSiteUrl(e.target.value)}
              />
            </div>
            <div>
              <Label>GBP Account ID</Label>
              <Input
                placeholder="accounts/123456789"
                value={gbpAccountId || configs?.['google.gbp_account_id'] || ''}
                onChange={(e) => setGbpAccountId(e.target.value)}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Find in Business Profile Manager
              </p>
            </div>
          </div>
          <Button onClick={handleSaveConfig} disabled={saving}>
            <Settings className="h-4 w-4 mr-2" /> {saving ? 'Saving...' : 'Save Configuration'}
          </Button>
        </CardContent>
      </Card>

      {/* Step 3: Test Connections */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <span className="bg-primary text-primary-foreground rounded-full w-6 h-6 flex items-center justify-center text-sm">3</span>
            Test Connections
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-3">
            <Button variant="outline" onClick={() => handleTestFetch('ga4-fetch', 'GA4')}>
              <RefreshCw className="h-4 w-4 mr-2" /> Test GA4
            </Button>
            <Button variant="outline" onClick={() => handleTestFetch('gsc-fetch', 'GSC')}>
              <RefreshCw className="h-4 w-4 mr-2" /> Test Search Console
            </Button>
            <Button variant="outline" onClick={() => handleTestFetch('gbp-fetch-insights', 'GBP')}>
              <RefreshCw className="h-4 w-4 mr-2" /> Test Business Profile
            </Button>
          </div>
          <p className="text-xs text-muted-foreground mt-3">
            In DRY_RUN mode, tests return mock data. Switch to LIVE for real API calls.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
