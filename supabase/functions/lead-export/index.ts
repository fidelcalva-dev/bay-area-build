import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface ExportFilters {
  date_start?: string;
  date_end?: string;
  status?: string;
  source_key?: string;
  assigned_team?: string;
  customer_type?: string;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const { job_id, format, filters } = await req.json() as {
      job_id?: string;
      format: 'csv' | 'word';
      filters: ExportFilters;
    };

    console.log('Lead export request:', { job_id, format, filters });

    // Create or get job
    let exportJobId = job_id;
    if (!exportJobId) {
      const { data: job, error: jobError } = await supabase
        .from('lead_export_jobs')
        .insert({
          export_format: format,
          filters_json: filters,
          date_range_start: filters.date_start,
          date_range_end: filters.date_end,
          status: 'processing',
        })
        .select('id')
        .single();

      if (jobError) throw jobError;
      exportJobId = job.id;
    } else {
      await supabase
        .from('lead_export_jobs')
        .update({ status: 'processing' })
        .eq('id', exportJobId);
    }

    // Build query
    let query = supabase
      .from('sales_leads')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters.date_start) {
      query = query.gte('created_at', filters.date_start);
    }
    if (filters.date_end) {
      query = query.lte('created_at', filters.date_end);
    }
    if (filters.status) {
      query = query.eq('lead_status', filters.status);
    }
    if (filters.source_key) {
      query = query.eq('source_key', filters.source_key);
    }
    if (filters.assigned_team) {
      query = query.eq('assignment_type', filters.assigned_team);
    }
    if (filters.customer_type) {
      query = query.eq('customer_type_detected', filters.customer_type);
    }

    const { data: leads, error: leadsError } = await query.limit(1000);

    if (leadsError) throw leadsError;

    let fileContent: string;
    let fileName: string;
    let contentType: string;

    if (format === 'csv') {
      fileContent = generateCSV(leads || []);
      fileName = `leads-export-${Date.now()}.csv`;
      contentType = 'text/csv';
    } else {
      // Generate simple HTML that can be opened in Word
      fileContent = generateWordHTML(leads || [], filters);
      fileName = `leads-export-${Date.now()}.doc`;
      contentType = 'application/msword';
    }

    // Upload to storage
    const { error: uploadError } = await supabase.storage
      .from('lead-exports')
      .upload(fileName, new Blob([fileContent], { type: contentType }), {
        contentType,
        upsert: false,
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      throw uploadError;
    }

    // Get signed URL (valid for 24 hours)
    const { data: signedUrl } = await supabase.storage
      .from('lead-exports')
      .createSignedUrl(fileName, 86400);

    // Update job
    await supabase
      .from('lead_export_jobs')
      .update({
        status: 'done',
        output_file_path: fileName,
        output_file_url: signedUrl?.signedUrl,
        leads_count: leads?.length || 0,
        completed_at: new Date().toISOString(),
      })
      .eq('id', exportJobId);

    console.log('Export complete:', fileName, leads?.length, 'leads');

    return new Response(
      JSON.stringify({
        success: true,
        job_id: exportJobId,
        file_name: fileName,
        download_url: signedUrl?.signedUrl,
        leads_count: leads?.length || 0,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Export error:', error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : 'Unknown error' }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});

function generateCSV(leads: Record<string, unknown>[]): string {
  const headers = [
    'ID', 'Created', 'Name', 'Phone', 'Email', 'Company',
    'City', 'ZIP', 'Source', 'Status', 'Customer Type',
    'Project', 'Assigned Team', 'Notes'
  ];

  const rows = leads.map(lead => [
    lead.id,
    lead.created_at ? new Date(lead.created_at as string).toLocaleDateString() : '',
    lead.customer_name || '',
    lead.customer_phone || '',
    lead.customer_email || '',
    lead.company_name || '',
    lead.city || '',
    lead.zip || '',
    lead.source_key || lead.lead_source || '',
    lead.lead_status || '',
    lead.customer_type_detected || '',
    lead.project_category || '',
    lead.assignment_type || '',
    (lead.notes || '').toString().replace(/"/g, '""').substring(0, 200),
  ].map(cell => `"${cell}"`).join(','));

  return [headers.join(','), ...rows].join('\n');
}

function generateWordHTML(leads: Record<string, unknown>[], filters: ExportFilters): string {
  const dateRange = filters.date_start && filters.date_end
    ? `${new Date(filters.date_start).toLocaleDateString()} - ${new Date(filters.date_end).toLocaleDateString()}`
    : 'All Time';

  const rows = leads.map(lead => `
    <tr>
      <td>${new Date(lead.created_at as string).toLocaleDateString()}</td>
      <td>${lead.customer_name || '—'}</td>
      <td>${lead.customer_phone || '—'}</td>
      <td>${lead.customer_email || '—'}</td>
      <td>${lead.city || '—'}</td>
      <td>${lead.source_key || lead.lead_source || '—'}</td>
      <td>${lead.lead_status || '—'}</td>
      <td>${lead.customer_type_detected || '—'}</td>
      <td>${lead.assignment_type || '—'}</td>
    </tr>
  `).join('');

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>Leads Export</title>
  <style>
    body { font-family: Arial, sans-serif; margin: 20px; }
    h1 { color: #333; }
    .meta { color: #666; margin-bottom: 20px; }
    table { border-collapse: collapse; width: 100%; }
    th, td { border: 1px solid #ddd; padding: 8px; text-align: left; font-size: 11px; }
    th { background-color: #f4f4f4; font-weight: bold; }
    tr:nth-child(even) { background-color: #f9f9f9; }
  </style>
</head>
<body>
  <h1>Leads Export Report</h1>
  <div class="meta">
    <p><strong>Date Range:</strong> ${dateRange}</p>
    <p><strong>Total Leads:</strong> ${leads.length}</p>
    <p><strong>Generated:</strong> ${new Date().toLocaleString()}</p>
    ${filters.status ? `<p><strong>Status Filter:</strong> ${filters.status}</p>` : ''}
    ${filters.source_key ? `<p><strong>Source Filter:</strong> ${filters.source_key}</p>` : ''}
  </div>
  <table>
    <thead>
      <tr>
        <th>Date</th>
        <th>Name</th>
        <th>Phone</th>
        <th>Email</th>
        <th>City</th>
        <th>Source</th>
        <th>Status</th>
        <th>Type</th>
        <th>Team</th>
      </tr>
    </thead>
    <tbody>
      ${rows}
    </tbody>
  </table>
</body>
</html>
  `;
}
