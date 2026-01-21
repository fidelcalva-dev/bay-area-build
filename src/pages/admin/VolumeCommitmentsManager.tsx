import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter } from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { toast } from 'sonner';
import { 
  Plus, Pencil, CheckCircle, XCircle, Clock, 
  Users, Percent, Calendar, FileText, AlertCircle,
  Search, Filter
} from 'lucide-react';
import { format, addDays, differenceInDays, isAfter, isBefore } from 'date-fns';

// Volume tier configuration (LOCKED)
const VOLUME_TIERS = {
  tier_a: { label: 'Tier A (3-5 services)', minServices: 3, maxServices: 5, discountPct: 0.03 },
  tier_b: { label: 'Tier B (6-10 services)', minServices: 6, maxServices: 10, discountPct: 0.05 },
  tier_c: { label: 'Tier C (11-20 services)', minServices: 11, maxServices: 20, discountPct: 0.07 },
  tier_d: { label: 'Tier D (20+ services)', minServices: 21, maxServices: 999, discountPct: 0.10 },
} as const;

const CUSTOMER_TYPES = [
  { value: 'contractor', label: 'Contractor' },
  { value: 'preferred_contractor', label: 'Preferred Contractor' },
  { value: 'wholesaler_broker', label: 'Wholesaler/Broker' },
];

const COMMITMENT_TYPES = [
  { value: 'prepaid', label: 'Prepaid' },
  { value: 'contracted', label: 'Contracted' },
];

const VALIDITY_PRESETS = [
  { days: 30, label: '30 days' },
  { days: 60, label: '60 days' },
  { days: 90, label: '90 days' },
  { days: 180, label: '6 months' },
  { days: 365, label: '1 year' },
];

interface VolumeCommitment {
  id: string;
  customer_name: string;
  customer_email: string | null;
  customer_phone: string | null;
  customer_type: string;
  commitment_type: string;
  volume_tier: string;
  service_count_committed: number;
  services_remaining: number;
  discount_pct: number;
  validity_start_date: string;
  validity_end_date: string;
  approval_status: string;
  approved_by: string | null;
  approved_at: string | null;
  agreement_id: string | null;
  payment_ref: string | null;
  notes: string | null;
  created_at: string;
}

interface FormData {
  customer_name: string;
  customer_email: string;
  customer_phone: string;
  customer_type: string;
  commitment_type: string;
  volume_tier: string;
  service_count_committed: number;
  validity_days: number;
  agreement_id: string;
  payment_ref: string;
  notes: string;
}

const initialFormData: FormData = {
  customer_name: '',
  customer_email: '',
  customer_phone: '',
  customer_type: 'contractor',
  commitment_type: 'prepaid',
  volume_tier: 'tier_a',
  service_count_committed: 3,
  validity_days: 90,
  agreement_id: '',
  payment_ref: '',
  notes: '',
};

export default function VolumeCommitmentsManager() {
  const [commitments, setCommitments] = useState<VolumeCommitment[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  useEffect(() => {
    fetchCommitments();
  }, []);

  async function fetchCommitments() {
    setLoading(true);
    // Type cast needed until DB types regenerate
    const { data, error } = await (supabase
      .from('volume_commitments' as any)
      .select('*')
      .order('created_at', { ascending: false }) as any);

    if (error) {
      toast.error('Failed to load commitments');
      console.error(error);
    } else {
      setCommitments((data || []) as VolumeCommitment[]);
    }
    setLoading(false);
  }

  function getTierFromServiceCount(count: number): string {
    if (count >= 21) return 'tier_d';
    if (count >= 11) return 'tier_c';
    if (count >= 6) return 'tier_b';
    return 'tier_a';
  }

  function handleServiceCountChange(count: number) {
    const tier = getTierFromServiceCount(count);
    setFormData(prev => ({
      ...prev,
      service_count_committed: count,
      volume_tier: tier,
    }));
  }

  async function handleSubmit() {
    if (!formData.customer_name.trim()) {
      toast.error('Customer name is required');
      return;
    }

    const tier = VOLUME_TIERS[formData.volume_tier as keyof typeof VOLUME_TIERS];
    const validityStart = new Date();
    const validityEnd = addDays(validityStart, formData.validity_days);

    const commitmentData = {
      customer_name: formData.customer_name,
      customer_email: formData.customer_email || null,
      customer_phone: formData.customer_phone || null,
      customer_type: formData.customer_type,
      commitment_type: formData.commitment_type as 'prepaid' | 'contracted',
      volume_tier: formData.volume_tier as 'tier_a' | 'tier_b' | 'tier_c' | 'tier_d',
      service_count_committed: formData.service_count_committed,
      services_remaining: formData.service_count_committed,
      discount_pct: tier.discountPct,
      validity_start_date: format(validityStart, 'yyyy-MM-dd'),
      validity_end_date: format(validityEnd, 'yyyy-MM-dd'),
      approval_status: 'pending' as const,
      agreement_id: formData.agreement_id || null,
      payment_ref: formData.payment_ref || null,
      notes: formData.notes || null,
    };

    if (editingId) {
      const { error } = await (supabase
        .from('volume_commitments' as any)
        .update({
          ...commitmentData,
          commitment_type: commitmentData.commitment_type,
          volume_tier: commitmentData.volume_tier,
        })
        .eq('id', editingId) as any);

      if (error) {
        toast.error('Failed to update commitment');
        console.error(error);
      } else {
        toast.success('Commitment updated');
        fetchCommitments();
        closeDialog();
      }
    } else {
      const { error } = await (supabase
        .from('volume_commitments' as any)
        .insert({
          ...commitmentData,
          commitment_type: commitmentData.commitment_type,
          volume_tier: commitmentData.volume_tier,
        }) as any);

      if (error) {
        toast.error('Failed to create commitment');
        console.error(error);
      } else {
        toast.success('Commitment created (pending approval)');
        fetchCommitments();
        closeDialog();
      }
    }
  }

  async function handleApprove(id: string) {
    const { data: { user } } = await supabase.auth.getUser();
    
    const { error } = await (supabase
      .from('volume_commitments' as any)
      .update({
        approval_status: 'approved',
        approved_by: user?.id,
        approved_at: new Date().toISOString(),
      })
      .eq('id', id) as any);

    if (error) {
      toast.error('Failed to approve');
      console.error(error);
    } else {
      toast.success('Commitment approved - discount now active');
      fetchCommitments();
    }
  }

  async function handleReject(id: string) {
    const { error } = await (supabase
      .from('volume_commitments' as any)
      .update({ approval_status: 'rejected' })
      .eq('id', id) as any);

    if (error) {
      toast.error('Failed to reject');
      console.error(error);
    } else {
      toast.success('Commitment rejected');
      fetchCommitments();
    }
  }

  async function decrementService(id: string, currentRemaining: number) {
    if (currentRemaining <= 0) {
      toast.error('No services remaining');
      return;
    }

    const { error } = await (supabase
      .from('volume_commitments' as any)
      .update({ services_remaining: currentRemaining - 1 })
      .eq('id', id) as any);

    if (error) {
      toast.error('Failed to update');
      console.error(error);
    } else {
      toast.success('Service consumed');
      fetchCommitments();
    }
  }

  function openEdit(commitment: VolumeCommitment) {
    setEditingId(commitment.id);
    setFormData({
      customer_name: commitment.customer_name,
      customer_email: commitment.customer_email || '',
      customer_phone: commitment.customer_phone || '',
      customer_type: commitment.customer_type,
      commitment_type: commitment.commitment_type,
      volume_tier: commitment.volume_tier,
      service_count_committed: commitment.service_count_committed,
      validity_days: differenceInDays(new Date(commitment.validity_end_date), new Date(commitment.validity_start_date)),
      agreement_id: commitment.agreement_id || '',
      payment_ref: commitment.payment_ref || '',
      notes: commitment.notes || '',
    });
    setDialogOpen(true);
  }

  function closeDialog() {
    setDialogOpen(false);
    setEditingId(null);
    setFormData(initialFormData);
  }

  function getStatusBadge(status: string, endDate: string, remaining: number) {
    const isExpired = isBefore(new Date(endDate), new Date());
    const isExhausted = remaining <= 0;

    if (isExpired || isExhausted) {
      return <Badge variant="secondary" className="bg-muted text-muted-foreground">Inactive</Badge>;
    }

    switch (status) {
      case 'approved':
        return <Badge className="bg-green-500/20 text-green-700 border-green-500/30">Active</Badge>;
      case 'pending':
        return <Badge variant="outline" className="bg-yellow-500/10 text-yellow-700 border-yellow-500/30">Pending</Badge>;
      case 'rejected':
        return <Badge variant="destructive">Rejected</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  }

  function getExpiryWarning(endDate: string) {
    const daysLeft = differenceInDays(new Date(endDate), new Date());
    if (daysLeft <= 0) return <span className="text-destructive text-xs">Expired</span>;
    if (daysLeft <= 7) return <span className="text-yellow-600 text-xs">{daysLeft}d left</span>;
    return null;
  }

  function getRemainingWarning(remaining: number, total: number) {
    if (remaining <= 0) return <span className="text-destructive text-xs">Exhausted</span>;
    if (remaining <= 2) return <span className="text-yellow-600 text-xs">Low</span>;
    return null;
  }

  const filteredCommitments = commitments.filter(c => {
    const matchesSearch = 
      c.customer_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.customer_phone?.includes(searchTerm);
    
    const matchesStatus = statusFilter === 'all' || c.approval_status === statusFilter;
    
    return matchesSearch && matchesStatus;
  });

  const stats = {
    total: commitments.length,
    active: commitments.filter(c => c.approval_status === 'approved' && c.services_remaining > 0).length,
    pending: commitments.filter(c => c.approval_status === 'pending').length,
    totalDiscountValue: commitments
      .filter(c => c.approval_status === 'approved')
      .reduce((sum, c) => sum + (c.discount_pct * 100), 0),
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Volume Commitments</h1>
          <p className="text-muted-foreground">Manage contractor volume discount programs</p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => { setEditingId(null); setFormData(initialFormData); }}>
              <Plus className="w-4 h-4 mr-2" />
              New Commitment
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingId ? 'Edit' : 'Create'} Volume Commitment</DialogTitle>
            </DialogHeader>
            
            <div className="grid gap-4 py-4">
              {/* Customer Info */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Customer Name *</Label>
                  <Input
                    value={formData.customer_name}
                    onChange={e => setFormData(prev => ({ ...prev, customer_name: e.target.value }))}
                    placeholder="Company or contact name"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Customer Type</Label>
                  <Select
                    value={formData.customer_type}
                    onValueChange={v => setFormData(prev => ({ ...prev, customer_type: v }))}
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {CUSTOMER_TYPES.map(t => (
                        <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Email</Label>
                  <Input
                    type="email"
                    value={formData.customer_email}
                    onChange={e => setFormData(prev => ({ ...prev, customer_email: e.target.value }))}
                    placeholder="email@company.com"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Phone</Label>
                  <Input
                    value={formData.customer_phone}
                    onChange={e => setFormData(prev => ({ ...prev, customer_phone: e.target.value }))}
                    placeholder="(510) 555-0100"
                  />
                </div>
              </div>

              {/* Commitment Details */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">Commitment Details</h3>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Commitment Type</Label>
                    <Select
                      value={formData.commitment_type}
                      onValueChange={v => setFormData(prev => ({ ...prev, commitment_type: v }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {COMMITMENT_TYPES.map(t => (
                          <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Services Committed</Label>
                    <Input
                      type="number"
                      min={3}
                      value={formData.service_count_committed}
                      onChange={e => handleServiceCountChange(parseInt(e.target.value) || 3)}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4 mt-4">
                  <div className="space-y-2">
                    <Label>Volume Tier (Auto)</Label>
                    <div className="p-3 bg-muted rounded-lg">
                      <p className="font-medium">
                        {VOLUME_TIERS[formData.volume_tier as keyof typeof VOLUME_TIERS]?.label}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {(VOLUME_TIERS[formData.volume_tier as keyof typeof VOLUME_TIERS]?.discountPct * 100).toFixed(0)}% discount
                      </p>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label>Validity Period</Label>
                    <Select
                      value={formData.validity_days.toString()}
                      onValueChange={v => setFormData(prev => ({ ...prev, validity_days: parseInt(v) }))}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {VALIDITY_PRESETS.map(p => (
                          <SelectItem key={p.days} value={p.days.toString()}>{p.label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>

              {/* References */}
              <div className="border-t pt-4">
                <h3 className="font-semibold mb-3">References</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Agreement ID</Label>
                    <Input
                      value={formData.agreement_id}
                      onChange={e => setFormData(prev => ({ ...prev, agreement_id: e.target.value }))}
                      placeholder="AGR-2026-001"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Payment Reference</Label>
                    <Input
                      value={formData.payment_ref}
                      onChange={e => setFormData(prev => ({ ...prev, payment_ref: e.target.value }))}
                      placeholder="INV-12345"
                    />
                  </div>
                </div>
                <div className="space-y-2 mt-4">
                  <Label>Notes</Label>
                  <Textarea
                    value={formData.notes}
                    onChange={e => setFormData(prev => ({ ...prev, notes: e.target.value }))}
                    placeholder="Internal notes..."
                    rows={3}
                  />
                </div>
              </div>

              {/* Wholesaler Warning */}
              {formData.customer_type === 'wholesaler_broker' && formData.volume_tier !== 'tier_a' && formData.volume_tier !== 'tier_b' && (
                <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3 flex items-start gap-2">
                  <AlertCircle className="w-5 h-5 text-yellow-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-medium text-yellow-700">Manual Approval Required</p>
                    <p className="text-sm text-yellow-600">
                      Wholesaler/broker discounts above 5% require Finance approval.
                    </p>
                  </div>
                </div>
              )}
            </div>

            <DialogFooter>
              <Button variant="outline" onClick={closeDialog}>Cancel</Button>
              <Button onClick={handleSubmit}>
                {editingId ? 'Update' : 'Create'} Commitment
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-4 gap-4">
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Users className="w-5 h-5 text-primary" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.total}</p>
                <p className="text-sm text-muted-foreground">Total Commitments</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-green-500/10 rounded-lg">
                <CheckCircle className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.active}</p>
                <p className="text-sm text-muted-foreground">Active Programs</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-yellow-500/10 rounded-lg">
                <Clock className="w-5 h-5 text-yellow-600" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.pending}</p>
                <p className="text-sm text-muted-foreground">Pending Approval</p>
              </div>
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-6">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-accent/10 rounded-lg">
                <Percent className="w-5 h-5 text-accent-foreground" />
              </div>
              <div>
                <p className="text-2xl font-bold">{stats.totalDiscountValue.toFixed(0)}%</p>
                <p className="text-sm text-muted-foreground">Total Active Discounts</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-4">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by name, email, or phone..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-40">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Table */}
      <Card>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Customer</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Tier</TableHead>
                <TableHead>Discount</TableHead>
                <TableHead>Services</TableHead>
                <TableHead>Validity</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    Loading...
                  </TableCell>
                </TableRow>
              ) : filteredCommitments.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                    No commitments found
                  </TableCell>
                </TableRow>
              ) : (
                filteredCommitments.map(c => (
                  <TableRow key={c.id}>
                    <TableCell>
                      <div>
                        <p className="font-medium">{c.customer_name}</p>
                        <p className="text-sm text-muted-foreground">
                          {c.customer_email || c.customer_phone || '-'}
                        </p>
                      </div>
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline" className="capitalize">
                        {c.customer_type.replace('_', ' ')}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <span className="font-mono text-sm uppercase">{c.volume_tier.replace('_', ' ')}</span>
                    </TableCell>
                    <TableCell>
                      <span className="font-semibold text-primary">
                        {(c.discount_pct * 100).toFixed(0)}%
                      </span>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <span>{c.services_remaining}/{c.service_count_committed}</span>
                        {getRemainingWarning(c.services_remaining, c.service_count_committed)}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="text-sm">
                          {format(new Date(c.validity_start_date), 'MMM d')} - {format(new Date(c.validity_end_date), 'MMM d, yyyy')}
                        </span>
                        {getExpiryWarning(c.validity_end_date)}
                      </div>
                    </TableCell>
                    <TableCell>
                      {getStatusBadge(c.approval_status, c.validity_end_date, c.services_remaining)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-1">
                        {c.approval_status === 'pending' && (
                          <>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-green-600 hover:text-green-700 hover:bg-green-50"
                              onClick={() => handleApprove(c.id)}
                            >
                              <CheckCircle className="w-4 h-4" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              className="text-destructive hover:text-destructive hover:bg-destructive/10"
                              onClick={() => handleReject(c.id)}
                            >
                              <XCircle className="w-4 h-4" />
                            </Button>
                          </>
                        )}
                        {c.approval_status === 'approved' && c.services_remaining > 0 && (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => decrementService(c.id, c.services_remaining)}
                          >
                            Use Service
                          </Button>
                        )}
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => openEdit(c)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
