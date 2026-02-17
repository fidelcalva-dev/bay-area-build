// Google OAuth utilities for Edge Functions
// NEVER expose tokens to frontend - all operations server-side only

import { createClient, SupabaseClient } from "https://esm.sh/@supabase/supabase-js@2";

export interface GoogleTokens {
  access_token: string;
  refresh_token: string;
  expires_in: number;
  token_type: string;
  scope: string;
}

export interface GoogleUserInfo {
  id: string;
  email: string;
  verified_email: boolean;
  name?: string;
  picture?: string;
}

interface GoogleConnection {
  id: string;
  user_id: string;
  google_email: string;
  scopes_json: string[];
  access_token_encrypted: string;
  refresh_token_encrypted: string;
  token_expires_at: string;
  status: string;
  last_used_at: string | null;
}

// Required scopes for full integration
export const GOOGLE_SCOPES = [
  'openid',
  'email',
  'profile',
  'https://www.googleapis.com/auth/gmail.send',
  'https://www.googleapis.com/auth/gmail.readonly',
  'https://www.googleapis.com/auth/calendar.events',
  'https://www.googleapis.com/auth/drive.file',
  // Marketing Intelligence scopes
  'https://www.googleapis.com/auth/analytics.readonly',
  'https://www.googleapis.com/auth/webmasters.readonly',
  'https://www.googleapis.com/auth/business.manage',
].join(' ');

// Simple encryption using base64 + XOR (for demo - use proper encryption in production)
const ENCRYPTION_KEY = Deno.env.get('GOOGLE_ENCRYPTION_KEY') || 'default-key-change-me';

export function encryptToken(token: string): string {
  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
  const tokenBytes = new TextEncoder().encode(token);
  const encrypted = new Uint8Array(tokenBytes.length);
  
  for (let i = 0; i < tokenBytes.length; i++) {
    encrypted[i] = tokenBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return btoa(String.fromCharCode(...encrypted));
}

export function decryptToken(encrypted: string): string {
  const keyBytes = new TextEncoder().encode(ENCRYPTION_KEY);
  const encryptedBytes = new Uint8Array(atob(encrypted).split('').map(c => c.charCodeAt(0)));
  const decrypted = new Uint8Array(encryptedBytes.length);
  
  for (let i = 0; i < encryptedBytes.length; i++) {
    decrypted[i] = encryptedBytes[i] ^ keyBytes[i % keyBytes.length];
  }
  
  return new TextDecoder().decode(decrypted);
}

export function getGoogleOAuthUrl(state: string, redirectUri: string): string {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  if (!clientId) throw new Error('GOOGLE_CLIENT_ID not configured');
  
  const params = new URLSearchParams({
    client_id: clientId,
    redirect_uri: redirectUri,
    response_type: 'code',
    scope: GOOGLE_SCOPES,
    access_type: 'offline',
    prompt: 'consent',
    state,
  });
  
  return `https://accounts.google.com/o/oauth2/v2/auth?${params.toString()}`;
}

export async function exchangeCodeForTokens(code: string, redirectUri: string): Promise<GoogleTokens> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      code,
      grant_type: 'authorization_code',
      redirect_uri: redirectUri,
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token exchange failed: ${error}`);
  }
  
  return response.json();
}

export async function refreshAccessToken(refreshToken: string): Promise<GoogleTokens> {
  const clientId = Deno.env.get('GOOGLE_CLIENT_ID');
  const clientSecret = Deno.env.get('GOOGLE_CLIENT_SECRET');
  
  if (!clientId || !clientSecret) {
    throw new Error('Google OAuth credentials not configured');
  }
  
  const response = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: clientId,
      client_secret: clientSecret,
      refresh_token: refreshToken,
      grant_type: 'refresh_token',
    }),
  });
  
  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Token refresh failed: ${error}`);
  }
  
  return response.json();
}

export async function getGoogleUserInfo(accessToken: string): Promise<GoogleUserInfo> {
  const response = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
  
  if (!response.ok) {
    throw new Error('Failed to get user info');
  }
  
  return response.json();
}

// deno-lint-ignore no-explicit-any
export async function getValidAccessToken(
  supabase: SupabaseClient<any>,
  userId: string
): Promise<{ accessToken: string; googleEmail: string } | null> {
  // Get connection
  const { data, error } = await supabase
    .from('google_connections')
    .select('*')
    .eq('user_id', userId)
    .single();
  
  if (error || !data) return null;
  
  const connection = data as GoogleConnection;
  if (connection.status !== 'CONNECTED') return null;
  
  const now = new Date();
  const expiresAt = new Date(connection.token_expires_at);
  
  let accessToken = decryptToken(connection.access_token_encrypted);
  
  // Refresh if expired or expiring soon (within 5 minutes)
  if (expiresAt.getTime() - now.getTime() < 5 * 60 * 1000) {
    try {
      const refreshToken = decryptToken(connection.refresh_token_encrypted);
      const newTokens = await refreshAccessToken(refreshToken);
      
      accessToken = newTokens.access_token;
      
      // Update stored tokens
      await supabase
        .from('google_connections')
        .update({
          access_token_encrypted: encryptToken(newTokens.access_token),
          token_expires_at: new Date(Date.now() + newTokens.expires_in * 1000).toISOString(),
          last_used_at: new Date().toISOString(),
        })
        .eq('id', connection.id);
      
      console.log('Google token refreshed for user:', userId);
    } catch (err) {
      console.error('Token refresh failed:', err);
      // Mark as expired
      await supabase
        .from('google_connections')
        .update({ status: 'EXPIRED' })
        .eq('id', connection.id);
      
      return null;
    }
  }
  
  return { accessToken, googleEmail: connection.google_email };
}

// deno-lint-ignore no-explicit-any
export async function checkGoogleMode(
  supabase: SupabaseClient<any>
): Promise<'DRY_RUN' | 'LIVE'> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('key', 'google.mode')
    .single();
  
  interface ConfigData { value?: string }
  const configData = data as ConfigData | null;
  const mode = configData?.value ? JSON.parse(configData.value) : 'DRY_RUN';
  return mode;
}

// deno-lint-ignore no-explicit-any
export async function checkSubMode(
  supabase: SupabaseClient<any>,
  subKey: 'gmail_mode' | 'meet_mode' | 'chat_mode' | 'drive_mode'
): Promise<'DRY_RUN' | 'LIVE' | 'OFF'> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('key', `google.${subKey}`)
    .single();
  
  interface ConfigData { value?: string }
  const configData = data as ConfigData | null;
  const mode = configData?.value ? JSON.parse(configData.value) : 'DRY_RUN';
  return mode;
}

// deno-lint-ignore no-explicit-any
export async function checkRoleAllowed(
  supabase: SupabaseClient<any>,
  userId: string,
  configKey: 'gmail_live_roles' | 'meet_live_roles'
): Promise<boolean> {
  // Get allowed roles from config
  const { data: configData } = await supabase
    .from('config_settings')
    .select('value')
    .eq('key', `google.${configKey}`)
    .single();
  
  const allowedRoles: string[] = configData?.value ? JSON.parse(configData.value) : ['sales'];
  
  // Get user's roles
  const { data: userRoles } = await supabase
    .from('user_roles')
    .select('role')
    .eq('user_id', userId);
  
  if (!userRoles || userRoles.length === 0) return false;
  
  const userRoleNames = userRoles.map((r: { role: string }) => r.role);
  return allowedRoles.some((role: string) => userRoleNames.includes(role));
}

// deno-lint-ignore no-explicit-any
export async function getAllowedDomains(
  supabase: SupabaseClient<any>
): Promise<string[]> {
  const { data } = await supabase
    .from('config_settings')
    .select('value')
    .eq('key', 'google.allowed_domains')
    .single();
  
  if (!data?.value) return [];
  try {
    return JSON.parse(data.value);
  } catch {
    return [];
  }
}
