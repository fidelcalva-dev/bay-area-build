import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, MapPin } from 'lucide-react';

export default function CustomerDumpSitePanel() {
  const { data: rules = [], isLoading } = useQuery({
    queryKey: ['customer-dump-rules'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('customer_required_dump_rules')
        .select('*')
        .order('created_at');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <MapPin className="w-5 h-5 text-primary" />
          Customer Required Dump Site Rules
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Pricing adjustments when a customer requires a specific disposal facility.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{rules.length} Dump Site Rules</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Facility</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Pricing Mode</TableHead>
                <TableHead>Flat Premium</TableHead>
                <TableHead>Admin Fee</TableHead>
                <TableHead>Approval</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rules.map(r => (
                <TableRow key={r.id}>
                  <TableCell className="font-mono text-xs">{r.dump_requirement_code}</TableCell>
                  <TableCell className="font-medium">{r.facility_name || '—'}</TableCell>
                  <TableCell className="text-xs">{r.facility_type}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px]">{r.pricing_mode}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">
                    {Number(r.flat_premium) > 0 ? `+$${Number(r.flat_premium).toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell className="font-mono">
                    {Number(r.admin_fee) > 0 ? `$${Number(r.admin_fee).toFixed(2)}` : '—'}
                  </TableCell>
                  <TableCell>
                    {r.requires_approval && <Badge variant="destructive" className="text-[10px]">Required</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={r.active ? 'default' : 'outline'} className="text-[10px]">
                      {r.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card className="border-amber-200 dark:border-amber-800">
        <CardContent className="pt-4">
          <p className="text-sm font-medium text-foreground">Quote / Calculator Support</p>
          <p className="text-xs text-muted-foreground mt-1">
            When a customer selects "I need a specific dump site", these rules control the pricing adjustment.
            Fields saved: customer_required_dump_flag, requested_dump_site_name, required_dump_adjustment, disposal_rule_notes.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
