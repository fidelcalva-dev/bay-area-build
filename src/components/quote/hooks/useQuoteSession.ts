// Quote Session Persistence — saves/restores form state to sessionStorage
// Ensures size selection and quote progress survive page refresh and route changes

const STORAGE_KEY = 'calsan_quote_session';

export interface QuoteSessionData {
  formData: {
    userType: string;
    zip: string;
    material: 'general' | 'heavy';
    size: number;
    rentalDays: number;
    extras: { id: string; quantity: number }[];
    name: string;
    phone: string;
    email: string;
    address?: string;
  };
  step: string;
  zoneResult: {
    zoneId: string;
    zoneName: string;
    cityName?: string;
    multiplier: number;
  } | null;
  projectType: string | null;
  heavyMaterialClass: string | null;
  savedAt: string;
}

/** Save quote session to sessionStorage */
export function saveQuoteSession(data: Partial<QuoteSessionData>): void {
  try {
    const existing = loadQuoteSession();
    const merged: QuoteSessionData = {
      formData: data.formData ?? existing?.formData ?? {
        userType: 'homeowner',
        zip: '',
        material: 'general',
        size: 20,
        rentalDays: 7,
        extras: [],
        name: '',
        phone: '',
        email: '',
        address: '',
      },
      step: data.step ?? existing?.step ?? 'zip',
      zoneResult: data.zoneResult ?? existing?.zoneResult ?? null,
      projectType: data.projectType ?? existing?.projectType ?? null,
      heavyMaterialClass: data.heavyMaterialClass ?? existing?.heavyMaterialClass ?? null,
      savedAt: new Date().toISOString(),
    };
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
  } catch {
    // sessionStorage unavailable (SSR, private mode, etc.)
  }
}

/** Load quote session from sessionStorage */
export function loadQuoteSession(): QuoteSessionData | null {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as QuoteSessionData;
    
    // Expire sessions older than 2 hours
    const savedAt = new Date(parsed.savedAt).getTime();
    if (Date.now() - savedAt > 2 * 60 * 60 * 1000) {
      clearQuoteSession();
      return null;
    }
    
    return parsed;
  } catch {
    return null;
  }
}

/** Clear quote session */
export function clearQuoteSession(): void {
  try {
    sessionStorage.removeItem(STORAGE_KEY);
  } catch {
    // ignore
  }
}

/** Check if a valid session exists */
export function hasQuoteSession(): boolean {
  return loadQuoteSession() !== null;
}
