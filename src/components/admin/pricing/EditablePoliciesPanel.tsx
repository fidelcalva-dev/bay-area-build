import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Shield, Save, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import {
  fetchPolicies,
  updatePolicy,
  logPricingChange,
  type PolicyRow,
} from '@/lib/pricingCatalogService';

export default function EditablePoliciesPanel() {
  const queryClient = useQueryClient();
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editAmount, setEditAmount] = useState<number>(0);

  const { data: policies = [], isLoading } = useQuery({
    queryKey: ['pricing-policies'],
    queryFn: fetchPolicies,
  });

  const mutation = useMutation({
    mutationFn: async ({ id, amount, original }: { id: string; amount: number; original: PolicyRow }) => {
      const ok = await updatePolicy(id, amount);
      if (!ok) throw new Error('Failed');
      await logPricingChange({
        config_area: 'policies',
        entity_type: 'pricing_policies',
        entity_id: id,
        field_name: 'amount',
        old_value: original.amount,
        new_value: amount,
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['pricing-policies'] });
      setEditingId(null);
      toast.success('Policy fee updated');
    },
    onError: () => toast.error('Failed to save'),
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Shield className="w-5 h-5 text-primary" />
          Fees & Policies
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Editable operational fees and policy amounts. All changes are audit-logged.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Active Policies</CardTitle>
          <CardDescription>Click a row to edit the fee amount.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Policy</TableHead>
                <TableHead>Code</TableHead>
                <TableHead className="text-right">Amount</TableHead>
                <TableHead>Description</TableHead>
                <TableHead className="w-20"></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {policies.map(p => {
                const isEditing = editingId === p.id;
                return (
                  <TableRow
                    key={p.id}
                    className={isEditing ? 'bg-primary/5' : 'cursor-pointer hover:bg-muted/50'}
                    onClick={() => { if (!isEditing) { setEditingId(p.id); setEditAmount(p.amount); } }}
                  >
                    <TableCell className="font-medium">{p.label}</TableCell>
                    <TableCell className="text-xs text-muted-foreground font-mono">{p.policy_code}</TableCell>
                    <TableCell className="text-right">
                      {isEditing ? (
                        <Input
                          type="number"
                          value={editAmount}
                          onChange={e => setEditAmount(Number(e.target.value))}
                          className="w-24 ml-auto text-right"
                          onClick={e => e.stopPropagation()}
                        />
                      ) : (
                        <span className="font-mono font-semibold">${p.amount}</span>
                      )}
                    </TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-48 truncate">{p.description || '—'}</TableCell>
                    <TableCell>
                      {isEditing && (
                        <div className="flex gap-1">
                          <Button
                            size="sm"
                            onClick={e => { e.stopPropagation(); mutation.mutate({ id: p.id, amount: editAmount, original: p }); }}
                            disabled={mutation.isPending}
                          >
                            {mutation.isPending ? <Loader2 className="w-3 h-3 animate-spin" /> : <Save className="w-3 h-3" />}
                          </Button>
                          <Button size="sm" variant="ghost" onClick={e => { e.stopPropagation(); setEditingId(null); }}>✕</Button>
                        </div>
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
