import { useState, useEffect } from 'react';
import { 
  Phone, ArrowRight, Plus, Edit2, Trash2, CheckCircle2, 
  AlertTriangle, Clock, RefreshCw, Copy, ExternalLink 
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { formatPhoneDisplay } from '@/lib/phoneUtils';
import { MigrationWizard } from '@/components/telephony/MigrationWizard';

interface TelephonyMigration {
  id: string;
  phone_number: string;
  friendly_name: string | null;
  purpose: 'SALES' | 'CS' | 'BILLING';
  current_provider: string;
  target_provider: string;
  migration_method: 'PORT' | 'FORWARD' | 'DUAL_RING';
  status: 'PLANNED' | 'IN_PROGRESS' | 'TESTING' | 'LIVE' | 'DONE' | 'ROLLED_BACK';
  ghl_routing_rules: any;
  business_hours: any;
  voicemail_enabled: boolean;
  recording_enabled: boolean;
  twilio_number_id: string | null;
  cutover_started_at: string | null;
  cutover_completed_at: string | null;
  rollback_at: string | null;
  notes: string | null;
  created_at: string;
}

const statusColors: Record<string, string> = {
  PLANNED: 'bg-gray-100 text-gray-800',
  IN_PROGRESS: 'bg-blue-100 text-blue-800',
  TESTING: 'bg-yellow-100 text-yellow-800',
  LIVE: 'bg-green-100 text-green-800',
  DONE: 'bg-emerald-100 text-emerald-800',
  ROLLED_BACK: 'bg-red-100 text-red-800',
};

const methodLabels: Record<string, { label: string; desc: string }> = {
  DUAL_RING: { label: 'Dual Ring (Safest)', desc: 'Ring both GHL and Twilio simultaneously during transition' },
  FORWARD: { label: 'Forwarding', desc: 'Forward calls from GHL to your Twilio number' },
  PORT: { label: 'Port Number', desc: 'Permanently transfer the number to Twilio' },
};

export default function TelephonyMigration() {
  const [migrations, setMigrations] = useState<TelephonyMigration[]>([]);
  const [phoneNumbers, setPhoneNumbers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingMigration, setEditingMigration] = useState<TelephonyMigration | null>(null);
  const [formData, setFormData] = useState({
    phone_number: '',
    friendly_name: '',
    purpose: 'SALES' as 'SALES' | 'CS' | 'BILLING',
    migration_method: 'DUAL_RING' as 'PORT' | 'FORWARD' | 'DUAL_RING',
    voicemail_enabled: true,
    recording_enabled: true,
    twilio_number_id: '',
    notes: '',
    business_hours: { start: '06:00', end: '21:00', timezone: 'America/Los_Angeles' },
  });
  const { toast } = useToast();

  const fetchData = async () => {
    setIsLoading(true);
    const [migrationsRes, numbersRes] = await Promise.all([
      supabase.from('telephony_migrations').select('*').order('created_at', { ascending: false }),
      supabase.from('phone_numbers').select('*').eq('is_active', true),
    ]);

    if (migrationsRes.data) setMigrations(migrationsRes.data as TelephonyMigration[]);
    if (numbersRes.data) setPhoneNumbers(numbersRes.data);
    setIsLoading(false);
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleSave = async () => {
    const payload = {
      phone_number: formData.phone_number,
      friendly_name: formData.friendly_name || null,
      purpose: formData.purpose,
      migration_method: formData.migration_method,
      voicemail_enabled: formData.voicemail_enabled,
      recording_enabled: formData.recording_enabled,
      twilio_number_id: formData.twilio_number_id || null,
      notes: formData.notes || null,
      business_hours: formData.business_hours,
    };

    let error;

    if (editingMigration) {
      const result = await supabase
        .from('telephony_migrations')
        .update(payload)
        .eq('id', editingMigration.id);
      error = result.error;
    } else {
      const result = await supabase.from('telephony_migrations').insert(payload);
      error = result.error;
    }

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Success', description: editingMigration ? 'Migration updated' : 'Migration planned' });
      setIsDialogOpen(false);
      setEditingMigration(null);
      resetForm();
      fetchData();
    }
  };

  const resetForm = () => {
    setFormData({
      phone_number: '',
      friendly_name: '',
      purpose: 'SALES',
      migration_method: 'DUAL_RING',
      voicemail_enabled: true,
      recording_enabled: true,
      twilio_number_id: '',
      notes: '',
      business_hours: { start: '06:00', end: '21:00', timezone: 'America/Los_Angeles' },
    });
  };

  const handleEdit = (migration: TelephonyMigration) => {
    setEditingMigration(migration);
    setFormData({
      phone_number: migration.phone_number,
      friendly_name: migration.friendly_name || '',
      purpose: migration.purpose,
      migration_method: migration.migration_method,
      voicemail_enabled: migration.voicemail_enabled,
      recording_enabled: migration.recording_enabled,
      twilio_number_id: migration.twilio_number_id || '',
      notes: migration.notes || '',
      business_hours: migration.business_hours || { start: '06:00', end: '21:00', timezone: 'America/Los_Angeles' },
    });
    setIsDialogOpen(true);
  };

  const handleStatusChange = async (id: string, newStatus: string) => {
    const updates: any = { status: newStatus };
    if (newStatus === 'IN_PROGRESS') updates.cutover_started_at = new Date().toISOString();
    if (newStatus === 'DONE') updates.cutover_completed_at = new Date().toISOString();
    if (newStatus === 'ROLLED_BACK') updates.rollback_at = new Date().toISOString();

    const { error } = await supabase.from('telephony_migrations').update(updates).eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Status Updated' });
      fetchData();
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm('Delete this migration entry?')) return;
    const { error } = await supabase.from('telephony_migrations').delete().eq('id', id);
    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Deleted' });
      fetchData();
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const webhookBase = `https://tvcwzohfycwfaqjyruow.supabase.co/functions/v1`;

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">GHL to Twilio Migration</h1>
          <p className="text-muted-foreground">
            Manage the transition of phone lines from GoHighLevel to native Twilio
          </p>
        </div>
        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingMigration(null); resetForm(); }}>
              <Plus className="w-4 h-4 mr-2" />
              Add Number
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-lg">
            <DialogHeader>
              <DialogTitle>{editingMigration ? 'Edit Migration' : 'Plan New Migration'}</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 mt-4 max-h-[60vh] overflow-y-auto pr-2">
              <div>
                <Label>Phone Number (from GHL)</Label>
                <Input
                  placeholder="+1 (555) 123-4567"
                  value={formData.phone_number}
                  onChange={(e) => setFormData({ ...formData, phone_number: e.target.value })}
                />
              </div>
              <div>
                <Label>Friendly Name</Label>
                <Input
                  placeholder="Main Sales Line"
                  value={formData.friendly_name}
                  onChange={(e) => setFormData({ ...formData, friendly_name: e.target.value })}
                />
              </div>
              <div>
                <Label>Purpose</Label>
                <Select value={formData.purpose} onValueChange={(v) => setFormData({ ...formData, purpose: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="SALES">Sales</SelectItem>
                    <SelectItem value="CS">Customer Service</SelectItem>
                    <SelectItem value="BILLING">Billing</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Migration Method</Label>
                <Select value={formData.migration_method} onValueChange={(v) => setFormData({ ...formData, migration_method: v as any })}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(methodLabels).map(([key, { label, desc }]) => (
                      <SelectItem key={key} value={key}>
                        <div>
                          <span className="font-medium">{label}</span>
                          <p className="text-xs text-muted-foreground">{desc}</p>
                        </div>
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label>Link to Twilio Number (optional)</Label>
                <Select value={formData.twilio_number_id} onValueChange={(v) => setFormData({ ...formData, twilio_number_id: v })}>
                  <SelectTrigger><SelectValue placeholder="Select existing Twilio number" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">None</SelectItem>
                    {phoneNumbers.map((num) => (
                      <SelectItem key={num.id} value={num.id}>
                        {formatPhoneDisplay(num.twilio_number)} - {num.purpose}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center justify-between">
                <Label>Voicemail Enabled</Label>
                <Switch
                  checked={formData.voicemail_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, voicemail_enabled: checked })}
                />
              </div>
              <div className="flex items-center justify-between">
                <Label>Recording Enabled</Label>
                <Switch
                  checked={formData.recording_enabled}
                  onCheckedChange={(checked) => setFormData({ ...formData, recording_enabled: checked })}
                />
              </div>
              <div>
                <Label>Notes</Label>
                <Textarea
                  placeholder="GHL routing rules, special instructions..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={3}
                />
              </div>
            </div>
            <DialogFooter className="mt-4">
              <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
              <Button onClick={handleSave}>{editingMigration ? 'Update' : 'Create'}</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Tabs defaultValue="wizard">
        <TabsList>
          <TabsTrigger value="wizard">Wizard</TabsTrigger>
          <TabsTrigger value="worksheet">Migration Worksheet</TabsTrigger>
          <TabsTrigger value="cutover">Cutover Instructions</TabsTrigger>
          <TabsTrigger value="webhooks">Webhook URLs</TabsTrigger>
          <TabsTrigger value="rollback">Rollback Plan</TabsTrigger>
        </TabsList>

        <TabsContent value="wizard" className="space-y-4">
          <MigrationWizard 
            webhookBaseUrl={webhookBase} 
            onComplete={() => {
              toast({ title: 'Migration Marked Complete', description: 'Remember to update status in worksheet' });
            }}
          />
        </TabsContent>

        <TabsContent value="worksheet" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Phone className="w-5 h-5" />
                Migration Worksheet
              </CardTitle>
              <CardDescription>Track all phone numbers being migrated from GHL to Twilio</CardDescription>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Number</TableHead>
                    <TableHead>Purpose</TableHead>
                    <TableHead>Method</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead>Twilio Link</TableHead>
                    <TableHead className="text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8">Loading...</TableCell>
                    </TableRow>
                  ) : migrations.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                        No migrations planned yet. Add your GHL numbers to get started.
                      </TableCell>
                    </TableRow>
                  ) : (
                    migrations.map((m) => (
                      <TableRow key={m.id}>
                        <TableCell>
                          <div>
                            <p className="font-mono">{formatPhoneDisplay(m.phone_number)}</p>
                            {m.friendly_name && <p className="text-xs text-muted-foreground">{m.friendly_name}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">{m.purpose}</Badge>
                        </TableCell>
                        <TableCell>
                          <span className="text-sm">{methodLabels[m.migration_method]?.label || m.migration_method}</span>
                        </TableCell>
                        <TableCell>
                          <Select value={m.status} onValueChange={(v) => handleStatusChange(m.id, v)}>
                            <SelectTrigger className={`w-32 ${statusColors[m.status]}`}>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="PLANNED">Planned</SelectItem>
                              <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
                              <SelectItem value="TESTING">Testing</SelectItem>
                              <SelectItem value="LIVE">Live</SelectItem>
                              <SelectItem value="DONE">Done</SelectItem>
                              <SelectItem value="ROLLED_BACK">Rolled Back</SelectItem>
                            </SelectContent>
                          </Select>
                        </TableCell>
                        <TableCell>
                          {m.twilio_number_id ? (
                            <CheckCircle2 className="w-4 h-4 text-green-600" />
                          ) : (
                            <span className="text-muted-foreground text-sm">Not linked</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right">
                          <Button variant="ghost" size="sm" onClick={() => handleEdit(m)}>
                            <Edit2 className="w-4 h-4" />
                          </Button>
                          <Button variant="ghost" size="sm" onClick={() => handleDelete(m.id)}>
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

        <TabsContent value="cutover" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Cutover Instructions</CardTitle>
              <CardDescription>Step-by-step guide for each migration method</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge>A</Badge> Dual-Ring (Recommended for Testing)
                </h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  <li>In GHL Phone Settings, find the number you want to migrate</li>
                  <li>Enable "Forward to External Number" or "Simultaneous Ring"</li>
                  <li>Enter your Twilio number as the destination</li>
                  <li>Test with a real call - both systems should ring</li>
                  <li>Verify call_event is created in our system</li>
                  <li>Run dual-ring for 48-72 hours before full cutover</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge>B</Badge> Call Forwarding
                </h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  <li>In GHL, disable direct agent routing</li>
                  <li>Set up unconditional forward to your Twilio number</li>
                  <li>Our system handles all routing, logging, and voicemail</li>
                  <li>Calls will show source = "GHL_FORWARD" in logs</li>
                </ol>
              </div>

              <div className="space-y-3">
                <h3 className="font-semibold flex items-center gap-2">
                  <Badge>C</Badge> Number Porting (Final State)
                </h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm">
                  <li>Contact GHL/LC Phone support to request LOA (Letter of Authorization)</li>
                  <li>Submit port request in Twilio Console</li>
                  <li>Typical port window: 7-14 business days</li>
                  <li>Once ported, update Twilio webhook URLs to our edge functions</li>
                  <li>Link the ported number in Phone Numbers Manager</li>
                </ol>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="webhooks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Twilio Webhook URLs</CardTitle>
              <CardDescription>Configure these URLs in your Twilio Console for each phone number</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-muted p-4 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Voice Webhook (A call comes in)</p>
                    <code className="text-xs text-muted-foreground break-all">{webhookBase}/calls-inbound-handler</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${webhookBase}/calls-inbound-handler`)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Status Callback URL</p>
                    <code className="text-xs text-muted-foreground break-all">{webhookBase}/calls-status-callback</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${webhookBase}/calls-status-callback`)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">Voicemail Handler</p>
                    <code className="text-xs text-muted-foreground break-all">{webhookBase}/calls-voicemail-handler</code>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => copyToClipboard(`${webhookBase}/calls-voicemail-handler`)}>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg">
                <div className="flex gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
                  <div className="text-sm">
                    <p className="font-medium text-yellow-800">Important</p>
                    <p className="text-yellow-700">Ensure TWILIO_ACCOUNT_SID and TWILIO_AUTH_TOKEN secrets are configured in your backend.</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="rollback" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <RefreshCw className="w-5 h-5" />
                Rollback Plan
              </CardTitle>
              <CardDescription>Steps to revert if issues occur during migration</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="bg-red-50 border border-red-200 p-4 rounded-lg space-y-3">
                <h3 className="font-semibold text-red-800">Emergency Rollback Steps</h3>
                <ol className="list-decimal pl-6 space-y-2 text-sm text-red-700">
                  <li>In GHL Phone Settings, disable forwarding to Twilio</li>
                  <li>Re-enable direct GHL agent routing</li>
                  <li>
                    Set telephony mode to DRY_RUN:
                    <code className="block bg-white px-2 py-1 rounded mt-1">
                      UPDATE config_settings SET value = '"DRY_RUN"' WHERE category = 'telephony' AND key = 'mode';
                    </code>
                  </li>
                  <li>Mark migration status as "ROLLED_BACK" in worksheet</li>
                  <li>Review call_events logs for diagnostics</li>
                </ol>
              </div>

              <div className="bg-muted p-4 rounded-lg">
                <h3 className="font-medium mb-2">Data Safety</h3>
                <ul className="list-disc pl-4 space-y-1 text-sm text-muted-foreground">
                  <li>All call events are preserved in database regardless of rollback</li>
                  <li>Recordings in private storage are not affected</li>
                  <li>Agent availability status is maintained</li>
                  <li>Voicemails and tasks remain intact</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
