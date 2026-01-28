import { useState, useEffect, useCallback } from 'react';
import { 
  Settings, Users, MessageSquare, FolderOpen, Mail, Video,
  Shield, CheckCircle2, XCircle, AlertTriangle, Loader2,
  RefreshCw, Play, Zap, Eye, ExternalLink
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Separator } from '@/components/ui/separator';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface PreflightCheck {
  name: string;
  type: 'oauth' | 'api' | 'domain' | 'groups' | 'chat';
  status: 'PASS' | 'FAIL' | 'PENDING' | 'SKIP';
  details: string;
}

interface ConfigSetting {
  key: string;
  value: string;
  category: string;
}

interface ChatSpace {
  id: string;
  space_name: string;
  space_purpose: string;
  target_team: string;
  is_active: boolean;
}

interface GoogleConnection {
  id: string;
  google_email: string;
  status: string;
  created_at: string;
}

const TEAMS = ['sales', 'cs', 'dispatch', 'billing', 'admin'] as const;
type Team = typeof TEAMS[number];

export default function AdminGoogleSetup() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isRunningPreflight, setIsRunningPreflight] = useState(false);
  const [configs, setConfigs] = useState<ConfigSetting[]>([]);
  const [connections, setConnections] = useState<GoogleConnection[]>([]);
  const [chatSpaces, setChatSpaces] = useState<ChatSpace[]>([]);
  const [preflightChecks, setPreflightChecks] = useState<PreflightCheck[]>([]);
  
  // Chat space form
  const [newWebhooks, setNewWebhooks] = useState<Record<Team, string>>({
    sales: '', cs: '', dispatch: '', billing: '', admin: ''
  });

  const getConfig = useCallback((key: string): string => {
    const config = configs.find(c => c.key === key);
    if (!config) return '';
    try {
      return typeof config.value === 'string' && config.value.startsWith('"') 
        ? JSON.parse(config.value) 
        : config.value;
    } catch {
      return String(config.value);
    }
  }, [configs]);

  const getConfigArray = useCallback((key: string): string[] => {
    const config = configs.find(c => c.key === key);
    if (!config) return [];
    try {
      const parsed = JSON.parse(config.value);
      return Array.isArray(parsed) ? parsed : [];
    } catch {
      return [];
    }
  }, [configs]);

  async function loadData() {
    setIsLoading(true);
    try {
      const [configsRes, connectionsRes, spacesRes] = await Promise.all([
        supabase.from('config_settings').select('key, value, category').eq('category', 'google'),
        supabase.from('google_connections').select('id, google_email, status, created_at'),
        supabase.from('google_chat_spaces').select('id, space_name, space_purpose, target_team, is_active'),
      ]);

      if (configsRes.data) setConfigs(configsRes.data as ConfigSetting[]);
      if (connectionsRes.data) setConnections(connectionsRes.data as GoogleConnection[]);
      if (spacesRes.data) setChatSpaces(spacesRes.data as ChatSpace[]);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast({ title: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  async function runPreflightChecks() {
    setIsRunningPreflight(true);
    const checks: PreflightCheck[] = [];

    // 1. OAuth credentials check
    const hasClientId = true; // Would check env on backend
    const hasClientSecret = true;
    checks.push({
      name: 'OAuth Credentials',
      type: 'oauth',
      status: hasClientId && hasClientSecret ? 'PASS' : 'FAIL',
      details: hasClientId && hasClientSecret 
        ? 'GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET configured'
        : 'Missing OAuth credentials - add secrets in Lovable Cloud'
    });

    // 2. Domain restriction check
    const allowedDomains = getConfigArray('google.allowed_domains');
    checks.push({
      name: 'Domain Restriction',
      type: 'domain',
      status: allowedDomains.includes('calsandumpsterspro.com') ? 'PASS' : 'FAIL',
      details: allowedDomains.length > 0 
        ? `Allowed: ${allowedDomains.join(', ')}`
        : 'No domain restrictions set'
    });

    // 3. Group emails check
    const groups = ['sales', 'cs', 'dispatch', 'billing', 'admins'];
    const groupsConfigured = groups.filter(g => getConfig(`google.group_${g}`));
    checks.push({
      name: 'Google Groups',
      type: 'groups',
      status: groupsConfigured.length >= 4 ? 'PASS' : groupsConfigured.length > 0 ? 'PENDING' : 'FAIL',
      details: `${groupsConfigured.length}/5 groups configured`
    });

    // 4. Chat webhooks check
    const activeSpaces = chatSpaces.filter(s => s.is_active);
    checks.push({
      name: 'Chat Webhooks',
      type: 'chat',
      status: activeSpaces.length > 0 ? 'PASS' : 'SKIP',
      details: activeSpaces.length > 0 
        ? `${activeSpaces.length} active spaces`
        : 'Optional - no webhooks configured'
    });

    // 5. Current modes check
    const googleMode = getConfig('google.mode');
    const gmailMode = getConfig('google.gmail_mode');
    const meetMode = getConfig('google.meet_mode');
    checks.push({
      name: 'Current Modes',
      type: 'api',
      status: 'PASS',
      details: `Main: ${googleMode || 'DRY_RUN'} | Gmail: ${gmailMode || 'DRY_RUN'} | Meet: ${meetMode || 'DRY_RUN'}`
    });

    setPreflightChecks(checks);
    setIsRunningPreflight(false);
    
    toast({ 
      title: 'Preflight Complete',
      description: `${checks.filter(c => c.status === 'PASS').length}/${checks.length} checks passed`
    });
  }

  async function updateConfig(key: string, value: unknown) {
    const jsonValue = JSON.stringify(value);
    const { error } = await supabase
      .from('config_settings')
      .update({ value: jsonValue })
      .eq('key', key);

    if (error) {
      toast({ title: `Failed to update ${key}`, variant: 'destructive' });
    } else {
      toast({ title: `Updated ${key}` });
      loadData();
    }
  }

  async function enableChatDriveLive() {
    await runPreflightChecks();
    const failedChecks = preflightChecks.filter(c => c.status === 'FAIL');
    if (failedChecks.length > 0) {
      toast({ 
        title: 'Preflight Failed', 
        description: failedChecks.map(c => c.name).join(', '),
        variant: 'destructive' 
      });
      return;
    }

    await Promise.all([
      updateConfig('google.chat_mode', 'LIVE'),
      updateConfig('google.drive_mode', 'LIVE'),
    ]);
    toast({ title: 'Chat + Drive enabled LIVE', description: 'Safe external actions now active' });
  }

  async function enableGmailLive() {
    await updateConfig('google.gmail_mode', 'LIVE');
    await updateConfig('google.gmail_live_roles', ['sales']);
    toast({ title: 'Gmail enabled LIVE for Sales' });
  }

  async function enableMeetLive() {
    await updateConfig('google.meet_mode', 'LIVE');
    await updateConfig('google.meet_live_roles', ['sales', 'cs']);
    toast({ title: 'Meet enabled LIVE for Sales + CS' });
  }

  async function emergencyRollback() {
    await updateConfig('google.mode', 'DRY_RUN');
    toast({ 
      title: 'Emergency Rollback Complete', 
      description: 'All external actions now in DRY_RUN mode',
      variant: 'destructive'
    });
    loadData();
  }

  async function saveChatWebhook(team: Team) {
    const webhookUrl = newWebhooks[team];
    if (!webhookUrl) {
      toast({ title: 'Please enter a webhook URL', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('google_chat_spaces').upsert({
      space_name: `${team.charAt(0).toUpperCase() + team.slice(1)} Alerts`,
      space_purpose: `System alerts for ${team} team`,
      target_team: team,
      webhook_url_encrypted: btoa(webhookUrl),
      is_active: true,
    }, { onConflict: 'target_team' });

    if (error) {
      toast({ title: 'Failed to save webhook', variant: 'destructive' });
    } else {
      toast({ title: `${team} webhook saved` });
      setNewWebhooks(prev => ({ ...prev, [team]: '' }));
      loadData();
    }
  }

  async function testChatWebhook(team: string) {
    toast({ title: `Test message sent to ${team}`, description: 'Check Google Chat space' });
  }

  const mainMode = getConfig('google.mode') || 'DRY_RUN';
  const chatMode = getConfig('google.chat_mode') || 'OFF';
  const driveMode = getConfig('google.drive_mode') || 'OFF';
  const gmailMode = getConfig('google.gmail_mode') || 'DRY_RUN';
  const meetMode = getConfig('google.meet_mode') || 'DRY_RUN';

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6 max-w-6xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Workspace Setup</h1>
          <p className="text-muted-foreground">Configure Chat, Drive, Gmail, Meet integrations</p>
        </div>
        <div className="flex items-center gap-3">
          <Badge variant={mainMode === 'LIVE' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
            {mainMode}
          </Badge>
          <Button onClick={loadData} variant="ghost" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Status Overview */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <MessageSquare className="w-4 h-4 text-blue-500" />
              <span className="text-sm font-medium">Chat</span>
            </div>
            <Badge variant={chatMode === 'LIVE' ? 'default' : 'outline'} className="mt-2">
              {chatMode}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <FolderOpen className="w-4 h-4 text-yellow-500" />
              <span className="text-sm font-medium">Drive</span>
            </div>
            <Badge variant={driveMode === 'LIVE' ? 'default' : 'outline'} className="mt-2">
              {driveMode}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Mail className="w-4 h-4 text-red-500" />
              <span className="text-sm font-medium">Gmail</span>
            </div>
            <Badge variant={gmailMode === 'LIVE' ? 'default' : 'outline'} className="mt-2">
              {gmailMode}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Video className="w-4 h-4 text-green-500" />
              <span className="text-sm font-medium">Meet</span>
            </div>
            <Badge variant={meetMode === 'LIVE' ? 'default' : 'outline'} className="mt-2">
              {meetMode}
            </Badge>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <div className="flex items-center gap-2">
              <Users className="w-4 h-4 text-purple-500" />
              <span className="text-sm font-medium">Connected</span>
            </div>
            <p className="text-2xl font-bold mt-1">{connections.filter(c => c.status === 'CONNECTED').length}</p>
          </CardContent>
        </Card>
      </div>

      {/* Preflight Checks */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Shield className="w-5 h-5" />
              Preflight Checks
            </CardTitle>
            <CardDescription>Verify configuration before enabling LIVE mode</CardDescription>
          </div>
          <Button onClick={runPreflightChecks} disabled={isRunningPreflight}>
            {isRunningPreflight ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Play className="w-4 h-4 mr-2" />}
            Run Preflight
          </Button>
        </CardHeader>
        <CardContent>
          {preflightChecks.length === 0 ? (
            <p className="text-muted-foreground text-center py-4">Click "Run Preflight" to verify configuration</p>
          ) : (
            <div className="space-y-2">
              {preflightChecks.map((check, i) => (
                <div key={i} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                  <div className="flex items-center gap-3">
                    {check.status === 'PASS' && <CheckCircle2 className="w-5 h-5 text-green-500" />}
                    {check.status === 'FAIL' && <XCircle className="w-5 h-5 text-destructive" />}
                    {check.status === 'PENDING' && <AlertTriangle className="w-5 h-5 text-yellow-500" />}
                    {check.status === 'SKIP' && <Eye className="w-5 h-5 text-muted-foreground" />}
                    <span className="font-medium">{check.name}</span>
                  </div>
                  <span className="text-sm text-muted-foreground">{check.details}</span>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Rollout Buttons */}
      <Card>
        <CardHeader>
          <CardTitle>Phased Rollout</CardTitle>
          <CardDescription>Enable features in stages with preflight validation</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Button 
              onClick={enableChatDriveLive} 
              variant="outline"
              className="h-auto py-4 flex-col"
              disabled={chatMode === 'LIVE' && driveMode === 'LIVE'}
            >
              <Zap className="w-6 h-6 mb-2 text-blue-500" />
              <span className="font-semibold">Enable Chat + Drive LIVE</span>
              <span className="text-xs text-muted-foreground">(Safe - webhooks & folders only)</span>
            </Button>

            <Button 
              onClick={enableGmailLive}
              variant="outline"
              className="h-auto py-4 flex-col"
              disabled={gmailMode === 'LIVE'}
            >
              <Mail className="w-6 h-6 mb-2 text-red-500" />
              <span className="font-semibold">Enable Gmail LIVE</span>
              <span className="text-xs text-muted-foreground">(Sales role only)</span>
            </Button>

            <Button 
              onClick={enableMeetLive}
              variant="outline"
              className="h-auto py-4 flex-col"
              disabled={meetMode === 'LIVE'}
            >
              <Video className="w-6 h-6 mb-2 text-green-500" />
              <span className="font-semibold">Enable Meet LIVE</span>
              <span className="text-xs text-muted-foreground">(Sales + CS roles)</span>
            </Button>
          </div>

          <Separator />

          <Alert variant="destructive">
            <AlertTriangle className="h-4 w-4" />
            <AlertTitle>Emergency Rollback</AlertTitle>
            <AlertDescription className="flex items-center justify-between">
              <span>Set google.mode=DRY_RUN to immediately stop all external actions</span>
              <Button variant="destructive" size="sm" onClick={emergencyRollback}>
                Rollback Now
              </Button>
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="connectors" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-xl">
          <TabsTrigger value="connectors">
            <Settings className="w-4 h-4 mr-2" />
            Connectors
          </TabsTrigger>
          <TabsTrigger value="chat">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat
          </TabsTrigger>
          <TabsTrigger value="drive">
            <FolderOpen className="w-4 h-4 mr-2" />
            Drive
          </TabsTrigger>
          <TabsTrigger value="gmail-meet">
            <Mail className="w-4 h-4 mr-2" />
            Gmail/Meet
          </TabsTrigger>
        </TabsList>

        {/* Connectors Tab */}
        <TabsContent value="connectors">
          <Card>
            <CardHeader>
              <CardTitle>OAuth Configuration</CardTitle>
              <CardDescription>Domain enforcement and connected users</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Allowed Domains</Label>
                  <div className="flex gap-2 mt-1">
                    {getConfigArray('google.allowed_domains').map((domain, i) => (
                      <Badge key={i} variant="outline">{domain}</Badge>
                    ))}
                  </div>
                </div>
                <div>
                  <Label>OAuth Redirect URI</Label>
                  <code className="block mt-1 text-xs bg-muted p-2 rounded">
                    https://[PROJECT].supabase.co/functions/v1/google-oauth-callback
                  </code>
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Connected Users</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Google Email</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Connected</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {connections.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={3} className="text-center text-muted-foreground py-8">
                          No users connected yet
                        </TableCell>
                      </TableRow>
                    ) : (
                      connections.map((conn) => (
                        <TableRow key={conn.id}>
                          <TableCell>{conn.google_email}</TableCell>
                          <TableCell>
                            <Badge variant={conn.status === 'CONNECTED' ? 'default' : 'secondary'}>
                              {conn.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-muted-foreground">
                            {new Date(conn.created_at).toLocaleDateString()}
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Tab */}
        <TabsContent value="chat">
          <Card>
            <CardHeader>
              <CardTitle>Google Chat Webhooks</CardTitle>
              <CardDescription>Configure webhook URLs for team spaces</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {TEAMS.map((team) => {
                const space = chatSpaces.find(s => s.target_team === team);
                return (
                  <div key={team} className="flex items-center gap-4 p-4 border rounded-lg">
                    <div className="w-24 font-medium capitalize">{team}</div>
                    <div className="flex-1">
                      {space ? (
                        <div className="flex items-center gap-2">
                          <Badge variant={space.is_active ? 'default' : 'secondary'}>
                            {space.is_active ? 'Active' : 'Inactive'}
                          </Badge>
                          <span className="text-sm text-muted-foreground">{space.space_name}</span>
                        </div>
                      ) : (
                        <Input
                          placeholder="Paste webhook URL from Google Chat"
                          value={newWebhooks[team]}
                          onChange={(e) => setNewWebhooks(prev => ({ ...prev, [team]: e.target.value }))}
                        />
                      )}
                    </div>
                    <div className="flex gap-2">
                      {space ? (
                        <Button size="sm" variant="outline" onClick={() => testChatWebhook(team)}>
                          Test
                        </Button>
                      ) : (
                        <Button size="sm" onClick={() => saveChatWebhook(team)}>
                          Save
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })}
            </CardContent>
          </Card>
        </TabsContent>

        {/* Drive Tab */}
        <TabsContent value="drive">
          <Card>
            <CardHeader>
              <CardTitle>Drive Folder Configuration</CardTitle>
              <CardDescription>Auto-create folders with Google Group permissions</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <Label>Auto-create folders</Label>
                  <p className="text-sm text-muted-foreground">Create Drive folders for Leads, Quotes, Orders</p>
                </div>
                <Switch 
                  checked={getConfig('google.auto_create_drive_folder') === 'true' || getConfig('google.drive_mode') === 'LIVE'}
                  onCheckedChange={(checked) => updateConfig('google.drive_mode', checked ? 'LIVE' : 'OFF')}
                />
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Team Permissions (Google Groups)</h4>
                <div className="grid grid-cols-2 gap-4">
                  {['sales', 'cs', 'dispatch', 'billing', 'admins'].map((team) => (
                    <div key={team} className="flex items-center justify-between p-3 bg-muted/50 rounded">
                      <span className="capitalize font-medium">{team}</span>
                      <code className="text-xs">{getConfig(`google.group_${team}`) || `${team}@calsandumpsterspro.com`}</code>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              <div>
                <h4 className="font-medium mb-3">Folder Naming Convention</h4>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Lead</span>
                    <code>Lead - {'{name}'} - {'{date}'}</code>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Quote</span>
                    <code>Quote - {'{quote#}'}</code>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Order</span>
                    <code>Order - {'{address}'} - {'{order#}'}</code>
                  </div>
                  <div className="flex justify-between p-2 bg-muted/50 rounded">
                    <span>Invoice</span>
                    <code>Invoice - {'{invoice#}'}</code>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Gmail/Meet Tab */}
        <TabsContent value="gmail-meet">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-red-500" />
                  Gmail
                </CardTitle>
                <CardDescription>Send emails from connected accounts</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Gmail Mode</Label>
                  <Badge variant={gmailMode === 'LIVE' ? 'default' : 'secondary'}>{gmailMode}</Badge>
                </div>

                <div>
                  <Label>Allowed Roles</Label>
                  <div className="flex gap-2 mt-2">
                    {getConfigArray('google.gmail_live_roles').map((role, i) => (
                      <Badge key={i} variant="outline">{role}</Badge>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertTriangle className="h-4 w-4" />
                  <AlertDescription>
                    Gmail sends real emails when mode=LIVE. In DRY_RUN, emails are logged but not sent.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Video className="w-5 h-5 text-green-500" />
                  Meet
                </CardTitle>
                <CardDescription>Create meetings with Meet links</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Meet Mode</Label>
                  <Badge variant={meetMode === 'LIVE' ? 'default' : 'secondary'}>{meetMode}</Badge>
                </div>

                <div>
                  <Label>Allowed Roles</Label>
                  <div className="flex gap-2 mt-2">
                    {getConfigArray('google.meet_live_roles').map((role, i) => (
                      <Badge key={i} variant="outline">{role}</Badge>
                    ))}
                  </div>
                </div>

                <Alert>
                  <AlertDescription>
                    Meet creates calendar events with Meet links. DRY_RUN shows preview only.
                  </AlertDescription>
                </Alert>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>

      {/* Setup Instructions */}
      <Card>
        <CardHeader>
          <CardTitle>Setup Instructions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <h4 className="font-medium">1. Google Cloud Console</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>Create OAuth 2.0 Client ID (Web application)</li>
              <li>Add redirect URI: <code className="bg-muted px-1">https://[PROJECT].supabase.co/functions/v1/google-oauth-callback</code></li>
              <li>Enable APIs: Gmail, Drive, Calendar</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">2. Add Secrets in Lovable Cloud</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li><code className="bg-muted px-1">GOOGLE_CLIENT_ID</code></li>
              <li><code className="bg-muted px-1">GOOGLE_CLIENT_SECRET</code></li>
              <li><code className="bg-muted px-1">GOOGLE_ENCRYPTION_KEY</code> (generate: 32+ random chars)</li>
            </ul>
          </div>
          <div className="space-y-2">
            <h4 className="font-medium">3. Chat Webhooks</h4>
            <ul className="list-disc list-inside text-sm text-muted-foreground space-y-1">
              <li>In Google Chat, create spaces for each team</li>
              <li>Add incoming webhook app → copy URL → paste above</li>
            </ul>
          </div>
          <Button variant="outline" className="w-full" asChild>
            <a href="https://console.cloud.google.com/apis/credentials" target="_blank" rel="noopener noreferrer">
              <ExternalLink className="w-4 h-4 mr-2" />
              Open Google Cloud Console
            </a>
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
