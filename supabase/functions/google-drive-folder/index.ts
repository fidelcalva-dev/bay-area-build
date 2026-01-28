import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { getValidAccessToken, checkSubMode } from "../_shared/google-auth.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface CreateFolderRequest {
  folderName: string;
  parentFolderId?: string;
  entityType: string;
  entityId: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    // Verify user is authenticated
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabase = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_ANON_KEY')!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace('Bearer ', '');
    const { data: claims, error: authError } = await supabase.auth.getClaims(token);
    if (authError || !claims?.claims) {
      return new Response(
        JSON.stringify({ error: 'Unauthorized' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const userId = claims.claims.sub as string;

    // Parse request
    const body: CreateFolderRequest = await req.json();
    const { folderName, parentFolderId, entityType, entityId } = body;

    if (!folderName || !entityType || !entityId) {
      return new Response(
        JSON.stringify({ error: 'Missing required fields: folderName, entityType, entityId' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check mode
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL')!,
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
    );

    const driveMode = await checkSubMode(supabaseAdmin, 'drive_mode');

    // Check if folder already exists for entity
    const { data: existingLink } = await supabaseAdmin
      .from('entity_google_links')
      .select('drive_folder_id, drive_folder_url')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .single();

    if (existingLink?.drive_folder_id) {
      return new Response(
        JSON.stringify({ 
          success: true,
          folderId: existingLink.drive_folder_id,
          folderUrl: existingLink.drive_folder_url,
          message: 'Folder already exists for this entity'
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get valid access token
    const tokenData = await getValidAccessToken(supabaseAdmin, userId);
    if (!tokenData) {
      return new Response(
        JSON.stringify({ error: 'No Google account connected or token expired' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const requestPayload = { folderName, parentFolderId, entityType, entityId };

    if (driveMode === 'OFF' || driveMode === 'DRY_RUN') {
      // Log but don't create
      await supabaseAdmin.rpc('log_google_event', {
        p_user_id: userId,
        p_action_type: 'CREATE_DRIVE_FOLDER',
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_request_json: requestPayload,
        p_status: driveMode === 'OFF' ? 'SKIPPED' : 'DRY_RUN',
        p_duration_ms: Date.now() - startTime,
      });

      console.log(`[${driveMode}] Would create folder:`, folderName);

      return new Response(
        JSON.stringify({ 
          success: true, 
          mode: driveMode,
          message: `Folder would be created (${driveMode} mode)`,
          wouldCreate: { folderName, parentFolderId }
        }),
        { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // LIVE mode - create folder
    const folderMetadata: Record<string, unknown> = {
      name: folderName,
      mimeType: 'application/vnd.google-apps.folder',
    };

    if (parentFolderId) {
      folderMetadata.parents = [parentFolderId];
    }

    const response = await fetch('https://www.googleapis.com/drive/v3/files', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${tokenData.accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(folderMetadata),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('Drive API error:', errorText);
      
      await supabaseAdmin.rpc('log_google_event', {
        p_user_id: userId,
        p_action_type: 'CREATE_DRIVE_FOLDER',
        p_entity_type: entityType,
        p_entity_id: entityId,
        p_request_json: requestPayload,
        p_status: 'FAILED',
        p_error_message: errorText,
        p_duration_ms: Date.now() - startTime,
      });

      throw new Error(`Drive API error: ${errorText}`);
    }

    const result = await response.json();
    const folderUrl = `https://drive.google.com/drive/folders/${result.id}`;

    // Log success
    await supabaseAdmin.rpc('log_google_event', {
      p_user_id: userId,
      p_action_type: 'CREATE_DRIVE_FOLDER',
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_request_json: requestPayload,
      p_response_json: { folderId: result.id, folderUrl },
      p_status: 'SUCCESS',
      p_duration_ms: Date.now() - startTime,
    });

    // Link to entity
    await supabaseAdmin.rpc('upsert_entity_google_link', {
      p_entity_type: entityType,
      p_entity_id: entityId,
      p_drive_folder_id: result.id,
      p_drive_folder_url: folderUrl,
    });

    console.log('Folder created successfully:', result.id);

    return new Response(
      JSON.stringify({ 
        success: true, 
        mode: 'LIVE',
        folderId: result.id,
        folderUrl,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error: unknown) {
    console.error('Create folder error:', error);
    const message = error instanceof Error ? error.message : 'Internal server error';
    return new Response(
      JSON.stringify({ error: message }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
