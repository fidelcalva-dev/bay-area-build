import { useState, useEffect } from 'react';
import {
  Check, Clock, AlertTriangle, Circle, Loader2,
  ChevronDown, ChevronUp, User, Building2, Zap, RefreshCw
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import {
  type LifecycleEntityType,
  type LifecycleDepartment,
  type StageHistoryRecord,
  getEntityStageHistory,
  getStageLabel,
  getDepartmentColor,
  formatDuration,
  getLiveDurationMinutes,
  LIFECYCLE_STAGES,
} from '@/lib/lifecycleService';

interface LifecycleTimelineProps {
  entityType: LifecycleEntityType;
  entityId: string;
  className?: string;
  compact?: boolean;
  onTransition?: (toStage: string) => void;
  showActions?: boolean;
}

const TRIGGER_ICONS: Record<string, React.ReactNode> = {
  MANUAL: <User className="w-3 h-3" />,
  SYSTEM: <Zap className="w-3 h-3" />,
  AUTOMATION: <Zap className="w-3 h-3" />,
  WEBHOOK: <Zap className="w-3 h-3" />,
  CRON: <Clock className="w-3 h-3" />,
};

function StageIcon({ status }: { status: 'completed' | 'active' | 'breached' | 'upcoming' }) {
  switch (status) {
    case 'completed':
      return (
        <div className="w-7 h-7 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-4 h-4 text-white" />
        </div>
      );
    case 'active':
      return (
        <div className="w-7 h-7 rounded-full bg-primary flex items-center justify-center animate-pulse">
          <Clock className="w-4 h-4 text-primary-foreground" />
        </div>
      );
    case 'breached':
      return (
        <div className="w-7 h-7 rounded-full bg-destructive flex items-center justify-center">
          <AlertTriangle className="w-4 h-4 text-destructive-foreground" />
        </div>
      );
    case 'upcoming':
      return (
        <div className="w-7 h-7 rounded-full bg-muted flex items-center justify-center">
          <Circle className="w-3 h-3 text-muted-foreground" />
        </div>
      );
  }
}

function getRecordStatus(record: StageHistoryRecord): 'completed' | 'active' | 'breached' {
  if (record.exited_at) return 'completed';
  if (record.is_sla_breached || (record.sla_deadline_at && new Date(record.sla_deadline_at) < new Date())) {
    return 'breached';
  }
  return 'active';
}

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 1) return `${Math.round(diffH * 60)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

export function LifecycleTimeline({
  entityType,
  entityId,
  className,
  compact = false,
  onTransition,
  showActions = false,
}: LifecycleTimelineProps) {
  const [history, setHistory] = useState<StageHistoryRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const stages = LIFECYCLE_STAGES[entityType] || [];

  async function loadHistory() {
    setIsLoading(true);
    const data = await getEntityStageHistory(entityType, entityId);
    setHistory(data);
    setIsLoading(false);
  }

  useEffect(() => {
    if (entityId) loadHistory();
  }, [entityType, entityId]);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Build merged view: real history + upcoming stages
  const currentStage = history.find(h => !h.exited_at);
  const completedStages = history.filter(h => h.exited_at);
  const currentStageIndex = currentStage
    ? stages.findIndex(s => s.stage === currentStage.to_stage)
    : completedStages.length > 0
      ? stages.findIndex(s => s.stage === completedStages[completedStages.length - 1].to_stage) + 1
      : -1;

  // Build timeline items
  type TimelineItem = {
    key: string;
    stage: string;
    label: string;
    department: LifecycleDepartment;
    status: 'completed' | 'active' | 'breached' | 'upcoming';
    record?: StageHistoryRecord;
    duration?: string;
    timestamp?: string;
  };

  const items: TimelineItem[] = stages.map((stageDef, idx) => {
    const record = history.find(h => h.to_stage === stageDef.stage);

    if (record) {
      const status = getRecordStatus(record);
      const dur = record.duration_minutes
        ? formatDuration(record.duration_minutes)
        : !record.exited_at
          ? formatDuration(getLiveDurationMinutes(record.entered_at))
          : undefined;

      return {
        key: record.id,
        stage: stageDef.stage,
        label: stageDef.label,
        department: record.department || stageDef.department,
        status,
        record,
        duration: dur,
        timestamp: record.entered_at,
      };
    }

    return {
      key: `upcoming-${stageDef.stage}`,
      stage: stageDef.stage,
      label: stageDef.label,
      department: stageDef.department,
      status: 'upcoming' as const,
    };
  });

  return (
    <div className={cn('space-y-3', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Lifecycle — {entityType}
        </h4>
        <Button variant="ghost" size="sm" onClick={loadHistory} className="h-7 w-7 p-0">
          <RefreshCw className="w-3.5 h-3.5" />
        </Button>
      </div>

      {/* Timeline */}
      <div className="relative">
        {items.map((item, idx) => {
          const isLast = idx === items.length - 1;
          const isExpanded = expandedId === item.key;

          return (
            <div key={item.key} className={cn('relative flex gap-3', !isLast && (compact ? 'pb-3' : 'pb-5'))}>
              {/* Vertical line */}
              {!isLast && (
                <div
                  className={cn(
                    'absolute left-[13px] top-7 w-0.5 bottom-0',
                    item.status === 'completed' ? 'bg-emerald-300' :
                    item.status === 'active' ? 'bg-primary/40' :
                    item.status === 'breached' ? 'bg-destructive/40' :
                    'bg-border'
                  )}
                />
              )}

              {/* Icon */}
              <div className="relative z-10 shrink-0">
                <StageIcon status={item.status} />
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={cn(
                      'text-sm',
                      item.status === 'upcoming' ? 'text-muted-foreground' : 'font-medium',
                      item.status === 'breached' && 'text-destructive font-semibold'
                    )}>
                      {item.label}
                    </span>
                    <Badge
                      variant="outline"
                      className={cn('text-[10px] px-1.5 py-0', getDepartmentColor(item.department))}
                    >
                      {item.department}
                    </Badge>
                    {item.status === 'breached' && (
                      <Badge variant="destructive" className="text-[10px] px-1.5 py-0">
                        SLA BREACHED
                      </Badge>
                    )}
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    {item.duration && (
                      <span className={cn(
                        'text-xs',
                        item.status === 'breached' ? 'text-destructive font-medium' : 'text-muted-foreground'
                      )}>
                        {item.duration}
                      </span>
                    )}
                    {item.timestamp && (
                      <span className="text-xs text-muted-foreground">
                        {formatTimestamp(item.timestamp)}
                      </span>
                    )}
                  </div>
                </div>

                {/* Expandable details */}
                {item.record && (
                  <div className="mt-1">
                    <button
                      className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1"
                      onClick={() => setExpandedId(isExpanded ? null : item.key)}
                    >
                      {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      Details
                    </button>

                    {isExpanded && (
                      <div className="mt-2 p-2.5 bg-muted/50 rounded-md text-xs space-y-1.5">
                        {item.record.assigned_user_email && (
                          <div className="flex items-center gap-1.5">
                            <User className="w-3 h-3 text-muted-foreground" />
                            <span>{item.record.assigned_user_email}</span>
                          </div>
                        )}
                        <div className="flex items-center gap-1.5">
                          {TRIGGER_ICONS[item.record.trigger_type]}
                          <span className="capitalize">{item.record.trigger_type.toLowerCase()}</span>
                        </div>
                        {item.record.notes && (
                          <p className="text-muted-foreground">{item.record.notes}</p>
                        )}
                        {item.record.sla_deadline_at && (
                          <p className="text-muted-foreground">
                            SLA deadline: {new Date(item.record.sla_deadline_at).toLocaleString()}
                          </p>
                        )}
                        {item.record.from_stage && (
                          <p className="text-muted-foreground">
                            From: {getStageLabel(entityType, item.record.from_stage)}
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* Action buttons for advancing stage */}
                {showActions && item.status === 'active' && onTransition && (
                  <div className="mt-2 flex gap-1.5 flex-wrap">
                    {stages
                      .filter((_, i) => i > (stages.findIndex(s => s.stage === item.stage)))
                      .slice(0, 2)
                      .map(nextStage => (
                        <Button
                          key={nextStage.stage}
                          variant="outline"
                          size="sm"
                          className="h-6 text-xs"
                          onClick={() => onTransition(nextStage.stage)}
                        >
                          → {nextStage.label}
                        </Button>
                      ))}
                  </div>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Summary bar */}
      {history.length > 0 && (
        <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
          <span>{completedStages.length}/{stages.length} stages complete</span>
          {currentStage && (
            <span>
              Current: <strong className="text-foreground">{getStageLabel(entityType, currentStage.to_stage)}</strong>
            </span>
          )}
          {history.some(h => !h.exited_at && h.sla_deadline_at && new Date(h.sla_deadline_at) < new Date()) && (
            <Badge variant="destructive" className="text-[10px]">SLA Alert</Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default LifecycleTimeline;
