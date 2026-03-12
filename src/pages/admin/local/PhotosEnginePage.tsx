import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Camera, Upload } from 'lucide-react';
import { LOCAL_PHOTO_CATEGORIES, YARD_LOCATIONS, BUSINESS_INFO } from '@/config/localPresenceConfig';
import { CITY_DIRECTORY } from '@/lib/service-area-config';

const UPLOAD_DESTINATIONS = ['Website Gallery', 'Google Business Profile', 'Apple Business Connect', 'Bing Places'];
const WEEKLY_PHOTO_GOALS = [
  { market: 'Oakland', target: 5, current: 0 },
  { market: 'San Jose', target: 5, current: 0 },
  { market: 'San Francisco', target: 3, current: 0 },
  { market: 'East Bay Ring', target: 3, current: 0 },
  { market: 'South Bay Ring', target: 3, current: 0 },
];

export default function PhotosEnginePage() {
  return (
    <>
      <Helmet><title>Photos Engine | Local Admin</title></Helmet>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Local Photos Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage geo-tagged media for local profiles and website.
          </p>
        </div>

        {/* Weekly Goals */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Camera className="w-4 h-4" /> Weekly Photo Goals</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-3">
              {WEEKLY_PHOTO_GOALS.map(g => (
                <div key={g.market} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium text-foreground">{g.market}</span>
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-muted-foreground">{g.current}/{g.target} photos</span>
                    <Badge variant={g.current >= g.target ? 'default' : 'secondary'}>
                      {g.current >= g.target ? 'Done' : 'Pending'}
                    </Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Photo Categories */}
        <Card>
          <CardHeader><CardTitle>Photo Categories</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {LOCAL_PHOTO_CATEGORIES.map(c => (
                <Badge key={c} variant="outline" className="capitalize">
                  {c.replace(/-/g, ' ')}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Metadata Guide */}
        <Card>
          <CardHeader><CardTitle>Photo Metadata Guide</CardTitle></CardHeader>
          <CardContent className="text-sm text-foreground">
            <p className="text-muted-foreground mb-3">Every uploaded photo should include:</p>
            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <p className="font-medium mb-1">Required Tags</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>City (e.g., Oakland, San Jose)</li>
                  <li>Category (delivery, pickup, on-site, etc.)</li>
                  <li>Dumpster size (10yd, 20yd, etc.)</li>
                </ul>
              </div>
              <div>
                <p className="font-medium mb-1">Optional Tags</p>
                <ul className="list-disc list-inside text-muted-foreground space-y-1">
                  <li>Project type (remodel, cleanout, construction)</li>
                  <li>Material type (general, concrete, roofing)</li>
                  <li>Before/after flag</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Upload Destinations */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Upload className="w-4 h-4" /> Upload Destinations</CardTitle></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2">
              {UPLOAD_DESTINATIONS.map(d => (
                <Badge key={d} variant="secondary">{d}</Badge>
              ))}
            </div>
            <p className="text-xs text-muted-foreground mt-3">
              Photos should be uploaded to all relevant platforms for maximum local visibility.
            </p>
          </CardContent>
        </Card>

        {/* Market Coverage */}
        <Card>
          <CardHeader><CardTitle>Markets Needing Photos</CardTitle></CardHeader>
          <CardContent>
            <div className="grid sm:grid-cols-3 gap-2">
              {CITY_DIRECTORY.filter(c => c.tier <= 2).map(c => (
                <div key={c.slug} className="flex items-center justify-between text-sm py-1">
                  <span className="text-foreground">{c.name}</span>
                  <Badge variant="outline" className="text-xs">Tier {c.tier}</Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
