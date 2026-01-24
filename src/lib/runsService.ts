/**
 * Runs Service - Core operations for the Dispatch Operating System
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;
export type RunType = 'DELIVERY' | 'PICKUP' | 'HAUL' | 'SWAP';
export type RunStatus = 'DRAFT' | 'SCHEDULED' | 'ASSIGNED' | 'ACCEPTED' | 'EN_ROUTE' | 'COMPLETED' | 'CANCELLED';
export type LocationType = 'yard' | 'customer' | 'facility';
export type AssignmentType = 'IN_HOUSE' | 'CARRIER';
export type CheckpointType = 'PICKUP_POD' | 'DELIVERY_POD' | 'DUMP_TICKET';

export interface Run {
  id: string;
  run_number: string;
  run_type: RunType;
  order_id: string | null;
  asset_id: string | null;
  
  // Origin
  origin_type: LocationType;
  origin_yard_id: string | null;
  origin_facility_id: string | null;
  origin_address: string | null;
  
  // Destination
  destination_type: LocationType;
  destination_yard_id: string | null;
  destination_facility_id: string | null;
  destination_address: string | null;
  
  // Schedule
  scheduled_date: string;
  scheduled_window: string | null;
  scheduled_start: string | null;
  scheduled_end: string | null;
  estimated_duration_mins: number | null;
  
  // Assignment
  assigned_driver_id: string | null;
  assigned_truck_id: string | null;
  assignment_type: AssignmentType;
  
  // Status
  status: RunStatus;
  priority: number;
  
  // Timestamps
  accepted_at: string | null;
  started_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  
  // Customer (denormalized)
  customer_name: string | null;
  customer_phone: string | null;
  
  // Notes
  notes: string | null;
  dispatcher_notes: string | null;
  driver_notes: string | null;
  cancellation_reason: string | null;
  
  // Payout
  estimated_miles: number | null;
  actual_miles: number | null;
  base_payout: number | null;
  mileage_payout: number | null;
  bonus_payout: number | null;
  payout_status: string | null;
  
  // Audit
  created_at: string;
  updated_at: string;
  
  // Joined data (optional)
  assets_dumpsters?: { asset_code: string; size_id: string } | null;
  drivers?: { id: string; name: string; phone: string; is_owner_operator: boolean } | null;
  trucks?: { id: string; truck_number: string; truck_type: string } | null;
  origin_yard?: { id: string; name: string } | null;
  destination_yard?: { id: string; name: string } | null;
  checkpoints?: RunCheckpoint[];
}

export interface RunCheckpoint {
  id: string;
  run_id: string;
  checkpoint_type: CheckpointType;
  is_required: boolean;
  completed_at: string | null;
  completed_by: string | null;
  photo_urls: string[];
  document_urls: string[];
  notes: string | null;
  created_at: string;
}

export interface RunEvent {
  id: string;
  run_id: string;
  event_type: string;
  from_status: string | null;
  to_status: string | null;
  actor_id: string | null;
  actor_role: string | null;
  notes: string | null;
  metadata: Record<string, unknown>;
  created_at: string;
}

// Status flow configuration
export const RUN_STATUS_FLOW: Record<RunStatus, { next: RunStatus | null; action: string; color: string }> = {
  DRAFT: { next: 'SCHEDULED', action: 'Schedule', color: 'bg-muted text-muted-foreground' },
  SCHEDULED: { next: 'ASSIGNED', action: 'Assign', color: 'bg-blue-100 text-blue-800' },
  ASSIGNED: { next: 'ACCEPTED', action: 'Accept', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { next: 'EN_ROUTE', action: 'Start', color: 'bg-orange-100 text-orange-800' },
  EN_ROUTE: { next: 'COMPLETED', action: 'Complete', color: 'bg-purple-100 text-purple-800' },
  COMPLETED: { next: null, action: '', color: 'bg-green-100 text-green-800' },
  CANCELLED: { next: null, action: '', color: 'bg-red-100 text-red-800' },
};

export const RUN_TYPE_CONFIG: Record<RunType, { label: string; icon: string; color: string }> = {
  DELIVERY: { label: 'Delivery', icon: '🚚', color: 'bg-blue-500' },
  PICKUP: { label: 'Pickup', icon: '📦', color: 'bg-green-500' },
  HAUL: { label: 'Haul', icon: '🏗️', color: 'bg-orange-500' },
  SWAP: { label: 'Swap', icon: '🔄', color: 'bg-purple-500' },
};

// =====================================================
// FETCH FUNCTIONS
// =====================================================

export async function getRunsForDate(date: string): Promise<Run[]> {
  const query: AnyQuery = supabase.from('runs');
  const { data, error } = await query
    .select(`
      *,
      assets_dumpsters:asset_id (asset_code, size_id),
      drivers:assigned_driver_id (id, name, phone, is_owner_operator),
      trucks:assigned_truck_id (id, truck_number, truck_type),
      origin_yard:origin_yard_id (id, name),
      destination_yard:destination_yard_id (id, name)
    `)
    .eq('scheduled_date', date)
    .order('scheduled_window', { ascending: true })
    .order('priority', { ascending: true });
  
  if (error) throw error;
  return (data || []) as unknown as Run[];
}

export async function getRunsForDateRange(startDate: string, endDate: string): Promise<Run[]> {
  const query: AnyQuery = supabase.from('runs');
  const { data, error } = await query
    .select(`
      *,
      assets_dumpsters:asset_id (asset_code, size_id),
      drivers:assigned_driver_id (id, name, phone, is_owner_operator),
      trucks:assigned_truck_id (id, truck_number, truck_type)
    `)
    .gte('scheduled_date', startDate)
    .lte('scheduled_date', endDate)
    .order('scheduled_date', { ascending: true })
    .order('scheduled_window', { ascending: true });
  
  if (error) throw error;
  return (data || []) as unknown as Run[];
}

export async function getRunById(runId: string): Promise<Run | null> {
  const query: AnyQuery = supabase.from('runs');
  const { data, error } = await query
    .select(`
      *,
      assets_dumpsters:asset_id (asset_code, size_id),
      drivers:assigned_driver_id (id, name, phone, is_owner_operator),
      trucks:assigned_truck_id (id, truck_number, truck_type),
      origin_yard:origin_yard_id (id, name),
      destination_yard:destination_yard_id (id, name)
    `)
    .eq('id', runId)
    .maybeSingle();
  
  if (error) throw error;
  return data as unknown as Run | null;
}

export async function getRunsForDriver(driverId: string, date?: string): Promise<Run[]> {
  const query: AnyQuery = supabase.from('runs');
  let q = query
    .select(`
      *,
      assets_dumpsters:asset_id (asset_code, size_id),
      origin_yard:origin_yard_id (id, name),
      destination_yard:destination_yard_id (id, name)
    `)
    .eq('assigned_driver_id', driverId)
    .not('status', 'in', '("COMPLETED","CANCELLED")');
  
  if (date) {
    q = q.eq('scheduled_date', date);
  }
  
  const { data, error } = await q.order('scheduled_date').order('priority');
  
  if (error) throw error;
  return (data || []) as Run[];
}

export async function getRunCheckpoints(runId: string): Promise<RunCheckpoint[]> {
  const query: AnyQuery = supabase.from('run_checkpoints');
  const { data, error } = await query
    .select('*')
    .eq('run_id', runId);
  
  if (error) throw error;
  return (data || []) as unknown as RunCheckpoint[];
}

export async function getRunEvents(runId: string): Promise<RunEvent[]> {
  const query: AnyQuery = supabase.from('run_events');
  const { data, error } = await query
    .select('*')
    .eq('run_id', runId)
    .order('created_at', { ascending: false });
  
  if (error) throw error;
  return (data || []) as RunEvent[];
}

// =====================================================
// MUTATION FUNCTIONS
// =====================================================

export async function assignRun(
  runId: string,
  driverId: string,
  truckId?: string,
  assignmentType: AssignmentType = 'IN_HOUSE'
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('runs' as 'orders')
      .update({
        assigned_driver_id: driverId,
        assigned_truck_id: truckId || null,
        assignment_type: assignmentType,
        status: 'ASSIGNED',
      } as never)
      .eq('id', runId);
    
    if (error) throw error;
    
    // Log event
    await logRunEvent(runId, 'ASSIGNED', 'SCHEDULED', 'ASSIGNED');
    
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function updateRunStatus(
  runId: string,
  newStatus: RunStatus,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    // Get current run
    const run = await getRunById(runId);
    if (!run) throw new Error('Run not found');
    
    // Validate transition
    const validNextStatus = RUN_STATUS_FLOW[run.status].next;
    if (newStatus !== validNextStatus && newStatus !== 'CANCELLED') {
      throw new Error(`Invalid status transition: ${run.status} -> ${newStatus}`);
    }
    
    // Check checkpoints for completion
    if (newStatus === 'COMPLETED') {
      const checkpoints = await getRunCheckpoints(runId);
      const incompleteRequired = checkpoints.filter(c => c.is_required && !c.completed_at);
      if (incompleteRequired.length > 0) {
        throw new Error(`Missing required checkpoints: ${incompleteRequired.map(c => c.checkpoint_type).join(', ')}`);
      }
    }
    
    // Build update object
    const updateData: Record<string, unknown> = { status: newStatus };
    
    if (newStatus === 'ACCEPTED') updateData.accepted_at = new Date().toISOString();
    if (newStatus === 'EN_ROUTE') updateData.started_at = new Date().toISOString();
    if (newStatus === 'COMPLETED') updateData.completed_at = new Date().toISOString();
    if (newStatus === 'CANCELLED') {
      updateData.cancelled_at = new Date().toISOString();
      updateData.cancellation_reason = notes;
    }
    if (notes && newStatus !== 'CANCELLED') updateData.driver_notes = notes;
    
    const { error } = await supabase
      .from('runs' as 'orders')
      .update(updateData as never)
      .eq('id', runId);
    
    if (error) throw error;
    
    // Log event
    await logRunEvent(runId, `STATUS_${newStatus}`, run.status, newStatus, notes);
    
    // If completed, sync back to order
    if (newStatus === 'COMPLETED' && run.order_id) {
      await syncRunCompletionToOrder(run);
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function completeCheckpoint(
  checkpointId: string,
  photoUrls: string[],
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('run_checkpoints' as 'orders')
      .update({
        completed_at: new Date().toISOString(),
        photo_urls: photoUrls,
        notes: notes || null,
      } as never)
      .eq('id', checkpointId);
    
    if (error) throw error;
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function createManualRun(params: {
  runType: RunType;
  orderId?: string;
  assetId?: string;
  scheduledDate: string;
  scheduledWindow?: string;
  originType?: LocationType;
  originYardId?: string;
  originAddress?: string;
  destinationType?: LocationType;
  destinationYardId?: string;
  destinationFacilityId?: string;
  destinationAddress?: string;
  customerName?: string;
  customerPhone?: string;
  notes?: string;
}): Promise<{ success: boolean; runId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('runs' as 'orders')
      .insert({
        run_type: params.runType,
        order_id: params.orderId || null,
        asset_id: params.assetId || null,
        scheduled_date: params.scheduledDate,
        scheduled_window: params.scheduledWindow || null,
        origin_type: params.originType || 'yard',
        origin_yard_id: params.originYardId || null,
        origin_address: params.originAddress || null,
        destination_type: params.destinationType || 'customer',
        destination_yard_id: params.destinationYardId || null,
        destination_facility_id: params.destinationFacilityId || null,
        destination_address: params.destinationAddress || null,
        customer_name: params.customerName || null,
        customer_phone: params.customerPhone || null,
        notes: params.notes || 'Manually created',
        status: 'DRAFT',
      } as never)
      .select('id')
      .single();
    
    if (error) throw error;
    
    // Create default checkpoints based on run type
    const checkpoints: CheckpointType[] = [];
    if (params.runType === 'DELIVERY') checkpoints.push('DELIVERY_POD');
    if (params.runType === 'PICKUP') checkpoints.push('PICKUP_POD', 'DUMP_TICKET');
    if (params.runType === 'HAUL') checkpoints.push('DUMP_TICKET');
    
    for (const type of checkpoints) {
      await supabase
        .from('run_checkpoints' as 'orders')
        .insert({
          run_id: data.id,
          checkpoint_type: type,
          is_required: true,
        } as never);
    }
    
    return { success: true, runId: data.id };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =====================================================
// HELPER FUNCTIONS
// =====================================================

async function logRunEvent(
  runId: string,
  eventType: string,
  fromStatus?: string,
  toStatus?: string,
  notes?: string
): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  
  await supabase
    .from('run_events' as 'orders')
    .insert({
      run_id: runId,
      event_type: eventType,
      from_status: fromStatus || null,
      to_status: toStatus || null,
      actor_id: user?.id || null,
      notes: notes || null,
    } as never);
}

async function syncRunCompletionToOrder(run: Run): Promise<void> {
  if (!run.order_id) return;
  
  const updateData: Record<string, unknown> = {};
  
  if (run.run_type === 'DELIVERY') {
    updateData.delivery_completed_at = run.completed_at;
  } else if (run.run_type === 'PICKUP') {
    updateData.pickup_completed_at = run.completed_at;
  }
  
  if (Object.keys(updateData).length > 0) {
    await supabase
      .from('orders')
      .update(updateData)
      .eq('id', run.order_id);
  }
}

// =====================================================
// DRIVER SUGGESTIONS
// =====================================================

export interface DriverSuggestion {
  driver: { id: string; name: string; phone: string; is_owner_operator: boolean };
  score: number;
  reasons: string[];
}

export async function suggestDriversForRun(runId: string): Promise<DriverSuggestion[]> {
  const run = await getRunById(runId);
  if (!run) return [];
  
  // Get active drivers
  const { data: drivers } = await supabase
    .from('drivers')
    .select('id, name, phone, is_owner_operator, assigned_yard_id, truck_type')
    .eq('is_active', true);
  
  if (!drivers || drivers.length === 0) return [];
  
  // Get today's load for each driver
  const today = run.scheduled_date;
  const { data: todayRuns } = await supabase
    .from('runs' as 'orders')
    .select('assigned_driver_id')
    .eq('scheduled_date', today)
    .not('status', 'in', '("CANCELLED")');
  
  const driverLoadMap = new Map<string, number>();
  (todayRuns || []).forEach((r: { assigned_driver_id: string | null }) => {
    if (r.assigned_driver_id) {
      driverLoadMap.set(r.assigned_driver_id, (driverLoadMap.get(r.assigned_driver_id) || 0) + 1);
    }
  });
  
  // Score drivers
  const suggestions: DriverSuggestion[] = drivers.map((driver) => {
    let score = 50; // Base score
    const reasons: string[] = [];
    
    // Same yard bonus
    if (run.origin_yard_id && driver.assigned_yard_id === run.origin_yard_id) {
      score += 30;
      reasons.push('Same yard');
    }
    
    // Lower load = higher score
    const load = driverLoadMap.get(driver.id) || 0;
    if (load === 0) {
      score += 20;
      reasons.push('Available');
    } else if (load < 3) {
      score += 10;
      reasons.push(`${load} runs today`);
    } else {
      score -= 10;
      reasons.push(`Busy (${load} runs)`);
    }
    
    return {
      driver: {
        id: driver.id,
        name: driver.name,
        phone: driver.phone,
        is_owner_operator: driver.is_owner_operator,
      },
      score,
      reasons,
    };
  });
  
  // Sort by score descending, take top 3
  return suggestions.sort((a, b) => b.score - a.score).slice(0, 3);
}
