// Admin: Customer Type Detection Rules Manager
// Configure scoring rules for auto-detecting customer type

import { useState, useEffect } from 'react';
import { Plus, Edit2, Trash2, ToggleLeft, ToggleRight, GripVertical, Zap } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Skeleton } from '@/components/ui/skeleton';
import { Textarea } from '@/components/ui/textarea';
import { toast } from 'sonner';

interface CustomerTypeRule {
  id: string;
  rule_code: string;
  rule_name: string;
  description: string | null;
  signal_type: string;
  conditions_json: unknown;
  output_customer_type: string;
  weight: number;
  is_active: boolean;
  display_order: number;
}

const SIGNAL_TYPES = [
  { value: 'email_domain', label: 'Email Domain' },
  { value: 'company_name', label: 'Company Name' },
  { value: 'quantity', label: 'Quantity' },
  { value: 'recurring', label: 'Recurring Service' },
  { value: 'urgency', label: 'Urgency Signals' },
  { value: 'keywords', label: 'Keywords' },
  { value: 'explicit', label: 'Explicit Selection' },
  { value: 'project_type', label: 'Project Type' },
];

const CUSTOMER_TYPES = [
  { value: 'homeowner', label: 'Homeowner' },
  { value: 'contractor', label: 'Contractor' },
  { value: 'business', label: 'Business' },
  { value: 'preferred_contractor', label: 'Preferred Contractor' },
  { value: 'wholesaler', label: 'Wholesaler' },
];

export default function CustomerTypeRulesPage() {
  const [rules, setRules] = useState<CustomerTypeRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [editingRule, setEditingRule] = useState<CustomerTypeRule | null>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Fetch rules
  useEffect(() => {
    async function fetchRules() {
      try {
        const { data, error } = await supabase
          .from('customer_type_rules')
          .select('*')
          .order('display_order', { ascending: true });

        if (error) throw error;
        // Cast the data to our interface
        const typedRules = (data || []).map(r => ({
          ...r,
          conditions_json: r.conditions_json as unknown,
        })) as CustomerTypeRule[];
        setRules(typedRules);
      } catch (err) {
        console.error('Failed to fetch rules:', err);
        toast.error('Failed to load rules');
      } finally {
        setIsLoading(false);
      }
    }

    fetchRules();
  }, []);

  // Handle new rule
  function handleNew() {
    setEditingRule({
      id: '',
      rule_code: '',
      rule_name: '',
      description: '',
      signal_type: 'keywords',
      conditions_json: { patterns: [] },
      output_customer_type: 'homeowner',
      weight: 20,
      is_active: true,
      display_order: rules.length + 1,
    });
    setIsDialogOpen(true);
  }

  // Handle edit
  function handleEdit(rule: CustomerTypeRule) {
    setEditingRule({ ...rule });
    setIsDialogOpen(true);
  }

  // Handle save
  async function handleSave() {
    if (!editingRule) return;

    if (!editingRule.rule_code || !editingRule.rule_name) {
      toast.error('Rule code and name are required');
      return;
    }

    setIsSaving(true);
    try {
      const payload = {
        rule_code: editingRule.rule_code,
        rule_name: editingRule.rule_name,
        description: editingRule.description,
        signal_type: editingRule.signal_type,
        conditions_json: editingRule.conditions_json as Record<string, unknown>,
        output_customer_type: editingRule.output_customer_type,
        weight: editingRule.weight,
        is_active: editingRule.is_active,
        display_order: editingRule.display_order,
      };

      if (editingRule.id) {
        const { error } = await supabase
          .from('customer_type_rules')
          .update(payload as never)
          .eq('id', editingRule.id);
        if (error) throw error;
        
        setRules(prev => prev.map(r => r.id === editingRule.id ? { ...r, ...payload } : r));
        toast.success('Rule updated');
      } else {
        const { data, error } = await supabase
          .from('customer_type_rules')
          .insert(payload as never)
          .select()
          .single();
        if (error) throw error;
        
        const newRule = { ...data, conditions_json: data.conditions_json as unknown } as CustomerTypeRule;
        setRules(prev => [...prev, newRule]);
        toast.success('Rule created');
      }

      setIsDialogOpen(false);
      setEditingRule(null);
    } catch (err: unknown) {
      console.error('Save error:', err);
      const message = err instanceof Error ? err.message : 'Failed to save rule';
      toast.error(message);
    } finally {
      setIsSaving(false);
    }
  }

  // Handle delete
  async function handleDelete(rule: CustomerTypeRule) {
    if (!confirm('Delete this detection rule?')) return;

    try {
      const { error } = await supabase
        .from('customer_type_rules')
        .delete()
        .eq('id', rule.id);
      if (error) throw error;

      setRules(prev => prev.filter(r => r.id !== rule.id));
      toast.success('Rule deleted');
    } catch (err) {
      toast.error('Failed to delete rule');
    }
  }

  // Toggle active
  async function toggleActive(rule: CustomerTypeRule) {
    try {
      const { error } = await supabase
        .from('customer_type_rules')
        .update({ is_active: !rule.is_active })
        .eq('id', rule.id);
      if (error) throw error;

      setRules(prev => prev.map(r =>
        r.id === rule.id ? { ...r, is_active: !r.is_active } : r
      ));
    } catch (err) {
      toast.error('Failed to update');
    }
  }

  if (isLoading) {
    return (
      <div className="p-8 space-y-4">
        <Skeleton className="h-10 w-64" />
        <div className="space-y-3">
          {[1, 2, 3, 4].map(i => <Skeleton key={i} className="h-20" />)}
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Customer Type Detection Rules</h1>
          <p className="text-muted-foreground">Configure auto-detection scoring for the Quick Quote</p>
        </div>
        <Button onClick={handleNew}>
          <Plus className="w-4 h-4 mr-2" />
          Add Rule
        </Button>
      </div>

      {/* Rules list */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">Detection Rules</CardTitle>
          <CardDescription>
            Rules are evaluated in order. Higher weights have more influence on the final detection.
          </CardDescription>
        </CardHeader>
        <CardContent>
          {rules.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No detection rules configured.
            </div>
          ) : (
            <div className="divide-y">
              {rules.map((rule) => (
                <div
                  key={rule.id}
                  className={`py-3 flex items-center justify-between gap-4 ${!rule.is_active ? 'opacity-50' : ''}`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab shrink-0" />
                    <Zap className={`w-4 h-4 shrink-0 ${rule.is_active ? 'text-amber-500' : 'text-muted-foreground'}`} />
                    <div className="min-w-0">
                      <div className="font-medium truncate flex items-center gap-2">
                        {rule.rule_name}
                        <Badge variant="outline" className="text-xs">
                          {SIGNAL_TYPES.find(s => s.value === rule.signal_type)?.label || rule.signal_type}
                        </Badge>
                        <Badge variant="secondary" className="text-xs">
                          → {CUSTOMER_TYPES.find(c => c.value === rule.output_customer_type)?.label}
                        </Badge>
                      </div>
                      <div className="text-xs text-muted-foreground">
                        Weight: {rule.weight} points • Code: {rule.rule_code}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => toggleActive(rule)}
                      title={rule.is_active ? 'Disable' : 'Enable'}
                    >
                      {rule.is_active ? (
                        <ToggleRight className="w-4 h-4 text-green-600" />
                      ) : (
                        <ToggleLeft className="w-4 h-4 text-muted-foreground" />
                      )}
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleEdit(rule)}
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDelete(rule)}
                      className="text-destructive hover:text-destructive"
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingRule?.id ? 'Edit Detection Rule' : 'Add Detection Rule'}
            </DialogTitle>
            <DialogDescription>
              Configure how this signal affects customer type detection
            </DialogDescription>
          </DialogHeader>

          {editingRule && (
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Rule Code *</Label>
                  <Input
                    value={editingRule.rule_code}
                    onChange={(e) => setEditingRule({ ...editingRule, rule_code: e.target.value })}
                    placeholder="my_custom_rule"
                    disabled={!!editingRule.id}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Rule Name *</Label>
                  <Input
                    value={editingRule.rule_name}
                    onChange={(e) => setEditingRule({ ...editingRule, rule_name: e.target.value })}
                    placeholder="My Custom Rule"
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label>Description</Label>
                <Textarea
                  value={editingRule.description || ''}
                  onChange={(e) => setEditingRule({ ...editingRule, description: e.target.value })}
                  placeholder="What this rule detects..."
                  rows={2}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Signal Type</Label>
                  <Select
                    value={editingRule.signal_type}
                    onValueChange={(v) => setEditingRule({ ...editingRule, signal_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {SIGNAL_TYPES.map(s => (
                        <SelectItem key={s.value} value={s.value}>
                          {s.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Output Customer Type</Label>
                  <Select
                    value={editingRule.output_customer_type}
                    onValueChange={(v) => setEditingRule({ ...editingRule, output_customer_type: v })}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOMER_TYPES.map(c => (
                        <SelectItem key={c.value} value={c.value}>
                          {c.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Weight: {editingRule.weight} points</Label>
                <Slider
                  value={[editingRule.weight]}
                  onValueChange={([v]) => setEditingRule({ ...editingRule, weight: v })}
                  min={0}
                  max={100}
                  step={5}
                />
                <p className="text-xs text-muted-foreground">
                  Higher weight = stronger influence on detection. 100 = explicit selection.
                </p>
              </div>

              <div className="space-y-2">
                <Label>Conditions (JSON)</Label>
                <Textarea
                  value={JSON.stringify(editingRule.conditions_json || {}, null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      setEditingRule({ ...editingRule, conditions_json: parsed });
                    } catch {
                      // Allow invalid JSON while typing
                    }
                  }}
                  placeholder='{"patterns": ["keyword1", "keyword2"]}'
                  rows={4}
                  className="font-mono text-sm"
                />
              </div>

              <div className="flex items-center justify-between p-3 rounded-lg border">
                <div>
                  <div className="font-medium text-sm">Active</div>
                  <div className="text-xs text-muted-foreground">Rule is used in detection</div>
                </div>
                <Switch
                  checked={editingRule.is_active}
                  onCheckedChange={(v) => setEditingRule({ ...editingRule, is_active: v })}
                />
              </div>
            </div>
          )}

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? 'Saving...' : 'Save'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
