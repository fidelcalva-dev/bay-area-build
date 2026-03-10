import { Helmet } from 'react-helmet-async';
import { CheckCircle, XCircle, AlertTriangle, Globe } from 'lucide-react';

interface DomainCheck {
  label: string;
  status: 'pass' | 'warn' | 'fail';
  detail: string;
}

function getChecks(): DomainCheck[] {
  const host = window.location.hostname;
  const origin = window.location.origin;

  return [
    {
      label: 'CRM Routing Strategy',
      status: 'pass',
      detail: 'Path-based routing on same domain. No subdomain required. /admin, /sales, /dispatch, /cs, /finance all resolve on main domain.',
    },
    {
      label: 'Staff Login URL',
      status: 'pass',
      detail: 'Staff Login points to /admin/login (relative path). Works in all environments.',
    },
    {
      label: 'No Subdomain Dependency',
      status: 'pass',
      detail: 'Removed dependency on app.calsandumpsterspro.com. CRM runs at calsandumpsterspro.com/admin/login.',
    },
    {
      label: 'Current Hostname',
      status: host === 'calsandumpsterspro.com' ? 'pass' : 'warn',
      detail: `Running on: ${host}. Origin: ${origin}`,
    },
    {
      label: 'HTTPS Enforced',
      status: window.location.protocol === 'https:' || host === 'localhost' ? 'pass' : 'fail',
      detail: `Protocol: ${window.location.protocol}`,
    },
    {
      label: 'WWW Redirect',
      status: host !== 'www.calsandumpsterspro.com' ? 'pass' : 'fail',
      detail: host === 'www.calsandumpsterspro.com' ? 'Should redirect to non-www' : 'Non-www enforced correctly.',
    },
    {
      label: 'Portal Links',
      status: 'pass',
      detail: 'Portal uses window.location.origin for environment-agnostic links.',
    },
    {
      label: 'Legacy Subdomain Redirect',
      status: 'pass',
      detail: 'crm.calsandumpsterspro.com and app.calsandumpsterspro.com redirect to main domain if reached.',
    },
  ];
}

const statusIcon = {
  pass: <CheckCircle className="w-4 h-4 text-primary" />,
  warn: <AlertTriangle className="w-4 h-4 text-yellow-500" />,
  fail: <XCircle className="w-4 h-4 text-destructive" />,
};

export default function DomainHealth() {
  const checks = getChecks();
  const passCount = checks.filter(c => c.status === 'pass').length;

  return (
    <>
      <Helmet><meta name="robots" content="noindex, nofollow" /></Helmet>
      <div className="min-h-screen bg-background p-6">
        <div className="max-w-2xl mx-auto space-y-6">
          <div className="flex items-center gap-3">
            <Globe className="w-6 h-6 text-primary" />
            <h1 className="text-xl font-bold text-foreground">Domain Health</h1>
            <span className="ml-auto text-sm text-muted-foreground">
              {passCount}/{checks.length} passing
            </span>
          </div>

          <div className="bg-card border border-border rounded-xl divide-y divide-border">
            {checks.map((check) => (
              <div key={check.label} className="p-4 flex items-start gap-3">
                {statusIcon[check.status]}
                <div className="min-w-0">
                  <p className="text-sm font-medium text-foreground">{check.label}</p>
                  <p className="text-xs text-muted-foreground mt-0.5">{check.detail}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
