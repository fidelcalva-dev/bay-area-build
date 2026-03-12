/**
 * Dispatch Operations Panel
 * Shows unassigned orders, problem jobs, and provides quick dispatch actions
 * Designed to be added to the Dispatch Dashboard
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  AlertTriangle, User, Package, Truck, Clock, MapPin,
  CheckCircle2, Phone, ExternalLink, Loader2, RefreshCw,
  Calendar, ChevronRight
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { format } from 'date-fns';

interface UnassignedOrder {
  id: string;
  status: string;
  customer_id: string | null;
  scheduled_delivery_date: string | null;
  scheduled_pickup_date: string | null;
  payment_status: string | null;
  is_heavy_material: boolean | null;
  contamination_detected: boolean | null;
  overfill_flagged: boolean | null;
  quotes: {
    customer_name: string | null;
    customer_phone: string | null;
    delivery_address: string | null;
    zip_code: string | null;
    material_type: string | null;
    user_selected_size_yards: number | null;
  } | null;
}

interface Driver {
  id: string;
  name: string;
}

export function DispatchOperationsPanel() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [unassigned, setUnassigned] = useState<UnassignedOrder[]>([]);
  const [problemJobs, setProblemJobs] = useState<UnassignedOrder[]>([]);
  const [drivers, setDrivers] = useState<Driver[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [assignDialog, setAssignDialog] = useState<{ order: UnassignedOrder; driverId: string } | null>(null);

  useEffect(() => { fetchData(); }, []);

  async function fetchData() {
    setIsLoading(true);
    const today = format(new Date(), 'yyyy-MM-dd');

    const [unassignedRes, problemsRes, driversRes] = await Promise.all([
      supabase
        .from('orders')
        .select(`
          id, status, customer_id, scheduled_delivery_date, scheduled_pickup_date,
          payment_status, is_heavy_material, contamination_detected, overfill_flagged,
          quotes (customer_name, customer_phone, delivery_address, zip_code, material_type, user_selected_size_yards)
        `)
        .is('assigned_driver_id', null)
        .not('status', 'in', '("pending","completed","cancelled","draft")')
        .order('scheduled_delivery_date', { ascending: true })
        .limit(20),
      supabase
        .from('orders')
        .select(`
          id, status, customer_id, scheduled_delivery_date, scheduled_pickup_date,
          payment_status, is_heavy_material, contamination_detected, overfill_flagged,
          quotes (customer_name, customer_phone, delivery_address, zip_code, material_type, user_selected_size_yards)
        `)
        .or('contamination_detected.eq.true,overfill_flagged.eq.true,wrong_material_flagged.eq.true')
        .not('status', 'eq', 'cancelled')
        .limit(10),
      supabase.from('drivers').select('id, name').eq('is_active', true),
    ]);

    setUnassigned((unassignedRes.data || []) as unknown as UnassignedOrder[]);
    setProblemJobs((problemsRes.data || []) as unknown as UnassignedOrder[]);
    setDrivers((driversRes.data || []) as Driver[]);
    setIsLoading(false);
  }

  async function handleAssign() {
    if (!assignDialog) return;
    const { error } = await supabase
      .from('orders')
      .update({ assigned_driver_id: assignDialog.driverId })
      .eq('id', assignDialog.order.id);

    if (error) {
      toast({ title: 'Error assigning driver', variant: 'destructive' });
    } else {
      toast({ title: 'Driver assigned ✓' });
      setAssignDialog(null);
      fetchData();
    }
  }

  if (isLoading) {
    return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin text-muted-foreground" /></div>;
  }

  return (
    <div className="space-y-6">
      {/* Unassigned Orders */}
      <Card>
        <CardHeader className="pb-3">
          <div className="flex items-center justify-between">
            <CardTitle className="text-base flex items-center gap-2">
              <Clock className="w-4 h-4 text-yellow-600" />
              Unassigned Orders ({unassigned.length})
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={fetchData}><RefreshCw className="w-4 h-4" /></Button>
          </div>
        </CardHeader>
        <CardContent>
          {unassigned.length === 0 ? (
            <p className="text-sm text-muted-foreground text-center py-4">All orders are assigned ✓</p>
          ) : (
            <div className="space-y-2">
              {unassigned.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm truncate">{order.quotes?.customer_name || 'Customer'}</span>
                      <Badge variant="outline" className="text-[10px]">{order.status.replace(/_/g, ' ')}</Badge>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-muted-foreground">
                      {order.quotes?.user_selected_size_yards && <span>{order.quotes.user_selected_size_yards}yd</span>}
                      {order.quotes?.material_type && <span>• {order.quotes.material_type}</span>}
                      {order.quotes?.zip_code && <span>• {order.quotes.zip_code}</span>}
                      {order.scheduled_delivery_date && <span>• {format(new Date(order.scheduled_delivery_date), 'MMM d')}</span>}
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5 shrink-0">
                    {order.customer_id && (
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => navigate(`/admin/customers/${order.customer_id}`)}>
                        <User className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="h-7 text-xs"
                      onClick={() => setAssignDialog({ order, driverId: '' })}
                    >
                      Assign
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Problem Jobs */}
      {problemJobs.length > 0 && (
        <Card className="border-destructive/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-base flex items-center gap-2 text-destructive">
              <AlertTriangle className="w-4 h-4" />
              Problem Jobs ({problemJobs.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {problemJobs.map(order => (
                <div key={order.id} className="flex items-center justify-between p-3 rounded-lg border border-destructive/20 bg-destructive/5 gap-2">
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-2 mb-0.5">
                      <span className="font-medium text-sm truncate">{order.quotes?.customer_name || 'Customer'}</span>
                      <div className="flex gap-1">
                        {order.contamination_detected && <Badge variant="destructive" className="text-[10px]">Contamination</Badge>}
                        {order.overfill_flagged && <Badge variant="destructive" className="text-[10px]">Overfill</Badge>}
                      </div>
                    </div>
                    <p className="text-xs text-muted-foreground">#{order.id.slice(0, 8)}</p>
                  </div>
                  <div className="flex gap-1.5 shrink-0">
                    {order.customer_id && (
                      <Button variant="ghost" size="sm" className="h-7 px-2" onClick={() => navigate(`/admin/customers/${order.customer_id}`)}>
                        <User className="w-3.5 h-3.5" />
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="h-7 px-2" onClick={() => navigate(`/admin/orders?id=${order.id}`)}>
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Assign Dialog */}
      <Dialog open={!!assignDialog} onOpenChange={() => setAssignDialog(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Assign Driver</DialogTitle>
          </DialogHeader>
          {assignDialog && (
            <div className="space-y-4 py-2">
              <div className="p-3 bg-muted rounded-lg space-y-1">
                <p className="font-medium">{assignDialog.order.quotes?.customer_name || 'Customer'}</p>
                <p className="text-sm text-muted-foreground flex items-center gap-1">
                  <MapPin className="w-3 h-3" />
                  {assignDialog.order.quotes?.delivery_address || assignDialog.order.quotes?.zip_code || '—'}
                </p>
                <div className="flex gap-2 text-xs text-muted-foreground">
                  {assignDialog.order.quotes?.user_selected_size_yards && <span>{assignDialog.order.quotes.user_selected_size_yards}yd</span>}
                  {assignDialog.order.quotes?.material_type && <span>• {assignDialog.order.quotes.material_type}</span>}
                </div>
                {assignDialog.order.quotes?.customer_phone && (
                  <div className="flex gap-2 mt-2">
                    <Button size="sm" variant="outline" asChild>
                      <a href={`tel:${assignDialog.order.quotes.customer_phone}`}><Phone className="w-3 h-3 mr-1" />Call</a>
                    </Button>
                  </div>
                )}
              </div>
              <div className="space-y-2">
                <Label>Select Driver</Label>
                <Select value={assignDialog.driverId} onValueChange={(v) => setAssignDialog({ ...assignDialog, driverId: v })}>
                  <SelectTrigger><SelectValue placeholder="Choose driver..." /></SelectTrigger>
                  <SelectContent>
                    {drivers.map(d => (
                      <SelectItem key={d.id} value={d.id}>{d.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setAssignDialog(null)}>Cancel</Button>
            <Button onClick={handleAssign} disabled={!assignDialog?.driverId}>Assign</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
