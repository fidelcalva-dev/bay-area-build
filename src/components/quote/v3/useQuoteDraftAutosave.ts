// ============================================================
// QUOTE DRAFT AUTOSAVE — localStorage + optional server draft
// Persists V3 quote progress, resumes on return
// ============================================================
import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { analytics, trackEvent } from '@/lib/analytics';
import type { V3Step, CustomerType, ProjectCard } from './types';

// ---- Storage key & expiry ----
const STORAGE_KEY = 'v3_quote_draft_v1';
const DRAFT_EXPIRY_MS = 7 * 24 * 60 * 60 * 1000; // 7 days
const DEBOUNCE_MS = 400;

// ---- Serializable draft shape (no PII beyond opt-in contact) ----
export interface QuoteDraft {
  step: V3Step;
  zip: string;
  formattedAddress?: string;
  lat?: number;
  lng?: number;
  customerType: CustomerType | null;
  selectedProjectId: string | null;
  size: number;
  wantsSwap: boolean;
  customerName?: string;
  customerPhone?: string;
  customerEmail?: string;
  termsAccepted: boolean;
  useAddress: boolean;
  timestampLastSaved: number;
  draftToken?: string; // server-side draft token
}

// ---- Helpers ----
function readDraft(): QuoteDraft | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const draft: QuoteDraft = JSON.parse(raw);
    // Expire old drafts
    if (Date.now() - draft.timestampLastSaved > DRAFT_EXPIRY_MS) {
      localStorage.removeItem(STORAGE_KEY);
      return null;
    }
    return draft;
  } catch {
    localStorage.removeItem(STORAGE_KEY);
    return null;
  }
}

function writeDraft(draft: QuoteDraft) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(draft));
  } catch {
    // Storage full or private mode — silently fail
  }
}

export function clearDraft() {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch {}
}

// ---- Step validation for safe resume ----
function validateResumeStep(draft: QuoteDraft): V3Step {
  const { step, zip, customerType, selectedProjectId } = draft;

  // Step hierarchy: zip < customer-type < project < size < price < access < confirm < placement
  if (!zip || zip.length !== 5) return 'zip';
  if (step === 'zip') return 'zip';

  if (!customerType) return 'customer-type';
  if (step === 'customer-type') return 'customer-type';

  if (!selectedProjectId) return 'project';
  if (step === 'project') return 'project';

  if (step === 'size') return 'size';
  if (step === 'price') return 'price';
  if (step === 'access') return 'price'; // resume at price, access is quick

  // Don't resume beyond price without valid quote data — zone will be re-fetched
  if (step === 'confirm') return 'price'; // will advance after zone loads
  if (step === 'placement') return 'zip'; // placement = post-submit, start fresh

  return step;
}

// ---- Server draft helper ----
async function saveServerDraft(draft: QuoteDraft): Promise<string | null> {
  try {
    const { data, error } = await supabase.functions.invoke('save-quote-draft', {
      body: {
        draftToken: draft.draftToken || null,
        zip: draft.zip,
        address: draft.formattedAddress || null,
        customerType: draft.customerType,
        projectId: draft.selectedProjectId,
        size: draft.size,
        wantsSwap: draft.wantsSwap,
        name: draft.customerName || null,
        email: draft.customerEmail || null,
        phone: draft.customerPhone || null,
        step: draft.step,
      },
    });
    if (error) return null;
    return data?.draftToken || null;
  } catch {
    return null;
  }
}

async function loadServerDraft(token: string): Promise<QuoteDraft | null> {
  try {
    const { data, error } = await supabase.functions.invoke('save-quote-draft', {
      body: { action: 'load', draftToken: token },
    });
    if (error || !data?.draft) return null;
    const d = data.draft;
    return {
      step: d.step || 'zip',
      zip: d.zip || '',
      formattedAddress: d.address || undefined,
      customerType: d.customer_type || null,
      selectedProjectId: d.project_id || null,
      size: d.size || 20,
      wantsSwap: d.wants_swap || false,
      customerName: d.name || undefined,
      customerPhone: d.phone || undefined,
      customerEmail: d.email || undefined,
      termsAccepted: false,
      useAddress: !!d.address,
      timestampLastSaved: new Date(d.updated_at).getTime(),
      draftToken: token,
    };
  } catch {
    return null;
  }
}

// ---- Hook ----
export interface UseQuoteDraftReturn {
  /** Draft loaded from storage (null if none) */
  loadedDraft: QuoteDraft | null;
  /** Whether the resume banner should show */
  showResumeBanner: boolean;
  /** User chose to continue */
  acceptResume: () => void;
  /** User chose to start over */
  declineResume: () => void;
  /** Call on every meaningful state change */
  saveDraft: (draft: Omit<QuoteDraft, 'timestampLastSaved'>) => void;
  /** Hard clear */
  resetDraft: () => void;
}

export function useQuoteDraftAutosave(urlDraftToken?: string | null): UseQuoteDraftReturn {
  const [loadedDraft, setLoadedDraft] = useState<QuoteDraft | null>(null);
  const [showResumeBanner, setShowResumeBanner] = useState(false);
  const [decided, setDecided] = useState(false);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestDraftRef = useRef<QuoteDraft | null>(null);

  // On mount: check for URL draft token or localStorage
  useEffect(() => {
    async function init() {
      let draft: QuoteDraft | null = null;

      // Priority 1: URL draft token (cross-device)
      if (urlDraftToken) {
        draft = await loadServerDraft(urlDraftToken);
        if (draft) {
          trackEvent('quote_step_complete' as any, { step: 'draft_resumed', resume_source: 'server' });
        }
      }

      // Priority 2: localStorage
      if (!draft) {
        draft = readDraft();
      }

      if (draft) {
        // Validate the step
        const safeStep = validateResumeStep(draft);
        draft.step = safeStep;
        setLoadedDraft(draft);
        // Only show banner if they got past ZIP
        if (safeStep !== 'zip') {
          setShowResumeBanner(true);
          trackEvent('quote_step_complete' as any, { step: 'draft_found', resume_step: safeStep });
        } else {
          setDecided(true); // nothing meaningful to resume
        }
      } else {
        setDecided(true);
        trackEvent('quote_step_complete' as any, { step: 'draft_created' });
      }
    }
    init();
  }, [urlDraftToken]);

  const acceptResume = useCallback(() => {
    setShowResumeBanner(false);
    setDecided(true);
    trackEvent('quote_step_complete' as any, { step: 'draft_resumed', resume_step: loadedDraft?.step });
  }, [loadedDraft]);

  const declineResume = useCallback(() => {
    clearDraft();
    setLoadedDraft(null);
    setShowResumeBanner(false);
    setDecided(true);
    trackEvent('quote_step_complete' as any, { step: 'draft_abandoned' });
  }, []);

  // Debounced save
  const saveDraft = useCallback((partial: Omit<QuoteDraft, 'timestampLastSaved'>) => {
    const draft: QuoteDraft = { ...partial, timestampLastSaved: Date.now() };
    latestDraftRef.current = draft;

    if (debounceRef.current) clearTimeout(debounceRef.current);
    debounceRef.current = setTimeout(() => {
      writeDraft(draft);

      // Server draft: only when contact info exists
      if (draft.customerPhone || draft.customerEmail) {
        saveServerDraft(draft).then((token) => {
          if (token && token !== draft.draftToken) {
            const updated = { ...draft, draftToken: token };
            latestDraftRef.current = updated;
            writeDraft(updated);
          }
        });
      }
    }, DEBOUNCE_MS);
  }, []);

  // Save on visibility change / beforeunload
  useEffect(() => {
    const flushSave = () => {
      if (latestDraftRef.current) {
        writeDraft(latestDraftRef.current);
      }
    };

    const handleVisChange = () => {
      if (document.visibilityState === 'hidden') flushSave();
    };

    window.addEventListener('beforeunload', flushSave);
    document.addEventListener('visibilitychange', handleVisChange);
    return () => {
      window.removeEventListener('beforeunload', flushSave);
      document.removeEventListener('visibilitychange', handleVisChange);
    };
  }, []);

  const resetDraft = useCallback(() => {
    clearDraft();
    setLoadedDraft(null);
    setShowResumeBanner(false);
    latestDraftRef.current = null;
  }, []);

  return {
    loadedDraft: decided ? loadedDraft : null,
    showResumeBanner,
    acceptResume,
    declineResume,
    saveDraft,
    resetDraft,
  };
}
