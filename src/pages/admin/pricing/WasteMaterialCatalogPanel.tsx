import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Layers } from 'lucide-react';

export default function WasteMaterialCatalogPanel() {
  const { data: materials = [], isLoading } = useQuery({
    queryKey: ['material-catalog-full'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('material_catalog')
        .select('*')
        .order('display_order');
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const groups = [...new Set(materials.map(m => m.group_name))];

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <Layers className="w-5 h-5 text-primary" />
          Waste / Material Catalog
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {materials.length} materials across {groups.length} groups — General Debris, Heavy Materials, Special
        </p>
      </div>

      {groups.map(group => {
        const items = materials.filter(m => m.group_name === group);
        return (
          <Card key={group}>
            <CardHeader className="pb-3">
              <CardTitle className="text-base flex items-center gap-2">
                {group}
                <Badge variant="outline" className="text-[10px]">{items.length} items</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Code</TableHead>
                    <TableHead>Name</TableHead>
                    <TableHead>Pricing Model</TableHead>
                    <TableHead>Heavy?</TableHead>
                    <TableHead>Review?</TableHead>
                    <TableHead>Status</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {items.map(m => (
                    <TableRow key={m.id}>
                      <TableCell className="font-mono text-xs">{m.material_code}</TableCell>
                      <TableCell>{m.display_name}</TableCell>
                      <TableCell>
                        <Badge variant="secondary" className="text-[10px]">{m.default_pricing_model}</Badge>
                      </TableCell>
                      <TableCell>
                        {m.is_heavy_material && <Badge className="text-[10px] bg-amber-100 text-amber-800">Heavy</Badge>}
                      </TableCell>
                      <TableCell>
                        {m.requires_contamination_check && <Badge variant="destructive" className="text-[10px]">Review</Badge>}
                      </TableCell>
                      <TableCell>
                        <Badge variant={m.is_active ? 'default' : 'outline'} className="text-[10px]">
                          {m.is_active ? 'Active' : 'Inactive'}
                        </Badge>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
