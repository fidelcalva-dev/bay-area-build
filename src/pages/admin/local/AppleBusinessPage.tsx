import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { PLATFORM_PROFILES, BUSINESS_INFO } from '@/config/localPresenceConfig';

const APPLE_CHECKLIST = [
  { id: 'enroll', label: 'Enroll in Apple Business Connect', critical: true },
  { id: 'verify', label: 'Complete company verification', critical: true },
  { id: 'place-card', label: 'Claim place card on Apple Maps', critical: true },
  { id: 'logo', label: 'Upload brand logo', critical: false },
  { id: 'cover', label: 'Upload cover photo', critical: false },
  { id: 'hours', label: 'Set accurate business hours', critical: true },
  { id: 'categories', label: 'Set business categories', critical: true },
  { id: 'service-area', label: 'Define service area', critical: true },
  { id: 'website', label: 'Verify website URL', critical: true },
  { id: 'phone', label: 'Verify phone number', critical: true },
  { id: 'team', label: 'Assign team members', critical: false },
  { id: 'showcases', label: 'Create showcases (optional)', critical: false },
];

export default function AppleBusinessPage() {
  const appleProfiles = PLATFORM_PROFILES.filter(p => p.platform === 'apple');

  return (
    <>
      <Helmet><title>Apple Business Connect | Local Admin</title></Helmet>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Apple Business Connect</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage Apple Maps presence and place card optimization.
          </p>
        </div>

        {/* Profile Status */}
        {appleProfiles.map((p, i) => (
          <Card key={i}>
            <CardHeader className="pb-2"><CardTitle className="text-base">{p.label}</CardTitle></CardHeader>
            <CardContent className="space-y-2">
              <div className="flex items-center gap-2">
                <Badge className={p.status === 'claimed' ? 'bg-green-500/20 text-green-700' : 'bg-red-500/20 text-red-700'}>
                  {p.status}
                </Badge>
                <Badge variant="outline">{p.verified ? 'Verified' : 'Unverified'}</Badge>
              </div>
              {p.notes && <p className="text-xs text-muted-foreground italic">{p.notes}</p>}
            </CardContent>
          </Card>
        ))}

        {/* Setup Guide */}
        <Card>
          <CardHeader><CardTitle>Apple Business Connect Setup</CardTitle></CardHeader>
          <CardContent className="text-sm text-foreground space-y-2">
            <ol className="list-decimal list-inside space-y-1 text-muted-foreground">
              <li>Go to <span className="font-medium text-foreground">business.apple.com</span></li>
              <li>Sign in with your Apple ID</li>
              <li>Search for "{BUSINESS_INFO.name}" and claim the listing</li>
              <li>Complete identity verification</li>
              <li>Update place card with correct NAP, hours, and categories</li>
              <li>Upload logo and cover image</li>
            </ol>
          </CardContent>
        </Card>

        {/* Checklist */}
        <Card>
          <CardHeader><CardTitle>Apple Business Checklist</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {APPLE_CHECKLIST.map(item => (
                <div key={item.id} className="flex items-start gap-3">
                  <Checkbox id={`apple-${item.id}`} />
                  <label htmlFor={`apple-${item.id}`} className="text-sm text-foreground cursor-pointer flex items-center gap-2">
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
