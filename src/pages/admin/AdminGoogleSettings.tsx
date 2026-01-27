import { useState, useEffect } from 'react';
import { 
  Mail, Video, FolderOpen, MessageSquare, 
  Settings, Users, Activity, Shield, Loader2,
  RefreshCw, Plus, Trash2, Check, X
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface GoogleConnection {
  id: string;
  user_id: string;
  google_email: string;
  status: string;
  created_at: string;
  last_used_at: string | null;
}

interface GoogleChatSpace {
  id: string;
  space_name: string;
  space_purpose: string;
  target_team: string;
  is_active: boolean;
  created_at: string;
}

interface GoogleEventLog {
  id: string;
  user_id: string;
  action_type: string;
  entity_type: string | null;
  entity_id: string | null;
  status: string;
  error_message: string | null;
  created_at: string;
}

interface ConfigSetting {
  key: string;
  value: string;
  description: string | null;
}

export default function AdminGoogleSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [connections, setConnections] = useState<GoogleConnection[]>([]);
  const [chatSpaces, setChatSpaces] = useState<GoogleChatSpace[]>([]);
  const [eventLogs, setEventLogs] = useState<GoogleEventLog[]>([]);
  const [configs, setConfigs] = useState<ConfigSetting[]>([]);
  
  const [addSpaceDialogOpen, setAddSpaceDialogOpen] = useState(false);
  const [newSpace, setNewSpace] = useState({ name: '', purpose: '', team: 'sales', webhookUrl: '' });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setIsLoading(true);
    try {
      const [connectionsRes, spacesRes, logsRes, configsRes] = await Promise.all([
        supabase.from('google_connections').select('*').order('created_at', { ascending: false }),
        supabase.from('google_chat_spaces').select('*').order('created_at', { ascending: false }),
        supabase.from('google_events_log').select('*').order('created_at', { ascending: false }).limit(100),
        supabase.from('config_settings').select('key, value, description').eq('category', 'google'),
      ]);

      if (connectionsRes.data) setConnections(connectionsRes.data as GoogleConnection[]);
      if (spacesRes.data) setChatSpaces(spacesRes.data as GoogleChatSpace[]);
      if (logsRes.data) setEventLogs(logsRes.data as GoogleEventLog[]);
      if (configsRes.data) setConfigs(configsRes.data as ConfigSetting[]);
    } catch (err) {
      console.error('Failed to load data:', err);
      toast({ title: 'Failed to load data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleMode() {
    const currentMode = getConfigValue('google.mode');
    const newMode = currentMode === 'LIVE' ? 'DRY_RUN' : 'LIVE';
    
    const { error } = await supabase
      .from('config_settings')
      .update({ value: JSON.stringify(newMode) })
      .eq('key', 'google.mode');

    if (error) {
      toast({ title: 'Failed to update mode', variant: 'destructive' });
    } else {
      toast({ title: `Google mode set to ${newMode}` });
      loadData();
    }
  }

  async function addChatSpace() {
    if (!newSpace.name || !newSpace.purpose || !newSpace.webhookUrl) {
      toast({ title: 'Please fill all fields', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('google_chat_spaces').insert({
      space_name: newSpace.name,
      space_purpose: newSpace.purpose,
      target_team: newSpace.team,
      webhook_url_encrypted: btoa(newSpace.webhookUrl),
      is_active: true,
    });

    if (error) {
      toast({ title: 'Failed to add space', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Chat space added' });
      setAddSpaceDialogOpen(false);
      setNewSpace({ name: '', purpose: '', team: 'sales', webhookUrl: '' });
      loadData();
    }
  }

  async function toggleSpaceActive(id: string, currentActive: boolean) {
    const { error } = await supabase
      .from('google_chat_spaces')
      .update({ is_active: !currentActive })
      .eq('id', id);

    if (error) {
      toast({ title: 'Failed to update space', variant: 'destructive' });
    } else {
      loadData();
    }
  }

  async function deleteSpace(id: string) {
    const { error } = await supabase.from('google_chat_spaces').delete().eq('id', id);
    if (error) {
      toast({ title: 'Failed to delete space', variant: 'destructive' });
    } else {
      toast({ title: 'Space deleted' });
      loadData();
    }
  }

  function getConfigValue(key: string): string {
    const config = configs.find(c => c.key === key);
    if (!config) return '';
    try {
      return JSON.parse(config.value);
    } catch {
      return config.value;
    }
  }

  const mode = getConfigValue('google.mode') || 'DRY_RUN';
  const stats = {
    totalConnections: connections.length,
    activeConnections: connections.filter(c => c.status === 'CONNECTED').length,
    totalEvents: eventLogs.length,
    successEvents: eventLogs.filter(e => e.status === 'SUCCESS').length,
    dryRunEvents: eventLogs.filter(e => e.status === 'DRY_RUN').length,
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Google Workspace Settings</h1>
          <p className="text-muted-foreground">Manage Gmail, Meet, Drive, Chat integration</p>
        </div>
        <div className="flex items-center gap-4">
          <Badge variant={mode === 'LIVE' ? 'default' : 'secondary'} className="text-sm px-3 py-1">
            Mode: {mode}
          </Badge>
          <Button onClick={toggleMode} variant="outline">
            Switch to {mode === 'LIVE' ? 'DRY_RUN' : 'LIVE'}
          </Button>
          <Button onClick={loadData} variant="ghost" size="icon">
            <RefreshCw className="w-4 h-4" />
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.activeConnections}</div>
            <p className="text-sm text-muted-foreground">Connected Users</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-green-600">{stats.successEvents}</div>
            <p className="text-sm text-muted-foreground">Successful Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold text-blue-600">{stats.dryRunEvents}</div>
            <p className="text-sm text-muted-foreground">DRY_RUN Actions</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{chatSpaces.length}</div>
            <p className="text-sm text-muted-foreground">Chat Spaces</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="text-2xl font-bold">{stats.totalEvents}</div>
            <p className="text-sm text-muted-foreground">Total Events</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="connections" className="space-y-4">
        <TabsList>
          <TabsTrigger value="connections">
            <Users className="w-4 h-4 mr-2" />
            Connections
          </TabsTrigger>
          <TabsTrigger value="chat-spaces">
            <MessageSquare className="w-4 h-4 mr-2" />
            Chat Spaces
          </TabsTrigger>
          <TabsTrigger value="logs">
            <Activity className="w-4 h-4 mr-2" />
            Event Logs
          </TabsTrigger>
          <TabsTrigger value="config">
            <Settings className="w-4 h-4 mr-2" />
            Configuration
          </TabsTrigger>
        </TabsList>

        {/* Connections Tab */}
        <TabsContent value="connections">
          <Card>
            <CardHeader>
              <CardTitle>User Connections</CardTitle>
              <CardDescription>Staff members with connected Google accounts</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Google Email</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Connected</TableHead>
                    <TableHead>Last Used</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {connections.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="text-center text-muted-foreground py-8">
                        No connections yet
                      </TableCell>
                    </TableRow>
                  ) : (
                    connections.map((conn) => (
                      <TableRow key={conn.id}>
                        <TableCell className="font-medium">{conn.google_email}</TableCell>
                        <TableCell>
                          <Badge variant={conn.status === 'CONNECTED' ? 'default' : 'secondary'}>
                            {conn.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {format(new Date(conn.created_at), 'MMM d, yyyy')}
                        </TableCell>
                        <TableCell className="text-sm text-muted-foreground">
                          {conn.last_used_at 
                            ? format(new Date(conn.last_used_at), 'MMM d, h:mm a')
                            : '—'}
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Chat Spaces Tab */}
        <TabsContent value="chat-spaces">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <div>
                <CardTitle>Google Chat Spaces</CardTitle>
                <CardDescription>Configure webhook URLs for team chat spaces</CardDescription>
              </div>
              <Button onClick={() => setAddSpaceDialogOpen(true)}>
                <Plus className="w-4 h-4 mr-2" />
                Add Space
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Space Name</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Target Team</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {chatSpaces.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                        No chat spaces configured
                      </TableCell>
                    </TableRow>
                  ) : (
                    chatSpaces.map((space) => (
                      <TableRow key={space.id}>
                        <TableCell className="font-medium">{space.space_name}</TableCell>
                        <TableCell>{space.space_purpose}</TableCell>
                        <TableCell>
                          <Badge variant="outline">{space.target_team}</Badge>
                        </TableCell>
                        <TableCell>
                          <Switch
                            checked={space.is_active}
                            onCheckedChange={() => toggleSpaceActive(space.id, space.is_active)}
                          />
                        </TableCell>
                        <TableCell className="text-right">
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => deleteSpace(space.id)}
                          >
                            <Trash2 className="w-4 h-4 text-destructive" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Logs Tab */}
        <TabsContent value="logs">
          <Card>
            <CardHeader>
              <CardTitle>Event Logs</CardTitle>
              <CardDescription>Recent Google integration actions</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="max-h-96 overflow-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Time</TableHead>
                      <TableHead>Action</TableHead>
                      <TableHead>Entity</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Error</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {eventLogs.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                          No events logged
                        </TableCell>
                      </TableRow>
                    ) : (
                      eventLogs.map((log) => (
                        <TableRow key={log.id}>
                          <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                            {format(new Date(log.created_at), 'MMM d, h:mm:ss a')}
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline">{log.action_type}</Badge>
                          </TableCell>
                          <TableCell className="text-sm">
                            {log.entity_type && log.entity_id
                              ? `${log.entity_type}/${log.entity_id.substring(0, 8)}`
                              : '—'}
                          </TableCell>
                          <TableCell>
                            <Badge 
                              variant={
                                log.status === 'SUCCESS' ? 'default' :
                                log.status === 'FAILED' ? 'destructive' :
                                'secondary'
                              }
                            >
                              {log.status}
                            </Badge>
                          </TableCell>
                          <TableCell className="text-sm text-destructive max-w-xs truncate">
                            {log.error_message || '—'}
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

        {/* Config Tab */}
        <TabsContent value="config">
          <Card>
            <CardHeader>
              <CardTitle>Configuration</CardTitle>
              <CardDescription>Google integration settings</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Setting</TableHead>
                    <TableHead>Value</TableHead>
                    <TableHead>Description</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {configs.map((config) => (
                    <TableRow key={config.key}>
                      <TableCell className="font-mono text-sm">{config.key}</TableCell>
                      <TableCell>
                        <code className="bg-muted px-2 py-1 rounded text-sm">
                          {config.value}
                        </code>
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {config.description || '—'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Add Space Dialog */}
      <Dialog open={addSpaceDialogOpen} onOpenChange={setAddSpaceDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add Chat Space</DialogTitle>
            <DialogDescription>
              Configure a Google Chat space webhook for team notifications
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="space-name">Space Name</Label>
              <Input
                id="space-name"
                placeholder="sales-alerts"
                value={newSpace.name}
                onChange={(e) => setNewSpace({ ...newSpace, name: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="space-purpose">Purpose</Label>
              <Input
                id="space-purpose"
                placeholder="Sales team alerts and updates"
                value={newSpace.purpose}
                onChange={(e) => setNewSpace({ ...newSpace, purpose: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="target-team">Target Team</Label>
              <select
                id="target-team"
                value={newSpace.team}
                onChange={(e) => setNewSpace({ ...newSpace, team: e.target.value })}
                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
              >
                <option value="sales">Sales</option>
                <option value="cs">Customer Service</option>
                <option value="dispatch">Dispatch</option>
                <option value="billing">Billing</option>
                <option value="admin">Admin</option>
              </select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="webhook-url">Webhook URL</Label>
              <Input
                id="webhook-url"
                type="password"
                placeholder="https://chat.googleapis.com/v1/spaces/..."
                value={newSpace.webhookUrl}
                onChange={(e) => setNewSpace({ ...newSpace, webhookUrl: e.target.value })}
              />
              <p className="text-xs text-muted-foreground">
                Get this from Google Chat space settings → Manage webhooks
              </p>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setAddSpaceDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={addChatSpace}>Add Space</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
