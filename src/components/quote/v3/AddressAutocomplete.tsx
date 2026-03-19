import { useRef, useEffect, useState, useCallback } from 'react';
import { MapPin, CheckCircle, Loader2, AlertTriangle } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
  initialValue?: string;
}

export function AddressAutocomplete({ onAddressSelect, onClear, className }: AddressAutocompleteProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const { isLoaded, isLoading, error: mapsError, load } = useGoogleMaps();
  const [value, setValue] = useState('');
  const [selected, setSelected] = useState<AddressResult | null>(null);
  const [useManual, setUseManual] = useState(false);

  // Manual entry state
  const [manualStreet, setManualStreet] = useState('');
  const [manualCity, setManualCity] = useState('');
  const [manualZip, setManualZip] = useState('');

  // Load Google Maps on mount
  useEffect(() => { load(); }, [load]);

  // Switch to manual if Maps fails
  useEffect(() => {
    if (mapsError) {
      setUseManual(true);
    }
  }, [mapsError]);

  // Initialize autocomplete when Maps is loaded
  useEffect(() => {
    if (!isLoaded || !inputRef.current || autocompleteRef.current || useManual) return;

    try {
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
    } catch {
      // If autocomplete init fails, fall back to manual
      setUseManual(true);
    }
  }, [isLoaded, onAddressSelect, useManual]);

  // Handle manual address submission
  const handleManualSubmit = useCallback(() => {
    if (!manualStreet.trim() || !manualCity.trim() || !manualZip.trim()) return;

    const result: AddressResult = {
      formattedAddress: `${manualStreet.trim()}, ${manualCity.trim()}, CA ${manualZip.trim()}`,
      placeId: '',
      lat: 0,
      lng: 0,
      zip: manualZip.trim(),
      city: manualCity.trim(),
      state: 'CA',
    };

    setSelected(result);
    onAddressSelect(result);
  }, [manualStreet, manualCity, manualZip, onAddressSelect]);

  // Auto-submit manual when all fields valid
  useEffect(() => {
    if (useManual && manualStreet.trim().length >= 5 && manualCity.trim().length >= 2 && /^\d{5}$/.test(manualZip.trim())) {
      handleManualSubmit();
    }
  }, [useManual, manualStreet, manualCity, manualZip, handleManualSubmit]);

  const handleClear = useCallback(() => {
    setValue('');
    setManualStreet('');
    setManualCity('');
    setManualZip('');
    setSelected(null);
    onClear();
    autocompleteRef.current = null;
  }, [onClear]);

  // --- MANUAL ENTRY MODE ---
  if (useManual) {
    return (
      <div className={className}>
        {mapsError && (
          <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 dark:bg-amber-950/30 px-3 py-2 rounded-lg mb-3">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            <span>Address suggestions unavailable. Enter your address manually below.</span>
          </div>
        )}

        {selected ? (
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-success bg-success/10 px-3 py-2.5 rounded-lg">
              <CheckCircle className="w-4 h-4 shrink-0" />
              <span className="font-medium">{selected.formattedAddress}</span>
              <button
                type="button"
                onClick={handleClear}
                className="ml-auto text-xs text-muted-foreground hover:text-foreground underline"
              >
                Change
              </button>
            </div>
            <p className="text-xs text-muted-foreground px-1">
              We'll confirm service availability right away.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            <div>
              <Label htmlFor="manual-street" className="text-sm font-medium">Street Address</Label>
              <div className="relative mt-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="manual-street"
                  type="text"
                  placeholder="123 Main St"
                  value={manualStreet}
                  onChange={(e) => setManualStreet(e.target.value)}
                  className="h-12 pl-10 text-base"
                  autoFocus
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <Label htmlFor="manual-city" className="text-sm font-medium">City</Label>
                <Input
                  id="manual-city"
                  type="text"
                  placeholder="Oakland"
                  value={manualCity}
                  onChange={(e) => setManualCity(e.target.value)}
                  className="h-12 text-base mt-1"
                />
              </div>
              <div>
                <Label htmlFor="manual-zip" className="text-sm font-medium">ZIP Code</Label>
                <Input
                  id="manual-zip"
                  type="text"
                  inputMode="numeric"
                  placeholder="94606"
                  maxLength={5}
                  value={manualZip}
                  onChange={(e) => setManualZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                  className="h-12 text-base mt-1"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground px-1">
              We'll confirm service availability right away.
            </p>
          </div>
        )}
      </div>
    );
  }

  // --- LOADING STATE ---
  if (isLoading) {
    return (
      <div className={className}>
        <div className="relative">
          <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <Input
            disabled
            placeholder="Loading address search..."
            className="h-14 pl-12 text-lg font-semibold rounded-xl border-border/60"
          />
          <Loader2 className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 animate-spin text-primary" />
        </div>
      </div>
    );
  }

  // --- AUTOCOMPLETE MODE ---
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
      {!selected && (
        <button
          type="button"
          onClick={() => setUseManual(true)}
          className="mt-2 text-xs text-primary hover:underline px-1"
        >
          Enter address manually instead
        </button>
      )}
    </div>
  );
}
