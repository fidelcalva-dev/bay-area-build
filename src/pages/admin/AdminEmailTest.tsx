import { useState } from "react";
import { Mail, Send, Loader2, CheckCircle2, AlertTriangle, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

interface TestResult {
  success: boolean;
  status: string;
  messageId?: string;
  logId?: string;
  error?: string;
  config: {
    mode: string;
    domainVerified: boolean;
    from: string;
  };
}

export default function AdminEmailTest() {
  const [toEmail, setToEmail] = useState("hi@calsandumpsterspro.com");
  const [subject, setSubject] = useState("Test Email from Calsan CRM");
  const [body, setBody] = useState("This is a test email to verify the Resend email pipeline is working correctly.");
  const [sending, setSending] = useState(false);
  const [result, setResult] = useState<TestResult | null>(null);
  const { toast } = useToast();

  async function handleSend() {
    setSending(true);
    setResult(null);
    try {
      const { data, error } = await supabase.functions.invoke("send-test-email", {
        body: { to_email: toEmail, subject, body },
      });

      if (error) throw error;
      setResult(data);
      toast({
        title: data.status === "SENT" ? "Email sent!" : data.status === "DRY_RUN" ? "Logged (DRY_RUN)" : "Failed",
        description: data.error || `Status: ${data.status}`,
        variant: data.status === "FAILED" ? "destructive" : "default",
      });
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : "Unknown error";
      toast({ title: "Error", description: msg, variant: "destructive" });
      setResult({ success: false, status: "ERROR", error: msg, config: { mode: "unknown", domainVerified: false, from: "unknown" } });
    }
    setSending(false);
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold flex items-center gap-2">
          <Mail className="w-6 h-6" /> Email Test
        </h1>
        <p className="text-muted-foreground">Send a test email to verify Resend pipeline is working.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Send Test Email</CardTitle>
            <CardDescription>Rate limited to 3 per hour. Respects email.mode config.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label>To Email</Label>
              <Input value={toEmail} onChange={(e) => setToEmail(e.target.value)} placeholder="recipient@example.com" />
            </div>
            <div>
              <Label>Subject</Label>
              <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
            </div>
            <div>
              <Label>Body</Label>
              <Textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} />
            </div>
            <Button onClick={handleSend} disabled={sending || !toEmail}>
              {sending ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Send className="w-4 h-4 mr-2" />}
              Send Test
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Result</CardTitle>
          </CardHeader>
          <CardContent>
            {!result ? (
              <p className="text-muted-foreground text-sm">Send a test email to see results here.</p>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  {result.status === "SENT" && <CheckCircle2 className="w-5 h-5 text-green-600" />}
                  {result.status === "DRY_RUN" && <AlertTriangle className="w-5 h-5 text-yellow-600" />}
                  {(result.status === "FAILED" || result.status === "ERROR") && <XCircle className="w-5 h-5 text-red-600" />}
                  <Badge variant={result.status === "SENT" ? "default" : result.status === "DRY_RUN" ? "secondary" : "destructive"}>
                    {result.status}
                  </Badge>
                </div>

                {result.error && (
                  <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-3 text-sm text-destructive">
                    {result.error}
                  </div>
                )}

                {result.messageId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Resend ID:</span>{" "}
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{result.messageId}</code>
                  </div>
                )}

                {result.logId && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Log ID:</span>{" "}
                    <code className="text-xs bg-muted px-1.5 py-0.5 rounded">{result.logId}</code>
                  </div>
                )}

                {result.config && (
                  <div className="bg-muted/50 rounded-lg p-3 space-y-1 text-sm">
                    <p><span className="text-muted-foreground">Mode:</span> <strong>{result.config.mode}</strong></p>
                    <p><span className="text-muted-foreground">Domain Verified:</span> <strong>{String(result.config.domainVerified)}</strong></p>
                    <p><span className="text-muted-foreground">From:</span> {result.config.from}</p>
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
