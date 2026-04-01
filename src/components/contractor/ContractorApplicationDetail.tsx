/**
 * Contractor Application Detail — Full review/approval/conversion UI
 * Supports: approve, decline, request info, qualify, convert to new customer, link to existing customer
 */
import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogTrigger } from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  CheckCircle2, XCircle, MessageSquare, UserPlus, Link2,
  FileText, HardHat, Loader2, AlertTriangle, Star, ShieldCheck
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useNavigate } from 'react-router-dom';

const STATUS_LABELS: Record<string, { label: string; color: string }> = {
  submitted: { label: 'Submitted', color: 'bg-blue-100 text-blue-800' },
  under_review: { label: 'Under Review', color: 'bg-amber-100 text-amber-800' },
  waiting_on_info: { label: 'Waiting on Info', color: 'bg-orange-100 text-orange-800' },
  qualified: { label: 'Qualified', color: 'bg-cyan-100 text-cyan-800' },
  pricing_review: { label: 'Pricing Review', color: 'bg-purple-100 text-purple-800' },
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
  const [showLinkExisting, setShowLinkExisting] = useState(false);
  const [existingCustomers, setExistingCustomers] = useState<any[]>([]);
  const [selectedCustomerId, setSelectedCustomerId] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();
  const navigate = useNavigate();

  const loadApplication = useCallback(async () => {
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
  }, [applicationId]);

  useEffect(() => { loadApplication(); }, [loadApplication]);

  async function updateStatus(status: string, extra: Record<string, any> = {}) {
    setActionLoading(true);
    try {
      const { error } = await supabase
        .from('contractor_applications')
        .update({ status, review_notes: notes, reviewed_at: new Date().toISOString(), ...extra } as any)
        .eq('id', applicationId);
      if (error) throw error;
      toast({ title: `Application ${status.replace(/_/g, ' ')}` });
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

  async function checkAndConvert() {
    setActionLoading(true);
    try {
      // Check for existing customer match
      const { data: matches } = await supabase
        .from('customers')
        .select('id, company_name, contact_name, billing_email, phone')
        .or(`billing_email.eq.${app.email},phone.eq.${app.phone}`)
        .limit(5);

      if (matches && matches.length > 0) {
        setExistingCustomers(matches);
        setShowConvert(false);
        setShowLinkExisting(true);
        setActionLoading(false);
        return;
      }

      await createNewCustomer();
    } catch (err) {
      console.error(err);
      toast({ title: 'Conversion failed', variant: 'destructive' });
      setActionLoading(false);
    }
  }

  async function createNewCustomer() {
    setActionLoading(true);
    try {
      const tierDiscount = app.approved_discount_percent || TIER_OPTIONS.find(t => t.value === (app.pricing_tier || 'CONTRACTOR_TIER_1'))?.discount || 5;

      // Create customer
      const { data: customer, error } = await supabase
        .from('customers')
        .insert({
          company_name: app.legal_business_name || app.company_name,
          contact_name: app.contact_name,
          phone: app.phone,
          billing_email: app.email,
          billing_phone: app.phone,
          billing_address: [app.business_address, app.city, app.state, app.zip].filter(Boolean).join(', '),
          customer_type: 'contractor',
          is_contractor_account: true,
          contractor_type: app.contractor_type,
          contractor_application_id: app.id,
          contractor_tier: app.pricing_tier || 'CONTRACTOR_TIER_1',
          discount_pct: tierDiscount,
          service_line_permissions: app.service_line_interest || 'DUMPSTER',
          net_terms_approved: app.need_net_terms || false,
          documents_status: getDocsCount() > 0 ? 'uploaded' : 'incomplete',
          activation_status: 'active',
          is_active: true,
          commercial_account_status: 'active',
        } as any)
        .select('id')
        .single();

      if (error) throw error;

      // Create contractor_accounts profile
      await supabase.from('contractor_accounts').insert({
        company_name: app.legal_business_name || app.company_name,
        customer_id: customer.id,
        application_id: app.id,
        contact_name: app.contact_name,
        contact_email: app.email,
        contact_phone: app.phone,
        pricing_tier: app.pricing_tier || 'CONTRACTOR_TIER_1',
        is_approved: true,
        is_active: true,
        approved_at: new Date().toISOString(),
        common_materials: app.common_materials || [],
        monthly_volume_estimate: parseInt(app.monthly_dumpster_usage_estimate?.replace(/[^\d]/g, '') || '0') || null,
        service_line_permissions: app.service_line_interest || 'DUMPSTER',
        recurring_service_flag: app.recurring_service_interest || false,
        required_dump_sites: app.required_dump_sites,
        monthly_cleanup_estimate: app.monthly_cleanup_usage_estimate,
        preferred_cleanup_frequency: app.preferred_cleanup_frequency,
        years_in_business: app.years_in_business,
        active_projects_count: app.current_active_projects,
        contractor_type: app.contractor_type,
        documents_status: getDocsCount() > 0 ? 'uploaded' : 'incomplete',
      } as any);

      // Link application
      await supabase
        .from('contractor_applications')
        .update({ status: 'converted', customer_id: customer.id, converted_at: new Date().toISOString() } as any)
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

  async function handleLinkToExisting() {
    if (!selectedCustomerId) return;
    setActionLoading(true);
    try {
      const tierDiscount = app.approved_discount_percent || 5;

      // Update existing customer with contractor fields
      await supabase
        .from('customers')
        .update({
          is_contractor_account: true,
          contractor_type: app.contractor_type,
          contractor_application_id: app.id,
          contractor_tier: app.pricing_tier || 'CONTRACTOR_TIER_1',
          discount_pct: tierDiscount,
          service_line_permissions: app.service_line_interest || 'DUMPSTER',
          net_terms_approved: app.need_net_terms || false,
          customer_type: 'contractor',
        } as any)
        .eq('id', selectedCustomerId);

      // Create contractor_accounts profile
      await supabase.from('contractor_accounts').insert({
        company_name: app.legal_business_name || app.company_name,
        customer_id: selectedCustomerId,
        application_id: app.id,
        contact_name: app.contact_name,
        contact_email: app.email,
        contact_phone: app.phone,
        pricing_tier: app.pricing_tier || 'CONTRACTOR_TIER_1',
        is_approved: true,
        is_active: true,
        approved_at: new Date().toISOString(),
        common_materials: app.common_materials || [],
        service_line_permissions: app.service_line_interest || 'DUMPSTER',
        recurring_service_flag: app.recurring_service_interest || false,
        contractor_type: app.contractor_type,
      } as any);

      // Link application
      await supabase
        .from('contractor_applications')
        .update({ status: 'converted', customer_id: selectedCustomerId, converted_at: new Date().toISOString() } as any)
        .eq('id', applicationId);

      toast({ title: 'Linked to existing customer!' });
      setShowLinkExisting(false);
      loadApplication();
      onUpdated?.();
      navigate(`/admin/customers/${selectedCustomerId}`);
    } catch (err) {
      console.error(err);
      toast({ title: 'Link failed', variant: 'destructive' });
    } finally {
      setActionLoading(false);
    }
  }

  async function searchExistingCustomers(query: string) {
    setSearchQuery(query);
    if (query.length < 2) { setExistingCustomers([]); return; }
    const { data } = await supabase
      .from('customers')
      .select('id, company_name, contact_name, billing_email, phone')
      .or(`company_name.ilike.%${query}%,contact_name.ilike.%${query}%,billing_email.ilike.%${query}%,phone.ilike.%${query}%`)
      .limit(10);
    setExistingCustomers(data || []);
  }

  function getDocsCount() {
    if (!app?.docs_uploaded_json) return 0;
    return Array.isArray(app.docs_uploaded_json) ? app.docs_uploaded_json.length : Object.keys(app.docs_uploaded_json).length;
  }

  function getScoreRecommendation() {
    const score = app?.contractor_fit_score ?? 0;
    if (score >= 60) return { label: 'Approve', color: 'text-green-600', icon: CheckCircle2 };
    if (score >= 35) return { label: 'Needs Review', color: 'text-amber-600', icon: AlertTriangle };
    return { label: 'Consider Declining', color: 'text-red-600', icon: XCircle };
  }

  if (loading) {
    return <div className="flex items-center justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  if (!app) {
    return <p className="text-center text-muted-foreground py-8">Application not found</p>;
  }

  const statusCfg = STATUS_LABELS[app.status] || STATUS_LABELS.pending;
  const docsCount = getDocsCount();
  const recommendation = getScoreRecommendation();
  const RecommendIcon = recommendation.icon;

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
        <div className="flex items-center gap-2">
          <Badge className={statusCfg.color}>{statusCfg.label}</Badge>
          {app.contractor_fit_score != null && (
            <div className={`flex items-center gap-1 text-xs ${recommendation.color}`}>
              <RecommendIcon className="w-3.5 h-3.5" />
              <span>{recommendation.label} ({app.contractor_fit_score}/100)</span>
            </div>
          )}
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-3">
        {[
          { label: 'Type', value: app.contractor_type || '—' },
          { label: 'Service Interest', value: app.service_line_interest || '—' },
          { label: 'Fit Score', value: app.contractor_fit_score != null ? `${app.contractor_fit_score}/100` : '—' },
          { label: 'Docs', value: docsCount > 0 ? `${docsCount} uploaded` : 'None' },
          { label: 'Active Projects', value: app.current_active_projects ?? '—' },
        ].map(s => (
          <Card key={s.label}>
            <CardContent className="pt-3 pb-2 px-3">
              <p className="text-[10px] text-muted-foreground uppercase">{s.label}</p>
              <p className="text-sm font-semibold">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Actions Bar */}
      {!['converted', 'declined'].includes(app.status) && (
        <Card>
          <CardContent className="pt-4 pb-3">
            <div className="flex flex-wrap gap-2">
              {/* Qualify */}
              {['submitted', 'under_review', 'waiting_on_info'].includes(app.status) && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus('qualified')} disabled={actionLoading}>
                  <ShieldCheck className="w-3.5 h-3.5" /> Qualify
                </Button>
              )}

              {/* Mark Under Review */}
              {app.status === 'submitted' && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus('under_review')} disabled={actionLoading}>
                  <Star className="w-3.5 h-3.5" /> Start Review
                </Button>
              )}

              {/* Move to Pricing Review */}
              {['qualified', 'under_review'].includes(app.status) && (
                <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus('pricing_review')} disabled={actionLoading}>
                  Pricing Review
                </Button>
              )}

              {/* Approve */}
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

              {/* Request Info */}
              <Button size="sm" variant="outline" className="gap-1" onClick={() => updateStatus('waiting_on_info')} disabled={actionLoading}>
                <MessageSquare className="w-3.5 h-3.5" /> Request Info
              </Button>

              {/* Decline */}
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
                <p className="text-xs text-muted-foreground">Create a new customer or link to existing</p>
              </div>
              <div className="flex gap-2">
                <Dialog open={showConvert} onOpenChange={setShowConvert}>
                  <DialogTrigger asChild>
                    <Button size="sm" className="gap-1"><UserPlus className="w-3.5 h-3.5" /> New Customer</Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader><DialogTitle>Convert to New Customer</DialogTitle></DialogHeader>
                    <div className="text-sm text-muted-foreground space-y-2 py-2">
                      <p>This will create a new customer record with:</p>
                      <ul className="list-disc pl-4 space-y-1 text-xs">
                        <li>Company: <strong>{app.legal_business_name || app.company_name}</strong></li>
                        <li>Contact: <strong>{app.contact_name}</strong></li>
                        <li>Tier: <strong>{app.pricing_tier || 'CONTRACTOR_TIER_1'}</strong></li>
                        <li>Discount: <strong>{app.approved_discount_percent || 5}%</strong></li>
                        <li>Service: <strong>{app.service_line_interest || 'DUMPSTER'}</strong></li>
                      </ul>
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowConvert(false)}>Cancel</Button>
                      <Button onClick={createNewCustomer} disabled={actionLoading}>
                        {actionLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Create Customer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>

                <Dialog open={showLinkExisting} onOpenChange={setShowLinkExisting}>
                  <DialogTrigger asChild>
                    <Button size="sm" variant="outline" className="gap-1"><Link2 className="w-3.5 h-3.5" /> Link Existing</Button>
                  </DialogTrigger>
                  <DialogContent className="max-w-md">
                    <DialogHeader><DialogTitle>Link to Existing Customer</DialogTitle></DialogHeader>
                    <div className="space-y-3 py-2">
                      <div>
                        <Label className="text-xs">Search Customers</Label>
                        <Input
                          value={searchQuery}
                          onChange={e => searchExistingCustomers(e.target.value)}
                          placeholder="Search by name, email, or phone..."
                        />
                      </div>
                      {existingCustomers.length > 0 && (
                        <div className="max-h-48 overflow-auto space-y-1">
                          {existingCustomers.map(c => (
                            <div
                              key={c.id}
                              className={`p-2 rounded cursor-pointer text-sm border transition-colors ${
                                selectedCustomerId === c.id ? 'bg-primary/10 border-primary' : 'hover:bg-muted'
                              }`}
                              onClick={() => setSelectedCustomerId(c.id)}
                            >
                              <p className="font-medium">{c.company_name || c.contact_name}</p>
                              <p className="text-xs text-muted-foreground">{c.billing_email} · {c.phone}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <DialogFooter>
                      <Button variant="outline" onClick={() => setShowLinkExisting(false)}>Cancel</Button>
                      <Button onClick={handleLinkToExisting} disabled={actionLoading || !selectedCustomerId}>
                        {actionLoading && <Loader2 className="w-4 h-4 mr-1 animate-spin" />} Link Customer
                      </Button>
                    </DialogFooter>
                  </DialogContent>
                </Dialog>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Converted Customer Link */}
      {app.customer_id && (
        <Card className="border-emerald-200 bg-emerald-50/50">
          <CardContent className="pt-3 pb-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span className="text-sm font-medium">Converted to Customer</span>
                {app.converted_at && <span className="text-xs text-muted-foreground">{new Date(app.converted_at).toLocaleDateString()}</span>}
              </div>
              <Button size="sm" variant="outline" onClick={() => navigate(`/admin/customers/${app.customer_id}`)}>
                Open Customer 360
              </Button>
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
            { label: 'Years in Business', value: app.years_in_business },
            { label: 'Insured', value: app.is_insured ? 'Yes' : 'No' },
            { label: 'Service Area', value: app.service_area },
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
            { label: 'Avg Project Size', value: app.average_project_size },
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
            { label: 'Typical Project Type', value: app.typical_project_type },
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
          <div className="text-xs text-muted-foreground mt-2">
            <p className="font-medium mb-1">Non-Discountable Items:</p>
            <div className="flex flex-wrap gap-1">
              {['Disposal Pass-Through', 'Customer Dump Site', 'Green Halo', 'Rebar', 'Permits', 'Tolls', 'Rush/Same-Day', 'Dry Run', 'Contamination'].map(item => (
                <Badge key={item} variant="outline" className="text-[9px]">{item}</Badge>
              ))}
            </div>
          </div>
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
