// ============================================================
// DUMP TICKET SERVICE — Upload, store, and link to order/timeline
// Handles driver dump ticket uploads → documents table → timeline
// ============================================================

import { supabase } from '@/integrations/supabase/client';

export interface DumpTicketDetails {
  facilityName?: string;
  tons?: number;
  dumpFee?: number;
  ticketNumber?: string;
  datetime?: string;
  materialStream?: string;
}

/**
 * Upload a dump ticket photo and create a document record + timeline event.
 * Returns the public URL or null on failure.
 */
export async function uploadDumpTicket(params: {
  orderId: string;
  file: File;
  details?: DumpTicketDetails;
  uploadedBy?: string;
}): Promise<string | null> {
  const { orderId, file, details, uploadedBy } = params;
  const ext = file.name.split('.').pop() ?? 'jpg';
  const fileName = `${orderId}/dump-ticket-${Date.now()}.${ext}`;

  // 1. Upload to storage
  const { error: uploadErr } = await supabase.storage
    .from('dump-tickets')
    .upload(fileName, file, { upsert: false });

  if (uploadErr) {
    console.error('Dump ticket upload failed:', uploadErr);
    return null;
  }

  const { data: urlData } = supabase.storage
    .from('dump-tickets')
    .getPublicUrl(fileName);
  const fileUrl = urlData.publicUrl;

  // 2. Create document record
  const { error: docErr } = await supabase.from('documents').insert({
    order_id: orderId,
    doc_type: 'dump_ticket',
    file_url: fileUrl,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type,
    uploaded_by: uploadedBy,
    notes: details?.ticketNumber ? `Ticket #${details.ticketNumber}` : null,
  });

  if (docErr) {
    console.error('Document record insert failed:', docErr);
  }

  // 3. Update order with dump details + ticket URL
  const updatePayload: Record<string, unknown> = {
    dump_ticket_url: fileUrl,
  };

  if (details) {
    updatePayload.dump_details = {
      facility_name: details.facilityName,
      tons: details.tons,
      dump_fee: details.dumpFee,
      ticket_number: details.ticketNumber,
      datetime: details.datetime,
      material_stream: details.materialStream,
    };
  }

  const { error: orderErr } = await supabase
    .from('orders')
    .update(updatePayload)
    .eq('id', orderId);

  if (orderErr) {
    console.error('Order dump details update failed:', orderErr);
  }

  return fileUrl;
}

/**
 * Check if a customer should see dump ticket for their order.
 * Only visible when order is completed or admin has flagged it.
 */
export async function canCustomerViewDumpTicket(orderId: string): Promise<boolean> {
  const { data, error } = await supabase
    .from('orders')
    .select('status, portal_show_dump_ticket')
    .eq('id', orderId)
    .single();

  if (error || !data) return false;

  return data.status === 'completed' || data.portal_show_dump_ticket === true;
}
