import { useState } from 'react';
import { CheckCircle2, Circle, Copy, ExternalLink, AlertTriangle, Phone, Settings, FileCheck, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

interface WizardStep {
  id: string;
  title: string;
  description: string;
  icon: React.ReactNode;
}

const WIZARD_STEPS: WizardStep[] = [
  { id: 'ghl-numbers', title: 'GHL Numbers', description: 'Enter your GHL phone numbers', icon: <Phone className="w-5 h-5" /> },
  { id: 'twilio-setup', title: 'Twilio Setup', description: 'Create/attach Twilio numbers', icon: <Settings className="w-5 h-5" /> },
  { id: 'webhooks', title: 'Webhook URLs', description: 'Configure Twilio webhooks', icon: <ExternalLink className="w-5 h-5" /> },
  { id: 'ghl-forward', title: 'GHL Forwarding', description: 'Set up forwarding in GHL', icon: <Phone className="w-5 h-5" /> },
  { id: 'validation', title: '48-Hour Validation', description: 'Test and validate calls', icon: <FileCheck className="w-5 h-5" /> },
  { id: 'porting', title: 'Porting Checklist', description: 'Port number to Twilio', icon: <FileCheck className="w-5 h-5" /> },
  { id: 'cutover', title: 'Cutover & Rollback', description: 'Final cutover controls', icon: <RotateCcw className="w-5 h-5" /> },
];

interface MigrationWizardProps {
  webhookBaseUrl: string;
  onComplete?: () => void;
}

export function MigrationWizard({ webhookBaseUrl, onComplete }: MigrationWizardProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [validationChecks, setValidationChecks] = useState<Record<string, boolean>>({});
  const [portingChecks, setPortingChecks] = useState<Record<string, boolean>>({});
  const { toast } = useToast();

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({ title: 'Copied to clipboard' });
  };

  const renderStepContent = () => {
    switch (WIZARD_STEPS[currentStep].id) {
      case 'ghl-numbers':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Step A: List Your GHL Numbers</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Add your GHL phone numbers using the "Add Number" button in the Migration Worksheet tab above.
                For each number, specify:
              </p>
              <ul className="list-disc pl-4 space-y-1 text-sm">
                <li><strong>Phone Number:</strong> The GHL/LC Phone number (e.g., +1 510-555-1234)</li>
                <li><strong>Purpose:</strong> SALES, CS, or BILLING</li>
                <li><strong>Migration Method:</strong> Start with DUAL_RING or FORWARD (safest)</li>
                <li><strong>Current Status:</strong> Mark as PLANNED initially</li>
              </ul>
            </div>
            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div className="text-sm text-yellow-800">
                <strong>Tip:</strong> Start with one number (e.g., Sales line) to test the flow before migrating all lines.
              </div>
            </div>
          </div>
        );

      case 'twilio-setup':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Step B: Create Twilio Temporary Numbers</h4>
              <p className="text-sm text-muted-foreground mb-4">
                For FORWARD or DUAL_RING testing, you need Twilio numbers to receive forwarded calls.
              </p>
              <ol className="list-decimal pl-4 space-y-2 text-sm">
                <li>Go to <a href="https://console.twilio.com/us1/develop/phone-numbers/manage/incoming" target="_blank" rel="noopener" className="text-primary underline">Twilio Console → Phone Numbers</a></li>
                <li>Buy a new number in the same area code as your GHL number</li>
                <li>Add the number to our system via <strong>/admin/telephony/numbers</strong></li>
                <li>Link the Twilio number to your migration entry in the worksheet</li>
              </ol>
            </div>
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg flex gap-2">
              <Phone className="w-5 h-5 text-blue-600 shrink-0" />
              <div className="text-sm text-blue-800">
                <strong>Note:</strong> These temporary numbers will only be used during testing. Once you port the actual GHL number, you can release them.
              </div>
            </div>
          </div>
        );

      case 'webhooks':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Step C: Configure Twilio Webhooks</h4>
              <p className="text-sm text-muted-foreground mb-4">
                For each Twilio number, configure these webhook URLs in the Twilio Console:
              </p>
            </div>
            
            <div className="space-y-3">
              <WebhookUrlRow
                label="Voice Webhook (A call comes in)"
                url={`${webhookBaseUrl}/calls-inbound-handler`}
                method="POST"
                onCopy={copyToClipboard}
              />
              <WebhookUrlRow
                label="Status Callback URL"
                url={`${webhookBaseUrl}/calls-status-callback`}
                method="POST"
                onCopy={copyToClipboard}
              />
              <WebhookUrlRow
                label="Voicemail Recording Handler"
                url={`${webhookBaseUrl}/calls-voicemail-handler`}
                method="POST"
                onCopy={copyToClipboard}
              />
            </div>

            <div className="bg-green-50 border border-green-200 p-4 rounded-lg">
              <p className="text-sm text-green-800">
                <strong>✓ Current Mode:</strong> telephony.mode = DRY_RUN. Calls are logged but no LIVE actions are taken.
              </p>
            </div>
          </div>
        );

      case 'ghl-forward':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Step D: Configure GHL Forwarding</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Set up call forwarding in GoHighLevel to route calls to your Twilio number.
              </p>
            </div>

            <div className="space-y-4">
              <div className="border rounded-lg p-4">
                <h5 className="font-medium flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Option A</Badge>
                  Dual-Ring (Recommended for Testing)
                </h5>
                <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                  <li>In GHL Settings → Phone Numbers → Select your number</li>
                  <li>Enable "Simultaneous Ring" or "Ring Groups"</li>
                  <li>Add your Twilio number as a secondary ring target</li>
                  <li>Both GHL and Twilio will ring - answer on either</li>
                </ol>
              </div>

              <div className="border rounded-lg p-4">
                <h5 className="font-medium flex items-center gap-2 mb-2">
                  <Badge variant="secondary">Option B</Badge>
                  Unconditional Forward
                </h5>
                <ol className="list-decimal pl-4 space-y-1 text-sm text-muted-foreground">
                  <li>In GHL Settings → Phone Numbers → Select your number</li>
                  <li>Enable "Forward All Calls"</li>
                  <li>Enter your Twilio number as the forward destination</li>
                  <li>GHL will NOT ring - all calls go to Twilio</li>
                </ol>
              </div>
            </div>

            <div className="bg-yellow-50 border border-yellow-200 p-4 rounded-lg flex gap-2">
              <AlertTriangle className="w-5 h-5 text-yellow-600 shrink-0" />
              <div className="text-sm text-yellow-800">
                <strong>Important:</strong> When forwarding is active, calls will appear in our system with <code className="bg-white px-1 rounded">call_source = 'GHL_FORWARD'</code>
              </div>
            </div>
          </div>
        );

      case 'validation':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Step E: 48-Hour Validation</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Run dual-ring or forwarding for 48 hours and verify all checklist items pass.
              </p>
            </div>

            <div className="space-y-3">
              <ValidationCheckItem
                id="calls-ringing"
                label="Calls to GHL numbers are ringing on Calsan platform"
                checked={validationChecks['calls-ringing']}
                onCheckedChange={(checked) => setValidationChecks(prev => ({ ...prev, 'calls-ringing': checked }))}
              />
              <ValidationCheckItem
                id="call-logs"
                label="Call logs appear in call_events with source = 'GHL_FORWARD'"
                checked={validationChecks['call-logs']}
                onCheckedChange={(checked) => setValidationChecks(prev => ({ ...prev, 'call-logs': checked }))}
              />
              <ValidationCheckItem
                id="metadata-original"
                label="metadata.original_did contains the GHL number"
                checked={validationChecks['metadata-original']}
                onCheckedChange={(checked) => setValidationChecks(prev => ({ ...prev, 'metadata-original': checked }))}
              />
              <ValidationCheckItem
                id="metadata-forwarded"
                label="metadata.forwarded_to contains the Twilio temp number"
                checked={validationChecks['metadata-forwarded']}
                onCheckedChange={(checked) => setValidationChecks(prev => ({ ...prev, 'metadata-forwarded': checked }))}
              />
              <ValidationCheckItem
                id="assignments-created"
                label="Call assignments are being created correctly"
                checked={validationChecks['assignments-created']}
                onCheckedChange={(checked) => setValidationChecks(prev => ({ ...prev, 'assignments-created': checked }))}
              />
              <ValidationCheckItem
                id="voicemail-working"
                label="Voicemails are recorded when no agent answers"
                checked={validationChecks['voicemail-working']}
                onCheckedChange={(checked) => setValidationChecks(prev => ({ ...prev, 'voicemail-working': checked }))}
              />
            </div>

            <div className={`p-4 rounded-lg ${Object.values(validationChecks).filter(Boolean).length >= 6 ? 'bg-green-50 border-green-200' : 'bg-yellow-50 border-yellow-200'} border`}>
              <p className="text-sm font-medium">
                Validation Status: {Object.values(validationChecks).filter(Boolean).length} / 6 checks passed
              </p>
            </div>
          </div>
        );

      case 'porting':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Step F: Number Porting Checklist</h4>
              <p className="text-sm text-muted-foreground mb-4">
                Once validation passes, prepare to port the number from GHL/LC Phone to Twilio.
              </p>
            </div>

            <div className="space-y-3">
              <ValidationCheckItem
                id="loa-obtained"
                label="Obtained Letter of Authorization (LOA) from current carrier"
                checked={portingChecks['loa-obtained']}
                onCheckedChange={(checked) => setPortingChecks(prev => ({ ...prev, 'loa-obtained': checked }))}
              />
              <ValidationCheckItem
                id="carrier-info"
                label="Documented losing carrier information (account #, PIN)"
                checked={portingChecks['carrier-info']}
                onCheckedChange={(checked) => setPortingChecks(prev => ({ ...prev, 'carrier-info': checked }))}
              />
              <ValidationCheckItem
                id="twilio-port-request"
                label="Submitted port request in Twilio Console"
                checked={portingChecks['twilio-port-request']}
                onCheckedChange={(checked) => setPortingChecks(prev => ({ ...prev, 'twilio-port-request': checked }))}
              />
              <ValidationCheckItem
                id="port-date-confirmed"
                label="Port date confirmed (typically 7-14 business days)"
                checked={portingChecks['port-date-confirmed']}
                onCheckedChange={(checked) => setPortingChecks(prev => ({ ...prev, 'port-date-confirmed': checked }))}
              />
            </div>

            <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg">
              <p className="text-sm text-blue-800">
                <strong>Timeline:</strong> Port requests typically take 7-14 business days. Keep forwarding active until the port completes.
              </p>
            </div>

            <div className="space-y-2">
              <Label>Port Notes / Timeline</Label>
              <Textarea
                placeholder="e.g., Port request submitted on Jan 27, expected completion Feb 5..."
                rows={3}
              />
            </div>
          </div>
        );

      case 'cutover':
        return (
          <div className="space-y-4">
            <div className="bg-muted/50 p-4 rounded-lg">
              <h4 className="font-medium mb-2">Step G: Cutover & Rollback</h4>
              <p className="text-sm text-muted-foreground">
                Final controls for completing migration or rolling back if issues occur.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <Card className="border-green-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-green-700">Complete Cutover</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Mark migration as complete after port is successful.
                  </p>
                  <ol className="list-decimal pl-4 text-sm space-y-1">
                    <li>Disable forwarding in GHL</li>
                    <li>Update Twilio webhooks on ported number</li>
                    <li>Mark status as DONE in worksheet</li>
                  </ol>
                  <Button className="w-full mt-2" variant="default" onClick={onComplete}>
                    <CheckCircle2 className="w-4 h-4 mr-2" />
                    Mark Complete
                  </Button>
                </CardContent>
              </Card>

              <Card className="border-red-200">
                <CardHeader className="pb-2">
                  <CardTitle className="text-lg text-red-700">Rollback</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <p className="text-sm text-muted-foreground">
                    Revert to GHL if issues occur.
                  </p>
                  <ol className="list-decimal pl-4 text-sm space-y-1">
                    <li>Keep GHL forwarding active</li>
                    <li>Set telephony.mode = DRY_RUN</li>
                    <li>GHL handles calls, we just log</li>
                  </ol>
                  <Button className="w-full mt-2" variant="destructive">
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Initiate Rollback
                  </Button>
                </CardContent>
              </Card>
            </div>

            <div className="bg-red-50 border border-red-200 p-4 rounded-lg">
              <h5 className="font-medium text-red-800 mb-2">One-Click Rollback Instructions</h5>
              <ol className="list-decimal pl-4 text-sm text-red-700 space-y-1">
                <li>In GHL, ensure forwarding remains active to Twilio</li>
                <li>Run this SQL to disable our routing:
                  <code className="block bg-white px-2 py-1 rounded mt-1 text-xs">
                    UPDATE config_settings SET value = '"DRY_RUN"' WHERE category = 'telephony' AND key = 'mode';
                  </code>
                </li>
                <li>GHL agents can answer normally while we diagnose</li>
                <li>Mark migration status as ROLLED_BACK</li>
              </ol>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Migration Wizard</CardTitle>
        <CardDescription>Step-by-step guide for migrating from GHL to Twilio</CardDescription>
      </CardHeader>
      <CardContent>
        {/* Step indicator */}
        <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2">
          {WIZARD_STEPS.map((step, index) => (
            <button
              key={step.id}
              onClick={() => setCurrentStep(index)}
              className={`flex flex-col items-center min-w-[80px] ${
                index === currentStep ? 'text-primary' : index < currentStep ? 'text-green-600' : 'text-muted-foreground'
              }`}
            >
              <div className={`w-8 h-8 rounded-full flex items-center justify-center mb-1 ${
                index === currentStep ? 'bg-primary text-primary-foreground' : 
                index < currentStep ? 'bg-green-100 text-green-600' : 'bg-muted'
              }`}>
                {index < currentStep ? <CheckCircle2 className="w-4 h-4" /> : <span className="text-sm">{index + 1}</span>}
              </div>
              <span className="text-xs text-center">{step.title}</span>
            </button>
          ))}
        </div>

        {/* Current step content */}
        <div className="min-h-[300px]">
          {renderStepContent()}
        </div>

        {/* Navigation */}
        <div className="flex justify-between mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCurrentStep(Math.max(0, currentStep - 1))}
            disabled={currentStep === 0}
          >
            Previous
          </Button>
          <Button
            onClick={() => setCurrentStep(Math.min(WIZARD_STEPS.length - 1, currentStep + 1))}
            disabled={currentStep === WIZARD_STEPS.length - 1}
          >
            Next Step
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

function WebhookUrlRow({ label, url, method, onCopy }: { label: string; url: string; method: string; onCopy: (url: string) => void }) {
  return (
    <div className="flex items-center justify-between bg-muted/50 p-3 rounded-lg">
      <div className="flex-1">
        <p className="font-medium text-sm">{label}</p>
        <div className="flex items-center gap-2 mt-1">
          <Badge variant="outline" className="text-xs">{method}</Badge>
          <code className="text-xs text-muted-foreground break-all">{url}</code>
        </div>
      </div>
      <Button variant="ghost" size="sm" onClick={() => onCopy(url)}>
        <Copy className="w-4 h-4" />
      </Button>
    </div>
  );
}

function ValidationCheckItem({ id, label, checked, onCheckedChange }: { 
  id: string; 
  label: string; 
  checked: boolean; 
  onCheckedChange: (checked: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-3 p-3 border rounded-lg">
      <Checkbox
        id={id}
        checked={checked}
        onCheckedChange={onCheckedChange}
      />
      <Label htmlFor={id} className="text-sm cursor-pointer flex-1">{label}</Label>
      {checked ? (
        <Badge className="bg-green-100 text-green-800">Pass</Badge>
      ) : (
        <Badge variant="outline">Pending</Badge>
      )}
    </div>
  );
}
