import { Helmet } from 'react-helmet-async';
import { Link } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  MapPin, Star, Camera, Globe, CheckCircle2, AlertTriangle, ExternalLink,
} from 'lucide-react';
import {
  PLATFORM_PROFILES, WEEKLY_LOCAL_TASKS, REVIEW_LINKS,
  YARD_LOCATIONS, CITATION_PLATFORMS, BUSINESS_INFO,
} from '@/config/localPresenceConfig';
import { CITY_DIRECTORY } from '@/lib/service-area-config';

const statusColor = (s: string) =>
  s === 'claimed' ? 'bg-green-500/20 text-green-700' :
  s === 'pending' ? 'bg-yellow-500/20 text-yellow-700' :
  'bg-red-500/20 text-red-700';

export default function LocalDashboard() {
  const directCities = CITY_DIRECTORY.filter(c => c.serviceModel === 'DIRECT_OPERATION');
  const partnerCities = CITY_DIRECTORY.filter(c => c.serviceModel === 'PARTNER_NETWORK');
  const avgCompleteness = Math.round(
    PLATFORM_PROFILES.reduce((s, p) => s + p.completenessPercent, 0) / PLATFORM_PROFILES.length
  );

  return (
    <>
      <Helmet><title>Local Search Dashboard | Admin</title></Helmet>
      <div className="p-6 space-y-6 max-w-7xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Local Search Command Center</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Unified dashboard for Google, Bing, Apple presence, reviews, photos & citations.
          </p>
        </div>

        {/* KPI Strip */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{directCities.length}</p>
            <p className="text-xs text-muted-foreground">Direct Markets</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{partnerCities.length}</p>
            <p className="text-xs text-muted-foreground">Partner Markets</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{PLATFORM_PROFILES.filter(p => p.verified).length}/{PLATFORM_PROFILES.length}</p>
            <p className="text-xs text-muted-foreground">Verified Profiles</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{avgCompleteness}%</p>
            <p className="text-xs text-muted-foreground">Avg Profile Score</p>
          </CardContent></Card>
          <Card><CardContent className="pt-4 text-center">
            <p className="text-2xl font-bold text-foreground">{REVIEW_LINKS.length}</p>
            <p className="text-xs text-muted-foreground">Review Channels</p>
          </CardContent></Card>
        </div>

        {/* Profile Status */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Globe className="w-4 h-4" /> Platform Profiles</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {PLATFORM_PROFILES.map((p, i) => (
                <div key={i} className="flex items-center justify-between border-b border-border pb-3 last:border-0">
                  <div className="flex items-center gap-3">
                    <Badge className={statusColor(p.status)}>{p.status}</Badge>
                    <span className="text-sm font-medium text-foreground">{p.label}</span>
                    {p.verified && <CheckCircle2 className="w-4 h-4 text-green-600" />}
                    {!p.verified && <AlertTriangle className="w-4 h-4 text-yellow-500" />}
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <Progress value={p.completenessPercent} className="h-2" />
                    </div>
                    <span className="text-xs text-muted-foreground w-10 text-right">{p.completenessPercent}%</span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Quick Links */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { to: '/admin/local/google-business', icon: MapPin, label: 'Google Business', desc: 'GBP optimization & posts' },
            { to: '/admin/local/bing-places', icon: Globe, label: 'Bing Places', desc: 'Listing management' },
            { to: '/admin/local/apple-business', icon: MapPin, label: 'Apple Business', desc: 'Place card & branding' },
            { to: '/admin/local/reviews', icon: Star, label: 'Reviews Engine', desc: 'Requests, responses & tracking' },
            { to: '/admin/local/photos', icon: Camera, label: 'Photos Engine', desc: 'Geo-tagged media library' },
            { to: '/admin/local/citations', icon: ExternalLink, label: 'Citations', desc: 'NAP consistency tracker' },
          ].map(({ to, icon: Icon, label, desc }) => (
            <Link key={to} to={to} className="block">
              <Card className="hover:border-primary/50 transition-colors h-full">
                <CardContent className="pt-4 flex items-start gap-3">
                  <Icon className="w-5 h-5 text-primary mt-0.5" />
                  <div>
                    <p className="font-semibold text-sm text-foreground">{label}</p>
                    <p className="text-xs text-muted-foreground">{desc}</p>
                  </div>
                </CardContent>
              </Card>
            </Link>
          ))}
        </div>

        {/* Weekly Tasks */}
        <Card>
          <CardHeader><CardTitle>Weekly Local Tasks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {WEEKLY_LOCAL_TASKS.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm text-foreground">{t.task}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{t.platform}</Badge>
                    <Badge variant="secondary" className="text-xs">{t.frequency}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Priority Markets */}
        <Card>
          <CardHeader><CardTitle>Priority Markets</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-6">
              {[1, 2, 3].map(tier => (
                <div key={tier}>
                  <h3 className="text-sm font-semibold text-foreground mb-2">Tier {tier}</h3>
                  <div className="space-y-1">
                    {CITY_DIRECTORY.filter(c => c.tier === tier).map(c => (
                      <div key={c.slug} className="flex items-center justify-between text-sm">
                        <Link to={`/dumpster-rental/${c.slug}`} className="text-primary hover:underline">{c.name}</Link>
                        <Badge variant={c.serviceModel === 'DIRECT_OPERATION' ? 'default' : 'secondary'} className="text-xs">
                          {c.serviceModel === 'DIRECT_OPERATION' ? 'Direct' : 'Partner'}
                        </Badge>
                      </div>
                    ))}
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
