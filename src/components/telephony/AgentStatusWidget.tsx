import { useAdminAuth } from '@/hooks/useAdminAuth';
import { useTelephony } from '@/hooks/useTelephony';
import { AgentStatusSelector } from './AgentStatusSelector';
import { IncomingCallModal } from './IncomingCallModal';
import { ActiveCallPanel } from './ActiveCallPanel';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * Self-contained agent status widget that integrates telephony hook
 * Use this in layouts/sidebars for quick status management
 */
export function AgentStatusWidget() {
  const { user } = useAdminAuth();
  const { 
    agentStatus, 
    updateStatus, 
    isLoading, 
    incomingCall, 
    currentCall,
    saveCallNotes,
  } = useTelephony(user?.id);

  if (isLoading) {
    return (
      <div className="space-y-2">
        <Skeleton className="h-9 w-40" />
      </div>
    );
  }

  return (
    <>
      <AgentStatusSelector
        status={agentStatus.status}
        callsToday={agentStatus.calls_today}
        onStatusChange={updateStatus}
        disabled={agentStatus.status === 'BUSY'}
      />

      {/* Incoming call modal */}
      <IncomingCallModal
        call={incomingCall}
        onAnswer={() => {
          // In a real implementation, this would accept the call
          console.log('Answer call:', incomingCall?.id);
        }}
        onDecline={() => {
          // In a real implementation, this would decline the call
          console.log('Decline call:', incomingCall?.id);
        }}
      />

      {/* Active call panel (floating) */}
      {currentCall && (
        <div className="fixed bottom-4 right-4 z-50">
          <ActiveCallPanel
            call={currentCall}
            onEndCall={() => {
              console.log('End call:', currentCall.id);
            }}
            onSaveNotes={(notes) => saveCallNotes(currentCall.id, notes)}
          />
        </div>
      )}
    </>
  );
}
