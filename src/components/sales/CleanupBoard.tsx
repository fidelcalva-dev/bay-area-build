import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, Camera, MapPin, HardHat, RefreshCw, Layers, Clock, AlertTriangle } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatElapsed } from "@/services/leadScoringService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useState, useCallback } from "react";
import type { LeadHubLead } from "@/hooks/useLeadHub";

const CLEANUP_STAGES = [
  { key: "new", label: "New Inbound", color: "bg-blue-500" },
  { key: "contacted", label: "Pending Contact", color: "bg-yellow-500" },
  { key: "waiting_photos", label: "Waiting on Photos", color: "bg-orange-500" },
  { key: "scope_review", label: "Scope Review", color: "bg-purple-500" },
  { key: "needs_site_visit", label: "Needs Site Visit", color: "bg-rose-500" },
  { key: "estimating", label: "Estimating", color: "bg-indigo-500" },
  { key: "proposal_sent", label: "Proposal Sent", color: "bg-teal-500" },
  { key: "followup", label: "Follow-Up", color: "bg-amber-500" },
  { key: "scheduled", label: "Scheduled", color: "bg-cyan-500" },
  { key: "converted", label: "Won", color: "bg-green-500" },
  { key: "lost", label: "Lost", color: "bg-red-500" },
];

const CLEANUP_TYPE_LABELS: Record<string, string> = {
  CONSTRUCTION_CLEANUP: "Construction",
  POST_CONSTRUCTION_CLEANUP: "Post-Construction",
  DEMOLITION_DEBRIS_CLEANUP: "Demo Debris",
  RECURRING_JOBSITE_CLEANUP: "Recurring",
  LABOR_ASSISTED_CLEANUP: "Labor-Assisted",
  NOT_SURE: "Not Sure",
};

function mapLeadToStage(lead: LeadHubLead): string {
  const status = lead.lead_status || "new";
  // Map cleanup-specific statuses
  if (lead.needs_site_visit && !["converted", "lost", "scheduled"].includes(status)) return "needs_site_visit";
  if (lead.photos_uploaded_flag === false && status === "contacted") return "waiting_photos";
  // Map generic statuses to cleanup board
  if (status === "new" || status === "contact_captured") return "new";
  if (status === "contacted") return "contacted";
  if (status === "qualified" || status === "quote_started" || status === "price_shown") return "scope_review";
  if (status === "quote_ready" || status === "quote_created") return "estimating";
  if (status === "quote_sent" || status === "quoted") return "proposal_sent";
  if (["quote_accepted", "contract_sent", "contract_signed", "contract_pending"].includes(status)) return "followup";
  if (["payment_pending", "payment_received", "ready_for_dispatch", "order_created"].includes(status)) return "scheduled";
  if (status === "converted") return "converted";
  if (status === "lost" || status === "dormant") return "lost";
  return "new";
}

interface Props {
  leads: LeadHubLead[];
  onRefresh?: () => void;
}

export function CleanupBoard({ leads, onRefresh }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const now = new Date();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  // Filter to cleanup/bundle leads only
  const cleanupLeads = leads.filter(l =>
    l.service_line === "CLEANUP" || l.service_line === "BOTH" ||
    l.brand === "CALSAN_CD_WASTE_REMOVAL"
  );

  const stageLeads = (stageKey: string) =>
    cleanupLeads.filter(l => mapLeadToStage(l) === stageKey);

  const handleDragStart = useCallback((e: React.DragEvent, leadId: string) => {
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", leadId);
    setDraggedLeadId(leadId);
  }, []);

  const handleDragOver = useCallback((e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    setDropTarget(stageKey);
  }, []);

  const handleDragLeave = useCallback(() => setDropTarget(null), []);

  const handleDrop = useCallback(async (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    setDropTarget(null);
    const leadId = e.dataTransfer.getData("text/plain");
    if (!leadId) return;

    // Map stage back to lead_status
    const statusMap: Record<string, string> = {
      new: "new",
      contacted: "contacted",
      waiting_photos: "contacted",
      scope_review: "qualified",
      needs_site_visit: "qualified",
      estimating: "quote_ready",
      proposal_sent: "quote_sent",
      followup: "quote_accepted",
      scheduled: "order_created",
      converted: "converted",
      lost: "lost",
    };

    const newStatus = statusMap[stageKey] || stageKey;
    const extraUpdates: Record<string, any> = {};
    if (stageKey === "needs_site_visit") extraUpdates.needs_site_visit = true;
    if (stageKey === "waiting_photos") extraUpdates.photos_uploaded_flag = false;

    const { error } = await supabase
      .from("sales_leads")
      .update({ lead_status: newStatus, ...extraUpdates, updated_at: new Date().toISOString() })
      .eq("id", leadId);

    if (error) {
      toast({ title: "Failed to update lead", variant: "destructive" });
    } else {
      toast({ title: `Lead moved to ${CLEANUP_STAGES.find(s => s.key === stageKey)?.label}` });
      onRefresh?.();
    }
    setDraggedLeadId(null);
  }, [onRefresh, toast]);

  return (
    <div className="overflow-x-auto pb-4">
      <div className="flex gap-3 min-w-max">
        {CLEANUP_STAGES.map(stage => {
          const items = stageLeads(stage.key);
          const isDropping = dropTarget === stage.key;
          return (
            <div
              key={stage.key}
              className={`w-[220px] flex-shrink-0 rounded-lg border bg-muted/30 transition-colors ${isDropping ? "border-primary bg-primary/5" : "border-border"}`}
              onDragOver={(e) => handleDragOver(e, stage.key)}
              onDragLeave={handleDragLeave}
              onDrop={(e) => handleDrop(e, stage.key)}
            >
              <div className="p-2 border-b border-border flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${stage.color}`} />
                <span className="text-xs font-semibold truncate">{stage.label}</span>
                <Badge variant="secondary" className="text-[10px] ml-auto px-1.5 py-0">{items.length}</Badge>
              </div>
              <ScrollArea className="h-[calc(100vh-340px)] min-h-[300px]">
                <div className="p-2 space-y-2">
                  {items.map(lead => {
                    const ageMin = Math.floor((now.getTime() - new Date(lead.created_at).getTime()) / 60000);
                    return (
                      <Card
                        key={lead.id}
                        draggable
                        onDragStart={(e) => handleDragStart(e, lead.id)}
                        className={`cursor-pointer hover:border-primary/40 transition-all text-xs ${draggedLeadId === lead.id ? "opacity-50" : ""}`}
                        onClick={() => navigate(`/sales/leads/${lead.id}`)}
                      >
                        <CardContent className="p-2.5 space-y-1.5">
                          <p className="font-medium text-sm truncate">{lead.customer_name || "Unknown"}</p>
                          {lead.customer_phone && (
                            <p className="text-muted-foreground truncate">{lead.customer_phone}</p>
                          )}
                          {lead.city && (
                            <p className="text-muted-foreground flex items-center gap-1">
                              <MapPin className="w-3 h-3" /> {lead.city}
                            </p>
                          )}

                          {/* Badges */}
                          <div className="flex flex-wrap gap-1 pt-1">
                            {lead.cleanup_service_type && (
                              <Badge variant="secondary" className="text-[9px] px-1 py-0">
                                {CLEANUP_TYPE_LABELS[lead.cleanup_service_type] || lead.cleanup_service_type}
                              </Badge>
                            )}
                            {lead.contractor_flag && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5">
                                <HardHat className="w-2.5 h-2.5" /> Contractor
                              </Badge>
                            )}
                            {lead.recurring_service_flag && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5 border-emerald-300 text-emerald-700 dark:border-emerald-700 dark:text-emerald-300">
                                <RefreshCw className="w-2.5 h-2.5" /> Recurring
                              </Badge>
                            )}
                            {lead.bundle_opportunity_flag && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5 border-purple-300 text-purple-700 dark:border-purple-700 dark:text-purple-300">
                                <Layers className="w-2.5 h-2.5" /> Bundle
                              </Badge>
                            )}
                            {lead.photos_uploaded_flag && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5">
                                <Camera className="w-2.5 h-2.5" /> Photos
                              </Badge>
                            )}
                            {lead.needs_site_visit && (
                              <Badge variant="outline" className="text-[9px] px-1 py-0 gap-0.5 border-rose-300 text-rose-700 dark:border-rose-700 dark:text-rose-300">
                                <MapPin className="w-2.5 h-2.5" /> Site Visit
                              </Badge>
                            )}
                          </div>

                          {/* Footer */}
                          <div className="flex items-center justify-between pt-1 border-t border-border/50">
                            <span className="text-muted-foreground flex items-center gap-1">
                              <Clock className="w-3 h-3" /> {formatElapsed(ageMin)}
                            </span>
                            <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                              {lead.customer_phone && (
                                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => window.open(`tel:${lead.customer_phone}`)}>
                                  <Phone className="w-3 h-3" />
                                </Button>
                              )}
                              {lead.customer_phone && (
                                <Button size="icon" variant="ghost" className="h-5 w-5" onClick={() => window.open(`sms:${lead.customer_phone}`)}>
                                  <MessageSquare className="w-3 h-3" />
                                </Button>
                              )}
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                  {items.length === 0 && (
                    <p className="text-center text-muted-foreground text-xs py-4">No leads</p>
                  )}
                </div>
              </ScrollArea>
            </div>
          );
        })}
      </div>
    </div>
  );
}
