import { useState, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { Phone, MessageSquare, Clock, GripVertical } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { formatElapsed } from "@/services/leadScoringService";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface PipelineLead {
  id: string;
  customer_name: string | null;
  customer_phone: string | null;
  lead_status: string;
  lead_quality_label: string | null;
  lead_quality_score: number | null;
  city: string | null;
  zip: string | null;
  created_at: string;
  last_activity_at: string | null;
  source_key: string | null;
  channel_key: string | null;
}

const PIPELINE_STAGES = [
  { key: "new", label: "New", color: "bg-blue-500" },
  { key: "contacted", label: "Contacted", color: "bg-yellow-500" },
  { key: "qualified", label: "Qualified", color: "bg-purple-500" },
  { key: "quote_sent", label: "Quote Sent", color: "bg-indigo-500" },
  { key: "quote_accepted", label: "Accepted", color: "bg-teal-500" },
  { key: "contract_sent", label: "Contract", color: "bg-amber-500" },
  { key: "payment_received", label: "Payment", color: "bg-cyan-500" },
  { key: "order_created", label: "Order", color: "bg-lime-500" },
];

const QUALITY_DOT: Record<string, string> = {
  GREEN: "bg-green-500",
  AMBER: "bg-yellow-500",
  RED: "bg-red-500",
};

interface Props {
  leads: PipelineLead[];
  onRefresh?: () => void;
}

export default function SalesPipelineBoard({ leads, onRefresh }: Props) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const now = new Date();
  const [draggedLeadId, setDraggedLeadId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<string | null>(null);

  const stageLeads = (stageKey: string) => {
    return leads.filter(l => {
      const status = l.lead_status;
      if (stageKey === "quote_sent") return status === "quote_sent" || status === "quoted" || status === "quote_created";
      if (stageKey === "quote_accepted") return status === "quote_accepted";
      if (stageKey === "contract_sent") return status === "contract_sent" || status === "contract_signed";
      if (stageKey === "payment_received") return status === "payment_received";
      if (stageKey === "order_created") return status === "order_created" || status === "converted" || status === "booked";
      return status === stageKey;
    });
  };

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

  const handleDragLeave = useCallback(() => {
    setDropTarget(null);
  }, []);

  const handleDrop = useCallback(async (e: React.DragEvent, stageKey: string) => {
    e.preventDefault();
    setDropTarget(null);
    const leadId = e.dataTransfer.getData("text/plain");
    setDraggedLeadId(null);
    if (!leadId) return;

    // Don't update if already in this stage
    const lead = leads.find(l => l.id === leadId);
    if (!lead) return;

    try {
      const { error } = await supabase
        .from("sales_leads")
        .update({ lead_status: stageKey, updated_at: new Date().toISOString() })
        .eq("id", leadId);

      if (error) throw error;

      await supabase.from("lead_events").insert({
        lead_id: leadId,
        event_type: `STATUS_CHANGED_TO_${stageKey.toUpperCase()}`,
        payload_json: { from: lead.lead_status, to: stageKey, method: "pipeline_drag" },
      });

      toast({ title: `Lead moved to ${PIPELINE_STAGES.find(s => s.key === stageKey)?.label}` });
      onRefresh?.();
    } catch (err) {
      console.error(err);
      toast({ title: "Error updating lead status", variant: "destructive" });
    }
  }, [leads, toast, onRefresh]);

  return (
    <div className="flex gap-3 overflow-x-auto pb-4 min-h-[500px]">
      {PIPELINE_STAGES.map(stage => {
        const stageItems = stageLeads(stage.key);
        const isOver = dropTarget === stage.key;
        return (
          <div
            key={stage.key}
            className={`flex-shrink-0 w-[220px] rounded-lg transition-colors ${isOver ? "bg-primary/10 ring-2 ring-primary/30" : ""}`}
            onDragOver={(e) => handleDragOver(e, stage.key)}
            onDragLeave={handleDragLeave}
            onDrop={(e) => handleDrop(e, stage.key)}
          >
            <div className="flex items-center gap-2 mb-3 px-1">
              <div className={`w-2.5 h-2.5 rounded-full ${stage.color}`} />
              <span className="text-sm font-semibold">{stage.label}</span>
              <Badge variant="secondary" className="text-xs ml-auto">{stageItems.length}</Badge>
            </div>
            <ScrollArea className="h-[460px]">
              <div className="space-y-2 pr-2 px-1">
                {stageItems.length === 0 && (
                  <p className="text-xs text-muted-foreground text-center py-8">No leads</p>
                )}
                {stageItems.map(lead => {
                  const ageMin = Math.floor((now.getTime() - new Date(lead.created_at).getTime()) / 60000);
                  const isDragging = draggedLeadId === lead.id;
                  return (
                    <Card
                      key={lead.id}
                      draggable
                      onDragStart={(e) => handleDragStart(e, lead.id)}
                      onDragEnd={() => setDraggedLeadId(null)}
                      className={`cursor-grab active:cursor-grabbing hover:border-primary/40 transition-all ${isDragging ? "opacity-40 scale-95" : ""}`}
                      onClick={() => navigate(`/sales/leads/${lead.id}`)}
                    >
                      <CardContent className="p-3 space-y-2">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center gap-1.5">
                            <GripVertical className="w-3 h-3 text-muted-foreground/50 flex-shrink-0" />
                            <p className="text-sm font-medium leading-tight">
                              {lead.customer_name || "Unknown"}
                            </p>
                          </div>
                          <div className={`w-2 h-2 rounded-full mt-1 ${QUALITY_DOT[lead.lead_quality_label || "GREEN"]}`} />
                        </div>
                        {(lead.city || lead.zip) && (
                          <p className="text-xs text-muted-foreground">
                            {lead.city}{lead.zip ? `, ${lead.zip}` : ""}
                          </p>
                        )}
                        <div className="flex items-center justify-between">
                          <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="w-3 h-3" /> {formatElapsed(ageMin)}
                          </span>
                          <div className="flex gap-0.5" onClick={e => e.stopPropagation()}>
                            {lead.customer_phone && (
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => window.open(`tel:${lead.customer_phone}`)}>
                                <Phone className="w-3 h-3" />
                              </Button>
                            )}
                            {lead.customer_phone && (
                              <Button size="icon" variant="ghost" className="h-6 w-6" onClick={() => window.open(`sms:${lead.customer_phone}`)}>
                                <MessageSquare className="w-3 h-3" />
                              </Button>
                            )}
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </ScrollArea>
          </div>
        );
      })}
    </div>
  );
}
