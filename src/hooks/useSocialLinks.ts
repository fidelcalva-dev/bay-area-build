import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';

export interface SocialLinkRow {
  id: string;
  platform: string;
  label: string;
  public_url: string;
  icon_key: string;
  show_in_footer: boolean;
  show_in_schema: boolean;
  is_active: boolean;
  sort_order: number;
}

const QUERY_KEY = ['social-links'];

/** Blocked URL patterns — admin/dashboard/analytics links must never be public */
const BLOCKED_URL_PATTERNS = [
  /\/admin\b/i,
  /\/dashboard\b/i,
  /\/analytics\b/i,
  /\/business\.pinterest/i,
  /\/business\.linkedin/i,
  /\/manage\b/i,
  /\/settings\b/i,
  /\/ads\.linkedin/i,
  /campaign-manager/i,
];

export function isPublicSocialUrl(url: string): { valid: boolean; reason?: string } {
  if (!url || url.trim() === '') return { valid: false, reason: 'URL is required' };
  try {
    new URL(url);
  } catch {
    return { valid: false, reason: 'Invalid URL format' };
  }
  if (!url.startsWith('https://')) return { valid: false, reason: 'URL must use HTTPS' };
  for (const pattern of BLOCKED_URL_PATTERNS) {
    if (pattern.test(url)) return { valid: false, reason: 'Admin/dashboard URLs are not allowed. Use the public profile URL.' };
  }
  return { valid: true };
}

export function useSocialLinks() {
  return useQuery({
    queryKey: QUERY_KEY,
    queryFn: async (): Promise<SocialLinkRow[]> => {
      const { data, error } = await supabase
        .from('social_links')
        .select('*')
        .order('sort_order', { ascending: true });
      if (error) throw error;
      return (data ?? []) as SocialLinkRow[];
    },
    staleTime: 1000 * 60 * 10,
  });
}

/** Footer-visible links only */
export function useFooterSocialLinks() {
  const { data, ...rest } = useSocialLinks();
  return {
    ...rest,
    data: (data ?? []).filter(l => l.is_active && l.show_in_footer),
  };
}

/** Schema sameAs URLs only */
export function useSchemaSocialUrls() {
  const { data, ...rest } = useSocialLinks();
  return {
    ...rest,
    data: (data ?? []).filter(l => l.is_active && l.show_in_schema).map(l => l.public_url),
  };
}

export function useSaveSocialLink() {
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return useMutation({
    mutationFn: async (link: Partial<SocialLinkRow> & { id: string }) => {
      const { id, ...updates } = link;
      const { error } = await supabase
        .from('social_links')
        .update({ ...updates, updated_at: new Date().toISOString() })
        .eq('id', id);
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: QUERY_KEY });
      toast({ title: 'Social link updated' });
    },
    onError: (err: Error) => {
      toast({ title: 'Error saving', description: err.message, variant: 'destructive' });
    },
  });
}
