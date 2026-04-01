/**
 * Contractor Application Board — Kanban-style board for contractor applications.
 * Columns represent application statuses.
 */
import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ScrollArea, ScrollBar } from '@/components/ui/scroll-area';
import { HardHat, Building2, MapPin, FileText, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';

const BOARD_COLUMNS = [
  { status: 'submitted', label: 'New Application', color: 'bg-blue-500' },
  { status: 'under_review', label: 'Under Review', color: 'bg-amber-500' },
  { status: 'waiting_on_info', label: 'Waiting on Info', color: 'bg-orange-500' },
  { status: 'approved', label: 'Approved', color: 'bg-green-500' },
  { status: 'declined', label: 'Declined', color: 'bg-red-500' },
  { status: 'converted', label: 'Converted', color: 'bg-emerald-500' },
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
}

interface Props {
  onSelectApplication?: (id: string) => void;
}

export function ContractorBoard({ onSelectApplication }: Props) {
  const [apps, setApps] = useState<ContractorApp[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function load() {
      const { data } = await supabase
        .from('contractor_applications')
        .select('id, company_name, legal_business_name, contact_name, city, contractor_type, service_line_interest, recurring_service_interest, current_active_projects, status, created_at, contractor_fit_score, docs_uploaded_json')
        .order('created_at', { ascending: false });
      setApps((data as any[]) || []);
      setLoading(false);
    }
    load();
  }, []);

  if (loading) {
    return <div className="flex justify-center py-12"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <ScrollArea className="w-full">
      <div className="flex gap-3 pb-4 min-w-[900px]">
        {BOARD_COLUMNS.map(col => {
          const colApps = apps.filter(a => a.status === col.status || (col.status === 'submitted' && a.status === 'pending'));
          return (
            <div key={col.status} className="w-[260px] shrink-0">
              <div className="flex items-center gap-2 mb-3">
                <div className={`w-2.5 h-2.5 rounded-full ${col.color}`} />
                <span className="text-sm font-semibold">{col.label}</span>
                <Badge variant="secondary" className="text-[10px] ml-auto">{colApps.length}</Badge>
              </div>
              <div className="space-y-2">
                {colApps.map(app => (
                  <Card
                    key={app.id}
                    className="cursor-pointer hover:shadow-md transition-shadow"
                    onClick={() => onSelectApplication?.(app.id)}
                  >
                    <CardContent className="p-3 space-y-1.5">
                      <div className="flex items-start justify-between gap-1">
                        <p className="text-sm font-semibold leading-tight truncate">{app.legal_business_name || app.company_name}</p>
                        {app.contractor_fit_score != null && (
                          <Badge variant={app.contractor_fit_score >= 60 ? 'default' : 'secondary'} className="text-[9px] shrink-0">
                            {app.contractor_fit_score}
                          </Badge>
                        )}
                      </div>
                      <p className="text-xs text-muted-foreground">{app.contact_name}</p>
                      <div className="flex flex-wrap gap-1">
                        {app.city && (
                          <Badge variant="outline" className="text-[9px] gap-0.5">
                            <MapPin className="w-2.5 h-2.5" /> {app.city}
                          </Badge>
                        )}
                        {app.contractor_type && (
                          <Badge variant="outline" className="text-[9px] gap-0.5">
                            <HardHat className="w-2.5 h-2.5" /> {app.contractor_type}
                          </Badge>
                        )}
                        {app.service_line_interest && (
                          <Badge variant="outline" className="text-[9px]">{app.service_line_interest}</Badge>
                        )}
                      </div>
                      <div className="flex items-center justify-between text-[10px] text-muted-foreground pt-1">
                        <span>{new Date(app.created_at).toLocaleDateString()}</span>
                        <div className="flex gap-1.5">
                          {app.recurring_service_interest && <Badge variant="secondary" className="text-[8px]">Recurring</Badge>}
                          {app.docs_uploaded_json && (Array.isArray(app.docs_uploaded_json) ? app.docs_uploaded_json.length > 0 : Object.keys(app.docs_uploaded_json).length > 0) && (
                            <FileText className="w-3 h-3" />
                          )}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
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
  );
}
