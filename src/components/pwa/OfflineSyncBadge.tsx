import { Cloud, CloudOff, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useOfflineSync } from '@/hooks/useOfflineSync';

export function OfflineSyncBadge() {
  const { isOnline, pendingCount, isSyncing, manualSync } = useOfflineSync();

  if (isOnline && pendingCount === 0) return null;

  return (
    <div className="fixed top-16 left-1/2 -translate-x-1/2 z-50 animate-slide-up">
      <div className="flex items-center gap-2 bg-card border border-border rounded-full shadow-lg px-4 py-2 text-sm">
        {!isOnline ? (
          <>
            <CloudOff className="w-4 h-4 text-destructive" />
            <span className="text-foreground font-medium">Offline</span>
            {pendingCount > 0 && (
              <span className="text-muted-foreground">
                · {pendingCount} pending
              </span>
            )}
          </>
        ) : (
          <>
            <Cloud className="w-4 h-4 text-primary" />
            <span className="text-foreground font-medium">
              {pendingCount} pending sync
            </span>
            <Button
              variant="ghost"
              size="icon"
              className="h-6 w-6"
              onClick={manualSync}
              disabled={isSyncing}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
