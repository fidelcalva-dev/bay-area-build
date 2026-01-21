// Address Input Step with Geocoding
// Uses Edge Function proxy to avoid CORS issues

import { useState, useCallback, useRef, useEffect } from 'react';
import { MapPin, Loader2, CheckCircle, Search, AlertCircle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';

interface AddressSuggestion {
  display_name: string;
  lat: string;
  lon: string;
  address: {
    house_number?: string;
    road?: string;
    city?: string;
    town?: string;
    village?: string;
    state?: string;
    postcode?: string;
  };
}

interface AddressResult {
  formattedAddress: string;
  lat: number;
  lng: number;
  city?: string;
  state?: string;
  zip?: string;
}

interface AddressInputProps {
  initialZip?: string;
  onAddressConfirmed: (address: AddressResult) => void;
  value?: AddressResult | null;
}

export function AddressInput({ initialZip, onAddressConfirmed, value }: AddressInputProps) {
  const [query, setQuery] = useState(value?.formattedAddress || '');
  const [suggestions, setSuggestions] = useState<AddressSuggestion[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isConfirmed, setIsConfirmed] = useState(!!value);
  const [error, setError] = useState<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>();
  const inputRef = useRef<HTMLInputElement>(null);

  // Debounced search using Edge Function proxy
  const searchAddress = useCallback(async (searchQuery: string) => {
    if (searchQuery.length < 5) {
      setSuggestions([]);
      return;
    }

    setIsSearching(true);
    setError(null);

    try {
      const { data, error: fnError } = await supabase.functions.invoke('geocode-address', {
        body: { query: searchQuery }
      });

      if (fnError) {
        throw fnError;
      }

      if (data?.results) {
        setSuggestions(data.results);
      } else {
        setSuggestions([]);
      }
    } catch (err) {
      console.error('Address search error:', err);
      setError('Address lookup unavailable. Please enter manually.');
      setSuggestions([]);
    } finally {
      setIsSearching(false);
    }
  }, []);

  // Handle input change with debounce
  const handleInputChange = (value: string) => {
    setQuery(value);
    setIsConfirmed(false);
    
    if (debounceRef.current) {
      clearTimeout(debounceRef.current);
    }

    debounceRef.current = setTimeout(() => {
      searchAddress(value);
    }, 400);
  };

  // Select a suggestion
  const selectSuggestion = (suggestion: AddressSuggestion) => {
    const result: AddressResult = {
      formattedAddress: suggestion.display_name,
      lat: parseFloat(suggestion.lat),
      lng: parseFloat(suggestion.lon),
      city: suggestion.address?.city || suggestion.address?.town || suggestion.address?.village,
      state: suggestion.address?.state,
      zip: suggestion.address?.postcode,
    };

    setQuery(suggestion.display_name);
    setSuggestions([]);
    setIsConfirmed(true);
    onAddressConfirmed(result);
  };

  // Manual confirmation (for when autocomplete doesn't work)
  const handleManualConfirm = async () => {
    if (query.length < 10) {
      setError('Please enter a complete street address');
      return;
    }

    setIsSearching(true);
    try {
      const { data, error: fnError } = await supabase.functions.invoke('geocode-address', {
        body: { query }
      });

      if (fnError) throw fnError;

      if (data?.results?.length > 0) {
        selectSuggestion(data.results[0]);
      } else {
        // Fallback: Use the entered address without geocoding
        setError('Could not verify address. Please double-check it.');
        const fallbackResult: AddressResult = {
          formattedAddress: query,
          lat: 37.8044, // Default to Oakland
          lng: -122.2712,
        };
        setIsConfirmed(true);
        onAddressConfirmed(fallbackResult);
      }
    } catch {
      setError('Verification failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  // Cleanup
  useEffect(() => {
    return () => {
      if (debounceRef.current) {
        clearTimeout(debounceRef.current);
      }
    };
  }, []);

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-foreground">
        <MapPin className="w-4 h-4 inline mr-1.5" />
        Delivery Address
      </label>

      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          ref={inputRef}
          type="text"
          placeholder="Enter street address..."
          value={query}
          onChange={(e) => handleInputChange(e.target.value)}
          className={cn(
            "pl-11 pr-11 h-12 text-base",
            isConfirmed && "border-success bg-success/5"
          )}
        />
        {isSearching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <Loader2 className="w-5 h-5 animate-spin text-muted-foreground" />
          </div>
        )}
        {isConfirmed && !isSearching && (
          <div className="absolute right-3.5 top-1/2 -translate-y-1/2">
            <CheckCircle className="w-5 h-5 text-success" />
          </div>
        )}
      </div>

      {/* Suggestions Dropdown */}
      {suggestions.length > 0 && !isConfirmed && (
        <div className="border border-border rounded-lg bg-card shadow-lg overflow-hidden">
          {suggestions.map((suggestion, i) => (
            <button
              key={i}
              type="button"
              onClick={() => selectSuggestion(suggestion)}
              className="w-full px-4 py-3 text-left hover:bg-muted/50 border-b border-border last:border-b-0 transition-colors"
            >
              <div className="flex items-start gap-2">
                <MapPin className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                <div className="text-sm text-foreground line-clamp-2">
                  {suggestion.display_name}
                </div>
              </div>
            </button>
          ))}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="flex items-center gap-2 text-sm text-amber-600 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Manual Confirm Button (shows when no suggestions match) */}
      {query.length >= 10 && !isConfirmed && suggestions.length === 0 && !isSearching && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={handleManualConfirm}
          className="w-full"
        >
          <CheckCircle className="w-4 h-4 mr-2" />
          Use This Address
        </Button>
      )}

      {/* Confirmed Badge */}
      {isConfirmed && (
        <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-3 py-2 rounded-lg">
          <CheckCircle className="w-4 h-4" />
          <span>Address confirmed</span>
          <button
            type="button"
            onClick={() => {
              setIsConfirmed(false);
              setQuery('');
              inputRef.current?.focus();
            }}
            className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
          >
            Change
          </button>
        </div>
      )}

      {/* Pre-fill hint */}
      {initialZip && query.length === 0 && (
        <p className="text-xs text-muted-foreground">
          💡 Enter the complete street address for ZIP {initialZip}
        </p>
      )}
    </div>
  );
}
