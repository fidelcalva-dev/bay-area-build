import { useState } from 'react';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Upload, FileText, X, Loader2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import type { ContractorFormData, UploadedFile } from '../ContractorApplicationTypes';

interface Props {
  data: ContractorFormData;
  onChange: (updates: Partial<ContractorFormData>) => void;
}

const DOC_CATEGORIES: { value: UploadedFile['category']; label: string; description: string }[] = [
  { value: 'license', label: 'Contractor License', description: 'CSLB or other state license' },
  { value: 'insurance', label: 'Insurance Certificate', description: 'COI / General Liability' },
  { value: 'w9', label: 'W-9 Form', description: 'Tax identification' },
  { value: 'project_photos', label: 'Project Photos', description: 'Current or past projects' },
  { value: 'company_logo', label: 'Company Logo', description: 'Optional — for account setup' },
];

export function DocumentUploadStep({ data, onChange }: Props) {
  const [uploading, setUploading] = useState<string | null>(null);
  const { toast } = useToast();

  async function handleUpload(file: File, category: UploadedFile['category']) {
    setUploading(category);
    try {
      const ext = file.name.split('.').pop();
      const path = `applications/${Date.now()}_${category}.${ext}`;
      const { error } = await supabase.storage.from('contractor-documents').upload(path, file);
      if (error) throw error;
      const newFile: UploadedFile = { name: file.name, path, category };
      onChange({ uploadedFiles: [...data.uploadedFiles, newFile] });
      toast({ title: `${file.name} uploaded` });
    } catch {
      toast({ title: 'Upload failed', variant: 'destructive' });
    } finally {
      setUploading(null);
    }
  }

  function removeFile(path: string) {
    onChange({ uploadedFiles: data.uploadedFiles.filter(f => f.path !== path) });
  }

  return (
    <div className="space-y-4">
      <p className="text-sm text-muted-foreground">Upload supporting documents. These are optional but help speed up the review process.</p>
      {DOC_CATEGORIES.map(cat => {
        const uploaded = data.uploadedFiles.filter(f => f.category === cat.value);
        return (
          <div key={cat.value} className="border rounded-lg p-4 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <Label className="text-sm font-medium">{cat.label}</Label>
                <p className="text-xs text-muted-foreground">{cat.description}</p>
              </div>
              {uploaded.length > 0 && <Badge variant="secondary" className="text-[10px]">{uploaded.length} uploaded</Badge>}
            </div>
            {uploaded.map(f => (
              <div key={f.path} className="flex items-center gap-2 text-sm bg-muted/50 rounded px-2 py-1">
                <FileText className="w-3.5 h-3.5 text-muted-foreground" />
                <span className="flex-1 truncate">{f.name}</span>
                <button onClick={() => removeFile(f.path)} className="text-muted-foreground hover:text-destructive"><X className="w-3.5 h-3.5" /></button>
              </div>
            ))}
            <Label className="flex items-center gap-2 cursor-pointer text-sm text-primary hover:underline">
              {uploading === cat.value ? <Loader2 className="w-4 h-4 animate-spin" /> : <Upload className="w-4 h-4" />}
              {uploading === cat.value ? 'Uploading...' : 'Upload File'}
              <Input
                type="file"
                className="hidden"
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={e => {
                  const f = e.target.files?.[0];
                  if (f) handleUpload(f, cat.value);
                  e.target.value = '';
                }}
                disabled={uploading === cat.value}
              />
            </Label>
          </div>
        );
      })}
    </div>
  );
}
