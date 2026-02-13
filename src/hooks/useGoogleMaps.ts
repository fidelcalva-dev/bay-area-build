import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

declare global {
  interface Window {
    google?: any;
  }
}

let googleMapsPromise: Promise<void> | null = null;
let googleMapsLoaded = false;
let cachedApiKey: string | null = null;

async function fetchApiKey(): Promise<string> {
  if (cachedApiKey) return cachedApiKey;
  
  const { data, error } = await supabase.functions.invoke('get-maps-key');
  if (error || !data?.key) {
    throw new Error('Failed to fetch Google Maps API key');
  }
  cachedApiKey = data.key;
  return data.key;
}

function loadGoogleMapsScript(apiKey: string): Promise<void> {
  if (googleMapsLoaded) return Promise.resolve();
  if (googleMapsPromise) return googleMapsPromise;

  googleMapsPromise = new Promise<void>((resolve, reject) => {
    // Check if already loaded by another mechanism
    if (window.google?.maps) {
      googleMapsLoaded = true;
      resolve();
      return;
    }

    const script = document.createElement('script');
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=geometry,places&v=weekly`;
    script.async = true;
    script.defer = true;
    script.onload = () => {
      googleMapsLoaded = true;
      resolve();
    };
    script.onerror = () => {
      googleMapsPromise = null;
      reject(new Error('Failed to load Google Maps script'));
    };
    document.head.appendChild(script);
  });

  return googleMapsPromise;
}

export function useGoogleMaps() {
  const [isLoaded, setIsLoaded] = useState(googleMapsLoaded);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const load = useCallback(async () => {
    if (googleMapsLoaded) {
      setIsLoaded(true);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const apiKey = await fetchApiKey();
      await loadGoogleMapsScript(apiKey);
      setIsLoaded(true);
    } catch (err) {
      console.error('Google Maps load error:', err);
      setError(err instanceof Error ? err.message : 'Failed to load Google Maps');
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { isLoaded, isLoading, error, load };
}
