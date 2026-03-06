import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { 
  RefreshCw, AlertTriangle, CheckCircle, XCircle, FileText, 
  Search, Zap, Eye, ArrowUpRight, Filter 
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

const scoreBadge = (score: number) => {
  if (score >= 85) return <Badge className="bg-success/10 text-success">{score}</Badge>;
  if (score >= 60) return <Badge className="bg-warning/10 text-warning">{score}</Badge>;
  return <Badge className="bg-destructive/10 text-destructive">{score}</Badge>;
};

const statusColors: Record<string, string> = {
  PUBLISHED: "bg-success/10 text-success",
  DRAFT: "bg-warning/10 text-warning",
  REVIEW: "bg-primary/10 text-primary",
  MISSING: "bg-destructive/10 text-destructive",
  DISCOVERED: "bg-muted text-muted-foreground",
};

type FilterStatus = "ALL" | "MISSING" | "PUBLISHED" | "DRAFT" | "LOW_SCORE";

export default function SeoAuditDashboard() {
  const [running, setRunning] = useState(false);
  const [filter, setFilter] = useState<FilterStatus>("ALL");

  // Fetch page index
  const { data: pages, isLoading, refetch } = useQuery({
    queryKey: ["seo-page-index"],
    queryFn: async () => {
      const { data } = await supabase
        .from("seo_page_index")
        .select("*")
        .order("seo_score", { ascending: true })
        .limit(500);
      return data || [];
    },
  });

  // Fetch audit results
  const { data: audits } = useQuery({
    queryKey: ["seo-audit-results"],
    queryFn: async () => {
      const { data } = await supabase
        .from("seo_audit_results")
        .select("*")
        .order("seo_score", { ascending: true })
        .limit(500);
      return data || [];
    },
  });

  const auditMap = new Map<string, any>();
  for (const a of audits || []) {
    auditMap.set(a.page_id, a);
  }

  // Stats
  const totalPages = pages?.length || 0;
  const published = pages?.filter((p: any) => p.status === "PUBLISHED").length || 0;
  const missing = pages?.filter((p: any) => p.status === "MISSING").length || 0;
  const avgScore = totalPages > 0
    ? Math.round((pages?.reduce((sum: number, p: any) => sum + (p.seo_score || 0), 0) || 0) / totalPages)
    : 0;
  const needsImprovement = pages?.filter((p: any) => p.seo_score > 0 && p.seo_score < 80).length || 0;
  const highScore = pages?.filter((p: any) => p.seo_score >= 85).length || 0;

  // Filter
  const filteredPages = (pages || []).filter((p: any) => {
    if (filter === "ALL") return true;
    if (filter === "MISSING") return p.status === "MISSING";
    if (filter === "PUBLISHED") return p.status === "PUBLISHED";
    if (filter === "DRAFT") return p.status === "DRAFT";
    if (filter === "LOW_SCORE") return p.seo_score > 0 && p.seo_score < 80;
    return true;
  });

  const runAudit = async (mode: string) => {
    setRunning(true);
    try {
      const { data, error } = await supabase.functions.invoke("seo-audit-pages", {
        body: { mode },
      });
      if (error) throw error;
      toast.success(data?.message || "Audit complete");
      refetch();
    } catch (e: any) {
      toast.error(e.message || "Audit failed");
    } finally {
      setRunning(false);
    }
  };

  const publishPage = async (url: string) => {
    const audit = (pages || []).find((p: any) => p.url === url);
    if (!audit) return;
    
    if (audit.seo_score < 85) {
      toast.error("Cannot publish — SEO score must be ≥ 85");
      return;
    }

    // Update seo_pages status
    const { error } = await supabase
      .from("seo_pages")
      .update({ status: "PUBLISHED", is_published: true })
      .eq("url_path", url);

    if (error) {
      toast.error("Publish failed");
      return;
    }

    await supabase
      .from("seo_page_index")
      .update({ status: "PUBLISHED" })
      .eq("url", url);

    toast.success(`Published: ${url}`);
    refetch();
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO Page Audit</h1>
          <p className="text-sm text-muted-foreground">Discover, audit, improve, and publish SEO pages</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => runAudit("discover")} disabled={running} variant="outline" size="sm">
            <Search className="w-4 h-4 mr-1" />
            Discover
          </Button>
          <Button onClick={() => runAudit("audit")} disabled={running} variant="outline" size="sm">
            <Eye className="w-4 h-4 mr-1" />
            Audit
          </Button>
          <Button onClick={() => runAudit("improve")} disabled={running} variant="outline" size="sm">
            <Zap className="w-4 h-4 mr-1" />
            AI Improve
          </Button>
          <Button onClick={() => runAudit("full")} disabled={running} size="sm">
            <RefreshCw className={`w-4 h-4 mr-1 ${running ? "animate-spin" : ""}`} />
            Full Audit
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-6 gap-3">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <FileText className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">Total Pages</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{totalPages}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Published</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{published}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <XCircle className="w-4 h-4 text-destructive" />
            <span className="text-xs text-muted-foreground">Missing</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{missing}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <AlertTriangle className="w-4 h-4 text-warning" />
            <span className="text-xs text-muted-foreground">Needs Work</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{needsImprovement}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-1">
            <CheckCircle className="w-4 h-4 text-success" />
            <span className="text-xs text-muted-foreground">Score ≥ 85</span>
          </div>
          <p className="text-2xl font-bold text-foreground">{highScore}</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <span className="text-xs text-muted-foreground">Avg Score</span>
          <p className="text-2xl font-bold text-foreground">{avgScore}</p>
          <Progress value={avgScore} className="mt-1 h-1.5" />
        </div>
      </div>

      {/* Score Distribution */}
      <div className="bg-card border border-border rounded-xl p-4">
        <h3 className="text-sm font-semibold text-foreground mb-3">Score Distribution</h3>
        <div className="flex gap-2 h-20 items-end">
          {[
            { label: "0-30", color: "bg-destructive", count: pages?.filter((p: any) => p.seo_score > 0 && p.seo_score < 30).length || 0 },
            { label: "30-60", color: "bg-destructive/60", count: pages?.filter((p: any) => p.seo_score >= 30 && p.seo_score < 60).length || 0 },
            { label: "60-80", color: "bg-warning", count: pages?.filter((p: any) => p.seo_score >= 60 && p.seo_score < 80).length || 0 },
            { label: "80-90", color: "bg-success/60", count: pages?.filter((p: any) => p.seo_score >= 80 && p.seo_score < 90).length || 0 },
            { label: "90-100", color: "bg-success", count: pages?.filter((p: any) => p.seo_score >= 90).length || 0 },
            { label: "N/A", color: "bg-muted", count: pages?.filter((p: any) => p.seo_score === 0).length || 0 },
          ].map((bucket) => {
            const maxCount = Math.max(1, ...(pages || []).map(() => 1));
            const height = Math.max(4, (bucket.count / Math.max(totalPages, 1)) * 100);
            return (
              <div key={bucket.label} className="flex-1 flex flex-col items-center gap-1">
                <span className="text-xs text-muted-foreground">{bucket.count}</span>
                <div className={`w-full ${bucket.color} rounded-t`} style={{ height: `${height}%` }} />
                <span className="text-[10px] text-muted-foreground">{bucket.label}</span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex gap-2 flex-wrap">
        {([
          { key: "ALL", label: "All", count: totalPages },
          { key: "MISSING", label: "Missing", count: missing },
          { key: "LOW_SCORE", label: "Needs Improvement", count: needsImprovement },
          { key: "DRAFT", label: "Drafts", count: pages?.filter((p: any) => p.status === "DRAFT").length || 0 },
          { key: "PUBLISHED", label: "Published", count: published },
        ] as { key: FilterStatus; label: string; count: number }[]).map((tab) => (
          <Button
            key={tab.key}
            variant={filter === tab.key ? "default" : "outline"}
            size="sm"
            onClick={() => setFilter(tab.key)}
          >
            {tab.label} ({tab.count})
          </Button>
        ))}
      </div>

      {/* Pages Table */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">URL</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left p-3 font-medium text-muted-foreground">City</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Words</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Score</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Issues</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : filteredPages.length === 0 ? (
              <tr><td colSpan={8} className="p-8 text-center text-muted-foreground">
                No pages found. Run "Discover" to scan your site.
              </td></tr>
            ) : (
              filteredPages.slice(0, 100).map((page: any) => {
                const audit = auditMap.get(page.id);
                const actions = audit?.recommended_actions || [];
                return (
                  <tr key={page.id} className="border-t border-border hover:bg-muted/30">
                    <td className="p-3 font-mono text-xs text-foreground max-w-[250px] truncate">
                      {page.url}
                    </td>
                    <td className="p-3">
                      <Badge variant="outline" className="text-[10px]">{page.page_type}</Badge>
                    </td>
                    <td className="p-3 text-muted-foreground text-xs">{page.city || "—"}</td>
                    <td className="p-3 text-muted-foreground">
                      <span className={page.word_count < 800 ? "text-destructive" : "text-foreground"}>
                        {page.word_count || 0}
                      </span>
                    </td>
                    <td className="p-3">{page.seo_score > 0 ? scoreBadge(page.seo_score) : "—"}</td>
                    <td className="p-3">
                      <Badge className={statusColors[page.status] || "bg-muted text-muted-foreground"}>
                        {page.status}
                      </Badge>
                    </td>
                    <td className="p-3 text-xs text-muted-foreground max-w-[200px]">
                      {actions.length > 0 ? (
                        <span className="text-destructive">{actions.length} issues</span>
                      ) : page.status === "MISSING" ? (
                        <span className="text-destructive">Page not created</span>
                      ) : (
                        <span className="text-success">✓ Clean</span>
                      )}
                    </td>
                    <td className="p-3">
                      <div className="flex gap-1">
                        {page.status === "DRAFT" && page.seo_score >= 85 && (
                          <Button size="sm" variant="outline" className="h-7 text-xs" onClick={() => publishPage(page.url)}>
                            <ArrowUpRight className="w-3 h-3 mr-1" />
                            Publish
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
        {filteredPages.length > 100 && (
          <div className="p-3 text-center text-xs text-muted-foreground border-t border-border">
            Showing 100 of {filteredPages.length} pages
          </div>
        )}
      </div>
    </div>
  );
}
