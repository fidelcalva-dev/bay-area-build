import { BUILD_INFO } from '@/lib/buildInfo';
import { Helmet } from 'react-helmet-async';

/**
 * /admin/qa/build-info — lightweight page that exposes the running
 * build fingerprint so staff can verify deployments.
 */
export default function BuildInfo() {
  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-md w-full font-mono text-sm space-y-3">
          <h1 className="text-lg font-bold text-foreground mb-4">Build Info</h1>
          <Row label="HOME_SOURCE" value="src/pages/Index.tsx" />
          <Row label="BUILD_TIME" value={BUILD_INFO.timestamp} />
          <Row label="ENV" value={BUILD_INFO.env} />
          <Row label="SW_STRATEGY" value="NetworkFirst (index.html)" />
          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            If BUILD_TIME does not match the latest publish, hard-refresh or clear the service worker cache.
          </p>
        </div>
      </div>
    </>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex justify-between gap-4">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-foreground text-right break-all">{value}</span>
    </div>
  );
}
