import { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, CheckCircle, Loader2 } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { useGoogleMaps } from '@/hooks/useGoogleMaps';

export interface AddressResult {
  formattedAddress: string;
  placeId: string;
  lat: number;
  lng: number;
  zip: string;
  city: string;
  state: string;
}

interface AddressAutocompleteProps {
  onAddressSelect: (result: AddressResult) => void;
  onClear: () => void;
  className?: string;
}

export function AddressAutocomplete({ onAddressSelect, onClear, className }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, isLoading, load } = useGoogleMaps();
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<AddressResult | null>(null);

  // Load Google Maps on mount
  useEffect(() => { load(); }, [load]);

  // Initialize autocomplete when Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current) return;

    const autocomplete = new google.maps.places.Autocomplete(inputRef.current, {
      componentRestrictions: { country: 'us' },
      fields: ['address_components', 'formatted_address', 'geometry', 'place_id'],
      types: ['address'],
    });

    autocomplete.addListener('place_changed', () => {
      const place = autocomplete.getPlace();
      if (!place.geometry?.location || !place.address_components) return;

      let zip = '';
      let city = '';
      let state = '';

      for (const comp of place.address_components) {
        if (comp.types.includes('postal_code')) zip = comp.short_name;
        if (comp.types.includes('locality')) city = comp.long_name;
        if (comp.types.includes('administrative_area_level_1')) state = comp.short_name;
      }

      const result: AddressResult = {
        formattedAddress: place.formatted_address || '',
        placeId: place.place_id || '',
        lat: place.geometry.location.lat(),
        lng: place.geometry.location.lng(),
        zip,
        city,
        state,
      };

      setValue(result.formattedAddress);
      setSelected(result);
      onAddressSelect(result);
    });

    autocompleteRef.current = autocomplete;
  }, [isLoaded, onAddressSelect]);

  const handleClear = useCallback(() => {
    setValue('');
    setSelected(null);
    onClear();
    inputRef.current?.focus();
  }, [onClear]);

  if (isLoading) {
    return (
      <div className="relative">
        <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          disabled
          placeholder="Loading address search..."
          className="h-14 pl-12 text-lg font-semibold rounded-xl border-border/60"
        />
        <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
      </div>
    );
  }

  return (
    <div className={className}>
      <div className="relative">
        {selected ? (
          <CheckCircle className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-success" />
        ) : (
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        )}
        <Input
          ref={inputRef}
          type="text"
          placeholder="Start typing address..."
          value={value}
          onChange={(e) => {
            setValue(e.target.value);
            if (selected) {
              setSelected(null);
              onClear();
            }
          }}
          className="h-14 pl-12 pr-12 text-lg font-semibold rounded-xl border-border/60 focus:border-primary"
          autoFocus
        />
        {selected && (
          <button
            onClick={handleClear}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
            type="button"
          >
            Clear
          </button>
        )}
      </div>
      {selected && (
        <div className="mt-2 flex items-center gap-2 text-xs text-muted-foreground px-1">
          <span className="font-medium text-foreground">{selected.city}, {selected.state}</span>
          <span>ZIP: {selected.zip}</span>
        </div>
      )}
    </div>
  );
}
