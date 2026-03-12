import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Send, Copy } from 'lucide-react';
import { toast } from 'sonner';
import { REVIEW_LINKS, REVIEW_RESPONSE_TEMPLATES, BUSINESS_INFO } from '@/config/localPresenceConfig';

const REVIEW_TRIGGERS = [
  { event: 'Delivery completed', timing: 'Immediate', channel: 'SMS' },
  { event: 'Pickup completed', timing: '2 hours after', channel: 'SMS + Email' },
  { event: 'Invoice paid', timing: 'Next business day', channel: 'Email' },
  { event: 'No review after 3 days', timing: 'Day 3 reminder', channel: 'SMS' },
  { event: 'No review after 7 days', timing: 'Day 7 final reminder', channel: 'Email' },
];

const SMS_TEMPLATE = `Hi {name}, thanks for choosing ${BUSINESS_INFO.name}! We'd love your feedback. Please leave a quick review: {review_link} — Reply STOP to opt out.`;
const EMAIL_SUBJECT = `How was your dumpster rental experience, {name}?`;

export default function ReviewsEnginePage() {
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <>
      <Helmet><title>Reviews Engine | Local Admin</title></Helmet>
      <div className="p-6 space-y-6 max-w-5xl mx-auto">
        <div>
          <h1 className="text-2xl font-bold text-foreground">Reviews Engine</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Review request automation, response templates, and tracking.
          </p>
        </div>

        {/* Review Triggers */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Send className="w-4 h-4" /> Review Request Triggers</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {REVIEW_TRIGGERS.map((t, i) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <span className="text-sm font-medium text-foreground">{t.event}</span>
                  <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">{t.timing}</Badge>
                    <Badge variant="secondary" className="text-xs">{t.channel}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Review Links */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><Star className="w-4 h-4" /> Review Links</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {REVIEW_LINKS.map(r => (
                <div key={r.marketCode} className="flex items-center justify-between py-2 border-b border-border last:border-0">
                  <div>
                    <span className="text-sm font-medium text-foreground">{r.label}</span>
                    <span className="text-xs text-muted-foreground ml-2">({r.platform})</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px]">
                      {r.url}
                    </a>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(r.url)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Message Templates */}
        <Card>
          <CardHeader><CardTitle>Request Templates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">SMS Template</p>
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground relative">
                {SMS_TEMPLATE}
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => copyToClipboard(SMS_TEMPLATE)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
            <div>
              <p className="text-xs font-medium text-muted-foreground mb-1">Email Subject</p>
              <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground relative">
                {EMAIL_SUBJECT}
                <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => copyToClipboard(EMAIL_SUBJECT)}>
                  <Copy className="w-3 h-3" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Response Templates */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Response Templates</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {REVIEW_RESPONSE_TEMPLATES.map(t => (
                <div key={t.id} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline">{t.scenario}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(t.template)}>
                      <Copy className="w-3 h-3" />
                    </Button>
                  </div>
                  <p className="text-sm text-foreground">{t.template}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
