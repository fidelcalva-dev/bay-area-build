// Auto-detect ZIP code with fallback priority:
// 1. LocalStorage (previously entered ZIP)
// 2. Browser Geolocation → Reverse geocoding
// 3. IP-based location lookup

import { useState, useEffect, useCallback } from 'react';

const STORAGE_KEY = 'calsan_user_zip';
const DETECTION_STATUS_KEY = 'calsan_zip_detection_status';

export type ZipSource = 'stored' | 'geolocation' | 'ip' | 'manual' | null;
export type DetectionStatus = 'idle' | 'loading' | 'success' | 'denied' | 'error' | 'skipped';

export interface LocationDetails {
  cityName: string | null;
  county: string | null;
  state: string | null;
}

export interface AutoDetectZipState {
  zip: string | null;
  source: ZipSource;
  status: DetectionStatus;
  cityName: string | null;
  county: string | null;
  state: string | null;
  isLoading: boolean;
  permissionState: PermissionState | null;
  error: string | null;
}

interface UseAutoDetectZipReturn extends AutoDetectZipState {
  detectZip: () => Promise<void>;
  setManualZip: (zip: string) => void;
  clearStoredZip: () => void;
  requestGeolocation: () => Promise<void>;
  saveZip: (zip: string) => void;
}

// Reverse geocode coordinates to get ZIP code, city, county, state
async function reverseGeocodeToZip(lat: number, lng: number): Promise<{
  zip: string | null;
  cityName: string | null;
  county: string | null;
  state: string | null;
}> {
  try {
    // Use Nominatim for reverse geocoding (free, no API key)
    const response = await fetch(
      `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`,
      { headers: { 'Accept-Language': 'en' } }
    );
    
    if (!response.ok) throw new Error('Geocoding failed');
    
    const data = await response.json();
    const zip = data.address?.postcode || null;
    const cityName = data.address?.city || data.address?.town || data.address?.village || null;
    // Nominatim returns county as "county" in address details
    const county = data.address?.county || null;
    const state = data.address?.state || null;
    
    return { zip, cityName, county, state };
  } catch (error) {
    console.error('Reverse geocoding error:', error);
    return { zip: null, cityName: null, county: null, state: null };
  }
}

// IP-based location lookup (no permission needed)
async function getZipFromIP(): Promise<{
  zip: string | null;
  cityName: string | null;
  county: string | null;
  state: string | null;
}> {
  try {
    // Use ipapi.co for IP-based geolocation (free tier: 1000 requests/day)
    const response = await fetch('https://ipapi.co/json/', {
      headers: { 'Accept': 'application/json' }
    });
    
    if (!response.ok) throw new Error('IP lookup failed');
    
    const data = await response.json();
    
    // Verify it's in the US
    if (data.country_code !== 'US') {
      return { zip: null, cityName: null, county: null, state: null };
    }
    
    return {
      zip: data.postal || null,
      cityName: data.city || null,
      county: data.region ? `${data.region} County` : null, // ipapi returns region name
      state: data.region_code || null,
    };
  } catch (error) {
    console.error('IP lookup error:', error);
    return { zip: null, cityName: null, county: null, state: null };
  }
}

// Get geolocation with timeout
function getGeolocation(timeoutMs = 10000): Promise<GeolocationPosition> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation not supported'));
      return;
    }
    
    navigator.geolocation.getCurrentPosition(
      resolve,
      reject,
      {
        enableHighAccuracy: true,
        timeout: timeoutMs,
        maximumAge: 300000, // 5 minutes cache
      }
    );
  });
}

// Check geolocation permission state
async function checkGeolocationPermission(): Promise<PermissionState | null> {
  if (!navigator.permissions) return null;
  
  try {
    const result = await navigator.permissions.query({ name: 'geolocation' });
    return result.state;
  } catch {
    return null;
  }
}

export function useAutoDetectZip(): UseAutoDetectZipReturn {
  const [state, setState] = useState<AutoDetectZipState>({
    zip: null,
    source: null,
    status: 'idle',
    cityName: null,
    county: null,
    state: null,
    isLoading: false,
    permissionState: null,
    error: null,
  });

  // Check for stored ZIP on mount
  useEffect(() => {
    const storedZip = localStorage.getItem(STORAGE_KEY);
    if (storedZip && storedZip.length === 5) {
      setState(prev => ({
        ...prev,
        zip: storedZip,
        source: 'stored',
        status: 'success',
      }));
      return;
    }
    
    // Check if user previously denied/skipped detection
    const detectionStatus = localStorage.getItem(DETECTION_STATUS_KEY);
    if (detectionStatus === 'skipped') {
      setState(prev => ({ ...prev, status: 'skipped' }));
      return;
    }
    
    // Check permission state
    checkGeolocationPermission().then(permState => {
      setState(prev => ({ ...prev, permissionState: permState }));
    });
  }, []);

  // Request geolocation explicitly
  const requestGeolocation = useCallback(async () => {
    setState(prev => ({ ...prev, isLoading: true, status: 'loading', error: null }));
    
    try {
      const position = await getGeolocation();
      const { zip, cityName, county, state: stateName } = await reverseGeocodeToZip(
        position.coords.latitude,
        position.coords.longitude
      );
      
      if (zip && zip.length === 5) {
        setState(prev => ({
          ...prev,
          zip,
          cityName,
          county,
          state: stateName,
          source: 'geolocation',
          status: 'success',
          isLoading: false,
          permissionState: 'granted',
        }));
        localStorage.setItem(STORAGE_KEY, zip);
      } else {
        // Fallback to IP if geocoding didn't return a ZIP
        const ipResult = await getZipFromIP();
        if (ipResult.zip) {
          setState(prev => ({
            ...prev,
            zip: ipResult.zip,
            cityName: ipResult.cityName,
            county: ipResult.county,
            state: ipResult.state,
            source: 'ip',
            status: 'success',
            isLoading: false,
          }));
        } else {
          setState(prev => ({
            ...prev,
            status: 'error',
            isLoading: false,
            error: 'Could not determine ZIP code',
          }));
        }
      }
    } catch (error: any) {
      // User denied or error occurred
      const isDenied = error?.code === 1; // PERMISSION_DENIED
      
      if (isDenied) {
        setState(prev => ({
          ...prev,
          status: 'denied',
          isLoading: false,
          permissionState: 'denied',
        }));
        
        // Try IP fallback
        const ipResult = await getZipFromIP();
        if (ipResult.zip) {
          setState(prev => ({
            ...prev,
            zip: ipResult.zip,
            cityName: ipResult.cityName,
            county: ipResult.county,
            state: ipResult.state,
            source: 'ip',
            status: 'success',
          }));
        }
      } else {
        setState(prev => ({
          ...prev,
          status: 'error',
          isLoading: false,
          error: 'Location detection failed',
        }));
      }
    }
  }, []);

  // Auto-detect ZIP (main function)
  const detectZip = useCallback(async () => {
    // Skip if already have a stored ZIP
    const storedZip = localStorage.getItem(STORAGE_KEY);
    if (storedZip && storedZip.length === 5) {
      setState(prev => ({
        ...prev,
        zip: storedZip,
        source: 'stored',
        status: 'success',
      }));
      return;
    }
    
    setState(prev => ({ ...prev, isLoading: true, status: 'loading' }));
    
    // Check permission state first
    const permState = await checkGeolocationPermission();
    setState(prev => ({ ...prev, permissionState: permState }));
    
    // If permission already granted, use geolocation directly
    if (permState === 'granted') {
      await requestGeolocation();
      return;
    }
    
    // If permission denied, go straight to IP
    if (permState === 'denied') {
      const ipResult = await getZipFromIP();
      if (ipResult.zip) {
        setState(prev => ({
          ...prev,
          zip: ipResult.zip,
          cityName: ipResult.cityName,
          county: ipResult.county,
          state: ipResult.state,
          source: 'ip',
          status: 'success',
          isLoading: false,
        }));
      } else {
        setState(prev => ({
          ...prev,
          status: 'idle',
          isLoading: false,
        }));
      }
      return;
    }
    
    // If permission state is prompt, try IP first (no permission needed)
    // This provides a suggested ZIP without asking for permission
    const ipResult = await getZipFromIP();
    if (ipResult.zip) {
      setState(prev => ({
        ...prev,
        zip: ipResult.zip,
        cityName: ipResult.cityName,
        county: ipResult.county,
        state: ipResult.state,
        source: 'ip',
        status: 'success',
        isLoading: false,
      }));
    } else {
      setState(prev => ({
        ...prev,
        status: 'idle',
        isLoading: false,
      }));
    }
  }, [requestGeolocation]);

  // Set manual ZIP
  const setManualZip = useCallback((zip: string) => {
    setState(prev => ({
      ...prev,
      zip: zip.length === 5 ? zip : null,
      source: zip.length === 5 ? 'manual' : null,
      status: zip.length === 5 ? 'success' : 'idle',
      cityName: null,
      county: null,
      state: null,
    }));
  }, []);

  // Save ZIP to storage
  const saveZip = useCallback((zip: string) => {
    if (zip.length === 5) {
      localStorage.setItem(STORAGE_KEY, zip);
    }
  }, []);

  // Clear stored ZIP
  const clearStoredZip = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    localStorage.setItem(DETECTION_STATUS_KEY, 'skipped');
    setState({
      zip: null,
      source: null,
      status: 'skipped',
      cityName: null,
      county: null,
      state: null,
      isLoading: false,
      permissionState: null,
      error: null,
    });
  }, []);

  return {
    ...state,
    detectZip,
    setManualZip,
    clearStoredZip,
    requestGeolocation,
    saveZip,
  };
}
