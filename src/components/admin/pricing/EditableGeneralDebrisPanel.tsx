import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { DollarSign, Save, Loader2, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
  fetchGeneralDebrisPricing,
  updateGeneralDebrisPrice,
  logPricingChange,
  type GeneralDebrisRow,
} from '@/lib/pricingCatalogService';

export default function EditableGeneralDebrisPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValues, setEditValues] = useState<Partial<GeneralDebrisRow>>({});

  const { data: rows = [], isLoading } = useQuery({
    queryKey: ['pricing-general-debris'],
    queryFn: () => fetchGeneralDebrisPricing(),
  });

  const saveMutation = useMutation({
    mutationFn: async ({ id, updates, original }: { id: string; updates: Partial<GeneralDebrisRow>; original: GeneralDebrisRow }) => {
      const success = await updateGeneralDebrisPrice(id, updates);
      if (!success) throw new Error('Failed to save');

      // Log each changed field
      for (const [key, val] of Object.entries(updates)) {
        const oldVal = (original as Record<string, unknown>)[key];
        if (oldVal !== val) {
          await logPricingChange({
            config_area: 'general_debris',
            entity_type: 'pricing_general_debris',
            entity_id: id,
            field_name: key,
            old_value: oldVal as string | number,
            new_value: val as string | number,
            change_reason: 'Admin pricing edit',
          });
        }
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-general-debris'] });
      setEditingId(null);
      setEditValues({});
      toast.success('Price updated successfully');
    },
    onError: () => toast.error('Failed to save price'),
  });

  const startEdit = (row: GeneralDebrisRow) => {
    setEditingId(row.id);
    setEditValues({
      base_price: row.base_price,
      included_tons: row.included_tons,
      rental_days: row.rental_days,
      overage_rate: row.overage_rate,
    });
  };

  const handleSave = (row: GeneralDebrisRow) => {
    if (row.id.startsWith('fallback-')) {
      toast.error('Cannot edit fallback data — seed the database first');
      return;
    }
    saveMutation.mutate({ id: row.id, updates: editValues, original: row });
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <DollarSign className="w-5 h-5 text-primary" />
          General Debris Pricing
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Editable base prices, included tons, and rental periods. Changes are audit-logged.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Base Pricing by Size</CardTitle>
          <CardDescription>Click a row to edit. All consumers read from this source.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size</TableHead>
                <TableHead className="text-right">Base Price</TableHead>
                <TableHead className="text-right">Included Tons</TableHead>
                <TableHead className="text-right">Rental Days</TableHead>
                <TableHead className="text-right">Overage/Ton</TableHead>
                <TableHead className="text-right">Best For</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map(row => {
                const isEditing = editingId === row.id;
                return (
                  <TableRow
                    key={row.id}
                    className={isEditing ? 'bg-primary/5' : 'cursor-pointer hover:bg-muted/50'}
                    onClick={() => !isEditing && startEdit(row)}
                  >
                    <TableCell className="font-medium">{row.size_yd} yd</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.base_price ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, base_price: Number(e.target.value) }))}
                          className="w-24 ml-auto text-right"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="font-mono">${row.base_price}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          step="0.5"
                          value={editValues.included_tons ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, included_tons: Number(e.target.value) }))}
                          className="w-20 ml-auto text-right"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span>{row.included_tons}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.rental_days ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, rental_days: Number(e.target.value) }))}
                          className="w-16 ml-auto text-right"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span>{row.rental_days}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editValues.overage_rate ?? ''}
                          onChange={e => setEditValues(v => ({ ...v, overage_rate: Number(e.target.value) }))}
                          className="w-20 ml-auto text-right"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="font-mono">${row.overage_rate}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">
                      {row.best_for || '—'}
                    </TableCell>
                    <TableCell>
                      {isEditing ? (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            variant="default"
                            onClick={e => { e.stopPropagation(); handleSave(row); }}
                            disabled={saveMutation.isPending}
                          >
                            {saveMutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={e => { e.stopPropagation(); setEditingId(null); }}
                          >
                            ✕
                          </Button>
                        </div>
                      ) : (
                        <Badge variant="outline" className="text-[10px]">
                          <CheckCircle2 className="w-3 h-3 mr-1 text-emerald-500" />
                          Live
                        </Badge>
                      )}
                    </TableCell>
                  </TableRow>
                );
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
