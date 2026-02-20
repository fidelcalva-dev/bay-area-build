import { supabase } from '@/integrations/supabase/client';
import { getAll, remove, updateRetries, type QueuedAction } from './offlineQueue';

const MAX_RETRIES = 5;
let syncing = false;

/**
 * Process all queued offline actions.
 * Called automatically when coming back online or manually.
 */
export async function syncOfflineQueue(): Promise<{ synced: number; failed: number }> {
  if (syncing) return { synced: 0, failed: 0 };
  syncing = true;

  let synced = 0;
  let failed = 0;

  try {
    const items = await getAll();
    for (const item of items) {
      if (item.retries >= MAX_RETRIES) {
        failed++;
        continue;
      }

      try {
        await processAction(item);
        await remove(item.id);
        synced++;
      } catch {
        await updateRetries(item.id, item.retries + 1);
        failed++;
      }
    }
  } finally {
    syncing = false;
  }

  return { synced, failed };
}

async function processAction(action: QueuedAction) {
  // Use type assertion since we support many tables
  const query = supabase.from(action.table as any);

  switch (action.operation) {
    case 'insert':
      const { error: insertErr } = await (query as any).insert(action.payload);
      if (insertErr) throw insertErr;
      break;
    case 'update':
      if (!action.payload.id) throw new Error('Update requires id');
      const { id, ...rest } = action.payload;
      const { error: updateErr } = await (query as any).update(rest).eq('id', id);
      if (updateErr) throw updateErr;
      break;
    case 'upsert':
      const { error: upsertErr } = await (query as any).upsert(action.payload);
      if (upsertErr) throw upsertErr;
      break;
  }
}

// Auto-sync when coming back online
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    syncOfflineQueue().then(({ synced, failed }) => {
      if (synced > 0) {
        console.log(`[OfflineSync] Synced ${synced} actions, ${failed} failed`);
      }
    });
  });
}
