import { useEffect, useState } from 'react';
import { Boxes, Plus, Minus, AlertTriangle, Loader2, Warehouse, RefreshCw } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
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

interface Yard {
  id: string;
  name: string;
  market: string;
  is_active: boolean;
}

interface DumpsterSize {
  id: string;
  size_value: number;
  label: string;
}

interface InventoryItem {
  id: string;
  yard_id: string;
  size_id: string;
  total_count: number;
  available_count: number;
  reserved_count: number;
  in_use_count: number;
  maintenance_count: number;
  low_stock_threshold: number;
  yards?: { name: string; market: string } | null;
  dumpster_sizes?: { label: string; size_value: number } | null;
}

type MovementType = 'reserve' | 'release' | 'deploy' | 'return' | 'maintenance_in' | 'maintenance_out';

const MOVEMENT_LABELS: Record<MovementType, string> = {
  reserve: 'Reserve for Order',
  release: 'Release Reservation',
  deploy: 'Deploy (Delivered)',
  return: 'Return (Picked Up)',
  maintenance_in: 'Send to Maintenance',
  maintenance_out: 'Return from Maintenance',
};

export default function InventoryManager() {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [yards, setYards] = useState<Yard[]>([]);
  const [sizes, setSizes] = useState<DumpsterSize[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedYard, setSelectedYard] = useState<string>('all');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [adjustDialogOpen, setAdjustDialogOpen] = useState(false);
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [movementType, setMovementType] = useState<MovementType>('reserve');
  const [quantity, setQuantity] = useState(1);
  const [newInventory, setNewInventory] = useState({ yard_id: '', size_id: '', total_count: 0 });
  const { toast } = useToast();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setIsLoading(true);
    const [invRes, yardsRes, sizesRes] = await Promise.all([
      supabase.from('inventory').select(`
        *,
        yards (name, market),
        dumpster_sizes (label, size_value)
      `).order('yard_id'),
      supabase.from('yards').select('*').eq('is_active', true).order('name'),
      supabase.from('dumpster_sizes').select('*').eq('is_active', true).order('size_value'),
    ]);

    if (invRes.error) {
      toast({ title: 'Error loading inventory', variant: 'destructive' });
    } else {
      setInventory(invRes.data as InventoryItem[]);
    }
    setYards(yardsRes.data || []);
    setSizes(sizesRes.data || []);
    setIsLoading(false);
  }

  function getStatusBadge(item: InventoryItem) {
    if (item.available_count <= 0) {
      return <Badge variant="destructive">Out of Stock</Badge>;
    }
    if (item.available_count <= item.low_stock_threshold) {
      return <Badge className="bg-yellow-100 text-yellow-800">Low Stock</Badge>;
    }
    return <Badge className="bg-green-100 text-green-800">In Stock</Badge>;
  }

  async function handleAddInventory() {
    if (!newInventory.yard_id || !newInventory.size_id) {
      toast({ title: 'Select yard and size', variant: 'destructive' });
      return;
    }

    const { error } = await supabase.from('inventory').insert({
      yard_id: newInventory.yard_id,
      size_id: newInventory.size_id,
      total_count: newInventory.total_count,
      available_count: newInventory.total_count,
    });

    if (error) {
      toast({ title: 'Error adding inventory', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: 'Inventory added successfully' });
      setDialogOpen(false);
      setNewInventory({ yard_id: '', size_id: '', total_count: 0 });
      fetchData();
    }
  }

  async function handleAdjustInventory() {
    if (!selectedItem) return;

    // Calculate new counts based on movement type
    const updates: Partial<InventoryItem> = {};
    
    switch (movementType) {
      case 'reserve':
        if (selectedItem.available_count < quantity) {
          toast({ title: 'Not enough available stock', variant: 'destructive' });
          return;
        }
        updates.available_count = selectedItem.available_count - quantity;
        updates.reserved_count = selectedItem.reserved_count + quantity;
        break;
      case 'release':
        if (selectedItem.reserved_count < quantity) {
          toast({ title: 'Not enough reserved stock', variant: 'destructive' });
          return;
        }
        updates.available_count = selectedItem.available_count + quantity;
        updates.reserved_count = selectedItem.reserved_count - quantity;
        break;
      case 'deploy':
        if (selectedItem.reserved_count < quantity) {
          toast({ title: 'Not enough reserved stock', variant: 'destructive' });
          return;
        }
        updates.reserved_count = selectedItem.reserved_count - quantity;
        updates.in_use_count = selectedItem.in_use_count + quantity;
        break;
      case 'return':
        if (selectedItem.in_use_count < quantity) {
          toast({ title: 'Not enough in-use stock', variant: 'destructive' });
          return;
        }
        updates.in_use_count = selectedItem.in_use_count - quantity;
        updates.available_count = selectedItem.available_count + quantity;
        break;
      case 'maintenance_in':
        if (selectedItem.available_count < quantity) {
          toast({ title: 'Not enough available stock', variant: 'destructive' });
          return;
        }
        updates.available_count = selectedItem.available_count - quantity;
        updates.maintenance_count = selectedItem.maintenance_count + quantity;
        break;
      case 'maintenance_out':
        if (selectedItem.maintenance_count < quantity) {
          toast({ title: 'Not enough in maintenance', variant: 'destructive' });
          return;
        }
        updates.maintenance_count = selectedItem.maintenance_count - quantity;
        updates.available_count = selectedItem.available_count + quantity;
        break;
    }

    const { error: updateError } = await supabase
      .from('inventory')
      .update(updates)
      .eq('id', selectedItem.id);

    if (updateError) {
      toast({ title: 'Error adjusting inventory', variant: 'destructive' });
      return;
    }

    // Log movement
    await supabase.from('inventory_movements').insert({
      inventory_id: selectedItem.id,
      movement_type: movementType,
      quantity,
    });

    toast({ title: 'Inventory adjusted successfully' });
    setAdjustDialogOpen(false);
    setSelectedItem(null);
    setQuantity(1);
    fetchData();
  }

  const filteredInventory = selectedYard === 'all' 
    ? inventory 
    : inventory.filter(i => i.yard_id === selectedYard);

  const stats = {
    total: inventory.reduce((sum, i) => sum + i.total_count, 0),
    available: inventory.reduce((sum, i) => sum + i.available_count, 0),
    inUse: inventory.reduce((sum, i) => sum + i.in_use_count, 0),
    lowStock: inventory.filter(i => i.available_count <= i.low_stock_threshold && i.available_count > 0).length,
    outOfStock: inventory.filter(i => i.available_count === 0).length,
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
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Inventory Management</h1>
          <p className="text-muted-foreground mt-1">Track dumpster availability by yard and size</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={fetchData}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Refresh
          </Button>
          <Button onClick={() => setDialogOpen(true)}>
            <Plus className="w-4 h-4 mr-2" />
            Add Inventory
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-5 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Units</CardTitle>
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
            <CardTitle className="text-sm text-muted-foreground">In Use</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-blue-600">{stats.inUse}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Low Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-yellow-600">{stats.lowStock}</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Out of Stock</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-2xl font-bold text-red-600">{stats.outOfStock}</p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <div className="flex gap-4 mb-6">
        <Select value={selectedYard} onValueChange={setSelectedYard}>
          <SelectTrigger className="w-[200px]">
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
      </div>

      {/* Inventory Table */}
      <div className="bg-card rounded-xl border border-border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Yard</TableHead>
              <TableHead>Size</TableHead>
              <TableHead className="text-center">Total</TableHead>
              <TableHead className="text-center">Available</TableHead>
              <TableHead className="text-center">Reserved</TableHead>
              <TableHead className="text-center">In Use</TableHead>
              <TableHead className="text-center">Maintenance</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredInventory.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="font-medium">
                  <div className="flex items-center gap-2">
                    <Warehouse className="w-4 h-4 text-muted-foreground" />
                    {item.yards?.name || 'Unknown'}
                  </div>
                </TableCell>
                <TableCell>
                  <Badge variant="outline">{item.dumpster_sizes?.label || `${item.dumpster_sizes?.size_value}yd`}</Badge>
                </TableCell>
                <TableCell className="text-center">{item.total_count}</TableCell>
                <TableCell className="text-center font-medium text-green-600">{item.available_count}</TableCell>
                <TableCell className="text-center text-yellow-600">{item.reserved_count}</TableCell>
                <TableCell className="text-center text-blue-600">{item.in_use_count}</TableCell>
                <TableCell className="text-center text-gray-500">{item.maintenance_count}</TableCell>
                <TableCell>{getStatusBadge(item)}</TableCell>
                <TableCell className="text-right">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    onClick={() => {
                      setSelectedItem(item);
                      setAdjustDialogOpen(true);
                    }}
                  >
                    Adjust
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {filteredInventory.length === 0 && (
              <TableRow>
                <TableCell colSpan={9} className="text-center py-8 text-muted-foreground">
                  <Boxes className="w-12 h-12 mx-auto mb-2 opacity-50" />
                  No inventory configured. Add inventory to get started.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* Add Inventory Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Add New Inventory</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <Label>Yard</Label>
              <Select value={newInventory.yard_id} onValueChange={(v) => setNewInventory({ ...newInventory, yard_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select yard" />
                </SelectTrigger>
                <SelectContent>
                  {yards.map((yard) => (
                    <SelectItem key={yard.id} value={yard.id}>{yard.name} ({yard.market})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Dumpster Size</Label>
              <Select value={newInventory.size_id} onValueChange={(v) => setNewInventory({ ...newInventory, size_id: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select size" />
                </SelectTrigger>
                <SelectContent>
                  {sizes.map((size) => (
                    <SelectItem key={size.id} value={size.id}>{size.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Initial Count</Label>
              <Input 
                type="number" 
                value={newInventory.total_count} 
                onChange={(e) => setNewInventory({ ...newInventory, total_count: parseInt(e.target.value) || 0 })}
              />
            </div>
            <Button onClick={handleAddInventory} className="w-full">Add Inventory</Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Adjust Inventory Dialog */}
      <Dialog open={adjustDialogOpen} onOpenChange={setAdjustDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Adjust Inventory</DialogTitle>
          </DialogHeader>
          {selectedItem && (
            <div className="space-y-4 mt-4">
              <div className="p-4 bg-muted rounded-lg">
                <p className="font-medium">{selectedItem.yards?.name} - {selectedItem.dumpster_sizes?.label}</p>
                <div className="grid grid-cols-4 gap-2 mt-2 text-sm">
                  <div><span className="text-muted-foreground">Avail:</span> {selectedItem.available_count}</div>
                  <div><span className="text-muted-foreground">Rsv:</span> {selectedItem.reserved_count}</div>
                  <div><span className="text-muted-foreground">Use:</span> {selectedItem.in_use_count}</div>
                  <div><span className="text-muted-foreground">Maint:</span> {selectedItem.maintenance_count}</div>
                </div>
              </div>
              <div className="space-y-2">
                <Label>Movement Type</Label>
                <Select value={movementType} onValueChange={(v) => setMovementType(v as MovementType)}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(MOVEMENT_LABELS).map(([value, label]) => (
                      <SelectItem key={value} value={value}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Quantity</Label>
                <Input 
                  type="number" 
                  min={1}
                  value={quantity} 
                  onChange={(e) => setQuantity(parseInt(e.target.value) || 1)}
                />
              </div>
              <Button onClick={handleAdjustInventory} className="w-full">Apply Adjustment</Button>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
