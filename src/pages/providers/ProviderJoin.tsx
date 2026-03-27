import { useState } from 'react';
import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Building2, CheckCircle2 } from 'lucide-react';

export default function ProviderJoin() {
  const [submitted, setSubmitted] = useState(false);

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background p-4">
        <Card className="max-w-md w-full text-center">
          <CardContent className="pt-6 space-y-4">
            <CheckCircle2 className="w-12 h-12 text-primary mx-auto" />
            <h2 className="text-xl font-bold text-foreground">Application Received</h2>
            <p className="text-muted-foreground">We'll review your application and contact you within 2 business days.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Helmet>
        <title>Join as a Provider | Calsan Platform</title>
        <meta name="description" content="Register your company as a service provider on the Calsan marketplace. Receive leads, grow your business." />
      </Helmet>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-2xl mx-auto space-y-8">
          <div className="text-center">
            <Building2 className="w-10 h-10 text-primary mx-auto mb-4" />
            <h1 className="text-3xl font-bold text-foreground">Become a Provider</h1>
            <p className="text-muted-foreground mt-2">Join our marketplace and receive qualified cleanup & waste removal leads.</p>
          </div>
          <Card>
            <CardHeader><CardTitle>Company Registration</CardTitle></CardHeader>
            <CardContent>
              <form onSubmit={e => { e.preventDefault(); setSubmitted(true); }} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><Label>Legal Company Name *</Label><Input required placeholder="Acme Cleanup LLC" /></div>
                  <div><Label>DBA / Public Name</Label><Input placeholder="Acme Cleanup" /></div>
                  <div><Label>Owner Name *</Label><Input required /></div>
                  <div><Label>Email *</Label><Input type="email" required /></div>
                  <div><Label>Phone *</Label><Input type="tel" required /></div>
                  <div><Label>License Number</Label><Input /></div>
                </div>
                <div><Label>Service Categories</Label><Input placeholder="e.g. Construction Cleanup, Material Pickup" /></div>
                <div><Label>Counties / ZIP Codes Served</Label><Input placeholder="e.g. Alameda, Contra Costa, 94501" /></div>
                <div><Label>Notes</Label><Textarea placeholder="Tell us about your company..." /></div>
                <Button type="submit" className="w-full">Submit Application</Button>
              </form>
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}
