import { useState, useEffect, useCallback } from 'react';
import { getPendingCount, enqueue } from '@/lib/offlineQueue';
import { syncOfflineQueue } from '@/lib/offlineSync';

export function useOfflineSync() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingCount, setPendingCount] = useState(0);
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Initial count
    getPendingCount().then(setPendingCount);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const queueAction = useCallback(async (
    table: string,
    operation: 'insert' | 'update' | 'upsert',
    payload: Record<string, any>
  ) => {
    await enqueue({ table, operation, payload });
    setPendingCount((c) => c + 1);
  }, []);

  const manualSync = useCallback(async () => {
    setIsSyncing(true);
    try {
      const result = await syncOfflineQueue();
      const remaining = await getPendingCount();
      setPendingCount(remaining);
      return result;
    } finally {
      setIsSyncing(false);
    }
  }, []);

  return { isOnline, pendingCount, isSyncing, queueAction, manualSync };
}
