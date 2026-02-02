import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SearchResult {
  entity_type: string;
  entity_id: string;
  title: string;
  subtitle: string | null;
  badge: string | null;
  badge_variant: string | null;
  metadata: Record<string, unknown> | null;
  rank: number;
}

interface UseGlobalSearchOptions {
  debounceMs?: number;
  minQueryLength?: number;
  limit?: number;
}

export function useGlobalSearch(options: UseGlobalSearchOptions = {}) {
  const { debounceMs = 300, minQueryLength = 2, limit = 20 } = options;
  
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const search = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < minQueryLength) {
      setResults([]);
      setError(null);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      // Use edge function for search
      const { data, error: fnError } = await supabase.functions.invoke('global-search', {
        body: { query: searchQuery, limit },
      });

      if (fnError) {
        throw fnError;
      }

      const searchResults = (data?.results || []) as SearchResult[];
      setResults(searchResults);
    } catch (err) {
      console.error('Search error:', err);
      setError(err instanceof Error ? err.message : 'Search failed');
      setResults([]);
    } finally {
      setIsSearching(false);
    }
  }, [limit, minQueryLength]);

  useEffect(() => {
    if (query.length < minQueryLength) {
      setResults([]);
      return;
    }

    const timeoutId = setTimeout(() => {
      search(query);
    }, debounceMs);

    return () => clearTimeout(timeoutId);
  }, [query, debounceMs, minQueryLength, search]);

  const clearSearch = useCallback(() => {
    setQuery('');
    setResults([]);
    setError(null);
  }, []);

  return {
    query,
    setQuery,
    results,
    isSearching,
    error,
    clearSearch,
  };
}
