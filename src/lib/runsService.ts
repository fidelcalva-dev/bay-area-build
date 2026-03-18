/**
 * Runs Service - Core operations for the Dispatch Operating System
 * 
 * Canonical run types: DELIVERY, PICKUP, SWAP, DUMP_AND_RETURN, YARD_TRANSFER, HAUL
 * Canonical status flow: DRAFT -> SCHEDULED -> ASSIGNED -> ACCEPTED -> EN_ROUTE -> ARRIVED -> COMPLETED
 */
import { supabase } from "@/integrations/supabase/client";

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

export type RunType = 'DELIVERY' | 'PICKUP' | 'HAUL' | 'SWAP' | 'DUMP_AND_RETURN' | 'YARD_TRANSFER';
export type RunStatus = 'DRAFT' | 'SCHEDULED' | 'ASSIGNED' | 'ACCEPTED' | 'EN_ROUTE' | 'ARRIVED' | 'PAUSED' | 'COMPLETED' | 'CANCELLED';
export type LocationType = 'yard' | 'customer' | 'facility';
export type AssignmentType = 'IN_HOUSE' | 'CARRIER';
export type CheckpointType = 
  | 'PICKUP_POD' 
  | 'DELIVERY_POD' 
  | 'DUMP_TICKET'
  | 'FILL_LINE_PHOTO'
  | 'MATERIAL_CLOSEUP'
  | 'CONTAMINATION_PHOTO'
  | 'SWAP_PICKUP_POD'
  | 'SWAP_DELIVERY_POD'
  | 'OVERFILL_PHOTO';

export interface Run {
  id: string;
  run_number: string;
  run_type: RunType;
  order_id: string | null;
  asset_id: string | null;
  pickup_asset_id: string | null; // For SWAP: the full dumpster being picked up
  
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
  arrived_at: string | null;
  completed_at: string | null;
  cancelled_at: string | null;
  
  // Customer (denormalized)
  customer_name: string | null;
  customer_phone: string | null;
  
  // Heavy Material Enforcement
  is_heavy_material: boolean;
  requires_fill_line_check: boolean;
  fill_line_compliant: boolean | null;
  actual_weight_tons: number | null;
  dump_fee: number | null;
  
  // Notes
  notes: string | null;
  dispatcher_notes: string | null;
  driver_notes: string | null;
  cancellation_reason: string | null;
  pause_reason: string | null;
  paused_at: string | null;
  resumed_at: string | null;
  
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
  pickup_asset?: { asset_code: string; size_id: string } | null;
  drivers?: { id: string; name: string; phone: string; is_owner_operator: boolean } | null;
  trucks?: { id: string; truck_number: string; truck_type: string } | null;
  origin_yard?: { id: string; name: string } | null;
  destination_yard?: { id: string; name: string } | null;
  destination_facility?: { id: string; name: string } | null;
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

// Status flow configuration with ARRIVED state
export const RUN_STATUS_FLOW: Record<RunStatus, { next: RunStatus | null; action: string; color: string }> = {
  DRAFT: { next: 'SCHEDULED', action: 'Schedule', color: 'bg-muted text-muted-foreground' },
  SCHEDULED: { next: 'ASSIGNED', action: 'Assign', color: 'bg-blue-100 text-blue-800' },
  ASSIGNED: { next: 'ACCEPTED', action: 'Accept', color: 'bg-yellow-100 text-yellow-800' },
  ACCEPTED: { next: 'EN_ROUTE', action: 'Start', color: 'bg-orange-100 text-orange-800' },
  EN_ROUTE: { next: 'ARRIVED', action: 'Arrived', color: 'bg-purple-100 text-purple-800' },
  ARRIVED: { next: 'COMPLETED', action: 'Complete', color: 'bg-indigo-100 text-indigo-800' },
  PAUSED: { next: 'ARRIVED', action: 'Resume', color: 'bg-amber-100 text-amber-800' },
  COMPLETED: { next: null, action: '', color: 'bg-green-100 text-green-800' },
  CANCELLED: { next: null, action: '', color: 'bg-red-100 text-red-800' },
};

export const RUN_TYPE_CONFIG: Record<RunType, { label: string; icon: string; color: string }> = {
  DELIVERY: { label: 'Delivery', icon: 'Truck', color: 'bg-blue-500' },
  PICKUP: { label: 'Pickup', icon: 'Package', color: 'bg-green-500' },
  HAUL: { label: 'Haul', icon: 'Construction', color: 'bg-orange-500' },
  SWAP: { label: 'Swap', icon: 'RefreshCw', color: 'bg-purple-500' },
  DUMP_AND_RETURN: { label: 'Dump & Return', icon: 'ArrowLeftRight', color: 'bg-amber-500' },
  YARD_TRANSFER: { label: 'Yard Transfer', icon: 'MoveRight', color: 'bg-cyan-500' },
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
    // Get run for conflict check
    const run = await getRunById(runId);
    if (!run) throw new Error('Run not found');

    // Check for conflicts
    const conflictResult = await checkConflicts({
      date: run.scheduled_date,
      window: run.scheduled_window,
      driverId,
      truckId: truckId || null,
      assetId: run.asset_id,
      excludeRunId: runId,
    });

    if (conflictResult.hasConflict) {
      const msgs = conflictResult.conflicts.map(
        c => `${c.type} already assigned to run ${c.conflictingRunNumber || c.conflictingRunId.slice(0, 8)} in ${c.window || 'same day'}`
      );
      throw new Error(`Conflicts detected: ${msgs.join('; ')}`);
    }

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
    if (newStatus === 'ARRIVED') updateData.arrived_at = new Date().toISOString();
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
    
    // Send customer SMS notification (non-blocking)
    notifyCustomerOnStatusChange(run, newStatus).catch(() => {});
    
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

  // On DUMP_AND_RETURN completion: update asset location back to yard
  if (run.run_type === 'DUMP_AND_RETURN' && run.asset_id) {
    await supabase
      .from('assets_dumpsters')
      .update({
        asset_status: 'available',
        current_location_type: 'YARD',
        current_run_id: null,
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', run.asset_id);

    // Log inventory movement
    await supabase.from('inventory_movements').insert({
      asset_id: run.asset_id,
      from_location_type: 'FACILITY',
      to_location_type: 'YARD',
      to_yard_id: run.origin_yard_id,
      movement_type: 'dump_return_complete',
      quantity: 1,
      run_id: run.id,
      notes: 'Asset returned to yard after dump',
    } as never);

    // Lifecycle event
    await supabase.from('lifecycle_events' as never).insert({
      entity_type: 'ORDER',
      entity_id: run.order_id || run.id,
      stage_key: 'DUMP_RETURN_COMPLETED',
      department: 'LOGISTICS',
      event_type: 'AUTO_TRIGGER',
      notes: `Dump & Return completed. Asset returned to yard.`,
    } as never);
  }

  // On any completion with dump fee data, log BILLING_READY
  if (run.dump_fee && run.dump_fee > 0) {
    await supabase.from('lifecycle_events' as never).insert({
      entity_type: 'ORDER',
      entity_id: run.order_id || run.id,
      stage_key: 'BILLING_READY',
      department: 'BILLING',
      event_type: 'AUTO_TRIGGER',
      notes: `Dump fee: $${run.dump_fee}, Weight: ${run.actual_weight_tons || 'N/A'} tons`,
    } as never);
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
    .from('runs')
    .select('assigned_driver_id')
    .eq('scheduled_date', today)
    .neq('status', 'CANCELLED');
  
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

// =====================================================
// HEAVY ENFORCEMENT & CONTAMINATION FLAGGING
// =====================================================

/**
 * Flag run for contamination - driver detected mixed materials in heavy load
 */
export async function flagRunContamination(
  runId: string,
  notes: string,
  photoUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const run = await getRunById(runId);
    if (!run) throw new Error('Run not found');
    
    // Log event
    await logRunEvent(runId, 'CONTAMINATION_FLAGGED', run.status, run.status, notes);
    
    // Create dispatch alert
    await supabase.from('dispatch_alerts' as 'orders').insert({
      run_id: runId,
      order_id: run.order_id,
      alert_type: 'CONTAMINATION_DETECTED',
      severity: 'HIGH',
      message: `Contamination detected: ${notes}`,
      photo_url: photoUrl || null,
    } as never);
    
    // If order exists, trigger contamination reclassification
    if (run.order_id) {
      await supabase.rpc('mark_order_contaminated', {
        p_order_id: run.order_id,
        p_notes: notes,
      });
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Flag run for overfill - dumpster filled beyond allowed level
 */
export async function flagRunOverfill(
  runId: string,
  notes: string,
  photoUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const run = await getRunById(runId);
    if (!run) throw new Error('Run not found');
    
    // Log event
    await logRunEvent(runId, 'OVERFILL_FLAGGED', run.status, run.status, notes);
    
    // Create dispatch alert
    await supabase.from('dispatch_alerts' as 'orders').insert({
      run_id: runId,
      order_id: run.order_id,
      alert_type: 'OVERFILL_DETECTED',
      severity: 'MEDIUM',
      message: `Overfill detected: ${notes}`,
      photo_url: photoUrl || null,
    } as never);
    
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Mark fill line compliance for heavy material run
 */
export async function setFillLineCompliance(
  runId: string,
  isCompliant: boolean,
  notes?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('runs' as 'orders')
      .update({
        fill_line_compliant: isCompliant,
        driver_notes: notes || null,
      } as never)
      .eq('id', runId);
    
    if (error) throw error;
    
    await logRunEvent(runId, isCompliant ? 'FILL_LINE_PASSED' : 'FILL_LINE_FAILED', null, null, notes);
    
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Record dump ticket weight and fee
 */
export async function recordDumpTicket(
  runId: string,
  actualWeightTons: number,
  dumpFee: number,
  ticketPhotoUrl?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const run = await getRunById(runId);
    if (!run) throw new Error('Run not found');
    
    const { error } = await supabase
      .from('runs' as 'orders')
      .update({
        actual_weight_tons: actualWeightTons,
        dump_fee: dumpFee,
      } as never)
      .eq('id', runId);
    
    if (error) throw error;
    
    // Complete the dump ticket checkpoint if exists
    const checkpoints = await getRunCheckpoints(runId);
    const dumpTicketCheckpoint = checkpoints.find(c => c.checkpoint_type === 'DUMP_TICKET');
    if (dumpTicketCheckpoint && ticketPhotoUrl) {
      await completeCheckpoint(dumpTicketCheckpoint.id, [ticketPhotoUrl]);
    }
    
    await logRunEvent(runId, 'DUMP_TICKET_RECORDED', null, null, `Weight: ${actualWeightTons}T, Fee: $${dumpFee}`);
    
    // If this is heavy material, apply weight to order for billing
    if (run.order_id && run.is_heavy_material) {
      await supabase.rpc('apply_scale_ticket_weight', {
        p_order_id: run.order_id,
        p_actual_weight_tons: actualWeightTons,
      });
    }
    
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =====================================================
// SWAP WORKFLOW HELPERS
// =====================================================

/**
 * Get available empty assets in yard for SWAP runs
 */
export async function getAvailableAssetsForSwap(yardId: string, sizeId?: string): Promise<{
  id: string;
  asset_code: string;
  size_value: number;
}[]> {
  const query = supabase
    .from('assets_dumpsters')
    .select('id, asset_code, size_id, dumpster_sizes!inner(size_value)')
    .eq('current_yard_id', yardId)
    .eq('asset_status', 'available');
  
  if (sizeId) {
    query.eq('size_id', sizeId);
  }
  
  const { data, error } = await query;
  if (error) {
    console.error('Error fetching available assets:', error);
    return [];
  }
  
  return (data || []).map((a: { id: string; asset_code: string; dumpster_sizes: { size_value: number } }) => ({
    id: a.id,
    asset_code: a.asset_code,
    size_value: a.dumpster_sizes?.size_value || 0,
  }));
}

/**
 * Reserve empty asset for SWAP run
 */
export async function reserveAssetForSwap(
  runId: string,
  assetId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    await supabase
      .from('runs' as 'orders')
      .update({ asset_id: assetId } as never)
      .eq('id', runId);
    
    await supabase
      .from('assets_dumpsters')
      .update({
        asset_status: 'reserved',
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', assetId);
    
    await logRunEvent(runId, 'SWAP_ASSET_RESERVED', null, null, `Reserved asset ${assetId}`);
    
    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =====================================================
// CONFLICT DETECTION
// =====================================================

export interface ConflictResult {
  hasConflict: boolean;
  conflicts: Array<{
    type: 'DRIVER' | 'TRUCK' | 'ASSET';
    entityId: string;
    entityName: string;
    conflictingRunId: string;
    conflictingRunNumber: string | null;
    window: string | null;
  }>;
}

/**
 * Check for scheduling conflicts (driver/truck/asset double-booked)
 */
export async function checkConflicts(params: {
  date: string;
  window?: string | null;
  driverId?: string | null;
  truckId?: string | null;
  assetId?: string | null;
  excludeRunId?: string;
}): Promise<ConflictResult> {
  const conflicts: ConflictResult['conflicts'] = [];

  // Build base query for runs on same date/window that aren't cancelled or completed
  async function findConflicting(field: string, value: string): Promise<Array<{ id: string; run_number: string | null; scheduled_window: string | null }>> {
    const query: AnyQuery = supabase.from('runs');
    let q = query
      .select('id, run_number, scheduled_window')
      .eq('scheduled_date', params.date)
      .eq(field, value)
      .not('status', 'in', '("COMPLETED","CANCELLED")');

    if (params.window) {
      q = q.eq('scheduled_window', params.window);
    }
    if (params.excludeRunId) {
      q = q.neq('id', params.excludeRunId);
    }

    const { data } = await q;
    return (data || []) as Array<{ id: string; run_number: string | null; scheduled_window: string | null }>;
  }

  if (params.driverId) {
    const driverConflicts = await findConflicting('assigned_driver_id', params.driverId);
    for (const r of driverConflicts) {
      conflicts.push({
        type: 'DRIVER',
        entityId: params.driverId,
        entityName: 'Driver',
        conflictingRunId: r.id,
        conflictingRunNumber: r.run_number,
        window: r.scheduled_window,
      });
    }
  }

  if (params.truckId) {
    const truckConflicts = await findConflicting('assigned_truck_id', params.truckId);
    for (const r of truckConflicts) {
      conflicts.push({
        type: 'TRUCK',
        entityId: params.truckId,
        entityName: 'Truck',
        conflictingRunId: r.id,
        conflictingRunNumber: r.run_number,
        window: r.scheduled_window,
      });
    }
  }

  if (params.assetId) {
    const assetConflicts = await findConflicting('asset_id', params.assetId);
    for (const r of assetConflicts) {
      conflicts.push({
        type: 'ASSET',
        entityId: params.assetId,
        entityName: 'Asset',
        conflictingRunId: r.id,
        conflictingRunNumber: r.run_number,
        window: r.scheduled_window,
      });
    }
  }

  return { hasConflict: conflicts.length > 0, conflicts };
}

// =====================================================
// RESCHEDULE
// =====================================================

/**
 * Reschedule a run to a new date/window
 */
export async function rescheduleRun(
  runId: string,
  newDate: string,
  newWindow?: string | null,
  reason?: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const run = await getRunById(runId);
    if (!run) throw new Error('Run not found');

    if (['COMPLETED', 'CANCELLED'].includes(run.status)) {
      throw new Error('Cannot reschedule a completed or cancelled run');
    }

    // Check conflicts at new date/window
    const conflictCheck = await checkConflicts({
      date: newDate,
      window: newWindow,
      driverId: run.assigned_driver_id,
      truckId: run.assigned_truck_id,
      assetId: run.asset_id,
      excludeRunId: runId,
    });

    if (conflictCheck.hasConflict) {
      const msgs = conflictCheck.conflicts.map(
        c => `${c.type} conflict with run ${c.conflictingRunNumber || c.conflictingRunId.slice(0, 8)}`
      );
      throw new Error(`Scheduling conflicts: ${msgs.join('; ')}`);
    }

    const oldDate = run.scheduled_date;
    const oldWindow = run.scheduled_window;

    const { error } = await supabase
      .from('runs' as 'orders')
      .update({
        scheduled_date: newDate,
        scheduled_window: newWindow ?? run.scheduled_window,
      } as never)
      .eq('id', runId);

    if (error) throw error;

    await logRunEvent(
      runId,
      'RESCHEDULED',
      null,
      null,
      `Rescheduled from ${oldDate} ${oldWindow || ''} to ${newDate} ${newWindow || ''}${reason ? `. Reason: ${reason}` : ''}`
    );

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =====================================================
// PAUSE / RESUME
// =====================================================

export async function pauseRun(
  runId: string,
  reason: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const run = await getRunById(runId);
    if (!run) throw new Error('Run not found');
    if (!['EN_ROUTE', 'ARRIVED'].includes(run.status)) {
      throw new Error('Can only pause runs that are EN_ROUTE or ARRIVED');
    }

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('runs' as 'orders')
      .update({
        status: 'PAUSED',
        pause_reason: reason,
        paused_at: now,
      } as never)
      .eq('id', runId);
    if (error) throw error;

    await logRunEvent(runId, 'RUN_PAUSED', run.status, 'PAUSED', reason);

    // Log to lifecycle_events
    await supabase.from('lifecycle_events' as never).insert({
      entity_type: 'ORDER',
      entity_id: run.order_id || runId,
      stage_key: 'RUN_PAUSED',
      department: 'DRIVER',
      event_type: 'AUTO_TRIGGER',
      notes: `Run paused: ${reason}`,
    } as never);

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function resumeRun(
  runId: string
): Promise<{ success: boolean; error?: string }> {
  try {
    const run = await getRunById(runId);
    if (!run) throw new Error('Run not found');
    if (run.status !== 'PAUSED') throw new Error('Run is not paused');

    const now = new Date().toISOString();
    const { error } = await supabase
      .from('runs' as 'orders')
      .update({
        status: 'ARRIVED',
        resumed_at: now,
      } as never)
      .eq('id', runId);
    if (error) throw error;

    await logRunEvent(runId, 'RUN_RESUMED', 'PAUSED', 'ARRIVED');

    await supabase.from('lifecycle_events' as never).insert({
      entity_type: 'ORDER',
      entity_id: run.order_id || runId,
      stage_key: 'RUN_RESUMED',
      department: 'DRIVER',
      event_type: 'AUTO_TRIGGER',
      notes: `Run resumed after pause: ${run.pause_reason || 'N/A'}`,
    } as never);

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =====================================================
// YARD HOLD & DUMP RETURN HELPERS
// =====================================================

export async function getYardHoldAssets(): Promise<any[]> {
  const { data, error } = await supabase
    .from('assets_dumpsters')
    .select(`
      *,
      dumpster_sizes!inner (label, size_value),
      yards:current_yard_id (id, name),
      home_yard:home_yard_id (id, name)
    `)
    .eq('current_location_type', 'YARD')
    .eq('asset_status', 'full');

  if (error) {
    console.error('Error fetching yard hold assets:', error);
    return [];
  }
  return data || [];
}

export async function createDumpReturnRun(params: {
  assetId: string;
  yardId: string;
  facilityId?: string;
  scheduledDate: string;
  notes?: string;
}): Promise<{ success: boolean; runId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('runs' as 'orders')
      .insert({
        run_type: 'DUMP_AND_RETURN',
        asset_id: params.assetId,
        scheduled_date: params.scheduledDate,
        origin_type: 'yard',
        origin_yard_id: params.yardId,
        destination_type: 'facility',
        destination_facility_id: params.facilityId || null,
        destination_address: null,
        notes: params.notes || 'Dump & Return from yard hold',
        status: 'DRAFT',
      } as never)
      .select('id')
      .single();

    if (error) throw error;

    // Create required checkpoints
    for (const type of ['PICKUP_POD', 'DUMP_TICKET', 'DELIVERY_POD'] as CheckpointType[]) {
      await supabase.from('run_checkpoints' as 'orders').insert({
        run_id: data.id,
        checkpoint_type: type,
        is_required: true,
      } as never);
    }

    // Update asset status
    await supabase
      .from('assets_dumpsters')
      .update({
        current_run_id: data.id,
        asset_status: 'in_transit',
        last_movement_at: new Date().toISOString(),
      })
      .eq('id', params.assetId);

    // Log inventory movement
    await supabase.from('inventory_movements').insert({
      asset_id: params.assetId,
      from_location_type: 'YARD',
      from_yard_id: params.yardId,
      to_location_type: 'FACILITY',
      to_yard_id: null,
      movement_type: 'dump_return',
      quantity: 1,
      run_id: data.id,
      notes: 'Dump & Return initiated from yard hold',
    } as never);

    // Lifecycle event
    await supabase.from('lifecycle_events' as never).insert({
      entity_type: 'ORDER',
      entity_id: data.id,
      stage_key: 'DUMP_RETURN_STARTED',
      department: 'LOGISTICS',
      event_type: 'AUTO_TRIGGER',
      notes: 'Dump & Return run created from yard hold board',
    } as never);

    return { success: true, runId: data.id };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

// =====================================================
// SMS NOTIFICATION HELPER
// =====================================================

/**
 * Send customer notification on run status change
 */
export async function notifyCustomerOnStatusChange(
  run: Run,
  newStatus: RunStatus
): Promise<void> {
  // Only notify on key statuses
  if (!['EN_ROUTE', 'ARRIVED', 'COMPLETED'].includes(newStatus)) return;
  if (!run.customer_phone) return;

  const messages: Record<string, string> = {
    EN_ROUTE: `Calsan Dumpsters: Your driver is on the way! Track your ${run.run_type === 'DELIVERY' ? 'delivery' : run.run_type === 'PICKUP' ? 'pickup' : 'service'}.`,
    ARRIVED: `Calsan Dumpsters: Your driver has arrived at the jobsite.`,
    COMPLETED: `Calsan Dumpsters: Your ${run.run_type === 'DELIVERY' ? 'delivery' : run.run_type === 'PICKUP' ? 'pickup' : 'service'} is complete. Thank you!`,
  };

  const body = messages[newStatus];
  if (!body) return;

  try {
    await supabase.functions.invoke('ghl-send-outbound', {
      body: {
        channel: 'sms',
        phone: run.customer_phone,
        body,
        entity_type: 'order',
        entity_id: run.id,
      },
    });
  } catch (err) {
    console.error('SMS notification failed (non-blocking):', err);
  }
}
