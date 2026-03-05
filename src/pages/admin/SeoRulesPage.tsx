import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useState } from "react";
import { toast } from "sonner";
import { Save, Settings } from "lucide-react";

export default function SeoRulesPage() {
  const queryClient = useQueryClient();
  const [edits, setEdits] = useState<Record<string, string>>({});

  const { data: rules, isLoading } = useQuery({
    queryKey: ["seo-rules"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_rules").select("*").order("key");
      return data || [];
    },
  });

  const updateRule = useMutation({
    mutationFn: async ({ id, value_json }: { id: string; value_json: any }) => {
      const { error } = await supabase
        .from("seo_rules")
        .update({ value_json, updated_at: new Date().toISOString() })
        .eq("id", id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["seo-rules"] });
      toast.success("Rule updated");
      setEdits({});
    },
    onError: (e: any) => toast.error(e.message),
  });

  const handleSave = (rule: any) => {
    const newVal = edits[rule.id];
    if (newVal === undefined) return;
    try {
      const parsed = JSON.parse(newVal);
      updateRule.mutate({ id: rule.id, value_json: parsed });
    } catch {
      updateRule.mutate({ id: rule.id, value_json: newVal });
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Settings className="w-6 h-6" /> SEO Content Rules
        </h1>
        <p className="text-sm text-muted-foreground">Guardrails for AI page generation</p>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50">
            <tr>
              <th className="text-left p-3 font-medium text-muted-foreground">Rule Key</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Value</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Description</th>
              <th className="text-left p-3 font-medium text-muted-foreground w-20">Action</th>
            </tr>
          </thead>
          <tbody>
            {isLoading ? (
              <tr><td colSpan={4} className="p-8 text-center text-muted-foreground">Loading...</td></tr>
            ) : (
              rules?.map((rule: any) => (
                <tr key={rule.id} className="border-t border-border">
                  <td className="p-3 font-mono text-xs text-foreground">{rule.key}</td>
                  <td className="p-3">
                    <Input
                      value={edits[rule.id] !== undefined ? edits[rule.id] : JSON.stringify(rule.value_json)}
                      onChange={(e) => setEdits({ ...edits, [rule.id]: e.target.value })}
                      className="h-8 text-sm"
                    />
                  </td>
                  <td className="p-3 text-muted-foreground text-xs">{rule.description || "—"}</td>
                  <td className="p-3">
                    {edits[rule.id] !== undefined && (
                      <Button size="sm" variant="outline" onClick={() => handleSave(rule)}>
                        <Save className="w-3 h-3" />
                      </Button>
                    )}
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
