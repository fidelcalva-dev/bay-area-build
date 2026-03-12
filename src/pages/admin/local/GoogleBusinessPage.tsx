import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Checkbox } from '@/components/ui/checkbox';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { CheckCircle2, AlertTriangle, MapPin, Copy, Star, MessageSquare, Image, HelpCircle, FileText } from 'lucide-react';
import { toast } from 'sonner';
import {
  BUSINESS_INFO, PLATFORM_PROFILES, REVIEW_LINKS,
  WEEKLY_LOCAL_TASKS,
} from '@/config/localPresenceConfig';
import {
  GBP_AUDIT_REPORT, GBP_CATEGORIES, GBP_DESCRIPTIONS,
  GBP_SERVICE_AREAS, GBP_SERVICES, GBP_QA_BANK,
  GBP_POST_TEMPLATES, GBP_PHOTO_TARGETS,
  GBP_REVIEW_REQUEST, GBP_REVIEW_RESPONSES,
} from '@/config/gbpContentConfig';

const GBP_CHECKLIST = [
  { id: 'info', label: 'Complete business info (NAP, hours, description)', critical: true },
  { id: 'categories', label: 'Primary + secondary categories set', critical: true },
  { id: 'service-area', label: 'Service area aligned with website (20 max)', critical: true },
  { id: 'services', label: 'Service list complete (all sizes + materials)', critical: true },
  { id: 'photos', label: 'Photo coverage (20+ images)', critical: false },
  { id: 'review-link', label: 'Review link verified and working', critical: true },
  { id: 'review-replies', label: 'All reviews replied to', critical: false },
  { id: 'posts', label: 'Weekly post published', critical: false },
  { id: 'qa', label: 'Q&A section populated (6+ entries)', critical: false },
  { id: 'website-link', label: 'Website link points to correct canonical URL', critical: true },
  { id: 'quote-link', label: 'Appointment/quote URL set to /quote', critical: true },
  { id: 'description', label: 'Business description matches approved copy (<750 chars)', critical: true },
];

const copy = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};

const statusColor = (s: string) => {
  if (s === 'ok') return 'bg-green-500/20 text-green-700';
  if (s === 'needs_fix') return 'bg-yellow-500/20 text-yellow-700';
  if (s === 'missing') return 'bg-red-500/20 text-red-700';
  return 'bg-blue-500/20 text-blue-700';
};

export default function GoogleBusinessPage() {
  const googleProfiles = PLATFORM_PROFILES.filter(p => p.platform === 'google');
  const googleTasks = WEEKLY_LOCAL_TASKS.filter(t => t.platform === 'google');
  const auditOk = GBP_AUDIT_REPORT.filter(f => f.status === 'ok').length;
  const auditTotal = GBP_AUDIT_REPORT.length;
  const completeness = Math.round((auditOk / auditTotal) * 100);

  return (
    <>
      <Helmet><title>Google Business Profile | Local Admin</title></Helmet>
      <div className="p-6 space-y-6 max-w-6xl mx-auto">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Google Business Profile</h1>
            <p className="text-muted-foreground text-sm mt-1">
              Complete GBP optimization system for all direct-operation markets.
            </p>
          </div>
          <div className="text-right">
            <p className="text-xs text-muted-foreground">Profile Completeness</p>
            <p className="text-2xl font-bold text-foreground">{completeness}%</p>
            <Progress value={completeness} className="h-2 w-32 mt-1" />
          </div>
        </div>

        <Tabs defaultValue="audit" className="space-y-4">
          <TabsList className="flex-wrap h-auto gap-1">
            <TabsTrigger value="audit">Audit</TabsTrigger>
            <TabsTrigger value="profiles">Profiles</TabsTrigger>
            <TabsTrigger value="categories">Categories</TabsTrigger>
            <TabsTrigger value="description">Description</TabsTrigger>
            <TabsTrigger value="areas">Service Areas</TabsTrigger>
            <TabsTrigger value="services">Services</TabsTrigger>
            <TabsTrigger value="qa">Q&A</TabsTrigger>
            <TabsTrigger value="posts">Posts</TabsTrigger>
            <TabsTrigger value="photos">Photos</TabsTrigger>
            <TabsTrigger value="reviews">Reviews</TabsTrigger>
            <TabsTrigger value="tasks">Tasks</TabsTrigger>
          </TabsList>

          {/* ─── AUDIT TAB ─── */}
          <TabsContent value="audit">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> GBP Audit Report</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {GBP_AUDIT_REPORT.map((f, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <Badge className={`text-[10px] ${statusColor(f.status)}`}>{f.status.replace('_', ' ')}</Badge>
                        <span className="text-sm font-medium text-foreground">{f.field}</span>
                      </div>
                      <div className="flex items-center gap-2 text-right">
                        <span className="text-xs text-muted-foreground max-w-[200px] truncate">{f.currentValue}</span>
                        <Badge variant={f.priority === 'critical' ? 'destructive' : 'outline'} className="text-[10px]">{f.priority}</Badge>
                      </div>
                    </div>
                  ))}
                </div>
                {GBP_AUDIT_REPORT.filter(f => f.recommendedFix).length > 0 && (
                  <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                    <p className="text-xs font-medium text-muted-foreground mb-2">Recommended Fixes</p>
                    {GBP_AUDIT_REPORT.filter(f => f.recommendedFix).map((f, i) => (
                      <p key={i} className="text-xs text-foreground py-1">• <span className="font-medium">{f.field}:</span> {f.recommendedFix}</p>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="mt-4">
              <CardHeader><CardTitle>Optimization Checklist</CardTitle></CardHeader>
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
          </TabsContent>

          {/* ─── PROFILES TAB ─── */}
          <TabsContent value="profiles">
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

            <Card className="mt-4">
              <CardHeader><CardTitle>Business Info (Source of Truth)</CardTitle></CardHeader>
              <CardContent className="text-sm">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div><p className="text-muted-foreground text-xs">Business Name</p><p className="font-medium text-foreground">{BUSINESS_INFO.name}</p></div>
                  <div><p className="text-muted-foreground text-xs">Phone</p><p className="font-medium text-foreground">{BUSINESS_INFO.primaryPhone}</p></div>
                  <div><p className="text-muted-foreground text-xs">Website</p><p className="font-medium text-foreground">{BUSINESS_INFO.website}</p></div>
                  <div><p className="text-muted-foreground text-xs">Primary Category</p><p className="font-medium text-foreground">{BUSINESS_INFO.primaryCategory}</p></div>
                  <div className="sm:col-span-2"><p className="text-muted-foreground text-xs">Hours</p><p className="font-medium text-foreground">{BUSINESS_INFO.hours.label}</p></div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── CATEGORIES TAB ─── */}
          <TabsContent value="categories">
            <Card>
              <CardHeader><CardTitle>Category Strategy</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {GBP_CATEGORIES.map((c, i) => (
                    <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                      <div className="flex items-center gap-3">
                        <Badge className={c.type === 'primary' ? 'bg-primary/20 text-primary' : 'bg-muted text-muted-foreground'}>{c.type}</Badge>
                        <div>
                          <p className="text-sm font-medium text-foreground">{c.name}</p>
                          <p className="text-xs text-muted-foreground">{c.rationale}</p>
                        </div>
                      </div>
                      <Badge className={c.verified ? 'bg-green-500/20 text-green-700' : 'bg-yellow-500/20 text-yellow-700'}>
                        {c.verified ? 'Verified in Selector' : 'Needs Verification'}
                      </Badge>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4 italic">Only add categories available in the live GBP category selector. Do not use categories as keyword stuffing.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── DESCRIPTION TAB ─── */}
          <TabsContent value="description">
            <div className="space-y-4">
              {Object.entries(GBP_DESCRIPTIONS).map(([key, desc]) => (
                <Card key={key}>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-base flex items-center justify-between">
                      <span className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</span>
                      <div className="flex items-center gap-2">
                        <Badge variant="outline" className="text-xs">{desc.length} / 750 chars</Badge>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(desc)}><Copy className="w-3 h-3" /></Button>
                      </div>
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-sm text-foreground bg-muted/50 rounded-lg p-3">{desc}</p>
                    {desc.length > 750 && <p className="text-xs text-destructive mt-1">⚠ Over 750 character limit</p>}
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── SERVICE AREAS TAB ─── */}
          <TabsContent value="areas">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Service Areas ({GBP_SERVICE_AREAS.length} / 20)</span>
                  <Badge variant={GBP_SERVICE_AREAS.length <= 20 ? 'outline' : 'destructive'}>{GBP_SERVICE_AREAS.length <= 20 ? 'Within Limit' : 'Over Limit'}</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                  {GBP_SERVICE_AREAS.map((area, i) => (
                    <div key={area} className="flex items-center gap-2 py-1.5 px-3 rounded-lg border border-border">
                      <span className="text-xs text-muted-foreground w-5">{i + 1}</span>
                      <span className="text-sm text-foreground">{area}</span>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">Priority order: direct markets first, then partner-network markets. Rotate strategically based on demand.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── SERVICES TAB ─── */}
          <TabsContent value="services">
            <div className="space-y-4">
              {GBP_SERVICES.map((group) => (
                <Card key={group.group}>
                  <CardHeader><CardTitle className="text-base">{group.group}</CardTitle></CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      {group.services.map((s) => (
                        <div key={s.name} className="py-2 border-b border-border last:border-0">
                          <p className="text-sm font-medium text-foreground">{s.name}</p>
                          <p className="text-xs text-muted-foreground mt-0.5">{s.description}</p>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* ─── Q&A TAB ─── */}
          <TabsContent value="qa">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><HelpCircle className="w-4 h-4" /> Q&A Bank ({GBP_QA_BANK.length} entries)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {GBP_QA_BANK.map((qa, i) => (
                    <div key={i} className="border border-border rounded-lg p-4">
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <p className="text-sm font-medium text-foreground">Q: {qa.question}</p>
                        <div className="flex items-center gap-1 shrink-0">
                          <Badge variant="outline" className="text-[10px]">{qa.priority}</Badge>
                          <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => copy(`Q: ${qa.question}\nA: ${qa.answer}`)}><Copy className="w-3 h-3" /></Button>
                        </div>
                      </div>
                      <p className="text-sm text-muted-foreground">A: {qa.answer}</p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── POSTS TAB ─── */}
          <TabsContent value="posts">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><FileText className="w-4 h-4" /> Weekly Posts Calendar (8-Week Rotation)</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {GBP_POST_TEMPLATES.map((post) => (
                    <div key={post.id} className="border border-border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <Badge variant="secondary" className="text-xs">Week {post.rotationWeek}</Badge>
                          <Badge variant="outline" className="text-xs">{post.theme}</Badge>
                        </div>
                        <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(`${post.title}\n\n${post.body}`)}><Copy className="w-3 h-3" /></Button>
                      </div>
                      <p className="text-sm font-medium text-foreground mb-1">{post.title}</p>
                      <p className="text-sm text-muted-foreground mb-2">{post.body}</p>
                      <div className="flex items-center gap-2">
                        <Badge className="bg-primary/20 text-primary text-xs">CTA: {post.cta}</Badge>
                        <span className="text-xs text-muted-foreground truncate">{post.ctaUrl}</span>
                      </div>
                    </div>
                  ))}
                </div>
                <p className="text-xs text-muted-foreground mt-4">Posts are archived by Google after ~6 months. Maintain weekly publishing cadence.</p>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── PHOTOS TAB ─── */}
          <TabsContent value="photos">
            <Card>
              <CardHeader><CardTitle className="flex items-center gap-2"><Image className="w-4 h-4" /> Weekly Photo Targets</CardTitle></CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {GBP_PHOTO_TARGETS.map((t) => (
                    <div key={t.category} className="flex items-start justify-between py-3 border-b border-border last:border-0">
                      <div>
                        <p className="text-sm font-medium text-foreground">{t.category}</p>
                        <p className="text-xs text-muted-foreground mt-0.5">{t.examples.join(' • ')}</p>
                      </div>
                      <Badge variant="outline" className="text-xs shrink-0">{t.weeklyGoal}/week</Badge>
                    </div>
                  ))}
                </div>
                <div className="mt-4 p-3 bg-muted/50 rounded-lg">
                  <p className="text-xs font-medium text-muted-foreground">Weekly Total: {GBP_PHOTO_TARGETS.reduce((s, t) => s + t.weeklyGoal, 0)} photos</p>
                  <p className="text-xs text-muted-foreground mt-1">Geo-tag all photos. Prioritize core markets (Oakland, San Jose, SF).</p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* ─── REVIEWS TAB ─── */}
          <TabsContent value="reviews">
            <div className="space-y-4">
              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-4 h-4" /> Review Request Templates</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {[
                    { label: 'SMS Request', text: GBP_REVIEW_REQUEST.sms },
                    { label: 'Email Subject', text: GBP_REVIEW_REQUEST.emailSubject },
                    { label: 'Email Body', text: GBP_REVIEW_REQUEST.emailBody },
                    { label: 'Reminder SMS', text: GBP_REVIEW_REQUEST.reminderSms },
                  ].map((t) => (
                    <div key={t.label}>
                      <p className="text-xs font-medium text-muted-foreground mb-1">{t.label}</p>
                      <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground relative pr-10">
                        {t.text}
                        <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => copy(t.text)}><Copy className="w-3 h-3" /></Button>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Response Templates</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {Object.entries(GBP_REVIEW_RESPONSES).map(([key, template]) => (
                      <div key={key} className="border border-border rounded-lg p-4">
                        <div className="flex items-center justify-between mb-2">
                          <Badge variant="outline" className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(template)}><Copy className="w-3 h-3" /></Button>
                        </div>
                        <p className="text-sm text-foreground">{template}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader><CardTitle>Review Links by Market</CardTitle></CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {REVIEW_LINKS.filter(r => r.platform === 'google').map(r => (
                      <div key={r.marketCode} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                        <span className="text-sm font-medium text-foreground">{r.label}</span>
                        <div className="flex items-center gap-2">
                          <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px]">{r.url}</a>
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copy(r.url)}><Copy className="w-3 h-3" /></Button>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* ─── TASKS TAB ─── */}
          <TabsContent value="tasks">
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
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}
