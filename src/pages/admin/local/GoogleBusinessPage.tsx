import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { CheckCircle2, AlertTriangle, MapPin } from 'lucide-react';
import {
  BUSINESS_INFO, PLATFORM_PROFILES, REVIEW_LINKS,
  YARD_LOCATIONS, WEEKLY_LOCAL_TASKS,
} from '@/config/localPresenceConfig';

const GBP_CHECKLIST = [
  { id: 'info', label: 'Complete business info (NAP, hours, description)', critical: true },
  { id: 'categories', label: 'Primary + secondary categories set', critical: true },
  { id: 'service-area', label: 'Service area aligned with website', critical: true },
  { id: 'services', label: 'Service list complete (all sizes + materials)', critical: true },
  { id: 'photos', label: 'Photo coverage (10+ images per location)', critical: false },
  { id: 'review-link', label: 'Review link verified and working', critical: true },
  { id: 'review-replies', label: 'All reviews replied to', critical: false },
  { id: 'posts', label: 'Weekly post published', critical: false },
  { id: 'qa', label: 'Q&A section populated (5+ entries)', critical: false },
  { id: 'website-link', label: 'Website link points to correct canonical URL', critical: true },
];

export default function GoogleBusinessPage() {
  const googleProfiles = PLATFORM_PROFILES.filter(p => p.platform === 'google');
  const googleTasks = WEEKLY_LOCAL_TASKS.filter(t => t.platform === 'google');

  return (
    <>
      <Helmet><title>Google Business Profile | Local Admin</title></Helmet>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Google Business Profile</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage GBP listings for all direct-operation markets.
          </p>
        </div>

        {/* Profiles */}
        <div className="grid sm:grid-cols-2 gap-4">
          {googleProfiles.map((p, i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <CardTitle className="text-base flex items-center gap-2">
                  <MapPin className="w-4 h-4" /> {p.label}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge className={p.verified ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}>
                    {p.verified ? 'Verified' : 'Unverified'}
                  </Badge>
                  <Badge variant="outline">{p.status}</Badge>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground mb-1">Profile Completeness</p>
                  <Progress value={p.completenessPercent} className="h-2" />
                  <p className="text-xs text-right text-muted-foreground mt-1">{p.completenessPercent}%</p>
                </div>
                {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Business Info Reference */}
        <Card>
          <CardHeader><CardTitle>Business Info (Source of Truth)</CardTitle></CardHeader>
          <CardContent className="text-sm space-y-2">
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="text-muted-foreground text-xs">Business Name</p>
                <p className="font-medium text-foreground">{BUSINESS_INFO.name}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Phone</p>
                <p className="font-medium text-foreground">{BUSINESS_INFO.primaryPhone}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Website</p>
                <p className="font-medium text-foreground">{BUSINESS_INFO.website}</p>
              </div>
              <div>
                <p className="text-muted-foreground text-xs">Primary Category</p>
                <p className="font-medium text-foreground">{BUSINESS_INFO.primaryCategory}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-xs">Hours</p>
                <p className="font-medium text-foreground">{BUSINESS_INFO.hours.label}</p>
              </div>
              <div className="sm:col-span-2">
                <p className="text-muted-foreground text-xs">Description</p>
                <p className="text-foreground">{BUSINESS_INFO.descriptionShort}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Optimization Checklist */}
        <Card>
          <CardHeader><CardTitle>GBP Optimization Checklist</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {GBP_CHECKLIST.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox id={item.id} />
                  <label htmlFor={item.id} className="text-sm text-foreground cursor-pointer flex items-center gap-2">
                    {item.label}
                    {item.critical && <Badge variant="destructive" className="text-[10px]">Critical</Badge>}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Links */}
        <Card>
          <CardHeader><CardTitle>Review Links by Market</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {REVIEW_LINKS.filter(r => r.platform === 'google').map(r => (
                <div key={r.marketCode} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium text-foreground">{r.label}</span>
                  <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-xs">
                    {r.url}
                  </a>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Weekly Tasks */}
        <Card>
          <CardHeader><CardTitle>Weekly Google Tasks</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {googleTasks.map((t, i) => (
                <div key={i} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                  <Checkbox />
                  <span className="text-sm text-foreground">{t.task}</span>
                  <Badge variant="secondary" className="text-xs ml-auto">{t.frequency}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
