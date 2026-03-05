import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { BarChart3, TrendingUp, Eye, MousePointer } from "lucide-react";

export default function SeoMetricsPage() {
  const { data: metrics, isLoading } = useQuery({
    queryKey: ["seo-metrics-latest"],
    queryFn: async () => {
      const { data } = await supabase
        .from("seo_metrics")
        .select("*, seo_pages(url_path, title, page_type)")
        .order("captured_at", { ascending: false })
        .limit(200);
      return data || [];
    },
  });

  // Aggregate by page
  const pageMap = new Map<string, { title: string; url: string; type: string; impressions: number; clicks: number; ctr: number; position: number; entries: number }>();
  for (const m of metrics || []) {
    const key = m.page_id;
    const existing = pageMap.get(key) || {
      title: m.seo_pages?.title || "Unknown",
      url: m.seo_pages?.url_path || "",
      type: m.seo_pages?.page_type || "",
      impressions: 0, clicks: 0, ctr: 0, position: 0, entries: 0,
    };
    existing.impressions += m.impressions;
    existing.clicks += m.clicks;
    existing.position += Number(m.avg_position || 0);
    existing.entries += 1;
    pageMap.set(key, existing);
  }

  const aggregated = Array.from(pageMap.entries()).map(([id, d]) => ({
    id,
    ...d,
    avgPosition: d.entries > 0 ? (d.position / d.entries).toFixed(1) : "—",
    avgCtr: d.impressions > 0 ? ((d.clicks / d.impressions) * 100).toFixed(1) : "0",
  })).sort((a, b) => b.impressions - a.impressions);

  const totalImpressions = aggregated.reduce((s, a) => s + a.impressions, 0);
  const totalClicks = aggregated.reduce((s, a) => s + a.clicks, 0);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <BarChart3 className="w-6 h-6" /> SEO Performance Metrics
        </h1>
        <p className="text-sm text-muted-foreground">Search performance by page</p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><Eye className="w-4 h-4" /> Impressions</div>
          <p className="text-2xl font-bold text-foreground">{totalImpressions.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><MousePointer className="w-4 h-4" /> Clicks</div>
          <p className="text-2xl font-bold text-foreground">{totalClicks.toLocaleString()}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><TrendingUp className="w-4 h-4" /> Avg CTR</div>
          <p className="text-2xl font-bold text-foreground">{totalImpressions > 0 ? ((totalClicks / totalImpressions) * 100).toFixed(1) : 0}%</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 text-muted-foreground text-sm mb-1"><BarChart3 className="w-4 h-4" /> Pages Tracked</div>
          <p className="text-2xl font-bold text-foreground">{aggregated.length}</p>
        </div>
      </div>

      {/* Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Page</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Impressions</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Clicks</th>
              <th className="text-right p-3 font-medium text-muted-foreground">CTR</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Avg Position</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : aggregated.length === 0 ? (
              <tr><td colSpan={6} className="p-8 text-center text-muted-foreground">No metrics data yet. Import from Google Search Console.</td></tr>
            ) : (
              aggregated.map((row) => (
                <tr key={row.id} className="border-t border-border">
                  <td className="p-3">
                    <div className="text-foreground font-medium truncate max-w-[300px]">{row.title}</div>
                    <div className="text-xs text-muted-foreground">{row.url}</div>
                  </td>
                  <td className="p-3"><Badge variant="outline">{row.type}</Badge></td>
                  <td className="p-3 text-right text-foreground">{row.impressions.toLocaleString()}</td>
                  <td className="p-3 text-right text-foreground">{row.clicks.toLocaleString()}</td>
                  <td className="p-3 text-right text-foreground">{row.avgCtr}%</td>
                  <td className="p-3 text-right text-foreground">{row.avgPosition}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
