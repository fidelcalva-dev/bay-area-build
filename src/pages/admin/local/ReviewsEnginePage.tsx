import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Star, MessageSquare, Send, Copy, Clock, Mail, Phone } from 'lucide-react';
import { toast } from 'sonner';
import { REVIEW_LINKS, BUSINESS_INFO } from '@/config/localPresenceConfig';
import { GBP_REVIEW_REQUEST, GBP_REVIEW_RESPONSES } from '@/config/gbpContentConfig';

const REVIEW_TRIGGERS = [
  { event: 'Delivery completed', timing: 'Immediate', channel: 'SMS', icon: Phone },
  { event: 'Pickup completed', timing: '2 hours after', channel: 'SMS + Email', icon: Send },
  { event: 'Invoice paid', timing: 'Next business day', channel: 'Email', icon: Mail },
  { event: 'No review after 3 days', timing: 'Day 3 reminder', channel: 'SMS', icon: Clock },
  { event: 'No review after 7 days', timing: 'Day 7 final reminder', channel: 'Email', icon: Clock },
];

const copyToClipboard = (text: string) => {
  navigator.clipboard.writeText(text);
  toast.success('Copied to clipboard');
};

export default function ReviewsEnginePage() {
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
                  <div className="flex items-center gap-2">
                    <t.icon className="w-3.5 h-3.5 text-muted-foreground" />
                    <span className="text-sm font-medium text-foreground">{t.event}</span>
                  </div>
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
                    <a href={r.url} target="_blank" rel="noopener noreferrer" className="text-xs text-primary hover:underline truncate max-w-[200px]">{r.url}</a>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(r.url)}><Copy className="w-3 h-3" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Request Templates */}
        <Card>
          <CardHeader><CardTitle>Request Templates</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {[
              { label: 'SMS Template', text: GBP_REVIEW_REQUEST.sms },
              { label: 'Email Subject', text: GBP_REVIEW_REQUEST.emailSubject },
              { label: 'Email Body', text: GBP_REVIEW_REQUEST.emailBody },
              { label: 'Reminder SMS (Day 3)', text: GBP_REVIEW_REQUEST.reminderSms },
            ].map((t) => (
              <div key={t.label}>
                <p className="text-xs font-medium text-muted-foreground mb-1">{t.label}</p>
                <div className="bg-muted/50 rounded-lg p-3 text-sm text-foreground relative pr-10">
                  <span className="whitespace-pre-line">{t.text}</span>
                  <Button variant="ghost" size="icon" className="absolute top-1 right-1 h-6 w-6" onClick={() => copyToClipboard(t.text)}><Copy className="w-3 h-3" /></Button>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Response Templates */}
        <Card>
          <CardHeader><CardTitle className="flex items-center gap-2"><MessageSquare className="w-4 h-4" /> Response Templates</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(GBP_REVIEW_RESPONSES).map(([key, template]) => (
                <div key={key} className="border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-2">
                    <Badge variant="outline" className="capitalize">{key.replace(/([A-Z])/g, ' $1').trim()}</Badge>
                    <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => copyToClipboard(template)}><Copy className="w-3 h-3" /></Button>
                  </div>
                  <p className="text-sm text-foreground">{template}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </>
  );
}
