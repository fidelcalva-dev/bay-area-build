/**
 * SalesScriptLibrary — Quick-access sales scripts for common scenarios.
 * Renders as an expandable card with categorized scripts for Call, SMS, Email.
 */
import { useState } from 'react';
import {
  Phone, MessageSquare, Mail, Copy, ChevronDown, ChevronRight,
  Handshake, AlertTriangle, DollarSign, Star, Truck, Clock
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { useToast } from '@/hooks/use-toast';

interface Script {
  id: string;
  category: string;
  title: string;
  channel: 'CALL' | 'SMS' | 'EMAIL';
  shortVersion: string;
  fullVersion: string;
  bestUseCase: string;
  cta: string;
}

const SCRIPTS: Script[] = [
  {
    id: 'first-contact',
    category: 'First Contact',
    title: 'New Lead Introduction',
    channel: 'CALL',
    shortVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro. I saw your request for a [SIZE] dumpster. I can get one to you as early as tomorrow. Do you have a minute to confirm details?',
    fullVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro. Thank you for reaching out about a dumpster rental.\n\nI saw your request for a [SIZE]-yard dumpster for [PROJECT_TYPE]. We service your area and I can get one delivered as early as tomorrow.\n\nI just need to confirm a few quick details:\n1. Delivery address\n2. What material are you disposing of?\n3. Preferred delivery time\n\nOnce confirmed, I can send you a quote right away. The price includes delivery, pickup, and disposal.',
    bestUseCase: 'First call to a new lead within SLA window',
    cta: 'Confirm details and send quote',
  },
  {
    id: 'missed-call-followup',
    category: 'Follow-Up',
    title: 'Missed Call Follow-Up',
    channel: 'SMS',
    shortVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro. I tried calling about your dumpster request. We can get you set up quickly — reply here or call us at (510) 680-2150.',
    fullVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro.\n\nI tried reaching you about your dumpster rental request. We have availability in your area and can get you set up today.\n\nYou can reply to this text or call us at (510) 680-2150.\n\nHappy to help with any questions about sizing, pricing, or scheduling.',
    bestUseCase: 'Lead did not answer first call attempt',
    cta: 'Schedule callback or send quote link',
  },
  {
    id: 'quote-followup',
    category: 'Follow-Up',
    title: 'Quote Follow-Up',
    channel: 'SMS',
    shortVersion: 'Hi [NAME], just following up on the quote we sent for your [PROJECT_TYPE] project. Ready to schedule delivery? Reply YES and we can get it on the calendar.',
    fullVersion: 'Hi [NAME], this is [REP] from Calsan Dumpsters Pro.\n\nJust checking in on the quote we sent for your [SIZE]-yard dumpster. The price of $[PRICE] includes delivery, [DAYS]-day rental, [TONS] tons of disposal, and pickup.\n\nIf you are ready, I can schedule delivery as early as tomorrow. Reply YES or call (510) 680-2150.\n\nLet me know if you have any questions.',
    bestUseCase: 'Quote sent but no response within 4 hours',
    cta: 'Confirm and schedule',
  },
  {
    id: 'price-objection',
    category: 'Objection Handling',
    title: 'Price Concern',
    channel: 'CALL',
    shortVersion: 'I understand price is important. Our quote includes everything — delivery, pickup, and disposal. There are no hidden fees. Many competitors charge extra for fuel, disposal, and overweight. Want me to break down what is included?',
    fullVersion: 'I completely understand wanting to make sure you are getting good value.\n\nHere is what is included in our price:\n- Free delivery and pickup\n- [DAYS]-day rental period\n- Up to [TONS] tons of disposal\n- No fuel surcharges\n- No hidden fees\n\nMany competitors advertise a lower base price but add fees for delivery, pickup, fuel, and disposal separately. When you compare total cost, we are very competitive.\n\nWould you like me to send you a detailed breakdown?',
    bestUseCase: 'Customer expresses concern about pricing',
    cta: 'Send detailed price breakdown',
  },
  {
    id: 'size-unsure',
    category: 'Objection Handling',
    title: 'Not Sure What Size',
    channel: 'CALL',
    shortVersion: 'No problem — most homeowners need a 10-yard for small cleanouts or a 20-yard for renovation projects. Can you tell me what you are working on? I can recommend the right size.',
    fullVersion: 'That is a great question and very common.\n\nHere is a quick guide:\n- 10-yard: Small cleanout, garage, 1 room renovation\n- 15-yard: Medium renovation, deck removal\n- 20-yard: Full renovation, roofing, large cleanout\n- 30-yard: New construction, major demolition\n\nCan you tell me about your project? I can recommend the perfect size and if you need a bigger one later, we can always do a swap.\n\nWhat type of material will you be disposing of?',
    bestUseCase: 'Customer unsure about dumpster size',
    cta: 'Recommend size and send quote',
  },
  {
    id: 'contractor-outreach',
    category: 'Contractor',
    title: 'Contractor Account Intro',
    channel: 'EMAIL',
    shortVersion: 'Subject: Contractor rates for your projects\n\nHi [NAME], Calsan Dumpsters Pro offers preferred contractor pricing with priority scheduling. Let us set up your account.',
    fullVersion: 'Subject: Contractor Pricing and Priority Service\n\nHi [NAME],\n\nThank you for your interest in Calsan Dumpsters Pro.\n\nFor contractors, we offer:\n- Preferred pricing on all sizes\n- Priority same-day delivery\n- Dedicated account manager\n- Flexible billing (per-job or monthly)\n- Multiple site coordination\n\nI would like to learn more about your typical projects so I can set up the right account for you.\n\nWould you have 5 minutes for a quick call? Or reply with your typical dumpster needs and I can prepare a custom rate sheet.\n\nBest,\n[REP]\nCalsan Dumpsters Pro\n(510) 680-2150',
    bestUseCase: 'Lead identified as contractor or construction company',
    cta: 'Schedule call or send rate sheet',
  },
  {
    id: 'overdue-payment',
    category: 'Collections',
    title: 'Overdue Payment Reminder',
    channel: 'SMS',
    shortVersion: 'Hi [NAME], this is Calsan Dumpsters Pro. We have an outstanding balance of $[AMOUNT] for your recent dumpster rental. You can pay securely here: [PAYMENT_LINK]. Questions? Call (510) 680-2150.',
    fullVersion: 'Hi [NAME], this is Calsan Dumpsters Pro.\n\nWe wanted to remind you about the outstanding balance of $[AMOUNT] for your dumpster rental (Order #[ORDER_ID]).\n\nYou can pay securely online: [PAYMENT_LINK]\n\nIf you have already sent payment, please disregard this message.\n\nQuestions about your invoice? Call us at (510) 680-2150.',
    bestUseCase: 'Invoice is overdue by 3+ days',
    cta: 'Send payment link',
  },
  {
    id: 'review-request',
    category: 'Post-Service',
    title: 'Review Request',
    channel: 'SMS',
    shortVersion: 'Hi [NAME], thank you for choosing Calsan Dumpsters Pro. We hope everything went well. Would you mind leaving us a quick review? It helps us serve customers like you better. [REVIEW_LINK]',
    fullVersion: 'Hi [NAME], thank you for choosing Calsan Dumpsters Pro for your recent project.\n\nWe hope the service met your expectations. If you have a moment, we would really appreciate a quick review on Google. It helps other homeowners find reliable dumpster service.\n\n[REVIEW_LINK]\n\nThank you for your business. We are here anytime you need us.\n\nCalsan Dumpsters Pro\n(510) 680-2150',
    bestUseCase: 'Order completed successfully, customer had good experience',
    cta: 'Send review link',
  },
];

const CHANNEL_ICONS = { CALL: Phone, SMS: MessageSquare, EMAIL: Mail };
const CATEGORY_ICONS: Record<string, typeof Phone> = {
  'First Contact': Handshake,
  'Follow-Up': Clock,
  'Objection Handling': AlertTriangle,
  'Contractor': Truck,
  'Collections': DollarSign,
  'Post-Service': Star,
};

export function SalesScriptLibrary() {
  const { toast } = useToast();
  const [expanded, setExpanded] = useState<string | null>(null);

  const categories = [...new Set(SCRIPTS.map(s => s.category))];

  const handleCopy = async (text: string, label: string) => {
    await navigator.clipboard.writeText(text);
    toast({ title: `${label} copied` });
  };

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="text-base flex items-center gap-2">
          <MessageSquare className="w-4 h-4 text-primary" />
          Sales Scripts
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-2">
        {categories.map(cat => {
          const catScripts = SCRIPTS.filter(s => s.category === cat);
          const CatIcon = CATEGORY_ICONS[cat] || MessageSquare;

          return (
            <div key={cat}>
              <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wider flex items-center gap-1.5 mb-1.5 mt-2 first:mt-0">
                <CatIcon className="w-3 h-3" />{cat}
              </p>
              {catScripts.map(script => {
                const ChannelIcon = CHANNEL_ICONS[script.channel];
                const isExpanded = expanded === script.id;

                return (
                  <Collapsible key={script.id} open={isExpanded} onOpenChange={() => setExpanded(isExpanded ? null : script.id)}>
                    <CollapsibleTrigger className="w-full flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors text-left gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <ChannelIcon className="w-3.5 h-3.5 text-muted-foreground shrink-0" />
                        <span className="text-sm truncate">{script.title}</span>
                      </div>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <Badge variant="outline" className="text-[10px] h-5">{script.channel}</Badge>
                        {isExpanded ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </div>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <div className="ml-6 p-3 rounded-lg bg-muted/30 space-y-3 mb-2">
                        <p className="text-xs text-muted-foreground">{script.bestUseCase}</p>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Quick Version</span>
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleCopy(script.shortVersion, 'Quick script')}>
                              <Copy className="w-3 h-3 mr-1" />Copy
                            </Button>
                          </div>
                          <p className="text-sm bg-background p-2.5 rounded border whitespace-pre-wrap">{script.shortVersion}</p>
                        </div>

                        <div>
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-xs font-medium">Full Version</span>
                            <Button size="sm" variant="ghost" className="h-6 px-2 text-xs" onClick={() => handleCopy(script.fullVersion, 'Full script')}>
                              <Copy className="w-3 h-3 mr-1" />Copy
                            </Button>
                          </div>
                          <p className="text-sm bg-background p-2.5 rounded border whitespace-pre-wrap max-h-48 overflow-y-auto">{script.fullVersion}</p>
                        </div>

                        <p className="text-xs text-primary font-medium">Next: {script.cta}</p>
                      </div>
                    </CollapsibleContent>
                  </Collapsible>
                );
              })}
            </div>
          );
        })}
      </CardContent>
    </Card>
  );
}
