import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

interface CustomerRecord {
  company_name: string | null;
  contact_name: string | null;
  billing_email: string | null;
  billing_phone: string | null;
  phone: string | null;
  customer_type: string;
  is_active: boolean;
}

function cleanPhone(raw: string): string | null {
  if (!raw) return null;
  let digits = raw.replace(/\D/g, "");
  if (digits.length === 11 && digits.startsWith("1")) digits = digits.substring(1);
  if (digits.length < 7 || digits.length > 11) return null;
  return digits;
}

function cleanEmail(raw: string): string | null {
  if (!raw) return null;
  const trimmed = raw.trim().toLowerCase().replace(/\\@/g, "@");
  if (!trimmed || !trimmed.includes("@") || trimmed.includes("#ERROR")) return null;
  return trimmed;
}

function parseLine(line: string): CustomerRecord | null {
  // Remove leading/trailing pipes and split
  const cleaned = line.replace(/^\|/, "").replace(/\|$/, "");
  const parts = cleaned.split("|").map((p) => p.trim());

  if (parts.length === 4) {
    // Format: Contact | Company | Phone | Email
    const [contact, company, phone, email] = parts;
    const cleanedPhone = cleanPhone(phone);
    const cleanedEmail = cleanEmail(email);
    const hasCompany = company && company.length > 0;
    const hasContact = contact && contact.length > 0;

    if (!hasCompany && !hasContact && !cleanedEmail && !cleanedPhone) return null;

    return {
      company_name: hasCompany ? company : hasContact ? contact : null,
      contact_name: hasContact ? contact : null,
      billing_email: cleanedEmail,
      billing_phone: cleanedPhone,
      phone: cleanedPhone,
      customer_type: hasCompany ? "contractor" : "homeowner",
      is_active: true,
    };
  } else if (parts.length === 3) {
    // Format: Name/Company | Email | Phone
    const [name, email, phone] = parts;
    const cleanedPhone = cleanPhone(phone);
    const cleanedEmail = cleanEmail(email);
    const hasName = name && name.length > 0;

    if (!hasName && !cleanedEmail && !cleanedPhone) return null;

    return {
      company_name: hasName ? name : null,
      contact_name: hasName ? name : null,
      billing_email: cleanedEmail,
      billing_phone: cleanedPhone,
      phone: cleanedPhone,
      customer_type: "homeowner",
      is_active: true,
    };
  }

  return null;
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { raw_data } = await req.json();

    if (!raw_data || typeof raw_data !== "string") {
      return new Response(JSON.stringify({ error: "raw_data string required" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const lines = raw_data.split("\n");
    const customers: CustomerRecord[] = [];

    for (const line of lines) {
      // Skip headers, separators, page markers, empty lines
      if (!line.startsWith("|")) continue;
      if (line.includes("|-")) continue;
      if (line.includes("|Contact|") || line.includes("|Company|") || line.includes("|Phone|") || line.includes("|Email|")) continue;

      const record = parseLine(line);
      if (record) {
        customers.push(record);
      }
    }

    // Deduplicate by phone or email
    const seen = new Set<string>();
    const unique: CustomerRecord[] = [];
    for (const c of customers) {
      const key = c.billing_phone || c.billing_email || c.company_name || "";
      if (key && seen.has(key)) continue;
      if (key) seen.add(key);
      unique.push(c);
    }

    // Insert in batches of 200
    const batchSize = 200;
    let totalInserted = 0;
    let totalErrors = 0;
    const errors: string[] = [];

    for (let i = 0; i < unique.length; i += batchSize) {
      const batch = unique.slice(i, i + batchSize);

      const { data, error } = await supabase
        .from("customers")
        .insert(batch)
        .select("id");

      if (error) {
        errors.push(`Batch ${Math.floor(i / batchSize) + 1}: ${error.message}`);
        totalErrors += batch.length;
      } else {
        totalInserted += data?.length || 0;
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        total_parsed: customers.length,
        total_unique: unique.length,
        total_inserted: totalInserted,
        total_errors: totalErrors,
        errors: errors.length > 0 ? errors : undefined,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});
