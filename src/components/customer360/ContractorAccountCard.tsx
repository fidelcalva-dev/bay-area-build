/**
 * ContractorAccountCard — Displays contractor account status, tier, and application history
 * within Customer 360 Overview tab.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { HardHat, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const TIER_LABELS: Record<string, string> = {
  RETAIL: 'Retail (0%)',
  CONTRACTOR_TIER_1: 'Tier 1 (5%)',
  CONTRACTOR_TIER_2: 'Tier 2 (8%)',
  COMMERCIAL_ACCOUNT: 'Commercial (10%)',
  MANUAL_RATE_CARD: 'Custom',
};

interface Props {
  customerId: string;
  customer: any;
}

export function ContractorAccountCard({ customerId, customer }: Props) {
  const [application, setApplication] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      // Look for linked contractor application
      const appId = customer.contractor_application_id;
      if (appId) {
        const { data } = await supabase
          .from('contractor_applications')
          .select('*')
          .eq('id', appId)
          .single();
        if (data) setApplication(data);
      } else {
        // Try matching by email/phone
        const { data } = await supabase
          .from('contractor_applications')
          .select('*')
          .or(`email.eq.${customer.billing_email},phone.eq.${customer.phone}`)
          .order('created_at', { ascending: false })
          .limit(1);
        if (data?.[0]) setApplication(data[0]);
      }
      setLoading(false);
    }
    load();
  }, [customerId, customer]);

  if (!customer.is_contractor_account && !application) return null;

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <HardHat className="w-4 h-4" />
          Contractor Account
          {customer.is_contractor_account && (
            <Badge className="ml-auto bg-emerald-100 text-emerald-800 text-[10px]">Active</Badge>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />
        ) : (
          <>
            <div className="grid grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Type</p>
                <p className="font-medium">{customer.contractor_type || application?.contractor_type || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Tier / Discount</p>
                <p className="font-medium">
                  {TIER_LABELS[customer.contractor_tier] || customer.contractor_tier || '—'}
                  {customer.discount_pct > 0 && <span className="text-primary ml-1">({customer.discount_pct}%)</span>}
                </p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Service Lines</p>
                <p className="font-medium">{customer.service_line_permissions || application?.service_line_interest || '—'}</p>
              </div>
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Net Terms</p>
                <p className="font-medium">{customer.net_terms_approved ? 'Approved' : 'No'}</p>
              </div>
              {application && (
                <>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Recurring Interest</p>
                    <p className="font-medium">{application.recurring_service_interest ? 'Yes' : 'No'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Active Projects</p>
                    <p className="font-medium">{application.current_active_projects || '—'}</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Fit Score</p>
                    <p className="font-medium">{application.contractor_fit_score || '—'}/100</p>
                  </div>
                  <div>
                    <p className="text-[10px] text-muted-foreground uppercase">Application</p>
                    <p className="font-medium capitalize">{application.status}</p>
                  </div>
                </>
              )}
              <div>
                <p className="text-[10px] text-muted-foreground uppercase">Docs Status</p>
                <p className="font-medium capitalize">{customer.documents_status || 'Unknown'}</p>
              </div>
            </div>

            <div className="flex flex-wrap gap-2 pt-1">
              {application && (
                <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => navigate(`/sales/leads?view=contractor-board`)}>
                  <FileText className="w-3 h-3" /> View Application
                </Button>
              )}
              <Button variant="outline" size="sm" className="gap-1 text-xs" onClick={() => navigate(`/sales/quotes/new?customer_id=${customerId}`)}>
                Create Quote
              </Button>
            </div>
          </>
        )}
      </CardContent>
    </Card>
  );
}
