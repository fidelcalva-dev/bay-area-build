/**
 * Yard Hold Board — Full dumpsters sitting at yard awaiting dump
 * /dispatch/yard-hold
 */
import { useState, useEffect, useCallback } from 'react';
import { format, differenceInDays } from 'date-fns';
import {
  Loader2, Truck, AlertTriangle, RefreshCw, ArrowRight, MapPin
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { supabase } from '@/integrations/supabase/client';
import { getYardHoldAssets, createDumpReturnRun } from '@/lib/runsService';

interface YardAsset {
  id: string;
  asset_code: string;
  asset_status: string;
  current_location_type: string;
  current_yard_id: string;
  last_movement_at: string | null;
  deployed_at: string | null;
  asset_notes: string | null;
  material_code?: string;
  dumpster_sizes: { label: string; size_value: number };
  yards: { id: string; name: string } | null;
  home_yard: { id: string; name: string } | null;
}

export default function YardHoldBoard() {
  const { toast } = useToast();
  const [assets, setAssets] = useState<YardAsset[]>([]);
  const [facilities, setFacilities] = useState<{ id: string; name: string }[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [sendDialogOpen, setSendDialogOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<YardAsset | null>(null);
  const [selectedFacility, setSelectedFacility] = useState('');
  const [isSending, setIsSending] = useState(false);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    try {
      const [assetsData, facilitiesRes] = await Promise.all([
        getYardHoldAssets(),
        supabase.from('disposal_sites').select('id, name').eq('is_active', true).order('name'),
      ]);
      setAssets(assetsData as YardAsset[]);
      setFacilities((facilitiesRes.data || []) as { id: string; name: string }[]);
    } catch (err) {
      console.error(err);
      toast({ title: 'Error loading yard hold data', variant: 'destructive' });
    } finally {
      setIsLoading(false);
    }
  }, [toast]);

  useEffect(() => { fetchData(); }, [fetchData]);

  function openSendDialog(asset: YardAsset) {
    setSelectedAsset(asset);
    setSelectedFacility('');
    setSendDialogOpen(true);
  }

  async function handleSendToDump() {
    if (!selectedAsset) return;
    setIsSending(true);
    const result = await createDumpReturnRun({
      assetId: selectedAsset.id,
      yardId: selectedAsset.current_yard_id,
      facilityId: selectedFacility || undefined,
      scheduledDate: format(new Date(), 'yyyy-MM-dd'),
      notes: `Yard hold → dump for ${selectedAsset.asset_code}`,
    });
    setIsSending(false);

    if (result.success) {
      toast({ title: `Dump & Return run created for ${selectedAsset.asset_code} ✓` });
      setSendDialogOpen(false);
      fetchData();
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  }

  async function handleRelease(asset: YardAsset) {
    const { error } = await supabase
      .from('assets_dumpsters')
      .update({
        asset_status: 'available',
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', asset.id);

    if (error) {
      toast({ title: 'Error releasing asset', description: error.message, variant: 'destructive' });
    } else {
      toast({ title: `${asset.asset_code} released ✓` });

      // Log lifecycle
      await supabase.from('lifecycle_events' as never).insert({
        entity_type: 'ORDER',
        entity_id: asset.id,
        stage_key: 'YARD_HOLD_RELEASED',
        department: 'LOGISTICS',
        event_type: 'MANUAL_MOVE',
        notes: `Asset ${asset.asset_code} released from yard hold`,
      } as never);

      fetchData();
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-8 h-8 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Yard Hold Board</h1>
          <p className="text-sm text-muted-foreground">Full dumpsters at yard awaiting disposal</p>
        </div>
        <Button variant="outline" size="sm" onClick={fetchData}>
          <RefreshCw className="w-4 h-4 mr-2" /> Refresh
        </Button>
      </div>

      {assets.length === 0 ? (
        <div className="text-center py-16 border rounded-xl bg-card">
          <Truck className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
          <h3 className="text-lg font-medium text-muted-foreground">No full dumpsters at yard</h3>
          <p className="text-sm text-muted-foreground/70 mt-1">All containers are either deployed or available</p>
        </div>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {assets.map(asset => {
            const daysAtYard = asset.last_movement_at
              ? differenceInDays(new Date(), new Date(asset.last_movement_at))
              : 0;
            const isUrgent = daysAtYard >= 3;

            return (
              <div
                key={asset.id}
                className={`p-4 rounded-xl border-2 bg-card space-y-3 ${
                  isUrgent ? 'border-red-300 bg-red-50/50' : 'border-border'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-xl font-bold font-mono">{asset.asset_code}</span>
                  <Badge variant={isUrgent ? 'destructive' : 'secondary'}>
                    {daysAtYard}d at yard
                  </Badge>
                </div>

                <div className="grid grid-cols-2 gap-2 text-sm">
                  <div>
                    <span className="text-muted-foreground">Size</span>
                    <p className="font-semibold">{asset.dumpster_sizes?.label || '—'}</p>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Yard</span>
                    <p className="font-semibold flex items-center gap-1">
                      <MapPin className="w-3 h-3" />
                      {asset.yards?.name || '—'}
                    </p>
                  </div>
                </div>

                {isUrgent && (
                  <div className="flex items-center gap-1 text-xs text-red-600 font-medium">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Over 3 days — prioritize disposal
                  </div>
                )}

                <div className="flex gap-2">
                  <Button
                    size="sm"
                    className="flex-1 gap-1"
                    onClick={() => openSendDialog(asset)}
                  >
                    <ArrowRight className="w-4 h-4" /> Send to Dump
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => handleRelease(asset)}
                  >
                    Release
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Send to Dump Dialog */}
      <Dialog open={sendDialogOpen} onOpenChange={setSendDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Send {selectedAsset?.asset_code} to Dump</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <div>
              <label className="text-sm font-medium">Disposal Facility (optional)</label>
              <Select value={selectedFacility} onValueChange={setSelectedFacility}>
                <SelectTrigger>
                  <SelectValue placeholder="Select facility..." />
                </SelectTrigger>
                <SelectContent>
                  {facilities.map(f => (
                    <SelectItem key={f.id} value={f.id}>{f.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <p className="text-sm text-muted-foreground">
              This will create a DUMP & RETURN run for today and mark the asset as in-transit.
            </p>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setSendDialogOpen(false)}>Cancel</Button>
            <Button onClick={handleSendToDump} disabled={isSending}>
              {isSending ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
              Create Run
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
