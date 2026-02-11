import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Globe, CheckCircle, AlertTriangle } from 'lucide-react';

export default function SeoAdminSitemap() {
  const { data: pages } = useQuery({
    queryKey: ['admin-seo-sitemap-pages'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_pages').select('url_path, is_published, page_type, canonical_url, title, meta_description').order('url_path');
      return data || [];
    },
  });

  const published = pages?.filter(p => p.is_published) || [];
  const drafts = pages?.filter(p => !p.is_published) || [];

  // QA checks
  const duplicateCanonicals = published.filter((p, i, arr) =>
    p.canonical_url && arr.findIndex(x => x.canonical_url === p.canonical_url) !== i
  );
  const missingMeta = published.filter(p => !p.meta_description || p.meta_description.length < 50);
  const longTitles = published.filter(p => p.title.length > 60);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">Sitemap & QA</h1>
        <p className="text-muted-foreground">SEO page health and sitemap validation</p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-primary">{published.length}</div>
          <div className="text-sm text-muted-foreground">Published URLs</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-3xl font-bold text-muted-foreground">{drafts.length}</div>
          <div className="text-sm text-muted-foreground">Draft Pages</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className={`text-3xl font-bold ${duplicateCanonicals.length ? 'text-destructive' : 'text-primary'}`}>{duplicateCanonicals.length}</div>
          <div className="text-sm text-muted-foreground">Duplicate Canonicals</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className={`text-3xl font-bold ${missingMeta.length ? 'text-orange-500' : 'text-primary'}`}>{missingMeta.length}</div>
          <div className="text-sm text-muted-foreground">Weak Meta Desc</div>
        </div>
      </div>

      {/* QA Issues */}
      {(duplicateCanonicals.length > 0 || missingMeta.length > 0 || longTitles.length > 0) && (
        <div className="space-y-3">
          <h2 className="font-semibold text-foreground">QA Issues</h2>
          {duplicateCanonicals.map(p => (
            <div key={p.url_path} className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 text-destructive shrink-0" />
              <span className="text-foreground">Duplicate canonical: <code>{p.canonical_url}</code> on {p.url_path}</span>
            </div>
          ))}
          {longTitles.map(p => (
            <div key={p.url_path} className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-foreground">Title too long ({p.title.length} chars): {p.url_path}</span>
            </div>
          ))}
          {missingMeta.map(p => (
            <div key={p.url_path} className="flex items-center gap-2 p-3 bg-orange-500/10 border border-orange-500/20 rounded-lg text-sm">
              <AlertTriangle className="w-4 h-4 text-orange-500 shrink-0" />
              <span className="text-foreground">Weak meta description: {p.url_path}</span>
            </div>
          ))}
        </div>
      )}

      {/* Published URLs */}
      <div>
        <h2 className="font-semibold text-foreground mb-3">Published Sitemap URLs ({published.length})</h2>
        <div className="bg-card border border-border rounded-xl divide-y divide-border max-h-[400px] overflow-auto">
          {published.map(p => (
            <div key={p.url_path} className="flex items-center justify-between p-3 text-sm hover:bg-muted/30">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-primary shrink-0" />
                <code className="text-foreground">{p.url_path}</code>
                <Badge variant="outline" className="text-xs">{p.page_type}</Badge>
              </div>
              <a href={p.url_path} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                <Globe className="w-3.5 h-3.5" />
              </a>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
