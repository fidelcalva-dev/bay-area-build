import { serve } from "https://deno.land/std@0.190.0/http/server.ts";

const RESEND_API_KEY = Deno.env.get("RESEND_API_KEY");

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface QuoteSummaryRequest {
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  sizeLabel: string;
  materialType: string;
  rentalDays: number;
  zipCode: string;
  estimatedMin: number;
  estimatedMax: number;
  includedTons: number;
  extras: string[];
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const data: QuoteSummaryRequest = await req.json();
    const {
      customerName,
      customerEmail,
      customerPhone,
      sizeLabel,
      materialType,
      rentalDays,
      zipCode,
      estimatedMin,
      estimatedMax,
      includedTons,
      extras,
    } = data;

    const materialLabel = materialType === 'heavy' ? 'Heavy Materials (Flat Fee)' : 'General Debris';
    const extrasText = extras.length > 0 ? extras.join(', ') : 'None';
    
    // Determine the correct overage message based on material and size
    const sizeValue = parseInt(sizeLabel) || 20;
    const isHeavy = materialType === 'heavy';
    const isSmallGeneral = !isHeavy && sizeValue <= 10;
    
    let overageNote = '';
    if (isHeavy) {
      overageNote = 'Heavy material dumpsters are FLAT FEE—disposal included with no extra weight charges.';
    } else if (isSmallGeneral) {
      overageNote = 'Overage charged at $30 per additional yard.';
    } else {
      overageNote = 'Overage charged at $165/ton after disposal scale ticket.';
    }

    // Send Email via Resend REST API
    let emailResult = null;
    if (RESEND_API_KEY) {
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
              .quote-box { background: white; border-radius: 12px; padding: 24px; margin: 20px 0; border: 2px solid #0F4C3A; }
              .price { font-size: 32px; font-weight: bold; color: #0F4C3A; }
              .detail-row { display: flex; justify-content: space-between; padding: 12px 0; border-bottom: 1px solid #e5e7eb; }
              .detail-row:last-child { border-bottom: none; }
              .label { color: #6b7280; }
              .value { font-weight: 600; }
              .cta-button { display: inline-block; background: #F59E0B; color: #1a1a1a; padding: 16px 32px; text-decoration: none; border-radius: 8px; font-weight: bold; margin-top: 20px; }
              .footer { text-align: center; padding: 20px; color: #6b7280; font-size: 14px; }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <h1>🚛 Your Dumpster Quote</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Calsan Dumpsters Pro</p>
              </div>
              <div class="content">
                <p>Hi ${customerName},</p>
                <p>Thanks for requesting a quote! Here's your personalized estimate:</p>
                
                <div class="quote-box">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <div class="price">$${estimatedMin} – $${estimatedMax}</div>
                    <div style="color: #6b7280; font-size: 14px;">Estimated Total</div>
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
                    <span class="label">Rental Period</span>
                    <span class="value">${rentalDays} days</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">Delivery ZIP</span>
                    <span class="value">${zipCode}</span>
                  </div>
                  ${isHeavy ? `
                  <div class="detail-row">
                    <span class="label">Pricing</span>
                    <span class="value" style="color: #16a34a;">Flat Fee – Disposal Included</span>
                  </div>
                  ` : `
                  <div class="detail-row">
                    <span class="label">Included Weight</span>
                    <span class="value">${includedTons} ton${includedTons !== 1 ? 's' : ''}</span>
                  </div>
                  `}
                  <div class="detail-row">
                    <span class="label">Extras</span>
                    <span class="value">${extrasText}</span>
                  </div>
                </div>

                <p style="font-size: 14px; color: #6b7280;">
                  <strong>Note:</strong> ${overageNote} This quote is valid for 7 days.
                </p>

                <div style="text-align: center;">
                  <a href="https://app.trashlab.com" class="cta-button">Book Now →</a>
                </div>
              </div>
              <div class="footer">
                <p>Questions? Call us at <strong>(510) 680-2150</strong> or text us anytime.</p>
                <p>Calsan Dumpsters Pro • Oakland, CA</p>
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
            to: [customerEmail],
            subject: `Your Dumpster Quote - ${sizeLabel}`,
            html: emailHtml,
          }),
        });

        emailResult = await emailResponse.json();
        console.log("Email sent successfully:", emailResult);
      } catch (emailError) {
        console.error("Email send error:", emailError);
      }
    } else {
      console.log("Resend API key not configured, skipping email");
    }

    // Send SMS via Twilio
    let smsResult = null;
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber) {
      try {
        // Check if currently within business hours (6AM-9PM Pacific)
        const now = new Date();
        const pstOffset = -8; // PST offset (simplified; doesn't account for DST)
        const utcHour = now.getUTCHours();
        const pstHour = (utcHour + pstOffset + 24) % 24;
        const isBusinessHours = pstHour >= 6 && pstHour < 21;
        
        const afterHoursNote = !isBusinessHours 
          ? '\n\n🕐 Our team is currently offline (6am-9pm). We\'ll follow up first thing!' 
          : '';

        const smsBody = isHeavy
          ? `Hi ${customerName}! Your Calsan Dumpsters quote:\n\n` +
            `📦 ${sizeLabel} (${materialLabel})\n` +
            `📍 ZIP: ${zipCode}\n` +
            `📅 ${rentalDays}-day rental\n` +
            `✅ FLAT FEE – Disposal Included\n` +
            `💰 $${estimatedMin}–$${estimatedMax}\n\n` +
            `Book now: app.trashlab.com\n` +
            `Questions? Reply to this text or call (510) 680-2150` +
            afterHoursNote
          : `Hi ${customerName}! Your Calsan Dumpsters quote:\n\n` +
            `📦 ${sizeLabel} (${materialLabel})\n` +
            `📍 ZIP: ${zipCode}\n` +
            `📅 ${rentalDays}-day rental\n` +
            `⚖️ ${includedTons}T included\n` +
            `💰 $${estimatedMin}–$${estimatedMax}\n\n` +
            `Book now: app.trashlab.com\n` +
            `Questions? Reply to this text or call (510) 680-2150` +
            afterHoursNote;

        const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
        const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

        const formData = new URLSearchParams();
        formData.append("To", customerPhone);
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
        console.log("SMS sent successfully:", smsResult);
      } catch (smsError) {
        console.error("SMS send error:", smsError);
      }
    } else {
      console.log("Twilio credentials not configured, skipping SMS");
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        emailSent: !!emailResult,
        smsSent: !!smsResult 
      }),
      {
        status: 200,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  } catch (error: any) {
    console.error("Error in send-quote-summary function:", error);
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
