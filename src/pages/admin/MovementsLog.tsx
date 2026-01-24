import { useEffect, useState } from 'react';
import { History, Loader2, RefreshCw, Search, Package, ArrowRight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Link } from 'react-router-dom';

interface Movement {
  id: string;
  asset_id: string | null;
  order_id: string | null;
  movement_type: string;
  quantity: number;
  from_location_type: string | null;
  from_yard_id: string | null;
  to_location_type: string | null;
  to_yard_id: string | null;
  notes: string | null;
  created_at: string;
  assets_dumpsters?: { asset_code: string } | null;
  from_yard?: { name: string } | null;
  to_yard?: { name: string } | null;
}

const MOVEMENT_TYPE_CONFIG: Record<string, { label: string; color: string }> = {
  MOVE_OUT: { label: 'Deployed', color: 'bg-blue-100 text-blue-800' },
  MOVE_IN: { label: 'Returned', color: 'bg-green-100 text-green-800' },
  TRANSFER: { label: 'Transfer', color: 'bg-purple-100 text-purple-800' },
  MAINTENANCE_IN: { label: 'To Maint.', color: 'bg-orange-100 text-orange-800' },
  MAINTENANCE_OUT: { label: 'From Maint.', color: 'bg-emerald-100 text-emerald-800' },
  RELEASE: { label: 'Released', color: 'bg-gray-100 text-gray-800' },
  reserve: { label: 'Reserved', color: 'bg-yellow-100 text-yellow-800' },
  release: { label: 'Released', color: 'bg-gray-100 text-gray-800' },
  deploy: { label: 'Deployed', color: 'bg-blue-100 text-blue-800' },
  return: { label: 'Returned', color: 'bg-green-100 text-green-800' },
};

export default function MovementsLog() {
  const [movements, setMovements] = useState<Movement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const { toast } = useToast();

  useEffect(() => {
    fetchMovements();
  }, []);

  async function fetchMovements() {
    setIsLoading(true);
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(200);

    if (error) {
      toast({ title: 'Error loading movements', variant: 'destructive' });
    } else {
      // Map data to include placeholder values for display
      const mappedData = (data || []).map(m => ({
        ...m,
        assets_dumpsters: { asset_code: m.inventory_id || 'N/A' },
        from_yard: { name: m.from_yard_id || 'N/A' },
        to_yard: { name: m.to_yard_id || 'N/A' },
      }));
      setMovements(mappedData as unknown as Movement[]);
    }
    setIsLoading(false);
  }

  const filteredMovements = movements.filter((m) => {
    if (!searchQuery) return true;
    const query = searchQuery.toLowerCase();
    return (
      m.assets_dumpsters?.asset_code?.toLowerCase().includes(query) ||
      m.order_id?.toLowerCase().includes(query) ||
      m.movement_type.toLowerCase().includes(query)
    );
  });

  const getTypeBadge = (type: string) => {
    const config = MOVEMENT_TYPE_CONFIG[type] || { label: type, color: 'bg-gray-100 text-gray-800' };
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-8">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground flex items-center gap-3">
            <History className="w-8 h-8" />
            Movement Log
          </h1>
          <p className="text-muted-foreground mt-1">
            Complete audit trail of all asset movements
          </p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchMovements}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link to="/admin/assets">
            <Button variant="outline">
              <Package className="w-4 h-4 mr-2" />
              Control Tower
            </Button>
          </Link>
        </div>
      </div>

      {/* Search */}
      <div className="flex gap-4 mb-6">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by asset code or order ID..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
      </div>

      {/* Movements Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Timestamp</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>From</TableHead>
              <TableHead></TableHead>
              <TableHead>To</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Notes</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredMovements.map((m) => (
              <TableRow key={m.id}>
                <TableCell className="text-sm">
                  <div>
                    <p className="font-medium">
                      {new Date(m.created_at).toLocaleDateString()}
                    </p>
                    <p className="text-muted-foreground text-xs">
                      {new Date(m.created_at).toLocaleTimeString()}
                    </p>
                  </div>
                </TableCell>
                <TableCell>
                  {m.assets_dumpsters?.asset_code ? (
                    <Link 
                      to={`/admin/assets?search=${m.assets_dumpsters.asset_code}`}
                      className="font-mono text-primary hover:underline"
                    >
                      {m.assets_dumpsters.asset_code}
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{getTypeBadge(m.movement_type)}</TableCell>
                <TableCell>
                  <div className="text-sm">
                    {m.from_location_type && (
                      <Badge variant="outline" className="text-xs">
                        {m.from_location_type}
                      </Badge>
                    )}
                    {m.from_yard?.name && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {m.from_yard.name}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <ArrowRight className="w-4 h-4 text-muted-foreground" />
                </TableCell>
                <TableCell>
                  <div className="text-sm">
                    {m.to_location_type && (
                      <Badge variant="outline" className="text-xs">
                        {m.to_location_type}
                      </Badge>
                    )}
                    {m.to_yard?.name && (
                      <p className="text-muted-foreground text-xs mt-1">
                        {m.to_yard.name}
                      </p>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  {m.order_id ? (
                    <Link 
                      to={`/admin/orders?orderId=${m.order_id}`}
                      className="text-primary hover:underline text-sm"
                    >
                      View
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell className="text-sm text-muted-foreground max-w-[200px] truncate">
                  {m.notes || '-'}
                </TableCell>
              </TableRow>
            ))}
            {filteredMovements.length === 0 && (
              <TableRow>
                <TableCell colSpan={8} className="text-center py-8 text-muted-foreground">
                  <History className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No movements recorded yet.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
