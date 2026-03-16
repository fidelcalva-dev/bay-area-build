/**
 * CommercialAccountCard — Displays and manages commercial account status,
 * discount tier, and approval workflow within Customer 360.
 */
import { useState } from 'react';
import {
  Building2, CheckCircle2, Clock, XCircle, Loader2, Award,
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger,
} from '@/components/ui/dialog';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

const TIERS = [
  { value: 'retail', label: 'Retail (0%)', discount: 0 },
  { value: 'contractor_t1', label: 'Contractor Tier 1 (5%)', discount: 5 },
  { value: 'contractor_t2', label: 'Contractor Tier 2 (8%)', discount: 8 },
  { value: 'commercial', label: 'Commercial Account (10%)', discount: 10 },
  { value: 'manual', label: 'Manual Rate Card', discount: 0 },
] as const;

const STATUS_CONFIG: Record<string, { label: string; icon: typeof Clock; color: string }> = {
  none: { label: 'No Application', icon: XCircle, color: 'bg-muted text-muted-foreground' },
  new: { label: 'New Application', icon: Clock, color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300' },
  under_review: { label: 'Under Review', icon: Clock, color: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300' },
  approved: { label: 'Approved', icon: CheckCircle2, color: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' },
  rejected: { label: 'Rejected', icon: XCircle, color: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300' },
  active: { label: 'Active', icon: Award, color: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-300' },
};

interface Props {
  customerId: string;
  currentStatus: string;
  currentTier: string;
  discountPct: number;
  monthlyVolume?: number | null;
  creditTerms?: string | null;
  notes?: string | null;
  onUpdated: () => void;
}

export function CommercialAccountCard({
  customerId, currentStatus, currentTier, discountPct,
  monthlyVolume, creditTerms, notes, onUpdated,
}: Props) {
  const [open, setOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [tier, setTier] = useState(currentTier || 'retail');
  const [status, setStatus] = useState(currentStatus || 'none');
  const [volume, setVolume] = useState(String(monthlyVolume || ''));
  const [terms, setTerms] = useState(creditTerms || '');
  const [editNotes, setEditNotes] = useState(notes || '');
  const { toast } = useToast();

  const statusCfg = STATUS_CONFIG[currentStatus] || STATUS_CONFIG.none;
  const tierInfo = TIERS.find(t => t.value === currentTier) || TIERS[0];

  async function handleSave() {
    setSaving(true);
    try {
      const selectedTier = TIERS.find(t => t.value === tier);
      const { error } = await supabase
        .from('customers')
        .update({
          commercial_account_status: status,
          contractor_tier: tier,
          discount_pct: selectedTier?.discount ?? 0,
          monthly_volume_estimate: volume ? parseInt(volume) : null,
          credit_terms_requested: terms || null,
          commercial_notes: editNotes || null,
          ...(status === 'approved' || status === 'active' ? {
            commercial_approved_at: new Date().toISOString(),
          } : {}),
        })
        .eq('id', customerId);

      if (error) throw error;

      // Timeline event
      await supabase.from('timeline_events').insert({
        entity_type: 'CUSTOMER' as const,
        entity_id: customerId,
        customer_id: customerId,
        event_type: 'SYSTEM' as const,
        event_action: 'UPDATED' as const,
        summary: `Commercial account ${status === 'approved' ? 'approved' : 'updated'} — ${TIERS.find(t => t.value === tier)?.label}`,
        details_json: { tier, status, discount_pct: selectedTier?.discount, event: status === 'approved' ? 'commercial_account_approved' : 'commercial_account_updated' },
      });

      toast({ title: 'Commercial account updated' });
      setOpen(false);
      onUpdated();
    } catch {
      toast({ title: 'Failed to update', variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <Building2 className="w-4 h-4" /> Commercial Account
          </span>
          <Badge className={`text-[10px] ${statusCfg.color}`}>{statusCfg.label}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="grid grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-muted-foreground text-xs">Tier</p>
            <p className="font-medium">{tierInfo.label}</p>
          </div>
          <div>
            <p className="text-muted-foreground text-xs">Discount</p>
            <p className="font-medium">{discountPct}%</p>
          </div>
          {monthlyVolume && (
            <div>
              <p className="text-muted-foreground text-xs">Est. Monthly Volume</p>
              <p className="font-medium">{monthlyVolume} units</p>
            </div>
          )}
          {creditTerms && (
            <div>
              <p className="text-muted-foreground text-xs">Credit Terms</p>
              <p className="font-medium">{creditTerms}</p>
            </div>
          )}
        </div>
        <p className="text-[10px] text-muted-foreground">
          Discounts apply to eligible base pricing only. Heavy surcharges, permits, rush fees, and extras are not discountable.
        </p>

        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" size="sm" className="w-full gap-1.5">
              <Building2 className="w-3.5 h-3.5" />
              {currentStatus === 'none' ? 'Apply for Commercial Account' : 'Edit Commercial Account'}
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>Commercial Account Settings</DialogTitle>
            </DialogHeader>
            <div className="space-y-3 py-2">
              <div className="space-y-1.5">
                <Label className="text-xs">Status</Label>
                <Select value={status} onValueChange={setStatus}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {Object.entries(STATUS_CONFIG).map(([k, v]) => (
                      <SelectItem key={k} value={k}>{v.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Discount Tier</Label>
                <Select value={tier} onValueChange={setTier}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TIERS.map(t => (
                      <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Monthly Volume Est.</Label>
                  <Input type="number" value={volume} onChange={e => setVolume(e.target.value)} placeholder="e.g. 10" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Credit Terms</Label>
                  <Select value={terms} onValueChange={setTerms}>
                    <SelectTrigger><SelectValue placeholder="Select..." /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="pay_per_job">Pay Per Job</SelectItem>
                      <SelectItem value="net_15">Net 15</SelectItem>
                      <SelectItem value="net_30">Net 30</SelectItem>
                      <SelectItem value="prepaid">Prepaid</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="space-y-1.5">
                <Label className="text-xs">Notes</Label>
                <Textarea value={editNotes} onChange={e => setEditNotes(e.target.value)} rows={2} placeholder="Approval notes, special terms..." />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setOpen(false)}>Cancel</Button>
              <Button onClick={handleSave} disabled={saving}>
                {saving ? <Loader2 className="w-4 h-4 mr-1 animate-spin" /> : null}
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}
