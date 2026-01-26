import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface DocContent {
  title: string;
  version: string;
  sections: { heading: string; items: string[] }[];
}

const NON_NEGOTIABLE_RULES: DocContent = {
  title: "NON-NEGOTIABLE RULES MANUAL",
  version: "v1.0",
  sections: [
    {
      heading: "1. MATERIAL CLASSIFICATION RULES",
      items: [
        "GRASS IS DEBRIS HEAVY: Grass and yard waste are ALWAYS treated as mixed debris due to soil content. Green Halo does NOT apply.",
        "FILL LINE REQUIRED: Heavy dumpsters (concrete, dirt, rock) must NOT be filled above the marked fill line. 10-ton hard cap.",
        "CONTAMINATION RECLASSIFICATION: If trash is found in heavy clean load, entire order reclassifies to Mixed Debris pricing at $165/ton.",
        "GREEN HALO ELIGIBILITY: Only Clean Concrete, Clean Asphalt, Clean Brick/Block, Clean Wood (no paint), Wood Chips qualify."
      ]
    },
    {
      heading: "2. PHOTO & DOCUMENTATION RULES",
      items: [
        "MANDATORY PRE-PICKUP PHOTOS: Before completing heavy material pickup - wide-angle showing fill level AND close-up of material type.",
        "CONTAMINATION EVIDENCE: If contamination detected, photos are REQUIRED before proceeding. No exceptions.",
        "SCALE TICKETS: All hauls to facilities require scale ticket upload. No ticket = no billing for extra tons."
      ]
    },
    {
      heading: "3. BILLING & PRICING RULES",
      items: [
        "EXTRA TON RATE: $165/ton in Oakland/SJ markets. Pre-pay discount: $156.75/ton (5% off).",
        "INCLUDED TONS BY SIZE: 5yd=0.5T, 6yd=0.6T, 8yd=0.8T, 10yd=1.0T. Never round down.",
        "OVERDUE RATE: $35/day after included rental period.",
        "AUTO-BILL LIMITS: Contractors up to $250 auto-billed. Homeowners require approval for ANY auto-billing."
      ]
    },
    {
      heading: "4. APPROVAL THRESHOLDS",
      items: [
        "Price adjustments over $250 require Admin approval.",
        "Homeowner overdue charges require approval.",
        "Reclassification billing over $250 requires approval.",
        "ALL refunds and credits require approval. No exceptions."
      ]
    },
    {
      heading: "5. CUSTOMER COMMUNICATION RULES",
      items: [
        "Quote follow-up within 60 minutes of creation.",
        "Existing customers route to CS, not Sales.",
        "Proactive ETA updates if run delayed 30+ minutes.",
        "Never promise specific delivery times - use windows only."
      ]
    },
    {
      heading: "6. SYSTEM SAFETY RULES",
      items: [
        "DRY_RUN mode for all messaging/telephony until explicit LIVE approval.",
        "Master AI cannot move money, sign contracts, or issue refunds.",
        "Config changes (pricing, modes, thresholds) require version history documentation.",
        "RLS policy changes require security review."
      ]
    }
  ]
};

const CEO_WEEKLY_CHECKLIST: DocContent = {
  title: "CEO WEEKLY CHECKLIST",
  version: "v1.0",
  sections: [
    {
      heading: "MONDAY - WEEK KICKOFF",
      items: [
        "Review KPI Dashboard: Revenue trend, utilization %, lead conversion rate.",
        "Check Approval Queue: Clear any weekend backlog (reclassifications, refunds).",
        "Review Master AI Decisions: Scan for any 'requires_approval' items."
      ]
    },
    {
      heading: "WEDNESDAY - MID-WEEK CHECK",
      items: [
        "Overdue Assets: Review any assets out 7+ days. Approve billing actions.",
        "Heavy Risk Orders: Check any HIGH risk orders approaching pickup.",
        "Failed Runs: Review root causes of any failed/cancelled runs."
      ]
    },
    {
      heading: "FRIDAY - WEEKLY CLOSE",
      items: [
        "Revenue vs Target: Compare week's revenue to projections.",
        "Clear Approval Queue: Do not leave approvals pending over weekend.",
        "Review Alerts: Acknowledge or resolve any outstanding alerts.",
        "Team Pulse: Quick check on Sales/CS/Dispatch performance metrics."
      ]
    },
    {
      heading: "WHAT NOT TO DO",
      items: [
        "DO NOT micromanage dispatch assignments - trust the system.",
        "DO NOT override Master AI for routine escalations.",
        "DO NOT change pricing without documenting reason.",
        "DO NOT skip approval queue - it exists for a reason."
      ]
    },
    {
      heading: "ESCALATION TRIGGERS (Require CEO Attention)",
      items: [
        "Customer complaint escalated beyond CS.",
        "Refund request over $500.",
        "System mode change (DRY_RUN → LIVE).",
        "Any security or data incident.",
        "Vendor/facility relationship issues."
      ]
    }
  ]
};

const PLAYBOOK_EXCEPTIONS: DocContent = {
  title: "PLAYBOOK OF EXCEPTIONS",
  version: "v1.0",
  sections: [
    {
      heading: "WHEN TO BREAK THE RULES",
      items: [
        "Customer safety emergency: Override any process delay.",
        "Major storm/disaster: Suspend overdue billing, prioritize pickups.",
        "Long-term contractor relationship at risk: Escalate to CEO before losing account."
      ]
    },
    {
      heading: "PRICING EXCEPTIONS (Require Documentation)",
      items: [
        "Repeat customer discount: Up to 10% with Sales Manager approval.",
        "Multi-dumpster project: Custom quote allowed, document in notes.",
        "Competitor match: Allowed if verified, document competitor quote."
      ]
    },
    {
      heading: "OPERATIONAL EXCEPTIONS",
      items: [
        "Same-day delivery: $100 rush fee, driver availability required.",
        "After-hours pickup: $150 fee, requires Dispatch Manager approval.",
        "Weekend service: By special request only, premium pricing applies."
      ]
    },
    {
      heading: "NEVER EXCEPTIONS (Absolutely No Override)",
      items: [
        "Fill line on heavy materials - SAFETY.",
        "Pre-pickup photos on heavy - COMPLIANCE.",
        "Admin approval for refunds - FINANCIAL CONTROL.",
        "RLS policy changes without review - SECURITY."
      ]
    }
  ]
};

function generatePdfContent(doc: DocContent, date: string): string {
  let content = `
%PDF-1.4
1 0 obj
<< /Type /Catalog /Pages 2 0 R >>
endobj

2 0 obj
<< /Type /Pages /Kids [3 0 R] /Count 1 >>
endobj

3 0 obj
<< /Type /Page /Parent 2 0 R /MediaBox [0 0 612 792] /Contents 4 0 R /Resources << /Font << /F1 5 0 R /F2 6 0 R >> >> >>
endobj

5 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>
endobj

6 0 obj
<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>
endobj

4 0 obj
<< /Length 7 0 R >>
stream
BT
/F1 24 Tf
50 750 Td
(CALSAN DUMPSTERS PRO) Tj
/F2 12 Tf
0 -20 Td
(Internal Use Only) Tj
/F1 18 Tf
0 -40 Td
(${doc.title}) Tj
/F2 10 Tf
0 -20 Td
(Version: ${doc.version} | Generated: ${date}) Tj
0 -30 Td
`;

  let yPos = 640;
  for (const section of doc.sections) {
    content += `/F1 14 Tf\n0 -30 Td\n(${section.heading}) Tj\n`;
    yPos -= 30;
    
    for (const item of section.items) {
      const cleanItem = item.replace(/[()]/g, '').substring(0, 80);
      content += `/F2 10 Tf\n0 -15 Td\n(  - ${cleanItem}) Tj\n`;
      yPos -= 15;
    }
  }

  content += `
ET
endstream
endobj

7 0 obj
${content.length}
endobj

xref
0 8
0000000000 65535 f 
0000000009 00000 n 
0000000058 00000 n 
0000000115 00000 n 
trailer
<< /Size 8 /Root 1 0 R >>
startxref
${content.length + 500}
%%EOF
`;

  return content;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const anonClient = createClient(
      supabaseUrl,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claimsData, error: claimsError } = await anonClient.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: 'Invalid token' }), { 
        status: 401, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = claimsData.claims.sub as string;

    // Check admin role
    const { data: roleData } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId)
      .eq('role', 'admin')
      .maybeSingle();

    if (!roleData) {
      return new Response(JSON.stringify({ error: 'Admin access required' }), { 
        status: 403, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const { doc_key, description } = await req.json();

    if (!doc_key || !['NON_NEGOTIABLE_RULES', 'CEO_WEEKLY_CHECKLIST', 'PLAYBOOK_EXCEPTIONS'].includes(doc_key)) {
      return new Response(JSON.stringify({ error: 'Invalid doc_key' }), { 
        status: 400, 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    // Get latest version number
    const { data: latestDoc } = await supabase
      .from('internal_documents')
      .select('version')
      .eq('doc_key', doc_key)
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    let newVersion = 'v1.0';
    if (latestDoc?.version) {
      const match = latestDoc.version.match(/v(\d+)\.(\d+)/);
      if (match) {
        const major = parseInt(match[1]);
        const minor = parseInt(match[2]) + 1;
        newVersion = `v${major}.${minor}`;
      }
    }

    // Mark old versions as inactive
    await supabase
      .from('internal_documents')
      .update({ is_active: false })
      .eq('doc_key', doc_key);

    // Get document content
    let docContent: DocContent;
    let title: string;
    switch (doc_key) {
      case 'NON_NEGOTIABLE_RULES':
        docContent = { ...NON_NEGOTIABLE_RULES, version: newVersion };
        title = 'Non-Negotiable Rules Manual';
        break;
      case 'CEO_WEEKLY_CHECKLIST':
        docContent = { ...CEO_WEEKLY_CHECKLIST, version: newVersion };
        title = 'CEO Weekly Checklist';
        break;
      case 'PLAYBOOK_EXCEPTIONS':
        docContent = { ...PLAYBOOK_EXCEPTIONS, version: newVersion };
        title = 'Playbook of Exceptions';
        break;
      default:
        throw new Error('Unknown doc_key');
    }

    const date = new Date().toISOString().split('T')[0];
    const pdfContent = generatePdfContent(docContent, date);
    const pdfBytes = new TextEncoder().encode(pdfContent);

    // Upload to storage
    const filePath = `${doc_key}/${doc_key}_${newVersion}_${date}.pdf`;
    const { error: uploadError } = await supabase.storage
      .from('internal-docs')
      .upload(filePath, pdfBytes, {
        contentType: 'application/pdf',
        upsert: true
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw new Error(`Failed to upload PDF: ${uploadError.message}`);
    }

    // Create document record
    const { data: docRecord, error: insertError } = await supabase
      .from('internal_documents')
      .insert({
        doc_key,
        title,
        version: newVersion,
        description: description || `Generated ${date}`,
        file_path: filePath,
        is_active: true,
        created_by_user_id: userId
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create document record: ${insertError.message}`);
    }

    // Generate signed URL
    const { data: signedUrlData } = await supabase.storage
      .from('internal-docs')
      .createSignedUrl(filePath, 3600); // 1 hour expiry

    return new Response(JSON.stringify({
      success: true,
      document: docRecord,
      download_url: signedUrlData?.signedUrl
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error generating PDF:', error);
    return new Response(JSON.stringify({ 
      error: error instanceof Error ? error.message : 'Failed to generate PDF' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  }
});
