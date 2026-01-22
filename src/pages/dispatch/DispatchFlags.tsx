import { useState, useEffect } from 'react';
import { format } from 'date-fns';
import { 
  AlertTriangle, Loader2, MapPin, ChevronRight, 
  Package, Trash2, XCircle
} from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { useMobileMode } from '@/hooks/useMobileMode';

interface FlaggedOrder {
  id: string;
  status: string;
  overfill_flagged: boolean | null;
  wrong_material_flagged: boolean | null;
  is_dry_run: boolean | null;
  dry_run_reason: string | null;
  scheduled_delivery_date: string | null;
  scheduled_pickup_date: string | null;
  quotes: {
    customer_name: string | null;
    customer_phone: string | null;
    delivery_address: string | null;
    zip_code: string;
    material_type: string;
    user_selected_size_yards: number | null;
  } | null;
}

const FLAG_TYPES = [
  { key: 'overfill_flagged', label: 'Overfill', icon: Package, color: 'bg-red-100 text-red-800' },
  { key: 'wrong_material_flagged', label: 'Wrong Material', icon: Trash2, color: 'bg-orange-100 text-orange-800' },
  { key: 'is_dry_run', label: 'Dry Run', icon: XCircle, color: 'bg-yellow-100 text-yellow-800' },
];

export default function DispatchFlags() {
  const { toast } = useToast();
  const { mobileMode } = useMobileMode();
  const [isLoading, setIsLoading] = useState(true);
  const [orders, setOrders] = useState<FlaggedOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<FlaggedOrder | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [resolutionNotes, setResolutionNotes] = useState('');

  useEffect(() => {
    fetchFlaggedOrders();
  }, []);

  async function fetchFlaggedOrders() {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('orders')
        .select(`
          id, status, overfill_flagged, wrong_material_flagged,
          is_dry_run, dry_run_reason,
          scheduled_delivery_date, scheduled_pickup_date,
          quotes (
            customer_name, customer_phone, delivery_address, zip_code,
            material_type, user_selected_size_yards
          )
        `)
        .or('overfill_flagged.eq.true,wrong_material_flagged.eq.true,is_dry_run.eq.true')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setOrders((data || []) as FlaggedOrder[]);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error loading flagged orders', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  const getFlags = (order: FlaggedOrder) => {
    const flags = [];
    if (order.overfill_flagged) flags.push(FLAG_TYPES[0]);
    if (order.wrong_material_flagged) flags.push(FLAG_TYPES[1]);
    if (order.is_dry_run) flags.push(FLAG_TYPES[2]);
    return flags;
  };

  const openResolveDialog = (order: FlaggedOrder) => {
    setSelectedOrder(order);
    setResolutionNotes('');
    setDialogOpen(true);
  };

  async function handleResolve(flagKey: string) {
    if (!selectedOrder) return;

    try {
      const update: Record<string, unknown> = { [flagKey]: false };
      if (resolutionNotes) {
        update.internal_notes = resolutionNotes;
      }

      const { error } = await supabase
        .from('orders')
        .update(update)
        .eq('id', selectedOrder.id);

      if (error) throw error;

      toast({ title: 'Flag resolved' });
      setDialogOpen(false);
      fetchFlaggedOrders();
    } catch (err) {
      console.error(err);
      toast({ title: 'Error resolving flag', variant: 'destructive' });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-muted-foreground" />
      </div>
    );
  }

  return (
    <div className={mobileMode ? 'pb-20' : 'p-6'}>
      <div className={mobileMode ? 'p-4' : 'mb-6'}>
        <div className="flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-destructive" />
          <h1 className={mobileMode ? 'text-xl font-bold' : 'text-2xl font-bold'}>
            Exception Flags
          </h1>
        </div>
        <p className="text-muted-foreground text-sm">
          {orders.length} orders with flags
        </p>
      </div>

      {orders.length === 0 ? (
        <div className={`text-center py-12 ${mobileMode ? 'px-4' : ''}`}>
          <div className="w-16 h-16 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-green-600" />
          </div>
          <p className="text-lg font-medium text-foreground">No Flags</p>
          <p className="text-muted-foreground">All orders are clear</p>
        </div>
      ) : (
        <div className={`space-y-3 ${mobileMode ? 'px-4' : ''}`}>
          {orders.map(order => {
            const flags = getFlags(order);
            
            return (
              <Card 
                key={order.id}
                className="cursor-pointer hover:shadow-md transition-shadow border-l-4 border-l-destructive"
                onClick={() => openResolveDialog(order)}
              >
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex flex-wrap gap-1 mb-2">
                        {flags.map(flag => {
                          const Icon = flag.icon;
                          return (
                            <Badge key={flag.key} className={flag.color}>
                              <Icon className="w-3 h-3 mr-1" />
                              {flag.label}
                            </Badge>
                          );
                        })}
                      </div>
                      <p className="font-medium truncate">
                        {order.quotes?.customer_name || 'Customer'}
                      </p>
                      <p className="text-sm text-muted-foreground flex items-center gap-1">
                        <MapPin className="w-3 h-3" />
                        {order.quotes?.zip_code}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {order.quotes?.user_selected_size_yards}yd • {order.quotes?.material_type}
                      </p>
                      {order.is_dry_run && order.dry_run_reason && (
                        <p className="text-xs text-destructive mt-1">
                          Reason: {order.dry_run_reason}
                        </p>
                      )}
                    </div>
                    <ChevronRight className="w-5 h-5 text-muted-foreground flex-shrink-0" />
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}

      {/* Resolve Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Resolve Flag</DialogTitle>
          </DialogHeader>
          {selectedOrder && (
            <div className="space-y-4 py-4">
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="font-medium">{selectedOrder.quotes?.customer_name || 'Customer'}</p>
                <p className="text-sm text-muted-foreground">
                  {selectedOrder.quotes?.delivery_address || selectedOrder.quotes?.zip_code}
                </p>
                <div className="flex flex-wrap gap-1 mt-2">
                  {getFlags(selectedOrder).map(flag => {
                    const Icon = flag.icon;
                    return (
                      <Badge key={flag.key} className={flag.color}>
                        <Icon className="w-3 h-3 mr-1" />
                        {flag.label}
                      </Badge>
                    );
                  })}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Resolution Notes (optional)</Label>
                <Textarea
                  value={resolutionNotes}
                  onChange={(e) => setResolutionNotes(e.target.value)}
                  placeholder="Describe how the flag was resolved..."
                  rows={3}
                />
              </div>

              <div className="space-y-2">
                <Label>Resolve which flag?</Label>
                <div className="space-y-2">
                  {getFlags(selectedOrder).map(flag => (
                    <Button
                      key={flag.key}
                      variant="outline"
                      className="w-full justify-start"
                      onClick={() => handleResolve(flag.key)}
                    >
                      Clear "{flag.label}" flag
                    </Button>
                  ))}
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setDialogOpen(false)}>Cancel</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
