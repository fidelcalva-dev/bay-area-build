import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Globe, CheckCircle2 } from 'lucide-react';

const CONFIG_ITEMS = [
  { label: 'Public sizes shown', value: '5, 8, 10, 20, 30, 40, 50 yd', status: true },
  { label: 'Heavy sizes shown', value: '5, 8, 10 yd', status: true },
  { label: 'Waste types publicly visible', value: 'General Debris + Heavy Materials', status: true },
  { label: 'Heavy groups shown', value: 'Clean No. 1, Clean No. 2, All Mixed', status: true },
  { label: 'Rental term options', value: '3, 7, 10, 14 days', status: true },
  { label: 'Add another dumpster enabled', value: 'Yes', status: true },
  { label: 'Extra days shown publicly', value: 'Yes — $15/day', status: true },
  { label: 'Customer-required dump site shown', value: 'Yes — with approval warning', status: true },
  { label: 'Notes/help behavior', value: 'Visible with helper copy', status: true },
  { label: 'Public pricing visibility', value: '"From $X" with quote CTA', status: true },
];

export default function PublicQuoteDisplayPanel() {
  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Globe className="w-5 h-5 text-primary" />
          Public Quote Display Config
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Controls what the website quote flow shows to customers.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Public Visibility Settings</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {CONFIG_ITEMS.map((item, i) => (
              <div key={i} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span className="text-sm">{item.label}</span>
                </div>
                <Badge variant="outline" className="text-xs shrink-0">{item.value}</Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <Card className="border-blue-200 dark:border-blue-800">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-foreground">Future Enhancement</p>
          <p className="text-xs text-muted-foreground mt-1">
            Move these settings to DB-backed config for admin-editable control without code deploys.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
