// Google Workspace Integration Service
// Frontend service for interacting with Google integration edge functions

import { supabase } from '@/integrations/supabase/client';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

export interface GoogleConnectionStatus {
  isConnected: boolean;
  googleEmail?: string;
  status?: 'CONNECTED' | 'EXPIRED' | 'REVOKED' | 'PENDING';
  expiresAt?: string;
}

export interface SendEmailParams {
  to: string;
  subject: string;
  body: string;
  bodyType?: 'text' | 'html';
  entityType?: string;
  entityId?: string;
  cc?: string;
  bcc?: string;
}

export interface CreateMeetParams {
  title: string;
  description?: string;
  startTime: string;
  endTime: string;
  attendees?: string[];
  entityType?: string;
  entityId?: string;
}

export interface CreateDriveFolderParams {
  folderName: string;
  parentFolderId?: string;
  entityType: string;
  entityId: string;
}

export interface PostChatParams {
  spaceName: string;
  text: string;
  thread?: string;
  entityType?: string;
  entityId?: string;
}

export interface EntityGoogleLinks {
  id: string;
  entity_type: string;
  entity_id: string;
  gmail_thread_ids: string[];
  chat_space_id?: string;
  meet_event_id?: string;
  meet_link?: string;
  drive_folder_id?: string;
  drive_folder_url?: string;
  drive_file_ids_json: string[];
}

async function getAuthHeaders(): Promise<HeadersInit> {
  const { data: { session } } = await supabase.auth.getSession();
  if (!session?.access_token) {
    throw new Error('Not authenticated');
  }
  return {
    'Authorization': `Bearer ${session.access_token}`,
    'Content-Type': 'application/json',
  };
}

export const googleService = {
  /**
   * Check if current user has Google account connected
   */
  async getConnectionStatus(): Promise<GoogleConnectionStatus> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { isConnected: false };
    }

    const { data, error } = await supabase
      .from('google_connections')
      .select('google_email, status, token_expires_at')
      .eq('user_id', user.id)
      .maybeSingle();

    if (error || !data) {
      return { isConnected: false };
    }

    return {
      isConnected: data.status === 'CONNECTED',
      googleEmail: data.google_email,
      status: data.status as GoogleConnectionStatus['status'],
      expiresAt: data.token_expires_at,
    };
  },

  /**
   * Start OAuth flow to connect Google account
   * Opens popup window for Google sign-in
   */
  async connectGoogleAccount(): Promise<{ success: boolean; email?: string; error?: string }> {
    return new Promise(async (resolve) => {
      try {
        const headers = await getAuthHeaders();
        
        const response = await fetch(`${SUPABASE_URL}/functions/v1/google-oauth-start`, {
          method: 'POST',
          headers,
        });

        const result = await response.json();
        
        if (!response.ok || !result.oauth_url) {
          resolve({ success: false, error: result.error || 'Failed to start OAuth' });
          return;
        }

        // Open popup for OAuth
        const popup = window.open(
          result.oauth_url,
          'google-oauth',
          'width=500,height=600,scrollbars=yes'
        );

        // Listen for message from popup
        const handleMessage = (event: MessageEvent) => {
          if (event.data?.type === 'google-oauth-success') {
            window.removeEventListener('message', handleMessage);
            resolve({ success: true, email: event.data.email });
          } else if (event.data?.type === 'google-oauth-error') {
            window.removeEventListener('message', handleMessage);
            resolve({ success: false, error: event.data.error });
          }
        };

        window.addEventListener('message', handleMessage);

        // Check if popup was closed without completing
        const checkClosed = setInterval(() => {
          if (popup?.closed) {
            clearInterval(checkClosed);
            window.removeEventListener('message', handleMessage);
            // Give a moment for the message to arrive
            setTimeout(() => {
              resolve({ success: false, error: 'OAuth cancelled' });
            }, 500);
          }
        }, 500);

      } catch (err) {
        resolve({ success: false, error: err instanceof Error ? err.message : 'Unknown error' });
      }
    });
  },

  /**
   * Disconnect Google account
   */
  async disconnectGoogleAccount(): Promise<{ success: boolean; error?: string }> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      return { success: false, error: 'Not authenticated' };
    }

    const { error } = await supabase
      .from('google_connections')
      .delete()
      .eq('user_id', user.id);

    if (error) {
      return { success: false, error: error.message };
    }

    return { success: true };
  },

  /**
   * Send email via Gmail
   */
  async sendEmail(params: SendEmailParams): Promise<{ 
    success: boolean; 
    mode?: 'DRY_RUN' | 'LIVE';
    messageId?: string;
    threadId?: string;
    error?: string;
  }> {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/google-send-email`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to send email' };
      }

      return {
        success: true,
        mode: result.mode,
        messageId: result.messageId,
        threadId: result.threadId,
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  /**
   * Create Google Meet
   */
  async createMeet(params: CreateMeetParams): Promise<{
    success: boolean;
    mode?: 'DRY_RUN' | 'LIVE';
    meetLink?: string;
    eventId?: string;
    error?: string;
  }> {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/google-create-meet`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to create meet' };
      }

      return {
        success: true,
        mode: result.mode,
        meetLink: result.meetLink,
        eventId: result.eventId,
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  /**
   * Create Drive folder for entity
   */
  async createDriveFolder(params: CreateDriveFolderParams): Promise<{
    success: boolean;
    mode?: 'DRY_RUN' | 'LIVE';
    folderId?: string;
    folderUrl?: string;
    error?: string;
  }> {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/google-drive-folder`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to create folder' };
      }

      return {
        success: true,
        mode: result.mode,
        folderId: result.folderId,
        folderUrl: result.folderUrl,
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  /**
   * Post message to Google Chat space
   */
  async postToChat(params: PostChatParams): Promise<{
    success: boolean;
    mode?: 'DRY_RUN' | 'LIVE';
    error?: string;
  }> {
    try {
      const headers = await getAuthHeaders();
      
      const response = await fetch(`${SUPABASE_URL}/functions/v1/google-chat-webhook`, {
        method: 'POST',
        headers,
        body: JSON.stringify(params),
      });

      const result = await response.json();
      
      if (!response.ok) {
        return { success: false, error: result.error || 'Failed to post message' };
      }

      return {
        success: true,
        mode: result.mode,
      };
    } catch (err) {
      return { success: false, error: err instanceof Error ? err.message : 'Unknown error' };
    }
  },

  /**
   * Get Google links for an entity
   */
  async getEntityLinks(entityType: string, entityId: string): Promise<EntityGoogleLinks | null> {
    const { data, error } = await supabase
      .from('entity_google_links')
      .select('*')
      .eq('entity_type', entityType)
      .eq('entity_id', entityId)
      .maybeSingle();

    if (error || !data) return null;
    return data as unknown as EntityGoogleLinks;
  },

  /**
   * Get Google integration mode
   */
  async getMode(): Promise<'DRY_RUN' | 'LIVE'> {
    const { data } = await supabase
      .from('config_settings')
      .select('value')
      .eq('key', 'google.mode')
      .single();

    if (!data?.value) return 'DRY_RUN';
    return JSON.parse(data.value as string);
  },

  /**
   * Get event logs for user
   */
  async getEventLogs(limit = 50): Promise<Array<{
    id: string;
    action_type: string;
    entity_type: string | null;
    entity_id: string | null;
    status: string;
    created_at: string;
  }>> {
    const { data, error } = await supabase
      .from('google_events_log')
      .select('id, action_type, entity_type, entity_id, status, created_at')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (error || !data) return [];
    return data;
  },
};

export default googleService;
