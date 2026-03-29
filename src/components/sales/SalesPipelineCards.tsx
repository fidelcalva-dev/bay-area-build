/**
 * SalesPipelineCards — Pipeline section cards for the Sales Dashboard.
 * Shows Hot Leads, Stale Leads, Quotes Pending, Contracts Pending, Follow-Ups Due, Payment Pending.
 */
import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import {
  Zap, Clock, FileText, Send, DollarSign, Phone,
  MessageSquare, ArrowRight, Loader2, AlertTriangle,
  ScrollText, CreditCard, Truck
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface PipelineLead {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  lead_status: string;
  lead_quality_label: string | null;
  lead_priority: string | null;
  source_key: string | null;
  created_at: string;
  last_contacted_at: string | null;
  city: string | null;
  zip: string | null;
  same_day: boolean | null;
}

interface PipelineQuote {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  status: string;
  subtotal: number | null;
  created_at: string;
  material_type: string | null;
}

interface PipelineContract {
  id: string;
  customer_name: string;
  status: string;
  quote_id: string;
  sent_at: string | null;
  created_at: string;
}

interface PipelinePayment {
  id: string;
  amount: number;
  status: string;
  customer_id: string;
  created_at: string;
}

export function SalesPipelineCards() {
  const [hotLeads, setHotLeads] = useState<PipelineLead[]>([]);
  const [staleLeads, setStaleLeads] = useState<PipelineLead[]>([]);
  const [pendingQuotes, setPendingQuotes] = useState<PipelineQuote[]>([]);
  const [pendingContracts, setPendingContracts] = useState<PipelineContract[]>([]);
  const [pendingPayments, setPendingPayments] = useState<PipelinePayment[]>([]);
  const [followUps, setFollowUps] = useState<PipelineLead[]>([]);
  const [readyForDispatch, setReadyForDispatch] = useState<PipelineQuote[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPipeline();
  }, []);

  async function fetchPipeline() {
    setLoading(true);
    const now = new Date();
    const twoHoursAgo = new Date(now.getTime() - 2 * 60 * 60 * 1000).toISOString();
    const twentyFourHoursAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000).toISOString();

    const [hotRes, staleRes, quotesRes, followUpRes, contractsRes, paymentsRes] = await Promise.all([
      supabase.from('sales_leads')
        .select('id, customer_name, customer_phone, lead_status, lead_quality_label, lead_priority, source_key, created_at, last_contacted_at, city, zip, same_day')
        .eq('lead_status', 'new')
        .gte('created_at', twoHoursAgo)
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('sales_leads')
        .select('id, customer_name, customer_phone, lead_status, lead_quality_label, lead_priority, source_key, created_at, last_contacted_at, city, zip, same_day')
        .in('lead_status', ['new', 'contacted'])
        .lt('created_at', twentyFourHoursAgo)
        .order('created_at', { ascending: true })
        .limit(10),
      supabase.from('quotes')
        .select('id, customer_name, customer_phone, status, subtotal, created_at, material_type')
        .eq('status', 'saved')
        .order('created_at', { ascending: false })
        .limit(10),
      supabase.from('sales_leads')
        .select('id, customer_name, customer_phone, lead_status, lead_quality_label, lead_priority, source_key, created_at, last_contacted_at, city, zip, same_day')
        .eq('lead_status', 'contacted')
        .not('last_contacted_at', 'is', null)
        .order('last_contacted_at', { ascending: true })
        .limit(10),
      // Contracts pending signature
      supabase.from('quote_contracts')
        .select('id, customer_name, status, quote_id, sent_at, created_at')
        .eq('status', 'pending')
        .order('created_at', { ascending: false })
        .limit(10),
      // Payment requests pending
      supabase.from('payment_requests' as 'orders')
        .select('id, amount, status, customer_id, created_at' as '*')
        .eq('status' as 'id', 'sent')
        .order('created_at', { ascending: false })
        .limit(10),
    ]);

    setHotLeads((hotRes.data || []) as PipelineLead[]);
    setStaleLeads((staleRes.data || []) as PipelineLead[]);
    setPendingQuotes((quotesRes.data || []) as PipelineQuote[]);
    setFollowUps((followUpRes.data || []) as PipelineLead[]);
    setPendingContracts((contractsRes.data || []) as unknown as PipelineContract[]);
    setPendingPayments(((paymentsRes.data || []) as unknown as PipelinePayment[]));

    // Fetch ready-for-dispatch quotes (converted status)
    const { data: dispatchQuotes } = await supabase.from('quotes')
      .select('id, customer_name, customer_phone, status, subtotal, created_at, material_type')
      .eq('status', 'converted')
      .order('created_at', { ascending: false })
      .limit(10);
    setReadyForDispatch((dispatchQuotes || []) as PipelineQuote[]);

    setLoading(false);
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      {/* Hot Leads */}
      <PipelineSection
        title="Hot Leads"
        icon={<Zap className="w-4 h-4 text-amber-500" />}
        count={hotLeads.length}
        borderColor="border-l-amber-500"
        emptyText="No hot leads right now"
      >
        {hotLeads.map(lead => (
          <LeadRow key={lead.id} lead={lead} />
        ))}
      </PipelineSection>

      {/* Stale Leads */}
      <PipelineSection
        title="Stale Leads"
        icon={<AlertTriangle className="w-4 h-4 text-destructive" />}
        count={staleLeads.length}
        borderColor="border-l-destructive"
        emptyText="No stale leads"
      >
        {staleLeads.map(lead => (
          <LeadRow key={lead.id} lead={lead} showAge />
        ))}
      </PipelineSection>

      {/* Quotes Pending */}
      <PipelineSection
        title="Quotes Pending"
        icon={<FileText className="w-4 h-4 text-primary" />}
        count={pendingQuotes.length}
        borderColor="border-l-primary"
        emptyText="No pending quotes"
      >
        {pendingQuotes.map(q => (
          <Link key={q.id} to={`/sales/quotes/${q.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{q.customer_name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{q.material_type || 'General'} &middot; {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {q.subtotal && <span className="text-sm font-semibold">${q.subtotal.toFixed(0)}</span>}
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </PipelineSection>

      {/* Contracts Pending */}
      <PipelineSection
        title="Contracts Pending"
        icon={<ScrollText className="w-4 h-4 text-purple-500" />}
        count={pendingContracts.length}
        borderColor="border-l-purple-500"
        emptyText="No pending contracts"
      >
        {pendingContracts.map(c => (
          <Link key={c.id} to={`/sales/quotes/${c.quote_id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{c.customer_name}</p>
              <p className="text-xs text-muted-foreground">
                {c.sent_at ? `Sent ${formatDistanceToNow(new Date(c.sent_at), { addSuffix: true })}` : 'Not sent yet'}
              </p>
            </div>
            <ArrowRight className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
          </Link>
        ))}
      </PipelineSection>

      {/* Payments Pending */}
      <PipelineSection
        title="Payments Pending"
        icon={<CreditCard className="w-4 h-4 text-emerald-500" />}
        count={pendingPayments.length}
        borderColor="border-l-emerald-500"
        emptyText="No pending payments"
      >
        {pendingPayments.map(p => (
          <div key={p.id} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold">${p.amount.toFixed(2)}</p>
              <p className="text-xs text-muted-foreground">
                Sent {formatDistanceToNow(new Date(p.created_at), { addSuffix: true })}
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">{p.status}</Badge>
          </div>
        ))}
      </PipelineSection>

      {/* Follow-Ups Due */}
      <PipelineSection
        title="Follow-Ups Due"
        icon={<Clock className="w-4 h-4 text-blue-500" />}
        count={followUps.length}
        borderColor="border-l-blue-500"
        emptyText="All caught up"
      >
        {followUps.map(lead => (
          <LeadRow key={lead.id} lead={lead} showLastContact />
        ))}
      </PipelineSection>

      {/* Ready for Dispatch */}
      <PipelineSection
        title="Ready for Dispatch"
        icon={<Truck className="w-4 h-4 text-green-600" />}
        count={readyForDispatch.length}
        borderColor="border-l-green-600"
        emptyText="No orders ready"
      >
        {readyForDispatch.map(q => (
          <Link key={q.id} to={`/sales/quotes/${q.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors gap-2">
            <div className="min-w-0">
              <p className="text-sm font-medium truncate">{q.customer_name || 'Unknown'}</p>
              <p className="text-xs text-muted-foreground">{q.material_type || 'General'} &middot; {formatDistanceToNow(new Date(q.created_at), { addSuffix: true })}</p>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              {q.subtotal && <span className="text-sm font-semibold">${q.subtotal.toFixed(0)}</span>}
              <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
            </div>
          </Link>
        ))}
      </PipelineSection>
    </div>
  );
}

function PipelineSection({ title, icon, count, borderColor, emptyText, children }: {
  title: string;
  icon: React.ReactNode;
  count: number;
  borderColor: string;
  emptyText: string;
  children: React.ReactNode;
}) {
  return (
    <Card className={`border-l-4 ${borderColor}`}>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">{icon}{title}</span>
          <Badge variant="secondary" className="text-xs">{count}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-1">
        {count === 0 ? (
          <p className="text-xs text-muted-foreground text-center py-3">{emptyText}</p>
        ) : children}
      </CardContent>
    </Card>
  );
}

function LeadRow({ lead, showAge, showLastContact }: { lead: PipelineLead; showAge?: boolean; showLastContact?: boolean }) {
  return (
    <Link to={`/sales/leads/${lead.id}`} className="flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors gap-2">
      <div className="min-w-0 flex-1">
        <div className="flex items-center gap-1.5">
          <p className="text-sm font-medium truncate">{lead.customer_name || 'Unknown'}</p>
          {lead.lead_priority === 'hot' && (
            <Badge className="h-4 px-1.5 text-[9px] font-bold bg-red-600 text-white border-0 animate-pulse">🔥 HOT</Badge>
          )}
          {lead.lead_priority === 'high' && lead.lead_priority !== 'hot' && (
            <Badge className="h-4 px-1.5 text-[9px] font-bold bg-amber-500 text-white border-0">⚡ HIGH</Badge>
          )}
          {lead.same_day && (
            <Badge className="h-4 px-1.5 text-[9px] font-bold bg-red-500 text-white border-0">SAME DAY</Badge>
          )}
        </div>
        <p className="text-xs text-muted-foreground truncate">
          {lead.city || lead.zip || 'No location'}
          {showAge && ` · ${formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}`}
          {showLastContact && lead.last_contacted_at && ` · Last contact ${formatDistanceToNow(new Date(lead.last_contacted_at), { addSuffix: true })}`}
        </p>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {lead.lead_quality_label && (
          <Badge variant="outline" className={`text-[10px] h-5 ${
            lead.lead_quality_label === 'GREEN' ? 'text-green-700 border-green-300' :
            lead.lead_quality_label === 'AMBER' ? 'text-amber-700 border-amber-300' :
            'text-red-700 border-red-300'
          }`}>{lead.lead_quality_label}</Badge>
        )}
        {lead.customer_phone && (
          <a href={`tel:${lead.customer_phone}`} onClick={e => e.stopPropagation()} className="p-1 rounded hover:bg-primary/10">
            <Phone className="w-3.5 h-3.5 text-primary" />
          </a>
        )}
        <ArrowRight className="w-3.5 h-3.5 text-muted-foreground" />
      </div>
    </Link>
  );
}
