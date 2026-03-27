import { Helmet } from 'react-helmet-async';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { CheckCircle2 } from 'lucide-react';
import { Link } from 'react-router-dom';

const PLANS = [
  { name: 'Starter', price: 299, leads: 25, features: ['Email support', 'Dashboard access', '25 leads/mo'] },
  { name: 'Growth', price: 599, leads: 75, features: ['Phone support', 'API access', 'Exclusive ZIP add-on', '75 leads/mo'], popular: true },
  { name: 'Pro', price: 999, leads: 200, features: ['Dedicated support', 'White-label ready', 'Unlimited API', '200 leads/mo'] },
];

export default function ProviderPricing() {
  return (
    <>
      <Helmet>
        <title>Provider Plans & Pricing | Calsan Platform</title>
        <meta name="description" content="Choose a plan that fits your business. Get qualified cleanup and waste removal leads in the Bay Area." />
      </Helmet>
      <div className="min-h-screen bg-background py-12 px-4">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-12">
            <h1 className="text-3xl font-bold text-foreground">Provider Plans</h1>
            <p className="text-muted-foreground mt-2">Receive qualified leads. Grow your business.</p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {PLANS.map(plan => (
              <Card key={plan.name} className={plan.popular ? 'border-primary ring-2 ring-primary/20' : ''}>
                <CardHeader className="text-center">
                  {plan.popular && <Badge className="w-fit mx-auto mb-2">Most Popular</Badge>}
                  <CardTitle>{plan.name}</CardTitle>
                  <p className="text-3xl font-bold text-primary">${plan.price}<span className="text-sm font-normal text-muted-foreground">/mo</span></p>
                </CardHeader>
                <CardContent className="space-y-4">
                  <ul className="space-y-2">
                    {plan.features.map(f => (
                      <li key={f} className="flex items-center gap-2 text-sm text-foreground">
                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0" />{f}
                      </li>
                    ))}
                  </ul>
                  <Button asChild className="w-full"><Link to="/providers/join">Get Started</Link></Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
