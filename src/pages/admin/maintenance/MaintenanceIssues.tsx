/**
 * Maintenance Issues List
 */
import { useState, useEffect } from 'react';
import { Loader2, AlertTriangle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import {
  getAllIssues, updateIssueStatus, createWorkOrder,
  type VehicleIssue, type IssueStatus
} from '@/lib/fleetService';
import { useToast } from '@/hooks/use-toast';

const SEVERITY_COLORS: Record<string, string> = {
  LOW: 'bg-green-100 text-green-800',
  MED: 'bg-yellow-100 text-yellow-800',
  HIGH: 'bg-orange-100 text-orange-800',
  SAFETY: 'bg-red-100 text-red-800',
};

const STATUS_COLORS: Record<string, string> = {
  OPEN: 'bg-blue-100 text-blue-800',
  IN_PROGRESS: 'bg-purple-100 text-purple-800',
  RESOLVED: 'bg-green-100 text-green-800',
  OUT_OF_SERVICE: 'bg-red-100 text-red-800',
};

export default function MaintenanceIssues() {
  const { toast } = useToast();
  const [issues, setIssues] = useState<VehicleIssue[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');

  useEffect(() => { load(); }, [statusFilter]);

  async function load() {
    setIsLoading(true);
    const data = await getAllIssues(statusFilter);
    setIssues(data);
    setIsLoading(false);
  }

  async function handleStatusChange(id: string, status: IssueStatus) {
    await updateIssueStatus(id, status);
    toast({ title: `Status updated to ${status}` });
    load();
  }

  async function handleCreateWO(issue: VehicleIssue) {
    await createWorkOrder({ truckId: issue.truck_id, issueId: issue.id, notes: `From issue: ${issue.description}` });
    toast({ title: 'Work order created ✓' });
  }

  if (isLoading) return <div className="flex justify-center py-8"><Loader2 className="w-6 h-6 animate-spin" /></div>;

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-3">
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-48"><SelectValue placeholder="Filter status" /></SelectTrigger>
          <SelectContent>
            <SelectItem value="ALL">All Statuses</SelectItem>
            <SelectItem value="OPEN">Open</SelectItem>
            <SelectItem value="IN_PROGRESS">In Progress</SelectItem>
            <SelectItem value="OUT_OF_SERVICE">Out of Service</SelectItem>
            <SelectItem value="RESOLVED">Resolved</SelectItem>
          </SelectContent>
        </Select>
        <span className="text-sm text-muted-foreground">{issues.length} issues</span>
      </div>

      {issues.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">No issues found</div>
      ) : (
        <div className="space-y-3">
          {issues.map(issue => (
            <div key={issue.id} className="border rounded-lg p-4 space-y-2 hover:bg-muted/30">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-muted-foreground" />
                  <span className="font-bold">#{issue.trucks?.truck_number || '?'}</span>
                  <Badge className={cn('text-xs', SEVERITY_COLORS[issue.severity])}>{issue.severity}</Badge>
                  <Badge className={cn('text-xs', STATUS_COLORS[issue.status])}>{issue.status.replace(/_/g, ' ')}</Badge>
                  <Badge variant="outline" className="text-xs">{issue.issue_category}</Badge>
                </div>
                <span className="text-xs text-muted-foreground">{format(new Date(issue.created_at), 'MMM d, h:mm a')}</span>
              </div>
              <p className="text-sm">{issue.description || '—'}</p>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <span>Reported by: {issue.drivers?.name || 'Unknown'}</span>
              </div>
              <div className="flex gap-2 mt-2">
                {issue.status === 'OPEN' && (
                  <>
                    <Button size="sm" variant="outline" onClick={() => handleStatusChange(issue.id, 'IN_PROGRESS')}>Start</Button>
                    <Button size="sm" variant="outline" onClick={() => handleCreateWO(issue)}>Create Work Order</Button>
                  </>
                )}
                {issue.status === 'IN_PROGRESS' && (
                  <Button size="sm" onClick={() => handleStatusChange(issue.id, 'RESOLVED')}>Resolve</Button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
