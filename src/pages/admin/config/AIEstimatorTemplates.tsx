import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { toast } from 'sonner';
import { Loader2, Save, RefreshCw, ChevronDown, ChevronRight } from 'lucide-react';

interface EstimationTemplate {
  id: string;
  project_type: string;
  display_label: string;
  display_label_es: string;
  estimation_unit: string;
  yd3_per_unit_min: number;
  yd3_per_unit_max: number;
  typical_range_min: number;
  typical_range_max: number;
  heavy_material_flag: boolean;
  default_size_recommendations: string[];
  recyclable_materials: string[];
  savings_tips: string[];
  savings_tips_es: string[];
  needs_photo_recommendation: boolean;
  confidence_behavior: string;
  sort_order: number;
  is_active: boolean;
}

export default function AIEstimatorTemplates() {
  const [templates, setTemplates] = useState<EstimationTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const fetchTemplates = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('estimation_templates')
      .select('*')
      .order('sort_order');

    if (error) {
      toast.error('Failed to load templates');
      console.error(error);
    } else {
      setTemplates((data as any[]) || []);
    }
    setLoading(false);
  };

  useEffect(() => { fetchTemplates(); }, []);

  const updateField = (id: string, field: string, value: any) => {
    setTemplates(prev => prev.map(t =>
      t.id === id ? { ...t, [field]: value } : t
    ));
  };

  const saveTemplate = async (template: EstimationTemplate) => {
    setSaving(template.id);
    const { error } = await supabase
      .from('estimation_templates')
      .update({
        display_label: template.display_label,
        display_label_es: template.display_label_es,
        estimation_unit: template.estimation_unit,
        yd3_per_unit_min: template.yd3_per_unit_min,
        yd3_per_unit_max: template.yd3_per_unit_max,
        typical_range_min: template.typical_range_min,
        typical_range_max: template.typical_range_max,
        heavy_material_flag: template.heavy_material_flag,
        default_size_recommendations: template.default_size_recommendations,
        recyclable_materials: template.recyclable_materials,
        savings_tips: template.savings_tips,
        savings_tips_es: template.savings_tips_es,
        needs_photo_recommendation: template.needs_photo_recommendation,
        is_active: template.is_active,
        sort_order: template.sort_order,
        updated_at: new Date().toISOString(),
      })
      .eq('id', template.id);

    if (error) {
      toast.error('Failed to save');
      console.error(error);
    } else {
      toast.success(`Saved: ${template.display_label}`);
    }
    setSaving(null);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-foreground">AI Estimator Templates</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Configure project estimation assumptions used by the homepage AI assistant.
          </p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchTemplates}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      <div className="space-y-2">
        {templates.map((t) => {
          const isExpanded = expanded === t.id;
          return (
            <div key={t.id} className="border border-border rounded-xl bg-card overflow-hidden">
              {/* Header row */}
              <button
                onClick={() => setExpanded(isExpanded ? null : t.id)}
                className="w-full flex items-center justify-between px-4 py-3 hover:bg-muted/30 transition-colors"
              >
                <div className="flex items-center gap-3">
                  {isExpanded ? <ChevronDown className="w-4 h-4 text-muted-foreground" /> : <ChevronRight className="w-4 h-4 text-muted-foreground" />}
                  <span className="font-medium text-sm text-foreground">{t.display_label}</span>
                  <span className="text-xs text-muted-foreground">({t.project_type})</span>
                  {t.heavy_material_flag && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-destructive/10 text-destructive font-medium">Heavy</span>
                  )}
                  {!t.is_active && (
                    <span className="text-[10px] px-2 py-0.5 rounded-full bg-muted text-muted-foreground font-medium">Inactive</span>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  {t.typical_range_min}–{t.typical_range_max} yd³
                </span>
              </button>

              {/* Expanded form */}
              {isExpanded && (
                <div className="px-4 pb-4 pt-2 border-t border-border space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Label (EN)</Label>
                      <Input value={t.display_label} onChange={e => updateField(t.id, 'display_label', e.target.value)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Label (ES)</Label>
                      <Input value={t.display_label_es} onChange={e => updateField(t.id, 'display_label_es', e.target.value)} className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <Label className="text-xs">Unit</Label>
                      <select
                        value={t.estimation_unit}
                        onChange={e => updateField(t.id, 'estimation_unit', e.target.value)}
                        className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                      >
                        <option value="sqft">Per sq ft</option>
                        <option value="linear_ft">Per linear ft</option>
                        <option value="fixed">Fixed range</option>
                        <option value="room">Per room</option>
                      </select>
                    </div>
                    <div>
                      <Label className="text-xs">yd³/unit Min</Label>
                      <Input type="number" step="0.001" value={t.yd3_per_unit_min} onChange={e => updateField(t.id, 'yd3_per_unit_min', parseFloat(e.target.value) || 0)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">yd³/unit Max</Label>
                      <Input type="number" step="0.001" value={t.yd3_per_unit_max} onChange={e => updateField(t.id, 'yd3_per_unit_max', parseFloat(e.target.value) || 0)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Sort Order</Label>
                      <Input type="number" value={t.sort_order} onChange={e => updateField(t.id, 'sort_order', parseInt(e.target.value) || 0)} className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Typical Range Min (yd³)</Label>
                      <Input type="number" value={t.typical_range_min} onChange={e => updateField(t.id, 'typical_range_min', parseInt(e.target.value) || 0)} className="mt-1" />
                    </div>
                    <div>
                      <Label className="text-xs">Typical Range Max (yd³)</Label>
                      <Input type="number" value={t.typical_range_max} onChange={e => updateField(t.id, 'typical_range_max', parseInt(e.target.value) || 0)} className="mt-1" />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-xs">Recyclable Materials (comma-separated)</Label>
                      <Input
                        value={Array.isArray(t.recyclable_materials) ? t.recyclable_materials.join(', ') : ''}
                        onChange={e => updateField(t.id, 'recyclable_materials', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label className="text-xs">Default Size Recommendations (comma-separated)</Label>
                      <Input
                        value={Array.isArray(t.default_size_recommendations) ? t.default_size_recommendations.join(', ') : ''}
                        onChange={e => updateField(t.id, 'default_size_recommendations', e.target.value.split(',').map(s => s.trim()).filter(Boolean))}
                        className="mt-1"
                      />
                    </div>
                  </div>

                  <div>
                    <Label className="text-xs">Savings Tips (EN) — one per line</Label>
                    <textarea
                      value={Array.isArray(t.savings_tips) ? t.savings_tips.join('\n') : ''}
                      onChange={e => updateField(t.id, 'savings_tips', e.target.value.split('\n').filter(Boolean))}
                      rows={3}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div>
                    <Label className="text-xs">Savings Tips (ES) — one per line</Label>
                    <textarea
                      value={Array.isArray(t.savings_tips_es) ? t.savings_tips_es.join('\n') : ''}
                      onChange={e => updateField(t.id, 'savings_tips_es', e.target.value.split('\n').filter(Boolean))}
                      rows={3}
                      className="mt-1 w-full rounded-md border border-input bg-background px-3 py-2 text-sm"
                    />
                  </div>

                  <div className="flex flex-wrap items-center gap-6">
                    <div className="flex items-center gap-2">
                      <Switch checked={t.heavy_material_flag} onCheckedChange={v => updateField(t.id, 'heavy_material_flag', v)} />
                      <Label className="text-xs">Heavy Material</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={t.needs_photo_recommendation} onCheckedChange={v => updateField(t.id, 'needs_photo_recommendation', v)} />
                      <Label className="text-xs">Recommend Photo</Label>
                    </div>
                    <div className="flex items-center gap-2">
                      <Switch checked={t.is_active} onCheckedChange={v => updateField(t.id, 'is_active', v)} />
                      <Label className="text-xs">Active</Label>
                    </div>
                  </div>

                  <div className="flex justify-end pt-2">
                    <Button size="sm" onClick={() => saveTemplate(t)} disabled={saving === t.id}>
                      {saving === t.id ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Save className="w-4 h-4 mr-2" />}
                      Save
                    </Button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
