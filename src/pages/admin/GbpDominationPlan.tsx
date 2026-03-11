import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Progress } from '@/components/ui/progress';
import {
  Target, Star, Camera, Search, MessageSquare, Calendar,
  Globe, Swords, CheckCircle2, Clock, TrendingUp, MapPin,
  ChevronDown, ChevronRight, ArrowRight
} from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';

// ─── Data ────────────────────────────────────────────────────
interface CheckItem {
  id: string;
  label: string;
  detail?: string;
}

interface Phase {
  id: string;
  title: string;
  icon: React.ReactNode;
  priority: 'P0' | 'P1' | 'P2';
  items: CheckItem[];
}

const PHASES: Phase[] = [
  {
    id: 'category',
    title: 'Phase 1 — Primary Category Fix',
    icon: <Target className="w-5 h-5" />,
    priority: 'P0',
    items: [
      { id: 'cat-1', label: 'Change primary category to "Dumpster Rental Service"', detail: 'GBP Dashboard → Edit Profile → Category' },
      { id: 'cat-2', label: 'Add secondary: Roll Off Dumpster Service' },
      { id: 'cat-3', label: 'Add secondary: Construction & Demolition Waste Management' },
      { id: 'cat-4', label: 'Add secondary: Junk Removal Service' },
      { id: 'cat-5', label: 'Add secondary: Waste Management Service' },
      { id: 'cat-6', label: 'Verify categories saved correctly in GBP' },
    ],
  },
  {
    id: 'reviews',
    title: 'Phase 2 — Review Acceleration (50 in 60 days)',
    icon: <Star className="w-5 h-5" />,
    priority: 'P0',
    items: [
      { id: 'rev-1', label: 'Verify review-followup-cron edge function deployed', detail: 'Automated 3-touch drip: Day 0, Day 3, Day 7' },
      { id: 'rev-2', label: 'Update Google review links per market', detail: 'Oakland: g.page/calsan-dumpsters-pro/review' },
      { id: 'rev-3', label: 'Enable SMS review requests on order completion' },
      { id: 'rev-4', label: 'Enable email review requests (3 days post-service)' },
      { id: 'rev-5', label: 'Day 7 follow-up reminder active' },
      { id: 'rev-6', label: 'Contractor-specific messaging enabled' },
      { id: 'rev-7', label: 'Residential-specific messaging enabled' },
      { id: 'rev-8', label: 'Add "Leave a Review" link to email signatures' },
      { id: 'rev-9', label: 'Train crew to ask for reviews on-site' },
      { id: 'rev-10', label: 'Print QR review cards for trucks' },
    ],
  },
  {
    id: 'photos',
    title: 'Phase 3 — Photo Domination (40+ per location)',
    icon: <Camera className="w-5 h-5" />,
    priority: 'P0',
    items: [
      { id: 'photo-1', label: 'Upload photos: 5yd, 8yd, 10yd dumpsters' },
      { id: 'photo-2', label: 'Upload photos: 20yd, 30yd, 40yd, 50yd dumpsters' },
      { id: 'photo-3', label: 'Upload branded truck photos (min 5)' },
      { id: 'photo-4', label: 'Upload Oakland yard photos (min 5)', detail: 'Geo-tag: 37.8044, -122.2712' },
      { id: 'photo-5', label: 'Upload San Jose yard photos (min 5)', detail: 'Geo-tag: 37.3382, -121.8863' },
      { id: 'photo-6', label: 'Upload residential job site photos (min 5)' },
      { id: 'photo-7', label: 'Upload commercial job site photos (min 5)' },
      { id: 'photo-8', label: 'Upload concrete/dirt load photos' },
      { id: 'photo-9', label: 'Upload before/after cleanout photos (min 3)' },
      { id: 'photo-10', label: 'Upload crew in action photos (min 3)' },
      { id: 'photo-11', label: 'All photos geo-tagged before upload', detail: 'Use GeoTag Photos Pro or ExifTool' },
      { id: 'photo-12', label: 'Upload business logo to GBP' },
    ],
  },
  {
    id: 'keywords',
    title: 'Phase 4 — GBP Keyword Optimization',
    icon: <Search className="w-5 h-5" />,
    priority: 'P0',
    items: [
      { id: 'kw-1', label: 'Update business description (750 chars)', detail: 'Include: Oakland, San Jose, SF, same-day, 6-50yd, local yard' },
      { id: 'kw-2', label: 'Add all dumpster sizes to Services section' },
      { id: 'kw-3', label: 'Add material types to Services (concrete, dirt, mixed)' },
      { id: 'kw-4', label: 'Add "Same Day Dumpster Delivery" to Services' },
      { id: 'kw-5', label: 'Add "Hablamos Español" attribute' },
      { id: 'kw-6', label: 'Add "Online Estimates" attribute' },
      { id: 'kw-7', label: 'Verify website URL points to main domain' },
    ],
  },
  {
    id: 'qa',
    title: 'Phase 5 — Q&A Seeding (20 FAQs)',
    icon: <MessageSquare className="w-5 h-5" />,
    priority: 'P1',
    items: [
      { id: 'qa-1', label: 'How much is a 20 yard dumpster in Oakland?' },
      { id: 'qa-2', label: 'Do you deliver dumpsters to San Francisco?' },
      { id: 'qa-3', label: 'Can I put concrete in the dumpster?' },
      { id: 'qa-4', label: 'Do you offer same-day dumpster delivery?' },
      { id: 'qa-5', label: 'What dumpster sizes are available?' },
      { id: 'qa-6', label: 'Do you have dumpsters in San Jose?' },
      { id: 'qa-7', label: 'What materials are not allowed?' },
      { id: 'qa-8', label: 'How long can I keep the dumpster?' },
      { id: 'qa-9', label: 'Do you serve the East Bay?' },
      { id: 'qa-10', label: 'Can I rent a small dumpster for a bathroom remodel?' },
      { id: 'qa-11', label: 'Do you offer contractor pricing?' },
      { id: 'qa-12', label: 'What is a roll-off dumpster?' },
      { id: 'qa-13', label: 'Do you haul dirt and soil?' },
      { id: 'qa-14', label: 'Are you a broker or do you own the dumpsters?' },
      { id: 'qa-15', label: 'Do you deliver on weekends?' },
      { id: 'qa-16', label: 'How do I get a dumpster permit in Oakland?' },
      { id: 'qa-17', label: 'What is the weight limit for a 10 yard dumpster?' },
      { id: 'qa-18', label: 'Do you offer commercial dumpster service?' },
      { id: 'qa-19', label: 'Can I schedule a recurring pickup?' },
      { id: 'qa-20', label: 'Do you serve Fremont and Hayward?' },
    ],
  },
  {
    id: 'posts',
    title: 'Phase 6 — Weekly GBP Posts (12 weeks)',
    icon: <Calendar className="w-5 h-5" />,
    priority: 'P1',
    items: [
      { id: 'post-1', label: 'Week 1: Same-day delivery highlight', detail: '🚛 Need a dumpster TODAY in Oakland? Same-day delivery available!' },
      { id: 'post-2', label: 'Week 2: Concrete dumpster post', detail: '🪨 Heavy concrete? Our 10yd dumpsters handle it. Serving Oakland & SJ.' },
      { id: 'post-3', label: 'Week 3: Contractor spotlight', detail: '👷 Trusted by Bay Area contractors. Volume pricing available.' },
      { id: 'post-4', label: 'Week 4: 20 yard dumpster special', detail: '📦 Our most popular size! 20yd dumpsters starting at competitive rates.' },
      { id: 'post-5', label: 'Week 5: Oakland yard advantage', detail: '📍 Local yard in Oakland = faster delivery, lower cost.' },
      { id: 'post-6', label: 'Week 6: San Jose expansion', detail: '🌉 Now serving all of San Jose & South Bay with next-day delivery.' },
      { id: 'post-7', label: 'Week 7: Commercial job case study', detail: '🏗️ See how we handled a 50yd warehouse cleanout in SF.' },
      { id: 'post-8', label: 'Week 8: Residential remodel highlight', detail: '🏡 Kitchen remodel? A 10yd dumpster is all you need.' },
      { id: 'post-9', label: 'Week 9: Dirt load education', detail: '🌿 Dirt & soil disposal made easy. Clean loads welcome.' },
      { id: 'post-10', label: 'Week 10: Roll off explanation', detail: '🔄 What is a roll-off dumpster? Here\'s everything you need to know.' },
      { id: 'post-11', label: 'Week 11: Review milestone celebration', detail: '⭐ Thank you for 50+ five-star reviews! #1 rated in Oakland.' },
      { id: 'post-12', label: 'Week 12: Limited time offer', detail: '🔥 Book this week and save. Dumpster rental Oakland from $XXX.' },
    ],
  },
  {
    id: 'citations',
    title: 'Phase 7 — Citations & NAP Consistency',
    icon: <Globe className="w-5 h-5" />,
    priority: 'P1',
    items: [
      { id: 'cit-1', label: 'Verify NAP on Google Business Profile', detail: 'Calsan Dumpsters Pro | 1930 12th Ave, Oakland CA | (510) 680-2150' },
      { id: 'cit-2', label: 'Claim & update Yelp listing' },
      { id: 'cit-3', label: 'Claim & update BBB listing' },
      { id: 'cit-4', label: 'Claim & update Angi listing' },
      { id: 'cit-5', label: 'Claim & update HomeAdvisor listing' },
      { id: 'cit-6', label: 'Post on Nextdoor business page' },
      { id: 'cit-7', label: 'Claim Yahoo Local listing' },
      { id: 'cit-8', label: 'Claim Apple Maps listing' },
      { id: 'cit-9', label: 'Claim Bing Places listing' },
      { id: 'cit-10', label: 'Claim YellowPages listing' },
      { id: 'cit-11', label: 'Join Oakland Chamber of Commerce' },
      { id: 'cit-12', label: 'Join San Jose Chamber of Commerce' },
      { id: 'cit-13', label: 'Consolidate domain to calsandumpsterspro.com only' },
    ],
  },
  {
    id: 'compete',
    title: 'Phase 8 — Competitor Attack Plan',
    icon: <Swords className="w-5 h-5" />,
    priority: 'P2',
    items: [
      { id: 'comp-1', label: 'Outpace Fisher Hauling review velocity (target 10/month)' },
      { id: 'comp-2', label: 'Outpublish competitor GBP posts (weekly vs monthly)' },
      { id: 'comp-3', label: 'Exceed photo count of top 3 competitors' },
      { id: 'comp-4', label: 'Monitor competitor category changes monthly' },
      { id: 'comp-5', label: 'Track competitor review trends in spreadsheet' },
      { id: 'comp-6', label: 'Build local backlinks (3 per month)' },
      { id: 'comp-7', label: 'Sponsor local Oakland/SJ events for citations' },
    ],
  },
];

const TIMELINE = [
  {
    period: '7 Days',
    label: 'Immediate Actions',
    color: 'bg-destructive',
    items: ['Fix primary category', 'Update business description', 'Upload 20 photos', 'Launch review drip system', 'Verify NAP on GBP'],
  },
  {
    period: '30 Days',
    label: 'Domination Plan',
    color: 'bg-orange-500',
    items: ['Hit 25 new reviews', 'Upload 40+ photos', 'Seed 10 Q&As', 'Publish 4 GBP posts', 'Claim 6 citation directories'],
  },
  {
    period: '60 Days',
    label: 'Growth Plan',
    color: 'bg-yellow-500',
    items: ['Hit 50 new reviews', 'Complete all 20 Q&As', 'Publish 8 GBP posts total', 'All citations live & consistent', 'Track map pack position'],
  },
  {
    period: '90 Days',
    label: 'Market Leadership',
    color: 'bg-emerald-500',
    items: ['Sustain 10+ reviews/month', '12 GBP posts complete', 'Top 3 map pack Oakland', 'Top 5 map pack SJ & SF', 'Competitor attack active'],
  },
];

const KPI_TARGETS = [
  { metric: 'Google Reviews', current: '~5', target30: '25', target60: '50', target90: '70+' },
  { metric: 'Avg Rating', current: '5.0', target30: '4.9+', target60: '4.9+', target90: '4.8+' },
  { metric: 'GBP Photos', current: '~5', target30: '30', target60: '40+', target90: '50+' },
  { metric: 'GBP Posts', current: '0', target30: '4', target60: '8', target90: '12' },
  { metric: 'Q&A Pairs', current: '0', target30: '10', target60: '20', target90: '20+' },
  { metric: 'Citations', current: '~2', target30: '6', target60: '10', target90: '12+' },
  { metric: 'Map Pack Oakland', current: 'Not ranked', target30: 'Top 10', target60: 'Top 5', target90: 'Top 3' },
  { metric: 'Map Pack SJ', current: 'Not ranked', target30: 'Top 10', target60: 'Top 7', target90: 'Top 5' },
];

const DESCRIPTION_750 = `Calsan Dumpsters Pro is the Bay Area's trusted local dumpster rental service, operating from our own yards in Oakland and San Jose. We offer roll-off dumpster rental in sizes from 6 to 50 yards for residential cleanouts, construction projects, and commercial jobs across Oakland, San Jose, San Francisco, and the entire Bay Area. Same-day dumpster delivery available. We're not a broker — we own every dumpster and truck in our fleet, which means faster service and lower prices. Specializing in concrete, dirt, mixed debris, and clean loads. Licensed, insured, and locally operated. Hablamos Español. Call (510) 680-2150 or book online for instant pricing.`;

// ─── Component ───────────────────────────────────────────────
export default function GbpDominationPlan() {
  const [checked, setChecked] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('gbp-plan-checks');
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });

  const toggle = (id: string) => {
    setChecked(prev => {
      const next = { ...prev, [id]: !prev[id] };
      localStorage.setItem('gbp-plan-checks', JSON.stringify(next));
      return next;
    });
  };

  const totalItems = PHASES.reduce((s, p) => s + p.items.length, 0);
  const doneItems = PHASES.reduce((s, p) => s + p.items.filter(i => checked[i.id]).length, 0);
  const pct = Math.round((doneItems / totalItems) * 100);

  const priorityColor = (p: string) =>
    p === 'P0' ? 'bg-destructive text-destructive-foreground' :
    p === 'P1' ? 'bg-orange-500 text-white' : 'bg-muted text-muted-foreground';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
            <MapPin className="w-6 h-6 text-primary" />
            GBP Local SEO Domination Plan
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            90-day playbook to rank Top 3 in Google Map Pack — Oakland, San Jose & SF
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="text-right">
            <p className="text-2xl font-bold text-primary">{pct}%</p>
            <p className="text-xs text-muted-foreground">{doneItems}/{totalItems} tasks</p>
          </div>
          <div className="w-32">
            <Progress value={pct} className="h-3" />
          </div>
        </div>
      </div>

      <Tabs defaultValue="phases" className="space-y-4">
        <TabsList className="grid grid-cols-4 w-full max-w-lg">
          <TabsTrigger value="phases">Phases</TabsTrigger>
          <TabsTrigger value="timeline">Timeline</TabsTrigger>
          <TabsTrigger value="kpis">KPIs</TabsTrigger>
          <TabsTrigger value="assets">Assets</TabsTrigger>
        </TabsList>

        {/* ── Phases Tab ──────────────────────────────── */}
        <TabsContent value="phases" className="space-y-4">
          {PHASES.map(phase => {
            const done = phase.items.filter(i => checked[i.id]).length;
            const total = phase.items.length;
            return (
              <Collapsible key={phase.id} defaultOpen={done < total}>
                <Card>
                  <CollapsibleTrigger asChild>
                    <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <span className="text-primary">{phase.icon}</span>
                          <CardTitle className="text-base">{phase.title}</CardTitle>
                          <Badge className={priorityColor(phase.priority)}>{phase.priority}</Badge>
                        </div>
                        <div className="flex items-center gap-3">
                          <span className="text-sm text-muted-foreground">{done}/{total}</span>
                          {done === total
                            ? <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                            : <ChevronDown className="w-4 h-4 text-muted-foreground" />
                          }
                        </div>
                      </div>
                    </CardHeader>
                  </CollapsibleTrigger>
                  <CollapsibleContent>
                    <CardContent className="pt-0 space-y-2">
                      {phase.items.map(item => (
                        <label
                          key={item.id}
                          className={`flex items-start gap-3 p-2 rounded-lg hover:bg-muted/40 cursor-pointer transition-colors ${checked[item.id] ? 'opacity-60' : ''}`}
                        >
                          <Checkbox
                            checked={!!checked[item.id]}
                            onCheckedChange={() => toggle(item.id)}
                            className="mt-0.5"
                          />
                          <div>
                            <span className={`text-sm ${checked[item.id] ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                              {item.label}
                            </span>
                            {item.detail && (
                              <p className="text-xs text-muted-foreground mt-0.5">{item.detail}</p>
                            )}
                          </div>
                        </label>
                      ))}
                    </CardContent>
                  </CollapsibleContent>
                </Card>
              </Collapsible>
            );
          })}
        </TabsContent>

        {/* ── Timeline Tab ────────────────────────────── */}
        <TabsContent value="timeline" className="space-y-4">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {TIMELINE.map((t, i) => {
              const barColor = i === 0 ? 'bg-destructive' : i === 1 ? 'bg-accent' : i === 2 ? 'bg-secondary' : 'bg-primary';
              return (
              <Card key={i} className="relative overflow-hidden">
                <div className={`absolute top-0 left-0 right-0 h-1 ${barColor}`} />
                <CardHeader className="pb-2">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-muted-foreground" />
                    <CardTitle className="text-lg">{t.period}</CardTitle>
                  </div>
                  <p className="text-sm font-medium text-muted-foreground">{t.label}</p>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1.5">
                    {t.items.map((item, j) => (
                      <li key={j} className="flex items-start gap-2 text-sm text-foreground">
                        <ArrowRight className="w-3 h-3 mt-1 text-primary shrink-0" />
                        {item}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            );
            })}
          </div>
        </TabsContent>

        {/* ── KPIs Tab ────────────────────────────────── */}
        <TabsContent value="kpis">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="w-5 h-5 text-primary" />
                KPI Dashboard — 90 Day Targets
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border">
                      <th className="text-left py-2 px-3 font-medium text-muted-foreground">Metric</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">Current</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">30 Days</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">60 Days</th>
                      <th className="text-center py-2 px-3 font-medium text-muted-foreground">90 Days</th>
                    </tr>
                  </thead>
                  <tbody>
                    {KPI_TARGETS.map((kpi, i) => (
                      <tr key={i} className="border-b border-border/50 last:border-0">
                        <td className="py-2.5 px-3 font-medium text-foreground">{kpi.metric}</td>
                        <td className="py-2.5 px-3 text-center text-muted-foreground">{kpi.current}</td>
                        <td className="py-2.5 px-3 text-center text-foreground">{kpi.target30}</td>
                        <td className="py-2.5 px-3 text-center text-foreground">{kpi.target60}</td>
                        <td className="py-2.5 px-3 text-center font-semibold text-primary">{kpi.target90}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* ── Assets Tab ──────────────────────────────── */}
        <TabsContent value="assets" className="space-y-4">
          {/* Optimized Description */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📝 Optimized GBP Description (750 chars)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 text-sm text-foreground leading-relaxed">
                {DESCRIPTION_750}
              </div>
              <p className="text-xs text-muted-foreground mt-2">{DESCRIPTION_750.length} characters — Copy and paste into GBP → Edit Profile → Description</p>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => { navigator.clipboard.writeText(DESCRIPTION_750); }}
              >
                Copy to Clipboard
              </Button>
            </CardContent>
          </Card>

          {/* Geo-tag Coordinates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">📍 Geo-Tag Coordinates</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-3 gap-3">
                {[
                  { city: 'Oakland', lat: '37.8044', lng: '-122.2712' },
                  { city: 'San Jose', lat: '37.3382', lng: '-121.8863' },
                  { city: 'San Francisco', lat: '37.7749', lng: '-122.4194' },
                ].map(loc => (
                  <div key={loc.city} className="bg-muted/50 rounded-lg p-3">
                    <p className="font-medium text-foreground text-sm">{loc.city}</p>
                    <p className="text-xs text-muted-foreground font-mono">{loc.lat}, {loc.lng}</p>
                  </div>
                ))}
              </div>
              <p className="text-xs text-muted-foreground">
                Use <strong>GeoTag Photos Pro</strong> (iOS/Android) or <strong>ExifTool</strong> (desktop) to add GPS coordinates to photos before uploading to GBP.
              </p>
            </CardContent>
          </Card>

          {/* NAP Template */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">🏢 Canonical NAP (Use Everywhere)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="bg-muted/50 rounded-lg p-4 text-sm font-mono text-foreground space-y-1">
                <p><strong>Name:</strong> Calsan Dumpsters Pro</p>
                <p><strong>Address:</strong> 1930 12th Ave, Oakland, CA 94606</p>
                <p><strong>Phone:</strong> (510) 680-2150</p>
                <p><strong>Website:</strong> https://calsandumpsterspro.com</p>
              </div>
              <Button
                variant="outline"
                size="sm"
                className="mt-2"
                onClick={() => {
                  navigator.clipboard.writeText('Calsan Dumpsters Pro\n1930 12th Ave, Oakland, CA 94606\n(510) 680-2150\nhttps://calsandumpsterspro.com');
                }}
              >
                Copy NAP
              </Button>
            </CardContent>
          </Card>

          {/* Review Link Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-base">⭐ Review Links by Market</CardTitle>
            </CardHeader>
            <CardContent className="space-y-2">
              {[
                { market: 'Oakland / East Bay', link: 'https://g.page/calsan-dumpsters-pro/review' },
                { market: 'San Jose / South Bay', link: 'https://g.page/calsan-dumpsters-pro/review' },
                { market: 'San Francisco / Peninsula', link: 'https://g.page/calsan-dumpsters-pro/review' },
              ].map(r => (
                <div key={r.market} className="flex items-center justify-between bg-muted/50 rounded-lg p-3">
                  <div>
                    <p className="text-sm font-medium text-foreground">{r.market}</p>
                    <p className="text-xs text-muted-foreground font-mono truncate max-w-xs">{r.link}</p>
                  </div>
                  <Button variant="ghost" size="sm" onClick={() => navigator.clipboard.writeText(r.link)}>
                    Copy
                  </Button>
                </div>
              ))}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
