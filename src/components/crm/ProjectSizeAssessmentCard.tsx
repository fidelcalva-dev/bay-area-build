import { useState, useEffect } from "react";
import { Camera, AlertTriangle, ExternalLink, Loader2, Package } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

interface AssessmentData {
  id: string;
  recommended_size: number | null;
  heavy_flag: boolean | null;
  detected_materials: any[] | null;
  confidence: number | null;
  overall_confidence: string | null;
  image_storage_path: string | null;
  input_type: string;
  created_at: string;
  applied_to_quote: boolean | null;
  quote_id: string | null;
  order_id: string | null;
}

interface Props {
  leadId: string;
  quoteId?: string | null;
  orderId?: string | null;
  onApplySize?: (size: number) => void;
  showApplyButton?: boolean;
}

export default function ProjectSizeAssessmentCard({ leadId, quoteId, orderId, onApplySize, showApplyButton = true }: Props) {
  const [assessment, setAssessment] = useState<AssessmentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [mediaUrl, setMediaUrl] = useState<string | null>(null);
  const [loadingMedia, setLoadingMedia] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    fetchAssessment();
  }, [leadId, quoteId, orderId]);

  const fetchAssessment = async () => {
    setLoading(true);
    try {
      let query = supabase
        .from("waste_vision_analyses")
        .select("id, recommended_size, heavy_flag, detected_materials, confidence, overall_confidence, image_storage_path, input_type, created_at, applied_to_quote, quote_id, order_id")
        .order("created_at", { ascending: false })
        .limit(1);

      if (orderId) {
        query = query.eq("order_id", orderId);
      } else if (quoteId) {
        query = query.eq("quote_id", quoteId);
      } else {
        query = query.eq("lead_id", leadId);
      }

      const { data, error } = await query.maybeSingle();
      if (error) throw error;
      setAssessment(data as unknown as AssessmentData);
    } catch (err) {
      console.error("Failed to fetch assessment:", err);
    } finally {
      setLoading(false);
    }
  };

  const viewMedia = async () => {
    if (!assessment?.image_storage_path) return;
    setLoadingMedia(true);
    try {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) throw new Error("Not authenticated");

      const res = await supabase.functions.invoke("get-assessment-media-url", {
        body: { storage_path: assessment.image_storage_path },
      });

      if (res.error) throw res.error;
      const url = res.data?.signed_url;
      if (url) {
        setMediaUrl(url);
        window.open(url, "_blank");
      }
    } catch (err) {
      toast({ title: "Could not load media", variant: "destructive" });
    } finally {
      setLoadingMedia(false);
    }
  };

  const handleApplySize = () => {
    if (assessment?.recommended_size && onApplySize) {
      onApplySize(assessment.recommended_size);
      toast({ title: `Size set to ${assessment.recommended_size}-yard` });
    }
  };

  if (loading) {
    return (
      <Card>
        <CardContent className="py-6 flex items-center justify-center">
          <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
        </CardContent>
      </Card>
    );
  }

  if (!assessment) return null;

  const confidenceLabel = assessment.overall_confidence === "high" ? "High" :
    assessment.overall_confidence === "medium" ? "Medium" : "Low";
  const confidenceColor = assessment.overall_confidence === "high" ? "bg-green-100 text-green-800" :
    assessment.overall_confidence === "medium" ? "bg-yellow-100 text-yellow-800" : "bg-red-100 text-red-800";

  const materials = (assessment.detected_materials || []).slice(0, 3);

  return (
    <Card className="border-accent/30">
      <CardHeader className="pb-3">
        <CardTitle className="text-sm flex items-center gap-2">
          <Camera className="w-4 h-4 text-accent" />
          Project Size Assessment
          <Badge className={confidenceColor} variant="outline">{confidenceLabel}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {/* Recommended size */}
        <div className="flex items-center justify-between">
          <span className="text-sm text-muted-foreground">Recommended Size</span>
          <span className="text-lg font-bold">{assessment.recommended_size}-yard</span>
        </div>

        {/* Materials */}
        {materials.length > 0 && (
          <div>
            <span className="text-xs text-muted-foreground block mb-1">Materials Observed</span>
            <div className="flex flex-wrap gap-1">
              {materials.map((m: any, i: number) => (
                <Badge key={i} variant="secondary" className="text-xs">
                  {m.label || m.name || m.id}
                </Badge>
              ))}
            </div>
          </div>
        )}

        {/* Heavy material warning */}
        {assessment.heavy_flag && (
          <div className="flex items-center gap-2 text-sm p-2 rounded bg-amber-50 text-amber-800 dark:bg-amber-900/20 dark:text-amber-200">
            <AlertTriangle className="w-4 h-4 flex-shrink-0" />
            <span>Heavy materials detected — limited to 6, 8, or 10-yard containers</span>
          </div>
        )}

        {/* Input type */}
        <div className="flex items-center justify-between text-xs text-muted-foreground">
          <span>{assessment.input_type === "video_frames" ? "Video analysis" : "Photo analysis"}</span>
          <span>{new Date(assessment.created_at).toLocaleDateString()}</span>
        </div>

        {/* Actions */}
        <div className="flex flex-wrap gap-2 pt-1">
          {assessment.image_storage_path && (
            <Button size="sm" variant="outline" onClick={viewMedia} disabled={loadingMedia}>
              {loadingMedia ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <ExternalLink className="w-3 h-3 mr-1" />}
              View Media
            </Button>
          )}
          {showApplyButton && onApplySize && assessment.recommended_size && !assessment.applied_to_quote && (
            <Button size="sm" variant="default" onClick={handleApplySize}>
              <Package className="w-3 h-3 mr-1" />
              Apply Recommended Size
            </Button>
          )}
          {assessment.applied_to_quote && (
            <Badge variant="outline" className="text-green-700 bg-green-50">Applied to quote</Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
