import { supabase } from '@/integrations/supabase/client';
import { logOrderEvent, logScheduleChange } from './orderEventService';
import { createAuditLog } from './auditLog';

interface ApproveRequestParams {
  requestId: string;
  orderId: string;
  resolutionNotes: string;
  // Schedule updates
  newDeliveryDate?: string | null;
  newDeliveryWindow?: string | null;
  newPickupDate?: string | null;
  newPickupWindow?: string | null;
  // Current values for audit
  currentDeliveryDate?: string | null;
  currentDeliveryWindow?: string | null;
  currentPickupDate?: string | null;
  currentPickupWindow?: string | null;
}

interface DenyRequestParams {
  requestId: string;
  resolutionNotes: string;
}

/**
 * Approve a service request and update the order schedule
 */
export async function approveServiceRequest({
  requestId,
  orderId,
  resolutionNotes,
  newDeliveryDate,
  newDeliveryWindow,
  newPickupDate,
  newPickupWindow,
  currentDeliveryDate,
  currentDeliveryWindow,
  currentPickupDate,
  currentPickupWindow,
}: ApproveRequestParams): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Update the service request status
    const { error: requestError } = await supabase
      .from('service_requests')
      .update({
        status: 'approved',
        resolution_notes: resolutionNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (requestError) {
      throw new Error(`Failed to update request: ${requestError.message}`);
    }

    // 2. Build order updates
    const orderUpdates: Record<string, unknown> = {};
    let scheduleChanged = false;

    if (newDeliveryDate !== undefined) {
      orderUpdates.scheduled_delivery_date = newDeliveryDate;
      scheduleChanged = true;
    }
    if (newDeliveryWindow !== undefined) {
      orderUpdates.scheduled_delivery_window = newDeliveryWindow;
    }
    if (newPickupDate !== undefined) {
      orderUpdates.scheduled_pickup_date = newPickupDate;
      scheduleChanged = true;
    }
    if (newPickupWindow !== undefined) {
      orderUpdates.scheduled_pickup_window = newPickupWindow;
    }

    // 3. Update order if there are schedule changes
    if (Object.keys(orderUpdates).length > 0) {
      const { error: orderError } = await supabase
        .from('orders')
        .update(orderUpdates)
        .eq('id', orderId);

      if (orderError) {
        throw new Error(`Failed to update order: ${orderError.message}`);
      }
    }

    // 4. Log schedule change event
    if (scheduleChanged) {
      await logScheduleChange({
        orderId,
        action: 'confirmed',
        oldDate: currentDeliveryDate || currentPickupDate,
        oldWindow: currentDeliveryWindow || currentPickupWindow,
        newDate: newDeliveryDate || newPickupDate,
        newWindow: newDeliveryWindow || newPickupWindow,
        reason: resolutionNotes,
      });

      await logOrderEvent({
        orderId,
        eventType: 'SCHEDULE_CHANGED',
        message: `Schedule updated via approved request: ${resolutionNotes}`,
        beforeJson: {
          scheduled_delivery_date: currentDeliveryDate,
          scheduled_delivery_window: currentDeliveryWindow,
          scheduled_pickup_date: currentPickupDate,
          scheduled_pickup_window: currentPickupWindow,
        },
        afterJson: {
          scheduled_delivery_date: newDeliveryDate ?? currentDeliveryDate,
          scheduled_delivery_window: newDeliveryWindow ?? currentDeliveryWindow,
          scheduled_pickup_date: newPickupDate ?? currentPickupDate,
          scheduled_pickup_window: newPickupWindow ?? currentPickupWindow,
        },
      });
    }

    // 5. Create audit log
    await createAuditLog({
      action: 'request_approved',
      entityType: 'service_request',
      entityId: requestId,
      beforeData: { status: 'pending' },
      afterData: {
        status: 'approved',
        resolution_notes: resolutionNotes,
        order_id: orderId,
      },
      changesSummary: `Approved request and updated schedule: ${resolutionNotes}`,
    });

    return { success: true };
  } catch (err) {
    console.error('Error approving request:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Deny a service request
 */
export async function denyServiceRequest({
  requestId,
  resolutionNotes,
}: DenyRequestParams): Promise<{ success: boolean; error?: string }> {
  try {
    const { error } = await supabase
      .from('service_requests')
      .update({
        status: 'denied',
        resolution_notes: resolutionNotes,
        reviewed_at: new Date().toISOString(),
      })
      .eq('id', requestId);

    if (error) {
      throw new Error(`Failed to deny request: ${error.message}`);
    }

    await createAuditLog({
      action: 'request_denied',
      entityType: 'service_request',
      entityId: requestId,
      beforeData: { status: 'pending' },
      afterData: { status: 'denied', resolution_notes: resolutionNotes },
      changesSummary: `Denied request: ${resolutionNotes}`,
    });

    return { success: true };
  } catch (err) {
    console.error('Error denying request:', err);
    return { success: false, error: (err as Error).message };
  }
}

/**
 * Fetch service requests with related order/quote data
 */
export async function fetchServiceRequests(
  statusFilter?: string
): Promise<{ data: ServiceRequestWithOrder[]; error?: string }> {
  try {
    let query = supabase
      .from('service_requests')
      .select(`
        *,
        orders (
          id,
          status,
          scheduled_delivery_date,
          scheduled_delivery_window,
          scheduled_pickup_date,
          scheduled_pickup_window,
          quotes!orders_quote_id_fkey (
            customer_name,
            customer_phone,
            delivery_address,
            zip_code
          )
        )
      `)
      .order('created_at', { ascending: false });

    if (statusFilter && statusFilter !== 'all') {
      query = query.eq('status', statusFilter);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(error.message);
    }

    return { data: data as ServiceRequestWithOrder[] };
  } catch (err) {
    console.error('Error fetching requests:', err);
    return { data: [], error: (err as Error).message };
  }
}

export interface ServiceRequestWithOrder {
  id: string;
  order_id: string;
  request_type: string;
  status: string;
  priority: string | null;
  notes: string | null;
  preferred_date: string | null;
  preferred_window: string | null;
  change_type: string | null;
  requested_delivery_date: string | null;
  requested_delivery_window: string | null;
  requested_pickup_date: string | null;
  requested_pickup_window: string | null;
  customer_phone: string | null;
  resolution_notes: string | null;
  created_at: string;
  reviewed_at: string | null;
  orders: {
    id: string;
    status: string;
    scheduled_delivery_date: string | null;
    scheduled_delivery_window: string | null;
    scheduled_pickup_date: string | null;
    scheduled_pickup_window: string | null;
    quotes: {
      customer_name: string | null;
      customer_phone: string | null;
      delivery_address: string | null;
      zip_code: string | null;
    } | null;
  } | null;
}
