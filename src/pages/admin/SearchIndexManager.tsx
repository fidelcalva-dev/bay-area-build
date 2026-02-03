import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { RefreshCw, Database, Users, Building2, CheckCircle, AlertCircle, Play } from "lucide-react";
import { toast } from "sonner";

interface IndexStats {
  entity_type: string;
  total_count: number;
  indexed_count: number;
  coverage_pct: number;
}

interface BackfillResult {
  entity_type: string;
  total: number;
  indexed: number;
  errors: number;
  duration_ms: number;
}

export default function SearchIndexManager() {
  const queryClient = useQueryClient();
  const [backfillResults, setBackfillResults] = useState<BackfillResult[]>([]);

  // Fetch index stats
  const { data: stats, isLoading: statsLoading, refetch: refetchStats } = useQuery({
    queryKey: ["search-index-stats"],
    queryFn: async () => {
      const { data, error } = await supabase.rpc("get_search_index_stats");
      if (error) throw error;
      return data as IndexStats[];
    },
  });

  // Fetch recent index entries
  const { data: recentEntries, isLoading: entriesLoading } = useQuery({
    queryKey: ["search-index-recent"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("search_index")
        .select("*")
        .order("updated_at", { ascending: false })
        .limit(20);
      if (error) throw error;
      return data;
    },
  });

  // Backfill mutation
  const backfillMutation = useMutation({
    mutationFn: async (entityTypes: string[]) => {
      const { data, error } = await supabase.functions.invoke("search-index-backfill", {
        body: { entity_types: entityTypes, batch_size: 50 },
      });
      if (error) throw error;
      return data;
    },
    onSuccess: (data) => {
      setBackfillResults(data.results || []);
      toast.success("Backfill completed successfully");
      refetchStats();
      queryClient.invalidateQueries({ queryKey: ["search-index-recent"] });
    },
    onError: (error) => {
      toast.error(`Backfill failed: ${error.message}`);
    },
  });

  const getEntityIcon = (type: string) => {
    switch (type) {
      case "CUSTOMER":
        return <Building2 className="h-4 w-4" />;
      case "CONTACT":
        return <Users className="h-4 w-4" />;
      default:
        return <Database className="h-4 w-4" />;
    }
  };

  const getCoverageColor = (pct: number) => {
    if (pct >= 100) return "text-green-600";
    if (pct >= 80) return "text-yellow-600";
    return "text-red-600";
  };

  return (
    <div className="space-y-6 p-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Search Index Manager</h1>
          <p className="text-muted-foreground">
            Manage and monitor the global search index for customers and contacts
          </p>
        </div>
        <Button
          onClick={() => refetchStats()}
          variant="outline"
          size="sm"
          disabled={statsLoading}
        >
          <RefreshCw className={`h-4 w-4 mr-2 ${statsLoading ? "animate-spin" : ""}`} />
          Refresh
        </Button>
      </div>

      {/* Coverage Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {stats?.map((stat) => (
          <Card key={stat.entity_type}>
            <CardHeader className="pb-2">
              <div className="flex items-center gap-2">
                {getEntityIcon(stat.entity_type)}
                <CardTitle className="text-lg">{stat.entity_type}</CardTitle>
              </div>
              <CardDescription>
                {stat.indexed_count} / {stat.total_count} indexed
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Progress value={stat.coverage_pct} className="h-2" />
                <div className="flex justify-between text-sm">
                  <span className={getCoverageColor(stat.coverage_pct)}>
                    {stat.coverage_pct}% coverage
                  </span>
                  {stat.coverage_pct >= 100 ? (
                    <CheckCircle className="h-4 w-4 text-green-600" />
                  ) : (
                    <AlertCircle className="h-4 w-4 text-yellow-600" />
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Backfill Controls */}
      <Card>
        <CardHeader>
          <CardTitle>Backfill Operations</CardTitle>
          <CardDescription>
            Re-index existing records to populate the search index
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => backfillMutation.mutate(["CUSTOMER"])}
              disabled={backfillMutation.isPending}
              variant="outline"
            >
              <Building2 className="h-4 w-4 mr-2" />
              Backfill Customers
            </Button>
            <Button
              onClick={() => backfillMutation.mutate(["CONTACT"])}
              disabled={backfillMutation.isPending}
              variant="outline"
            >
              <Users className="h-4 w-4 mr-2" />
              Backfill Contacts
            </Button>
            <Button
              onClick={() => backfillMutation.mutate(["CUSTOMER", "CONTACT"])}
              disabled={backfillMutation.isPending}
            >
              {backfillMutation.isPending ? (
                <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Play className="h-4 w-4 mr-2" />
              )}
              Backfill All
            </Button>
          </div>

          {/* Backfill Results */}
          {backfillResults.length > 0 && (
            <div className="mt-4 rounded-lg border p-4 bg-muted/50">
              <h4 className="font-medium mb-2">Last Backfill Results</h4>
              <div className="space-y-2">
                {backfillResults.map((result) => (
                  <div key={result.entity_type} className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-2">
                      {getEntityIcon(result.entity_type)}
                      {result.entity_type}
                    </span>
                    <span className="text-muted-foreground">
                      {result.indexed}/{result.total} indexed
                      {result.errors > 0 && (
                        <Badge variant="destructive" className="ml-2">
                          {result.errors} errors
                        </Badge>
                      )}
                      <span className="ml-2">({result.duration_ms}ms)</span>
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Recent Index Entries */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Index Entries</CardTitle>
          <CardDescription>
            Latest 20 entries in the search index
          </CardDescription>
        </CardHeader>
        <CardContent>
          {entriesLoading ? (
            <div className="flex items-center justify-center py-8">
              <RefreshCw className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : recentEntries && recentEntries.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Type</TableHead>
                  <TableHead>Title</TableHead>
                  <TableHead>Subtitle</TableHead>
                  <TableHead>Phone</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Updated</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {recentEntries.map((entry) => (
                  <TableRow key={entry.id}>
                    <TableCell>
                      <Badge variant="outline" className="flex items-center gap-1 w-fit">
                        {getEntityIcon(entry.entity_type)}
                        {entry.entity_type}
                      </Badge>
                    </TableCell>
                    <TableCell className="font-medium max-w-[200px] truncate">
                      {entry.title}
                    </TableCell>
                    <TableCell className="text-muted-foreground max-w-[150px] truncate">
                      {entry.subtitle || "-"}
                    </TableCell>
                    <TableCell className="font-mono text-sm">
                      {entry.phone_normalized || "-"}
                    </TableCell>
                    <TableCell>
                      <Badge variant={entry.status === "active" ? "default" : "secondary"}>
                        {entry.status}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {new Date(entry.updated_at).toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No index entries found. Run a backfill to populate the index.
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
