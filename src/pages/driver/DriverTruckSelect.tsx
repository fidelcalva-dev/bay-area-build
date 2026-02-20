/**
 * Driver Truck Selection — Required on clock-in
 * Shows available trucks, search, confirm assignment
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Truck, Search, Loader2, CheckCircle2, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';
import {
  getAvailableTrucks,
  assignTruck,
  getActiveAssignment,
  type Truck as TruckType,
} from '@/lib/fleetService';

export default function DriverTruckSelect() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { driverId } = useAdminAuth();

  const [trucks, setTrucks] = useState<TruckType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    loadTrucks();
  }, [driverId]);

  async function loadTrucks() {
    if (!driverId) return;
    setIsLoading(true);
    try {
      // Check if already assigned
      const existing = await getActiveAssignment(driverId);
      if (existing) {
        navigate('/driver/inspect', { replace: true });
        return;
      }
      const data = await getAvailableTrucks();
      setTrucks(data);
    } catch {
      toast({ title: 'Failed to load trucks', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }

  async function handleConfirm() {
    if (!selectedId || !driverId) return;
    setIsSaving(true);
    const result = await assignTruck(driverId, selectedId);
    setIsSaving(false);
    if (result.success) {
      toast({ title: 'Truck assigned ✓' });
      navigate('/driver/inspect');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  }

  const filtered = trucks.filter(t => {
    const q = search.toLowerCase();
    return (
      t.truck_number.toLowerCase().includes(q) ||
      (t.license_plate || '').toLowerCase().includes(q) ||
      (t.plate_number || '').toLowerCase().includes(q) ||
      (t.make || '').toLowerCase().includes(q)
    );
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-24 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/driver')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Select Your Truck</h1>
          <p className="text-sm text-muted-foreground">Choose a truck before starting runs</p>
        </div>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Search by number or plate..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          className="pl-10 h-12 text-base"
        />
      </div>

      {filtered.length === 0 ? (
        <div className="text-center py-12">
          <Truck className="w-16 h-16 mx-auto text-muted-foreground/40 mb-4" />
          <p className="text-muted-foreground">No available trucks found</p>
        </div>
      ) : (
        <div className="space-y-2">
          {filtered.map(truck => (
            <button
              key={truck.id}
              onClick={() => setSelectedId(truck.id)}
              className={cn(
                'w-full flex items-center gap-4 p-4 rounded-xl border-2 transition-all text-left',
                selectedId === truck.id
                  ? 'border-primary bg-primary/5 shadow-md'
                  : 'border-border bg-card hover:border-primary/30'
              )}
            >
              <div className={cn(
                'w-12 h-12 rounded-xl flex items-center justify-center shrink-0',
                selectedId === truck.id ? 'bg-primary text-primary-foreground' : 'bg-muted text-muted-foreground'
              )}>
                <Truck className="w-6 h-6" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-base">#{truck.truck_number}</span>
                  <Badge variant="secondary" className="text-xs">
                    {truck.truck_type || 'Truck'}
                  </Badge>
                </div>
                <p className="text-sm text-muted-foreground">
                  {[truck.year, truck.make, truck.model].filter(Boolean).join(' ') || 'N/A'}
                  {truck.license_plate || truck.plate_number ? ` • ${truck.license_plate || truck.plate_number}` : ''}
                </p>
              </div>
              {selectedId === truck.id && (
                <CheckCircle2 className="w-6 h-6 text-primary shrink-0" />
              )}
            </button>
          ))}
        </div>
      )}

      {selectedId && (
        <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
          <Button
            onClick={handleConfirm}
            disabled={isSaving}
            className="w-full h-14 text-lg font-bold gap-2"
          >
            {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
            Confirm Truck
          </Button>
        </div>
      )}
    </div>
  );
}
