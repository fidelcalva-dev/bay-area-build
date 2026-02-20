/**
 * Fleet Service — Truck assignments, inspections, issues, maintenance
 */
import { supabase } from '@/integrations/supabase/client';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyQuery = any;

// =====================================================
// TYPES
// =====================================================

export type TruckStatus = 'AVAILABLE' | 'IN_SERVICE' | 'OUT_OF_SERVICE' | 'MAINTENANCE';
export type InspectionStatus = 'PASS' | 'FAIL' | 'UNSAFE';
export type IssueSeverity = 'LOW' | 'MED' | 'HIGH' | 'SAFETY';
export type IssueStatus = 'OPEN' | 'IN_PROGRESS' | 'RESOLVED' | 'OUT_OF_SERVICE';
export type IssueCategory = 'BRAKES' | 'TIRES' | 'LIGHTS' | 'HYDRAULIC' | 'ENGINE' | 'TRANSMISSION' | 'OTHER';
export type WorkOrderStatus = 'OPEN' | 'IN_PROGRESS' | 'WAITING_PARTS' | 'COMPLETED';

export interface Truck {
  id: string;
  truck_number: string;
  truck_code: string | null;
  truck_type: string | null;
  truck_status: string | null;
  license_plate: string | null;
  plate_number: string | null;
  vin: string | null;
  year: number | null;
  make: string | null;
  model: string | null;
  insurance_active: boolean;
  insurance_exp_date: string | null;
  registration_exp_date: string | null;
  dot_compliance_status: string | null;
  last_inspection_at: string | null;
  is_active: boolean;
  home_yard_id: string | null;
  current_yard_id: string | null;
  odometer_miles: number | null;
}

export interface TruckAssignment {
  id: string;
  driver_id: string;
  truck_id: string;
  assigned_at: string;
  unassigned_at: string | null;
  is_active: boolean;
  trucks?: Truck;
}

export interface ChecklistItem {
  id: string;
  label: string;
  category: 'critical' | 'standard';
  status: 'pass' | 'fail' | 'na';
  notes?: string;
}

export interface VehicleInspection {
  id: string;
  driver_id: string;
  truck_id: string;
  inspection_type: string;
  status: InspectionStatus;
  checklist_json: ChecklistItem[];
  notes: string | null;
  signature_name: string | null;
  created_at: string;
  trucks?: Truck;
  drivers?: { name: string };
}

export interface VehicleIssue {
  id: string;
  truck_id: string;
  reported_by_driver_id: string | null;
  issue_category: IssueCategory;
  severity: IssueSeverity;
  status: IssueStatus;
  description: string | null;
  created_at: string;
  resolved_at: string | null;
  resolved_by: string | null;
  trucks?: Truck;
  drivers?: { name: string };
  photos?: { id: string; photo_url: string }[];
}

export interface MaintenanceWorkOrder {
  id: string;
  truck_id: string;
  issue_id: string | null;
  assigned_to_user_id: string | null;
  status: WorkOrderStatus;
  labor_cost: number;
  parts_cost: number;
  total_cost: number;
  notes: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  trucks?: Truck;
  vehicle_issues?: VehicleIssue;
}

// =====================================================
// PRE-TRIP INSPECTION CHECKLIST TEMPLATE
// =====================================================

export const INSPECTION_CHECKLIST: Omit<ChecklistItem, 'status'>[] = [
  { id: 'brakes', label: 'Brakes (pedal, parking)', category: 'critical' },
  { id: 'tires', label: 'Tires (pressure, tread, condition)', category: 'critical' },
  { id: 'lights', label: 'Lights (head, tail, brake, turn)', category: 'critical' },
  { id: 'hydraulic', label: 'Hydraulic System (hoses, fluid, operation)', category: 'critical' },
  { id: 'steering', label: 'Steering (play, responsiveness)', category: 'critical' },
  { id: 'mirrors', label: 'Mirrors (clean, adjusted)', category: 'standard' },
  { id: 'horn', label: 'Horn (operational)', category: 'standard' },
  { id: 'wipers', label: 'Wipers & Washer Fluid', category: 'standard' },
  { id: 'seatbelt', label: 'Seatbelt (functional)', category: 'standard' },
  { id: 'fluid_levels', label: 'Fluid Levels (oil, coolant, DEF)', category: 'standard' },
  { id: 'exhaust', label: 'Exhaust System (leaks, noise)', category: 'standard' },
  { id: 'body_damage', label: 'Body / Frame (damage, cracks)', category: 'standard' },
  { id: 'fire_extinguisher', label: 'Fire Extinguisher (present, charged)', category: 'standard' },
  { id: 'backup_alarm', label: 'Backup Alarm / Camera', category: 'standard' },
  { id: 'cab_clean', label: 'Cab Clean & Organized', category: 'standard' },
];

// =====================================================
// TRUCK QUERIES
// =====================================================

export async function getAvailableTrucks(): Promise<Truck[]> {
  const query: AnyQuery = supabase.from('trucks');
  const { data, error } = await query
    .select('*')
    .eq('is_active', true)
    .order('truck_number');
  if (error) throw error;
  return ((data || []) as Truck[]).filter(t => ['AVAILABLE', 'IN_SERVICE'].includes(t.truck_status || ''));
}

export async function getTruckById(truckId: string): Promise<Truck | null> {
  const { data, error } = await supabase
    .from('trucks' as 'orders')
    .select('*')
    .eq('id', truckId)
    .maybeSingle() as { data: any; error: any };
  if (error) throw error;
  return data as Truck | null;
}

export async function getAllTrucks(): Promise<Truck[]> {
  const { data, error } = await supabase
    .from('trucks' as 'orders')
    .select('*')
    .order('truck_number') as { data: any; error: any };
  if (error) throw error;
  return (data || []) as Truck[];
}

export async function updateTruckStatus(truckId: string, status: string): Promise<void> {
  const { error } = await supabase
    .from('trucks' as 'orders')
    .update({ truck_status: status } as never)
    .eq('id', truckId);
  if (error) throw error;
}

// =====================================================
// TRUCK ASSIGNMENTS
// =====================================================

export async function getActiveAssignment(driverId: string): Promise<TruckAssignment | null> {
  const query: AnyQuery = supabase.from('driver_truck_assignments');
  const { data, error } = await query
    .select('*, trucks(*)')
    .eq('driver_id', driverId)
    .eq('is_active', true)
    .maybeSingle();
  if (error) throw error;
  return data as TruckAssignment | null;
}

export async function assignTruck(driverId: string, truckId: string): Promise<{ success: boolean; error?: string }> {
  try {
    // Deactivate any existing assignment
    await supabase
      .from('driver_truck_assignments' as 'orders')
      .update({ is_active: false, unassigned_at: new Date().toISOString() } as never)
      .eq('driver_id', driverId)
      .eq('is_active', true);

    // Create new assignment
    const { error } = await supabase
      .from('driver_truck_assignments' as 'orders')
      .insert({ driver_id: driverId, truck_id: truckId } as never);
    if (error) throw error;

    // Update truck status
    await supabase
      .from('trucks' as 'orders')
      .update({ truck_status: 'IN_SERVICE', assigned_driver_id: driverId } as never)
      .eq('id', truckId);

    // Log timeline event
    await logFleetEvent('TRUCK_ASSIGNED', truckId, { driver_id: driverId });

    return { success: true };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function unassignTruck(driverId: string): Promise<void> {
  const assignment = await getActiveAssignment(driverId);
  if (!assignment) return;

  await supabase
    .from('driver_truck_assignments' as 'orders')
    .update({ is_active: false, unassigned_at: new Date().toISOString() } as never)
    .eq('id', assignment.id);

  await supabase
    .from('trucks' as 'orders')
    .update({ truck_status: 'AVAILABLE', assigned_driver_id: null } as never)
    .eq('id', assignment.truck_id);
}

// =====================================================
// INSPECTIONS
// =====================================================

export async function submitInspection(params: {
  driverId: string;
  truckId: string;
  checklist: ChecklistItem[];
  notes?: string;
  signatureName: string;
}): Promise<{ success: boolean; status: InspectionStatus; error?: string }> {
  try {
    const criticalFails = params.checklist.filter(
      i => i.category === 'critical' && i.status === 'fail'
    );
    const anyFails = params.checklist.some(i => i.status === 'fail');
    
    const status: InspectionStatus = criticalFails.length > 0 ? 'UNSAFE' : anyFails ? 'FAIL' : 'PASS';

    const { error } = await supabase
      .from('vehicle_inspections' as 'orders')
      .insert({
        driver_id: params.driverId,
        truck_id: params.truckId,
        inspection_type: 'PRE_TRIP',
        status,
        checklist_json: params.checklist,
        notes: params.notes || null,
        signature_name: params.signatureName,
      } as never);
    if (error) throw error;

    // Update truck last inspection
    await supabase
      .from('trucks' as 'orders')
      .update({ last_inspection_at: new Date().toISOString() } as never)
      .eq('id', params.truckId);

    // Log event
    await logFleetEvent('PRE_TRIP_SUBMITTED', params.truckId, { status, driver_id: params.driverId });

    // If UNSAFE: mark truck OUT_OF_SERVICE + create safety issue
    if (status === 'UNSAFE') {
      await updateTruckStatus(params.truckId, 'OUT_OF_SERVICE');
      await supabase
        .from('trucks' as 'orders')
        .update({ dot_compliance_status: 'NEEDS_ATTENTION' } as never)
        .eq('id', params.truckId);

      const failedItems = criticalFails.map(i => i.label).join(', ');

      // Create vehicle issue
      const { data: issueData } = await supabase
        .from('vehicle_issues' as 'orders')
        .insert({
          truck_id: params.truckId,
          reported_by_driver_id: params.driverId,
          issue_category: 'OTHER',
          severity: 'SAFETY',
          status: 'OUT_OF_SERVICE',
          description: `Pre-trip inspection UNSAFE. Failed critical items: ${failedItems}`,
        } as never)
        .select('id')
        .single();

      // Create work order
      if (issueData) {
        await supabase
          .from('maintenance_work_orders' as 'orders')
          .insert({
            truck_id: params.truckId,
            issue_id: (issueData as { id: string }).id,
            status: 'OPEN',
            notes: `Auto-created from failed pre-trip inspection. Critical failures: ${failedItems}`,
          } as never);
      }

      await logFleetEvent('INSPECTION_FAILED', params.truckId, { failed_items: failedItems });
      await logFleetEvent('TRUCK_OUT_OF_SERVICE', params.truckId, { reason: 'Pre-trip inspection UNSAFE' });
    }

    return { success: true, status };
  } catch (err) {
    return { success: false, status: 'PASS', error: (err as Error).message };
  }
}

export async function getInspectionsForTruck(truckId: string): Promise<VehicleInspection[]> {
  const query: AnyQuery = supabase.from('vehicle_inspections');
  const { data, error } = await query
    .select('*, trucks(truck_number), drivers:driver_id(name)')
    .eq('truck_id', truckId)
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) throw error;
  return (data || []) as unknown as VehicleInspection[];
}

// =====================================================
// VEHICLE ISSUES
// =====================================================

export async function reportIssue(params: {
  truckId: string;
  driverId: string;
  category: IssueCategory;
  severity: IssueSeverity;
  description: string;
  photoUrls?: string[];
}): Promise<{ success: boolean; issueId?: string; error?: string }> {
  try {
    const { data, error } = await supabase
      .from('vehicle_issues' as 'orders')
      .insert({
        truck_id: params.truckId,
        reported_by_driver_id: params.driverId,
        issue_category: params.category,
        severity: params.severity,
        status: params.severity === 'SAFETY' ? 'OUT_OF_SERVICE' : 'OPEN',
        description: params.description,
      } as never)
      .select('id')
      .single();
    if (error) throw error;

    const issueId = (data as { id: string }).id;

    // Upload photos
    if (params.photoUrls?.length) {
      for (const url of params.photoUrls) {
        await supabase
          .from('vehicle_issue_photos' as 'orders')
          .insert({ issue_id: issueId, photo_url: url } as never);
      }
    }

    // If safety severity, mark truck OOS
    if (params.severity === 'SAFETY') {
      await updateTruckStatus(params.truckId, 'OUT_OF_SERVICE');
      await logFleetEvent('TRUCK_OUT_OF_SERVICE', params.truckId, { reason: `Safety issue: ${params.category}` });
    }

    // Create work order for HIGH/SAFETY
    if (['HIGH', 'SAFETY'].includes(params.severity)) {
      await supabase
        .from('maintenance_work_orders' as 'orders')
        .insert({
          truck_id: params.truckId,
          issue_id: issueId,
          status: 'OPEN',
          notes: `Auto-created from driver report: ${params.category} - ${params.description}`,
        } as never);
      await logFleetEvent('WORK_ORDER_CREATED', params.truckId, { issue_id: issueId });
    }

    await logFleetEvent('ISSUE_CREATED', params.truckId, {
      issue_id: issueId,
      category: params.category,
      severity: params.severity,
    });

    return { success: true, issueId };
  } catch (err) {
    return { success: false, error: (err as Error).message };
  }
}

export async function getIssuesForTruck(truckId: string): Promise<VehicleIssue[]> {
  const query: AnyQuery = supabase.from('vehicle_issues');
  const { data, error } = await query
    .select('*, trucks(truck_number), drivers:reported_by_driver_id(name)')
    .eq('truck_id', truckId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as VehicleIssue[];
}

export async function getAllIssues(statusFilter?: string): Promise<VehicleIssue[]> {
  const query: AnyQuery = supabase.from('vehicle_issues');
  let q = query
    .select('*, trucks(truck_number, truck_type), drivers:reported_by_driver_id(name)')
    .order('created_at', { ascending: false });
  if (statusFilter && statusFilter !== 'ALL') q = q.eq('status', statusFilter);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as VehicleIssue[];
}

export async function updateIssueStatus(issueId: string, status: IssueStatus, resolvedBy?: string): Promise<void> {
  const update: Record<string, unknown> = { status };
  if (status === 'RESOLVED') {
    update.resolved_at = new Date().toISOString();
    update.resolved_by = resolvedBy || null;
  }
  const { error } = await supabase
    .from('vehicle_issues' as 'orders')
    .update(update as never)
    .eq('id', issueId);
  if (error) throw error;
}

// =====================================================
// WORK ORDERS
// =====================================================

export async function getAllWorkOrders(statusFilter?: string): Promise<MaintenanceWorkOrder[]> {
  const query: AnyQuery = supabase.from('maintenance_work_orders');
  let q = query
    .select('*, trucks(truck_number, truck_type), vehicle_issues(issue_category, severity, description)')
    .order('created_at', { ascending: false });
  if (statusFilter && statusFilter !== 'ALL') q = q.eq('status', statusFilter);
  const { data, error } = await q;
  if (error) throw error;
  return (data || []) as unknown as MaintenanceWorkOrder[];
}

export async function getWorkOrdersForTruck(truckId: string): Promise<MaintenanceWorkOrder[]> {
  const query: AnyQuery = supabase.from('maintenance_work_orders');
  const { data, error } = await query
    .select('*, vehicle_issues(issue_category, severity, description)')
    .eq('truck_id', truckId)
    .order('created_at', { ascending: false });
  if (error) throw error;
  return (data || []) as unknown as MaintenanceWorkOrder[];
}

export async function updateWorkOrder(id: string, updates: Partial<MaintenanceWorkOrder>): Promise<void> {
  const update: Record<string, unknown> = { ...updates, updated_at: new Date().toISOString() };
  if (updates.status === 'COMPLETED') update.completed_at = new Date().toISOString();
  if (updates.status === 'IN_PROGRESS' && !updates.started_at) update.started_at = new Date().toISOString();
  // Recalculate total
  if (updates.labor_cost !== undefined || updates.parts_cost !== undefined) {
    update.total_cost = (updates.labor_cost || 0) + (updates.parts_cost || 0);
  }
  delete update.trucks;
  delete update.vehicle_issues;
  delete update.id;

  const { error } = await supabase
    .from('maintenance_work_orders' as 'orders')
    .update(update as never)
    .eq('id', id);
  if (error) throw error;
}

export async function createWorkOrder(params: {
  truckId: string;
  issueId?: string;
  notes?: string;
}): Promise<string> {
  const { data, error } = await supabase
    .from('maintenance_work_orders' as 'orders')
    .insert({
      truck_id: params.truckId,
      issue_id: params.issueId || null,
      status: 'OPEN',
      notes: params.notes || null,
    } as never)
    .select('id')
    .single();
  if (error) throw error;
  await logFleetEvent('WORK_ORDER_CREATED', params.truckId, { work_order_id: (data as { id: string }).id });
  return (data as { id: string }).id;
}

export async function completeWorkOrderAndReturnTruck(workOrderId: string, truckId: string): Promise<void> {
  await updateWorkOrder(workOrderId, { status: 'COMPLETED' } as any);
  await updateTruckStatus(truckId, 'AVAILABLE');
  await supabase
    .from('trucks' as 'orders')
    .update({ dot_compliance_status: 'OK' } as never)
    .eq('id', truckId);
  
  // Resolve linked issues
  const query: AnyQuery = supabase.from('maintenance_work_orders');
  const { data: wo } = await query.select('issue_id').eq('id', workOrderId).single();
  if (wo?.issue_id) {
    await updateIssueStatus(wo.issue_id, 'RESOLVED');
  }

  await logFleetEvent('WORK_ORDER_COMPLETED', truckId, { work_order_id: workOrderId });
  await logFleetEvent('TRUCK_RETURNED_TO_SERVICE', truckId, {});
}

// =====================================================
// VEHICLE DOCUMENTS
// =====================================================

export async function getVehicleDocuments(truckId: string) {
  const query: AnyQuery = supabase.from('vehicle_documents');
  const { data, error } = await query
    .select('*')
    .eq('truck_id', truckId)
    .order('uploaded_at', { ascending: false });
  if (error) throw error;
  return data || [];
}

// =====================================================
// TIMELINE EVENT LOGGING
// =====================================================

async function logFleetEvent(eventType: string, truckId: string, metadata: Record<string, unknown>): Promise<void> {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    await supabase
      .from('run_events' as 'orders')
      .insert({
        run_id: truckId, // Using truck_id as entity reference
        event_type: eventType,
        actor_id: user?.id || null,
        metadata: { ...metadata, entity_type: 'TRUCK' },
      } as never);
  } catch {
    // Non-blocking
  }
}

// =====================================================
// DASHBOARD STATS
// =====================================================

export async function getFleetStats(): Promise<{
  available: number;
  inService: number;
  outOfService: number;
  maintenance: number;
  openIssues: number;
  activeWorkOrders: number;
}> {
  const [trucks, issues, workOrders] = await Promise.all([
    getAllTrucks(),
    getAllIssues(),
    getAllWorkOrders(),
  ]);

  return {
    available: trucks.filter(t => t.truck_status === 'AVAILABLE').length,
    inService: trucks.filter(t => t.truck_status === 'IN_SERVICE').length,
    outOfService: trucks.filter(t => t.truck_status === 'OUT_OF_SERVICE').length,
    maintenance: trucks.filter(t => t.truck_status === 'MAINTENANCE').length,
    openIssues: issues.filter(i => ['OPEN', 'IN_PROGRESS', 'OUT_OF_SERVICE'].includes(i.status)).length,
    activeWorkOrders: workOrders.filter(w => ['OPEN', 'IN_PROGRESS', 'WAITING_PARTS'].includes(w.status)).length,
  };
}
