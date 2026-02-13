// Auto-generated scripts for Sales/CS/Dispatch

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Phone, MessageSquare, Mail, Copy, Check, ClipboardList } from 'lucide-react';
import type { CalculatorEstimate, CustomerType } from '@/types/calculator';

interface ScriptGeneratorProps {
  estimate: CalculatorEstimate;
  userRole: string;
}

function generateCallScript(est: CalculatorEstimate): string {
  const sizeLabel = `${est.dumpster_size}-yard`;
  const materialLabel = est.material_category === 'HEAVY' ? 'heavy material' : 'standard debris';
  const priceStr = est.customer_price ? `$${est.customer_price.toFixed(0)}` : '[PRICE]';
  const includedTons = est.dumpster_size <= 10 ? '1' : est.dumpster_size <= 20 ? '2' : `${Math.floor(est.dumpster_size / 10)}`;

  return `Hi, this is [AGENT NAME] from Calsan Dumpsters Pro.

I have your ${sizeLabel} dumpster quote ready for ${materialLabel}.

Your total is ${priceStr}, which includes ${includedTons} ton${parseInt(includedTons) > 1 ? 's' : ''} and 7 days of rental.

Any additional weight is billed at $165 per ton, and extra days are $35 each.

${est.is_same_day ? 'We can get this delivered today.' : 'We can schedule delivery at your convenience.'}

${est.material_category === 'HEAVY' ? 'Important: For heavy materials, the fill line must not be exceeded. We have a strict weight policy for safety.' : ''}

Would you like to proceed with booking?`;
}

function generateSmsScript(est: CalculatorEstimate): string {
  const priceStr = est.customer_price ? `$${est.customer_price.toFixed(0)}` : '[PRICE]';
  return `Calsan Dumpsters Pro - Your ${est.dumpster_size}yd dumpster quote: ${priceStr} (includes 7 days + tonnage). Ready to book? Reply YES or call us at (510) 000-0000.`;
}

function generateEmailScript(est: CalculatorEstimate): string {
  const priceStr = est.customer_price ? `$${est.customer_price.toFixed(0)}` : '[PRICE]';
  const includedTons = est.dumpster_size <= 10 ? '1' : est.dumpster_size <= 20 ? '2' : `${Math.floor(est.dumpster_size / 10)}`;

  return `Subject: Your Dumpster Rental Quote - ${est.dumpster_size}yd Container

Hello,

Thank you for your interest in Calsan Dumpsters Pro. Here is your quote summary:

Container Size: ${est.dumpster_size}-yard
Material Type: ${est.material_category === 'HEAVY' ? 'Heavy Materials' : 'Standard Debris'}
Total Price: ${priceStr}

What's included:
- ${includedTons} ton(s) of disposal
- 7-day rental period
- Delivery and pickup

Additional charges:
- Extra weight: $165/ton
- Extra days: $35/day

${est.destination_address ? `Delivery Address: ${est.destination_address}` : ''}

To confirm your booking, simply reply to this email or call us.

Best regards,
Calsan Dumpsters Pro
Licensed & Insured | Bay Area`;
}

function generateDispatchNotes(est: CalculatorEstimate): string {
  return `=== DISPATCH NOTES ===
Service: ${est.service_type}
Size: ${est.dumpster_size}yd
Material: ${est.material_category}
${est.destination_address ? `Address: ${est.destination_address}` : 'Address: [PENDING]'}
${est.is_same_day ? 'PRIORITY: Same-day service requested' : ''}

Yard: ${est.yard_id || '[AUTO-ASSIGN]'}
SLA: ${est.sla_class || 'STANDARD'}
Est. Cycle: ${est.total_time_minutes ? `${est.total_time_minutes} min` : 'TBD'}

${est.material_category === 'HEAVY' ? 'HEAVY MATERIAL - Enforce fill-line. Max load per safety policy.' : ''}
${est.service_type === 'SWAP' ? 'SWAP - Bring empty, pick up full. Confirm asset reservation.' : ''}

Notes: [ADD ACCESS/GATE NOTES]
===`;
}

export function ScriptGenerator({ estimate, userRole }: ScriptGeneratorProps) {
  const [copiedTab, setCopiedTab] = useState<string | null>(null);

  const scripts = {
    call: generateCallScript(estimate),
    sms: generateSmsScript(estimate),
    email: generateEmailScript(estimate),
    dispatch: generateDispatchNotes(estimate),
  };

  const handleCopy = async (text: string, tab: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedTab(tab);
    setTimeout(() => setCopiedTab(null), 2000);
  };

  const showSalesScripts = userRole === 'admin' || userRole === 'sales' || userRole === 'cs';
  const showDispatch = userRole === 'admin' || userRole === 'dispatcher';

  return (
    <Card>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-base">
          <MessageSquare className="h-5 w-5" />
          Scripts & Templates
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue={showSalesScripts ? 'call' : 'dispatch'}>
          <TabsList className="w-full grid grid-cols-4 h-9">
            {showSalesScripts && (
              <>
                <TabsTrigger value="call" className="text-xs">
                  <Phone className="h-3 w-3 mr-1" />
                  Call
                </TabsTrigger>
                <TabsTrigger value="sms" className="text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  SMS
                </TabsTrigger>
                <TabsTrigger value="email" className="text-xs">
                  <Mail className="h-3 w-3 mr-1" />
                  Email
                </TabsTrigger>
              </>
            )}
            {showDispatch && (
              <TabsTrigger value="dispatch" className="text-xs">
                <ClipboardList className="h-3 w-3 mr-1" />
                Dispatch
              </TabsTrigger>
            )}
          </TabsList>

          {Object.entries(scripts).map(([key, text]) => (
            <TabsContent key={key} value={key} className="mt-3">
              <div className="relative">
                <pre className="text-xs bg-muted/50 rounded-lg p-3 whitespace-pre-wrap font-mono max-h-[300px] overflow-y-auto">
                  {text}
                </pre>
                <Button
                  variant="outline"
                  size="sm"
                  className="absolute top-2 right-2 h-7 text-xs"
                  onClick={() => handleCopy(text, key)}
                >
                  {copiedTab === key ? (
                    <>
                      <Check className="h-3 w-3 mr-1" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="h-3 w-3 mr-1" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </TabsContent>
          ))}
        </Tabs>
      </CardContent>
    </Card>
  );
}
