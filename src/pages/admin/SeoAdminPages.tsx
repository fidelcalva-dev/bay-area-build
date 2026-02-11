import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Eye, EyeOff, Globe, Code, ExternalLink } from 'lucide-react';
import { useState } from 'react';

export default function SeoAdminPages() {
  const queryClient = useQueryClient();
  const [schemaPreview, setSchemaPreview] = useState<string | null>(null);

  const { data: pages, isLoading } = useQuery({
    queryKey: ['admin-seo-pages'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('seo_pages')
        .select('*, seo_cities(city_name)')
        .order('url_path');
      if (error) throw error;
      return data;
    },
  });

  const togglePublished = useMutation({
    mutationFn: async ({ id, is_published }: { id: string; is_published: boolean }) => {
      const { error } = await supabase.from('seo_pages').update({ is_published }).eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['admin-seo-pages'] });
      toast.success('Page updated');
    },
  });

  if (isLoading) return <div className="p-6">Loading...</div>;

  const pageTypeColors: Record<string, string> = {
    CITY: 'default',
    CITY_SIZE: 'secondary',
    CITY_MATERIAL: 'outline',
    CITY_COMMERCIAL: 'destructive',
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Pages</h1>
        <p className="text-muted-foreground">{pages?.length || 0} pages generated</p>
      </div>

      {schemaPreview && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4" onClick={() => setSchemaPreview(null)}>
          <div className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[80vh] overflow-auto p-6" onClick={e => e.stopPropagation()}>
            <h3 className="font-semibold text-foreground mb-4">Schema JSON-LD Preview</h3>
            <pre className="text-xs bg-muted p-4 rounded-lg overflow-auto">{schemaPreview}</pre>
            <Button className="mt-4" onClick={() => setSchemaPreview(null)}>Close</Button>
          </div>
        </div>
      )}

      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/50">
              <th className="text-left p-3 font-medium text-muted-foreground">URL</th>
              <th className="text-left p-3 font-medium text-muted-foreground">City</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
              <th className="text-left p-3 font-medium text-muted-foreground">Title</th>
              <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
              <th className="text-right p-3 font-medium text-muted-foreground">Actions</th>
            </tr>
          </thead>
          <tbody>
            {pages?.map((p: any) => (
              <tr key={p.id} className="border-b border-border last:border-0 hover:bg-muted/30">
                <td className="p-3">
                  <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{p.url_path}</code>
                </td>
                <td className="p-3 text-muted-foreground">{p.seo_cities?.city_name || '-'}</td>
                <td className="p-3">
                  <Badge variant={pageTypeColors[p.page_type] as any || 'outline'}>{p.page_type}</Badge>
                </td>
                <td className="p-3 text-foreground max-w-[200px] truncate">{p.title}</td>
                <td className="p-3 text-center">
                  <Badge variant={p.is_published ? 'default' : 'secondary'}>
                    {p.is_published ? 'Published' : 'Draft'}
                  </Badge>
                </td>
                <td className="p-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <Button variant="ghost" size="sm" onClick={() => togglePublished.mutate({ id: p.id, is_published: !p.is_published })}>
                      {p.is_published ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => setSchemaPreview(JSON.stringify(p.schema_json, null, 2))}>
                      <Code className="w-3.5 h-3.5" />
                    </Button>
                    <Button variant="ghost" size="sm" asChild>
                      <a href={p.url_path} target="_blank" rel="noopener noreferrer"><ExternalLink className="w-3.5 h-3.5" /></a>
                    </Button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
