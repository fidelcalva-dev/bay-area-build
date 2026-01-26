-- Enhanced mark_order_contaminated function with full billing logic
CREATE OR REPLACE FUNCTION public.mark_order_contaminated(
  p_order_id UUID,
  p_notes TEXT DEFAULT NULL,
  p_actual_weight_tons NUMERIC DEFAULT NULL
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_quote RECORD;
  v_size_value INTEGER;
  v_debris_base_price NUMERIC;
  v_included_tons NUMERIC;
  v_extra_tons NUMERIC;
  v_extra_tons_charge NUMERIC;
  v_original_price NUMERIC;
  v_new_total NUMERIC;
  v_price_delta NUMERIC;
  v_invoice_id UUID;
  v_extra_ton_rate NUMERIC := 165.00;
  v_approval_threshold NUMERIC := 250.00;
BEGIN
  -- Get order and quote details
  SELECT o.*, q.subtotal as original_quote_subtotal, q.size_id, q.size_value as quote_size_value
  INTO v_order
  FROM public.orders o
  LEFT JOIN public.quotes q ON q.id = o.quote_id
  WHERE o.id = p_order_id;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
  
  -- Get size value from quote or order
  v_size_value := COALESCE(v_order.quote_size_value, 10);
  
  -- Get debris base price for size
  SELECT base_price INTO v_debris_base_price
  FROM public.dumpster_sizes
  WHERE size_value = v_size_value AND is_active = true;
  
  IF v_debris_base_price IS NULL THEN
    -- Fallback to 10yd price
    SELECT base_price INTO v_debris_base_price
    FROM public.dumpster_sizes
    WHERE size_value = 10 AND is_active = true;
    v_debris_base_price := COALESCE(v_debris_base_price, 580.00);
  END IF;
  
  -- Included tons by size (5=0.50, 6=0.60, 8=0.80, 10=1.00)
  v_included_tons := CASE v_size_value
    WHEN 5 THEN 0.50
    WHEN 6 THEN 0.60
    WHEN 8 THEN 0.80
    WHEN 10 THEN 1.00
    ELSE 1.00
  END;
  
  -- Calculate extra tons charge if weight provided
  v_extra_tons := 0;
  v_extra_tons_charge := 0;
  IF p_actual_weight_tons IS NOT NULL AND p_actual_weight_tons > v_included_tons THEN
    v_extra_tons := ROUND(p_actual_weight_tons - v_included_tons, 2);
    v_extra_tons_charge := ROUND(v_extra_tons * v_extra_ton_rate, 2);
  END IF;
  
  -- Calculate pricing delta
  v_original_price := COALESCE(v_order.original_quote_subtotal, v_order.amount_due, 0);
  v_new_total := v_debris_base_price + v_extra_tons_charge;
  v_price_delta := v_new_total - v_original_price;
  
  -- Update order with contamination and billing info
  UPDATE public.orders SET
    contamination_detected = true,
    contamination_detected_at = now(),
    contamination_notes = p_notes,
    reclassified_to_debris = true,
    reclassified_at = now(),
    actual_weight_tons = COALESCE(p_actual_weight_tons, actual_weight_tons),
    extra_tons_charged = v_extra_tons,
    included_tons_for_size = v_included_tons,
    -- Update financial fields
    amount_due = GREATEST(COALESCE(amount_due, 0) + v_price_delta, 0),
    balance_due = GREATEST(COALESCE(balance_due, 0) + v_price_delta, 0)
  WHERE id = p_order_id;
  
  -- Get or create invoice for this order
  SELECT id INTO v_invoice_id FROM public.invoices WHERE order_id = p_order_id;
  
  IF v_invoice_id IS NULL THEN
    INSERT INTO public.invoices (order_id, amount_due, balance_due, payment_status)
    VALUES (p_order_id, v_new_total, v_new_total, 'unpaid')
    RETURNING id INTO v_invoice_id;
  ELSE
    -- Update invoice totals
    UPDATE public.invoices SET
      amount_due = GREATEST(COALESCE(amount_due, 0) + v_price_delta, 0),
      balance_due = GREATEST(COALESCE(balance_due, 0) + v_price_delta, 0),
      updated_at = now()
    WHERE id = v_invoice_id;
  END IF;
  
  -- Create invoice line item for reclassification adjustment
  INSERT INTO public.invoice_line_items (
    invoice_id, order_id, line_type, description, quantity, unit_price, amount, metadata
  ) VALUES (
    v_invoice_id,
    p_order_id,
    'reclassification',
    'Heavy → Debris Reclassification: ' || v_size_value || 'yd base price (includes ' || v_included_tons || ' tons)',
    1,
    v_debris_base_price,
    v_debris_base_price,
    jsonb_build_object(
      'reason', 'contamination_detected',
      'size_value', v_size_value,
      'included_tons', v_included_tons,
      'original_price', v_original_price,
      'debris_base_price', v_debris_base_price
    )
  );
  
  -- Create invoice line item for extra tons if applicable
  IF v_extra_tons > 0 THEN
    INSERT INTO public.invoice_line_items (
      invoice_id, order_id, line_type, description, quantity, unit_price, amount, metadata
    ) VALUES (
      v_invoice_id,
      p_order_id,
      'overage',
      'Extra weight: ' || v_extra_tons || ' tons × $' || v_extra_ton_rate || '/ton (scale ticket)',
      v_extra_tons,
      v_extra_ton_rate,
      v_extra_tons_charge,
      jsonb_build_object(
        'actual_weight_tons', p_actual_weight_tons,
        'included_tons', v_included_tons,
        'extra_tons', v_extra_tons,
        'rate_per_ton', v_extra_ton_rate
      )
    );
  END IF;
  
  -- Create approval request if delta exceeds threshold
  IF v_price_delta > v_approval_threshold THEN
    INSERT INTO public.approval_requests (
      request_type,
      entity_type,
      entity_id,
      requested_by,
      requested_value,
      reason,
      status
    ) VALUES (
      'reclassification_billing',
      'order',
      p_order_id,
      '00000000-0000-0000-0000-000000000000', -- System
      jsonb_build_object(
        'original_price', v_original_price,
        'new_total', v_new_total,
        'price_delta', v_price_delta,
        'debris_base_price', v_debris_base_price,
        'extra_tons', v_extra_tons,
        'extra_tons_charge', v_extra_tons_charge,
        'actual_weight_tons', p_actual_weight_tons,
        'size_value', v_size_value
      ),
      'Contamination reclassification billing exceeds $' || v_approval_threshold || ' threshold. Delta: $' || v_price_delta,
      'pending'
    );
  END IF;
  
  -- Create alert
  INSERT INTO public.alerts (entity_type, entity_id, alert_type, severity, title, message, metadata)
  VALUES (
    'order', 
    p_order_id::text, 
    'CONTAMINATION_DETECTED', 
    CASE WHEN v_price_delta > v_approval_threshold THEN 'error' ELSE 'warn' END,
    'Heavy Material Contamination Detected',
    'Order reclassified from heavy clean to mixed debris. ' || 
      CASE WHEN v_extra_tons > 0 
        THEN 'Extra ton billing: ' || v_extra_tons || ' tons × $' || v_extra_ton_rate || ' = $' || v_extra_tons_charge
        ELSE 'No extra tons charged yet (pending scale ticket).'
      END,
    jsonb_build_object(
      'order_id', p_order_id, 
      'notes', p_notes,
      'price_delta', v_price_delta,
      'requires_approval', v_price_delta > v_approval_threshold,
      'debris_base_price', v_debris_base_price,
      'extra_tons_charge', v_extra_tons_charge
    )
  );
  
  RETURN true;
END;
$$;

-- Add a helper function to apply scale ticket weight after initial reclassification
CREATE OR REPLACE FUNCTION public.apply_scale_ticket_weight(
  p_order_id UUID,
  p_actual_weight_tons NUMERIC
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_order RECORD;
  v_included_tons NUMERIC;
  v_extra_tons NUMERIC;
  v_extra_tons_charge NUMERIC;
  v_extra_ton_rate NUMERIC := 165.00;
  v_invoice_id UUID;
  v_approval_threshold NUMERIC := 250.00;
BEGIN
  -- Get order
  SELECT * INTO v_order FROM public.orders WHERE id = p_order_id;
  
  IF v_order IS NULL THEN
    RAISE EXCEPTION 'Order not found: %', p_order_id;
  END IF;
  
  IF NOT v_order.reclassified_to_debris THEN
    RAISE EXCEPTION 'Order not reclassified to debris: %', p_order_id;
  END IF;
  
  v_included_tons := COALESCE(v_order.included_tons_for_size, 1.00);
  
  -- Calculate extra tons
  IF p_actual_weight_tons > v_included_tons THEN
    v_extra_tons := ROUND(p_actual_weight_tons - v_included_tons, 2);
    v_extra_tons_charge := ROUND(v_extra_tons * v_extra_ton_rate, 2);
  ELSE
    v_extra_tons := 0;
    v_extra_tons_charge := 0;
  END IF;
  
  -- Update order
  UPDATE public.orders SET
    actual_weight_tons = p_actual_weight_tons,
    extra_tons_charged = v_extra_tons,
    amount_due = COALESCE(amount_due, 0) + v_extra_tons_charge,
    balance_due = COALESCE(balance_due, 0) + v_extra_tons_charge
  WHERE id = p_order_id;
  
  -- Get invoice
  SELECT id INTO v_invoice_id FROM public.invoices WHERE order_id = p_order_id;
  
  IF v_invoice_id IS NOT NULL AND v_extra_tons > 0 THEN
    -- Update invoice
    UPDATE public.invoices SET
      amount_due = COALESCE(amount_due, 0) + v_extra_tons_charge,
      balance_due = COALESCE(balance_due, 0) + v_extra_tons_charge,
      updated_at = now()
    WHERE id = v_invoice_id;
    
    -- Create invoice line item for extra tons
    INSERT INTO public.invoice_line_items (
      invoice_id, order_id, line_type, description, quantity, unit_price, amount, metadata
    ) VALUES (
      v_invoice_id,
      p_order_id,
      'overage',
      'Scale ticket weight: ' || v_extra_tons || ' extra tons × $' || v_extra_ton_rate || '/ton',
      v_extra_tons,
      v_extra_ton_rate,
      v_extra_tons_charge,
      jsonb_build_object(
        'actual_weight_tons', p_actual_weight_tons,
        'included_tons', v_included_tons,
        'extra_tons', v_extra_tons,
        'rate_per_ton', v_extra_ton_rate
      )
    );
    
    -- Create approval request if charge exceeds threshold
    IF v_extra_tons_charge > v_approval_threshold THEN
      INSERT INTO public.approval_requests (
        request_type,
        entity_type,
        entity_id,
        requested_by,
        requested_value,
        reason,
        status
      ) VALUES (
        'extra_tons_billing',
        'order',
        p_order_id,
        '00000000-0000-0000-0000-000000000000',
        jsonb_build_object(
          'actual_weight_tons', p_actual_weight_tons,
          'included_tons', v_included_tons,
          'extra_tons', v_extra_tons,
          'extra_tons_charge', v_extra_tons_charge
        ),
        'Extra tons billing exceeds $' || v_approval_threshold || ' threshold. Charge: $' || v_extra_tons_charge,
        'pending'
      );
    END IF;
  END IF;
  
  RETURN true;
END;
$$;