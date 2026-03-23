import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Scale, Save, Loader2, Info, AlertTriangle } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  fetchHeavyServiceCosts,
  fetchHeavyGroups,
  updateHeavyServiceCost,
  updateHeavyGroup,
  logPricingChange,
  type HeavyServiceCostRow,
  type HeavyGroupRow,
} from '@/lib/pricingCatalogService';

export default function EditableHeavyPricingPanel() {
  const queryClient = useQueryClient();
  const [editingCostId, setEditingCostId] = useState<string | null>(null);
  const [editCostValue, setEditCostValue] = useState<number>(0);
  const [editingGroupId, setEditingGroupId] = useState<string | null>(null);
  const [editGroupFee, setEditGroupFee] = useState<number>(0);

  const { data: serviceCosts = [], isLoading: loadingCosts } = useQuery({
    queryKey: ['pricing-heavy-costs'],
    queryFn: fetchHeavyServiceCosts,
  });

  const { data: groups = [], isLoading: loadingGroups } = useQuery({
    queryKey: ['pricing-heavy-groups'],
    queryFn: fetchHeavyGroups,
  });

  const costMutation = useMutation({
    mutationFn: async ({ id, cost, original }: { id: string; cost: number; original: HeavyServiceCostRow }) => {
      const ok = await updateHeavyServiceCost(id, cost);
      if (!ok) throw new Error('Failed');
      await logPricingChange({
        config_area: 'heavy_service_costs',
        entity_type: 'pricing_heavy_service_costs',
        entity_id: id,
        field_name: 'service_cost',
        old_value: original.service_cost,
        new_value: cost,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-heavy-costs'] });
      setEditingCostId(null);
      toast.success('Service cost updated');
    },
    onError: () => toast.error('Failed to save'),
  });

  const groupMutation = useMutation({
    mutationFn: async ({ id, fee, original }: { id: string; fee: number; original: HeavyGroupRow }) => {
      const ok = await updateHeavyGroup(id, { dump_fee_per_yard: fee });
      if (!ok) throw new Error('Failed');
      await logPricingChange({
        config_area: 'heavy_groups',
        entity_type: 'pricing_heavy_groups',
        entity_id: id,
        field_name: 'dump_fee_per_yard',
        old_value: original.dump_fee_per_yard,
        new_value: fee,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-heavy-groups'] });
      setEditingGroupId(null);
      toast.success('Dump fee updated');
    },
    onError: () => toast.error('Failed to save'),
  });

  if (loadingCosts || loadingGroups) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  // Build pricing matrix
  const sizes = [5, 8, 10] as const;

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Scale className="w-5 h-5 text-primary" />
          Heavy Material Pricing — Editable V2
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Edit service costs and dump fees. Formula: total = service_cost + (size × dump_fee/yd)
        </p>
      </div>

      {/* Formula */}
      <Card className="border-primary/20 bg-primary/5">
        <CardContent className="pt-4 pb-4">
          <div className="flex items-start gap-3">
            <Info className="w-5 h-5 text-primary mt-0.5 shrink-0" />
            <p className="text-sm">
              <code className="bg-muted px-1.5 py-0.5 rounded text-xs font-mono">total = service_cost + (size_yd × dump_fee_per_yard) + premiums</code>
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Service Costs */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Service Costs by Size</CardTitle>
          <CardDescription>Click to edit. Fixed per size regardless of material group.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-3 gap-4">
            {serviceCosts.map(sc => {
              const isEditing = editingCostId === sc.id;
              return (
                <div
                  key={sc.id}
                  className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors ${isEditing ? 'bg-primary/10 ring-1 ring-primary' : 'bg-muted hover:bg-muted/80'}`}
                  onClick={() => { if (!isEditing) { setEditingCostId(sc.id); setEditCostValue(sc.service_cost); } }}
                >
                  <span className="font-medium text-foreground">{sc.size_yd} yd</span>
                  {isEditing ? (
                    <div className="flex items-center gap-1">
                      <Input
                        type="number"
                        value={editCostValue}
                        onChange={e => setEditCostValue(Number(e.target.value))}
                        className="w-20 text-right"
                        onClick={e => e.stopPropagation()}
                      />
                      <Button size="sm" onClick={e => { e.stopPropagation(); costMutation.mutate({ id: sc.id, cost: editCostValue, original: sc }); }}>
                        <Save className="w-3 h-3" />
                      </Button>
                    </div>
                  ) : (
                    <span className="font-mono font-semibold text-foreground">${sc.service_cost}</span>
                  )}
                </div>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Groups + Matrix */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Material Groups & Pricing Matrix</CardTitle>
          <CardDescription>Edit dump fee per yard for each group. Totals recalculate automatically.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Group</TableHead>
                <TableHead className="text-right">Dump Fee/yd</TableHead>
                {sizes.map(s => (
                  <TableHead key={s} className="text-right">{s} yd Total</TableHead>
                ))}
                <TableHead className="w-16"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {groups.map(g => {
                const isEditing = editingGroupId === g.id;
                const feePerYd = isEditing ? editGroupFee : g.dump_fee_per_yard;
                return (
                  <TableRow
                    key={g.id}
                    className={isEditing ? 'bg-primary/5' : 'cursor-pointer hover:bg-muted/50'}
                    onClick={() => { if (!isEditing) { setEditingGroupId(g.id); setEditGroupFee(g.dump_fee_per_yard); } }}
                  >
                    <TableCell>
                      <div>
                        <p className="font-medium">{g.label}</p>
                        <p className="text-xs text-muted-foreground">{g.materials_json.join(', ')}</p>
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editGroupFee}
                          onChange={e => setEditGroupFee(Number(e.target.value))}
                          className="w-20 ml-auto text-right"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="font-mono">${g.dump_fee_per_yard}/yd</span>
                      )}
                    </TableCell>
                    {sizes.map(s => {
                      const sc = serviceCosts.find(c => c.size_yd === s);
                      const total = (sc?.service_cost || 0) + (s * feePerYd);
                      return (
                        <TableCell key={s} className="text-right font-mono font-bold text-primary">
                          ${total}
                        </TableCell>
                      );
                    })}
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button size="sm" onClick={e => { e.stopPropagation(); groupMutation.mutate({ id: g.id, fee: editGroupFee, original: g }); }}>
                            <Save className="w-3 h-3" />
                          </Button>
                          <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setEditingGroupId(null); }}>✕</Button>
                        </div>
                      ) : null}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Premiums */}
      <Card className="border-amber-200 dark:border-amber-800">
        <CardHeader className="pb-3">
          <CardTitle className="text-base flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-amber-600" />
            Premiums & Surcharges
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid sm:grid-cols-2 gap-3">
            {groups.length > 0 && (
              <>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Rebar Premium</span>
                  <Badge variant="outline" className="font-mono">+${groups[0].rebar_premium}</Badge>
                </div>
                <div className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <span className="text-sm">Green Halo Premium</span>
                  <Badge variant="outline" className="font-mono">+${groups[0].green_halo_premium}</Badge>
                </div>
              </>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Size restriction */}
      <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
        <div className="flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-destructive mt-0.5 shrink-0" />
          <div>
            <h3 className="font-medium text-foreground">Heavy Material Size Restriction</h3>
            <p className="text-sm text-muted-foreground mt-1">
              Heavy materials are limited to <strong>5, 8, and 10 yard</strong> dumpsters only.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
