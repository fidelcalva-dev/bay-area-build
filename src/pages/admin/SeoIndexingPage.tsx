// Admin SEO Indexing Page — Track indexation status and trigger sitemap pings
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import { Globe, RefreshCw, CheckCircle, Clock, AlertTriangle } from 'lucide-react';
import { BUSINESS_INFO } from '@/lib/seo';
import { SEO_ZIP_DATA } from '@/lib/seo-zips';
import { SEO_JOB_TYPES } from '@/lib/seo-jobs';
import { SEO_MATERIALS } from '@/lib/seo-engine';

export default function SeoIndexingPage() {
  const [pinging, setPinging] = useState(false);
  const [lastPing, setLastPing] = useState<string | null>(null);

  const { data: cities } = useQuery({
    queryKey: ['admin-seo-indexing-cities'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('city_slug, city_name, is_active, common_sizes_json').eq('is_active', true).order('city_name');
      return data || [];
    },
  });

  // Build all expected SEO URLs
  const allUrls: Array<{ url: string; type: string; status: 'live' | 'pending' }> = [];

  for (const city of (cities || [])) {
    allUrls.push({ url: `/dumpster-rental/${city.city_slug}`, type: 'City', status: 'live' });
    const sizes: number[] = Array.isArray(city.common_sizes_json) ? (city.common_sizes_json as number[]) : [10, 20, 30, 40];
    for (const sz of sizes) {
      allUrls.push({ url: `/dumpster-rental/${city.city_slug}/${sz}-yard`, type: 'City+Size', status: 'live' });
    }
    for (const m of SEO_MATERIALS) {
      allUrls.push({ url: `/dumpster-rental/${city.city_slug}/${m.slug}`, type: 'City+Material', status: 'live' });
    }
    for (const j of SEO_JOB_TYPES) {
      allUrls.push({ url: `/dumpster-rental/${city.city_slug}/${j.slug}`, type: 'City+Job', status: 'live' });
    }
  }

  for (const z of SEO_ZIP_DATA.filter(z => z.tier === 'A')) {
    allUrls.push({ url: `/service-area/${z.zip}/dumpster-rental`, type: 'ZIP', status: 'live' });
  }

  const handlePingSitemap = async () => {
    setPinging(true);
    try {
      const sitemapUrl = `${BUSINESS_INFO.url}/sitemap.xml`;
      // Best-effort ping to Google
      await fetch(`https://www.google.com/ping?sitemap=${encodeURIComponent(sitemapUrl)}`, { mode: 'no-cors' });
      setLastPing(new Date().toISOString());
      toast.success('Sitemap ping sent to Google');
    } catch {
      toast.info('Sitemap ping attempted (may be blocked by CORS — this is normal)');
      setLastPing(new Date().toISOString());
    } finally {
      setPinging(false);
    }
  };

  const typeCounts = allUrls.reduce((acc, u) => {
    acc[u.type] = (acc[u.type] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Indexation</h1>
        <p className="text-muted-foreground">Track page deployment and trigger sitemap pings.</p>
      </div>

      {/* Actions */}
      <div className="flex flex-wrap gap-3">
        <Button onClick={handlePingSitemap} disabled={pinging} className="gap-2">
          <RefreshCw className={`w-4 h-4 ${pinging ? 'animate-spin' : ''}`} />
          Ping Google Sitemap
        </Button>
        <Button variant="outline" asChild>
          <a href="/sitemap.xml" target="_blank" rel="noopener noreferrer" className="gap-2">
            <Globe className="w-4 h-4" /> View Sitemap
          </a>
        </Button>
        {lastPing && (
          <span className="text-xs text-muted-foreground self-center">
            Last ping: {new Date(lastPing).toLocaleString()}
          </span>
        )}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        {Object.entries(typeCounts).map(([type, count]) => (
          <div key={type} className="bg-card border border-border rounded-xl p-4 text-center">
            <div className="text-2xl font-bold text-primary">{count}</div>
            <div className="text-xs text-muted-foreground">{type}</div>
          </div>
        ))}
        <div className="bg-card border border-border rounded-xl p-4 text-center">
          <div className="text-2xl font-bold text-foreground">{allUrls.length}</div>
          <div className="text-xs text-muted-foreground">Total URLs</div>
        </div>
      </div>

      {/* URL List */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">All SEO URLs ({allUrls.length})</h2>
        </div>
        <div className="max-h-[500px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">URL</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {allUrls.map((u, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3">
                    <a href={u.url} target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                      <code className="text-xs">{u.url}</code>
                    </a>
                  </td>
                  <td className="p-3"><Badge variant="outline" className="text-xs">{u.type}</Badge></td>
                  <td className="p-3 text-center">
                    <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
