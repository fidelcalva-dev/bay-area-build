/**
 * RecommendedScriptWidget — Shows a contextual script recommendation
 * based on customer/lead state. Used in Customer 360 and Lead Detail.
 */
import { useState } from 'react';
import { MessageSquare, Phone, Copy, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';

interface RecommendedScriptWidgetProps {
  customerType?: string | null;
  quoteStatus?: string | null;
  hasOverdue?: boolean;
  isExistingCustomer?: boolean;
  projectType?: string | null;
}

interface ScriptRecommendation {
  category: string;
  title: string;
  smsVersion: string;
  callVersion: string;
}

function getRecommendation(props: RecommendedScriptWidgetProps): ScriptRecommendation {
  const { customerType, quoteStatus, hasOverdue, isExistingCustomer, projectType } = props;

  if (hasOverdue) {
    return {
      category: 'Collections',
      title: 'Overdue Payment Reminder',
      smsVersion: 'Hi [NAME], this is Calsan Dumpsters Pro. We have an outstanding balance for your recent dumpster rental. You can pay securely online or call us at (510) 680-2150.',
      callVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro. I am calling about your outstanding balance. I can help you get that resolved right now — would you like to pay by card over the phone?',
    };
  }

  if (quoteStatus === 'sent' || quoteStatus === 'saved') {
    return {
      category: 'Follow-Up',
      title: 'Quote Follow-Up',
      smsVersion: 'Hi [NAME], just following up on the quote we sent. Ready to schedule delivery? Reply YES and we can get it on the calendar.',
      callVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro. I wanted to follow up on the quote we sent. Do you have any questions? I can schedule delivery as early as tomorrow.',
    };
  }

  if (customerType?.toLowerCase().includes('contractor')) {
    return {
      category: 'Contractor',
      title: 'Contractor Account Outreach',
      smsVersion: 'Hi [NAME], this is Calsan Dumpsters Pro. We offer preferred contractor rates with priority scheduling. Let me know if you need service — (510) 680-2150.',
      callVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro. I see you work in construction. We offer preferred pricing and priority same-day delivery for contractors. Can I set up an account for you?',
    };
  }

  if (isExistingCustomer) {
    return {
      category: 'Post-Service',
      title: 'Review Request / Reorder',
      smsVersion: 'Hi [NAME], thank you for choosing Calsan Dumpsters Pro. Need another dumpster? We can get you set up quickly. Call or reply here.',
      callVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro. Thank you for your recent rental. I wanted to check if you need anything else or if we can help with another project.',
    };
  }

  return {
    category: 'First Contact',
    title: 'New Lead Introduction',
    smsVersion: 'Hi [NAME], this is Calsan Dumpsters Pro. We received your request and can get a dumpster to you quickly. Reply here or call (510) 680-2150.',
    callVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro. I saw your request for a dumpster. I can get one to you as early as tomorrow. Do you have a minute to confirm details?',
  };
}

export function RecommendedScriptWidget(props: RecommendedScriptWidgetProps) {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState(false);
  const rec = getRecommendation(props);

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  return (
    <Card>
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center justify-between">
          <span className="flex items-center gap-2">
            <MessageSquare className="w-4 h-4 text-primary" />
            Recommended Script
          </span>
          <Badge variant="outline" className="text-[10px]">{rec.category}</Badge>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        <p className="text-xs font-medium text-muted-foreground">{rec.title}</p>

        {/* SMS Quick */}
        <div className="p-2.5 rounded-lg bg-muted/30 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground flex items-center gap-1">
              <MessageSquare className="w-3 h-3" />SMS
            </span>
            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleCopy(rec.smsVersion, 'SMS script')}>
              <Copy className="w-3 h-3 mr-1" />Copy
            </Button>
          </div>
          <p className="text-xs leading-relaxed">{rec.smsVersion}</p>
        </div>

        {/* Call — collapsible */}
        <button
          onClick={() => setExpanded(!expanded)}
          className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors w-full"
        >
          {expanded ? <ChevronDown className="w-3 h-3" /> : <ChevronRight className="w-3 h-3" />}
          <Phone className="w-3 h-3" />
          Call Script
        </button>
        {expanded && (
          <div className="p-2.5 rounded-lg bg-muted/30 space-y-1.5">
            <div className="flex items-center justify-end">
              <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleCopy(rec.callVersion, 'Call script')}>
                <Copy className="w-3 h-3 mr-1" />Copy
              </Button>
            </div>
            <p className="text-xs leading-relaxed whitespace-pre-wrap">{rec.callVersion}</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
