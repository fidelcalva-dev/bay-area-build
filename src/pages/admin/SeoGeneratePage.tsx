import { useQuery, useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useState } from "react";
import { toast } from "sonner";
import { Sparkles, Loader2 } from "lucide-react";

export default function SeoGeneratePage() {
  const [cityId, setCityId] = useState("");
  const [serviceId, setServiceId] = useState("");

  const { data: cities } = useQuery({
    queryKey: ["seo-cities-active"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_cities").select("id, city_name, city_slug").eq("is_active", true).order("city_name");
      return data || [];
    },
  });

  const { data: services } = useQuery({
    queryKey: ["seo-services-active"],
    queryFn: async () => {
      const { data } = await supabase.from("seo_services").select("*").eq("active", true).order("display_name");
      return data || [];
    },
  });

  const generate = useMutation({
    mutationFn: async () => {
      const city = cities?.find((c: any) => c.id === cityId);
      const service = services?.find((s: any) => s.id === serviceId);
      if (!city || !service) throw new Error("Select city and service");

      const { data, error } = await supabase.functions.invoke("seo-generate-page", {
        body: {
          location_id: city.id,
          service_id: service.id,
          city_name: city.city_name,
          city_slug: city.city_slug,
          service_type: service.service_type,
          service_slug: service.slug,
          size_yards: service.size_yards,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Page generated: ${data.url_path} (${data.word_count} words, status: ${data.status})`);
    },
    onError: (e: any) => toast.error(e.message || "Generation failed"),
  });

  return (
    <div className="space-y-6 max-w-2xl">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Sparkles className="w-6 h-6" /> Generate SEO Page
        </h1>
        <p className="text-sm text-muted-foreground">AI-powered page generation with approval workflow</p>
      </div>

      <div className="bg-card border border-border rounded-xl p-6 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">City</label>
          <Select value={cityId} onValueChange={setCityId}>
            <SelectTrigger><SelectValue placeholder="Select city" /></SelectTrigger>
            <SelectContent>
              {cities?.map((c: any) => (
                <SelectItem key={c.id} value={c.id}>{c.city_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Service / Size</label>
          <Select value={serviceId} onValueChange={setServiceId}>
            <SelectTrigger><SelectValue placeholder="Select service" /></SelectTrigger>
            <SelectContent>
              {services?.map((s: any) => (
                <SelectItem key={s.id} value={s.id}>{s.display_name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Button
          onClick={() => generate.mutate()}
          disabled={!cityId || !serviceId || generate.isPending}
          className="w-full"
        >
          {generate.isPending ? (
            <><Loader2 className="w-4 h-4 animate-spin mr-2" /> Generating...</>
          ) : (
            <><Sparkles className="w-4 h-4 mr-2" /> Generate Page</>
          )}
        </Button>

        {generate.data && (
          <div className="bg-success/10 border border-success/30 rounded-lg p-4 text-sm">
            <p className="font-medium text-success">Page created successfully</p>
            <p className="text-muted-foreground mt-1">URL: {generate.data.url_path}</p>
            <p className="text-muted-foreground">Words: {generate.data.word_count}</p>
            <p className="text-muted-foreground">Status: {generate.data.status}</p>
          </div>
        )}
      </div>
    </div>
  );
}
