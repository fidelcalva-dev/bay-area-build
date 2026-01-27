import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

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
  language?: 'en' | 'es';
}

// Bilingual templates
const templates = {
  en: {
    emailSubject: (size: string) => `Your Dumpster Quote - ${size}`,
    emailGreeting: (name: string) => `Hi ${name},`,
    emailThanks: "Thanks for requesting a quote! Here's your personalized estimate:",
    estimatedTotal: "Estimated Total",
    dumpsterSize: "Dumpster Size",
    materialType: "Material Type",
    rentalPeriod: "Rental Period",
    deliveryZip: "Delivery ZIP",
    pricing: "Pricing",
    flatFee: "Flat Fee – Disposal Included",
    includedWeight: "Included Weight",
    extras: "Extras",
    none: "None",
    bookNow: "Book Now →",
    note: "Note:",
    validDays: "This quote is valid for 7 days.",
    questions: "Questions? Call us at",
    orText: "or text us anytime.",
    days: "days",
    ton: "ton",
    tons: "tons",
    heavyMaterials: "Heavy Materials (Flat Fee)",
    generalDebris: "General Debris",
    overageHeavy: "Heavy material dumpsters are FLAT FEE—disposal included with no extra weight charges.",
    overageTon: (rate: number) => `Any weight beyond included amount is billed at $${rate}/ton based on scale ticket.`,
    smsHeavy: (name: string, size: string, zip: string, days: number, min: number, max: number) =>
      `Hi ${name}! Your Calsan Dumpsters quote:\n\n` +
      `${size} (Heavy Materials)\n` +
      `ZIP: ${zip}\n` +
      `${days}-day rental\n` +
      `FLAT FEE – Disposal Included\n` +
      `$${min}–$${max}\n\n` +
      `Book now: app.trashlab.com\n` +
      `Questions? Reply to this text or call (510) 680-2150`,
    smsGeneral: (name: string, size: string, zip: string, days: number, tons: number, min: number, max: number) =>
      `Hi ${name}! Your Calsan Dumpsters quote:\n\n` +
      `${size} (General Debris)\n` +
      `ZIP: ${zip}\n` +
      `${days}-day rental\n` +
      `${tons}T included\n` +
      `$${min}–$${max}\n\n` +
      `Book now: app.trashlab.com\n` +
      `Questions? Reply to this text or call (510) 680-2150`,
    afterHours: '\n\nOur team is currently offline (6am-9pm). We will follow up first thing!',
  },
  es: {
    emailSubject: (size: string) => `Tu Cotización de Contenedor - ${size}`,
    emailGreeting: (name: string) => `Hola ${name},`,
    emailThanks: "¡Gracias por solicitar una cotización! Aquí está tu estimado personalizado:",
    estimatedTotal: "Total Estimado",
    dumpsterSize: "Tamaño del Contenedor",
    materialType: "Tipo de Material",
    rentalPeriod: "Período de Alquiler",
    deliveryZip: "Código Postal",
    pricing: "Precio",
    flatFee: "Tarifa Fija – Disposición Incluida",
    includedWeight: "Peso Incluido",
    extras: "Extras",
    none: "Ninguno",
    bookNow: "Reservar Ahora →",
    note: "Nota:",
    validDays: "Esta cotización es válida por 7 días.",
    questions: "¿Preguntas? Llámanos al",
    orText: "o envíanos un mensaje.",
    days: "días",
    ton: "tonelada",
    tons: "toneladas",
    heavyMaterials: "Materiales Pesados (Tarifa Fija)",
    generalDebris: "Escombros Generales",
    overageHeavy: "Los contenedores de material pesado son TARIFA FIJA—disposición incluida sin cargos extras por peso.",
    overageTon: (rate: number) => `Cualquier peso adicional se factura a $${rate}/tonelada según el ticket de báscula.`,
    smsHeavy: (name: string, size: string, zip: string, days: number, min: number, max: number) =>
      `¡Hola ${name}! Tu cotización de Calsan Dumpsters:\n\n` +
      `${size} (Materiales Pesados)\n` +
      `Código Postal: ${zip}\n` +
      `Alquiler de ${days} días\n` +
      `TARIFA FIJA – Disposición Incluida\n` +
      `$${min}–$${max}\n\n` +
      `Reserva: app.trashlab.com\n` +
      `¿Preguntas? Responde este mensaje o llama (510) 680-2150`,
    smsGeneral: (name: string, size: string, zip: string, days: number, tons: number, min: number, max: number) =>
      `¡Hola ${name}! Tu cotización de Calsan Dumpsters:\n\n` +
      `${size} (Escombros Generales)\n` +
      `Código Postal: ${zip}\n` +
      `Alquiler de ${days} días\n` +
      `${tons}T incluidas\n` +
      `$${min}–$${max}\n\n` +
      `Reserva: app.trashlab.com\n` +
      `¿Preguntas? Responde este mensaje o llama (510) 680-2150`,
    afterHours: '\n\nNuestro equipo está fuera de horario (6am-9pm). ¡Te contactaremos pronto!',
  },
};

// Pricing defaults - fetched from DB when possible
const DEFAULT_OVERAGE_PER_TON = 165;

async function getPricingFromDB(): Promise<{ overagePerTon: number }> {
  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { data } = await supabase
      .from("config_settings")
      .select("key, value")
      .in("key", ["extra_ton_rate_default"]);

    let overagePerTon = DEFAULT_OVERAGE_PER_TON;
    if (data) {
      const tonRate = data.find(d => d.key === "extra_ton_rate_default");
      if (tonRate) overagePerTon = Number(tonRate.value) || DEFAULT_OVERAGE_PER_TON;
    }

    return { overagePerTon };
  } catch (error) {
    console.error("Failed to fetch pricing from DB, using defaults:", error);
    return { overagePerTon: DEFAULT_OVERAGE_PER_TON };
  }
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Fetch pricing from database
    const pricing = await getPricingFromDB();
    
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
      extras = [],
      language = 'en',
    } = data;

    const t = templates[language] || templates.en;
    const materialLabel = materialType === 'heavy' ? t.heavyMaterials : t.generalDebris;
    const extrasText = (extras && extras.length > 0) ? extras.join(', ') : t.none;
    
    // Determine the correct overage message based on material type
    // CANONICAL: All general debris uses per-ton overage
    const isHeavy = materialType === 'heavy';
    
    let overageNote = '';
    if (isHeavy) {
      overageNote = t.overageHeavy;
    } else {
      overageNote = t.overageTon(pricing.overagePerTon);
    }

    // Send Email via Resend REST API
    let emailResult = null;
    if (RESEND_API_KEY) {
      try {
        const tonLabel = includedTons !== 1 ? t.tons : t.ton;
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
                <h1>🚛 ${t.emailSubject(sizeLabel).replace(/^.*- /, '')}</h1>
                <p style="margin: 10px 0 0 0; opacity: 0.9;">Calsan Dumpsters Pro</p>
              </div>
              <div class="content">
                <p>${t.emailGreeting(customerName)}</p>
                <p>${t.emailThanks}</p>
                
                <div class="quote-box">
                  <div style="text-align: center; margin-bottom: 20px;">
                    <div class="price">$${estimatedMin} – $${estimatedMax}</div>
                    <div style="color: #6b7280; font-size: 14px;">${t.estimatedTotal}</div>
                  </div>
                  
                  <div class="detail-row">
                    <span class="label">${t.dumpsterSize}</span>
                    <span class="value">${sizeLabel}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">${t.materialType}</span>
                    <span class="value">${materialLabel}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">${t.rentalPeriod}</span>
                    <span class="value">${rentalDays} ${t.days}</span>
                  </div>
                  <div class="detail-row">
                    <span class="label">${t.deliveryZip}</span>
                    <span class="value">${zipCode}</span>
                  </div>
                  ${isHeavy ? `
                  <div class="detail-row">
                    <span class="label">${t.pricing}</span>
                    <span class="value" style="color: #16a34a;">${t.flatFee}</span>
                  </div>
                  ` : `
                  <div class="detail-row">
                    <span class="label">${t.includedWeight}</span>
                    <span class="value">${includedTons} ${tonLabel}</span>
                  </div>
                  `}
                  <div class="detail-row">
                    <span class="label">${t.extras}</span>
                    <span class="value">${extrasText}</span>
                  </div>
                </div>

                <p style="font-size: 14px; color: #6b7280;">
                  <strong>${t.note}</strong> ${overageNote} ${t.validDays}
                </p>

                <div style="text-align: center;">
                  <a href="https://app.trashlab.com" class="cta-button">${t.bookNow}</a>
                </div>
              </div>
              <div class="footer">
                <p>${t.questions} <strong>(510) 680-2150</strong> ${t.orText}</p>
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
            subject: t.emailSubject(sizeLabel),
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

    if (twilioAccountSid && twilioAuthToken && twilioPhoneNumber && customerPhone) {
      try {
        // Normalize phone to E.164 format
        let normalizedPhone = customerPhone.replace(/\D/g, '');
        if (normalizedPhone.length === 11 && normalizedPhone.startsWith('1')) {
          normalizedPhone = normalizedPhone.substring(1);
        }
        
        // Validate phone format
        if (normalizedPhone.length !== 10) {
          console.error("SMS skipped: Invalid phone length", normalizedPhone.length);
        } else if (normalizedPhone.startsWith('0') || normalizedPhone.startsWith('1')) {
          console.error("SMS skipped: Invalid area code");
        } else {
          const e164Phone = `+1${normalizedPhone}`;
          
          // Check if currently within business hours (6AM-9PM Pacific)
          const now = new Date();
          const pstOffset = -8; // PST offset (simplified; doesn't account for DST)
          const utcHour = now.getUTCHours();
          const pstHour = (utcHour + pstOffset + 24) % 24;
          const isBusinessHours = pstHour >= 6 && pstHour < 21;
          
          const afterHoursNote = !isBusinessHours 
            ? '\n\n🕐 Our team is currently offline (6am-9pm). We\'ll follow up first thing!' 
            : '';

          const afterHoursNoteLocalized = !isBusinessHours ? t.afterHours : '';
          
          const smsBody = isHeavy
            ? t.smsHeavy(customerName, sizeLabel, zipCode, rentalDays, estimatedMin, estimatedMax) + afterHoursNoteLocalized
            : t.smsGeneral(customerName, sizeLabel, zipCode, rentalDays, includedTons, estimatedMin, estimatedMax) + afterHoursNoteLocalized;

          const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
          const authHeader = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

          const formData = new URLSearchParams();
          formData.append("To", e164Phone);
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
          
          if (smsResult.error_code) {
            console.error("Twilio error:", smsResult.error_code, smsResult.error_message);
            smsResult = null; // Mark as failed
          } else {
            console.log("SMS sent successfully:", smsResult.sid);
          }
        }
      } catch (smsError) {
        console.error("SMS send error:", smsError);
      }
    } else {
      console.log("Twilio credentials not configured or no phone provided, skipping SMS");
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
