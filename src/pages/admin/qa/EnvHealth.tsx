import { BUILD_INFO } from '@/lib/buildInfo';
import { Helmet } from 'react-helmet-async';

/**
 * /admin/qa/env-health — shows environment configuration modes
 * for staff debugging. Does NOT expose secrets.
 */
export default function EnvHealth() {
  const envLabel = (() => {
    const host = window.location.hostname;
    if (host === 'calsandumpsterspro.com') return 'PRODUCTION';
    if (host === 'calsandumpsterspro.com') return 'PRODUCTION';
    if (host.includes('lovable.app') || host.includes('lovableproject.com')) return 'PREVIEW';
    if (host === 'localhost') return 'LOCAL';
    return 'UNKNOWN';
  })();

  const swStatus = 'serviceWorker' in navigator ? 'Supported' : 'Not supported';

  const configModes = [
    { key: 'VITE_MODE', value: import.meta.env.MODE },
    { key: 'ENV_LABEL', value: envLabel },
    { key: 'BUILD_TIME', value: BUILD_INFO.timestamp },
    { key: 'SW_SUPPORT', value: swStatus },
    { key: 'SW_STRATEGY', value: 'NetworkFirst (index.html)' },
    { key: 'HOME_SOURCE', value: 'src/pages/Index.tsx' },
    { key: 'CRM_DOMAIN', value: 'calsandumpsterspro.com (path-based: /admin, /sales, etc.)' },
    { key: 'PUBLIC_DOMAIN', value: 'calsandumpsterspro.com' },
    { key: 'WWW_REDIRECT', value: 'www → non-www (enforced)' },
    { key: 'HTTPS_ENFORCE', value: 'Yes (client-side)' },
  ];

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="bg-card border border-border rounded-xl p-8 max-w-lg w-full font-mono text-sm space-y-3">
          <h1 className="text-lg font-bold text-foreground mb-4">Environment Health</h1>
          {configModes.map(({ key, value }) => (
            <div key={key} className="flex justify-between gap-4">
              <span className="text-muted-foreground">{key}</span>
              <span className="text-foreground text-right break-all">{value}</span>
            </div>
          ))}
          <p className="text-xs text-muted-foreground pt-4 border-t border-border">
            No secrets are exposed. Only configuration modes and environment labels are shown.
          </p>
        </div>
      </div>
    </>
  );
}
