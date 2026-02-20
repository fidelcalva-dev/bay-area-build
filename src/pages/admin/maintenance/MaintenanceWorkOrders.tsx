/**
 * Maintenance Work Orders
 */
import { useState, useEffect } from 'react';
import { Loader2, Wrench } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  getAllWorkOrders, updateWorkOrder, completeWorkOrderAndReturnTruck,
  type MaintenanceWorkOrder
} from '@/lib/fleetService';
import { useToast } from '@/hooks/use-toast';

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  WAITING_PARTS: 'bg-amber-100 text-amber-800',
  COMPLETED: 'bg-green-100 text-green-800',
};

export default function MaintenanceWorkOrders() {
  const { toast } = useToast();
  const [workOrders, setWorkOrders] = useState<MaintenanceWorkOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => { load(); }, [statusFilter]);

  async function load() {
    setIsLoading(true);
    const data = await getAllWorkOrders(statusFilter);
    setWorkOrders(data);
    setIsLoading(false);
  }

  async function handleComplete(wo: MaintenanceWorkOrder) {
    await completeWorkOrderAndReturnTruck(wo.id, wo.truck_id);
    toast({ title: 'Work order completed, truck returned to AVAILABLE ✓' });
    load();
  }

  async function handleStatusChange(wo: MaintenanceWorkOrder, status: string) {
    await updateWorkOrder(wo.id, { status } as any);
    toast({ title: `Status: ${status}` });
    load();
  }

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="WAITING_PARTS">Waiting Parts</SelectItem>
            <SelectItem value="COMPLETED">Completed</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{workOrders.length} work orders</span>
      </div>

      {workOrders.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No work orders found</div>
      ) : (
        <div className="space-y-3">
          {workOrders.map(wo => (
            <div key={wo.id} className="border rounded-lg p-4 space-y-3 hover:bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <Wrench className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">Truck #{wo.trucks?.truck_number || '?'}</span>
                  <Badge className={cn('text-xs', STATUS_COLORS[wo.status])}>{wo.status.replace(/_/g, ' ')}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(wo.created_at), 'MMM d, h:mm a')}</span>
              </div>
              {wo.vehicle_issues && (
                <p className="text-sm text-muted-foreground">
                  Issue: {wo.vehicle_issues.issue_category} ({wo.vehicle_issues.severity}) — {wo.vehicle_issues.description}
                </p>
              )}
              <p className="text-sm">{wo.notes || '—'}</p>
              <div className="flex items-center gap-4 text-sm">
                <span>Labor: ${wo.labor_cost?.toFixed(2) || '0.00'}</span>
                <span>Parts: ${wo.parts_cost?.toFixed(2) || '0.00'}</span>
                <span className="font-bold">Total: ${wo.total_cost?.toFixed(2) || '0.00'}</span>
              </div>
              <div className="flex gap-2">
                {wo.status === 'OPEN' && (
                  <Button size="sm" variant="outline" onClick={() => handleStatusChange(wo, 'IN_PROGRESS')}>Start</Button>
                )}
                {wo.status === 'IN_PROGRESS' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(wo, 'WAITING_PARTS')}>Waiting Parts</Button>
                    <Button size="sm" onClick={() => handleComplete(wo)}>Complete & Return Truck</Button>
                  </>
                )}
                {wo.status === 'WAITING_PARTS' && (
                  <Button size="sm" onClick={() => handleStatusChange(wo, 'IN_PROGRESS')}>Parts Arrived</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
