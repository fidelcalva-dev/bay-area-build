import { useEffect, useState, useMemo } from 'react';
import { 
  Box, Loader2, RefreshCw, Warehouse, MapPin, Clock, 
  AlertTriangle, Wrench, Eye, History, Search, Filter, 
  Package, Truck, MoreHorizontal, CheckCircle2
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Link } from 'react-router-dom';

interface Asset {
  id: string;
  asset_code: string;
  asset_type: string;
  size_id: string;
  home_yard_id: string;
  current_location_type: string;
  current_yard_id: string | null;
  current_order_id: string | null;
  asset_status: string;
  deployed_at: string | null;
  last_movement_at: string | null;
  days_out: number;
  total_deployments: number;
  revenue_30d: number;
  condition: string;
  needs_rebalance: boolean;
  dumpster_sizes?: { label: string; size_value: number } | null;
  home_yard?: { name: string } | null;
  current_yard?: { name: string } | null;
  orders?: { id: string; status: string } | null;
}

interface Yard {
  id: string;
  name: string;
  slug: string;
}

interface Movement {
  id: string;
  movement_type: string;
  from_location_type: string | null;
  from_yard_id: string | null;
  to_location_type: string | null;
  to_yard_id: string | null;
  order_id: string | null;
  notes: string | null;
  created_at: string;
}

const STATUS_CONFIG: Record<string, { label: string; color: string; icon: typeof Box }> = {
  available: { label: 'Available', color: 'bg-green-100 text-green-800', icon: CheckCircle2 },
  reserved: { label: 'Reserved', color: 'bg-yellow-100 text-yellow-800', icon: Clock },
  deployed: { label: 'Deployed', color: 'bg-blue-100 text-blue-800', icon: Truck },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800', icon: Wrench },
  retired: { label: 'Retired', color: 'bg-gray-100 text-gray-800', icon: Box },
};

const LOCATION_CONFIG: Record<string, { label: string; color: string }> = {
  yard: { label: 'At Yard', color: 'bg-emerald-100 text-emerald-800' },
  field: { label: 'In Field', color: 'bg-sky-100 text-sky-800' },
  truck: { label: 'On Truck', color: 'bg-purple-100 text-purple-800' },
  maintenance: { label: 'Maintenance', color: 'bg-orange-100 text-orange-800' },
  unknown: { label: 'Unknown', color: 'bg-gray-100 text-gray-800' },
};

const OVERDUE_THRESHOLD = 7; // days

export default function AssetsControlTower() {
  const [assets, setAssets] = useState<Asset[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterYard, setFilterYard] = useState<string>('all');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [filterOverdue, setFilterOverdue] = useState<boolean>(false);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);
  const [movements, setMovements] = useState<Movement[]>([]);
  const [movementDialogOpen, setMovementDialogOpen] = useState(false);
  const [setYardDialogOpen, setSetYardDialogOpen] = useState(false);
  const [targetYardId, setTargetYardId] = useState<string>('');
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [assetsRes, yardsRes] = await Promise.all([
      supabase.from('assets_dumpsters').select(`
        *,
        dumpster_sizes (label, size_value),
        home_yard:yards!assets_dumpsters_home_yard_id_fkey (name),
        current_yard:yards!assets_dumpsters_current_yard_id_fkey (name),
        orders (id, status)
      `).neq('asset_status', 'retired').order('asset_code'),
      supabase.from('yards').select('*').eq('is_active', true).order('priority_rank'),
    ]);

    if (assetsRes.error) {
      toast({ title: 'Error loading assets', description: assetsRes.error.message, variant: 'destructive' });
    } else {
      setAssets(assetsRes.data as Asset[]);
    }
    setYards(yardsRes.data || []);
    setIsLoading(false);
  }

  async function fetchMovements(assetId: string) {
    const { data, error } = await supabase
      .from('inventory_movements')
      .select('*')
      .eq('asset_id', assetId)
      .order('created_at', { ascending: false })
      .limit(50);

    if (error) {
      toast({ title: 'Error loading movements', variant: 'destructive' });
    } else {
      setMovements(data || []);
    }
  }

  async function handleSetMaintenance(asset: Asset) {
    const newStatus = asset.asset_status === 'maintenance' ? 'available' : 'maintenance';
    const { error } = await supabase
      .from('assets_dumpsters')
      .update({
        asset_status: newStatus,
        current_location_type: newStatus === 'maintenance' ? 'maintenance' : 'yard',
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', asset.id);

    if (error) {
      toast({ title: 'Error updating asset', variant: 'destructive' });
    } else {
      toast({ title: `Asset ${newStatus === 'maintenance' ? 'sent to' : 'returned from'} maintenance` });

      // Log movement
      await supabase.from('inventory_movements').insert({
        asset_id: asset.id,
        movement_type: newStatus === 'maintenance' ? 'MAINTENANCE_IN' : 'MAINTENANCE_OUT',
        from_location_type: asset.current_location_type,
        from_yard_id: asset.current_yard_id,
        to_location_type: newStatus === 'maintenance' ? 'maintenance' : 'yard',
        to_yard_id: newStatus === 'available' ? asset.home_yard_id : null,
        notes: `Manual ${newStatus === 'maintenance' ? 'maintenance entry' : 'maintenance exit'}`,
      });

      fetchData();
    }
  }

  async function handleSetYard() {
    if (!selectedAsset || !targetYardId) return;

    const { error } = await supabase
      .from('assets_dumpsters')
      .update({
        current_yard_id: targetYardId,
        current_location_type: 'yard',
        last_movement_at: new Date().toISOString(),
        needs_rebalance: false,
      })
      .eq('id', selectedAsset.id);

    if (error) {
      toast({ title: 'Error moving asset', variant: 'destructive' });
    } else {
      toast({ title: 'Asset moved to new yard' });

      // Log transfer
      await supabase.from('inventory_movements').insert({
        asset_id: selectedAsset.id,
        movement_type: 'TRANSFER',
        from_location_type: selectedAsset.current_location_type,
        from_yard_id: selectedAsset.current_yard_id,
        to_location_type: 'yard',
        to_yard_id: targetYardId,
        notes: 'Manual yard transfer',
      });

      setSetYardDialogOpen(false);
      setSelectedAsset(null);
      setTargetYardId('');
      fetchData();
    }
  }

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      if (searchQuery && !asset.asset_code.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      if (filterYard !== 'all' && asset.current_yard_id !== filterYard && asset.home_yard_id !== filterYard) {
        return false;
      }
      if (filterStatus !== 'all' && asset.asset_status !== filterStatus) {
        return false;
      }
      if (filterOverdue && asset.days_out < OVERDUE_THRESHOLD) {
        return false;
      }
      return true;
    });
  }, [assets, searchQuery, filterYard, filterStatus, filterOverdue]);

  const stats = useMemo(() => ({
    total: assets.length,
    available: assets.filter((a) => a.asset_status === 'available').length,
    deployed: assets.filter((a) => a.asset_status === 'deployed').length,
    reserved: assets.filter((a) => a.asset_status === 'reserved').length,
    maintenance: assets.filter((a) => a.asset_status === 'maintenance').length,
    overdue: assets.filter((a) => a.days_out >= OVERDUE_THRESHOLD).length,
  }), [assets]);

  const getStatusBadge = (status: string) => {
    const config = STATUS_CONFIG[status] || STATUS_CONFIG.available;
    return <Badge className={config.color}>{config.label}</Badge>;
  };

  const getLocationBadge = (locationType: string) => {
    const config = LOCATION_CONFIG[locationType] || LOCATION_CONFIG.unknown;
    return <Badge variant="outline" className={config.color}>{config.label}</Badge>;
  };

  const getDaysOutBadge = (daysOut: number) => {
    if (daysOut >= OVERDUE_THRESHOLD) {
      return (
        <Badge variant="destructive" className="animate-pulse">
          <AlertTriangle className="w-3 h-3 mr-1" />
          {daysOut}d Overdue
        </Badge>
      );
    }
    if (daysOut > 0) {
      return <Badge variant="secondary">{daysOut}d out</Badge>;
    }
    return <span className="text-muted-foreground">-</span>;
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
          <h1 className="text-3xl font-bold text-foreground">Asset Control Tower</h1>
          <p className="text-muted-foreground mt-1">Real-time visibility into all 120 dumpsters</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Link to="/admin/movements">
            <Button variant="outline">
              <History className="w-4 h-4 mr-2" />
              Movement Log
            </Button>
          </Link>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-6 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Fleet</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold">{stats.total}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Available</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-green-600">{stats.available}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Deployed</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.deployed}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Reserved</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.reserved}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Maintenance</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-orange-600">{stats.maintenance}</p>
          </CardContent>
        </Card>
        <Card className={stats.overdue > 0 ? 'border-destructive' : ''}>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground flex items-center gap-1">
              <AlertTriangle className="w-4 h-4" />
              Overdue ({'>'}7d)
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className={`text-2xl font-bold ${stats.overdue > 0 ? 'text-destructive' : ''}`}>
              {stats.overdue}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6 flex-wrap">
        <div className="relative flex-1 min-w-[200px] max-w-[300px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search by asset code..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterYard} onValueChange={setFilterYard}>
          <SelectTrigger className="w-[180px]">
            <Warehouse className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Yards" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Yards</SelectItem>
            {yards.map((yard) => (
              <SelectItem key={yard.id} value={yard.id}>{yard.name}</SelectItem>
            ))}
          </SelectContent>
        </Select>
        <Select value={filterStatus} onValueChange={setFilterStatus}>
          <SelectTrigger className="w-[160px]">
            <Filter className="w-4 h-4 mr-2" />
            <SelectValue placeholder="All Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="available">Available</SelectItem>
            <SelectItem value="reserved">Reserved</SelectItem>
            <SelectItem value="deployed">Deployed</SelectItem>
            <SelectItem value="maintenance">Maintenance</SelectItem>
          </SelectContent>
        </Select>
        <Button
          variant={filterOverdue ? 'default' : 'outline'}
          onClick={() => setFilterOverdue(!filterOverdue)}
        >
          <AlertTriangle className="w-4 h-4 mr-2" />
          Overdue Only
        </Button>
      </div>

      {/* Assets Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset Code</TableHead>
              <TableHead>Size</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Current Yard</TableHead>
              <TableHead>Order</TableHead>
              <TableHead>Days Out</TableHead>
              <TableHead>Last Move</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredAssets.map((asset) => (
              <TableRow 
                key={asset.id} 
                className={asset.days_out >= OVERDUE_THRESHOLD ? 'bg-destructive/5' : ''}
              >
                <TableCell className="font-mono font-medium">
                  <div className="flex items-center gap-2">
                    <Package className="w-4 h-4 text-muted-foreground" />
                    {asset.asset_code}
                    {asset.needs_rebalance && (
                      <Badge variant="outline" className="text-xs bg-amber-50">Rebalance</Badge>
                    )}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{asset.dumpster_sizes?.label}</Badge>
                </TableCell>
                <TableCell>{getStatusBadge(asset.asset_status)}</TableCell>
                <TableCell>{getLocationBadge(asset.current_location_type)}</TableCell>
                <TableCell>
                  {asset.current_yard?.name || asset.home_yard?.name || '-'}
                </TableCell>
                <TableCell>
                  {asset.current_order_id ? (
                    <Link 
                      to={`/admin/orders?orderId=${asset.current_order_id}`}
                      className="text-primary hover:underline"
                    >
                      View Order
                    </Link>
                  ) : (
                    <span className="text-muted-foreground">-</span>
                  )}
                </TableCell>
                <TableCell>{getDaysOutBadge(asset.days_out)}</TableCell>
                <TableCell>
                  {asset.last_movement_at ? (
                    <span className="text-sm text-muted-foreground">
                      {new Date(asset.last_movement_at).toLocaleDateString()}
                    </span>
                  ) : '-'}
                </TableCell>
                <TableCell className="text-right">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAsset(asset);
                          fetchMovements(asset.id);
                          setMovementDialogOpen(true);
                        }}
                      >
                        <History className="w-4 h-4 mr-2" />
                        View History
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => handleSetMaintenance(asset)}
                      >
                        <Wrench className="w-4 h-4 mr-2" />
                        {asset.asset_status === 'maintenance' ? 'Return from Maint.' : 'Mark Maintenance'}
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          setSelectedAsset(asset);
                          setSetYardDialogOpen(true);
                        }}
                        disabled={asset.asset_status === 'deployed'}
                      >
                        <MapPin className="w-4 h-4 mr-2" />
                        Set Yard
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </TableCell>
              </TableRow>
            ))}
            {filteredAssets.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  <Box className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No assets found matching filters.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Movement History Dialog */}
      <Dialog open={movementDialogOpen} onOpenChange={setMovementDialogOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <History className="w-5 h-5" />
              Movement History - {selectedAsset?.asset_code}
            </DialogTitle>
          </DialogHeader>
          <div className="max-h-[400px] overflow-y-auto">
            {movements.length === 0 ? (
              <p className="text-center text-muted-foreground py-8">No movement history</p>
            ) : (
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Date</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>From</TableHead>
                    <TableHead>To</TableHead>
                    <TableHead>Notes</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {movements.map((m) => (
                    <TableRow key={m.id}>
                      <TableCell className="text-sm">
                        {new Date(m.created_at).toLocaleString()}
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline">{m.movement_type}</Badge>
                      </TableCell>
                      <TableCell className="text-sm">
                        {m.from_location_type || '-'}
                      </TableCell>
                      <TableCell className="text-sm">
                        {m.to_location_type || '-'}
                      </TableCell>
                      <TableCell className="text-sm text-muted-foreground">
                        {m.notes || '-'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Set Yard Dialog */}
      <Dialog open={setYardDialogOpen} onOpenChange={setSetYardDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Move Asset to Yard</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <p className="text-sm text-muted-foreground">
              Moving <strong>{selectedAsset?.asset_code}</strong> to a new yard
            </p>
            <Select value={targetYardId} onValueChange={setTargetYardId}>
              <SelectTrigger>
                <SelectValue placeholder="Select destination yard" />
              </SelectTrigger>
              <SelectContent>
                {yards.map((yard) => (
                  <SelectItem 
                    key={yard.id} 
                    value={yard.id}
                    disabled={yard.id === selectedAsset?.current_yard_id}
                  >
                    {yard.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={handleSetYard} className="w-full" disabled={!targetYardId}>
              <MapPin className="w-4 h-4 mr-2" />
              Confirm Transfer
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
