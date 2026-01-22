// Quick Link Service - Token management and validation
import { supabase } from '@/integrations/supabase/client';

export interface QuickLink {
  id: string;
  token: string;
  name: string | null;
  preset_zip: string | null;
  preset_size: number | null;
  preset_material: string | null;
  preset_yard_id: string | null;
  preset_extras: any[];
  customer_id: string | null;
  preferred_address: string | null;
  source: string;
  created_by: string | null;
  expires_at: string | null;
  is_active: boolean;
  use_count: number;
  max_uses: number | null;
  created_at: string;
  updated_at: string;
}

export interface QuickLinkConfig {
  name?: string;
  zip?: string;
  size?: number;
  material?: 'general' | 'heavy';
  yardId?: string;
  extras?: string[];
  customerId?: string;
  preferredAddress?: string;
  expiresInDays?: number;
  maxUses?: number;
}

// Generate a secure random token
function generateToken(length: number = 12): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghjkmnpqrstuvwxyz23456789';
  let token = '';
  const array = new Uint8Array(length);
  crypto.getRandomValues(array);
  for (let i = 0; i < length; i++) {
    token += chars[array[i] % chars.length];
  }
  return token;
}

// Validate a quick link token and return the config
export async function validateQuickLink(token: string): Promise<{
  valid: boolean;
  quickLink: QuickLink | null;
  error: string | null;
}> {
  const { data, error } = await supabase
    .from('quick_links')
    .select('*')
    .eq('token', token)
    .eq('is_active', true)
    .single();

  if (error || !data) {
    return { valid: false, quickLink: null, error: 'Link not found or expired' };
  }

  // Check expiration
  if (data.expires_at && new Date(data.expires_at) < new Date()) {
    return { valid: false, quickLink: null, error: 'Link has expired' };
  }

  // Check max uses
  if (data.max_uses !== null && data.use_count >= data.max_uses) {
    return { valid: false, quickLink: null, error: 'Link has reached maximum uses' };
  }

  return { 
    valid: true, 
    quickLink: data as QuickLink, 
    error: null 
  };
}

// Increment use count when a quick link is used
export async function recordQuickLinkUse(linkId: string): Promise<void> {
  // Get current count and increment
  const { data } = await supabase
    .from('quick_links')
    .select('use_count')
    .eq('id', linkId)
    .single();
  
  if (data) {
    await supabase
      .from('quick_links')
      .update({ use_count: (data.use_count || 0) + 1 })
      .eq('id', linkId);
  }
}

// Create a new quick link
export async function createQuickLink(config: QuickLinkConfig): Promise<{
  quickLink: QuickLink | null;
  error: string | null;
}> {
  const token = generateToken();
  
  const expiresAt = config.expiresInDays 
    ? new Date(Date.now() + config.expiresInDays * 24 * 60 * 60 * 1000).toISOString()
    : null;

  const { data, error } = await supabase
    .from('quick_links')
    .insert({
      token,
      name: config.name || null,
      preset_zip: config.zip || null,
      preset_size: config.size || null,
      preset_material: config.material || null,
      preset_yard_id: config.yardId || null,
      preset_extras: config.extras || [],
      customer_id: config.customerId || null,
      preferred_address: config.preferredAddress || null,
      expires_at: expiresAt,
      max_uses: config.maxUses || null,
      source: 'manual',
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating quick link:', error);
    return { quickLink: null, error: error.message };
  }

  return { quickLink: data as QuickLink, error: null };
}

// Disable a quick link
export async function disableQuickLink(linkId: string): Promise<{ success: boolean; error: string | null }> {
  const { error } = await supabase
    .from('quick_links')
    .update({ is_active: false })
    .eq('id', linkId);

  if (error) {
    return { success: false, error: error.message };
  }

  return { success: true, error: null };
}

// Get all quick links (admin view)
export async function getQuickLinks(): Promise<QuickLink[]> {
  const { data, error } = await supabase
    .from('quick_links')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching quick links:', error);
    return [];
  }

  return data as QuickLink[];
}

// Get quick link by ID
export async function getQuickLinkById(id: string): Promise<QuickLink | null> {
  const { data, error } = await supabase
    .from('quick_links')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    console.error('Error fetching quick link:', error);
    return null;
  }

  return data as QuickLink;
}

// Build the full quick link URL
export function buildQuickLinkUrl(token: string): string {
  const baseUrl = window.location.origin;
  return `${baseUrl}/quick-order?token=${token}`;
}
