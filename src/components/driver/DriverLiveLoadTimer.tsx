/**
 * Driver Live Load Timer — 30 min included, then $180/hr increments
 * Saves minutes + extra charge as run_event
 */
import { useState, useEffect, useRef } from 'react';
import { X, Timer, Play, Square, DollarSign, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { cn } from '@/lib/utils';

interface DriverLiveLoadTimerProps {
  runId: string;
  userId: string;
  onClose: () => void;
}

const INCLUDED_MINUTES = 30;
const HOURLY_RATE = 180;
const APPROVAL_THRESHOLD = 250; // dollars

export function DriverLiveLoadTimer({ runId, userId, onClose }: DriverLiveLoadTimerProps) {
  const [isRunning, setIsRunning] = useState(false);
  const [elapsedSeconds, setElapsedSeconds] = useState(0);
  const [saved, setSaved] = useState(false);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, []);

  function start() {
    setIsRunning(true);
    intervalRef.current = setInterval(() => {
      setElapsedSeconds(prev => prev + 1);
    }, 1000);
  }

  function stop() {
    setIsRunning(false);
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }

  const totalMinutes = Math.ceil(elapsedSeconds / 60);
  const overageMinutes = Math.max(0, totalMinutes - INCLUDED_MINUTES);
  const extraCharge = Math.ceil(overageMinutes / 60) * HOURLY_RATE;
  // More granular: 15-min increments
  const incrementCharge = Math.ceil(overageMinutes / 15) * (HOURLY_RATE / 4);
  const finalCharge = incrementCharge;
  const needsApproval = finalCharge > APPROVAL_THRESHOLD;

  function formatTime(seconds: number): string {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  }

  async function saveTimer() {
    try {
      await supabase.from('run_events' as 'orders').insert({
        run_id: runId,
        event_type: 'LIVE_LOAD_COMPLETED',
        actor_id: userId,
        metadata: {
          total_minutes: totalMinutes,
          included_minutes: INCLUDED_MINUTES,
          overage_minutes: overageMinutes,
          extra_charge: finalCharge,
          needs_approval: needsApproval,
        },
      } as never);

      if (needsApproval) {
        await supabase.from('approval_requests').insert({
          entity_type: 'run',
          entity_id: runId,
          request_type: 'live_load_overage',
          requested_by: userId,
          requested_value: {
            total_minutes: totalMinutes,
            extra_charge: finalCharge,
          },
          reason: `Live load overage: ${overageMinutes} min over ${INCLUDED_MINUTES} min included. Extra charge: $${finalCharge.toFixed(2)}`,
          status: 'pending',
        });
      }

      setSaved(true);
    } catch (err) {
      console.error(err);
      alert('Error saving timer. Please try again.');
    }
  }

  return (
    <div className="fixed inset-0 z-50 bg-black/95 flex flex-col">
      {/* Header */}
      <div className="flex items-center justify-between p-4 text-white">
        <h2 className="text-lg font-bold flex items-center gap-2">
          <Timer className="w-5 h-5" /> Live Load Timer
        </h2>
        <Button variant="ghost" size="sm" className="text-white hover:bg-white/20" onClick={onClose}>
          <X className="w-6 h-6" />
        </Button>
      </div>

      {/* Timer Display */}
      <div className="flex-1 flex flex-col items-center justify-center px-4">
        <div className={cn(
          'text-7xl font-mono font-bold tabular-nums',
          overageMinutes > 0 ? 'text-red-400' : 'text-white'
        )}>
          {formatTime(elapsedSeconds)}
        </div>

        <div className="mt-6 text-center space-y-2">
          <p className="text-white/60 text-sm">
            {INCLUDED_MINUTES} min included • ${HOURLY_RATE}/hr after
          </p>
          {overageMinutes > 0 && (
            <div className="bg-red-500/20 border border-red-500/40 rounded-xl p-3 mt-4">
              <div className="flex items-center gap-2 text-red-400 mb-1">
                <DollarSign className="w-4 h-4" />
                <span className="font-bold">Overage: {overageMinutes} min</span>
              </div>
              <p className="text-2xl font-bold text-red-300">${finalCharge.toFixed(2)}</p>
              {needsApproval && (
                <div className="flex items-center gap-1 text-yellow-400 text-xs mt-2">
                  <AlertTriangle className="w-3 h-3" />
                  Requires finance approval (&gt;${APPROVAL_THRESHOLD})
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Controls */}
      <div className="p-4 space-y-3">
        {!saved ? (
          <>
            {!isRunning && elapsedSeconds === 0 && (
              <Button
                size="lg"
                className="w-full h-16 text-lg font-bold bg-green-500 hover:bg-green-600 text-white gap-3"
                onClick={start}
              >
                <Play className="w-6 h-6" /> Start Timer
              </Button>
            )}
            {isRunning && (
              <Button
                size="lg"
                className="w-full h-16 text-lg font-bold bg-red-500 hover:bg-red-600 text-white gap-3"
                onClick={stop}
              >
                <Square className="w-6 h-6" /> Stop Timer
              </Button>
            )}
            {!isRunning && elapsedSeconds > 0 && (
              <div className="flex gap-3">
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 h-14 text-white border-white/30 hover:bg-white/10"
                  onClick={start}
                >
                  Resume
                </Button>
                <Button
                  size="lg"
                  className="flex-1 h-14 bg-primary hover:bg-primary/90 font-bold"
                  onClick={saveTimer}
                >
                  Save & Close
                </Button>
              </div>
            )}
          </>
        ) : (
          <div className="text-center text-green-400 space-y-3">
            <p className="text-lg font-bold">Timer Saved ✓</p>
            <p className="text-sm text-white/60">
              {totalMinutes} min total • ${finalCharge.toFixed(2)} extra charge
            </p>
            <Button variant="outline" className="text-white border-white/30" onClick={onClose}>
              Close
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
