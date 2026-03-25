import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Package } from 'lucide-react';

export default function SizeCatalogPanel() {
  const { data: sizes = [], isLoading } = useQuery({
    queryKey: ['size-catalog'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('dumpster_sizes')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const generalSizes = sizes.filter(s => !s.is_heavy_only);
  const heavySizes = sizes.filter(s => s.is_heavy_only || [5, 8, 10].includes(s.size_value));

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Package className="w-5 h-5 text-primary" />
          Dumpster Size Catalog
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Canonical size inventory — General Debris: 5–50 yd · Heavy Material: 5, 8, 10 yd
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">All Sizes</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Size (yd)</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Base Price</TableHead>
                <TableHead>Included Tons</TableHead>
                <TableHead>Dimensions</TableHead>
                <TableHead>Heavy Only</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {sizes.map(s => (
                <TableRow key={s.id}>
                  <TableCell className="font-semibold">{s.size_value} yd</TableCell>
                  <TableCell>{s.label}</TableCell>
                  <TableCell className="font-mono">${Number(s.base_price).toFixed(2)}</TableCell>
                  <TableCell>{Number(s.included_tons).toFixed(1)}T</TableCell>
                  <TableCell className="text-xs text-muted-foreground">{s.dimensions || '—'}</TableCell>
                  <TableCell>
                    {s.is_heavy_only && <Badge variant="secondary" className="text-[10px]">Heavy Only</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={s.is_active ? 'default' : 'outline'} className="text-[10px]">
                      {s.is_active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-foreground">General Debris Sizes</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {generalSizes.map(s => (
                <Badge key={s.id} variant={s.is_active ? 'default' : 'outline'}>{s.size_value} yd</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="pt-4">
            <p className="text-sm font-medium text-foreground">Heavy Material Sizes</p>
            <div className="flex flex-wrap gap-2 mt-2">
              {heavySizes.filter(s => [5, 8, 10].includes(s.size_value)).map(s => (
                <Badge key={s.id} variant="secondary">{s.size_value} yd</Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
