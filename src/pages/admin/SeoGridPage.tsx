import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import { Sparkles, Loader2, MapPin, CheckCircle, Globe } from "lucide-react";
import { YARD_HUBS } from "@/lib/yard-hub-data";
import { GRID_SERVICE_TYPES, GRID_SIZES, getAllGridCities, getGridStats } from "@/lib/seo-grid";

export default function SeoGridPage() {
  const [generating, setGenerating] = useState<string | null>(null);
  const stats = getGridStats();
  const gridCities = getAllGridCities();

  const generatePage = useMutation({
    mutationFn: async (params: {
      city_name: string;
      city_slug: string;
      yard_name: string;
      yard_slug: string;
      yard_distance_miles: number;
      delivery_estimate: string;
      service_type?: string;
      size_yards?: number;
    }) => {
      const { data, error } = await supabase.functions.invoke("seo-generate-grid-page", { body: params });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      return data;
    },
    onSuccess: (data) => {
      toast.success(`Page generated: ${data.url_path} (${data.word_count} words)`);
      setGenerating(null);
    },
    onError: (err: any) => {
      toast.error(err.message || "Generation failed");
      setGenerating(null);
    },
  });

  const handleGenerate = (city: ReturnType<typeof getAllGridCities>[0], serviceType?: string, size?: number) => {
    const key = `${city.slug}-${serviceType || "city"}-${size || ""}`;
    setGenerating(key);
    generatePage.mutate({
      city_name: city.name,
      city_slug: city.slug,
      yard_name: city.yardName,
      yard_slug: city.yardHub,
      yard_distance_miles: city.distanceMiles,
      delivery_estimate: city.deliveryEstimate,
      service_type: serviceType,
      size_yards: size,
    });
  };

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Grid System</h1>
        <p className="text-muted-foreground mt-1">Bay Area yard-to-city SEO network</p>
      </div>

      {/* Grid Stats */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalYards}</p>
          <p className="text-xs text-muted-foreground">Yards</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalCities}</p>
          <p className="text-xs text-muted-foreground">Cities</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalSizePages}</p>
          <p className="text-xs text-muted-foreground">Size Pages</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalServicePages}</p>
          <p className="text-xs text-muted-foreground">Service Pages</p>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <p className="text-2xl font-bold text-primary">{stats.totalPages}</p>
          <p className="text-xs text-muted-foreground">Total Pages</p>
        </div>
      </div>

      {/* Yard Clusters */}
      {YARD_HUBS.map((yard) => (
        <div key={yard.slug} className="bg-card border border-border rounded-xl p-6">
          <div className="flex items-center gap-3 mb-4">
            <MapPin className="w-5 h-5 text-primary" />
            <h2 className="text-lg font-bold text-foreground">{yard.name}</h2>
            <Badge variant="outline">{yard.region}</Badge>
            <Badge>{yard.coverageCities.length} cities</Badge>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border text-left text-muted-foreground">
                  <th className="py-2 pr-4">City</th>
                  <th className="py-2 pr-4">Distance</th>
                  <th className="py-2 pr-4">Delivery</th>
                  <th className="py-2 pr-4">City Page</th>
                  <th className="py-2 pr-4">Sizes</th>
                  <th className="py-2">Services</th>
                </tr>
              </thead>
              <tbody>
                {yard.coverageCities.map((city) => {
                  const gridCity = gridCities.find(c => c.slug === city.slug);
                  if (!gridCity) return null;
                  return (
                    <tr key={city.slug} className="border-b border-border/50">
                      <td className="py-3 pr-4 font-medium text-foreground">{city.name}</td>
                      <td className="py-3 pr-4 text-muted-foreground">{city.distanceMiles} mi</td>
                      <td className="py-3 pr-4 text-muted-foreground">{city.deliveryEstimate}</td>
                      <td className="py-3 pr-4">
                        <Button
                          size="sm"
                          variant="outline"
                          disabled={generating !== null}
                          onClick={() => handleGenerate(gridCity, 'dumpster-rental')}
                        >
                          {generating === `${city.slug}-dumpster-rental-` ? <Loader2 className="w-3 h-3 animate-spin" /> : <Sparkles className="w-3 h-3" />}
                        </Button>
                      </td>
                      <td className="py-3 pr-4">
                        <div className="flex gap-1">
                          {GRID_SIZES.map(size => (
                            <Button
                              key={size}
                              size="sm"
                              variant="ghost"
                              className="text-xs px-2 h-7"
                              disabled={generating !== null}
                              onClick={() => handleGenerate(gridCity, 'dumpster-rental', size)}
                            >
                              {size}yd
                            </Button>
                          ))}
                        </div>
                      </td>
                      <td className="py-3">
                        <div className="flex gap-1 flex-wrap">
                          {GRID_SERVICE_TYPES.filter(s => s.slug !== 'dumpster-rental').slice(0, 3).map(svc => (
                            <Button
                              key={svc.slug}
                              size="sm"
                              variant="ghost"
                              className="text-xs px-2 h-7"
                              disabled={generating !== null}
                              onClick={() => handleGenerate(gridCity, svc.slug)}
                            >
                              {svc.label.split(' ')[0]}
                            </Button>
                          ))}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      ))}
    </div>
  );
}
