import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Loader2, Weight } from 'lucide-react';

export default function WasteProfilesPanel() {
  const { data: profiles = [], isLoading } = useQuery({
    queryKey: ['waste-profiles'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('waste_profiles')
        .select('*')
        .order('sort_order');
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
          <Weight className="w-5 h-5 text-primary" />
          Waste Profiles (Weight Behavior)
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Weight-based profiles for general debris — controls included tons, overage, and density estimates.
        </p>
      </div>

      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">{profiles.length} Waste Profiles</CardTitle>
        </CardHeader>
        <CardContent className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Code</TableHead>
                <TableHead>Label</TableHead>
                <TableHead>Density</TableHead>
                <TableHead>Overage Rate</TableHead>
                <TableHead>Manual Review</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {profiles.map(p => (
                <TableRow key={p.id}>
                  <TableCell className="font-mono text-xs">{p.waste_profile_code}</TableCell>
                  <TableCell className="font-medium">{p.label}</TableCell>
                  <TableCell>
                    <Badge variant="secondary" className="text-[10px] capitalize">{p.estimated_density}</Badge>
                  </TableCell>
                  <TableCell className="font-mono">${Number(p.overage_rate).toFixed(2)}/ton</TableCell>
                  <TableCell>
                    {p.requires_manual_review && <Badge variant="destructive" className="text-[10px]">Yes</Badge>}
                  </TableCell>
                  <TableCell>
                    <Badge variant={p.active ? 'default' : 'outline'} className="text-[10px]">
                      {p.active ? 'Active' : 'Inactive'}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {profiles.map(p => (
        <Card key={p.id}>
          <CardContent className="pt-4">
            <div className="flex items-center justify-between mb-2">
              <p className="text-sm font-medium">{p.label}</p>
              <Badge variant="secondary" className="text-[10px]">{p.waste_profile_code}</Badge>
            </div>
            <p className="text-xs text-muted-foreground mb-2">{p.description}</p>
            {p.included_tons_by_size_json && typeof p.included_tons_by_size_json === 'object' && (
              <div className="flex flex-wrap gap-2">
                {Object.entries(p.included_tons_by_size_json as Record<string, number>).map(([size, tons]) => (
                  <Badge key={size} variant="outline" className="text-[10px]">
                    {size}yd → {tons}T
                  </Badge>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      ))}
    </div>
  );
}
