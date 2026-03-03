import { BUILD_INFO } from '@/lib/buildInfo';
import { Helmet } from 'react-helmet-async';

export default function BuildHealth() {
  const pwaEnabled = import.meta.env.MODE === 'production';
  const chunkStrategy = 'manualChunks: react, supabase, ui, radix, query, charts, leaflet, motion, date-fns, router';

  const rows = [
    { key: 'BUILD_TIME', value: BUILD_INFO.timestamp },
    { key: 'ENV', value: BUILD_INFO.env },
    { key: 'PWA_ENABLED', value: pwaEnabled ? 'Yes' : 'No (dev/preview)' },
    { key: 'CSS_CODE_SPLIT', value: 'false (single file)' },
    { key: 'SOURCEMAP', value: 'false' },
    { key: 'CHUNK_STRATEGY', value: chunkStrategy },
  ];

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-lg w-full font-mono text-sm space-y-3">
          <h1 className="text-lg font-bold text-foreground mb-4">Build Health</h1>
          {rows.map(({ key, value }) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{key}</span>
              <span className="text-foreground text-right break-all">{value}</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            PWA is disabled in dev/preview builds to reduce output file count and prevent log buffer truncation.
          </p>
        </div>
      </div>
    </>
  );
}
