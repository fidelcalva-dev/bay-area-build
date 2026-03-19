import { useEffect, useState } from 'react';
import { Settings, Save, Loader2, Lock, Unlock, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

interface ConfigSetting {
  id: string;
  category: string;
  key: string;
  value: any;
  description: string | null;
  is_locked: boolean;
}

export default function ConfigManager() {
  const [settings, setSettings] = useState<ConfigSetting[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editedValues, setEditedValues] = useState<Record<string, any>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const { toast } = useToast();

  useEffect(() => {
    fetchSettings();
  }, []);

  async function fetchSettings() {
    const { data, error } = await supabase
      .from('config_settings')
      .select('*')
      .order('category')
      .order('key');

    if (error) {
      toast({ title: 'Error loading settings', description: error.message, variant: 'destructive' });
    } else {
      setSettings(data || []);
      // Initialize edited values
      const values: Record<string, any> = {};
      data?.forEach((s) => {
        values[s.id] = s.value;
      });
      setEditedValues(values);
    }
    setIsLoading(false);
  }

  async function handleSave(setting: ConfigSetting) {
    setSaving(setting.id);
    
    const { error } = await supabase
      .from('config_settings')
      .update({ value: editedValues[setting.id] })
      .eq('id', setting.id);

    if (error) {
      toast({ title: 'Error saving setting', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Setting saved' });
      fetchSettings();
    }
    setSaving(null);
  }

  function handleValueChange(id: string, value: string) {
    try {
      // Try to parse as JSON if it looks like JSON
      const parsed = value.startsWith('[') || value.startsWith('{') ? JSON.parse(value) : value;
      setEditedValues({ ...editedValues, [id]: parsed });
    } catch {
      // Keep as string if not valid JSON
      setEditedValues({ ...editedValues, [id]: value });
    }
  }

  function formatValue(value: any): string {
    if (typeof value === 'object') {
      return JSON.stringify(value, null, 2);
    }
    return String(value);
  }

  // Group settings by category
  const categories = settings.reduce((acc, setting) => {
    if (!acc[setting.category]) acc[setting.category] = [];
    acc[setting.category].push(setting);
    return acc;
  }, {} as Record<string, ConfigSetting[]>);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Business Configuration</h1>
          <p className="text-muted-foreground mt-1">
            Raw key-value settings from the database. For module navigation and visual config, use{' '}
            <a href="/admin/configuration" className="text-primary underline underline-offset-2 hover:text-primary/80">Configuration Center</a>.
          </p>
        </div>
        <Button variant="outline" onClick={fetchSettings}>
          <RefreshCw className="w-4 h-4 mr-2" />
          Refresh
        </Button>
      </div>

      <Tabs defaultValue={Object.keys(categories)[0] || 'pricing'} className="space-y-6">
        <TabsList>
          {Object.keys(categories).map((cat) => (
            <TabsTrigger key={cat} value={cat} className="capitalize">
              {cat}
            </TabsTrigger>
          ))}
        </TabsList>

        {Object.entries(categories).map(([category, catSettings]) => (
          <TabsContent key={category} value={category} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              {catSettings.map((setting) => (
                <Card key={setting.id} className={setting.is_locked ? 'opacity-75' : ''}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <Settings className="w-4 h-4 text-primary" />
                        {setting.key.replace(/_/g, ' ')}
                      </CardTitle>
                      {setting.is_locked ? (
                        <Lock className="w-4 h-4 text-muted-foreground" />
                      ) : (
                        <Unlock className="w-4 h-4 text-muted-foreground" />
                      )}
                    </div>
                    {setting.description && (
                      <CardDescription>{setting.description}</CardDescription>
                    )}
                  </CardHeader>
                  <CardContent>
                    {setting.is_locked ? (
                      <div className="p-3 bg-muted rounded-lg text-sm font-mono">
                        {formatValue(setting.value)}
                      </div>
                    ) : (
                      <div className="space-y-3">
                        {typeof setting.value === 'object' ? (
                          <Textarea
                            value={formatValue(editedValues[setting.id])}
                            onChange={(e) => handleValueChange(setting.id, e.target.value)}
                            className="font-mono text-sm"
                            rows={4}
                          />
                        ) : (
                          <Input
                            value={editedValues[setting.id]}
                            onChange={(e) => handleValueChange(setting.id, e.target.value)}
                          />
                        )}
                        <Button
                          size="sm"
                          onClick={() => handleSave(setting)}
                          disabled={saving === setting.id}
                        >
                          {saving === setting.id ? (
                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          ) : (
                            <Save className="w-4 h-4 mr-2" />
                          )}
                          Save
                        </Button>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>
        ))}
      </Tabs>

      {settings.length === 0 && (
        <div className="text-center py-12 text-muted-foreground">
          No configuration settings found. Default values are stored in code.
        </div>
      )}
    </div>
  );
}
