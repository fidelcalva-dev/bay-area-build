import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { BUSINESS_INFO, PLATFORM_PROFILES, YARD_LOCATIONS } from '@/config/localPresenceConfig';

const BING_CHECKLIST = [
  { id: 'claim', label: 'Listing claimed on Bing Places', critical: true },
  { id: 'verify', label: 'Verification completed', critical: true },
  { id: 'nap', label: 'NAP matches Google Business Profile', critical: true },
  { id: 'categories', label: 'Categories aligned with GBP', critical: true },
  { id: 'hours', label: 'Hours match website', critical: true },
  { id: 'photos', label: 'Photos uploaded (5+)', critical: false },
  { id: 'description', label: 'Business description added', critical: false },
  { id: 'services', label: 'Service list populated', critical: false },
  { id: 'duplicates', label: 'Checked for duplicate listings', critical: true },
  { id: 'website-url', label: 'Website URL points to canonical domain', critical: true },
];

export default function BingPlacesPage() {
  const bingProfiles = PLATFORM_PROFILES.filter(p => p.platform === 'bing');

  return (
    <>
      <Helmet><title>Bing Places | Local Admin</title></Helmet>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Bing Places</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage Bing Places listings and ensure NAP consistency with GBP.
          </p>
        </div>

        {/* Profile Status */}
        {bingProfiles.map((p, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{p.label}</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              <div className="flex items-center gap-2">
                <Badge className={p.verified ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}>
                  {p.verified ? 'Verified' : 'Unverified'}
                </Badge>
                <Badge variant="outline">{p.status}</Badge>
              </div>
              <Progress value={p.completenessPercent} className="h-2" />
              <p className="text-xs text-muted-foreground">{p.completenessPercent}% complete</p>
              {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
            </CardContent>
          </Card>
        ))}

        {/* Export Data */}
        <Card>
          <CardHeader><CardTitle>Bing Export Data</CardTitle></CardHeader>
          <CardContent className="text-sm">
            <div className="grid sm:grid-cols-2 gap-4">
              <div><p className="text-muted-foreground text-xs">Name</p><p className="font-medium text-foreground">{BUSINESS_INFO.name}</p></div>
              <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium text-foreground">{BUSINESS_INFO.primaryPhone}</p></div>
              <div><p className="text-muted-foreground text-xs">Website</p><p className="font-medium text-foreground">{BUSINESS_INFO.website}</p></div>
              <div><p className="text-muted-foreground text-xs">Category</p><p className="font-medium text-foreground">{BUSINESS_INFO.primaryCategory}</p></div>
              <div><p className="text-muted-foreground text-xs">Hours</p><p className="font-medium text-foreground">{BUSINESS_INFO.hours.label}</p></div>
              {YARD_LOCATIONS.map(y => (
                <div key={y.id}>
                  <p className="text-muted-foreground text-xs">{y.name} Address</p>
                  <p className="font-medium text-foreground">{y.address}, {y.city}, {y.state} {y.zip}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader><CardTitle>Bing Places Checklist</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {BING_CHECKLIST.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox id={`bing-${item.id}`} />
                  <label htmlFor={`bing-${item.id}`} className="text-sm text-foreground cursor-pointer flex items-center gap-2">
                    {item.label}
                    {item.critical && <Badge variant="destructive" className="text-[10px]">Critical</Badge>}
                  </label>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
