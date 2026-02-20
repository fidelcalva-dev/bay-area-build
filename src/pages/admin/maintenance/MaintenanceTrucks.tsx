/**
 * Maintenance Trucks List
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Loader2, Truck, Search, Eye } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { getAllTrucks, type Truck as TruckType } from '@/lib/fleetService';

const STATUS_COLORS: Record<string, string> = {
  AVAILABLE: 'bg-green-100 text-green-800',
  IN_SERVICE: 'bg-blue-100 text-blue-800',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800',
  MAINTENANCE: 'bg-amber-100 text-amber-800',
};

export default function MaintenanceTrucks() {
  const navigate = useNavigate();
  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');

  useEffect(() => {
    (async () => {
      const data = await getAllTrucks();
      setTrucks(data);
      setIsLoading(false);
    })();
  }, []);

  const filtered = trucks.filter(t => {
    const q = search.toLowerCase();
    return t.truck_number.toLowerCase().includes(q) || (t.license_plate || '').toLowerCase().includes(q) || (t.make || '').toLowerCase().includes(q);
  });

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input placeholder="Search trucks..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10" />
      </div>

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-muted/50 text-left">
            <tr>
              <th className="p-3 font-medium">Truck</th>
              <th className="p-3 font-medium">Type</th>
              <th className="p-3 font-medium">Year/Make/Model</th>
              <th className="p-3 font-medium">Plate</th>
              <th className="p-3 font-medium">Status</th>
              <th className="p-3 font-medium">DOT</th>
              <th className="p-3 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-t hover:bg-muted/30">
                <td className="p-3 font-bold">#{t.truck_number}</td>
                <td className="p-3">{t.truck_type || '—'}</td>
                <td className="p-3">{[t.year, t.make, t.model].filter(Boolean).join(' ') || '—'}</td>
                <td className="p-3 font-mono text-xs">{t.license_plate || t.plate_number || '—'}</td>
                <td className="p-3">
                  <Badge className={cn('text-xs', STATUS_COLORS[t.truck_status || ''] || 'bg-gray-100')}>
                    {(t.truck_status || 'UNKNOWN').replace(/_/g, ' ')}
                  </Badge>
                </td>
                <td className="p-3">
                  <Badge variant={t.dot_compliance_status === 'OK' ? 'default' : 'destructive'} className="text-xs">
                    {t.dot_compliance_status || 'OK'}
                  </Badge>
                </td>
                <td className="p-3">
                  <Button variant="ghost" size="sm" onClick={() => navigate(`/admin/trucks/${t.id}`)}>
                    <Eye className="w-4 h-4 mr-1" /> View
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
