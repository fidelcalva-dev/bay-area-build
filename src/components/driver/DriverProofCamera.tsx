/**
 * Driver Proof Camera — Full-screen modal for photo capture + upload
 * Uploads to storage: runs/{run_id}/{photo_type}/{timestamp}.jpg
 */
import { useState, useRef } from 'react';
import { X, Camera, Upload, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DriverProofCameraProps {
  runId: string;
  checkpointType: string;
  onUpload: (photoUrl: string) => void;
  onClose: () => void;
}

const CHECKPOINT_LABELS: Record<string, string> = {
  DELIVERY_POD: 'Placement Photo',
  PICKUP_POD: 'Full Dumpster Photo',
  MATERIAL_CLOSEUP: 'Material Close-up',
  DUMP_TICKET: 'Dump Ticket Photo',
  FILL_LINE_PHOTO: 'Fill Line Compliance',
  CONTAMINATION_PHOTO: 'Contamination Evidence',
  SWAP_PICKUP_POD: 'Swap Pickup Photo',
  SWAP_DELIVERY_POD: 'Swap Drop Photo',
  OVERFILL_PHOTO: 'Overfill Evidence',
};

export function DriverProofCamera({ runId, checkpointType, onUpload, onClose }: DriverProofCameraProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const fileRef = useRef<HTMLInputElement>(null);

  function handleFileSelect(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (ev) => setPreview(ev.target?.result as string);
    reader.readAsDataURL(file);
  }

  async function handleUpload() {
    if (!selectedFile) return;
    setIsUploading(true);

    try {
      const ext = selectedFile.name.split('.').pop() ?? 'jpg';
      const fileName = `runs/${runId}/${checkpointType}/${Date.now()}.${ext}`;

      const { error: uploadErr } = await supabase.storage
        .from('dump-tickets')
        .upload(fileName, selectedFile, { upsert: false });

      if (uploadErr) throw uploadErr;

      const { data: urlData } = supabase.storage
        .from('dump-tickets')
        .getPublicUrl(fileName);

      onUpload(urlData.publicUrl);
    } catch (err) {
      console.error('Upload failed:', err);
      alert('Upload failed. Please try again.');
    } finally {
      setIsUploading(false);
    }
  }

  const label = CHECKPOINT_LABELS[checkpointType] || checkpointType.replace(/_/g, ' ');

  return (
    <div className="fixed inset-0 z-50 bg-black flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-bold">{label}</h2>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Preview / Capture Area */}
      <div className="flex-1 flex items-center justify-center p-4">
        {preview ? (
          <img src={preview} alt="Preview" className="max-w-full max-h-full rounded-2xl object-contain" />
        ) : (
          <div className="text-center text-white/60">
            <Camera className="w-20 h-20 mx-auto mb-4" />
            <p className="text-lg font-medium">Take a photo of:</p>
            <p className="text-2xl font-bold text-white mt-2">{label}</p>
            {checkpointType === 'DUMP_TICKET' && (
              <p className="text-sm text-white/50 mt-2">
                Make sure ticket number, facility, and weight are visible
              </p>
            )}
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="p-4 space-y-3">
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileSelect}
        />

        {!preview ? (
          <Button
            size="lg"
            className="w-full h-16 text-lg font-bold bg-white text-black hover:bg-white/90 gap-3"
            onClick={() => fileRef.current?.click()}
          >
            <Camera className="w-6 h-6" /> Take Photo
          </Button>
        ) : (
          <div className="flex gap-3">
            <Button
              size="lg"
              variant="outline"
              className="flex-1 h-14 text-white border-white/30 hover:bg-white/10"
              onClick={() => {
                setPreview(null);
                setSelectedFile(null);
                fileRef.current?.click();
              }}
            >
              Retake
            </Button>
            <Button
              size="lg"
              className="flex-1 h-14 bg-green-500 hover:bg-green-600 text-white font-bold gap-2"
              onClick={handleUpload}
              disabled={isUploading}
            >
              {isUploading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                <Upload className="w-5 h-5" />
              )}
              {isUploading ? 'Uploading...' : 'Upload'}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
