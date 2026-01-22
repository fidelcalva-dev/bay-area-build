import { useState, useEffect } from 'react';
import { History, RotateCcw, ChevronDown, ChevronUp, User, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';
import { getVersionHistory, rollbackToVersion, type ConfigVersion } from '@/lib/configVersioning';
import { useAdminPermissions } from '@/hooks/useAdminPermissions';
import type { AdminModule } from '@/hooks/useAdminPermissions';

interface VersionHistoryProps {
  module: AdminModule;
  entityId?: string;
  onRollback?: () => void;
}

export function VersionHistory({ module, entityId, onRollback }: VersionHistoryProps) {
  const [versions, setVersions] = useState<ConfigVersion[]>([]);
  const [isOpen, setIsOpen] = useState(false);
  const [expandedVersion, setExpandedVersion] = useState<string | null>(null);
  const [rollbackTarget, setRollbackTarget] = useState<ConfigVersion | null>(null);
  const [rollbackReason, setRollbackReason] = useState('');
  const [isRollingBack, setIsRollingBack] = useState(false);
  const { toast } = useToast();
  const { isSystemAdmin } = useAdminPermissions();

  useEffect(() => {
    if (isOpen) {
      loadVersions();
    }
  }, [isOpen, module, entityId]);

  async function loadVersions() {
    const history = await getVersionHistory(module, entityId);
    setVersions(history);
  }

  async function handleRollback() {
    if (!rollbackTarget || !rollbackReason.trim()) return;

    setIsRollingBack(true);
    const result = await rollbackToVersion(rollbackTarget.id, rollbackReason);
    setIsRollingBack(false);

    if (result.success) {
      toast({ title: 'Rollback successful', description: 'Configuration has been restored.' });
      setRollbackTarget(null);
      setRollbackReason('');
      loadVersions();
      onRollback?.();
    } else {
      toast({ title: 'Rollback failed', description: result.error, variant: 'destructive' });
    }
  }

  const getStatusBadge = (status: ConfigVersion['status']) => {
    const variants: Record<string, { variant: 'default' | 'secondary' | 'destructive' | 'outline'; label: string }> = {
      applied: { variant: 'default', label: 'Applied' },
      proposed: { variant: 'secondary', label: 'Proposed' },
      approved: { variant: 'outline', label: 'Approved' },
      rejected: { variant: 'destructive', label: 'Rejected' },
      rolled_back: { variant: 'secondary', label: 'Rolled Back' },
    };
    const config = variants[status] || variants.applied;
    return <Badge variant={config.variant}>{config.label}</Badge>;
  };

  return (
    <Card>
      <Collapsible open={isOpen} onOpenChange={setIsOpen}>
        <CollapsibleTrigger asChild>
          <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <History className="w-5 h-5 text-muted-foreground" />
                <div>
                  <CardTitle className="text-base">Version History</CardTitle>
                  <CardDescription>View and rollback configuration changes</CardDescription>
                </div>
              </div>
              {isOpen ? <ChevronUp className="w-5 h-5" /> : <ChevronDown className="w-5 h-5" />}
            </div>
          </CardHeader>
        </CollapsibleTrigger>

        <CollapsibleContent>
          <CardContent className="pt-0">
            {versions.length === 0 ? (
              <p className="text-muted-foreground text-sm py-4 text-center">
                No version history available
              </p>
            ) : (
              <div className="space-y-3">
                {versions.map((version) => (
                  <div
                    key={version.id}
                    className="border rounded-lg p-3 hover:bg-muted/30 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          {getStatusBadge(version.status)}
                          {version.isCritical && (
                            <Badge variant="destructive" className="text-xs">Critical</Badge>
                          )}
                        </div>
                        <p className="text-sm font-medium">{version.reasonNote}</p>
                        <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1">
                            <User className="w-3 h-3" />
                            {version.proposedByEmail || 'Unknown'}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="w-3 h-3" />
                            {format(new Date(version.createdAt), 'MMM d, yyyy h:mm a')}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setExpandedVersion(
                            expandedVersion === version.id ? null : version.id
                          )}
                        >
                          {expandedVersion === version.id ? 'Hide' : 'Details'}
                        </Button>

                        {isSystemAdmin() && version.status === 'applied' && version.beforeData && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRollbackTarget(version)}
                          >
                            <RotateCcw className="w-3 h-3 mr-1" />
                            Rollback
                          </Button>
                        )}
                      </div>
                    </div>

                    {expandedVersion === version.id && (
                      <div className="mt-3 pt-3 border-t grid md:grid-cols-2 gap-4">
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">Before</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(version.beforeData, null, 2) || 'N/A'}
                          </pre>
                        </div>
                        <div>
                          <p className="text-xs font-medium text-muted-foreground mb-1">After</p>
                          <pre className="text-xs bg-muted p-2 rounded overflow-auto max-h-40">
                            {JSON.stringify(version.afterData, null, 2)}
                          </pre>
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </CollapsibleContent>
      </Collapsible>

      <AlertDialog open={!!rollbackTarget} onOpenChange={() => setRollbackTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirm Rollback</AlertDialogTitle>
            <AlertDialogDescription>
              This will restore the configuration to the state before this change was made.
              Please provide a reason for the rollback.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <Textarea
            placeholder="Reason for rollback..."
            value={rollbackReason}
            onChange={(e) => setRollbackReason(e.target.value)}
          />
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleRollback}
              disabled={!rollbackReason.trim() || isRollingBack}
            >
              {isRollingBack ? 'Rolling back...' : 'Confirm Rollback'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
}
