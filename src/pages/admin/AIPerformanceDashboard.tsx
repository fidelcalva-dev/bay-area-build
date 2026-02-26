import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Brain, TrendingUp, Target, AlertTriangle } from 'lucide-react';
import { toast } from 'sonner';

type LearningMode = 'OFF' | 'DRY_RUN' | 'LIVE';

function useAssistantLearningMode() {
  return useQuery({
    queryKey: ['assistant-learning-mode'],
    queryFn: async () => {
      const { data } = await supabase
        .from('config_settings')
        .select('value')
        .eq('category', 'assistant_learning')
        .eq('key', 'mode')
        .maybeSingle();
      if (!data?.value) return 'OFF' as LearningMode;
      try { return JSON.parse(data.value as string) as LearningMode; }
      catch { return 'OFF' as LearningMode; }
    },
  });
}

function useAssistantLearningStats() {
  return useQuery({
    queryKey: ['assistant-learning-stats'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('assistant_learning')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(500);
      if (error) throw error;
      const rows = data || [];
      const total = rows.length;
      const converted = rows.filter(r => r.converted_to_order).length;
      const quoted = rows.filter(r => r.converted_to_quote).length;
      const sizeDeltaRows = rows.filter(r => r.recommended_size && r.selected_size);
      const avgSizeDelta = sizeDeltaRows.length > 0
        ? sizeDeltaRows.reduce((s, r) => s + Math.abs((r.selected_size || 0) - (r.recommended_size || 0)), 0) / sizeDeltaRows.length
        : 0;
      const dropOffs: Record<string, number> = {};
      rows.forEach(r => {
        if (r.drop_off_step) dropOffs[r.drop_off_step] = (dropOffs[r.drop_off_step] || 0) + 1;
      });
      const marginBands: Record<string, number> = {};
      rows.forEach(r => {
        if (r.margin_band) marginBands[r.margin_band] = (marginBands[r.margin_band] || 0) + 1;
      });
      return {
        total, converted, quoted, avgSizeDelta,
        conversionRate: total > 0 ? (converted / total * 100) : 0,
        quoteRate: total > 0 ? (quoted / total * 100) : 0,
        dropOffs, marginBands, recentRows: rows.slice(0, 20),
      };
    },
  });
}

export default function AIPerformanceDashboard() {
  const queryClient = useQueryClient();
  const { data: mode, isLoading: modeLoading } = useAssistantLearningMode();
  const { data: stats, isLoading: statsLoading } = useAssistantLearningStats();

  const updateMode = useMutation({
    mutationFn: async (newMode: LearningMode) => {
      const { error } = await supabase
        .from('config_settings')
        .update({ value: JSON.stringify(newMode), updated_at: new Date().toISOString() })
        .eq('category', 'assistant_learning')
        .eq('key', 'mode');
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['assistant-learning-mode'] });
      toast.success('Modo actualizado');
    },
    onError: () => toast.error('Error actualizando modo'),
  });

  const modeColor = mode === 'LIVE' ? 'default' : mode === 'DRY_RUN' ? 'secondary' : 'outline';

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold flex items-center gap-2">
            <Brain className="h-6 w-6" /> AI Performance Dashboard
          </h1>
          <p className="text-muted-foreground text-sm">Assistant learning metrics & controls</p>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">Learning Mode:</span>
          <Badge variant={modeColor}>{mode || 'OFF'}</Badge>
          <Select
            value={mode || 'OFF'}
            onValueChange={(v) => updateMode.mutate(v as LearningMode)}
            disabled={modeLoading || updateMode.isPending}
          >
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="OFF">OFF</SelectItem>
              <SelectItem value="DRY_RUN">DRY_RUN</SelectItem>
              <SelectItem value="LIVE">LIVE</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {mode === 'OFF' && (
        <Card className="border-destructive/30 bg-destructive/5">
          <CardContent className="pt-4 flex items-center gap-2 text-sm">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            Learning está OFF — no se registran datos. Cambia a DRY_RUN para log o LIVE para persistir.
          </CardContent>
        </Card>
      )}

      {statsLoading ? (
        <p className="text-muted-foreground">Cargando métricas...</p>
      ) : stats ? (
        <>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Interacciones</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{stats.total}</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><TrendingUp className="h-4 w-4" /> Conversión</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{stats.conversionRate.toFixed(1)}%</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-1"><Target className="h-4 w-4" /> Quote Rate</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{stats.quoteRate.toFixed(1)}%</p></CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2"><CardTitle className="text-sm">Avg Size Δ</CardTitle></CardHeader>
              <CardContent><p className="text-2xl font-bold">{stats.avgSizeDelta.toFixed(1)} yd</p></CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <Card>
              <CardHeader><CardTitle className="text-sm">Drop-off por Paso</CardTitle></CardHeader>
              <CardContent>
                {Object.entries(stats.dropOffs).length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sin datos aún</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(stats.dropOffs)
                      .sort(([,a],[,b]) => b - a)
                      .map(([step, count]) => (
                        <div key={step} className="flex justify-between text-sm">
                          <span>{step}</span>
                          <Badge variant="outline">{count}</Badge>
                        </div>
                      ))}
                  </div>
                )}
              </CardContent>
            </Card>
            <Card>
              <CardHeader><CardTitle className="text-sm">Distribución Margen</CardTitle></CardHeader>
              <CardContent>
                {Object.entries(stats.marginBands).length === 0 ? (
                  <p className="text-muted-foreground text-sm">Sin datos aún</p>
                ) : (
                  <div className="space-y-2">
                    {Object.entries(stats.marginBands).map(([band, count]) => (
                      <div key={band} className="flex justify-between text-sm">
                        <span>{band}</span>
                        <Badge variant={band === 'HIGH' ? 'default' : band === 'MED' ? 'secondary' : 'destructive'}>{count}</Badge>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader><CardTitle className="text-sm">Recientes (últimas 20)</CardTitle></CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Tipo</th>
                      <th className="text-left p-2">Proyecto</th>
                      <th className="text-left p-2">Rec.</th>
                      <th className="text-left p-2">Sel.</th>
                      <th className="text-left p-2">Quote</th>
                      <th className="text-left p-2">Order</th>
                      <th className="text-left p-2">Margen</th>
                      <th className="text-left p-2">Modo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.recentRows.map(r => (
                      <tr key={r.id} className="border-b">
                        <td className="p-2">{r.user_type || '—'}</td>
                        <td className="p-2">{r.project_type || '—'}</td>
                        <td className="p-2">{r.recommended_size || '—'}</td>
                        <td className="p-2">{r.selected_size || '—'}</td>
                        <td className="p-2">{r.converted_to_quote ? '✓' : '—'}</td>
                        <td className="p-2">{r.converted_to_order ? '✓' : '—'}</td>
                        <td className="p-2">{r.margin_band || '—'}</td>
                        <td className="p-2"><Badge variant="outline" className="text-[10px]">{r.ai_mode}</Badge></td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </>
      ) : null}
    </div>
  );
}
