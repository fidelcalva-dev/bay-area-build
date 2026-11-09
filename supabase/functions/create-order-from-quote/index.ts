import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { verifyDraftToken } from "../_shared/quote-draft-token.ts";
import { isTestContact } from "../_shared/test-transport.ts";
import { checkScheduleLink } from "../_shared/schedule-link.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CreateOrderRequest {
  quoteId: string;
}

interface OrderSnapshot {
  quote_id: string;
  customer_id: string | null;
  scheduled_delivery_date: string | null;
  scheduled_delivery_window: string | null;
  scheduled_pickup_date: string | null;
  assigned_yard_id: string | null;
  status: string;
  final_total: number | null;
  amount_due: number;
  amount_paid: number;
  balance_due: number;
  payment_status: string;
  route_notes: string | null;
  driver_notes: string | null;
  text_before_arrival: boolean;
}

// =====================================================
// CAL 009 — Authorization gate.
// A caller may convert a quote into an order only if:
//   (a) it presents the server-signed token issued by save-quote for THIS quote
//       (the website visitor who just saved it), or
//   (b) it is a signed-in, active staff member with a role allowed to convert.
// Roles come from public.user_roles on the server; nothing sent by the browser
// is trusted. Without either proof the function refuses and changes nothing.
// =====================================================
const UUID_RE = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const STAFF_CONVERT_ROLES = [
  "admin", "system_admin", "owner", "executive", "ops_admin",
  "sales", "sales_admin", "sales_rep", "dispatcher", "cs", "cs_agent", "customer_service",
];
// Statuses a visitor (token path) may still convert. Staff may convert any
// quote that is not cancelled/lost/expired.
const VISITOR_CONVERTIBLE = new Set(["draft", "pending", "saved", "scheduled", "checkout_started"]);
const NEVER_CONVERTIBLE = new Set(["cancelled", "canceled", "lost", "expired", "rejected", "declined"]);

function json(body: unknown, status = 200) {
  return new Response(JSON.stringify(body), {
    status, headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}

type Caller =
  | { kind: "staff"; userId: string }
  | { kind: "visitor" }
  | { kind: "schedule_link"; linkId: string }
  | { kind: "denied"; status: number; code: string };

// deno-lint-ignore no-explicit-any
async function resolveCaller(req: Request, admin: any, quoteId: string, draftToken: unknown, scheduleToken: unknown): Promise<Caller> {
  // (b) Staff session?
  const auth = req.headers.get("Authorization") || "";
  const jwt = auth.startsWith("Bearer ") ? auth.slice(7) : "";
  if (jwt) {
    const { data } = await admin.auth.getUser(jwt);
    const userId = data?.user?.id as string | undefined;
    if (userId) {
      const { data: allowed } = await admin.rpc("has_any_role", { _user_id: userId, _roles: STAFF_CONVERT_ROLES });
      if (allowed === true) {
        const { data: staffRow } = await admin
          .from("staff_users").select("status").eq("user_id", userId).maybeSingle();
        if (!staffRow || staffRow.status === "active") return { kind: "staff", userId };
        return { kind: "denied", status: 403, code: "staff_inactive" };
      }
    }
  }
  // (c) CAL 010: schedule link issued by staff for THIS quote (hash lookup,
  // expiry and revocation checked in the database). Possession of the link is
  // not identity proof; it only authorizes converting the quote it was issued for.
  if (typeof scheduleToken === "string" && scheduleToken !== "") {
    const link = await checkScheduleLink(admin, scheduleToken);
    if (!link.ok) return { kind: "denied", status: link.status, code: link.code };
    if (link.row.quote_id !== quoteId) return { kind: "denied", status: 403, code: "link_quote_mismatch" };
    return { kind: "schedule_link", linkId: link.row.id };
  }
  // (a) Signed quote token from save-quote?
  if (draftToken !== undefined && draftToken !== null && draftToken !== "") {
    const check = await verifyDraftToken(draftToken, quoteId);
    if (check.ok) return { kind: "visitor" };
    return { kind: "denied", status: check.status, code: check.code };
  }
  return { kind: "denied", status: 401, code: "not_authorized" };
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // deno-lint-ignore no-explicit-any
    const body: any = await req.json().catch(() => ({}));
    const quoteId: string = body.quoteId ?? body.quote_id;
    const draftToken = body.draftToken ?? body.draft_token;
    const scheduleToken = body.scheduleToken ?? body.schedule_token;

    if (!quoteId) return json({ error: "quoteId is required", code: "missing_quote_id" }, 400);
    if (typeof quoteId !== "string" || !UUID_RE.test(quoteId)) {
      return json({ error: "Invalid quote reference", code: "invalid_quote_id" }, 400);
    }

    const caller = await resolveCaller(req, supabase, quoteId, draftToken, scheduleToken);
    if (caller.kind === "denied") {
      console.warn(`[create-order-from-quote] denied quote=${quoteId} code=${caller.code}`);
      return json({ error: "Not authorized to create an order for this quote", code: caller.code }, caller.status);
    }
    const actorRole = caller.kind === "staff" ? "staff" : caller.kind === "schedule_link" ? "customer_link" : "customer";

    // 1. Check if order already exists for this quote (prevent duplicates)
    const { data: existingOrder } = await supabase
      .from("orders")
      .select("id, status")
      .eq("quote_id", quoteId)
      .maybeSingle();

    if (existingOrder) {
      console.log(`Order already exists for quote ${quoteId}: ${existingOrder.id}`);
      return json({
        success: true,
        orderId: existingOrder.id,
        status: existingOrder.status,
        alreadyExists: true,
        message: "Order already exists for this quote",
      });
    }

    // 2. Fetch the quote with all relevant data
    const { data: quote, error: quoteError } = await supabase
      .from("quotes")
      .select(`
        *,
        dumpster_sizes:size_id (id, label, size_value, base_price, included_tons)
      `)
      .eq("id", quoteId)
      .single();

    if (quoteError || !quote) {
      console.error("Quote not found:", quoteError);
      return new Response(
        JSON.stringify({ error: "Quote not found" }),
        { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const quoteStatus = String(quote.status || "").toLowerCase();
    if (NEVER_CONVERTIBLE.has(quoteStatus) ||
        (caller.kind !== "staff" && !VISITOR_CONVERTIBLE.has(quoteStatus))) {
      return json({ error: "This quote can no longer be converted", code: "quote_not_convertible", status: quoteStatus }, 409);
    }

    // 3. Look up yard by yard_id or yard_name
    let assignedYardId: string | null = null;
    if (quote.yard_id) {
      const { data: yard } = await supabase
        .from("yards")
        .select("id")
        .eq("id", quote.yard_id)
        .single();
      if (yard) assignedYardId = yard.id;
    } else if (quote.yard_name) {
      const { data: yard } = await supabase
        .from("yards")
        .select("id")
        .ilike("name", `%${quote.yard_name}%`)
        .limit(1)
        .single();
      if (yard) assignedYardId = yard.id;
    }

    // 4. Find or create customer
    let customerId: string | null = quote.customer_id;
    // CAL 010: the phone comes from the visitor; keep only phone characters so it
    // cannot inject extra conditions into the lookup filter below.
    const safePhone = String(quote.customer_phone || "").replace(/[^0-9+]/g, "");
    if (!customerId && safePhone.length >= 7) {
      // Try to find customer by phone
      const { data: existingCustomer } = await supabase
        .from("customers")
        .select("id")
        .or(`phone.eq.${safePhone},billing_phone.eq.${safePhone}`)
        .limit(1)
        .single();

      if (existingCustomer) {
        customerId = existingCustomer.id;
      } else {
        // Create a placeholder customer record
        const { data: newCustomer } = await supabase
          .from("customers")
          .insert({
            phone: quote.customer_phone,
            billing_phone: quote.customer_phone,
            billing_email: quote.customer_email,
            company_name: quote.company_name,
            customer_type: quote.user_type === "contractor" ? "contractor" : "homeowner",
            user_id: crypto.randomUUID(), // Placeholder for phone-based customers
          })
          .select("id")
          .single();
        
        if (newCustomer) customerId = newCustomer.id;
      }
    }

    // 5. Build route notes from quote data
    const routeNotes: string[] = [];
    if (quote.truck_distance_miles) {
      routeNotes.push(`Distance: ${quote.truck_distance_miles.toFixed(1)} mi`);
    }
    if (quote.truck_duration_min) {
      routeNotes.push(`ETA: ${quote.truck_duration_min}-${quote.truck_duration_max || quote.truck_duration_min + 10} min`);
    }
    if (quote.toll_surcharge && quote.toll_surcharge > 0) {
      routeNotes.push(`Toll: $${quote.toll_surcharge}`);
    }
    if (quote.distance_bracket) {
      routeNotes.push(`Zone: ${quote.distance_bracket}`);
    }

    // 6. Build driver notes from placement
    const driverNotes: string[] = [];
    if (quote.placement_type) {
      driverNotes.push(`Placement: ${quote.placement_type}`);
    }
    if (quote.placement_notes) {
      driverNotes.push(quote.placement_notes);
    }
    if (quote.delivery_address) {
      driverNotes.push(`Address: ${quote.delivery_address}`);
    }

    // 7. Create the order with billing initialized
    const orderTotal = quote.subtotal || quote.estimated_min || 0;
    const orderData: OrderSnapshot = {
      quote_id: quoteId,
      customer_id: customerId,
      scheduled_delivery_date: quote.preferred_delivery_date,
      scheduled_delivery_window: quote.preferred_delivery_window,
      scheduled_pickup_date: quote.suggested_pickup_date,
      assigned_yard_id: assignedYardId,
      status: "scheduled_requested",
      final_total: orderTotal,
      amount_due: orderTotal,
      amount_paid: 0,
      balance_due: orderTotal,
      payment_status: "unpaid",
      route_notes: routeNotes.length > 0 ? routeNotes.join(" | ") : null,
      driver_notes: driverNotes.length > 0 ? driverNotes.join(" | ") : null,
      text_before_arrival: true, // Default to on
    };

    const { data: order, error: orderError } = await supabase
      .from("orders")
      .insert(orderData)
      .select()
      .single();

    if (orderError && (orderError as { code?: string }).code === "23505") {
      // Concurrent request already created the order (unique index on orders.quote_id).
      const { data: raced } = await supabase
        .from("orders").select("id, status").eq("quote_id", quoteId).maybeSingle();
      if (raced) {
        return json({ success: true, orderId: raced.id, status: raced.status, alreadyExists: true,
          message: "Order already exists for this quote" });
      }
    }

    if (orderError) {
      console.error("Order creation error:", orderError);
      return new Response(
        JSON.stringify({ error: "Failed to create order", code: "db_error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // ========== CONTRACT VALIDATION ==========
    // Check if customer has signed MSA and address-specific addendum
    let contractsValid = false;
    const contractBlockers: string[] = [];
    let msaContractId: string | null = null;
    let addendumContractId: string | null = null;

    if (customerId) {
      // Check for signed MSA
      const { data: signedMsa } = await supabase
        .from("contracts")
        .select("id")
        .eq("customer_id", customerId)
        .eq("contract_type", "msa")
        .eq("status", "signed")
        .order("signed_at", { ascending: false })
        .limit(1)
        .single();

      if (signedMsa) {
        msaContractId = signedMsa.id;
      } else {
        contractBlockers.push("MSA signature required");
        
        // Auto-create pending MSA if none exists
        const { data: existingMsa } = await supabase
          .from("contracts")
          .select("id")
          .eq("customer_id", customerId)
          .eq("contract_type", "msa")
          .eq("status", "pending")
          .limit(1)
          .single();

        if (!existingMsa) {
          const expiresAt = new Date();
          expiresAt.setFullYear(expiresAt.getFullYear() + 1);
          
          await supabase.from("contracts").insert({
            customer_id: customerId,
            contract_type: "msa",
            status: "pending",
            expires_at: expiresAt.toISOString(),
          });
          console.log(`Auto-created pending MSA for customer ${customerId}`);
        }
      }

      // Check for signed addendum for this address
      const serviceAddress = quote.delivery_address;
      if (serviceAddress) {
        const normalizedAddress = serviceAddress.toLowerCase().trim().replace(/\s+/g, ' ');
        
        const { data: signedAddendum } = await supabase
          .from("contracts")
          .select("id")
          .eq("customer_id", customerId)
          .eq("contract_type", "addendum")
          .eq("status", "signed")
          .eq("service_address_normalized", normalizedAddress)
          .limit(1)
          .single();

        if (signedAddendum) {
          addendumContractId = signedAddendum.id;
        } else {
          contractBlockers.push("Service Addendum required for this address");
          
          // Auto-create pending addendum
          const { data: existingAddendum } = await supabase
            .from("contracts")
            .select("id")
            .eq("customer_id", customerId)
            .eq("contract_type", "addendum")
            .eq("service_address_normalized", normalizedAddress)
            .eq("status", "pending")
            .limit(1)
            .single();

          if (!existingAddendum) {
            const { data: newAddendum } = await supabase.from("contracts").insert({
              customer_id: customerId,
              contract_type: "addendum",
              status: "pending",
              service_address: serviceAddress,
              service_address_normalized: normalizedAddress,
            }).select("id").single();
            
            console.log(`Auto-created pending Addendum for address: ${serviceAddress}`);

            // Auto-send contract request via SMS if phone available.
            // CAL 010: isolated test data (@calsan.test) uses the test transport.
            if (quote.customer_phone && newAddendum && isTestContact(quote.customer_email)) {
              console.log(`TEST_TRANSPORT: contract SMS suppressed for addendum ${newAddendum.id}`);
            } else if (quote.customer_phone && newAddendum) {
              try {
                await supabase.functions.invoke("send-contract", {
                  body: {
                    contractId: newAddendum.id,
                    method: "sms",
                    phone: quote.customer_phone,
                    actorRole: "system",
                  },
                });
                console.log(`Auto-sent addendum request to ${quote.customer_phone}`);
              } catch (sendErr) {
                console.error("Failed to auto-send contract:", sendErr);
              }
            }
          }
        }
      }

      // Determine if all contracts are valid
      contractsValid = contractBlockers.length === 0;

      // Update order with contract status
      await supabase
        .from("orders")
        .update({
          msa_contract_id: msaContractId,
          addendum_contract_id: addendumContractId,
          contracts_valid: contractsValid,
        })
        .eq("id", order.id);
    }
    // ========== END CONTRACT VALIDATION ==========

    // 8. Create invoice for the order
    const invoiceNumber = `INV-${order.id.slice(0, 8).toUpperCase()}-${Date.now().toString(36).toUpperCase()}`;
    const dueDate = new Date();
    dueDate.setDate(dueDate.getDate() + 30); // Net 30 by default

    const { data: invoice, error: invoiceError } = await supabase
      .from("invoices")
      .insert({
        order_id: order.id,
        customer_id: customerId,
        invoice_number: invoiceNumber,
        amount_due: orderTotal,
        amount_paid: 0,
        balance_due: orderTotal,
        payment_status: "unpaid",
        due_date: dueDate.toISOString().split('T')[0],
        notes: `Auto-generated invoice for order #${order.id.slice(0, 8)}`,
      })
      .select()
      .single();

    if (invoiceError) {
      console.error("Invoice creation warning:", invoiceError);
      // Don't fail order creation if invoice fails
    } else {
      console.log(`Invoice ${invoice?.invoice_number} created for order ${order.id}`);
    }

    // 9. Update quote status to 'converted'
    await supabase
      .from("quotes")
      .update({ 
        status: "converted",
        converted_at: new Date().toISOString(),
        customer_id: customerId, // Link customer if created
      })
      .eq("id", quoteId);

    // 10. Create quote event for audit trail
    await supabase
      .from("quote_events")
      .insert({
        quote_id: quoteId,
        event_type: "ORDER_CREATED_FROM_QUOTE",
        event_data: {
          order_id: order.id,
          order_status: order.status,
          customer_id: customerId,
          assigned_yard_id: assignedYardId,
          invoice_number: invoice?.invoice_number,
          scheduled_delivery_date: quote.preferred_delivery_date,
          scheduled_delivery_window: quote.preferred_delivery_window,
          final_total: orderData.final_total,
          pricing_snapshot: {
            subtotal: quote.subtotal,
            estimated_min: quote.estimated_min,
            estimated_max: quote.estimated_max,
            material_type: quote.material_type,
            size_id: quote.size_id,
            rental_days: quote.rental_days,
            extras: quote.extras,
            toll_surcharge: quote.toll_surcharge,
            extra_tons_prepurchased: quote.extra_tons_prepurchased,
            prepurchase_rate: quote.prepurchase_rate,
            green_halo_dump_fee: quote.green_halo_dump_fee,
            green_halo_handling_fee: quote.green_halo_handling_fee,
            heavy_material_class: quote.heavy_material_class,
            heavy_material_increment: quote.heavy_material_increment,
          },
          placement_data: {
            placement_type: quote.placement_type,
            placement_notes: quote.placement_notes,
            placement_lat: quote.placement_lat,
            placement_lng: quote.placement_lng,
            delivery_address: quote.delivery_address,
            delivery_lat: quote.delivery_lat,
            delivery_lng: quote.delivery_lng,
          },
          route_data: {
            yard_id: quote.yard_id,
            yard_name: quote.yard_name,
            truck_distance_miles: quote.truck_distance_miles,
            truck_duration_min: quote.truck_duration_min,
            truck_duration_max: quote.truck_duration_max,
            routing_provider: quote.routing_provider,
          },
        },
      });

    // 11. Create order_event for traceability
    await supabase
      .from("order_events")
      .insert({
        order_id: order.id,
        event_type: "ORDER_CREATED",
        actor_role: actorRole,
        actor_id: caller.kind === "staff" ? caller.userId : null,
        message: `Order created from quote. Invoice: ${invoice?.invoice_number || 'N/A'}. Delivery: ${quote.preferred_delivery_date || 'TBD'} (${quote.preferred_delivery_window || 'TBD'})`,
        after_json: {
          status: "scheduled_requested",
          delivery_date: quote.preferred_delivery_date,
          delivery_window: quote.preferred_delivery_window,
          pickup_date: quote.suggested_pickup_date,
          invoice_number: invoice?.invoice_number,
          amount_due: orderTotal,
        },
      });

    // 12. Create schedule_logs entry
    await supabase
      .from("schedule_logs")
      .insert({
        order_id: order.id,
        action: "requested",
        new_date: quote.preferred_delivery_date,
        new_window: quote.preferred_delivery_window,
        actor_role: actorRole,
        reason: caller.kind === "staff" ? "Staff converted quote to order"
          : caller.kind === "schedule_link" ? "Customer confirmed via schedule link (link holder, not identity-verified)"
          : "Customer scheduled via quote flow",
      });

    console.log(`Order ${order.id} created from quote ${quoteId} with invoice ${invoice?.invoice_number}. Contracts valid: ${contractsValid}`);

    return new Response(
      JSON.stringify({
        success: true,
        orderId: order.id,
        status: order.status,
        alreadyExists: false,
        message: "Order created successfully",
        customerId,
        assignedYardId,
        invoiceId: invoice?.id,
        invoiceNumber: invoice?.invoice_number,
        contractsValid,
        contractBlockers,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: "Internal server error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
