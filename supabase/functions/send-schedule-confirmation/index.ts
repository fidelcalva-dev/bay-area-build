import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface ConfirmationRequest {
  orderId: string;
  customerPhone: string;
  customerName?: string;
  deliveryDate: string;
  deliveryWindow: string;
  pickupDate?: string;
  pickupWindow?: string;
  language?: 'en' | 'es';
}

// Format date for display
function formatDate(dateStr: string): string {
  const date = new Date(dateStr);
  const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric' };
  return date.toLocaleDateString('en-US', options);
}

// Format window for display
function formatWindow(window: string, lang: 'en' | 'es'): string {
  const windows: Record<string, { en: string; es: string }> = {
    morning: { en: '7-11 AM', es: '7-11 AM' },
    midday: { en: '11 AM-3 PM', es: '11 AM-3 PM' },
    afternoon: { en: '3-6 PM', es: '3-6 PM' },
  };
  return windows[window]?.[lang] || window;
}

// Format phone to E.164
function formatPhone(phone: string): string {
  const digits = phone.replace(/\D/g, "");
  if (digits.length === 10) {
    return `+1${digits}`;
  }
  if (digits.length === 11 && digits.startsWith("1")) {
    return `+${digits}`;
  }
  return `+${digits}`;
}

// Disclaimers (standardized legal copy)
const DISCLAIMERS = {
  arrivalTimes: {
    en: 'Arrival times are estimates due to traffic and transfer stations. Keep access clear during the scheduled window.',
    es: 'Los tiempos de llegada son estimados debido al tráfico y centros de transferencia. Mantenga el acceso despejado durante la ventana programada.',
  },
  streetPermit: {
    en: 'Street placement may require a permit.',
    es: 'La colocación en calle puede requerir un permiso.',
  },
};

// Build confirmation message (standardized template)
function buildMessage(data: ConfirmationRequest): string {
  const lang = data.language || 'en';
  const deliveryDate = formatDate(data.deliveryDate);
  const deliveryWindow = formatWindow(data.deliveryWindow, lang);
  
  if (lang === 'es') {
    let message = `Confirmado ✅\n\nEntrega:\n• Fecha: ${deliveryDate}\n• Ventana: ${deliveryWindow}`;
    if (data.pickupDate && data.pickupWindow) {
      const pickupDate = formatDate(data.pickupDate);
      const pickupWindow = formatWindow(data.pickupWindow, lang);
      message += `\n\nRecogida:\n• Fecha: ${pickupDate}\n• Ventana: ${pickupWindow}`;
    }
    message += `\n\nNotas:\n• ${DISCLAIMERS.arrivalTimes.es}\n• ${DISCLAIMERS.streetPermit.es}`;
    return message;
  }
  
  // English
  let message = `Confirmed ✅\n\nDelivery:\n• Date: ${deliveryDate}\n• Time Window: ${deliveryWindow}`;
  if (data.pickupDate && data.pickupWindow) {
    const pickupDate = formatDate(data.pickupDate);
    const pickupWindow = formatWindow(data.pickupWindow, lang);
    message += `\n\nPickup:\n• Date: ${pickupDate}\n• Time Window: ${pickupWindow}`;
  }
  message += `\n\nNotes:\n• ${DISCLAIMERS.arrivalTimes.en}\n• ${DISCLAIMERS.streetPermit.en}`;
  return message;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const supabaseServiceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const data: ConfirmationRequest = await req.json();

    if (!data.orderId || !data.customerPhone || !data.deliveryDate || !data.deliveryWindow) {
      return new Response(
        JSON.stringify({ error: "Missing required fields: orderId, customerPhone, deliveryDate, deliveryWindow" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const formattedPhone = formatPhone(data.customerPhone);
    const messageBody = buildMessage(data);

    // Get Twilio credentials
    const twilioAccountSid = Deno.env.get("TWILIO_ACCOUNT_SID");
    const twilioAuthToken = Deno.env.get("TWILIO_AUTH_TOKEN");
    const twilioPhoneNumber = Deno.env.get("TWILIO_PHONE_NUMBER");

    if (!twilioAccountSid || !twilioAuthToken || !twilioPhoneNumber) {
      console.error("Twilio credentials not configured");
      console.log(`[DEV] Confirmation SMS for ${formattedPhone}: ${messageBody}`);
      
      // Log to message_history anyway
      await supabase.from('message_history').insert({
        order_id: data.orderId,
        customer_phone: formattedPhone,
        direction: 'outbound',
        channel: 'sms',
        message_body: messageBody,
        template_key: 'schedule_confirmation',
        status: 'dev_mode',
      });

      return new Response(
        JSON.stringify({ 
          success: true, 
          message: "SMS logged (dev mode)", 
          dev_message: messageBody 
        }),
        { headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Send SMS via Twilio
    const twilioUrl = `https://api.twilio.com/2010-04-01/Accounts/${twilioAccountSid}/Messages.json`;
    const twilioAuth = btoa(`${twilioAccountSid}:${twilioAuthToken}`);

    const smsResponse = await fetch(twilioUrl, {
      method: "POST",
      headers: {
        Authorization: `Basic ${twilioAuth}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({
        To: formattedPhone,
        From: twilioPhoneNumber,
        Body: messageBody,
      }),
    });

    const smsResult = await smsResponse.json();

    if (!smsResponse.ok) {
      console.error("Twilio error:", smsResult);
      
      // Log failed attempt
      await supabase.from('message_history').insert({
        order_id: data.orderId,
        customer_phone: formattedPhone,
        direction: 'outbound',
        channel: 'sms',
        message_body: messageBody,
        template_key: 'schedule_confirmation',
        status: 'failed',
        external_id: smsResult.sid,
      });

      return new Response(
        JSON.stringify({ error: "Failed to send SMS", details: smsResult.message }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Log successful send
    await supabase.from('message_history').insert({
      order_id: data.orderId,
      customer_phone: formattedPhone,
      direction: 'outbound',
      channel: 'sms',
      message_body: messageBody,
      template_key: 'schedule_confirmation',
      status: 'sent',
      external_id: smsResult.sid,
    });

    console.log(`Confirmation SMS sent to ${formattedPhone} for order ${data.orderId}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        message: "Confirmation SMS sent",
        messageSid: smsResult.sid 
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
