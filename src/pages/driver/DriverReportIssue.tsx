/**
 * Driver Report Issue — Category, severity, description, photos
 */
import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Loader2, Camera, Send, AlertTriangle
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/hooks/use-toast';
import { useAdminAuth } from '@/hooks/useAdminAuth';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';
import {
  getActiveAssignment,
  reportIssue,
  type IssueCategory,
  type IssueSeverity,
  type TruckAssignment,
} from '@/lib/fleetService';

const CATEGORIES: { value: IssueCategory; label: string; icon: string }[] = [
  { value: 'BRAKES', label: 'Brakes', icon: '🛑' },
  { value: 'TIRES', label: 'Tires', icon: '🔘' },
  { value: 'LIGHTS', label: 'Lights', icon: '💡' },
  { value: 'HYDRAULIC', label: 'Hydraulic', icon: '⚙️' },
  { value: 'ENGINE', label: 'Engine', icon: '🔧' },
  { value: 'TRANSMISSION', label: 'Trans.', icon: '⚡' },
  { value: 'OTHER', label: 'Other', icon: '📋' },
];

const SEVERITIES: { value: IssueSeverity; label: string; color: string }[] = [
  { value: 'LOW', label: 'Low', color: 'bg-green-100 text-green-800 border-green-300' },
  { value: 'MED', label: 'Medium', color: 'bg-yellow-100 text-yellow-800 border-yellow-300' },
  { value: 'HIGH', label: 'High', color: 'bg-orange-100 text-orange-800 border-orange-300' },
  { value: 'SAFETY', label: 'Safety', color: 'bg-red-100 text-red-800 border-red-300' },
];

export default function DriverReportIssue() {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { driverId } = useAdminAuth();
  const fileRef = useRef<HTMLInputElement>(null);

  const [assignment, setAssignment] = useState<TruckAssignment | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);

  const [category, setCategory] = useState<IssueCategory>('OTHER');
  const [severity, setSeverity] = useState<IssueSeverity>('LOW');
  const [description, setDescription] = useState('');
  const [photoUrls, setPhotoUrls] = useState<string[]>([]);

  useEffect(() => {
    if (!driverId) return;
    (async () => {
      const a = await getActiveAssignment(driverId);
      setAssignment(a);
      setIsLoading(false);
    })();
  }, [driverId]);

  async function handlePhotoCapture(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file || !assignment) return;
    const path = `issues/${assignment.truck_id}/${Date.now()}.jpg`;
    const { data, error } = await supabase.storage.from('vehicle-photos').upload(path, file);
    if (error) {
      toast({ title: 'Upload failed', variant: 'destructive' });
      return;
    }
    const { data: urlData } = supabase.storage.from('vehicle-photos').getPublicUrl(data.path);
    setPhotoUrls(prev => [...prev, urlData.publicUrl]);
    toast({ title: 'Photo added ✓' });
  }

  async function handleSubmit() {
    if (!driverId || !assignment) return;
    if (!description.trim()) {
      toast({ title: 'Description required', variant: 'destructive' });
      return;
    }

    setIsSaving(true);
    const result = await reportIssue({
      truckId: assignment.truck_id,
      driverId,
      category,
      severity,
      description: description.trim(),
      photoUrls,
    });
    setIsSaving(false);

    if (result.success) {
      toast({ title: 'Issue reported ✓' });
      navigate('/driver');
    } else {
      toast({ title: 'Error', description: result.error, variant: 'destructive' });
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="p-6 text-center">
        <AlertTriangle className="w-12 h-12 mx-auto text-amber-500 mb-3" />
        <h2 className="text-lg font-bold">No truck assigned</h2>
        <p className="text-sm text-muted-foreground mb-4">Select a truck first</p>
        <Button onClick={() => navigate('/driver/truck-select')}>Select Truck</Button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-lg mx-auto pb-32 space-y-5">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => navigate('/driver')}>
          <ArrowLeft className="w-5 h-5" />
        </Button>
        <div>
          <h1 className="text-xl font-bold">Report Issue</h1>
          <p className="text-sm text-muted-foreground">Truck #{assignment.trucks?.truck_number}</p>
        </div>
      </div>

      {/* Category */}
      <div>
        <label className="text-sm font-bold mb-2 block">Category</label>
        <div className="grid grid-cols-4 gap-2">
          {CATEGORIES.map(c => (
            <button
              key={c.value}
              onClick={() => setCategory(c.value)}
              className={cn(
                'flex flex-col items-center gap-1 p-3 rounded-xl border-2 transition-all text-center',
                category === c.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-primary/30'
              )}
            >
              <span className="text-xl">{c.icon}</span>
              <span className="text-xs font-medium">{c.label}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Severity */}
      <div>
        <label className="text-sm font-bold mb-2 block">Severity</label>
        <div className="grid grid-cols-4 gap-2">
          {SEVERITIES.map(s => (
            <button
              key={s.value}
              onClick={() => setSeverity(s.value)}
              className={cn(
                'p-3 rounded-xl border-2 font-bold text-sm transition-all',
                severity === s.value ? s.color + ' border-current' : 'border-border'
              )}
            >
              {s.label}
            </button>
          ))}
        </div>
        {severity === 'SAFETY' && (
          <p className="text-xs text-red-600 mt-1 font-medium">
            ⚠️ Safety issues will mark truck OUT OF SERVICE
          </p>
        )}
      </div>

      {/* Description */}
      <div>
        <label className="text-sm font-bold mb-1 block">Description *</label>
        <Textarea
          value={description}
          onChange={e => setDescription(e.target.value)}
          placeholder="Describe the issue..."
          rows={3}
        />
      </div>

      {/* Photos */}
      <div>
        <label className="text-sm font-bold mb-2 block">Photos</label>
        <div className="flex gap-2 flex-wrap">
          {photoUrls.map((url, i) => (
            <img key={i} src={url} alt="" className="w-20 h-20 object-cover rounded-lg border" />
          ))}
          <button
            onClick={() => fileRef.current?.click()}
            className="w-20 h-20 rounded-lg border-2 border-dashed border-border flex items-center justify-center hover:bg-muted/50"
          >
            <Camera className="w-6 h-6 text-muted-foreground" />
          </button>
        </div>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handlePhotoCapture}
        />
      </div>

      {/* Submit */}
      <div className="fixed bottom-20 left-0 right-0 p-4 bg-background/95 backdrop-blur border-t">
        <Button
          onClick={handleSubmit}
          disabled={isSaving || !description.trim()}
          className="w-full h-14 text-lg font-bold gap-2"
        >
          {isSaving ? <Loader2 className="w-5 h-5 animate-spin" /> : <Send className="w-5 h-5" />}
          Submit Issue
        </Button>
      </div>
    </div>
  );
}
