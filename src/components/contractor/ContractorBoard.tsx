/**
 * Contractor Application Board — Kanban-style board for contractor applications.
 * 8-column lifecycle: New → Pending Review → Waiting on Info → Qualified → Pricing Review → Approved → Declined → Converted
 */
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { HardHat, MapPin, FileText, Loader2, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';

const BOARD_COLUMNS = [
  { status: 'submitted', label: 'New Application', color: 'bg-blue-500' },
  { status: 'under_review', label: 'Pending Review', color: 'bg-amber-500' },
  { status: 'waiting_on_info', label: 'Waiting on Info', color: 'bg-orange-500' },
  { status: 'qualified', label: 'Qualified', color: 'bg-cyan-500' },
  { status: 'pricing_review', label: 'Pricing Review', color: 'bg-purple-500' },
  { status: 'approved', label: 'Approved', color: 'bg-green-500' },
  { status: 'declined', label: 'Declined', color: 'bg-red-500' },
  { status: 'converted', label: 'Converted to Customer', color: 'bg-emerald-500' },
];

interface ContractorApp {
  id: string;
  company_name: string;
  legal_business_name: string | null;
  contact_name: string;
  city: string | null;
  contractor_type: string | null;
  service_line_interest: string | null;
  recurring_service_interest: boolean | null;
  current_active_projects: number | null;
  status: string;
  created_at: string;
  contractor_fit_score: number | null;
  docs_uploaded_json: any;
  service_area: string | null;
  pricing_tier: string | null;
}

interface Props {
  onSelectApplication?: (id: string) => void;
}

export function ContractorBoard({ onSelectApplication }: Props) {
  const [apps, setApps] = useState<ContractorApp[]>([]);
  const [loading, setLoading] = useState(true);

  async function load() {
    setLoading(true);
    const { data } = await supabase
      .from('contractor_applications')
      .select('id, company_name, legal_business_name, contact_name, city, contractor_type, service_line_interest, recurring_service_interest, current_active_projects, status, created_at, contractor_fit_score, docs_uploaded_json, service_area, pricing_tier')
      .order('created_at', { ascending: false });
    setApps((data as any[]) || []);
    setLoading(false);
  }

  useEffect(() => { load(); }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2 text-sm text-muted-foreground">
          <HardHat className="w-4 h-4" />
          <span>{apps.length} applications</span>
        </div>
        <Button variant="ghost" size="sm" onClick={load} className="gap-1">
          <RefreshCw className="w-3.5 h-3.5" /> Refresh
        </Button>
      </div>
      <ScrollArea className="w-full">
        <div className="flex gap-3 pb-4 min-w-[1200px]">
          {BOARD_COLUMNS.map(col => {
            const colApps = apps.filter(a => a.status === col.status || (col.status === 'submitted' && a.status === 'pending'));
            return (
              <div key={col.status} className="w-[220px] shrink-0">
                <div className="flex items-center gap-2 mb-3">
                  <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                  <span className="text-xs font-semibold">{col.label}</span>
                  <Badge variant="secondary" className="text-[10px] ml-auto">{colApps.length}</Badge>
                </div>
                <div className="space-y-2">
                  {colApps.map(app => {
                    const hasDocs = app.docs_uploaded_json && (
                      Array.isArray(app.docs_uploaded_json)
                        ? app.docs_uploaded_json.length > 0
                        : Object.keys(app.docs_uploaded_json).length > 0
                    );
                    const scoreColor = (app.contractor_fit_score ?? 0) >= 60
                      ? 'bg-green-100 text-green-800'
                      : (app.contractor_fit_score ?? 0) >= 35
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-gray-100 text-gray-800';
                    return (
                      <Card
                        key={app.id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => onSelectApplication?.(app.id)}
                      >
                        <CardContent className="p-3 space-y-1.5">
                          <div className="flex items-start justify-between gap-1">
                            <p className="text-xs font-semibold leading-tight truncate">{app.legal_business_name || app.company_name}</p>
                            {app.contractor_fit_score != null && (
                              <Badge className={`${scoreColor} text-[9px] shrink-0`}>
                                {app.contractor_fit_score}
                              </Badge>
                            )}
                          </div>
                          <p className="text-[11px] text-muted-foreground">{app.contact_name}</p>
                          <div className="flex flex-wrap gap-1">
                            {app.city && (
                              <Badge variant="outline" className="text-[9px] gap-0.5">
                                <MapPin className="w-2.5 h-2.5" /> {app.city}
                              </Badge>
                            )}
                            {app.service_line_interest && (
                              <Badge variant="outline" className="text-[9px]">{app.service_line_interest}</Badge>
                            )}
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                            <span>{new Date(app.created_at).toLocaleDateString()}</span>
                            <div className="flex gap-1.5 items-center">
                              {app.recurring_service_interest && <Badge variant="secondary" className="text-[8px]">Recurring</Badge>}
                              {hasDocs && <FileText className="w-3 h-3" />}
                              {(app.current_active_projects ?? 0) > 0 && (
                                <span className="text-[9px]">{app.current_active_projects} proj</span>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {colApps.length === 0 && (
                    <p className="text-xs text-muted-foreground text-center py-4 border border-dashed rounded">No applications</p>
                  )}
                </div>
              </div>
            );
          })}
        </div>
        <ScrollBar orientation="horizontal" />
      </ScrollArea>
    </div>
  );
}
