import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface Alert {
  alert_type: string;
  entity_type: string;
  entity_id: string;
  severity: string;
  title: string;
  message: string;
  metadata: Record<string, unknown>;
}

interface Recommendation {
  rec_type: string;
  entity_type: string;
  entity_id: string;
  context: Record<string, unknown>;
  title: string;
  description: string;
  action_label: string;
  action_data: Record<string, unknown>;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();
  
  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const alerts: Alert[] = [];
    const recommendations: Recommendation[] = [];
    let notificationsSent = 0;

    // ============ TRIGGER 1: Low Inventory Alerts ============
    const { data: inventory } = await supabase
      .from('inventory')
      .select('id, yard_id, size_id, available_count, low_stock_threshold, total_count');

    const { data: yards } = await supabase
      .from('yards')
      .select('id, name')
      .eq('is_active', true);

    const { data: sizes } = await supabase
      .from('dumpster_sizes')
      .select('id, label, size_value')
      .eq('is_active', true);

    const yardsMap = new Map((yards || []).map(y => [y.id, y.name]));
    const sizesMap = new Map((sizes || []).map(s => [s.id, s]));

    for (const inv of inventory || []) {
      if (inv.available_count <= inv.low_stock_threshold) {
        const size = sizesMap.get(inv.size_id);
        const yardName = yardsMap.get(inv.yard_id) || 'Unknown Yard';
        
        // Check if alert already exists
        const { data: existing } = await supabase
          .from('alerts')
          .select('id')
          .eq('alert_type', 'low_inventory')
          .eq('entity_id', inv.id)
          .eq('is_resolved', false)
          .single();

        if (!existing) {
          const severity = inv.available_count === 0 ? 'critical' : 'warning';
          alerts.push({
            alert_type: 'low_inventory',
            entity_type: 'inventory',
            entity_id: inv.id,
            severity,
            title: `Low Stock: ${size?.label || 'Unknown'} at ${yardName}`,
            message: `Only ${inv.available_count} of ${inv.total_count} available. Threshold: ${inv.low_stock_threshold}`,
            metadata: {
              yard_id: inv.yard_id,
              yard_name: yardName,
              size_id: inv.size_id,
              size_label: size?.label,
              available: inv.available_count,
              threshold: inv.low_stock_threshold,
            },
          });
        }
      }
    }

    // ============ TRIGGER 2: Schedule Overload Alerts ============
    const today = new Date().toISOString().split('T')[0];
    const nextWeek = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    const { data: orders } = await supabase
      .from('orders')
      .select('id, scheduled_delivery_date, scheduled_pickup_date, status')
      .gte('scheduled_delivery_date', today)
      .lte('scheduled_delivery_date', nextWeek)
      .in('status', ['pending', 'confirmed', 'scheduled']);

    // Group by date
    const scheduleByDate = new Map<string, number>();
    for (const order of orders || []) {
      if (order.scheduled_delivery_date) {
        scheduleByDate.set(
          order.scheduled_delivery_date,
          (scheduleByDate.get(order.scheduled_delivery_date) || 0) + 1
        );
      }
      if (order.scheduled_pickup_date) {
        scheduleByDate.set(
          order.scheduled_pickup_date,
          (scheduleByDate.get(order.scheduled_pickup_date) || 0) + 1
        );
      }
    }

    const dailyCapacity = 20; // Configurable
    for (const [date, jobCount] of scheduleByDate) {
      if (jobCount > dailyCapacity * 0.9) {
        const { data: existing } = await supabase
          .from('alerts')
          .select('id')
          .eq('alert_type', 'schedule_overload')
          .eq('is_resolved', false)
          .contains('metadata', { date });

        if (!existing || existing.length === 0) {
          alerts.push({
            alert_type: 'schedule_overload',
            entity_type: 'schedule',
            entity_id: date, // Use date as entity_id
            severity: jobCount >= dailyCapacity ? 'critical' : 'warning',
            title: `Schedule Near Capacity: ${date}`,
            message: `${jobCount} jobs scheduled (${Math.round((jobCount / dailyCapacity) * 100)}% of capacity)`,
            metadata: {
              date,
              job_count: jobCount,
              capacity: dailyCapacity,
              utilization: Math.round((jobCount / dailyCapacity) * 100),
            },
          });
        }
      }
    }

    // ============ TRIGGER 3: Overdue Invoice Alerts ============
    const { data: invoices } = await supabase
      .from('invoices')
      .select('id, invoice_number, balance_due, due_date, order_id, customer_id')
      .gt('balance_due', 0)
      .lt('due_date', today);

    for (const invoice of invoices || []) {
      const daysOverdue = Math.floor(
        (Date.now() - new Date(invoice.due_date).getTime()) / (1000 * 60 * 60 * 24)
      );

      const { data: existing } = await supabase
        .from('alerts')
        .select('id')
        .eq('alert_type', 'overdue_invoice')
        .eq('entity_id', invoice.id)
        .eq('is_resolved', false)
        .single();

      if (!existing) {
        alerts.push({
          alert_type: 'overdue_invoice',
          entity_type: 'invoice',
          entity_id: invoice.id,
          severity: daysOverdue > 14 ? 'critical' : 'warning',
          title: `Invoice ${invoice.invoice_number} Overdue`,
          message: `$${invoice.balance_due.toFixed(2)} overdue by ${daysOverdue} days`,
          metadata: {
            invoice_number: invoice.invoice_number,
            balance_due: invoice.balance_due,
            due_date: invoice.due_date,
            days_overdue: daysOverdue,
            order_id: invoice.order_id,
            customer_id: invoice.customer_id,
          },
        });
      }
    }

    // ============ TRIGGER 4: High Risk Quote - Prepay Recommendation ============
    const { data: quotes } = await supabase
      .from('quotes')
      .select('id, customer_name, customer_phone, material_type, confidence_level, extra_tons_prepurchased, estimated_max, status, created_at')
      .eq('status', 'saved')
      .is('extra_tons_prepurchased', null)
      .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString());

    const heavyMaterials = ['concrete', 'asphalt', 'dirt', 'brick', 'stone', 'gravel'];
    
    for (const quote of quotes || []) {
      const isHeavy = heavyMaterials.includes(quote.material_type?.toLowerCase() || '');
      const isRisky = quote.confidence_level === 'risk' || isHeavy;

      if (isRisky && !quote.extra_tons_prepurchased) {
        const { data: existing } = await supabase
          .from('recommendations')
          .select('id')
          .eq('rec_type', 'prepay_upsell')
          .eq('entity_id', quote.id)
          .is('accepted', null)
          .single();

        if (!existing) {
          recommendations.push({
            rec_type: 'prepay_upsell',
            entity_type: 'quote',
            entity_id: quote.id,
            context: {
              material_type: quote.material_type,
              confidence_level: quote.confidence_level,
              estimated_max: quote.estimated_max,
            },
            title: 'Recommend Prepay Protection',
            description: `Heavy material (${quote.material_type}) quote for ${quote.customer_name || 'Customer'}. Suggest prepurchasing extra tons at 5% discount.`,
            action_label: 'Add Prepay Recommendation',
            action_data: {
              quote_id: quote.id,
              suggested_tons: 2,
              discount_rate: 0.05,
            },
          });
        }
      }
    }

    // ============ TRIGGER 5: Repeat Customer - Contractor Program ============
    const { data: customers } = await supabase
      .from('customers')
      .select('id, company_name, billing_email, customer_type');

    const { data: customerOrders } = await supabase
      .from('orders')
      .select('customer_id, status')
      .eq('status', 'completed');

    const orderCounts = new Map<string, number>();
    for (const order of customerOrders || []) {
      if (order.customer_id) {
        orderCounts.set(order.customer_id, (orderCounts.get(order.customer_id) || 0) + 1);
      }
    }

    for (const customer of customers || []) {
      const orderCount = orderCounts.get(customer.id) || 0;
      
      if (orderCount >= 3 && customer.customer_type !== 'contractor') {
        const { data: existing } = await supabase
          .from('recommendations')
          .select('id')
          .eq('rec_type', 'contractor_program')
          .eq('entity_id', customer.id)
          .is('accepted', null)
          .single();

        if (!existing) {
          recommendations.push({
            rec_type: 'contractor_program',
            entity_type: 'customer',
            entity_id: customer.id,
            context: {
              order_count: orderCount,
              current_type: customer.customer_type,
            },
            title: 'Upgrade to Contractor Program',
            description: `${customer.company_name || 'Customer'} has ${orderCount} completed orders. Consider upgrading to contractor program for volume discounts.`,
            action_label: 'Offer Contractor Program',
            action_data: {
              customer_id: customer.id,
              suggested_discount: 10,
            },
          });
        }
      }
    }

    // ============ INSERT ALERTS & RECOMMENDATIONS ============
    if (alerts.length > 0) {
      const { error: alertError } = await supabase
        .from('alerts')
        .insert(alerts);

      if (alertError) {
        console.error('Error inserting alerts:', alertError);
      }
    }

    if (recommendations.length > 0) {
      const { error: recError } = await supabase
        .from('recommendations')
        .insert(recommendations);

      if (recError) {
        console.error('Error inserting recommendations:', recError);
      }
    }

    // ============ SEND NOTIFICATIONS FOR CRITICAL ALERTS ============
    const criticalAlerts = alerts.filter(a => a.severity === 'critical');
    
    if (criticalAlerts.length > 0) {
      const twilioSid = Deno.env.get('TWILIO_ACCOUNT_SID');
      const twilioToken = Deno.env.get('TWILIO_AUTH_TOKEN');
      const twilioPhone = Deno.env.get('TWILIO_PHONE_NUMBER');

      // Get admin phone numbers from config
      const { data: config } = await supabase
        .from('config_settings')
        .select('value')
        .eq('key', 'alert_recipients')
        .single();

      const recipients = (config?.value as { phones?: string[] })?.phones || [];

      if (twilioSid && twilioToken && twilioPhone && recipients.length > 0) {
        for (const recipient of recipients) {
          for (const alert of criticalAlerts) {
            try {
              const response = await fetch(
                `https://api.twilio.com/2010-04-01/Accounts/${twilioSid}/Messages.json`,
                {
                  method: 'POST',
                  headers: {
                    'Authorization': `Basic ${btoa(`${twilioSid}:${twilioToken}`)}`,
                    'Content-Type': 'application/x-www-form-urlencoded',
                  },
                  body: new URLSearchParams({
                    To: recipient,
                    From: twilioPhone,
                    Body: `🚨 CRITICAL ALERT: ${alert.title}\n${alert.message}`,
                  }),
                }
              );

              if (response.ok) {
                notificationsSent++;
              }
            } catch (err) {
              console.error('SMS notification error:', err);
            }
          }
        }
      }
    }

    // ============ LOG AUTOMATION RUN ============
    const duration = Date.now() - startTime;
    await supabase.from('automation_runs').insert({
      automation_type: 'scheduled_check',
      triggered_by: 'schedule',
      alerts_created: alerts.length,
      recommendations_created: recommendations.length,
      notifications_sent: notificationsSent,
      duration_ms: duration,
    });

    return new Response(
      JSON.stringify({
        success: true,
        alerts_created: alerts.length,
        recommendations_created: recommendations.length,
        notifications_sent: notificationsSent,
        duration_ms: duration,
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    console.error('Automation error:', errorMessage);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
