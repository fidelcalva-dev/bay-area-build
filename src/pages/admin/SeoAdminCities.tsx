import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { generateAllPagesForCity, type SeoCity } from '@/lib/seo-engine';
import { Plus, RefreshCw, Eye, EyeOff, Globe, FileText } from 'lucide-react';

export default function SeoAdminCities() {
  const queryClient = useQueryClient();
  const [generating, setGenerating] = useState<string | null>(null);

  const { data: cities, isLoading } = useQuery({
    queryKey: ['admin-seo-cities'],
    queryFn: async () => {
      const { data, error } = await supabase.from('seo_cities').select('*').order('city_name');
      if (error) throw error;
      return data as SeoCity[];
    },
  });

  const { data: pageStats } = useQuery({
    queryKey: ['admin-seo-page-stats'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_pages').select('city_id, is_published');
      const stats: Record<string, { total: number; published: number }> = {};
      for (const p of data || []) {
        if (!stats[p.city_id]) stats[p.city_id] = { total: 0, published: 0 };
        stats[p.city_id].total++;
        if (p.is_published) stats[p.city_id].published++;
      }
      return stats;
    },
  });

  const toggleActive = useMutation({
    mutationFn: async ({ id, is_active }: { id: string; is_active: boolean }) => {
      const { error } = await supabase.from('seo_cities').update({ is_active }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seo-cities'] });
      toast.success('City updated');
    },
  });

  const generatePages = async (city: SeoCity) => {
    setGenerating(city.id);
    try {
      const pages = generateAllPagesForCity(city);

      for (const page of pages) {
        // Upsert by url_path
        const { error } = await supabase.from('seo_pages').upsert(
          {
            ...page,
            city_id: city.id,
            is_published: true,
            last_generated_at: new Date().toISOString(),
            sections_json: page.sections_json as any,
            faq_json: page.faq_json as any,
            schema_json: page.schema_json as any,
          },
          { onConflict: 'url_path' }
        );
        if (error) throw error;
      }

      toast.success(`Generated ${pages.length} pages for ${city.city_name}`);
      queryClient.invalidateQueries({ queryKey: ['admin-seo-page-stats'] });
    } catch (err: any) {
      toast.error(`Error: ${err.message}`);
    } finally {
      setGenerating(null);
    }
  };

  if (isLoading) return <div className="p-6">Loading...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-foreground">SEO City Engine</h1>
          <p className="text-muted-foreground">Manage cities and auto-generate SEO landing pages</p>
        </div>
      </div>

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">City</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Market</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Yard</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Pages</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {cities?.map(city => {
              const stats = pageStats?.[city.id];
              return (
                <tr key={city.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <div className="font-medium text-foreground">{city.city_name}, {city.state}</div>
                    <div className="text-xs text-muted-foreground">{city.city_slug} | {city.county}</div>
                  </td>
                  <td className="p-3">
                    <Badge variant="outline">{city.market_code || 'N/A'}</Badge>
                  </td>
                  <td className="p-3 text-muted-foreground">{city.primary_yard_id || 'N/A'}</td>
                  <td className="p-3 text-center">
                    {stats ? (
                      <span className="text-foreground">{stats.published}/{stats.total}</span>
                    ) : (
                      <span className="text-muted-foreground">0</span>
                    )}
                  </td>
                  <td className="p-3 text-center">
                    <Badge variant={city.is_active ? 'default' : 'secondary'}>
                      {city.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </td>
                  <td className="p-3 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => generatePages(city)}
                        disabled={generating === city.id}
                      >
                        {generating === city.id ? (
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                        ) : (
                          <FileText className="w-3.5 h-3.5" />
                        )}
                        <span className="ml-1.5">Generate</span>
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => toggleActive.mutate({ id: city.id, is_active: !city.is_active })}
                      >
                        {city.is_active ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                      </Button>
                      <Button variant="ghost" size="sm" asChild>
                        <a href={`/dumpster-rental/${city.city_slug}`} target="_blank" rel="noopener noreferrer">
                          <Globe className="w-3.5 h-3.5" />
                        </a>
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
