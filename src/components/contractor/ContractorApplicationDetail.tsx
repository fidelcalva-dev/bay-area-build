/**
 * Contractor Application Detail — Full review/approval UI
 * Used inside Lead Detail or standalone route
 */
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2, XCircle, MessageSquare, UserPlus,
  FileText, HardHat, Loader2, AlertTriangle
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-800' },
  waiting_on_info: { label: 'Waiting on Info', color: 'bg-orange-100 text-orange-800' },
  approved: { label: 'Approved', color: 'bg-green-100 text-green-800' },
  declined: { label: 'Declined', color: 'bg-red-100 text-red-800' },
  converted: { label: 'Converted', color: 'bg-emerald-100 text-emerald-800' },
  pending: { label: 'Pending', color: 'bg-gray-100 text-gray-800' },
};

const TIER_OPTIONS = [
  { value: 'RETAIL', label: 'Retail (0%)', discount: 0 },
  { value: 'CONTRACTOR_TIER_1', label: 'Contractor Tier 1 (5%)', discount: 5 },
  { value: 'CONTRACTOR_TIER_2', label: 'Contractor Tier 2 (8%)', discount: 8 },
  { value: 'COMMERCIAL_ACCOUNT', label: 'Commercial Account (10%)', discount: 10 },
  { value: 'MANUAL_RATE_CARD', label: 'Custom / Manual', discount: 0 },
];

interface Props {
  applicationId: string;
  onUpdated?: () => void;
}

export function ContractorApplicationDetail({ applicationId, onUpdated }: Props) {
  const [app, setApp] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [notes, setNotes] = useState('');
  const [declineReason, setDeclineReason] = useState('');
  const [selectedTier, setSelectedTier] = useState('CONTRACTOR_TIER_1');
  const [customDiscount, setCustomDiscount] = useState('');
  const [showApprove, setShowApprove] = useState(false);
  const [showDecline, setShowDecline] = useState(false);
  const [showConvert, setShowConvert] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    loadApplication();
  }, [applicationId]);

  async function loadApplication() {
    setLoading(true);
    const { data, error } = await supabase
      .from('contractor_applications')
      .select('*')
      .eq('id', applicationId)
      .single();
    if (!error && data) {
      setApp(data);
      setNotes(data.review_notes || '');
    }
    setLoading(false);
  }

  async function updateStatus(status: string, extra: Record<string, any> = {}) {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('contractor_applications')
        .update({ status, review_notes: notes, reviewed_at: new Date().toISOString(), ...extra } as any)
        .eq('id', applicationId);
      if (error) throw error;
      toast({ title: `Application ${status}` });
      loadApplication();
      onUpdated?.();
    } catch {
      toast({ title: 'Update failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  }

  async function handleApprove() {
    const tierInfo = TIER_OPTIONS.find(t => t.value === selectedTier);
    const discount = selectedTier === 'MANUAL_RATE_CARD' ? parseFloat(customDiscount) || 0 : tierInfo?.discount || 0;
    await updateStatus('approved', {
      pricing_tier: selectedTier,
      pricing_tier_recommendation: selectedTier,
      approved_discount_percent: discount,
    });
    setShowApprove(false);
  }

  async function handleDecline() {
    await updateStatus('declined', { declined_reason: declineReason });
    setShowDecline(false);
  }

  async function handleRequestInfo() {
    await updateStatus('waiting_on_info');
  }

  async function handleConvertToCustomer() {
    setActionLoading(true);
    try {
      // Create customer record
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          company_name: app.legal_business_name || app.company_name,
          contact_name: app.contact_name,
          phone: app.phone,
          billing_email: app.email,
          billing_phone: app.phone,
          billing_address: `${app.business_address || ''}, ${app.city || ''}, ${app.state || ''} ${app.zip || ''}`.trim(),
          customer_type: 'contractor',
          is_contractor_account: true,
          contractor_type: app.contractor_type,
          contractor_application_id: app.id,
          contractor_tier: app.pricing_tier || 'CONTRACTOR_TIER_1',
          discount_pct: app.approved_discount_percent || 5,
          service_line_permissions: app.service_line_interest || 'DUMPSTER',
          net_terms_approved: app.need_net_terms || false,
          documents_status: (app.docs_uploaded_json && Object.keys(app.docs_uploaded_json).length > 0) ? 'uploaded' : 'incomplete',
          activation_status: 'active',
          is_active: true,
          commercial_account_status: 'active',
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      // Link application to customer
      await supabase
        .from('contractor_applications')
        .update({
          status: 'converted',
          customer_id: customer.id,
          converted_at: new Date().toISOString(),
        } as any)
        .eq('id', applicationId);

      toast({ title: 'Contractor converted to customer!' });
      setShowConvert(false);
      loadApplication();
      onUpdated?.();
      navigate(`/admin/customers/${customer.id}`);
    } catch (err) {
      console.error(err);
      toast({ title: 'Conversion failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!app) {
    return <p className="text-center text-muted-foreground py-8">Application not found</p>;
  }

  const statusCfg = STATUS_LABELS[app.status] || STATUS_LABELS.pending;
  const docsCount = app.docs_uploaded_json ? (Array.isArray(app.docs_uploaded_json) ? app.docs_uploaded_json.length : Object.keys(app.docs_uploaded_json).length) : 0;

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div>
          <h2 className="text-lg font-bold flex items-center gap-2">
            <HardHat className="w-5 h-5" />
            {app.legal_business_name || app.company_name}
          </h2>
          <p className="text-sm text-muted-foreground">{app.contact_name} · {app.email} · {app.phone}</p>
        </div>
        <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {[
          { label: 'Type', value: app.contractor_type || '—' },
          { label: 'Service Interest', value: app.service_line_interest || '—' },
          { label: 'Fit Score', value: app.contractor_fit_score != null ? `${app.contractor_fit_score}/100` : '—' },
          { label: 'Docs', value: docsCount > 0 ? `${docsCount} uploaded` : 'None' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-2 px-3">
              <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
              <p className="text-sm font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions */}
      {!['converted', 'declined'].includes(app.status) && (
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-wrap gap-2">
              <Dialog open={showApprove} onOpenChange={setShowApprove}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1"><CheckCircle2 className="w-3.5 h-3.5" /> Approve</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Approve Contractor Application</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    <div>
                      <Label className="text-xs">Pricing Tier</Label>
                      <Select value={selectedTier} onValueChange={setSelectedTier}>
                        <SelectTrigger><SelectValue /></SelectTrigger>
                        <SelectContent>
                          {TIER_OPTIONS.map(t => <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    {selectedTier === 'MANUAL_RATE_CARD' && (
                      <div>
                        <Label className="text-xs">Custom Discount %</Label>
                        <Input type="number" value={customDiscount} onChange={e => setCustomDiscount(e.target.value)} placeholder="e.g., 7" />
                      </div>
                    )}
                    <div>
                      <Label className="text-xs">Notes</Label>
                      <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={2} />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowApprove(false)}>Cancel</Button>
                    <Button onClick={handleApprove} disabled={actionLoading}>
                      {actionLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Approve
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Button size="sm" variant="outline" className="gap-1" onClick={handleRequestInfo} disabled={actionLoading}>
                <MessageSquare className="w-3.5 h-3.5" /> Request Info
              </Button>

              <Dialog open={showDecline} onOpenChange={setShowDecline}>
                <DialogTrigger asChild>
                  <Button size="sm" variant="destructive" className="gap-1"><XCircle className="w-3.5 h-3.5" /> Decline</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Decline Application</DialogTitle></DialogHeader>
                  <div className="space-y-3 py-2">
                    <div>
                      <Label className="text-xs">Reason</Label>
                      <Textarea value={declineReason} onChange={e => setDeclineReason(e.target.value)} rows={3} placeholder="Reason for declining..." />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowDecline(false)}>Cancel</Button>
                    <Button variant="destructive" onClick={handleDecline} disabled={actionLoading}>Decline</Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Convert to Customer (approved only) */}
      {app.status === 'approved' && !app.customer_id && (
        <Card className="border-primary/30 bg-primary/5">
          <CardContent className="pt-4 pb-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div>
                <p className="font-semibold text-sm">Ready to convert</p>
                <p className="text-xs text-muted-foreground">Create a customer record for this approved contractor</p>
              </div>
              <Dialog open={showConvert} onOpenChange={setShowConvert}>
                <DialogTrigger asChild>
                  <Button size="sm" className="gap-1"><UserPlus className="w-3.5 h-3.5" /> Convert to Customer</Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader><DialogTitle>Convert to Customer</DialogTitle></DialogHeader>
                  <p className="text-sm text-muted-foreground">
                    This will create a new customer record with contractor account settings, tier <strong>{app.pricing_tier || 'CONTRACTOR_TIER_1'}</strong> and
                    discount <strong>{app.approved_discount_percent || 5}%</strong>.
                  </p>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setShowConvert(false)}>Cancel</Button>
                    <Button onClick={handleConvertToCustomer} disabled={actionLoading}>
                      {actionLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Create Customer
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tabs */}
      <Tabs defaultValue="overview">
        <TabsList className="flex flex-wrap">
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="company">Company</TabsTrigger>
          <TabsTrigger value="services">Services</TabsTrigger>
          <TabsTrigger value="documents">Docs</TabsTrigger>
          <TabsTrigger value="pricing">Pricing</TabsTrigger>
          <TabsTrigger value="notes">Notes</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="mt-3 space-y-3">
          <DetailGrid items={[
            { label: 'Company', value: app.legal_business_name || app.company_name },
            { label: 'DBA', value: app.dba_name },
            { label: 'Contact', value: app.contact_name },
            { label: 'Role', value: app.role_title },
            { label: 'Phone', value: app.phone },
            { label: 'Email', value: app.email },
            { label: 'Type', value: app.contractor_type },
            { label: 'Service Interest', value: app.service_line_interest },
            { label: 'Recurring', value: app.recurring_service_interest ? 'Yes' : 'No' },
            { label: 'Active Projects', value: app.current_active_projects },
            { label: 'Fit Score', value: app.contractor_fit_score },
            { label: 'Submitted', value: app.created_at ? new Date(app.created_at).toLocaleDateString() : '—' },
          ]} />
        </TabsContent>

        <TabsContent value="company" className="mt-3 space-y-3">
          <DetailGrid items={[
            { label: 'Legal Name', value: app.legal_business_name },
            { label: 'DBA', value: app.dba_name },
            { label: 'Website', value: app.website },
            { label: 'Address', value: app.business_address },
            { label: 'City', value: app.city },
            { label: 'State', value: app.state },
            { label: 'ZIP', value: app.zip },
            { label: 'License #', value: app.license_number },
            { label: 'Insured', value: app.is_insured ? 'Yes' : 'No' },
            { label: 'Years in Business', value: app.years_in_business },
          ]} />
        </TabsContent>

        <TabsContent value="services" className="mt-3 space-y-3">
          <DetailGrid items={[
            { label: 'Service Line', value: app.service_line_interest },
            { label: 'Dumpster Usage/mo', value: app.monthly_dumpster_usage_estimate },
            { label: 'Cleanup Usage/mo', value: app.monthly_cleanup_usage_estimate },
            { label: 'Recurring', value: app.recurring_service_interest ? 'Yes' : 'No' },
            { label: 'Cleanup Frequency', value: app.preferred_cleanup_frequency },
            { label: 'Priority Service', value: app.need_priority_service ? 'Yes' : 'No' },
            { label: 'Net Terms', value: app.need_net_terms ? 'Yes' : 'No' },
            { label: 'Service Area', value: app.service_area },
            { label: 'Required Dump Sites', value: app.required_dump_sites },
          ]} />
          {app.common_dumpster_sizes?.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Dumpster Sizes</Label>
              <div className="flex flex-wrap gap-1 mt-1">{app.common_dumpster_sizes.map((s: string) => <Badge key={s} variant="outline" className="text-[10px]">{s}</Badge>)}</div>
            </div>
          )}
          {app.common_materials?.length > 0 && (
            <div>
              <Label className="text-xs text-muted-foreground">Materials</Label>
              <div className="flex flex-wrap gap-1 mt-1">{app.common_materials.map((m: string) => <Badge key={m} variant="outline" className="text-[10px]">{m}</Badge>)}</div>
            </div>
          )}
        </TabsContent>

        <TabsContent value="documents" className="mt-3">
          {docsCount > 0 ? (
            <div className="space-y-2">
              {(Array.isArray(app.docs_uploaded_json) ? app.docs_uploaded_json : []).map((doc: any, i: number) => (
                <div key={i} className="flex items-center gap-2 text-sm border rounded px-3 py-2">
                  <FileText className="w-4 h-4 text-muted-foreground" />
                  <span className="flex-1">{doc.name || 'Document'}</span>
                  <Badge variant="secondary" className="text-[10px]">{doc.category || 'file'}</Badge>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-6 justify-center">
              <AlertTriangle className="w-4 h-4" />
              No documents uploaded
            </div>
          )}
        </TabsContent>

        <TabsContent value="pricing" className="mt-3 space-y-3">
          <DetailGrid items={[
            { label: 'Recommended Tier', value: app.pricing_tier_recommendation },
            { label: 'Assigned Tier', value: app.pricing_tier },
            { label: 'Approved Discount', value: app.approved_discount_percent ? `${app.approved_discount_percent}%` : '—' },
            { label: 'Approved By', value: app.approved_by_user_id || '—' },
            { label: 'Reviewed At', value: app.reviewed_at ? new Date(app.reviewed_at).toLocaleDateString() : '—' },
          ]} />
        </TabsContent>

        <TabsContent value="notes" className="mt-3 space-y-3">
          <div>
            <Label className="text-xs">Review Notes</Label>
            <Textarea value={notes} onChange={e => setNotes(e.target.value)} rows={4} />
            <Button size="sm" className="mt-2" onClick={() => updateStatus(app.status, { review_notes: notes })} disabled={actionLoading}>
              Save Notes
            </Button>
          </div>
          {app.declined_reason && (
            <div className="bg-destructive/10 rounded p-3">
              <Label className="text-xs text-destructive">Decline Reason</Label>
              <p className="text-sm mt-1">{app.declined_reason}</p>
            </div>
          )}
          {app.notes && (
            <div>
              <Label className="text-xs text-muted-foreground">Applicant Notes</Label>
              <p className="text-sm mt-1">{app.notes}</p>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  );
}

function DetailGrid({ items }: { items: { label: string; value?: any }[] }) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 gap-x-4 gap-y-2 text-sm">
      {items.filter(i => i.value != null && i.value !== '' && i.value !== '—').map(i => (
        <div key={i.label}>
          <p className="text-[10px] text-muted-foreground uppercase">{i.label}</p>
          <p className="font-medium">{String(i.value)}</p>
        </div>
      ))}
    </div>
  );
}
