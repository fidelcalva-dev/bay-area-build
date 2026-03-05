import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { RefreshCw, Clock, CheckCircle, XCircle, Loader2 } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const statusIcons: Record<string, any> = {
  PENDING: <Clock className="w-4 h-4 text-muted-foreground" />,
  PROCESSING: <Loader2 className="w-4 h-4 text-primary animate-spin" />,
  COMPLETE: <CheckCircle className="w-4 h-4 text-success" />,
  FAILED: <XCircle className="w-4 h-4 text-destructive" />,
};

const statusColors: Record<string, string> = {
  PENDING: "bg-muted text-muted-foreground",
  PROCESSING: "bg-primary/10 text-primary",
  COMPLETE: "bg-success/10 text-success",
  FAILED: "bg-destructive/10 text-destructive",
};

export default function SeoQueuePage() {
  const [refreshing, setRefreshing] = useState(false);

  const { data: jobs, isLoading, refetch } = useQuery({
    queryKey: ["seo-queue"],
    queryFn: async () => {
      const { data } = await supabase
        .from("seo_queue")
        .select("*, seo_pages(url_path, title), seo_cities(city_name)")
        .order("created_at", { ascending: false })
        .limit(100);
      return data || [];
    },
  });

  const triggerRefresh = async () => {
    setRefreshing(true);
    try {
      const { data, error } = await supabase.functions.invoke("seo-refresh-pages");
      if (error) throw error;
      toast.success(`Refreshed ${data?.refreshed || 0} pages`);
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Refresh failed");
    } finally {
      setRefreshing(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO Job Queue</h1>
          <p className="text-sm text-muted-foreground">Page generation and refresh jobs</p>
        </div>
        <Button onClick={triggerRefresh} disabled={refreshing} variant="outline">
          <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? "animate-spin" : ""}`} />
          {refreshing ? "Refreshing..." : "Trigger Refresh"}
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-4 gap-4">
        {["PENDING", "PROCESSING", "COMPLETE", "FAILED"].map((s) => (
          <div key={s} className="bg-card border border-border rounded-xl p-4">
            <div className="flex items-center gap-2 mb-1">
              {statusIcons[s]}
              <span className="text-sm font-medium text-foreground">{s}</span>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {jobs?.filter((j: any) => j.status === s).length || 0}
            </p>
          </div>
        ))}
      </div>

      {/* Jobs Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Page / City</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Scheduled</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Error</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : jobs?.length === 0 ? (
              <tr><td colSpan={5} className="p-8 text-center text-muted-foreground">No jobs in queue</td></tr>
            ) : (
              jobs?.map((job: any) => (
                <tr key={job.id} className="border-t border-border">
                  <td className="p-3">
                    <Badge variant="outline">{job.job_type}</Badge>
                  </td>
                  <td className="p-3 text-foreground">
                    {job.seo_pages?.title || job.seo_cities?.city_name || "—"}
                  </td>
                  <td className="p-3">
                    <Badge className={statusColors[job.status]}>{job.status}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">
                    {new Date(job.scheduled_at).toLocaleDateString()}
                  </td>
                  <td className="p-3 text-destructive text-xs max-w-[200px] truncate">
                    {job.error_log || "—"}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
