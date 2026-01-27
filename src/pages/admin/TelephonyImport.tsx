import { useState, useRef } from 'react';
import { Upload, FileText, CheckCircle2, XCircle, AlertTriangle, Download } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

interface ImportResult {
  total: number;
  imported: number;
  skipped: number;
  errors: { row: number; message: string }[];
}

interface CallRecord {
  timestamp: string;
  from: string;
  to: string;
  duration: string;
  agent?: string;
  recording_url?: string;
  tags?: string;
}

export default function TelephonyImport() {
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<CallRecord[]>([]);
  const [isImporting, setIsImporting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ImportResult | null>(null);
  const [imports, setImports] = useState<any[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const { toast } = useToast();

  const fetchImports = async () => {
    const { data } = await supabase
      .from('call_history_imports')
      .select('*')
      .order('imported_at', { ascending: false })
      .limit(10);
    if (data) setImports(data);
  };

  useState(() => {
    fetchImports();
  });

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0];
    if (!selectedFile) return;

    if (!selectedFile.name.endsWith('.csv')) {
      toast({ title: 'Invalid File', description: 'Please upload a CSV file', variant: 'destructive' });
      return;
    }

    setFile(selectedFile);
    setResult(null);

    // Parse preview
    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const previewData: CallRecord[] = [];
      for (let i = 1; i < Math.min(lines.length, 6); i++) {
        if (!lines[i].trim()) continue;
        const values = lines[i].split(',');
        const record: any = {};
        headers.forEach((h, idx) => {
          record[h] = values[idx]?.trim() || '';
        });
        previewData.push(record as CallRecord);
      }
      setPreview(previewData);
    };
    reader.readAsText(selectedFile);
  };

  const handleImport = async () => {
    if (!file) return;

    setIsImporting(true);
    setProgress(0);
    setResult(null);

    const reader = new FileReader();
    reader.onload = async (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
      
      const total = lines.length - 1;
      let imported = 0;
      let skipped = 0;
      const errors: { row: number; message: string }[] = [];

      for (let i = 1; i < lines.length; i++) {
        if (!lines[i].trim()) {
          skipped++;
          continue;
        }

        const values = lines[i].split(',');
        const record: any = {};
        headers.forEach((h, idx) => {
          record[h] = values[idx]?.trim() || '';
        });

        try {
          // Parse timestamp
          const timestamp = new Date(record.timestamp);
          if (isNaN(timestamp.getTime())) {
            throw new Error('Invalid timestamp');
          }

          // Parse duration
          const duration = parseInt(record.duration) || 0;

          // Insert as historical call event
          const { error } = await supabase.from('call_events').insert({
            direction: 'INBOUND',
            from_number: record.from,
            to_number: record.to,
            duration_seconds: duration,
            call_status: 'COMPLETED',
            caller_name: record.agent || null,
            recording_url: record.recording_url || null,
            notes: record.tags || null,
            started_at: timestamp.toISOString(),
            ended_at: new Date(timestamp.getTime() + duration * 1000).toISOString(),
            call_source: 'GHL_IMPORT',
            is_historical: true,
            imported_at: new Date().toISOString(),
          });

          if (error) throw error;
          imported++;
        } catch (err: any) {
          errors.push({ row: i + 1, message: err.message || 'Unknown error' });
          skipped++;
        }

        setProgress(Math.round((i / total) * 100));
      }

      // Log import
      await supabase.from('call_history_imports').insert({
        filename: file.name,
        records_total: total,
        records_imported: imported,
        records_skipped: skipped,
        errors: errors.length > 0 ? errors.slice(0, 50) : null,
      });

      setResult({ total, imported, skipped, errors });
      setIsImporting(false);
      fetchImports();

      toast({
        title: 'Import Complete',
        description: `${imported} of ${total} records imported`,
      });
    };

    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = 'timestamp,from,to,duration,agent,recording_url,tags\n2024-01-15 10:30:00,+14155551234,+14155559999,180,John Smith,https://example.com/recording.mp3,sales\n';
    const blob = new Blob([template], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'call_history_template.csv';
    a.click();
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold">Import Call History</h1>
          <p className="text-muted-foreground">
            Import historical call records from GHL export
          </p>
        </div>
        <Button variant="outline" onClick={downloadTemplate}>
          <Download className="w-4 h-4 mr-2" />
          Download Template
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Upload className="w-5 h-5" />
              Upload CSV
            </CardTitle>
            <CardDescription>
              Export your call history from GHL and upload the CSV file
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div 
              className="border-2 border-dashed rounded-lg p-8 text-center cursor-pointer hover:bg-muted/50 transition"
              onClick={() => fileInputRef.current?.click()}
            >
              <input
                type="file"
                ref={fileInputRef}
                accept=".csv"
                onChange={handleFileChange}
                className="hidden"
              />
              {file ? (
                <div className="space-y-2">
                  <FileText className="w-12 h-12 mx-auto text-primary" />
                  <p className="font-medium">{file.name}</p>
                  <p className="text-sm text-muted-foreground">
                    {(file.size / 1024).toFixed(1)} KB
                  </p>
                </div>
              ) : (
                <div className="space-y-2">
                  <Upload className="w-12 h-12 mx-auto text-muted-foreground" />
                  <p className="font-medium">Click to upload CSV</p>
                  <p className="text-sm text-muted-foreground">
                    or drag and drop
                  </p>
                </div>
              )}
            </div>

            {isImporting && (
              <div className="space-y-2">
                <Progress value={progress} />
                <p className="text-sm text-center text-muted-foreground">
                  Importing... {progress}%
                </p>
              </div>
            )}

            <Button 
              className="w-full" 
              onClick={handleImport}
              disabled={!file || isImporting}
            >
              {isImporting ? 'Importing...' : 'Start Import'}
            </Button>

            {result && (
              <div className="bg-muted p-4 rounded-lg space-y-2">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-green-600" />
                  <span className="font-medium">Import Complete</span>
                </div>
                <div className="grid grid-cols-3 gap-2 text-sm">
                  <div>
                    <p className="text-muted-foreground">Total</p>
                    <p className="font-medium">{result.total}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Imported</p>
                    <p className="font-medium text-green-600">{result.imported}</p>
                  </div>
                  <div>
                    <p className="text-muted-foreground">Skipped</p>
                    <p className="font-medium text-yellow-600">{result.skipped}</p>
                  </div>
                </div>
                {result.errors.length > 0 && (
                  <div className="mt-2 text-xs text-red-600">
                    {result.errors.slice(0, 3).map((e, idx) => (
                      <p key={idx}>Row {e.row}: {e.message}</p>
                    ))}
                    {result.errors.length > 3 && (
                      <p>...and {result.errors.length - 3} more errors</p>
                    )}
                  </div>
                )}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Preview</CardTitle>
            <CardDescription>First 5 rows from the uploaded file</CardDescription>
          </CardHeader>
          <CardContent>
            {preview.length > 0 ? (
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Timestamp</TableHead>
                      <TableHead>From</TableHead>
                      <TableHead>To</TableHead>
                      <TableHead>Duration</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {preview.map((row, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs">{row.timestamp}</TableCell>
                        <TableCell className="font-mono text-xs">{row.from}</TableCell>
                        <TableCell className="font-mono text-xs">{row.to}</TableCell>
                        <TableCell>{row.duration}s</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                Upload a file to see preview
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Import History</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>File</TableHead>
                <TableHead>Date</TableHead>
                <TableHead>Total</TableHead>
                <TableHead>Imported</TableHead>
                <TableHead>Skipped</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {imports.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                    No imports yet
                  </TableCell>
                </TableRow>
              ) : (
                imports.map((imp) => (
                  <TableRow key={imp.id}>
                    <TableCell className="font-mono text-sm">{imp.filename}</TableCell>
                    <TableCell>{new Date(imp.imported_at).toLocaleDateString()}</TableCell>
                    <TableCell>{imp.records_total}</TableCell>
                    <TableCell className="text-green-600">{imp.records_imported}</TableCell>
                    <TableCell className="text-yellow-600">{imp.records_skipped}</TableCell>
                    <TableCell>
                      {imp.errors ? (
                        <Badge variant="destructive">Errors</Badge>
                      ) : (
                        <Badge variant="default" className="bg-green-600">Complete</Badge>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>CSV Format Requirements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="bg-muted p-4 rounded-lg">
            <p className="font-medium mb-2">Required Columns:</p>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li><code>timestamp</code> - Call date/time (ISO 8601 or common formats)</li>
              <li><code>from</code> - Caller phone number (E.164 format preferred)</li>
              <li><code>to</code> - Destination phone number</li>
              <li><code>duration</code> - Call duration in seconds</li>
            </ul>
            <p className="font-medium mt-4 mb-2">Optional Columns:</p>
            <ul className="list-disc pl-4 space-y-1 text-sm">
              <li><code>agent</code> - Agent name who handled the call</li>
              <li><code>recording_url</code> - Link to call recording</li>
              <li><code>tags</code> - Any tags or notes</li>
            </ul>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
