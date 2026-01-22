import { supabase } from '@/integrations/supabase/client';

// Interface for logistics pricing (since table is new)
interface LogisticsPricing {
  id: string;
  logistics_type: string;
  base_fee: number;
  per_minute_fee: number;
  included_minutes: number;
  dry_run_fee: number;
  description: string | null;
  is_active: boolean;
}

// Interface for logistics events (since table is new)
export interface LogisticsEvent {
  id: string;
  order_id: string;
  event_type: string;
  logistics_type: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  actor_role: string | null;
  photo_url: string | null;
  location_lat: number | null;
  location_lng: number | null;
  filled_location: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Logistics types
export type LogisticsType =
  | 'delivery'
  | 'pickup'
  | 'swap'
  | 'live_load'
  | 'dump_and_return'
  | 'relocation'
  | 'custom_request'
  | 'yard_filled'
  | 'truck_filled'
  | 'partial_pickup'
  | 'dry_run'
  | 'multi_stop'
  | 'maintenance_hold';

export type FilledLocation = 'customer' | 'yard' | 'truck';

export const LOGISTICS_CONFIG: Record<LogisticsType, {
  label: string;
  description: string;
  color: string;
  requiresPhoto: boolean;
  allowsFilledLocation: boolean;
  statusFlow: string[];
  icon: string;
}> = {
  delivery: {
    label: 'Delivery',
    description: 'Standard dumpster delivery',
    color: 'bg-blue-100 text-blue-800',
    requiresPhoto: true,
    allowsFilledLocation: false,
    statusFlow: ['scheduled', 'en_route', 'delivered'],
    icon: 'truck',
  },
  pickup: {
    label: 'Pickup',
    description: 'Standard dumpster pickup',
    color: 'bg-orange-100 text-orange-800',
    requiresPhoto: true,
    allowsFilledLocation: true,
    statusFlow: ['pickup_scheduled', 'en_route', 'picked_up', 'dumped', 'completed'],
    icon: 'package',
  },
  swap: {
    label: 'Swap',
    description: 'Replace existing dumpster with new one',
    color: 'bg-purple-100 text-purple-800',
    requiresPhoto: true,
    allowsFilledLocation: true,
    statusFlow: ['scheduled', 'en_route', 'picked_up', 'delivered', 'completed'],
    icon: 'refresh-cw',
  },
  live_load: {
    label: 'Live Load',
    description: 'Driver waits while customer loads',
    color: 'bg-amber-100 text-amber-800',
    requiresPhoto: true,
    allowsFilledLocation: false,
    statusFlow: ['scheduled', 'en_route', 'loading', 'completed'],
    icon: 'timer',
  },
  dump_and_return: {
    label: 'Dump & Return',
    description: 'Pick up, dump, and return same container',
    color: 'bg-teal-100 text-teal-800',
    requiresPhoto: true,
    allowsFilledLocation: true,
    statusFlow: ['scheduled', 'en_route', 'picked_up', 'dumped', 'returning', 'delivered', 'completed'],
    icon: 'rotate-cw',
  },
  relocation: {
    label: 'Relocation',
    description: 'Move dumpster to different spot on-site',
    color: 'bg-indigo-100 text-indigo-800',
    requiresPhoto: true,
    allowsFilledLocation: false,
    statusFlow: ['scheduled', 'en_route', 'moved', 'completed'],
    icon: 'move',
  },
  custom_request: {
    label: 'Custom',
    description: 'Special request requiring review',
    color: 'bg-pink-100 text-pink-800',
    requiresPhoto: false,
    allowsFilledLocation: false,
    statusFlow: ['pending_review', 'approved', 'in_progress', 'completed'],
    icon: 'help-circle',
  },
  yard_filled: {
    label: 'Yard Filled',
    description: 'Dumpster filled at yard before delivery',
    color: 'bg-green-100 text-green-800',
    requiresPhoto: false,
    allowsFilledLocation: false,
    statusFlow: ['filled', 'delivered', 'completed'],
    icon: 'warehouse',
  },
  truck_filled: {
    label: 'Truck Filled',
    description: 'Material loaded directly onto truck',
    color: 'bg-cyan-100 text-cyan-800',
    requiresPhoto: true,
    allowsFilledLocation: false,
    statusFlow: ['loading', 'dumped', 'completed'],
    icon: 'truck',
  },
  partial_pickup: {
    label: 'Partial Pickup',
    description: 'Customer not ready, partial service only',
    color: 'bg-yellow-100 text-yellow-800',
    requiresPhoto: true,
    allowsFilledLocation: false,
    statusFlow: ['scheduled', 'partial', 'completed'],
    icon: 'alert-triangle',
  },
  dry_run: {
    label: 'Dry Run',
    description: 'Unable to complete service on arrival',
    color: 'bg-red-100 text-red-800',
    requiresPhoto: true,
    allowsFilledLocation: false,
    statusFlow: ['scheduled', 'dry_run'],
    icon: 'x-circle',
  },
  multi_stop: {
    label: 'Multi-Stop',
    description: 'Multiple deliveries/pickups in one trip',
    color: 'bg-violet-100 text-violet-800',
    requiresPhoto: true,
    allowsFilledLocation: true,
    statusFlow: ['scheduled', 'in_progress', 'completed'],
    icon: 'list',
  },
  maintenance_hold: {
    label: 'Maintenance',
    description: 'Dumpster held for maintenance',
    color: 'bg-gray-100 text-gray-800',
    requiresPhoto: false,
    allowsFilledLocation: false,
    statusFlow: ['maintenance', 'ready'],
    icon: 'wrench',
  },
};

// Get current actor info
async function getCurrentActor(): Promise<{ actorId: string | null; actorRole: string | null }> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return { actorId: null, actorRole: null };

    const { data: roles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .limit(1);

    return {
      actorId: user.id,
      actorRole: roles?.[0]?.role || null,
    };
  } catch {
    return { actorId: null, actorRole: null };
  }
}

// Log a logistics event using RPC or direct insert
export async function logLogisticsEvent(params: {
  orderId: string;
  eventType: string;
  logisticsType: LogisticsType;
  fromStatus?: string;
  toStatus?: string;
  photoUrl?: string;
  locationLat?: number;
  locationLng?: number;
  filledLocation?: FilledLocation;
  notes?: string;
  metadata?: Record<string, unknown>;
}): Promise<{ success: boolean; error?: string }> {
  try {
    const { actorId, actorRole } = await getCurrentActor();

    // Use raw insert since types might not be updated yet
    const { error } = await supabase.rpc('exec_sql' as never, {
      query: `INSERT INTO logistics_events (order_id, event_type, logistics_type, from_status, to_status, actor_id, actor_role, photo_url, location_lat, location_lng, filled_location, notes, metadata) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)`,
      params: [
        params.orderId,
        params.eventType,
        params.logisticsType,
        params.fromStatus || null,
        params.toStatus || null,
        actorId,
        actorRole,
        params.photoUrl || null,
        params.locationLat || null,
        params.locationLng || null,
        params.filledLocation || null,
        params.notes || null,
        JSON.stringify(params.metadata || {}),
      ],
    } as never);

    // Fallback to direct table insert if RPC doesn't exist
    if (error) {
      // Try direct insert with type assertion
      const insertResult = await (supabase as any).from('logistics_events').insert({
        order_id: params.orderId,
        event_type: params.eventType,
        logistics_type: params.logisticsType,
        from_status: params.fromStatus || null,
        to_status: params.toStatus || null,
        actor_id: actorId,
        actor_role: actorRole,
        photo_url: params.photoUrl || null,
        location_lat: params.locationLat || null,
        location_lng: params.locationLng || null,
        filled_location: params.filledLocation || null,
        notes: params.notes || null,
        metadata: params.metadata || {},
      });

      if (insertResult.error) {
        console.error('Failed to log logistics event:', insertResult.error);
        return { success: false, error: insertResult.error.message };
      }
    }

    return { success: true };
  } catch (err) {
    console.error('Logistics event logging error:', err);
    return { success: false, error: 'Unknown error' };
  }
}

// Get logistics events for an order
export async function getLogisticsEvents(orderId: string): Promise<LogisticsEvent[]> {
  try {
    const { data, error } = await (supabase as any)
      .from('logistics_events')
      .select('*')
      .eq('order_id', orderId)
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching logistics events:', error);
      return [];
    }

    return (data || []) as LogisticsEvent[];
  } catch {
    return [];
  }
}

// Calculate logistics fees
export async function calculateLogisticsFee(
  logisticsType: LogisticsType,
  options?: {
    isDryRun?: boolean;
    liveLoadMinutes?: number;
    additionalStops?: number;
  }
): Promise<{ baseFee: number; additionalFees: number; total: number; breakdown: string[] }> {
  try {
    const { data } = await (supabase as any)
      .from('logistics_pricing')
      .select('*')
      .eq('logistics_type', logisticsType)
      .eq('is_active', true)
      .single();

    if (!data) {
      return { baseFee: 0, additionalFees: 0, total: 0, breakdown: [] };
    }

    const pricing = data as LogisticsPricing;
    const breakdown: string[] = [];
    let baseFee = pricing.base_fee || 0;
    let additionalFees = 0;

    if (baseFee > 0) {
      breakdown.push(`${LOGISTICS_CONFIG[logisticsType].label} fee: $${baseFee}`);
    }

    // Dry run fee
    if (options?.isDryRun && pricing.dry_run_fee > 0) {
      additionalFees += pricing.dry_run_fee;
      breakdown.push(`Dry run fee: $${pricing.dry_run_fee}`);
    }

    // Live load extra time
    if (logisticsType === 'live_load' && options?.liveLoadMinutes) {
      const extraMinutes = Math.max(0, options.liveLoadMinutes - (pricing.included_minutes || 0));
      if (extraMinutes > 0 && pricing.per_minute_fee > 0) {
        const extraFee = extraMinutes * pricing.per_minute_fee;
        additionalFees += extraFee;
        breakdown.push(`Extra time (${extraMinutes} min): $${extraFee}`);
      }
    }

    // Multi-stop additional stops
    if (logisticsType === 'multi_stop' && options?.additionalStops && options.additionalStops > 0) {
      const extraStopFee = options.additionalStops * (pricing.base_fee || 50);
      additionalFees += extraStopFee;
      breakdown.push(`Additional stops (${options.additionalStops}): $${extraStopFee}`);
    }

    return {
      baseFee,
      additionalFees,
      total: baseFee + additionalFees,
      breakdown,
    };
  } catch {
    return { baseFee: 0, additionalFees: 0, total: 0, breakdown: [] };
  }
}

// Handle inventory updates based on logistics type
export async function updateInventoryForLogistics(
  orderId: string,
  logisticsType: LogisticsType,
  action: 'start' | 'complete',
  options?: {
    primaryDumpsterId?: string;
    secondaryDumpsterId?: string;
    filledLocation?: FilledLocation;
  }
): Promise<{ success: boolean; error?: string }> {
  try {
    const { data: order } = await supabase
      .from('orders')
      .select('inventory_id, assigned_yard_id')
      .eq('id', orderId)
      .single();

    if (!order) {
      return { success: false, error: 'Order not found' };
    }

    const inventoryId = options?.primaryDumpsterId || order.inventory_id;

    switch (logisticsType) {
      case 'delivery':
        if (action === 'complete' && inventoryId) {
          // Mark dumpster as in-use
          await supabase
            .from('inventory')
            .update({ reserved_count: 0, in_use_count: 1 })
            .eq('id', inventoryId);
        }
        break;

      case 'pickup':
        if (action === 'complete' && inventoryId) {
          // Mark dumpster as available
          await supabase
            .from('inventory')
            .update({ in_use_count: 0, available_count: 1 })
            .eq('id', inventoryId);
        }
        break;

      case 'swap':
        if (action === 'complete') {
          // Release old dumpster, deploy new one
          if (inventoryId) {
            await supabase
              .from('inventory')
              .update({ in_use_count: 0, available_count: 1 })
              .eq('id', inventoryId);
          }
          if (options?.secondaryDumpsterId) {
            await supabase
              .from('inventory')
              .update({ reserved_count: 0, in_use_count: 1 })
              .eq('id', options.secondaryDumpsterId);
          }
        }
        break;

      case 'maintenance_hold':
        if (inventoryId) {
          if (action === 'start') {
            await supabase
              .from('inventory')
              .update({ available_count: 0, maintenance_count: 1 })
              .eq('id', inventoryId);
          } else {
            await supabase
              .from('inventory')
              .update({ maintenance_count: 0, available_count: 1 })
              .eq('id', inventoryId);
          }
        }
        break;

      case 'yard_filled':
      case 'truck_filled':
        // These are inventory events, log them
        await logLogisticsEvent({
          orderId,
          eventType: 'inventory_event',
          logisticsType,
          notes: `${logisticsType === 'yard_filled' ? 'Filled at yard' : 'Filled on truck'}`,
          filledLocation: logisticsType === 'yard_filled' ? 'yard' : 'truck',
        });
        break;
    }

    return { success: true };
  } catch (err) {
    console.error('Error updating inventory for logistics:', err);
    return { success: false, error: 'Failed to update inventory' };
  }
}

// Check if order requires manual review
export function requiresManualReview(logisticsType: LogisticsType, flags?: {
  overfill?: boolean;
  wrongMaterial?: boolean;
  customRequest?: boolean;
}): boolean {
  if (logisticsType === 'custom_request') return true;
  if (flags?.overfill || flags?.wrongMaterial || flags?.customRequest) return true;
  return false;
}

// Get next status for a logistics type
export function getNextStatus(logisticsType: LogisticsType, currentStatus: string): string | null {
  const config = LOGISTICS_CONFIG[logisticsType];
  if (!config) return null;

  const currentIndex = config.statusFlow.indexOf(currentStatus);
  if (currentIndex === -1 || currentIndex >= config.statusFlow.length - 1) {
    return null;
  }

  return config.statusFlow[currentIndex + 1];
}

// Get action label for status transition
export function getStatusActionLabel(logisticsType: LogisticsType, currentStatus: string): string | null {
  const nextStatus = getNextStatus(logisticsType, currentStatus);
  if (!nextStatus) return null;

  const actionLabels: Record<string, string> = {
    en_route: 'Start Route',
    delivered: 'Mark Delivered',
    picked_up: 'Mark Picked Up',
    dumped: 'Mark Dumped',
    completed: 'Complete Job',
    loading: 'Start Loading',
    returning: 'Start Return',
    moved: 'Mark Moved',
    dry_run: 'Mark Dry Run',
    approved: 'Approve',
    in_progress: 'Start Work',
    partial: 'Mark Partial',
    filled: 'Mark Filled',
    ready: 'Mark Ready',
  };

  return actionLabels[nextStatus] || `Move to ${nextStatus}`;
}
