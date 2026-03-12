import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2, AlertTriangle, XCircle, ExternalLink } from 'lucide-react';
import { CITATION_PLATFORMS, BUSINESS_INFO } from '@/config/localPresenceConfig';

interface CitationEntry {
  platformId: string;
  platformName: string;
  status: 'verified' | 'claimed' | 'unclaimed' | 'needs_update';
  napConsistent: boolean;
  listingUrl?: string;
  duplicateRisk: boolean;
  notes?: string;
}

const CITATIONS: CitationEntry[] = [
  { platformId: 'google', platformName: 'Google Business Profile', status: 'verified', napConsistent: true, duplicateRisk: false },
  { platformId: 'bing', platformName: 'Bing Places', status: 'claimed', napConsistent: true, duplicateRisk: false, notes: 'Imported from Google. Needs verification.' },
  { platformId: 'apple', platformName: 'Apple Business Connect', status: 'unclaimed', napConsistent: false, duplicateRisk: false, notes: 'Not yet claimed.' },
  { platformId: 'yelp', platformName: 'Yelp', status: 'unclaimed', napConsistent: false, duplicateRisk: true, notes: 'May have auto-generated listing.' },
  { platformId: 'bbb', platformName: 'Better Business Bureau', status: 'unclaimed', napConsistent: false, duplicateRisk: false },
  { platformId: 'yellowpages', platformName: 'Yellow Pages', status: 'unclaimed', napConsistent: false, duplicateRisk: true, notes: 'Check for outdated listing.' },
  { platformId: 'nextdoor', platformName: 'Nextdoor', status: 'unclaimed', napConsistent: false, duplicateRisk: false },
  { platformId: 'thumbtack', platformName: 'Thumbtack', status: 'unclaimed', napConsistent: false, duplicateRisk: false },
  { platformId: 'homeadvisor', platformName: 'HomeAdvisor / Angi', status: 'unclaimed', napConsistent: false, duplicateRisk: false },
  { platformId: 'facebook', platformName: 'Facebook Business', status: 'unclaimed', napConsistent: false, duplicateRisk: false },
];

const statusIcon = (s: CitationEntry['status']) => {
  if (s === 'verified') return <CheckCircle2 className="w-4 h-4 text-green-600" />;
  if (s === 'claimed') return <CheckCircle2 className="w-4 h-4 text-yellow-600" />;
  if (s === 'needs_update') return <AlertTriangle className="w-4 h-4 text-orange-500" />;
  return <XCircle className="w-4 h-4 text-muted-foreground" />;
};

const statusBadge = (s: CitationEntry['status']) => {
  const colors: Record<string, string> = {
    verified: 'bg-green-500/20 text-green-700',
    claimed: 'bg-yellow-500/20 text-yellow-700',
    needs_update: 'bg-orange-500/20 text-orange-700',
    unclaimed: 'bg-muted text-muted-foreground',
  };
  return colors[s] || colors.unclaimed;
};

export default function CitationsPage() {
  const verified = CITATIONS.filter(c => c.status === 'verified').length;
  const claimed = CITATIONS.filter(c => c.status === 'claimed').length;
  const unclaimed = CITATIONS.filter(c => c.status === 'unclaimed').length;
  const duplicateRisks = CITATIONS.filter(c => c.duplicateRisk).length;

  return (
    <>
      <Helmet><title>Citation Tracker | Local Admin</title></Helmet>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Local Citation Tracker</h1>
          <p className="text-muted-foreground text-sm mt-1">
            NAP consistency and listing management across directories.
          </p>
        </div>

        {/* Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-green-600">{verified}</p>
            <p className="text-xs text-muted-foreground">Verified</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-yellow-600">{claimed}</p>
            <p className="text-xs text-muted-foreground">Claimed</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-muted-foreground">{unclaimed}</p>
            <p className="text-xs text-muted-foreground">Unclaimed</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-red-600">{duplicateRisks}</p>
            <p className="text-xs text-muted-foreground">Duplicate Risks</p>
          </CardContent></Card>
        </div>

        {/* NAP Reference */}
        <Card>
          <CardHeader><CardTitle>Canonical NAP (Source of Truth)</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div className="grid sm:grid-cols-3 gap-4">
              <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium text-foreground">{BUSINESS_INFO.name}</p></div>
              <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium text-foreground">{BUSINESS_INFO.primaryPhone}</p></div>
              <div><p className="text-muted-foreground text-xs">Website</p><p className="font-medium text-foreground">{BUSINESS_INFO.website}</p></div>
            </div>
          </CardContent>
        </Card>

        {/* Citation List */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><ExternalLink className="w-4 h-4" /> All Citations</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {CITATIONS.map(c => (
                <div key={c.platformId} className="flex items-center justify-between py-3 border-b border-border last:border-0">
                  <div className="flex items-center gap-3">
                    {statusIcon(c.status)}
                    <div>
                      <p className="text-sm font-medium text-foreground">{c.platformName}</p>
                      {c.notes && <p className="text-xs text-muted-foreground">{c.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge className={statusBadge(c.status)}>{c.status.replace('_', ' ')}</Badge>
                    {c.napConsistent ? (
                      <Badge className="bg-green-500/20 text-green-700 text-xs">NAP ✓</Badge>
                    ) : (
                      <Badge className="bg-red-500/20 text-red-700 text-xs">NAP ✗</Badge>
                    )}
                    {c.duplicateRisk && (
                      <Badge variant="destructive" className="text-xs">Dup Risk</Badge>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
