import { useEffect, useState } from 'react';
import { Loader2, Plus, Edit2, Trash2, Save, X, MessageSquare } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { createAuditLog } from '@/lib/auditLog';

interface SMSTemplate {
  id: string;
  template_key: string;
  template_name: string;
  template_body: string;
  variables: string[];
  category: string;
  is_active: boolean;
}

const CATEGORY_COLORS: Record<string, string> = {
  confirmation: 'bg-green-100 text-green-800',
  notification: 'bg-blue-100 text-blue-800',
  receipt: 'bg-purple-100 text-purple-800',
  system: 'bg-gray-100 text-gray-800',
  general: 'bg-yellow-100 text-yellow-800',
};

export default function CSTemplates() {
  const [templates, setTemplates] = useState<SMSTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<SMSTemplate | null>(null);
  const [form, setForm] = useState({
    template_key: '',
    template_name: '',
    template_body: '',
    variables: '',
    category: 'general',
  });
  const { toast } = useToast();

  useEffect(() => {
    fetchTemplates();
  }, []);

  async function fetchTemplates() {
    const { data, error } = await supabase
      .from('sms_templates')
      .select('*')
      .order('category')
      .order('template_name');

    if (error) {
      toast({ title: 'Error loading templates', description: error.message, variant: 'destructive' });
    } else {
      setTemplates(data || []);
    }
    setIsLoading(false);
  }

  function openAdd() {
    setEditingTemplate(null);
    setForm({
      template_key: '',
      template_name: '',
      template_body: '',
      variables: '',
      category: 'general',
    });
    setDialogOpen(true);
  }

  function openEdit(template: SMSTemplate) {
    setEditingTemplate(template);
    setForm({
      template_key: template.template_key,
      template_name: template.template_name,
      template_body: template.template_body,
      variables: template.variables.join(', '),
      category: template.category,
    });
    setDialogOpen(true);
  }

  async function handleSave() {
    if (!form.template_key || !form.template_name || !form.template_body) {
      toast({ title: 'Error', description: 'Key, name, and body are required', variant: 'destructive' });
      return;
    }

    const variables = form.variables
      .split(',')
      .map((v) => v.trim())
      .filter(Boolean);

    const payload = {
      template_key: form.template_key,
      template_name: form.template_name,
      template_body: form.template_body,
      variables,
      category: form.category,
    };

    if (editingTemplate) {
      const { error } = await supabase
        .from('sms_templates')
        .update(payload)
        .eq('id', editingTemplate.id);

      if (error) {
        toast({ title: 'Error updating template', description: error.message, variant: 'destructive' });
      } else {
        await createAuditLog({
          action: 'update',
          entityType: 'sms_templates',
          entityId: editingTemplate.id,
          beforeData: JSON.parse(JSON.stringify(editingTemplate)),
          afterData: JSON.parse(JSON.stringify(payload)),
          changesSummary: `Updated SMS template: ${form.template_name}`,
        });
        toast({ title: 'Template updated' });
        setDialogOpen(false);
        fetchTemplates();
      }
    } else {
      const { error } = await supabase.from('sms_templates').insert([payload]);

      if (error) {
        toast({ title: 'Error creating template', description: error.message, variant: 'destructive' });
      } else {
        toast({ title: 'Template created' });
        setDialogOpen(false);
        fetchTemplates();
      }
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Delete this template?')) return;

    const { error } = await supabase.from('sms_templates').delete().eq('id', id);

    if (error) {
      toast({ title: 'Error deleting template', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Template deleted' });
      fetchTemplates();
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  // Group by category
  const grouped = templates.reduce((acc, t) => {
    if (!acc[t.category]) acc[t.category] = [];
    acc[t.category].push(t);
    return acc;
  }, {} as Record<string, SMSTemplate[]>);

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">SMS Templates</h1>
          <p className="text-muted-foreground mt-1">
            Manage automated message templates
          </p>
        </div>
        <Button onClick={openAdd}>
          <Plus className="w-4 h-4 mr-2" />
          New Template
        </Button>
      </div>

      <div className="space-y-8">
        {Object.entries(grouped).map(([category, categoryTemplates]) => (
          <div key={category}>
            <h2 className="text-lg font-semibold text-foreground capitalize mb-4">{category}</h2>
            <div className="grid md:grid-cols-2 gap-4">
              {categoryTemplates.map((template) => (
                <Card key={template.id}>
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-base flex items-center gap-2">
                        <MessageSquare className="w-4 h-4 text-primary" />
                        {template.template_name}
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        <Badge className={CATEGORY_COLORS[template.category] || 'bg-gray-100'}>
                          {template.category}
                        </Badge>
                        <Button size="icon" variant="ghost" onClick={() => openEdit(template)}>
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          size="icon"
                          variant="ghost"
                          className="text-destructive"
                          onClick={() => handleDelete(template.id)}
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-muted-foreground mb-2 font-mono text-xs">
                      {template.template_key}
                    </p>
                    <p className="text-sm bg-muted p-3 rounded-lg">{template.template_body}</p>
                    {template.variables.length > 0 && (
                      <div className="mt-3 flex flex-wrap gap-1">
                        {template.variables.map((v) => (
                          <Badge key={v} variant="outline" className="text-xs">
                            {`{{${v}}}`}
                          </Badge>
                        ))}
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{editingTemplate ? 'Edit Template' : 'New Template'}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-sm font-medium">Template Key</label>
                <Input
                  value={form.template_key}
                  onChange={(e) => setForm({ ...form, template_key: e.target.value })}
                  placeholder="schedule_confirmed"
                  disabled={!!editingTemplate}
                />
              </div>
              <div>
                <label className="text-sm font-medium">Category</label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="confirmation">Confirmation</SelectItem>
                    <SelectItem value="notification">Notification</SelectItem>
                    <SelectItem value="receipt">Receipt</SelectItem>
                    <SelectItem value="system">System</SelectItem>
                    <SelectItem value="general">General</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <label className="text-sm font-medium">Template Name</label>
              <Input
                value={form.template_name}
                onChange={(e) => setForm({ ...form, template_name: e.target.value })}
                placeholder="Schedule Confirmed"
              />
            </div>

            <div>
              <label className="text-sm font-medium">Message Body</label>
              <Textarea
                value={form.template_body}
                onChange={(e) => setForm({ ...form, template_body: e.target.value })}
                placeholder="Your delivery is confirmed for {{date}}..."
                rows={4}
              />
              <p className="text-xs text-muted-foreground mt-1">
                Use {`{{variable}}`} for dynamic content
              </p>
            </div>

            <div>
              <label className="text-sm font-medium">Variables (comma-separated)</label>
              <Input
                value={form.variables}
                onChange={(e) => setForm({ ...form, variables: e.target.value })}
                placeholder="date, window, address"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <Button variant="outline" className="flex-1" onClick={() => setDialogOpen(false)}>
                Cancel
              </Button>
              <Button className="flex-1" onClick={handleSave}>
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
