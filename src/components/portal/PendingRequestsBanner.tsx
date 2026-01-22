import { useEffect, useState } from "react";
import { Clock, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { supabase } from "@/integrations/supabase/client";
import { format } from "date-fns";

interface ServiceRequest {
  id: string;
  request_type: string;
  status: string;
  preferred_date: string | null;
  preferred_window: string | null;
  requested_delivery_date: string | null;
  requested_pickup_date: string | null;
  resolution_notes: string | null;
  created_at: string;
}

interface PendingRequestsBannerProps {
  orderId: string;
}

const STATUS_ICONS: Record<string, React.ReactNode> = {
  pending: <Clock className="w-4 h-4 text-yellow-600" />,
  in_review: <Loader2 className="w-4 h-4 text-blue-600 animate-spin" />,
  approved: <CheckCircle2 className="w-4 h-4 text-green-600" />,
  denied: <XCircle className="w-4 h-4 text-red-600" />,
};

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  in_review: "bg-blue-100 text-blue-800",
  approved: "bg-green-100 text-green-800",
  denied: "bg-red-100 text-red-800",
};

const REQUEST_TYPE_LABELS: Record<string, string> = {
  pickup: "Pickup Request",
  schedule_change: "Schedule Change",
};

export function PendingRequestsBanner({ orderId }: PendingRequestsBannerProps) {
  const [requests, setRequests] = useState<ServiceRequest[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchRequests();
    
    // Subscribe to realtime updates
    const channel = supabase
      .channel(`service-requests-${orderId}`)
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'service_requests',
          filter: `order_id=eq.${orderId}`,
        },
        () => {
          fetchRequests();
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [orderId]);

  async function fetchRequests() {
    const { data, error } = await supabase
      .from("service_requests")
      .select("*")
      .eq("order_id", orderId)
      .in("status", ["pending", "in_review", "approved", "denied"])
      .order("created_at", { ascending: false })
      .limit(5);

    if (!error && data) {
      setRequests(data);
    }
    setIsLoading(false);
  }

  if (isLoading || requests.length === 0) {
    return null;
  }

  return (
    <Card className="border-l-4 border-l-amber-400">
      <CardContent className="p-4">
        <h4 className="text-sm font-semibold text-gray-900 mb-3">Your Requests</h4>
        <div className="space-y-2">
          {requests.map((req) => (
            <div
              key={req.id}
              className="flex items-center justify-between p-2 bg-muted/50 rounded-lg"
            >
              <div className="flex items-center gap-2">
                {STATUS_ICONS[req.status]}
                <div>
                  <p className="text-sm font-medium">
                    {REQUEST_TYPE_LABELS[req.request_type] || req.request_type}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {req.requested_pickup_date
                      ? `Requested: ${format(new Date(req.requested_pickup_date), "MMM d")}`
                      : req.preferred_date
                      ? `Preferred: ${format(new Date(req.preferred_date), "MMM d")}`
                      : format(new Date(req.created_at), "MMM d, h:mm a")}
                  </p>
                </div>
              </div>
              <Badge className={STATUS_COLORS[req.status]}>
                {req.status === "in_review" ? "Reviewing" : req.status}
              </Badge>
            </div>
          ))}
        </div>
        {requests.some((r) => r.status === "approved" && r.resolution_notes) && (
          <div className="mt-3 p-2 bg-green-50 rounded-lg">
            <p className="text-xs text-green-800">
              {requests.find((r) => r.status === "approved")?.resolution_notes}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
