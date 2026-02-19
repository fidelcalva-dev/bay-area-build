// ============================================================
// Hot AI Leads Queue — for Sales Dashboard
// Shows unreviewed handoff packets with high-intent AI leads
// ============================================================

import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Clock, ArrowRight, CheckCircle2 } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { formatDistanceToNow } from 'date-fns';

interface HotLead {
  id: string;
  lead_id: string;
  assigned_team: string;
  summary_text: string;
  recommended_next_action: string;
  risk_band: string;
  is_reviewed: boolean;
  created_at: string;
  extracted_fields_json: Record<string, unknown>;
}

export function HotAILeadsQueue() {
  const [leads, setLeads] = useState<HotLead[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchHotLeads();
  }, []);

  async function fetchHotLeads() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('lead_handoff_packets' as never)
      .select('*')
      .eq('is_reviewed', false)
      .order('created_at', { ascending: false })
      .limit(20);

    if (!error) {
      setLeads((data || []) as unknown as HotLead[]);
    }
    setIsLoading(false);
  }

  async function markReviewed(id: string) {
    await supabase
      .from('lead_handoff_packets' as never)
      .update({ is_reviewed: true, reviewed_at: new Date().toISOString() } as never)
      .eq('id', id);
    setLeads(prev => prev.filter(l => l.id !== id));
  }

  if (isLoading) return null;
  if (leads.length === 0) return null;

  const actionLabels: Record<string, string> = {
    SEND_QUOTE: 'Send Quote',
    CALL_IMMEDIATELY: 'Call Now',
    VERIFY_THEN_QUOTE: 'Verify First',
    MANAGER_REVIEW: 'Manager Review',
    CHECK_BILLING: 'Check Billing',
    SCHEDULE_PICKUP: 'Schedule Pickup',
    CONFIRM_SCHEDULE: 'Confirm Schedule',
    INVESTIGATE_ISSUE: 'Investigate',
    FOLLOW_UP_CALL: 'Follow Up',
  };

  const riskColors: Record<string, string> = {
    GREEN: 'bg-green-100 text-green-700',
    AMBER: 'bg-amber-100 text-amber-700',
    RED: 'bg-red-100 text-red-700',
  };

  return (
    <Card className="border-l-4 border-l-amber-500">
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center gap-2">
          <Zap className="w-4 h-4 text-amber-500" />
          Hot AI Leads ({leads.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {leads.map(lead => (
            <div key={lead.id} className="flex items-start justify-between gap-3 p-3 rounded-lg bg-muted/50 border">
              <div className="flex-1 min-w-0 space-y-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <Badge className={riskColors[lead.risk_band] || ''}>{lead.risk_band}</Badge>
                  <Badge variant="outline">{lead.assigned_team}</Badge>
                  <span className="text-xs text-muted-foreground flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {formatDistanceToNow(new Date(lead.created_at), { addSuffix: true })}
                  </span>
                </div>
                <p className="text-sm truncate">{lead.summary_text}</p>
                <div className="flex gap-2 text-xs">
                  {lead.extracted_fields_json?.zip && (
                    <span className="bg-background rounded px-1.5 py-0.5">ZIP: {String(lead.extracted_fields_json.zip)}</span>
                  )}
                  {lead.extracted_fields_json?.material && (
                    <span className="bg-background rounded px-1.5 py-0.5">{String(lead.extracted_fields_json.material)}</span>
                  )}
                  {lead.extracted_fields_json?.size && (
                    <span className="bg-background rounded px-1.5 py-0.5">{String(lead.extracted_fields_json.size)}yd</span>
                  )}
                </div>
              </div>
              <div className="flex flex-col gap-1.5 flex-shrink-0">
                {lead.lead_id && (
                  <Link to={`/sales/leads/${lead.lead_id}`}>
                    <Button size="sm" variant="default" className="gap-1 text-xs">
                      {actionLabels[lead.recommended_next_action] || 'View'}
                      <ArrowRight className="w-3 h-3" />
                    </Button>
                  </Link>
                )}
                <Button size="sm" variant="ghost" className="gap-1 text-xs" onClick={() => markReviewed(lead.id)}>
                  <CheckCircle2 className="w-3 h-3" /> Done
                </Button>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

export default HotAILeadsQueue;
