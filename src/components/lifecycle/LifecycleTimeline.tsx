import { useState, useEffect, useCallback } from 'react';
import {
  Check, Clock, AlertTriangle, Circle, Loader2,
  ChevronDown, ChevronUp, User, Building2, Zap, RefreshCw,
  StickyNote, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { cn } from '@/lib/utils';
import {
  type LifecycleEntityType,
  type LifecycleStage,
  type LifecycleEntity,
  type LifecycleEvent,
  getAllStages,
  getEntityState,
  getEntityEvents,
  advanceStage,
  addLifecycleNote,
  getDepartmentColor,
  formatDuration,
  getLiveDurationMinutes,
} from '@/lib/lifecycleService';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LifecycleTimelineProps {
  entityType: LifecycleEntityType;
  entityId: string;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
}

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
  showActions = false,
}: LifecycleTimelineProps) {
  const [stages, setStages] = useState<LifecycleStage[]>([]);
  const [entity, setEntity] = useState<LifecycleEntity | null>(null);
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);
  const { toast } = useToast();

  const loadData = useCallback(async () => {
    setIsLoading(true);
    const [allStages, entityState, entityEvents] = await Promise.all([
      getAllStages(),
      getEntityState(entityType, entityId),
      getEntityEvents(entityType, entityId),
    ]);
    setStages(allStages);
    setEntity(entityState);
    setEvents(entityEvents);
    setIsLoading(false);
  }, [entityType, entityId]);

  useEffect(() => {
    if (entityId) loadData();
  }, [entityType, entityId, loadData]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel(`lifecycle-${entityType}-${entityId}`)
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'lifecycle_entities',
        filter: `entity_id=eq.${entityId}`,
      }, () => loadData())
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'lifecycle_events',
        filter: `entity_id=eq.${entityId}`,
      }, () => loadData())
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [entityType, entityId, loadData]);

  const handleAdvance = async (toStageKey: string) => {
    setIsAdvancing(true);
    const { data: { user } } = await supabase.auth.getUser();
    const result = await advanceStage({
      entityType,
      entityId,
      toStageKey,
      performedByUserId: user?.id,
      performedByRole: 'staff',
      eventType: 'MANUAL_MOVE',
    });
    setIsAdvancing(false);
    if (result.success) {
      toast({ title: `Advanced to ${stages.find(s => s.stage_key === toStageKey)?.stage_name || toStageKey}` });
      loadData();
    } else {
      toast({ title: 'Failed to advance stage', description: result.error, variant: 'destructive' });
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim() || !entity) return;
    const { data: { user } } = await supabase.auth.getUser();
    const result = await addLifecycleNote({
      entityType,
      entityId,
      stageKey: entity.current_stage_key,
      department: entity.current_department,
      notes: noteText.trim(),
      performedByUserId: user?.id,
    });
    if (result.success) {
      toast({ title: 'Note added' });
      setNoteText('');
      setShowNoteInput(false);
      loadData();
    } else {
      toast({ title: 'Failed to add note', variant: 'destructive' });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine current stage index
  const currentStageIdx = entity
    ? stages.findIndex(s => s.stage_key === entity.current_stage_key)
    : -1;

  // Build completed stage keys from events
  const completedStageKeys = new Set(
    events.filter(e => e.event_type === 'EXIT_STAGE').map(e => e.stage_key)
  );

  // Get SLA info
  const currentStageDef = entity ? stages.find(s => s.stage_key === entity.current_stage_key) : null;
  const isBreached = entity && currentStageDef?.sla_minutes
    ? getLiveDurationMinutes(entity.entered_stage_at) > currentStageDef.sla_minutes
    : false;

  // Get next available stages for advancing
  const nextStages = currentStageIdx >= 0
    ? stages.filter((_, i) => i > currentStageIdx).slice(0, 3)
    : [];

  // Group events by type for recent activity
  const recentNotes = events.filter(e => e.event_type === 'NOTE').slice(0, 5);
  const recentTransitions = events.filter(e => e.event_type === 'ENTER_STAGE' || e.event_type === 'AUTO_TRIGGER').slice(0, 10);

  return (
    <div className={cn('space-y-4', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Lifecycle — {entityType}
        </h4>
        <div className="flex gap-1">
          {showActions && (
            <Button variant="ghost" size="sm" className="h-7 px-2 text-xs" onClick={() => setShowNoteInput(!showNoteInput)}>
              <StickyNote className="w-3.5 h-3.5 mr-1" /> Note
            </Button>
          )}
          <Button variant="ghost" size="sm" onClick={loadData} className="h-7 w-7 p-0">
            <RefreshCw className="w-3.5 h-3.5" />
          </Button>
        </div>
      </div>

      {/* Current status badge */}
      {entity && currentStageDef && (
        <div className={cn(
          'flex items-center justify-between p-3 rounded-lg border',
          isBreached ? 'border-destructive/50 bg-destructive/5' : 'border-border bg-muted/30'
        )}>
          <div className="flex items-center gap-3">
            <StageIcon status={isBreached ? 'breached' : 'active'} />
            <div>
              <div className="font-medium text-sm">{currentStageDef.stage_name}</div>
              <div className="flex items-center gap-2 text-xs text-muted-foreground">
                <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getDepartmentColor(currentStageDef.department))}>
                  {currentStageDef.department}
                </Badge>
                <span>{formatDuration(getLiveDurationMinutes(entity.entered_stage_at))} in stage</span>
                {isBreached && (
                  <Badge variant="destructive" className="text-[10px] px-1.5 py-0">SLA BREACHED</Badge>
                )}
              </div>
            </div>
          </div>
          {currentStageDef.sla_minutes && (
            <div className="text-xs text-muted-foreground text-right">
              SLA: {formatDuration(currentStageDef.sla_minutes)}
            </div>
          )}
        </div>
      )}

      {!entity && (
        <div className="text-center py-4 text-muted-foreground text-sm">
          No lifecycle tracking started yet
        </div>
      )}

      {/* Note input */}
      {showNoteInput && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a note to the timeline..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            className="text-sm min-h-[60px]"
          />
          <div className="flex flex-col gap-1">
            <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowNoteInput(false); setNoteText(''); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* Next stage actions */}
      {showActions && nextStages.length > 0 && (
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs text-muted-foreground">Advance to:</span>
          {nextStages.map(s => (
            <Button
              key={s.stage_key}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              disabled={isAdvancing}
              onClick={() => handleAdvance(s.stage_key)}
            >
              <ArrowRight className="w-3 h-3 mr-1" />
              {s.stage_name}
            </Button>
          ))}
        </div>
      )}

      {/* Stage progress */}
      <ScrollArea className={compact ? 'max-h-[300px]' : 'max-h-[500px]'}>
        <div className="relative">
          {stages.map((stage, idx) => {
            const isCompleted = completedStageKeys.has(stage.stage_key);
            const isCurrent = entity?.current_stage_key === stage.stage_key;
            const isUpcoming = !isCompleted && !isCurrent;
            const status = isCurrent
              ? (isBreached ? 'breached' : 'active')
              : isCompleted
                ? 'completed'
                : 'upcoming';

            const isLast = idx === stages.length - 1;
            const isExpanded = expandedId === stage.stage_key;
            const stageEvents = events.filter(e => e.stage_key === stage.stage_key);

            return (
              <div key={stage.stage_key} className={cn('relative flex gap-3', !isLast && (compact ? 'pb-2' : 'pb-4'))}>
                {/* Vertical line */}
                {!isLast && (
                  <div className={cn(
                    'absolute left-[13px] top-7 w-0.5 bottom-0',
                    isCompleted ? 'bg-emerald-300' :
                    isCurrent ? (isBreached ? 'bg-destructive/40' : 'bg-primary/40') :
                    'bg-border'
                  )} />
                )}

                {/* Icon */}
                <div className="relative z-10 shrink-0">
                  <StageIcon status={status} />
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={cn(
                        'text-sm',
                        isUpcoming ? 'text-muted-foreground' : 'font-medium',
                        status === 'breached' && 'text-destructive font-semibold'
                      )}>
                        {stage.stage_name}
                      </span>
                      <Badge variant="outline" className={cn('text-[10px] px-1.5 py-0', getDepartmentColor(stage.department))}>
                        {stage.department}
                      </Badge>
                    </div>
                    {stageEvents.length > 0 && (
                      <button
                        className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-0.5"
                        onClick={() => setExpandedId(isExpanded ? null : stage.stage_key)}
                      >
                        {stageEvents.length} event{stageEvents.length > 1 ? 's' : ''}
                        {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                      </button>
                    )}
                  </div>

                  {/* Expanded event list */}
                  {isExpanded && stageEvents.length > 0 && (
                    <div className="mt-2 space-y-1.5">
                      {stageEvents.map(ev => (
                        <div key={ev.id} className="p-2 bg-muted/50 rounded text-xs space-y-0.5">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-1.5">
                              {ev.event_type === 'NOTE' ? <StickyNote className="w-3 h-3" /> :
                               ev.event_type === 'AUTO_TRIGGER' ? <Zap className="w-3 h-3" /> :
                               <User className="w-3 h-3" />}
                              <span className="font-medium capitalize">{ev.event_type.toLowerCase().replace('_', ' ')}</span>
                            </div>
                            <span className="text-muted-foreground">{formatTimestamp(ev.created_at)}</span>
                          </div>
                          {ev.notes && <p className="text-muted-foreground">{ev.notes}</p>}
                          {ev.performed_by_role && (
                            <p className="text-muted-foreground">By: {ev.performed_by_role}</p>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </ScrollArea>

      {/* Summary */}
      {entity && (
        <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
          <span>{completedStageKeys.size}/{stages.length} stages complete</span>
          <span>
            Current: <strong className="text-foreground">{currentStageDef?.stage_name}</strong>
          </span>
          {isBreached && (
            <Badge variant="destructive" className="text-[10px]">SLA Alert</Badge>
          )}
        </div>
      )}
    </div>
  );
}

export default LifecycleTimeline;
