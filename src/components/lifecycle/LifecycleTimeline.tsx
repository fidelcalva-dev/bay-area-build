import { useState, useEffect, useCallback } from 'react';
import {
  Check, Clock, AlertTriangle, Circle, Loader2,
  ChevronDown, ChevronUp, Building2, RefreshCw,
  StickyNote, ArrowRight
} from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
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
  formatDuration,
  getLiveDurationMinutes,
} from '@/lib/lifecycleService';
import { DepartmentBadge, SlaBadge, StageBadge, getSlaStatus } from './LifecycleBadges';
import { NextRequiredAction } from './NextRequiredAction';
import { LifecycleEventRow } from './LifecycleEventRow';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';

interface LifecycleTimelineProps {
  entityType: LifecycleEntityType;
  entityId: string;
  className?: string;
  compact?: boolean;
  showActions?: boolean;
  onNextAction?: (stageKey: string) => void;
}

function StageIcon({ status }: { status: 'completed' | 'active' | 'breached' | 'upcoming' }) {
  switch (status) {
    case 'completed':
      return (
        <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center">
          <Check className="w-3.5 h-3.5 text-white" />
        </div>
      );
    case 'active':
      return (
        <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center">
          <Clock className="w-3.5 h-3.5 text-primary-foreground" />
        </div>
      );
    case 'breached':
      return (
        <div className="w-6 h-6 rounded-full bg-destructive flex items-center justify-center">
          <AlertTriangle className="w-3.5 h-3.5 text-destructive-foreground" />
        </div>
      );
    case 'upcoming':
      return (
        <div className="w-6 h-6 rounded-full bg-muted flex items-center justify-center">
          <Circle className="w-2.5 h-2.5 text-muted-foreground" />
        </div>
      );
  }
}

export function LifecycleTimeline({
  entityType,
  entityId,
  className,
  compact = false,
  showActions = false,
  onNextAction,
}: LifecycleTimelineProps) {
  const [stages, setStages] = useState<LifecycleStage[]>([]);
  const [entity, setEntity] = useState<LifecycleEntity | null>(null);
  const [events, setEvents] = useState<LifecycleEvent[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showNoteInput, setShowNoteInput] = useState(false);
  const [noteText, setNoteText] = useState('');
  const [isAdvancing, setIsAdvancing] = useState(false);
  const [showAllStages, setShowAllStages] = useState(false);
  const [showAllEvents, setShowAllEvents] = useState(false);
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
        <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
      </div>
    );
  }

  // Determine current stage
  const currentStageIdx = entity
    ? stages.findIndex(s => s.stage_key === entity.current_stage_key)
    : -1;
  const completedStageKeys = new Set(
    events.filter(e => e.event_type === 'EXIT_STAGE').map(e => e.stage_key)
  );
  const currentStageDef = entity ? stages.find(s => s.stage_key === entity.current_stage_key) : null;
  const slaStatus = entity && currentStageDef
    ? getSlaStatus(entity.entered_stage_at, currentStageDef.sla_minutes)
    : 'on_track';

  // Next stages
  const nextStages = currentStageIdx >= 0
    ? stages.filter((_, i) => i > currentStageIdx).slice(0, 3)
    : [];

  // Events for recent activity
  const recentEvents = events.slice(0, showAllEvents ? 50 : 8);
  const stageNameMap = new Map(stages.map(s => [s.stage_key, s.stage_name]));

  return (
    <div className={cn('space-y-5', className)}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <h4 className="text-sm font-semibold flex items-center gap-2">
          <Building2 className="w-4 h-4 text-muted-foreground" />
          Lifecycle Timeline
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

      {/* === CURRENT STAGE === */}
      {entity && currentStageDef && (
        <div className={cn(
          'rounded-lg border p-4',
          slaStatus === 'breached' ? 'border-destructive/40 bg-destructive/[0.03]' :
          slaStatus === 'at_risk' ? 'border-amber-300/50 bg-amber-50/30' :
          'border-border bg-muted/20'
        )}>
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
            Current Stage
          </p>
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <StageIcon status={slaStatus === 'breached' ? 'breached' : 'active'} />
              <div>
                <p className="font-semibold text-sm">{currentStageDef.stage_name}</p>
                <div className="flex items-center gap-2 mt-0.5 flex-wrap">
                  <DepartmentBadge department={currentStageDef.department} />
                  {entity.owner_user_id && (
                    <span className="text-[10px] text-muted-foreground">
                      Owner: {entity.owner_user_id.slice(0, 8)}
                    </span>
                  )}
                  <span className="text-[10px] text-muted-foreground tabular-nums">
                    {formatDuration(getLiveDurationMinutes(entity.entered_stage_at))} in stage
                  </span>
                  <SlaBadge status={slaStatus} />
                </div>
              </div>
            </div>
            {currentStageDef.sla_minutes && (
              <div className="text-right text-xs text-muted-foreground">
                <p className="tabular-nums">SLA: {formatDuration(currentStageDef.sla_minutes)}</p>
              </div>
            )}
          </div>
        </div>
      )}

      {!entity && (
        <div className="text-center py-6 text-muted-foreground text-sm border rounded-lg bg-muted/10">
          No lifecycle tracking started
        </div>
      )}

      {/* === NEXT REQUIRED ACTION === */}
      {entity && currentStageDef && (
        <NextRequiredAction
          stageKey={entity.current_stage_key}
          onAction={onNextAction ? () => onNextAction(entity.current_stage_key) : undefined}
        />
      )}

      {/* Note input */}
      {showNoteInput && (
        <div className="flex gap-2">
          <Textarea
            placeholder="Add a note to the timeline..."
            value={noteText}
            onChange={e => setNoteText(e.target.value)}
            className="text-sm min-h-[56px]"
          />
          <div className="flex flex-col gap-1">
            <Button size="sm" onClick={handleAddNote} disabled={!noteText.trim()}>Add</Button>
            <Button size="sm" variant="ghost" onClick={() => { setShowNoteInput(false); setNoteText(''); }}>Cancel</Button>
          </div>
        </div>
      )}

      {/* === ADVANCE ACTIONS === */}
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

      <Separator />

      {/* === RECENT ACTIVITY === */}
      <div>
        <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground mb-2">
          Recent Activity
        </p>
        <ScrollArea className={compact ? 'max-h-[250px]' : 'max-h-[350px]'}>
          <div className="space-y-0.5">
            {recentEvents.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-4">No events recorded</p>
            ) : (
              recentEvents.map(ev => (
                <LifecycleEventRow
                  key={ev.id}
                  event={ev}
                  stageName={stageNameMap.get(ev.stage_key)}
                />
              ))
            )}
          </div>
          {events.length > 8 && !showAllEvents && (
            <Button
              variant="ghost"
              size="sm"
              className="w-full mt-2 text-xs"
              onClick={() => setShowAllEvents(true)}
            >
              Show all {events.length} events
              <ChevronDown className="w-3 h-3 ml-1" />
            </Button>
          )}
        </ScrollArea>
      </div>

      <Separator />

      {/* === STAGE PROGRESS === */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <p className="text-[10px] font-medium uppercase tracking-widest text-muted-foreground">
            Stage Progress
          </p>
          <Button
            variant="ghost"
            size="sm"
            className="h-6 text-[10px] px-1.5"
            onClick={() => setShowAllStages(!showAllStages)}
          >
            {showAllStages ? 'Collapse' : `All ${stages.length} stages`}
            {showAllStages ? <ChevronUp className="w-3 h-3 ml-0.5" /> : <ChevronDown className="w-3 h-3 ml-0.5" />}
          </Button>
        </div>

        <div className="space-y-0">
          {(showAllStages ? stages : stages.filter((s, idx) => {
            // Show completed, current, and next 2
            const isCompleted = completedStageKeys.has(s.stage_key);
            const isCurrent = entity?.current_stage_key === s.stage_key;
            return isCompleted || isCurrent || (idx <= currentStageIdx + 2 && idx >= currentStageIdx);
          })).map((stage, idx) => {
            const isCompleted = completedStageKeys.has(stage.stage_key);
            const isCurrent = entity?.current_stage_key === stage.stage_key;
            const status = isCurrent
              ? (slaStatus === 'breached' ? 'breached' : 'active')
              : isCompleted ? 'completed' : 'upcoming';

            return (
              <div key={stage.stage_key} className="flex items-center gap-3 py-1.5">
                <StageIcon status={status} />
                <span className={cn(
                  'text-xs',
                  status === 'upcoming' ? 'text-muted-foreground' :
                  status === 'breached' ? 'text-destructive font-semibold' :
                  status === 'active' ? 'font-semibold' : 'text-muted-foreground'
                )}>
                  {stage.stage_name}
                </span>
                <DepartmentBadge department={stage.department} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Summary footer */}
      {entity && (
        <div className="flex items-center gap-3 pt-2 border-t text-xs text-muted-foreground">
          <span className="tabular-nums">{completedStageKeys.size}/{stages.length} complete</span>
          <Separator orientation="vertical" className="h-3" />
          <span>
            Current: <strong className="text-foreground">{currentStageDef?.stage_name}</strong>
          </span>
        </div>
      )}
    </div>
  );
}

export default LifecycleTimeline;
