/**
 * Driver Pre-Trip Inspection — DOT-style checklist
 * Prompted after truck selection
 */
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, CheckCircle2, XCircle, AlertTriangle,
  Shield, Minus, Camera
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { cn } from '@/lib/utils';
import {
  INSPECTION_CHECKLIST,
  submitInspection,
  getActiveAssignment,
  unassignTruck,
  type ChecklistItem,
  type TruckAssignment,
} from '@/lib/fleetService';

export default function DriverPreTrip() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { driverId } = useAdminAuth();

  const [assignment, setAssignment] = useState<TruckAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [checklist, setChecklist] = useState<ChecklistItem[]>(
    INSPECTION_CHECKLIST.map(item => ({ ...item, status: 'pass' as const }))
  );
  const [notes, setNotes] = useState('');
  const [signatureName, setSignatureName] = useState('');

  useEffect(() => {
    if (!driverId) return;
    (async () => {
      const a = await getActiveAssignment(driverId);
      if (!a) {
        navigate('/driver/truck-select', { replace: true });
        return;
      }
      setAssignment(a);
      setIsLoading(false);
    })();
  }, [driverId, navigate]);

  function toggleItem(id: string) {
    setChecklist(prev =>
      prev.map(item => {
        if (item.id !== id) return item;
        const next = item.status === 'pass' ? 'fail' : item.status === 'fail' ? 'na' : 'pass';
        return { ...item, status: next as 'pass' | 'fail' | 'na' };
      })
    );
  }

  async function handleSubmit() {
    if (!driverId || !assignment) return;
    if (!signatureName.trim()) {
      toast({ title: 'Signature name required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const result = await submitInspection({
      driverId,
      truckId: assignment.truck_id,
      checklist,
      notes: notes || undefined,
      signatureName: signatureName.trim(),
    });
    setIsSaving(false);

    if (!result.success) {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
      return;
    }

    if (result.status === 'UNSAFE') {
      toast({
        title: '⚠️ UNSAFE — Truck Out of Service',
        description: 'Critical items failed. This truck has been marked OUT OF SERVICE. Select a different truck.',
        variant: 'destructive',
      });
      // Unassign and go back to truck select
      await unassignTruck(driverId);
      navigate('/driver/truck-select', { replace: true });
    } else if (result.status === 'FAIL') {
      toast({ title: 'Inspection submitted with warnings', description: 'Non-critical items failed. Proceed with caution.' });
      navigate('/driver', { replace: true });
    } else {
      toast({ title: 'Inspection passed ✓' });
      navigate('/driver', { replace: true });
    }
  }

  const criticalItems = checklist.filter(i => i.category === 'critical');
  const standardItems = checklist.filter(i => i.category === 'standard');
  const failCount = checklist.filter(i => i.status === 'fail').length;
  const criticalFailCount = criticalItems.filter(i => i.status === 'fail').length;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  const statusIcon = (status: string) => {
    if (status === 'pass') return <CheckCircle2 className="w-6 h-6 text-green-500" />;
    if (status === 'fail') return <XCircle className="w-6 h-6 text-red-500" />;
    return <Minus className="w-6 h-6 text-muted-foreground" />;
  };

  return (
    <div className="p-4 max-w-lg mx-auto pb-40 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/driver')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Pre-Trip Inspection</h1>
          <p className="text-sm text-muted-foreground">
            Truck #{assignment?.trucks?.truck_number} — Tap items to toggle
          </p>
        </div>
      </div>

      {criticalFailCount > 0 && (
        <div className="p-3 rounded-xl bg-red-100 border-2 border-red-300 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-red-700" />
          <span className="text-sm font-bold text-red-800">
            {criticalFailCount} critical item(s) failed — truck will be OUT OF SERVICE
          </span>
        </div>
      )}

      {/* Critical Items */}
      <div>
        <div className="flex items-center gap-2 mb-3">
          <Shield className="w-5 h-5 text-red-500" />
          <h2 className="font-bold text-base">Critical Safety Items</h2>
          <Badge variant="destructive" className="text-xs">Required</Badge>
        </div>
        <div className="space-y-2">
          {criticalItems.map(item => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                item.status === 'fail' ? 'border-red-300 bg-red-50' :
                item.status === 'pass' ? 'border-green-200 bg-green-50/50' :
                'border-border bg-muted/30'
              )}
            >
              {statusIcon(item.status)}
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              <Badge variant="outline" className="text-xs">
                {item.status.toUpperCase()}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Standard Items */}
      <div>
        <h2 className="font-bold text-base mb-3">Standard Items</h2>
        <div className="space-y-2">
          {standardItems.map(item => (
            <button
              key={item.id}
              onClick={() => toggleItem(item.id)}
              className={cn(
                'w-full flex items-center gap-3 p-3 rounded-xl border-2 transition-all text-left',
                item.status === 'fail' ? 'border-amber-300 bg-amber-50' :
                item.status === 'pass' ? 'border-green-200 bg-green-50/50' :
                'border-border bg-muted/30'
              )}
            >
              {statusIcon(item.status)}
              <span className="flex-1 font-medium text-sm">{item.label}</span>
              <Badge variant="outline" className="text-xs">
                {item.status.toUpperCase()}
              </Badge>
            </button>
          ))}
        </div>
      </div>

      {/* Notes */}
      <div>
        <label className="text-sm font-bold mb-1 block">Notes (optional)</label>
        <Textarea
          value={notes}
          onChange={e => setNotes(e.target.value)}
          placeholder="Any additional observations..."
          rows={2}
        />
      </div>

      {/* Signature */}
      <div>
        <label className="text-sm font-bold mb-1 block">Driver Signature (Full Name) *</label>
        <Input
          value={signatureName}
          onChange={e => setSignatureName(e.target.value)}
          placeholder="Type your full name"
          className="h-12 text-base"
        />
      </div>

      {/* Submit */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm text-muted-foreground">
            {failCount > 0 ? `${failCount} item(s) failed` : 'All items passed'}
          </span>
          {criticalFailCount > 0 && (
            <Badge variant="destructive">UNSAFE</Badge>
          )}
        </div>
        <Button
          onClick={handleSubmit}
          disabled={isSaving || !signatureName.trim()}
          className={cn(
            'w-full h-14 text-lg font-bold gap-2',
            criticalFailCount > 0 ? 'bg-red-600 hover:bg-red-700' : ''
          )}
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <CheckCircle2 className="w-5 h-5" />}
          {criticalFailCount > 0 ? 'Submit (UNSAFE)' : 'Submit Inspection'}
        </Button>
      </div>
    </div>
  );
}
