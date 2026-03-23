import { useQuery } from '@tanstack/react-query';
import { History, Loader2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { fetchPricingAuditLog, fetchPricingVersions } from '@/lib/pricingCatalogService';
import { format } from 'date-fns';

export default function PricingAuditLogPanel() {
  const { data: auditLog = [], isLoading: loadingLog } = useQuery({
    queryKey: ['pricing-audit-log'],
    queryFn: () => fetchPricingAuditLog(100),
  });

  const { data: versions = [], isLoading: loadingVersions } = useQuery({
    queryKey: ['pricing-versions'],
    queryFn: fetchPricingVersions,
  });

  if (loadingLog || loadingVersions) {
    return <div className="flex items-center justify-center py-20"><Loader2 className="w-8 h-8 animate-spin text-primary" /></div>;
  }

  const publishedVersion = versions.find(v => v.status === 'published');

  return (
    <div className="p-6 space-y-6">
      <div>
        <h2 className="text-xl font-bold text-foreground flex items-center gap-2">
          <History className="w-5 h-5 text-primary" />
          Pricing Audit Log & Versions
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          Full change history for all pricing configuration edits.
        </p>
      </div>

      {/* Current Version */}
      {publishedVersion && (
        <Card className="border-emerald-200 dark:border-emerald-800">
          <CardContent className="pt-4 pb-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-foreground">Current Published Version</p>
                <p className="text-xs text-muted-foreground mt-0.5">{publishedVersion.notes}</p>
              </div>
              <div className="flex items-center gap-2">
                <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900 dark:text-emerald-200">
                  {publishedVersion.version_code}
                </Badge>
                {publishedVersion.published_at && (
                  <span className="text-xs text-muted-foreground">
                    {format(new Date(publishedVersion.published_at), 'MMM d, yyyy')}
                  </span>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Versions */}
      {versions.length > 0 && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base">Version History</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {versions.map(v => (
                <div key={v.id} className="flex items-center justify-between p-3 bg-muted rounded-lg">
                  <div className="flex items-center gap-3">
                    <Badge variant={v.status === 'published' ? 'default' : 'outline'}>
                      {v.version_code}
                    </Badge>
                    <span className="text-xs text-muted-foreground">{v.notes || 'No notes'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Badge variant="secondary" className="text-xs capitalize">{v.status}</Badge>
                    <span className="text-xs text-muted-foreground">
                      {format(new Date(v.created_at), 'MMM d, yyyy HH:mm')}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Audit Log */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base">Change Log</CardTitle>
          <CardDescription>
            {auditLog.length === 0 ? 'No changes recorded yet.' : `${auditLog.length} changes recorded`}
          </CardDescription>
        </CardHeader>
        {auditLog.length > 0 && (
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>When</TableHead>
                  <TableHead>Who</TableHead>
                  <TableHead>Area</TableHead>
                  <TableHead>Field</TableHead>
                  <TableHead className="text-right">Old</TableHead>
                  <TableHead className="text-right">New</TableHead>
                  <TableHead>Reason</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {auditLog.map(entry => (
                  <TableRow key={entry.id}>
                    <TableCell className="text-xs text-muted-foreground whitespace-nowrap">
                      {format(new Date(entry.changed_at), 'MMM d HH:mm')}
                    </TableCell>
                    <TableCell className="text-xs">{entry.changed_by_email || 'System'}</TableCell>
                    <TableCell>
                      <Badge variant="outline" className="text-[10px]">{entry.config_area}</Badge>
                    </TableCell>
                    <TableCell className="text-xs font-mono">{entry.field_name}</TableCell>
                    <TableCell className="text-right text-xs font-mono text-muted-foreground">{entry.old_value || '—'}</TableCell>
                    <TableCell className="text-right text-xs font-mono font-semibold">{entry.new_value || '—'}</TableCell>
                    <TableCell className="text-xs text-muted-foreground max-w-32 truncate">{entry.change_reason || '—'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        )}
      </Card>
    </div>
  );
}
