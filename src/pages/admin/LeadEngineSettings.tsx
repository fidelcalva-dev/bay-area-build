import { useState, useEffect } from 'react';
import { 
  Settings, Save, RefreshCw, Loader2, 
  Zap, Shield, Mail, MessageSquare, Clock
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface LeadSource {
  id: string;
  source_key: string;
  display_name: string;
  description: string | null;
  is_active: boolean;
  is_automated: boolean;
}

interface ConfigSetting {
  key: string;
  value: string;
  description: string | null;
}

export default function LeadEngineSettings() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [sources, setSources] = useState<LeadSource[]>([]);
  const [configs, setConfigs] = useState<Record<string, string>>({});

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    try {
      const [sourcesRes, configsRes] = await Promise.all([
        supabase.from('lead_sources').select('*').order('display_name'),
        supabase.from('config_settings').select('key, value, description').eq('category', 'leads'),
      ]);

      if (sourcesRes.data) {
        setSources(sourcesRes.data);
      }

      if (configsRes.data) {
        const configMap: Record<string, string> = {};
        configsRes.data.forEach((c) => {
          try {
            const val = typeof c.value === 'string' ? JSON.parse(c.value) : c.value;
            configMap[c.key] = String(val);
          } catch {
            configMap[c.key] = String(c.value);
          }
        });
        setConfigs(configMap);
      }
    } catch (err) {
      console.error('Error fetching data:', err);
      toast({ title: 'Error loading settings', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function toggleSource(sourceKey: string, isActive: boolean) {
    try {
      const { error } = await supabase
        .from('lead_sources')
        .update({ is_active: isActive })
        .eq('source_key', sourceKey);

      if (error) throw error;

      setSources(sources.map(s => 
        s.source_key === sourceKey ? { ...s, is_active: isActive } : s
      ));
      toast({ title: `Source ${isActive ? 'enabled' : 'disabled'}` });
    } catch (err) {
      console.error('Error toggling source:', err);
      toast({ title: 'Error updating source', variant: 'destructive' });
    }
  }

  async function updateConfig(key: string, value: string | number | boolean) {
    setIsSaving(true);
    try {
      const { error } = await supabase
        .from('config_settings')
        .update({ value: JSON.stringify(value), updated_at: new Date().toISOString() })
        .eq('key', key);

      if (error) throw error;

      setConfigs({ ...configs, [key]: value as string });
      toast({ title: 'Setting updated' });
    } catch (err) {
      console.error('Error updating config:', err);
      toast({ title: 'Error updating setting', variant: 'destructive' });
    } finally {
      setIsSaving(false);
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Lead Engine Settings</h1>
          <p className="text-muted-foreground">Configure lead capture, AI, and routing</p>
        </div>
        <Button variant="outline" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {/* AI Mode Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="w-5 h-5" /> AI Mode
          </CardTitle>
          <CardDescription>Control AI-powered lead processing</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">AI Processing Mode</Label>
              <p className="text-sm text-muted-foreground">
                OFF = No AI | DRY_RUN = Log only | LIVE = Full automation
              </p>
            </div>
            <Select 
              value={configs.ai_mode || 'DRY_RUN'} 
              onValueChange={(v) => updateConfig('ai_mode', v)}
            >
              <SelectTrigger className="w-40">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="OFF">OFF</SelectItem>
                <SelectItem value="DRY_RUN">DRY_RUN</SelectItem>
                <SelectItem value="LIVE">LIVE</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Auto First Response</Label>
              <p className="text-sm text-muted-foreground">
                Automatically send first response message to new leads
              </p>
            </div>
            <Switch
              checked={configs.auto_first_response_enabled === 'true'}
              onCheckedChange={(v) => updateConfig('auto_first_response_enabled', v)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Deduplication & Compliance */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5" /> Compliance & Deduplication
          </CardTitle>
          <CardDescription>Anti-spam and consent settings</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Dedup Window (Hours)</Label>
              <p className="text-sm text-muted-foreground">
                How long to check for duplicate leads by phone/email
              </p>
            </div>
            <Input
              type="number"
              className="w-24"
              value={configs.dedup_window_hours || 24}
              onChange={(e) => updateConfig('dedup_window_hours', parseInt(e.target.value) || 24)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Require Consent for SMS</Label>
              <p className="text-sm text-muted-foreground">
                Only send SMS if consent status is OPTED_IN
              </p>
            </div>
            <Switch
              checked={configs.consent_required_for_sms !== 'false'}
              onCheckedChange={(v) => updateConfig('consent_required_for_sms', v)}
            />
          </div>

          <div className="flex items-center justify-between">
            <div>
              <Label className="text-base">Max Daily Outbound per Lead</Label>
              <p className="text-sm text-muted-foreground">
                Maximum messages to send per lead per day
              </p>
            </div>
            <Input
              type="number"
              className="w-24"
              value={configs.max_daily_outbound_per_lead || 3}
              onChange={(e) => updateConfig('max_daily_outbound_per_lead', parseInt(e.target.value) || 3)}
            />
          </div>
        </CardContent>
      </Card>

      {/* Lead Sources */}
      <Card>
        <CardHeader>
          <CardTitle>Lead Sources</CardTitle>
          <CardDescription>Enable or disable lead capture channels</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Source</TableHead>
                <TableHead>Description</TableHead>
                <TableHead>Type</TableHead>
                <TableHead className="text-right">Enabled</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sources.map((source) => (
                <TableRow key={source.source_key}>
                  <TableCell className="font-medium">{source.display_name}</TableCell>
                  <TableCell className="text-sm text-muted-foreground">
                    {source.description || '—'}
                  </TableCell>
                  <TableCell>
                    <Badge variant={source.is_automated ? 'default' : 'secondary'}>
                      {source.is_automated ? 'Automated' : 'Manual'}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <Switch
                      checked={source.is_active}
                      onCheckedChange={(v) => toggleSource(source.source_key, v)}
                    />
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Status Banner */}
      <Card className={configs.ai_mode === 'LIVE' ? 'border-green-500 bg-green-50' : 'border-yellow-500 bg-yellow-50'}>
        <CardContent className="pt-6">
          <div className="flex items-center gap-3">
            {configs.ai_mode === 'LIVE' ? (
              <Zap className="w-6 h-6 text-green-600" />
            ) : (
              <Clock className="w-6 h-6 text-yellow-600" />
            )}
            <div>
              <p className="font-medium">
                {configs.ai_mode === 'LIVE' 
                  ? 'Lead Engine is LIVE' 
                  : configs.ai_mode === 'OFF'
                    ? 'Lead Engine is OFF'
                    : 'Lead Engine is in DRY_RUN mode'}
              </p>
              <p className="text-sm text-muted-foreground">
                {configs.ai_mode === 'LIVE' 
                  ? 'AI is actively processing and responding to leads'
                  : configs.ai_mode === 'OFF'
                    ? 'No AI processing is occurring'
                    : 'AI actions are being logged but not executed'}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
