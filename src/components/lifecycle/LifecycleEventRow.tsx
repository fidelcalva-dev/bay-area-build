import { useState } from 'react';
import { StickyNote, Zap, User, ArrowRight, ChevronDown, ChevronUp, Copy } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { DepartmentBadge } from './LifecycleBadges';
import type { LifecycleEvent } from '@/lib/lifecycleService';
import { useToast } from '@/hooks/use-toast';

function formatTimestamp(ts: string): string {
  const d = new Date(ts);
  const now = new Date();
  const diffH = (now.getTime() - d.getTime()) / 3600000;
  if (diffH < 1) return `${Math.round(diffH * 60)}m ago`;
  if (diffH < 24) return `${Math.round(diffH)}h ago`;
  return d.toLocaleDateString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' });
}

const EVENT_ICONS: Record<string, React.ReactNode> = {
  ENTER_STAGE: <ArrowRight className="w-3 h-3" />,
  EXIT_STAGE: <ArrowRight className="w-3 h-3 rotate-180" />,
  NOTE: <StickyNote className="w-3 h-3" />,
  AUTO_TRIGGER: <Zap className="w-3 h-3" />,
  MANUAL_MOVE: <User className="w-3 h-3" />,
  SLA_BREACH: <Zap className="w-3 h-3 text-destructive" />,
};

const EVENT_LABELS: Record<string, string> = {
  ENTER_STAGE: 'Entered Stage',
  EXIT_STAGE: 'Exited Stage',
  NOTE: 'Note',
  AUTO_TRIGGER: 'Auto Trigger',
  MANUAL_MOVE: 'Manual Move',
  SLA_BREACH: 'SLA Breach',
};

interface LifecycleEventRowProps {
  event: LifecycleEvent;
  stageName?: string;
}

export function LifecycleEventRow({ event, stageName }: LifecycleEventRowProps) {
  const [expanded, setExpanded] = useState(false);
  const { toast } = useToast();

  const copySummary = () => {
    const summary = `[${new Date(event.created_at).toLocaleString()}] ${EVENT_LABELS[event.event_type] || event.event_type} — ${stageName || event.stage_key}${event.notes ? ` — ${event.notes}` : ''}${event.performed_by_role ? ` (by ${event.performed_by_role})` : ''}`;
    navigator.clipboard.writeText(summary);
    toast({ title: 'Copied to clipboard' });
  };

  return (
    <div className="flex items-start gap-3 py-2 px-3 rounded-lg hover:bg-muted/40 transition-colors text-sm group">
      {/* Timestamp */}
      <span className="text-xs text-muted-foreground whitespace-nowrap min-w-[70px] pt-0.5">
        {formatTimestamp(event.created_at)}
      </span>

      {/* Icon + Event Type */}
      <div className="flex items-center gap-1.5 min-w-[100px]">
        <span className="text-muted-foreground">{EVENT_ICONS[event.event_type] || <User className="w-3 h-3" />}</span>
        <span className="font-medium text-xs">{EVENT_LABELS[event.event_type] || event.event_type}</span>
      </div>

      {/* Stage */}
      <DepartmentBadge department={event.department} />

      {/* User */}
      <span className="text-xs text-muted-foreground min-w-[60px]">
        {event.performed_by_role || 'System'}
      </span>

      {/* Notes (collapsed by default) */}
      <div className="flex-1 min-w-0">
        {event.notes ? (
          <button
            className="text-xs text-left text-muted-foreground hover:text-foreground truncate max-w-full flex items-center gap-1"
            onClick={() => setExpanded(!expanded)}
          >
            {expanded ? <ChevronUp className="w-3 h-3 flex-shrink-0" /> : <ChevronDown className="w-3 h-3 flex-shrink-0" />}
            <span className={cn(!expanded && 'truncate')}>{event.notes}</span>
          </button>
        ) : null}
        {expanded && event.notes && (
          <p className="text-xs text-muted-foreground mt-1 whitespace-pre-wrap">{event.notes}</p>
        )}
      </div>

      {/* Copy */}
      <Button
        variant="ghost"
        size="sm"
        className="h-6 w-6 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
        onClick={copySummary}
        title="Copy summary"
      >
        <Copy className="w-3 h-3" />
      </Button>
    </div>
  );
}
