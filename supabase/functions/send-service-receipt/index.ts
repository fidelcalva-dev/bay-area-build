import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface ServiceReceiptRequest {
  orderId?: string;
  quoteId?: string;
  facilityName?: string;
  ticketDate?: string;
  totalTons?: number;
  ticketUrl?: string;
  ticketNumber?: string;
}

// Default pricing - fetched from DB when possible
let OVERAGE_RATE_PER_TON = 165;

// Included tons by size (general debris only)
const INCLUDED_TONS: Record<number, number> = {
  6: 0.5,
  8: 0.5,
  10: 1,
  20: 2,
  30: 3,
  40: 4,
  50: 5,
};

async function getOverageRateFromDB(): Promise<number> {
  try {
    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) return OVERAGE_RATE_PER_TON;
    
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);
    const { data } = await supabase
      .from("config_settings")
      .select("value")
      .eq("key", "extra_ton_rate_default")
      .single();

    if (data?.value) {
      return Number(data.value) || OVERAGE_RATE_PER_TON;
    }
    return OVERAGE_RATE_PER_TON;
  } catch (error) {
    console.error("Failed to fetch overage rate from DB:", error);
    return OVERAGE_RATE_PER_TON;
  }
}

function determinePricingRule(materialType: string, sizeValue: number): string {
  if (materialType === 'heavy') {
    return 'heavy_flat';
  }
  if (sizeValue <= 10) {
    return 'mixed_small';
  }
  return 'mixed_large';
}

function calculateOverage(
  pricingRule: string,
  totalTons: number,
  includedTons: number,
  prepurchasedTons: number = 0,
  overageRate: number = OVERAGE_RATE_PER_TON
): { overageTons: number; overageCharge: number; prepurchaseAppliedTons: number; standardOverageTons: number } {
  // Heavy flat-fee: no overage
  if (pricingRule === 'heavy_flat') {
    return { overageTons: 0, overageCharge: 0, prepurchaseAppliedTons: 0, standardOverageTons: 0 };
  }

  // Mixed 6/8/10: per-yard overage (not calculated here, done manually)
  if (pricingRule === 'mixed_small') {
    return { overageTons: 0, overageCharge: 0, prepurchaseAppliedTons: 0, standardOverageTons: 0 };
  }

  // Mixed 20+: per-ton overage with pre-purchase applied first
  const rawOverage = Math.max(0, totalTons - includedTons);
  const prepurchaseAppliedTons = Math.min(prepurchasedTons, rawOverage);
  const standardOverageTons = Math.max(0, rawOverage - prepurchaseAppliedTons);
  const overageCharge = standardOverageTons * overageRate;
  
  return { 
    overageTons: Math.round(rawOverage * 100) / 100, 
    overageCharge: Math.round(overageCharge * 100) / 100,
    prepurchaseAppliedTons: Math.round(prepurchaseAppliedTons * 100) / 100,
    standardOverageTons: Math.round(standardOverageTons * 100) / 100,
  };
}

const handler = async (req: Request): Promise<Response> => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: ServiceReceiptRequest = await req.json();
    let { orderId, quoteId, facilityName, ticketDate, totalTons, ticketUrl, ticketNumber } = data;

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error("Missing Supabase configuration");
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // If orderId provided, fetch the existing receipt data
    if (orderId && !quoteId) {
      const { data: order } = await supabase
        .from('orders')
        .select('quote_id')
        .eq('id', orderId)
        .single();
      
      if (order?.quote_id) {
        quoteId = order.quote_id;
      }
      
      // Also fetch the receipt data if it exists
      const { data: receipt } = await supabase
        .from('service_receipts')
        .select('*')
        .eq('quote_id', order?.quote_id || '')
        .order('created_at', { ascending: false })
        .limit(1)
        .single();
      
      if (receipt) {
        totalTons = receipt.total_tons;
        ticketUrl = receipt.ticket_url || ticketUrl;
        ticketNumber = receipt.ticket_number || ticketNumber;
        facilityName = receipt.facility_name || facilityName;
        ticketDate = receipt.ticket_date || ticketDate;
      }
    }

    if (!quoteId) {
      throw new Error("Missing quote ID");
    }

    // Fetch quote details
    const { data: quote, error: quoteError } = await supabase
      .from('quotes')
      .select(`
        id,
        customer_name,
        customer_email,
        customer_phone,
        material_type,
        zip_code,
        rental_days,
        subtotal,
        size_id,
        extra_tons_prepurchased,
        prepurchase_rate
      `)
      .eq('id', quoteId)
      .single();

    if (quoteError || !quote) {
      throw new Error(`Quote not found: ${quoteError?.message}`);
    }

    // Fetch size details
    let sizeValue = 20;
    let sizeLabel = "20 Yard";
    
    if (quote.size_id) {
      const { data: sizeData } = await supabase
        .from('dumpster_sizes')
        .select('size_value, label')
        .eq('id', quote.size_id)
        .single();
      
      if (sizeData) {
        sizeValue = sizeData.size_value;
        sizeLabel = sizeData.label;
      }
    }

    // Use actual tons value (could be passed or from existing receipt)
    const actualTotalTons = totalTons ?? 0;
    
    // Fetch dynamic overage rate from config
    const overageRate = await getOverageRateFromDB();
    
    // Determine pricing rule and calculate overage
    const pricingRule = determinePricingRule(quote.material_type, sizeValue);
    const includedTons = INCLUDED_TONS[sizeValue] || 2;
    const prepurchasedTons = quote.extra_tons_prepurchased || 0;
    const { overageTons, overageCharge, prepurchaseAppliedTons, standardOverageTons } = calculateOverage(
      pricingRule, 
      actualTotalTons, 
      includedTons, 
      prepurchasedTons,
      overageRate
    );

    // Check if receipt already exists - if so, skip creation
    const { data: existingReceipt } = await supabase
      .from('service_receipts')
      .select('id')
      .eq('quote_id', quoteId)
      .limit(1)
      .single();
    
    let receipt = existingReceipt;

    // Create receipt record only if it doesn't exist
    if (!existingReceipt) {
      const { data: newReceipt, error: receiptError } = await supabase
        .from('service_receipts')
        .insert({
          quote_id: quoteId,
          facility_name: facilityName,
          ticket_date: ticketDate || new Date().toISOString(),
          total_tons: actualTotalTons,
          ticket_url: ticketUrl,
          ticket_number: ticketNumber,
          included_tons: pricingRule === 'heavy_flat' ? null : includedTons,
          overage_tons: overageTons,
          overage_rate: pricingRule === 'mixed_large' ? overageRate : null,
          overage_charge: overageCharge,
          prepurchased_tons: prepurchasedTons,
          prepurchase_applied_tons: prepurchaseAppliedTons,
          standard_overage_tons: standardOverageTons,
          pricing_rule: pricingRule,
        })
        .select()
        .single();

      if (receiptError) {
        throw new Error(`Failed to create receipt: ${receiptError.message}`);
      }
      receipt = newReceipt;
    }

    // Update quote status
    await supabase
      .from('quotes')
      .update({ 
        status: 'completed',
        completed_at: new Date().toISOString(),
      })
      .eq('id', quoteId);

    // Generate email content based on pricing rule
    const materialLabel = quote.material_type === 'heavy' ? 'Heavy Materials (Flat Fee)' : 'General Debris';
    
    let overageSection = '';
    if (pricingRule === 'heavy_flat') {
      overageSection = `
        <div class="detail-row">
          <span class="label">Pricing</span>
          <span class="value" style="color: #16a34a;">Flat Fee – Disposal Included</span>
        </div>
      `;
    } else if (pricingRule === 'mixed_small') {
      overageSection = `
        <div class="detail-row">
          <span class="label">Included Weight</span>
          <span class="value">${includedTons} ton${includedTons !== 1 ? 's' : ''}</span>
        </div>
        <div class="detail-row">
          <span class="label">Note</span>
          <span class="value" style="font-size: 13px;">Capacity-based pricing (no ton overage)</span>
        </div>
      `;
    } else {
      overageSection = `
        <div class="detail-row">
          <span class="label">Included Weight</span>
          <span class="value">${includedTons} ton${includedTons !== 1 ? 's' : ''}</span>
        </div>
        ${overageTons > 0 ? `
        <div class="detail-row" style="background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 8px;">
          <span class="label" style="color: #92400e;">Overage</span>
          <span class="value" style="color: #92400e;">${overageTons.toFixed(2)}T × $${OVERAGE_RATE_PER_TON} = $${overageCharge.toFixed(2)}</span>
        </div>
        ` : `
        <div class="detail-row" style="background: #dcfce7; padding: 12px; border-radius: 8px; margin-top: 8px;">
          <span class="label" style="color: #166534;">Status</span>
          <span class="value" style="color: #166534;">✓ Within included weight</span>
        </div>
        `}
      `;
    }

    // Send Email via Resend
    let emailResult = null;
    if (RESEND_API_KEY && quote.customer_email) {
      try {
        const emailHtml = `
          <!DOCTYPE html>
          <html>
          <head>
            <style>
              body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; color: #333; }
              .container { max-width: 600px; margin: 0 auto; padding: 20px; }
              .header { background: linear-gradient(135deg, #0F4C3A 0%, #1a6b52 100%); color: white; padding: 30px; text-align: center; border-radius: 12px 12px 0 0; }
              .header h1 { margin: 0; font-size: 24px; }
              .content { background: #f9fafb; padding: 30px; border: 1px solid #e5e7eb; }
              .receipt-box { background: white; border-radius: 12px; padding: 24px; margin: 20px 0; border: 2px solid #0F4C3A; }
              .weight { font-size: 36px; font-weight: bold; color: #0F4C3A; }
              .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
              .detail-row:last-child { border-bottom: none; }
              .label { color: #6b7280; }
              .value { font-weight: 600; }
              .ticket-link { display: inline-block; background: #F59E0B; color: #1a1a1a; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 16px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>📋 Service Receipt</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Calsan Dumpsters Pro</p>
              </div>
              <div class="content">
                <p>Hi ${quote.customer_name || 'Valued Customer'},</p>
                <p>Your dumpster service is complete! Here's your final weight summary:</p>
                
                <div class="receipt-box">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <div class="weight">${actualTotalTons.toFixed(2)} tons</div>
                    <div style="color: #6b7280; font-size: 14px;">Total Weight from Scale Ticket</div>
                  </div>
                  
                  <div class="detail-row">
                    <span class="label">Dumpster Size</span>
                    <span class="value">${sizeLabel}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Material Type</span>
                    <span class="value">${materialLabel}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Facility</span>
                    <span class="value">${facilityName || 'N/A'}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Ticket Date</span>
                    <span class="value">${ticketDate ? new Date(ticketDate).toLocaleDateString() : new Date().toLocaleDateString()}</span>
                  </div>
                  ${ticketNumber ? `
                  <div class="detail-row">
                    <span class="label">Ticket #</span>
                    <span class="value">${ticketNumber}</span>
                  </div>
                  ` : ''}
                  
                  ${overageSection}
                </div>

                ${ticketUrl ? `
                <div style="text-align: center;">
                  <a href="${ticketUrl}" class="ticket-link">View Scale Ticket →</a>
                </div>
                ` : ''}

                ${overageCharge > 0 ? `
                <p style="font-size: 14px; color: #92400e; background: #fef3c7; padding: 12px; border-radius: 8px; margin-top: 20px;">
                  <strong>⚠️ Additional Charge:</strong> $${overageCharge.toFixed(2)} for ${overageTons.toFixed(2)} tons over the ${includedTons}T included allowance. 
                  You'll receive a separate invoice for this amount.
                </p>
                ` : ''}
              </div>
              <div class="footer">
                <p>Thank you for choosing Calsan Dumpsters Pro!</p>
                <p>Questions? Call us at <strong>(510) 680-2150</strong></p>
                <p style="font-size: 12px; color: #9ca3af;">1930 12th Ave #201, Oakland, CA 94606</p>
              </div>
            </div>
          </body>
          </html>
        `;

        const emailResponse = await fetch("https://api.resend.com/emails", {
          method: "POST",
          headers: {
            "Authorization": `Bearer ${RESEND_API_KEY}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            from: "Calsan Dumpsters <onboarding@resend.dev>",
            to: [quote.customer_email],
            subject: `Service Receipt - ${sizeLabel} (${actualTotalTons.toFixed(2)}T)`,
            html: emailHtml,
          }),
        });

        emailResult = await emailResponse.json();
        console.log("Receipt email sent:", emailResult);

        // Update receipt with email sent timestamp
        if (receipt?.id) {
          await supabase
            .from('service_receipts')
            .update({ email_sent_at: new Date().toISOString() })
            .eq('id', receipt.id);
        }

      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    }

    // Send SMS via Twilio
    let smsResult = null;
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && quote.customer_phone) {
      try {
        let smsBody = '';
        
        if (pricingRule === 'heavy_flat') {
          smsBody = `✅ Service Complete!\n\n` +
            `📦 ${sizeLabel} (Heavy Flat Fee)\n` +
            `⚖️ ${actualTotalTons.toFixed(2)} tons\n` +
            `✓ Disposal included – no extra charges\n\n` +
            `${ticketUrl ? `View ticket: ${ticketUrl}\n\n` : ''}` +
            `Thank you! — Calsan Dumpsters`;
        } else if (pricingRule === 'mixed_small') {
          smsBody = `✅ Service Complete!\n\n` +
            `📦 ${sizeLabel}\n` +
            `⚖️ ${actualTotalTons.toFixed(2)} tons\n` +
            `📊 ${includedTons}T included\n\n` +
            `${ticketUrl ? `View ticket: ${ticketUrl}\n\n` : ''}` +
            `Thank you! — Calsan Dumpsters`;
        } else {
          if (overageCharge > 0) {
            smsBody = `✅ Service Complete!\n\n` +
              `📦 ${sizeLabel}\n` +
              `⚖️ ${actualTotalTons.toFixed(2)} tons\n` +
              `📊 ${includedTons}T included\n` +
              `⚠️ Overage: ${overageTons.toFixed(2)}T × $${overageRate} = $${overageCharge.toFixed(2)}\n\n` +
              `${ticketUrl ? `View ticket: ${ticketUrl}\n\n` : ''}` +
              `Invoice to follow. — Calsan Dumpsters`;
          } else {
            smsBody = `✅ Service Complete!\n\n` +
              `📦 ${sizeLabel}\n` +
              `⚖️ ${actualTotalTons.toFixed(2)} tons\n` +
              `✓ Within ${includedTons}T included\n\n` +
              `${ticketUrl ? `View ticket: ${ticketUrl}\n\n` : ''}` +
              `Thank you! — Calsan Dumpsters`;
          }
        }

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

        const formData = new URLSearchParams();
        formData.append("To", quote.customer_phone);
        formData.append("From", twilioPhoneNumber);
        formData.append("Body", smsBody);

        const smsResponse = await fetch(twilioUrl, {
          method: "POST",
          headers: {
            "Authorization": `Basic ${authHeader}`,
            "Content-Type": "application/x-www-form-urlencoded",
          },
          body: formData.toString(),
        });

        smsResult = await smsResponse.json();
        console.log("Receipt SMS sent:", smsResult);

        // Update receipt with SMS sent timestamp
        if (receipt?.id) {
          await supabase
            .from('service_receipts')
            .update({ sms_sent_at: new Date().toISOString() })
            .eq('id', receipt.id);
        }

      } catch (smsError) {
        console.error("SMS send error:", smsError);
      }
    }

    // Update quote with receipt sent timestamp
    await supabase
      .from('quotes')
      .update({ receipt_sent_at: new Date().toISOString() })
      .eq('id', quoteId);

    return new Response(
      JSON.stringify({
        success: true,
        receiptId: receipt?.id || null,
        overageTons,
        overageCharge,
        pricingRule,
        emailSent: !!emailResult,
        smsSent: !!smsResult,
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );

  } catch (error: any) {
    console.error("Error in send-service-receipt:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
