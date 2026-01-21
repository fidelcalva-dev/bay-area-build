import { useEffect, useState } from 'react';
import { Loader2, Plus, Edit2, Trash2, Save, AlertTriangle, MapPin } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
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
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { createAuditLog } from '@/lib/auditLog';

interface DistanceCap {
  id: string;
  bracket_name: string;
  min_miles: number;
  max_miles: number | null;
  action: string;
  surcharge_amount: number;
  message: string | null;
  is_active: boolean;
}

interface ZipWarning {
  id: string;
  zip_code: string;
  warning_type: string;
  warning_message: string;
  max_distance_miles: number | null;
  requires_approval: boolean;
  is_active: boolean;
}

export default function WarningsCapsManager() {
  const [caps, setCaps] = useState<DistanceCap[]>([]);
  const [warnings, setWarnings] = useState<ZipWarning[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [capDialogOpen, setCapDialogOpen] = useState(false);
  const [warningDialogOpen, setWarningDialogOpen] = useState(false);
  const [editingCap, setEditingCap] = useState<DistanceCap | null>(null);
  const [editingWarning, setEditingWarning] = useState<ZipWarning | null>(null);
  const [capForm, setCapForm] = useState({
    bracket_name: '',
    min_miles: 0,
    max_miles: '',
    action: 'allow',
    surcharge_amount: 0,
    message: '',
  });
  const [warningForm, setWarningForm] = useState({
    zip_code: '',
    warning_type: 'distance_cap',
    warning_message: '',
    max_distance_miles: '',
    requires_approval: false,
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    const [capsRes, warningsRes] = await Promise.all([
      supabase.from('distance_caps').select('*').order('min_miles'),
      supabase.from('zip_warnings').select('*').order('zip_code'),
    ]);

    if (capsRes.data) setCaps(capsRes.data);
    if (warningsRes.data) setWarnings(warningsRes.data);
    setIsLoading(false);
  }

  function openAddCap() {
    setEditingCap(null);
    setCapForm({
      bracket_name: '',
      min_miles: 0,
      max_miles: '',
      action: 'allow',
      surcharge_amount: 0,
      message: '',
    });
    setCapDialogOpen(true);
  }

  function openEditCap(cap: DistanceCap) {
    setEditingCap(cap);
    setCapForm({
      bracket_name: cap.bracket_name,
      min_miles: cap.min_miles,
      max_miles: cap.max_miles?.toString() || '',
      action: cap.action,
      surcharge_amount: cap.surcharge_amount,
      message: cap.message || '',
    });
    setCapDialogOpen(true);
  }

  async function handleSaveCap() {
    if (!capForm.bracket_name) {
      toast({ title: 'Error', description: 'Bracket name is required', variant: 'destructive' });
      return;
    }

    const payload = {
      bracket_name: capForm.bracket_name,
      min_miles: capForm.min_miles,
      max_miles: capForm.max_miles ? parseFloat(capForm.max_miles) : null,
      action: capForm.action,
      surcharge_amount: capForm.surcharge_amount,
      message: capForm.message || null,
    };

    if (editingCap) {
      const { error } = await supabase
        .from('distance_caps')
        .update(payload)
        .eq('id', editingCap.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        await createAuditLog({
          action: 'config_edit',
          entityType: 'config_settings',
          entityId: editingCap.id,
          changesSummary: `Updated distance cap: ${capForm.bracket_name}`,
        });
        toast({ title: 'Distance cap updated' });
        setCapDialogOpen(false);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('distance_caps').insert([payload]);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Distance cap created' });
        setCapDialogOpen(false);
        fetchData();
      }
    }
  }

  async function handleDeleteCap(id: string) {
    if (!confirm('Delete this distance cap?')) return;

    const { error } = await supabase.from('distance_caps').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Distance cap deleted' });
      fetchData();
    }
  }

  function openAddWarning() {
    setEditingWarning(null);
    setWarningForm({
      zip_code: '',
      warning_type: 'distance_cap',
      warning_message: '',
      max_distance_miles: '',
      requires_approval: false,
    });
    setWarningDialogOpen(true);
  }

  function openEditWarning(warning: ZipWarning) {
    setEditingWarning(warning);
    setWarningForm({
      zip_code: warning.zip_code,
      warning_type: warning.warning_type,
      warning_message: warning.warning_message,
      max_distance_miles: warning.max_distance_miles?.toString() || '',
      requires_approval: warning.requires_approval,
    });
    setWarningDialogOpen(true);
  }

  async function handleSaveWarning() {
    if (!warningForm.zip_code || !warningForm.warning_message) {
      toast({ title: 'Error', description: 'ZIP and message are required', variant: 'destructive' });
      return;
    }

    const payload = {
      zip_code: warningForm.zip_code,
      warning_type: warningForm.warning_type,
      warning_message: warningForm.warning_message,
      max_distance_miles: warningForm.max_distance_miles
        ? parseFloat(warningForm.max_distance_miles)
        : null,
      requires_approval: warningForm.requires_approval,
    };

    if (editingWarning) {
      const { error } = await supabase
        .from('zip_warnings')
        .update(payload)
        .eq('id', editingWarning.id);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'ZIP warning updated' });
        setWarningDialogOpen(false);
        fetchData();
      }
    } else {
      const { error } = await supabase.from('zip_warnings').insert([payload]);

      if (error) {
        toast({ title: 'Error', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'ZIP warning created' });
        setWarningDialogOpen(false);
        fetchData();
      }
    }
  }

  async function handleDeleteWarning(id: string) {
    if (!confirm('Delete this warning?')) return;

    const { error } = await supabase.from('zip_warnings').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Warning deleted' });
      fetchData();
    }
  }

  const ACTION_COLORS: Record<string, string> = {
    allow: 'bg-green-100 text-green-800',
    manual_review: 'bg-yellow-100 text-yellow-800',
    reject: 'bg-red-100 text-red-800',
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Warnings & Distance Caps</h1>
        <p className="text-muted-foreground mt-1">
          Configure service boundaries and ZIP-specific warnings
        </p>
      </div>

      {/* Distance Caps */}
      <div className="mb-10">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Distance Caps</h2>
          <Button onClick={openAddCap}>
            <Plus className="w-4 h-4 mr-2" />
            Add Cap
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Bracket</TableHead>
                <TableHead>Distance Range</TableHead>
                <TableHead>Action</TableHead>
                <TableHead>Surcharge</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {caps.map((cap) => (
                <TableRow key={cap.id}>
                  <TableCell>
                    <span className="font-medium">{cap.bracket_name}</span>
                    {cap.message && (
                      <p className="text-xs text-muted-foreground">{cap.message}</p>
                    )}
                  </TableCell>
                  <TableCell>
                    {cap.min_miles} - {cap.max_miles || '∞'} miles
                  </TableCell>
                  <TableCell>
                    <Badge className={ACTION_COLORS[cap.action] || 'bg-gray-100'}>
                      {cap.action.replace('_', ' ')}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {cap.surcharge_amount > 0 ? `+$${cap.surcharge_amount}` : '-'}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEditCap(cap)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteCap(cap.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* ZIP Warnings */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">ZIP-Specific Warnings</h2>
          <Button onClick={openAddWarning}>
            <Plus className="w-4 h-4 mr-2" />
            Add Warning
          </Button>
        </div>

        <div className="bg-card rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ZIP Code</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Message</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {warnings.map((warning) => (
                <TableRow key={warning.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <MapPin className="w-4 h-4 text-muted-foreground" />
                      <span className="font-mono">{warning.zip_code}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{warning.warning_type.replace('_', ' ')}</Badge>
                  </TableCell>
                  <TableCell className="max-w-[200px] truncate">
                    {warning.warning_message}
                  </TableCell>
                  <TableCell>
                    {warning.requires_approval ? (
                      <Badge className="bg-yellow-100 text-yellow-800">Required</Badge>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button size="icon" variant="ghost" onClick={() => openEditWarning(warning)}>
                        <Edit2 className="w-4 h-4" />
                      </Button>
                      <Button
                        size="icon"
                        variant="ghost"
                        className="text-destructive"
                        onClick={() => handleDeleteWarning(warning.id)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {warnings.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-8 text-muted-foreground">
                    No ZIP warnings configured
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* Distance Cap Dialog */}
      <Dialog open={capDialogOpen} onOpenChange={setCapDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingCap ? 'Edit Distance Cap' : 'New Distance Cap'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">Bracket Name</label>
              <Input
                value={capForm.bracket_name}
                onChange={(e) => setCapForm({ ...capForm, bracket_name: e.target.value })}
                placeholder="Extended Range"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Min Miles</label>
                <Input
                  type="number"
                  value={capForm.min_miles}
                  onChange={(e) =>
                    setCapForm({ ...capForm, min_miles: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
              <div>
                <label className="text-sm font-medium">Max Miles (empty = ∞)</label>
                <Input
                  type="number"
                  value={capForm.max_miles}
                  onChange={(e) => setCapForm({ ...capForm, max_miles: e.target.value })}
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Action</label>
                <Select
                  value={capForm.action}
                  onValueChange={(v) => setCapForm({ ...capForm, action: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="allow">Allow</SelectItem>
                    <SelectItem value="manual_review">Manual Review</SelectItem>
                    <SelectItem value="reject">Reject</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium">Surcharge ($)</label>
                <Input
                  type="number"
                  value={capForm.surcharge_amount}
                  onChange={(e) =>
                    setCapForm({ ...capForm, surcharge_amount: parseFloat(e.target.value) || 0 })
                  }
                />
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Message</label>
              <Textarea
                value={capForm.message}
                onChange={(e) => setCapForm({ ...capForm, message: e.target.value })}
                placeholder="Extended distance surcharge applies..."
                rows={2}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setCapDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveCap}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* ZIP Warning Dialog */}
      <Dialog open={warningDialogOpen} onOpenChange={setWarningDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingWarning ? 'Edit Warning' : 'New Warning'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div>
              <label className="text-sm font-medium">ZIP Code</label>
              <Input
                value={warningForm.zip_code}
                onChange={(e) => setWarningForm({ ...warningForm, zip_code: e.target.value })}
                placeholder="94601"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Warning Type</label>
              <Select
                value={warningForm.warning_type}
                onValueChange={(v) => setWarningForm({ ...warningForm, warning_type: v })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="distance_cap">Distance Cap</SelectItem>
                  <SelectItem value="service_unavailable">Service Unavailable</SelectItem>
                  <SelectItem value="special_approval">Special Approval</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium">Warning Message</label>
              <Textarea
                value={warningForm.warning_message}
                onChange={(e) => setWarningForm({ ...warningForm, warning_message: e.target.value })}
                placeholder="This area requires additional scheduling..."
                rows={3}
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setWarningDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSaveWarning}>
                <Save className="w-4 h-4 mr-2" />
                Save
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
