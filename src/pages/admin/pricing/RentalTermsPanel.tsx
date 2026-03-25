import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Calendar } from 'lucide-react';

export default function RentalTermsPanel() {
  const { data: periods = [], isLoading } = useQuery({
    queryKey: ['rental-periods'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('rental_periods')
        .select('*')
        .order('display_order');
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
          <Calendar className="w-5 h-5 text-primary" />
          Rental Days / Terms
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Standard rental periods and extra day fees. Standard = 7 days, extra day = $15/day.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{periods.length} Rental Options</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Days</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Extra Cost</TableHead>
                <TableHead>Default</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-semibold">{p.days} days</TableCell>
                  <TableCell>{p.label}</TableCell>
                  <TableCell className="font-mono">
                    {Number(p.extra_cost) > 0 ? `+$${Number(p.extra_cost).toFixed(2)}` : 'Included'}
                  </TableCell>
                  <TableCell>
                    {p.is_default && <Badge className="text-[10px] bg-emerald-100 text-emerald-800">Default</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.is_active ? 'default' : 'outline'} className="text-[10px]">
                      {p.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  );
}
