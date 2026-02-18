import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { FileText, ExternalLink } from "lucide-react";
import { format } from "date-fns";

interface LeadQuote {
  id: string;
  display_id: string | null;
  status: string;
  subtotal: number;
  estimated_min: number;
  estimated_max: number;
  material_type: string;
  user_selected_size_yards: number | null;
  delivery_address: string | null;
  zip_code: string;
  created_at: string;
}

interface LeadQuotesSectionProps {
  leadId: string;
  customerPhone: string | null;
  customerEmail: string | null;
  quoteId: string | null;
}

export default function LeadQuotesSection({ leadId, customerPhone, customerEmail, quoteId }: LeadQuotesSectionProps) {
  const [quotes, setQuotes] = useState<LeadQuote[]>([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    async function fetchQuotes() {
      setLoading(true);
      const allQuotes: LeadQuote[] = [];
      const seenIds = new Set<string>();

      // 1. Fetch by direct quote_id link
      if (quoteId) {
        const { data } = await supabase
          .from("quotes")
          .select("id, display_id, status, subtotal, estimated_min, estimated_max, material_type, user_selected_size_yards, delivery_address, zip_code, created_at")
          .eq("id", quoteId);
        if (data) {
          data.forEach((q) => {
            if (!seenIds.has(q.id)) { seenIds.add(q.id); allQuotes.push(q as LeadQuote); }
          });
        }
      }

      // 2. Fetch by customer phone
      if (customerPhone) {
        const cleanPhone = customerPhone.replace(/\D/g, '').slice(-10);
        if (cleanPhone.length === 10) {
          const { data } = await supabase
            .from("quotes")
            .select("id, display_id, status, subtotal, estimated_min, estimated_max, material_type, user_selected_size_yards, delivery_address, zip_code, created_at")
            .ilike("customer_phone", `%${cleanPhone}`)
            .order("created_at", { ascending: false })
            .limit(20);
          if (data) {
            data.forEach((q) => {
              if (!seenIds.has(q.id)) { seenIds.add(q.id); allQuotes.push(q as LeadQuote); }
            });
          }
        }
      }

      // 3. Fetch by customer email
      if (customerEmail) {
        const { data } = await supabase
          .from("quotes")
          .select("id, display_id, status, subtotal, estimated_min, estimated_max, material_type, user_selected_size_yards, delivery_address, zip_code, created_at")
          .eq("customer_email", customerEmail)
          .order("created_at", { ascending: false })
          .limit(20);
        if (data) {
          data.forEach((q) => {
            if (!seenIds.has(q.id)) { seenIds.add(q.id); allQuotes.push(q as LeadQuote); }
          });
        }
      }

      // Sort by created_at desc
      allQuotes.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
      setQuotes(allQuotes);
      setLoading(false);
    }

    fetchQuotes();
  }, [leadId, customerPhone, customerEmail, quoteId]);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed": return "bg-green-100 text-green-800";
      case "converted": return "bg-emerald-100 text-emerald-800";
      case "pending": return "bg-yellow-100 text-yellow-800";
      case "expired": return "bg-red-100 text-red-800";
      default: return "bg-muted text-muted-foreground";
    }
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <FileText className="w-4 h-4" /> Quotes ({loading ? "..." : quotes.length})
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="space-y-2">
            {[...Array(2)].map((_, i) => <Skeleton key={i} className="h-16 w-full" />)}
          </div>
        ) : quotes.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-4">No quotes linked to this lead</p>
        ) : (
          <div className="space-y-3">
            {quotes.map((q) => (
              <div
                key={q.id}
                className="flex items-center justify-between p-3 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-sm">{q.display_id || q.id.slice(0, 8)}</span>
                    <Badge className={getStatusColor(q.status)}>{q.status}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {q.user_selected_size_yards && `${q.user_selected_size_yards}yd · `}
                    {q.material_type} · ${q.subtotal.toLocaleString()}
                    {q.delivery_address && ` · ${q.delivery_address.slice(0, 40)}...`}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {format(new Date(q.created_at), "MMM d, yyyy h:mm a")}
                  </p>
                </div>
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => navigate(`/sales/quotes/${q.id}`)}
                >
                  <ExternalLink className="w-4 h-4" />
                </Button>
              </div>
            ))}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
