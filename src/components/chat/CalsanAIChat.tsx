// ============================================================
// CALSAN AI — Structured Conversation Engine + Booking Engine
// Decision tree: ZIP → Type → Project → Material → Size → Price → Contact → Schedule → Payment → Confirm
// + Photo Upload path: ZIP → Photo → Result → Size → Price → Contact → Schedule → Payment → Confirm
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, Phone, Upload, Check, Camera, Lock, CreditCard, CalendarDays, Clock, Shield, MapPin, MessageSquare, Zap, Video } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Calendar } from '@/components/ui/calendar';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO } from '@/lib/shared-data';
import { getPriceByZip } from '@/lib/price-list-data';
import { format, addDays, isWeekend, isBefore, startOfDay } from 'date-fns';
import { getFeatureFlag } from '@/lib/featureFlags';

// ============================================================
// TYPES & CONSTANTS
// ============================================================

export type ChatMode = 'default' | 'sales' | 'commercial' | 'contractor';
type ChatTab = 'guided' | 'ask';

type FlowStep =
  | 'zip' | 'customer-type' | 'project' | 'material' | 'size' | 'price' | 'contact' | 'confirm'
  | 'photo-upload' | 'photo-analyzing' | 'photo-result'
  | 'schedule' | 'payment' | 'payment-processing' | 'booking-confirm'
  | 'contractor-fast' | 'placement-offer';

// Steps for progress bar (manual path)
const MANUAL_STEPS: FlowStep[] = ['zip', 'customer-type', 'project', 'material', 'size', 'price', 'contact', 'schedule', 'payment', 'booking-confirm', 'placement-offer'];
// Steps for photo path
const PHOTO_STEPS: FlowStep[] = ['zip', 'photo-upload', 'photo-analyzing', 'photo-result', 'size', 'price', 'contact', 'schedule', 'payment', 'booking-confirm', 'placement-offer'];

type CustomerType = 'homeowner' | 'contractor' | 'commercial';

interface PhotoAnalysis {
  recommendedSize: number;
  confidence: number;
  materialType: string;
  explanation: string;
  heavy: boolean;
}

interface FlowState {
  step: FlowStep;
  zip: string;
  customerType: CustomerType | null;
  projectType: string | null;
  materialType: string | null;
  heavy: boolean;
  size: number | null;
  price: number | null;
  zipFound: boolean;
  name: string;
  phone: string;
  email: string;
  leadCreated: boolean;
  photoPath: boolean;
  photoAnalysis: PhotoAnalysis | null;
  // Booking engine fields
  bookingMode: 'reserve' | 'hold' | null;
  deliveryDate: string | null;
  deliveryWindow: string | null;
  paymentOption: 'deposit' | 'full' | 'later' | null;
  orderId: string | null;
  hostedToken: string | null;
  hostedFormUrl: string | null;
  paymentConfirmed: boolean;
  contractorFastOption: string | null;
  placementSkipped: boolean;
}

const INITIAL_STATE: FlowState = {
  step: 'zip',
  zip: '',
  customerType: null,
  projectType: null,
  materialType: null,
  heavy: false,
  size: null,
  price: null,
  zipFound: false,
  name: '',
  phone: '',
  email: '',
  leadCreated: false,
  photoPath: false,
  photoAnalysis: null,
  bookingMode: null,
  deliveryDate: null,
  deliveryWindow: null,
  paymentOption: null,
  orderId: null,
  hostedToken: null,
  hostedFormUrl: null,
  paymentConfirmed: false,
  contractorFastOption: null,
  placementSkipped: false,
};

const STORAGE_KEY = 'calsan_structured_chat_v1';
const STATE_TTL_MS = 30 * 60 * 1000;
const MAX_IMAGE_SIZE = 4 * 1024 * 1024; // 4MB after compression
const MAX_VIDEO_SIZE = 10 * 1024 * 1024; // 10MB
const MAX_VIDEO_DURATION = 5; // seconds

// ---- Project types by customer ----
const PROJECT_TYPES: Record<CustomerType, string[]> = {
  homeowner: ['Home Cleanout', 'Remodel Debris', 'Yard Cleanup', 'Roofing', 'Other'],
  contractor: ['Demo', 'Concrete', 'Dirt', 'Framing', 'Mixed Debris'],
  commercial: ['Warehouse Cleanout', 'Ongoing Service', 'Construction', 'Large Project'],
};

const MATERIAL_TYPES = [
  { id: 'general', label: 'General Debris', heavy: false },
  { id: 'concrete', label: 'Concrete', heavy: true },
  { id: 'dirt', label: 'Dirt / Soil', heavy: true },
  { id: 'green', label: 'Green Waste', heavy: false },
  { id: 'mixed_heavy', label: 'Mixed Heavy', heavy: true },
];

const GENERAL_SIZES = [5, 8, 10, 20, 30, 40, 50];
const HEAVY_SIZES = [5, 8, 10];

const TIME_WINDOWS = [
  { id: 'morning', label: 'Morning', time: '8:00 AM – 10:00 AM' },
  { id: 'midday', label: 'Midday', time: '10:00 AM – 1:00 PM' },
  { id: 'afternoon', label: 'Afternoon', time: '1:00 PM – 4:00 PM' },
];

// ---- Persistence ----
function loadState(): FlowState | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (Date.now() - (parsed._ts || 0) > STATE_TTL_MS) { localStorage.removeItem(STORAGE_KEY); return null; }
    delete parsed._ts;
    return parsed as FlowState;
  } catch { return null; }
}

function saveState(state: FlowState) {
  try { localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...state, _ts: Date.now() })); } catch {}
}

// ---- Session Tracker ----
function useSessionTracker() {
  const startTime = useRef(Date.now());
  const logEvent = useCallback(async (eventType: string, meta?: Record<string, unknown>) => {
    try {
      const params = new URLSearchParams(window.location.search);
      await supabase.from('ai_entry_events').insert({
        action_type: eventType,
        time_on_page_ms: Date.now() - startTime.current,
        utm_source: params.get('utm_source'),
        utm_medium: params.get('utm_medium'),
        utm_campaign: params.get('utm_campaign'),
        referrer: document.referrer || null,
        user_agent: navigator.userAgent,
        metadata: meta ? JSON.parse(JSON.stringify(meta)) : null,
      });
    } catch {}
  }, []);
  return { logEvent };
}

// ---- ZIP Validation ----
const ZIP_RE = /^9[0-5]\d{3}$/;

function getMaterialCategory(materialType: string | null, heavy: boolean): string {
  if (!materialType) return 'GENERAL';
  if (materialType === 'concrete') return 'CLEAN_CONCRETE';
  if (materialType === 'dirt') return 'CLEAN_SOIL';
  if (materialType === 'mixed_heavy') return 'MIX';
  if (heavy) return 'CLEAN_SOIL';
  return 'GENERAL';
}

function mapDetectedMaterial(detected: string): { id: string; heavy: boolean } {
  const d = detected.toLowerCase();
  if (d.includes('concrete') || d.includes('brick') || d.includes('asphalt')) return { id: 'concrete', heavy: true };
  if (d.includes('dirt') || d.includes('soil') || d.includes('rock')) return { id: 'dirt', heavy: true };
  if (d.includes('green') || d.includes('yard') || d.includes('vegetation')) return { id: 'green', heavy: false };
  if (d.includes('mixed') && d.includes('heavy')) return { id: 'mixed_heavy', heavy: true };
  return { id: 'general', heavy: false };
}

function getSizeRecommendation(projectType: string | null, heavy: boolean): number {
  if (heavy) return 10;
  if (!projectType) return 20;
  const p = projectType.toLowerCase();
  if (p.includes('cleanout') || p.includes('yard')) return 10;
  if (p.includes('remodel') || p.includes('framing')) return 20;
  if (p.includes('roofing')) return 20;
  if (p.includes('demo') || p.includes('construction') || p.includes('warehouse') || p.includes('large')) return 30;
  return 20;
}

function getIncludedTons(size: number, heavy: boolean): number {
  if (heavy) return 0; // Heavy materials use flat-rate, no included tons
  if (size <= 8) return 0.5;
  if (size <= 10) return 1;
  if (size <= 20) return 2;
  if (size <= 30) return 3;
  if (size <= 40) return 4;
  return 5;
}

// ---- Date helpers ----
function isBusinessDay(date: Date): boolean {
  return !isWeekend(date);
}

function getMinDeliveryDate(): Date {
  const now = new Date();
  let d = addDays(startOfDay(now), 1);
  while (!isBusinessDay(d)) d = addDays(d, 1);
  return d;
}

function getMaxDeliveryDate(): Date {
  return addDays(new Date(), 21);
}

function isDateDisabled(date: Date): boolean {
  const min = getMinDeliveryDate();
  const max = getMaxDeliveryDate();
  return isWeekend(date) || isBefore(date, min) || isBefore(max, date);
}

// ---- Image compression ----
async function compressImage(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    const reader = new FileReader();
    reader.onload = (e) => {
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const maxDim = 1200;
        let w = img.width, h = img.height;
        if (w > maxDim || h > maxDim) {
          if (w > h) { h = Math.round(h * maxDim / w); w = maxDim; }
          else { w = Math.round(w * maxDim / h); h = maxDim; }
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (!ctx) { reject(new Error('Canvas not supported')); return; }
        ctx.drawImage(img, 0, 0, w, h);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.8);
        const base64 = dataUrl.split(',')[1];
        if (base64.length > MAX_IMAGE_SIZE) {
          const lq = canvas.toDataURL('image/jpeg', 0.5).split(',')[1];
          resolve(lq);
        } else {
          resolve(base64);
        }
      };
      img.onerror = () => reject(new Error('Failed to load image'));
      img.src = e.target?.result as string;
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsDataURL(file);
  });
}

// ---- Video duration check ----
function getVideoDuration(file: File): Promise<number> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'metadata';
    video.onloadedmetadata = () => {
      URL.revokeObjectURL(video.src);
      resolve(video.duration);
    };
    video.onerror = () => reject(new Error('Cannot read video'));
    video.src = URL.createObjectURL(file);
  });
}

// ---- Extract key frames from video ----
function extractFrames(file: File, times: number[]): Promise<string[]> {
  return new Promise((resolve, reject) => {
    const video = document.createElement('video');
    video.preload = 'auto';
    video.muted = true;
    video.playsInline = true;
    const frames: string[] = [];
    let idx = 0;

    video.onloadeddata = () => {
      const seekNext = () => {
        if (idx >= times.length) {
          URL.revokeObjectURL(video.src);
          resolve(frames);
          return;
        }
        video.currentTime = Math.min(times[idx], video.duration - 0.1);
      };

      video.onseeked = () => {
        const canvas = document.createElement('canvas');
        canvas.width = Math.min(video.videoWidth, 1200);
        canvas.height = Math.round(canvas.width * (video.videoHeight / video.videoWidth));
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
          const base64 = canvas.toDataURL('image/jpeg', 0.8).split(',')[1];
          frames.push(base64);
        }
        idx++;
        seekNext();
      };

      seekNext();
    };

    video.onerror = () => reject(new Error('Failed to process video'));
    video.src = URL.createObjectURL(file);
  });
}

// ---- Example prompts for Ask tab ----
const EXAMPLE_PROMPTS_EN = [
  'Demolish a 1,800 sq ft house',
  'Kitchen remodel',
  'Dirt and concrete',
  'Garage cleanout',
  'Roofing job',
  "I'm not sure",
];
const EXAMPLE_PROMPTS_ES = [
  'Demoler una casa de 1,800 pies cuadrados',
  'Remodelación de cocina',
  'Tierra y concreto',
  'Limpieza de garaje',
  'Trabajo de techo',
  'No estoy seguro',
];

// ---- Estimation result for structured rendering ----
interface EstimationResult {
  volume_min: number;
  volume_max: number;
  recommended_plan: string | null;
  heavy_mode: boolean;
  recyclable_materials: string[];
  savings_tips: string[];
  project_type: string | null;
  material_class: string | null;
}

// ============================================================
// COMPONENT
// ============================================================

interface CalsanAIChatProps {
  chatMode?: ChatMode;
  className?: string;
}

export function CalsanAIChat({ chatMode = 'default', className }: CalsanAIChatProps) {
  const persisted = useRef(loadState());
  const [state, setState] = useState<FlowState>(() => {
    const initial = persisted.current || { ...INITIAL_STATE };
    if (chatMode === 'contractor' && !initial.customerType) initial.customerType = 'contractor';
    if (chatMode === 'commercial' && !initial.customerType) initial.customerType = 'commercial';
    return initial;
  });
  const [zipInput, setZipInput] = useState(state.zip || '');
  const [nameInput, setNameInput] = useState(state.name || '');
  const [phoneInput, setPhoneInput] = useState(state.phone || '');
  const [emailInput, setEmailInput] = useState(state.email || '');
  const [loading, setLoading] = useState(false);
  const [zipError, setZipError] = useState('');
  const [phoneError, setPhoneError] = useState('');
  const [showWelcome, setShowWelcome] = useState(false);
  const [showRestoreBanner, setShowRestoreBanner] = useState(() => {
    return persisted.current !== null && persisted.current.step !== 'zip';
  });
  const [photoPreview, setPhotoPreview] = useState<string | null>(null);
  const [mediaError, setMediaError] = useState('');
  const [mediaType, setMediaType] = useState<'PHOTO' | 'VIDEO'>('PHOTO');
  const videoRef = useRef<HTMLInputElement>(null);
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [chatTab, setChatTab] = useState<ChatTab>('guided');
  const [askInput, setAskInput] = useState('');
  const [askMessages, setAskMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string; estimation?: EstimationResult | null }>>([]);
  const [askLoading, setAskLoading] = useState(false);
  const [detectedLang, setDetectedLang] = useState<'EN' | 'ES'>('EN');
  const scrollRef = useRef<HTMLDivElement>(null);
  const fileRef = useRef<HTMLInputElement>(null);
  const paymentFormRef = useRef<HTMLFormElement>(null);
  const navigate = useNavigate();
  const { logEvent } = useSessionTracker();

  // Autosave
  useEffect(() => { saveState(state); }, [state]);

  // Welcome animation
  useEffect(() => {
    const t = setTimeout(() => setShowWelcome(true), 300);
    return () => clearTimeout(t);
  }, []);

  // Auto-scroll
  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [state.step, loading]);

  // Auto-submit payment form when hosted data is ready
  useEffect(() => {
    if (state.step === 'payment-processing' && state.hostedToken && paymentFormRef.current) {
      paymentFormRef.current.submit();
    }
  }, [state.step, state.hostedToken]);

  // Progress calculation
  const activeSteps = state.photoPath ? PHOTO_STEPS : MANUAL_STEPS;
  const stepIndex = activeSteps.indexOf(state.step);
  const effectiveIndex = stepIndex >= 0 ? stepIndex : 0;
  const progress = Math.round(((effectiveIndex + 1) / activeSteps.length) * 100);

  const goTo = (step: FlowStep) => setState(prev => ({ ...prev, step }));

  const canGoBack = effectiveIndex > 0 && state.step !== 'booking-confirm' && state.step !== 'confirm' && state.step !== 'photo-analyzing' && state.step !== 'payment-processing';

  const goBack = () => {
    if (effectiveIndex > 0) goTo(activeSteps[effectiveIndex - 1]);
  };

  const resetConversation = useCallback(() => {
    setState({ ...INITIAL_STATE });
    setZipInput('');
    setNameInput('');
    setPhoneInput('');
    setEmailInput('');
    setZipError('');
    setPhoneError('');
    setPhotoPreview(null);
    setSelectedDate(undefined);
    setSelectedWindow(null);
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ---- Ask a Question handler (calls real AI) ----
  const handleAskSubmit = async (overrideQuestion?: string) => {
    const q = (overrideQuestion || askInput).trim();
    if (!q || askLoading) return;
    logEvent('ai_question_submitted', { question: q });
    const newUserMsg = { role: 'user' as const, text: q };
    setAskMessages(prev => [...prev, newUserMsg]);
    setAskInput('');
    setAskLoading(true);

    try {
      const { data, error } = await supabase.functions.invoke('website-assistant', {
        body: {
          question: q,
          zip: state.zip || null,
          enrich_lead: true,
          session_context: {
            project_type: state.projectType,
            material_type: state.materialType,
          },
          conversation_history: askMessages.slice(-8),
        },
      });

      if (error) throw error;

      const answerText = data?.answer_text || 'I can help with dumpster sizing, materials, and project estimates. Could you describe your project?';
      const estimation = data?.estimation || null;
      if (data?.language) setDetectedLang(data.language === 'ES' ? 'ES' : 'EN');

      setAskMessages(prev => [...prev, { role: 'assistant', text: answerText, estimation }]);
    } catch (err) {
      console.error('AI assistant error:', err);
      setAskMessages(prev => [...prev, {
        role: 'assistant',
        text: 'I am having trouble connecting right now. You can get exact pricing through the Guided Quote, or call our team directly.',
      }]);
    } finally {
      setAskLoading(false);
    }
  };

  const handleTabSwitch = (tab: ChatTab) => {
    logEvent('ai_mode_switched', { mode: tab });
    setChatTab(tab);
  };

  const handleQuickTool = (tool: string) => {
    logEvent('ai_tool_clicked', { tool });
    if (tool === 'instant_price') {
      setChatTab('guided');
      // Already on ZIP step by default
    } else if (tool === 'upload_photo') {
      setChatTab('guided');
      if (state.zip && state.zipFound) {
        setState(prev => ({ ...prev, photoPath: true, step: 'photo-upload' }));
      }
      // If no ZIP yet, stay on ZIP step — user enters ZIP first
    } else if (tool === 'book_now') {
      const params = new URLSearchParams({ v3: '1', fast: '1' });
      if (state.zip) params.set('zip', state.zip);
      navigate(`/quote?${params.toString()}`);
    }
    // talk_to_dispatch is handled inline (shows call button)
  };

  // ---- Step Handlers ----

  const handleZipSubmit = async () => {
    const zip = zipInput.trim();
    if (!ZIP_RE.test(zip)) { setZipError('Please enter a valid 5-digit ZIP code.'); return; }
    setZipError('');
    setLoading(true);
    logEvent('step_zip', { zip });
    const result = getPriceByZip(zip, 20, 'GENERAL');
    setLoading(false);
    if (!result.zipFound || result.price === 0) {
      setZipError('This ZIP code is outside our current service area. Call us for a custom quote.');
      return;
    }
    setState(prev => ({ ...prev, zip, zipFound: true, step: 'customer-type' }));
  };

  const handleZipThenPhoto = async () => {
    const zip = zipInput.trim();
    if (!ZIP_RE.test(zip)) { setZipError('Please enter a valid 5-digit ZIP code.'); return; }
    setZipError('');
    const result = getPriceByZip(zip, 20, 'GENERAL');
    if (!result.zipFound || result.price === 0) {
      setZipError('This ZIP code is outside our current service area. Call us for a custom quote.');
      return;
    }
    logEvent('step_zip_photo', { zip });
    setState(prev => ({ ...prev, zip, zipFound: true, photoPath: true, step: 'photo-upload' }));
  };

  const handleCustomerType = (type: CustomerType) => {
    logEvent('step_customer_type', { type });
    // Contractor fast mode (feature-flagged)
    if (type === 'contractor' && getFeatureFlag('ai_home.contractor_mode.enabled')) {
      setState(prev => ({ ...prev, customerType: type, step: 'contractor-fast' }));
      return;
    }
    setState(prev => ({ ...prev, customerType: type, step: 'project' }));
  };

  const handleContractorFastOption = (option: string) => {
    logEvent('contractor_fast_option', { option });
    setState(prev => ({ ...prev, contractorFastOption: option, step: 'project' }));
  };

  const handleProject = (project: string) => {
    logEvent('step_project', { project });
    setState(prev => ({ ...prev, projectType: project, step: 'material' }));
  };

  const handleMaterial = (id: string) => {
    const mat = MATERIAL_TYPES.find(m => m.id === id);
    const heavy = mat?.heavy || false;
    logEvent('step_material', { material: id, heavy });
    setState(prev => ({ ...prev, materialType: id, heavy, step: 'size' }));
  };

  const handleSize = (size: number) => {
    const category = getMaterialCategory(state.materialType, state.heavy);
    const result = getPriceByZip(state.zip, size, category);
    logEvent('step_size', { size, price: result.price });
    setState(prev => ({ ...prev, size, price: result.price, step: 'price' }));
  };

  const handleChangeSize = () => goTo('size');

  const handleReserve = () => {
    setState(prev => ({ ...prev, bookingMode: 'reserve' }));
    goTo('contact');
  };

  const handleHoldPrice = () => {
    setState(prev => ({ ...prev, bookingMode: 'hold' }));
    goTo('contact');
  };

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, '');
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 3)}) ${digits.slice(3)}`;
    return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6, 10)}`;
  };

  const handleContactSubmit = async () => {
    const name = nameInput.trim();
    const phone = phoneInput.replace(/\D/g, '');
    if (!name) return;
    if (phone.length < 10) { setPhoneError('Please enter a valid phone number.'); return; }
    setPhoneError('');
    setLoading(true);
    logEvent('step_contact', { hasEmail: !!emailInput.trim(), bookingMode: state.bookingMode });
    try {
      await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'AI_CHAT',
          source_detail: state.photoPath ? 'photo_flow' : 'structured_flow',
          source_page: window.location.pathname,
          source_module: 'calsan_ai_chat',
          name,
          phone: phoneInput,
          email: emailInput.trim() || null,
          zip: state.zip,
          project_type: state.projectType || null,
          material_category: state.materialType || null,
          customer_type: state.customerType || null,
          selected_size: state.size || null,
          quote_amount: state.price || null,
          last_step_completed: 'contact_captured',
          ai_conversation_summary: [
            state.customerType ? `Type: ${state.customerType}` : null,
            state.projectType ? `Project: ${state.projectType}` : null,
            `Material: ${MATERIAL_TYPES.find(m => m.id === state.materialType)?.label || state.materialType || 'Not specified'}`,
            `Size: ${state.size}yd`,
            `Price: $${state.price}`,
            state.photoAnalysis ? `Photo confidence: ${state.photoAnalysis.confidence}%` : null,
          ].filter(Boolean).join('. '),
          message: [
            state.customerType ? `Type: ${state.customerType}` : null,
            state.projectType ? `Project: ${state.projectType}` : null,
            `Material: ${MATERIAL_TYPES.find(m => m.id === state.materialType)?.label || state.materialType || 'Not specified'}`,
            `Size: ${state.size}yd`,
            `Price: $${state.price}`,
          ].filter(Boolean).join('. '),
          consent_status: 'TRANSACTIONAL',
          raw_payload: {
            photo_path: state.photoPath || null,
            photo_confidence: state.photoAnalysis?.confidence || null,
            booking_mode: state.bookingMode,
          },
        },
      });
    } catch {}

    const nextStep: FlowStep = state.bookingMode === 'reserve' ? 'schedule' : 'confirm';
    setState(prev => ({
      ...prev,
      name, phone: phoneInput, email: emailInput.trim(),
      leadCreated: true, step: nextStep,
    }));
    setLoading(false);
  };

  // ---- Scheduling Handlers ----

  const handleDateSelect = (date: Date | undefined) => {
    setSelectedDate(date);
    if (date) {
      setState(prev => ({ ...prev, deliveryDate: format(date, 'yyyy-MM-dd') }));
    }
  };

  const handleWindowSelect = (windowId: string) => {
    setSelectedWindow(windowId);
    setState(prev => ({ ...prev, deliveryWindow: windowId }));
  };

  const handleScheduleSubmit = () => {
    if (!state.deliveryDate || !state.deliveryWindow) return;
    logEvent('step_schedule', { date: state.deliveryDate, window: state.deliveryWindow });
    goTo('payment');
  };

  // ---- Payment Handlers ----

  const handlePaymentOption = async (option: 'deposit' | 'full' | 'later') => {
    logEvent('step_payment', { option });
    setState(prev => ({ ...prev, paymentOption: option }));

    if (option === 'later') {
      await createOrderAndConfirm(option);
      return;
    }
    await createOrderAndPay(option);
  };

  const createOrderAndConfirm = async (paymentOption: 'deposit' | 'full' | 'later') => {
    setLoading(true);
    try {
      const tons = getIncludedTons(state.size!, state.heavy);
      const { data: order, error: orderError } = await supabase.from('orders').insert({
        status: 'PENDING',
        final_total: state.price,
        amount_due: state.price,
        balance_due: state.price,
        amount_paid: 0,
        is_heavy_material: state.heavy,
        included_tons_for_size: tons,
        scheduled_delivery_date: state.deliveryDate,
        scheduled_delivery_window: state.deliveryWindow,
        payment_status: paymentOption === 'later' ? 'unpaid' : 'pending',
        internal_notes: `Chat booking: ${state.size}yd ${state.materialType || 'general'} for ${state.zip}. Customer: ${state.name} ${state.phone}`,
      }).select('id').single();

      if (orderError) throw orderError;

      setState(prev => ({
        ...prev,
        orderId: order.id,
        paymentOption,
        paymentConfirmed: paymentOption === 'later',
        step: 'booking-confirm',
      }));
    } catch (err) {
      console.error('Order creation failed:', err);
      setState(prev => ({
        ...prev,
        paymentOption,
        paymentConfirmed: false,
        step: 'booking-confirm',
      }));
    } finally {
      setLoading(false);
    }
  };

  const createOrderAndPay = async (paymentOption: 'deposit' | 'full') => {
    setLoading(true);
    try {
      const tons = getIncludedTons(state.size!, state.heavy);
      const paymentAmount = paymentOption === 'deposit'
        ? Math.round((state.price! * 0.5) * 100) / 100
        : state.price!;

      const { data: order, error: orderError } = await supabase.from('orders').insert({
        status: 'PENDING',
        final_total: state.price,
        amount_due: state.price,
        balance_due: state.price,
        amount_paid: 0,
        is_heavy_material: state.heavy,
        included_tons_for_size: tons,
        scheduled_delivery_date: state.deliveryDate,
        scheduled_delivery_window: state.deliveryWindow,
        payment_status: 'pending',
        internal_notes: `Chat booking: ${state.size}yd ${state.materialType || 'general'} for ${state.zip}. Customer: ${state.name} ${state.phone}`,
      }).select('id').single();

      if (orderError) throw orderError;

      const origin = window.location.origin;
      const { data, error: fnError } = await supabase.functions.invoke('create-hosted-session', {
        body: {
          orderId: order.id,
          paymentType: paymentOption === 'deposit' ? 'deposit' : 'balance',
          amount: paymentAmount,
          returnUrl: `${origin}/portal/payment-complete?orderId=${order.id}`,
          cancelUrl: origin,
        },
      });

      if (fnError) throw fnError;

      if (data?.success && data?.token) {
        setState(prev => ({
          ...prev,
          orderId: order.id,
          paymentOption,
          hostedToken: data.token,
          hostedFormUrl: data.formPostUrl,
          step: 'payment-processing',
        }));
      } else {
        throw new Error(data?.error || 'Payment session failed');
      }
    } catch (err) {
      console.error('Payment setup failed:', err);
      // Fallback to pay later
      setState(prev => ({
        ...prev,
        paymentOption: 'later',
        step: 'booking-confirm',
      }));
    } finally {
      setLoading(false);
    }
  };

  const handlePaymentComplete = () => {
    setState(prev => ({
      ...prev,
      paymentConfirmed: true,
      step: 'booking-confirm',
    }));
  };

  // ---- Photo Upload Handler ----
  const handlePhotoUpload = useCallback(async (files: FileList) => {
    const file = files[0];
    if (!file) return;

    const previewUrl = URL.createObjectURL(file);
    setPhotoPreview(previewUrl);
    setMediaError('');

    setLoading(true);
    setState(prev => ({ ...prev, step: 'photo-analyzing' }));

    const isVideo = file.type.startsWith('video/');
    const currentMediaType = isVideo ? 'VIDEO' : 'PHOTO';
    setMediaType(currentMediaType);
    logEvent(isVideo ? 'video_uploaded' : 'photo_uploaded', { fileSize: file.size, fileType: file.type });

    try {
      let images: string[];

      if (isVideo) {
        // Validate video size
        if (file.size > MAX_VIDEO_SIZE) {
          setMediaError('Video is too large. Please upload a file under 10MB.');
          setState(prev => ({ ...prev, step: 'photo-upload' }));
          setLoading(false);
          return;
        }
        // Validate video duration
        let duration: number;
        try {
          duration = await getVideoDuration(file);
        } catch {
          setMediaError('Could not read video. Please try a different file.');
          setState(prev => ({ ...prev, step: 'photo-upload' }));
          setLoading(false);
          return;
        }
        if (duration > MAX_VIDEO_DURATION + 1) { // +1s tolerance
          setMediaError(`Please upload a shorter video (${MAX_VIDEO_DURATION} seconds or less).`);
          setState(prev => ({ ...prev, step: 'photo-upload' }));
          setLoading(false);
          return;
        }
        // Extract 3 key frames
        const frameTimes = [0.5, Math.min(duration / 2, 2.5), Math.max(duration - 0.5, 1)];
        images = await extractFrames(file, frameTimes);
        if (images.length === 0) throw new Error('No frames extracted');
      } else {
        const base64 = await compressImage(file);
        images = [base64];
      }

      // Upload to storage (non-blocking)
      let storagePath: string | null = null;
      const ext = isVideo ? 'mp4' : 'jpg';
      const folder = isVideo ? 'video-assessments' : 'photo-assessments';
      const fileName = `${folder}/${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
      try {
        await supabase.storage.from('waste-uploads').upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });
        storagePath = fileName;
      } catch { /* non-blocking */ }

      // Call analyze-waste
      const { data, error } = await supabase.functions.invoke('analyze-waste', {
        body: {
          images,
          media_type: currentMediaType,
          image_storage_path: isVideo ? undefined : storagePath,
          video_storage_path: isVideo ? storagePath : undefined,
          zip: state.zip || null,
        },
      });

      if (error) throw error;

      const rec = data?.recommendation;
      const materials = data?.analysis?.materials || data?.materials || [];
      const primaryMaterial = materials[0]?.name || rec?.materialCategory || 'general debris';
      const confidence = Math.round((rec?.confidence || data?.confidence || 0.7) * 100);
      const recommendedSize = data?.recommended_size || rec?.recommendedSize || 20;
      const heavyFlag = data?.heavy_flag ?? rec?.heavy ?? false;
      const explanation = rec?.explanation || `For debris of this type and estimated volume.`;

      const detected = mapDetectedMaterial(primaryMaterial);
      const isHeavy = heavyFlag || detected.heavy;

      const analysis: PhotoAnalysis = {
        recommendedSize,
        confidence,
        materialType: primaryMaterial,
        explanation,
        heavy: isHeavy,
      };

      logEvent(isVideo ? 'video_analyzed' : 'photo_analyzed', {
        confidence,
        recommendedSize,
        material: primaryMaterial,
        heavy: isHeavy,
        mediaType: currentMediaType,
      });

      // Persist draft for refresh recovery
      try {
        localStorage.setItem('calsan_photo_ai_draft', JSON.stringify({
          ...analysis,
          zip: state.zip,
          mediaType: currentMediaType,
          savedAt: Date.now(),
        }));
      } catch { /* quota exceeded */ }

      setState(prev => ({
        ...prev,
        photoAnalysis: analysis,
        materialType: detected.id,
        heavy: isHeavy,
        step: 'photo-result',
      }));

      // Lead ingest (non-blocking, revenue critical)
      try {
        await supabase.functions.invoke('lead-ingest', {
          body: {
            source_channel: 'WEBSITE_MEDIA',
            channel_key: 'photo_video_assess',
            zip: state.zip || null,
            metadata: {
              media_type: currentMediaType,
              recommended_size: recommendedSize,
              confidence,
              material: primaryMaterial,
              heavy: isHeavy,
              storage_path: storagePath,
            },
          },
        });
      } catch { /* non-blocking */ }

    } catch (err) {
      console.error('Media analysis failed:', err);
      // Show fallback instead of silently reverting
      setState(prev => ({
        ...prev,
        photoAnalysis: { recommendedSize: 20, confidence: 0, materialType: '', explanation: '', heavy: false },
        step: 'photo-result',
      }));
    } finally {
      setLoading(false);
    }
  }, [logEvent, state.zip]);

  const handleAcceptPhotoRecommendation = () => {
    if (!state.photoAnalysis) return;
    handleSize(state.photoAnalysis.recommendedSize);
  };

  const handleSeeLargerOption = () => {
    if (!state.photoAnalysis) return;
    const rec = state.photoAnalysis.recommendedSize;
    const available = state.heavy ? HEAVY_SIZES : GENERAL_SIZES;
    const larger = available.find(s => s > rec) || available[available.length - 1];
    handleSize(larger);
  };

  const handlePhotoManualSelect = () => {
    goTo('size');
  };

  // ============================================================
  // RENDER HELPERS
  // ============================================================

  const SystemMessage = ({ children, animate = true }: { children: React.ReactNode; animate?: boolean }) => (
    <div className={cn(
      "space-y-3",
      animate && "animate-in fade-in-0 slide-in-from-bottom-2 duration-300"
    )}>
      <div className="bg-[hsl(220_10%_97%)] rounded-xl px-4 py-3 max-w-[95%] shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
        {children}
      </div>
    </div>
  );

  const OptionButton = ({ label, onClick, active }: { label: string; onClick: () => void; active?: boolean }) => (
    <button
      onClick={onClick}
      className={cn(
        "px-4 py-2.5 border rounded-xl text-sm font-medium transition-all duration-200 text-left",
        active
          ? "border-primary bg-primary/5 text-primary"
          : "border-[hsl(220_10%_90%)] text-foreground hover:border-primary/30 hover:bg-primary/[0.03]"
      )}
    >
      {label}
    </button>
  );

  const ActionButton = ({ label, onClick, variant = 'primary', disabled, icon }: {
    label: string; onClick: () => void; variant?: 'primary' | 'outline' | 'ghost';
    disabled?: boolean; icon?: React.ReactNode;
  }) => (
    <Button
      onClick={onClick}
      disabled={disabled}
      variant={variant === 'primary' ? 'default' : variant === 'outline' ? 'outline' : 'ghost'}
      className={cn(
        "rounded-xl h-11",
        variant === 'primary' && "bg-primary text-primary-foreground hover:bg-primary/90",
        variant === 'outline' && "border-[hsl(220_10%_90%)]",
      )}
    >
      {icon && <span className="mr-2">{icon}</span>}
      {label}
    </Button>
  );

  const UserBubble = ({ text }: { text: string }) => (
    <div className="flex justify-end animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
      <div className="bg-[hsl(220_10%_92%)] rounded-xl px-4 py-2.5 max-w-[85%]">
        <p className="text-sm text-foreground">{text}</p>
      </div>
    </div>
  );

  // ============================================================
  // STEP RENDERS
  // ============================================================

  const renderStep = () => {
    switch (state.step) {
      case 'zip':
        return (
          <SystemMessage>
            <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">
              {showWelcome
                ? 'Tell us your project, and we\'ll guide you to the right dumpster.'
                : ''}
            </p>
            {showWelcome && (
              <p className="text-xs text-muted-foreground mt-1.5">
                Or enter your ZIP to begin.
              </p>
            )}
            {showWelcome && (
              <>
                {/* Quick Tools -- 2x2 grid with micro-descriptions */}
                <div className="grid grid-cols-2 gap-2 mt-4">
                  <button
                    onClick={() => handleQuickTool('instant_price')}
                    className="flex flex-col items-start gap-1 px-3 py-3 border border-[hsl(220_10%_90%)] rounded-xl text-left hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Zap className="w-3.5 h-3.5 text-primary flex-shrink-0" />
                      Get Exact Price
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight pl-5.5">
                      Exact rental price by ZIP and project type.
                    </span>
                  </button>
                  <button
                    onClick={() => handleQuickTool('upload_photo')}
                    className="flex flex-col items-start gap-1 px-3 py-3 border border-[hsl(220_10%_90%)] rounded-xl text-left transition-all hover:border-primary/30 hover:bg-primary/[0.03]"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Camera className="w-3.5 h-3.5 flex-shrink-0" />
                      Upload a Photo
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight pl-5.5">
                      Get a size recommendation based on your debris.
                    </span>
                  </button>
                  <a
                    href={`tel:${BUSINESS_INFO.phone.sales}`}
                    onClick={() => logEvent('ai_tool_clicked', { tool: 'talk_to_dispatch' })}
                    className="flex flex-col items-start gap-1 px-3 py-3 border border-[hsl(220_10%_90%)] rounded-xl text-left hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      Speak to Our Team
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight pl-5.5">
                      Direct line to a specialist.
                    </span>
                  </a>
                  <button
                    onClick={() => handleQuickTool('book_now')}
                    className="flex flex-col items-start gap-1 px-3 py-3 border border-primary bg-primary/5 rounded-xl text-left hover:bg-primary/10 transition-all"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-primary">
                      <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                      Schedule Delivery
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight pl-5.5">
                      Lock in your delivery date and confirmation.
                    </span>
                  </button>
                </div>

                <p className="text-[10px] text-muted-foreground mt-3 mb-1">You'll see your total before confirming. No surprises.</p>
                <div className="mt-3 pt-3 border-t border-[hsl(220_10%_93%)]">
                  <p className="text-xs text-muted-foreground mb-2">Enter your ZIP for exact pricing:</p>
                </div>
                <div className="mt-4 flex gap-2">
                  <input
                    value={zipInput}
                    onChange={(e) => { setZipInput(e.target.value.replace(/\D/g, '').slice(0, 5)); setZipError(''); }}
                    onKeyDown={(e) => e.key === 'Enter' && handleZipSubmit()}
                    placeholder="Enter ZIP code"
                    className="flex-1 bg-white border border-[hsl(220_10%_90%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                    maxLength={5}
                    autoFocus
                    inputMode="numeric"
                  />
                  <Button
                    onClick={handleZipSubmit}
                    disabled={zipInput.length !== 5 || loading}
                    className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-5"
                  >
                    {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
                  </Button>
                </div>
                {zipError && <p className="mt-2 text-xs text-destructive">{zipError}</p>}
                {zipError && zipError.includes('outside') && (
                  <div className="mt-3">
                    <Button asChild variant="outline" className="rounded-xl h-10 text-sm border-[hsl(220_10%_90%)]">
                      <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                        <Phone className="w-3.5 h-3.5 mr-2" /> Call for Custom Quote
                      </a>
                    </Button>
                  </div>
                )}
                {/* Photo upload quick action */}
                {!zipError && zipInput.length === 5 && (
                  <div className="mt-3 pt-3 border-t border-[hsl(220_10%_93%)]">
                    <button
                      onClick={handleZipThenPhoto}
                      className="flex items-center gap-2.5 w-full px-4 py-2.5 border border-[hsl(220_10%_90%)] rounded-xl text-sm text-foreground hover:border-primary/30 hover:bg-primary/[0.03] transition-all duration-200"
                    >
                      <Camera className="w-4 h-4 text-muted-foreground" />
                      <div className="text-left">
                        <span className="font-medium">Upload a Photo</span>
                        <p className="text-xs text-muted-foreground mt-0.5">Get a size recommendation</p>
                      </div>
                    </button>
                  </div>
                )}
              </>
            )}
          </SystemMessage>
        );

      case 'photo-upload':
        return (
          <>
            <UserBubble text={state.zip} />
            <SystemMessage>
              <p className="text-sm text-foreground mb-1 font-medium">Upload project media</p>
              <p className="text-xs text-muted-foreground mb-4">
                Short videos can improve size recommendations.
              </p>
              {mediaError && (
                <div className="bg-destructive/10 border border-destructive/20 rounded-lg px-3 py-2 mb-3">
                  <p className="text-xs text-destructive">{mediaError}</p>
                </div>
              )}
              <div className="grid grid-cols-2 gap-2 mb-3">
                {/* Take Photo */}
                <button
                  onClick={() => {
                    const input = fileRef.current;
                    if (input) { input.accept = 'image/*'; input.capture = 'environment'; input.click(); }
                  }}
                  className="flex flex-col items-center gap-1.5 px-3 py-4 border border-[hsl(220_10%_90%)] rounded-xl text-center hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                >
                  <Camera className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Take photo</span>
                </button>
                {/* Upload Photo */}
                <button
                  onClick={() => {
                    const input = fileRef.current;
                    if (input) { input.accept = 'image/jpeg,image/png,image/webp'; input.removeAttribute('capture'); input.click(); }
                  }}
                  className="flex flex-col items-center gap-1.5 px-3 py-4 border border-[hsl(220_10%_90%)] rounded-xl text-center hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Upload photo</span>
                </button>
                {/* Record Video */}
                <button
                  onClick={() => {
                    const input = videoRef.current;
                    if (input) { input.accept = 'video/*'; input.capture = 'environment'; input.click(); }
                  }}
                  className="flex flex-col items-center gap-1.5 px-3 py-4 border border-[hsl(220_10%_90%)] rounded-xl text-center hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                >
                  <Video className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Record video</span>
                  <span className="text-[10px] text-muted-foreground">3–5 seconds</span>
                </button>
                {/* Upload Video */}
                <button
                  onClick={() => {
                    const input = videoRef.current;
                    if (input) { input.accept = 'video/mp4,video/quicktime,video/webm'; input.removeAttribute('capture'); input.click(); }
                  }}
                  className="flex flex-col items-center gap-1.5 px-3 py-4 border border-[hsl(220_10%_90%)] rounded-xl text-center hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                >
                  <Upload className="w-5 h-5 text-muted-foreground" />
                  <span className="text-xs font-medium text-foreground">Upload video</span>
                  <span className="text-[10px] text-muted-foreground">Max 5s, 10MB</span>
                </button>
              </div>
              {/* Hidden inputs */}
              <input
                ref={fileRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                className="hidden"
                onChange={(e) => { if (e.target.files) handlePhotoUpload(e.target.files); e.target.value = ''; }}
              />
              <input
                ref={videoRef}
                type="file"
                accept="video/mp4,video/quicktime,video/webm"
                className="hidden"
                onChange={(e) => { if (e.target.files) handlePhotoUpload(e.target.files); e.target.value = ''; }}
              />
              <div className="mt-1">
                <button
                  onClick={() => setState(prev => ({ ...prev, photoPath: false, step: 'customer-type' }))}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Skip and select manually
                </button>
              </div>
            </SystemMessage>
          </>
        );

      case 'photo-analyzing':
        return (
          <>
            <UserBubble text={mediaType === 'VIDEO' ? 'Video uploaded' : 'Photo uploaded'} />
            {photoPreview && (
              <div className="flex justify-end animate-in fade-in-0 duration-200">
                <div className="rounded-xl overflow-hidden max-w-[200px] border border-[hsl(220_10%_90%)]">
                  {mediaType === 'VIDEO' ? (
                    <video src={photoPreview} className="w-full h-auto" muted playsInline autoPlay loop />
                  ) : (
                    <img src={photoPreview} alt="Uploaded debris" className="w-full h-auto" />
                  )}
                </div>
              </div>
            )}
            <SystemMessage>
              <div className="flex items-center gap-3 py-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div>
                  <p className="text-sm text-foreground font-medium">
                    {mediaType === 'VIDEO' ? 'Reviewing your video' : 'Reviewing your photo'}
                  </p>
                  <p className="text-xs text-muted-foreground mt-0.5">Estimating material type and volume</p>
                </div>
              </div>
            </SystemMessage>
          </>
        );

      case 'photo-result': {
        const analysis = state.photoAnalysis;
        if (!analysis) return null;
        const lowConfidence = analysis.confidence < 60;
        const confidenceWord = analysis.confidence >= 75 ? 'High' : analysis.confidence >= 50 ? 'Medium' : 'Low';
        const category = getMaterialCategory(state.materialType, state.heavy);
        const { price } = getPriceByZip(state.zip, analysis.recommendedSize, category);

        return (
          <>
            {photoPreview && (
              <div className="flex justify-end animate-in fade-in-0 duration-200">
                <div className="rounded-xl overflow-hidden max-w-[160px] border border-[hsl(220_10%_90%)]">
                  <img src={photoPreview} alt="Uploaded debris" className="w-full h-auto" />
                </div>
              </div>
            )}
            <SystemMessage>
              {lowConfidence ? (
                <div className="space-y-3">
                  <p className="text-sm font-semibold text-foreground">Photo unclear</p>
                  <p className="text-sm text-muted-foreground">
                    We couldn't confidently recommend a size from this photo.
                  </p>
                  <div className="flex flex-col gap-2 mt-3">
                    <ActionButton label="Choose size manually" onClick={handlePhotoManualSelect} variant="primary" />
                    <Button asChild variant="outline" className="rounded-xl h-11 text-sm">
                      <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                        <Phone className="w-3.5 h-3.5 mr-2" /> Talk to dispatch
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  {/* Premium Assessment Card */}
                  <div className="border border-[hsl(220_10%_90%)] rounded-xl overflow-hidden bg-white">
                    {/* Card header */}
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[hsl(220_10%_93%)] bg-[hsl(220_10%_98%)]">
                      <span className="text-xs font-semibold text-foreground">Project Size Assessment</span>
                      <span className={cn(
                        "text-[10px] font-medium px-2 py-0.5 rounded-full",
                        confidenceWord === 'High' && "bg-primary/10 text-primary",
                        confidenceWord === 'Medium' && "bg-[hsl(40_90%_90%)] text-[hsl(40_60%_30%)]",
                      )}>
                        Confidence: {confidenceWord}
                      </span>
                    </div>

                    <div className="p-4 space-y-3">
                      {/* Main recommendation */}
                      <div className="text-center">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">Recommended Size</p>
                        <p className="text-xl font-bold text-foreground">
                          {analysis.recommendedSize}-Yard Dumpster
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          Based on your photo, here's the recommended dumpster size.
                        </p>
                        {price > 0 && (
                          <p className="text-lg font-bold text-foreground mt-1.5">${price}</p>
                        )}
                      </div>

                      {/* Materials observed */}
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1">Materials observed</p>
                        <div className="flex flex-wrap gap-1">
                          <span className="px-2 py-0.5 bg-[hsl(220_10%_95%)] border border-[hsl(220_10%_90%)] rounded-full text-[11px] text-foreground capitalize">
                            {analysis.materialType}
                          </span>
                        </div>
                      </div>

                      {/* What's included */}
                      <div className="space-y-1">
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-0.5">What's included</p>
                        {['Delivery and pickup included', 'Standard rental period included', 'Disposal based on size and material'].map(line => (
                          <div key={line} className="flex items-center gap-1.5">
                            <Check className="w-3 h-3 text-primary flex-shrink-0" />
                            <span className="text-[11px] text-foreground">{line}</span>
                          </div>
                        ))}
                      </div>

                      {/* Service cycle bar */}
                      <div>
                        <p className="text-[10px] text-muted-foreground uppercase tracking-wider mb-1.5">Typical service cycle</p>
                        <div className="flex items-center gap-0">
                          {[
                            { label: 'Delivery', icon: '🚛' },
                            { label: 'On-site', icon: '⏱' },
                            { label: 'Pickup', icon: '📍' },
                            { label: 'Disposal', icon: '♻' },
                          ].map((step, i, arr) => (
                            <div key={step.label} className="flex items-center flex-1">
                              <div className="flex flex-col items-center flex-1">
                                <div className="w-6 h-6 rounded-full bg-[hsl(220_10%_95%)] flex items-center justify-center text-[10px]">
                                  {step.icon}
                                </div>
                                <span className="text-[9px] text-muted-foreground mt-0.5">{step.label}</span>
                              </div>
                              {i < arr.length - 1 && <div className="h-px bg-[hsl(220_10%_90%)] w-3 -mt-2.5" />}
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Heavy material warning */}
                      {state.heavy && (
                        <div className="bg-[hsl(40_90%_95%)] border border-[hsl(40_60%_80%)] rounded-lg px-3 py-2">
                          <p className="text-xs text-foreground font-medium">Heavy material detected</p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Heavy materials require smaller dumpsters due to weight limits. Recommended sizes: 5, 8, or 10 yard.
                          </p>
                          <p className="text-[11px] text-muted-foreground mt-0.5">
                            Fill-line rules may apply for safe transport.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="flex flex-col gap-2">
                    <ActionButton
                      label="Use Recommended Size"
                      onClick={handleAcceptPhotoRecommendation}
                      variant="primary"
                      icon={<ArrowRight className="w-4 h-4" />}
                    />
                    <button
                      onClick={handlePhotoManualSelect}
                      className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center py-1"
                    >
                      Choose a different size
                    </button>
                  </div>
                </div>
              )}
            </SystemMessage>
          </>
        );
      }

      case 'customer-type':
        return (
          <>
            <UserBubble text={state.zip} />
            <SystemMessage>
              {/* Micro-commitment confirmation card */}
              <div className="flex items-center gap-2.5 px-3 py-2.5 bg-primary/5 border border-primary/15 rounded-lg mb-4">
                <Check className="w-4 h-4 text-primary flex-shrink-0" />
                <div>
                  <p className="text-xs font-medium text-foreground">Service area confirmed</p>
                  <p className="text-[10px] text-muted-foreground">Nearest local yard selected automatically</p>
                </div>
              </div>
              <p className="text-sm text-foreground mb-4">Which best describes you?</p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <OptionButton label="Homeowner" onClick={() => handleCustomerType('homeowner')} />
                <OptionButton label="Contractor" onClick={() => handleCustomerType('contractor')} />
                <OptionButton label="Commercial" onClick={() => handleCustomerType('commercial')} />
              </div>
              <div className="flex gap-2 mt-3">
                <button
                  onClick={() => { setChatTab('ask'); logEvent('ask_from_zip_confirm'); }}
                  className="text-xs text-muted-foreground hover:text-foreground transition-colors"
                >
                  Ask a question instead
                </button>
              </div>
            </SystemMessage>
          </>
        );

      case 'project':
        return (
          <>
            <UserBubble text={state.customerType === 'homeowner' ? 'Homeowner' : state.customerType === 'contractor' ? 'Contractor' : 'Commercial'} />
            <SystemMessage>
              <p className="text-sm text-foreground mb-4">What type of project is this?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {PROJECT_TYPES[state.customerType!].map(p => (
                  <OptionButton key={p} label={p} onClick={() => handleProject(p)} />
                ))}
              </div>
            </SystemMessage>
          </>
        );

      case 'material':
        return (
          <>
            <UserBubble text={state.projectType!} />
            <SystemMessage>
              <p className="text-sm text-foreground mb-4">What material are you disposing?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                {MATERIAL_TYPES.map(m => (
                  <OptionButton key={m.id} label={m.label} onClick={() => handleMaterial(m.id)} />
                ))}
              </div>
            </SystemMessage>
          </>
        );

      case 'size': {
        const recommended = state.photoAnalysis?.recommendedSize || getSizeRecommendation(state.projectType, state.heavy);
        const availableSizes = state.heavy ? HEAVY_SIZES : GENERAL_SIZES;
        const materialLabel = MATERIAL_TYPES.find(m => m.id === state.materialType)?.label || '';

        return (
          <>
            <UserBubble text={materialLabel || 'Select size'} />
            <SystemMessage>
              {state.heavy && (
                <div className="bg-[hsl(40_90%_95%)] border border-[hsl(40_60%_80%)] rounded-lg px-3 py-2 mb-4">
                  <p className="text-xs text-foreground font-medium">Heavy Material Notice</p>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    Heavy materials are restricted to 5, 8, and 10 yard containers with mandatory fill-line compliance.
                  </p>
                </div>
              )}
              <p className="text-sm text-foreground mb-4">Select your dumpster size:</p>
              <div className="grid grid-cols-1 gap-2">
                {availableSizes.map(s => {
                  const isRecommended = s === recommended;
                  const category = getMaterialCategory(state.materialType, state.heavy);
                  const { price } = getPriceByZip(state.zip, s, category);
                  return (
                    <button
                      key={s}
                      onClick={() => handleSize(s)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 border rounded-xl text-sm transition-all duration-200 text-left",
                        isRecommended
                          ? "border-primary bg-primary/5"
                          : "border-[hsl(220_10%_90%)] hover:border-primary/30 hover:bg-primary/[0.03]"
                      )}
                    >
                      <div>
                        <span className="font-medium text-foreground">{s} Yard</span>
                        {isRecommended && (
                          <span className="ml-2 text-xs text-primary font-medium">Recommended</span>
                        )}
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {getIncludedTons(s, state.heavy)} tons included &middot; 7-day rental
                        </p>
                      </div>
                      <span className="font-semibold text-foreground">${price}</span>
                    </button>
                  );
                })}
              </div>
            </SystemMessage>
          </>
        );
      }

      case 'price': {
        const materialLabel = MATERIAL_TYPES.find(m => m.id === state.materialType)?.label || 'General Debris';
        const tons = getIncludedTons(state.size!, state.heavy);

        return (
          <>
            <UserBubble text={`${state.size} Yard`} />
            <SystemMessage>
              <div className="border border-[hsl(220_10%_90%)] rounded-xl p-4 bg-white">
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <h3 className="text-base font-semibold text-foreground">{state.size} Yard Dumpster</h3>
                    <p className="text-xs text-muted-foreground mt-0.5">{materialLabel} &middot; {state.zip}</p>
                  </div>
                  <span className="text-2xl font-bold text-foreground">${state.price}</span>
                </div>
                <div className="space-y-1.5 mb-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" /> Delivery and pickup included
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" /> 7-day rental period
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" /> {tons} ton{tons > 1 ? 's' : ''} disposal included
                  </div>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Check className="w-3.5 h-3.5 text-primary" /> Overage: $165/ton beyond included weight
                  </div>
                </div>
              </div>
              <p className="text-sm text-foreground mt-4 mb-3">Would you like to reserve this dumpster now?</p>
              <div className="flex flex-col gap-2">
                <ActionButton label="Reserve & Schedule" onClick={handleReserve} variant="primary" icon={<CalendarDays className="w-4 h-4" />} />
                <ActionButton label="Hold Price" onClick={handleHoldPrice} variant="outline" icon={<Clock className="w-4 h-4" />} />
                <div className="flex gap-2">
                  <ActionButton label="Change Size" onClick={handleChangeSize} variant="ghost" />
                  <Button asChild variant="ghost" className="rounded-xl h-11 text-sm">
                    <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                      <Phone className="w-3.5 h-3.5 mr-2" /> Call Instead
                    </a>
                  </Button>
                </div>
              </div>
            </SystemMessage>
          </>
        );
      }

      case 'contact':
        return (
          <SystemMessage>
            <p className="text-sm text-foreground mb-1 font-medium">
              {state.bookingMode === 'hold'
                ? 'We will hold this price for you. Enter your details.'
                : 'You are 1 step away from scheduling.'}
            </p>
            <p className="text-xs text-muted-foreground mb-4">
              {state.bookingMode === 'hold'
                ? 'A team member will contact you shortly.'
                : 'We will finalize your delivery details next.'}
            </p>
            <div className="space-y-3">
              <input
                value={nameInput}
                onChange={(e) => setNameInput(e.target.value)}
                placeholder="Your name *"
                className="w-full bg-white border border-[hsl(220_10%_90%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                autoFocus
              />
              <div>
                <input
                  value={phoneInput}
                  onChange={(e) => { setPhoneInput(formatPhone(e.target.value)); setPhoneError(''); }}
                  placeholder="Phone number *"
                  type="tel"
                  className="w-full bg-white border border-[hsl(220_10%_90%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                />
                {phoneError && <p className="mt-1 text-xs text-destructive">{phoneError}</p>}
              </div>
              <input
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                placeholder="Email (optional)"
                type="email"
                className="w-full bg-white border border-[hsl(220_10%_90%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
              />
              <p className="text-[10px] leading-snug text-muted-foreground/70 px-1">
                By clicking continue, I consent to receive transactional messages from Calsan Dumpsters Pro at the phone number provided. Message frequency may vary. Message &amp; Data rates may apply. Reply HELP for help or STOP to opt-out.
              </p>
              <Button
                onClick={handleContactSubmit}
                disabled={!nameInput.trim() || phoneInput.replace(/\D/g, '').length < 10 || loading}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Continue'}
              </Button>
            </div>
          </SystemMessage>
        );

      // ============================================================
      // SCHEDULING STEP
      // ============================================================
      case 'schedule':
        return (
          <SystemMessage>
            <p className="text-sm text-foreground mb-1 font-medium">Choose your delivery date</p>
            <p className="text-xs text-muted-foreground mb-4">Select a weekday within the next 3 weeks.</p>

            <div className="border border-[hsl(220_10%_90%)] rounded-xl bg-white overflow-hidden mb-4">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={handleDateSelect}
                disabled={isDateDisabled}
                fromDate={getMinDeliveryDate()}
                toDate={getMaxDeliveryDate()}
                className="p-3 pointer-events-auto mx-auto"
              />
            </div>

            {state.deliveryDate && (
              <>
                <p className="text-sm text-foreground mb-3">
                  Delivery: <strong>{format(new Date(state.deliveryDate + 'T12:00:00'), 'EEEE, MMMM d')}</strong>
                </p>
                <p className="text-xs text-muted-foreground mb-2">Select a delivery window:</p>
                <div className="grid grid-cols-1 gap-2 mb-4">
                  {TIME_WINDOWS.map(w => (
                    <button
                      key={w.id}
                      onClick={() => handleWindowSelect(w.id)}
                      className={cn(
                        "flex items-center justify-between px-4 py-3 border rounded-xl text-sm transition-all duration-200",
                        selectedWindow === w.id
                          ? "border-primary bg-primary/5 text-primary"
                          : "border-[hsl(220_10%_90%)] hover:border-primary/30 hover:bg-primary/[0.03] text-foreground"
                      )}
                    >
                      <span className="font-medium">{w.label}</span>
                      <span className="text-xs text-muted-foreground">{w.time}</span>
                    </button>
                  ))}
                </div>

                <Button
                  onClick={handleScheduleSubmit}
                  disabled={!state.deliveryWindow}
                  className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
                >
                  Continue to Payment <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </>
            )}
          </SystemMessage>
        );

      // ============================================================
      // PAYMENT OPTIONS STEP
      // ============================================================
      case 'payment': {
        const depositAmount = Math.round((state.price! * 0.5) * 100) / 100;
        const windowLabel = TIME_WINDOWS.find(w => w.id === state.deliveryWindow)?.time || state.deliveryWindow;

        return (
          <SystemMessage>
            <p className="text-sm text-foreground mb-1 font-medium">Review & Pay</p>

            {/* Order summary */}
            <div className="border border-[hsl(220_10%_90%)] rounded-xl p-4 bg-white mb-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-foreground">{state.size} Yard Dumpster</h3>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    {MATERIAL_TYPES.find(m => m.id === state.materialType)?.label || 'General Debris'}
                  </p>
                </div>
                <span className="text-lg font-bold text-foreground">${state.price}</span>
              </div>
              <div className="space-y-1 text-xs text-muted-foreground">
                <div className="flex items-center gap-2">
                  <CalendarDays className="w-3.5 h-3.5" />
                  {state.deliveryDate && format(new Date(state.deliveryDate + 'T12:00:00'), 'EEEE, MMMM d')}
                </div>
                <div className="flex items-center gap-2">
                  <Clock className="w-3.5 h-3.5" />
                  {windowLabel}
                </div>
              </div>
            </div>

            <p className="text-sm text-foreground mb-3">How would you like to pay?</p>

            <div className="grid grid-cols-1 gap-2">
              <button
                onClick={() => handlePaymentOption('deposit')}
                disabled={loading}
                className="flex items-center justify-between px-4 py-3 border border-primary bg-primary/5 rounded-xl text-sm transition-all duration-200 hover:bg-primary/10"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-primary" />
                  <div className="text-left">
                    <span className="font-medium text-foreground">Pay Deposit</span>
                    <p className="text-xs text-muted-foreground mt-0.5">50% now, balance before delivery</p>
                  </div>
                </div>
                <span className="font-semibold text-primary">${depositAmount}</span>
              </button>

              <button
                onClick={() => handlePaymentOption('full')}
                disabled={loading}
                className="flex items-center justify-between px-4 py-3 border border-[hsl(220_10%_90%)] rounded-xl text-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <CreditCard className="w-4 h-4 text-muted-foreground" />
                  <div className="text-left">
                    <span className="font-medium text-foreground">Pay Full Amount</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Complete payment now</p>
                  </div>
                </div>
                <span className="font-semibold text-foreground">${state.price}</span>
              </button>

              <button
                onClick={() => handlePaymentOption('later')}
                disabled={loading}
                className="flex items-center justify-between px-4 py-3 border border-[hsl(220_10%_90%)] rounded-xl text-sm transition-all duration-200 hover:border-primary/30 hover:bg-primary/[0.03]"
              >
                <div className="flex items-center gap-3">
                  <Shield className="w-4 h-4 text-muted-foreground" />
                  <div className="text-left">
                    <span className="font-medium text-foreground">Reserve Now, Pay Later</span>
                    <p className="text-xs text-muted-foreground mt-0.5">Save your card on file later</p>
                  </div>
                </div>
              </button>
            </div>

            {loading && (
              <div className="flex items-center gap-2 mt-4 text-sm text-muted-foreground">
                <Loader2 className="w-4 h-4 animate-spin" />
                Setting up secure payment...
              </div>
            )}

            <div className="flex items-center gap-2 text-xs text-muted-foreground mt-4">
              <Lock className="w-3 h-3" />
              Secured with 256-bit encryption via Authorize.Net
            </div>
          </SystemMessage>
        );
      }

      // ============================================================
      // PAYMENT PROCESSING (iframe) STEP
      // ============================================================
      case 'payment-processing': {
        const paymentAmount = state.paymentOption === 'deposit'
          ? Math.round((state.price! * 0.5) * 100) / 100
          : state.price!;

        return (
          <SystemMessage>
            <div className="flex items-center gap-2 mb-3">
              <Lock className="w-4 h-4 text-primary" />
              <p className="text-sm text-foreground font-medium">Secure Payment — ${paymentAmount}</p>
            </div>

            {/* Payment iframe */}
            <div className="border border-[hsl(220_10%_90%)] rounded-xl overflow-hidden bg-white" style={{ minHeight: '400px' }}>
              <iframe
                name="chatPaymentFrame"
                title="Secure Payment"
                className="w-full border-0"
                style={{ height: '450px' }}
              />
            </div>

            {/* Hidden form to POST token to iframe */}
            {state.hostedFormUrl && state.hostedToken && (
              <form
                ref={paymentFormRef}
                method="POST"
                action={state.hostedFormUrl}
                target="chatPaymentFrame"
                style={{ display: 'none' }}
              >
                <input type="hidden" name="token" value={state.hostedToken} />
              </form>
            )}

            <div className="flex flex-col gap-2 mt-4">
              <Button
                onClick={handlePaymentComplete}
                className="w-full h-11 rounded-xl bg-primary hover:bg-primary/90 text-primary-foreground"
              >
                <Check className="w-4 h-4 mr-2" />
                I Have Completed Payment
              </Button>
              <button
                onClick={() => {
                  setState(prev => ({ ...prev, paymentOption: 'later', paymentConfirmed: false, step: 'booking-confirm' }));
                }}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors text-center"
              >
                Pay later instead
              </button>
            </div>
          </SystemMessage>
        );
      }

      // ============================================================
      // BOOKING CONFIRMATION
      // ============================================================
      case 'booking-confirm': {
        const windowLabel = TIME_WINDOWS.find(w => w.id === state.deliveryWindow)?.time || state.deliveryWindow;
        const isPaid = state.paymentConfirmed && state.paymentOption !== 'later';

        return (
          <SystemMessage>
            <div className="text-center py-4">
              <div className={cn(
                "w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-3",
                isPaid ? "bg-primary/10" : "bg-primary/10"
              )}>
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">
                {isPaid ? 'Payment Confirmed' : 'Reservation Confirmed'}
              </h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                {isPaid
                  ? 'Your dumpster has been reserved and payment received.'
                  : 'Your dumpster has been reserved. Payment will be collected before delivery.'}
              </p>

              {/* Order details card */}
              <div className="border border-[hsl(220_10%_90%)] rounded-xl p-4 bg-white text-left mb-4">
                {state.orderId && (
                  <div className="flex items-center justify-between mb-3 pb-3 border-b border-[hsl(220_10%_93%)]">
                    <span className="text-xs text-muted-foreground">Order ID</span>
                    <span className="text-xs font-mono text-foreground">{state.orderId.slice(0, 8).toUpperCase()}</span>
                  </div>
                )}
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Dumpster</span>
                    <span className="font-medium text-foreground">{state.size} Yard</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Total</span>
                    <span className="font-medium text-foreground">${state.price}</span>
                  </div>
                  {state.deliveryDate && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Delivery</span>
                      <span className="font-medium text-foreground">
                        {format(new Date(state.deliveryDate + 'T12:00:00'), 'MMM d, yyyy')}
                      </span>
                    </div>
                  )}
                  {windowLabel && (
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Window</span>
                      <span className="font-medium text-foreground">{windowLabel}</span>
                    </div>
                  )}
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Payment</span>
                    <span className={cn("font-medium", isPaid ? "text-primary" : "text-foreground")}>
                      {isPaid
                        ? `$${state.paymentOption === 'deposit' ? Math.round((state.price! * 0.5) * 100) / 100 : state.price} paid`
                        : 'Pay before delivery'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                {getFeatureFlag('ai_home.placement.enabled') && !state.placementSkipped && (
                  <ActionButton
                    label="Choose Placement on Map"
                    onClick={() => goTo('placement-offer')}
                    variant="primary"
                    icon={<MapPin className="w-4 h-4" />}
                  />
                )}
                <ActionButton label="Start Over" onClick={resetConversation} variant="outline" />
              </div>
            </div>
          </SystemMessage>
        );
      }

      // ============================================================
      // HOLD PRICE CONFIRMATION (legacy confirm)
      // ============================================================
      case 'confirm':
        return (
          <SystemMessage>
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Clock className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Price Held</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Your price of <strong>${state.price}</strong> for a {state.size}-yard dumpster in {state.zip} has been held.
                A team member will contact you shortly to finalize your reservation.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <ActionButton
                  label="Reserve & Schedule Now"
                  onClick={() => {
                    setState(prev => ({ ...prev, bookingMode: 'reserve', step: 'schedule' }));
                  }}
                  variant="primary"
                  icon={<CalendarDays className="w-4 h-4" />}
                />
                <ActionButton label="Start Over" onClick={resetConversation} variant="outline" />
              </div>
            </div>
          </SystemMessage>
        );

      // ============================================================
      // CONTRACTOR FAST OPTIONS
      // ============================================================
      case 'contractor-fast':
        return (
          <>
            <UserBubble text="Contractor" />
            <SystemMessage>
              <p className="text-sm text-foreground mb-4">What type of service do you need?</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                <OptionButton label="Single Job Quote" onClick={() => handleContractorFastOption('single_job')} />
                <OptionButton label="Multiple Dumpsters" onClick={() => handleContractorFastOption('multi_dumpster')} />
                <OptionButton label="Recurring Service" onClick={() => handleContractorFastOption('recurring')} />
                <OptionButton label="Live Load" onClick={() => handleContractorFastOption('live_load')} />
                <OptionButton label="Custom Quote Request" onClick={() => handleContractorFastOption('custom')} />
              </div>
            </SystemMessage>
          </>
        );

      // ============================================================
      // PLACEMENT OFFER (after booking confirmation)
      // ============================================================
      case 'placement-offer':
        return (
          <SystemMessage>
            <div className="text-center py-4">
              <MapPin className="w-8 h-8 text-primary mx-auto mb-3" />
              <h3 className="text-base font-semibold text-foreground">Mark Placement on Map</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                Show us exactly where you want the dumpster placed on your property.
                This helps our driver deliver to the right spot.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <ActionButton
                  label="Choose Placement"
                  onClick={() => {
                    logEvent('placement_chosen');
                    navigate(`/portal/quote/${state.orderId}?placement=1`);
                  }}
                  variant="primary"
                  icon={<MapPin className="w-4 h-4" />}
                />
                <ActionButton
                  label="Skip for Now"
                  onClick={() => {
                    logEvent('placement_skipped');
                    setState(prev => ({ ...prev, placementSkipped: true, step: 'booking-confirm' }));
                  }}
                  variant="outline"
                />
              </div>
            </div>
          </SystemMessage>
        );

      default:
        return null;
    }
  };

  return (
      <div className={cn("w-full max-w-[850px] mx-auto", className)}>
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] border border-[hsl(220_10%_93%)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-4 border-b border-[hsl(220_10%_93%)]">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {canGoBack && chatTab === 'guided' && (
                <button onClick={goBack} className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                  <ArrowLeft className="w-4 h-4 text-muted-foreground" />
                </button>
              )}
              <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
                <span className="text-xs font-bold text-primary-foreground">C</span>
              </div>
              <div>
                <span className="text-sm font-semibold text-foreground">Project Estimator</span>
              </div>
            </div>
            {chatTab === 'guided' && state.step !== 'zip' && state.step !== 'booking-confirm' && state.step !== 'confirm' && state.step !== 'photo-analyzing' && state.step !== 'payment-processing' && (
              <button onClick={resetConversation} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
                Start over
              </button>
            )}
          </div>
          {/* Tab toggle — more distinct active state */}
          <div className="flex mt-3 bg-muted/60 rounded-lg p-0.5">
            <button
              onClick={() => handleTabSwitch('guided')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                chatTab === 'guided'
                  ? "bg-white text-foreground shadow-sm border border-[hsl(220_10%_90%)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <Zap className="w-3 h-3" />
              Guided Quote
            </button>
            <button
              onClick={() => handleTabSwitch('ask')}
              className={cn(
                "flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all",
                chatTab === 'ask'
                  ? "bg-white text-foreground shadow-sm border border-[hsl(220_10%_90%)]"
                  : "text-muted-foreground hover:text-foreground"
              )}
            >
              <MessageSquare className="w-3 h-3" />
              Project Estimator
            </button>
          </div>
        </div>

        {/* Session Restore Banner */}
        {showRestoreBanner && chatTab === 'guided' && state.step === 'zip' && (
          <div className="px-5 py-3 bg-muted/50 border-b border-[hsl(220_10%_93%)] flex items-center justify-between">
            <p className="text-sm text-foreground">Continue where you left off?</p>
            <div className="flex gap-2">
              <button
                onClick={() => {
                  const restored = persisted.current;
                  if (restored) setState(restored);
                  setShowRestoreBanner(false);
                }}
                className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors"
              >
                Continue
              </button>
              <button
                onClick={() => {
                  resetConversation();
                  setShowRestoreBanner(false);
                }}
                className="px-3 py-1.5 text-xs font-medium text-muted-foreground hover:text-foreground transition-colors"
              >
                Start over
              </button>
            </div>
          </div>
        )}

        {chatTab === 'guided' ? (
          <>
            {/* Progress — minimal */}
            <div className="px-5 pt-3">
              <Progress value={progress} className="h-0.5 bg-[hsl(220_10%_95%)]" />
            </div>

            {/* Conversation Area */}
            <div
              ref={scrollRef}
              className="px-5 py-5 overflow-y-auto space-y-4"
              style={{ minHeight: '320px', maxHeight: 'calc(100vh - 420px)' }}
            >
              {renderStep()}
            </div>
          </>
        ) : (
          /* Ask a Question Mode — AI Project Estimator */
          <div className="px-5 py-5 space-y-3 overflow-y-auto" style={{ minHeight: '320px', maxHeight: 'calc(100vh - 420px)' }}>
            {askMessages.length === 0 && (
              <>
                <SystemMessage animate={false}>
                  <p className="text-sm text-foreground leading-relaxed">
                    {detectedLang === 'ES'
                      ? 'Describa su proyecto y le estimaré el volumen de escombro, los contenedores recomendados, y cómo ahorrar.'
                      : 'Describe your project and I will estimate debris volume, recommend the right dumpster plan, and show you how to save.'}
                  </p>
                </SystemMessage>
                {/* Example prompts */}
                <div className="flex flex-wrap gap-2">
                  {(detectedLang === 'ES' ? EXAMPLE_PROMPTS_ES : EXAMPLE_PROMPTS_EN).map((prompt, i) => (
                    <button
                      key={i}
                      onClick={() => handleAskSubmit(prompt)}
                      className="px-3 py-1.5 text-xs rounded-full border border-border bg-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-colors"
                    >
                      {prompt}
                    </button>
                  ))}
                </div>
              </>
            )}
            {askMessages.map((msg, i) => (
              msg.role === 'user'
                ? <UserBubble key={i} text={msg.text} />
                : <SystemMessage key={i}>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{msg.text}</p>
                    {/* Structured estimation card */}
                    {msg.estimation && (
                      <div className="mt-3 p-3 rounded-lg bg-muted/50 border border-border space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-medium text-foreground">
                            {detectedLang === 'ES' ? 'Estimacion del Proyecto' : 'Project Estimate'}
                          </span>
                          <span className="text-[10px] text-muted-foreground px-2 py-0.5 rounded-full bg-muted">
                            {detectedLang === 'ES' ? 'Estimado inicial' : 'Initial estimate'}
                          </span>
                        </div>
                        <div className="grid grid-cols-2 gap-2 text-xs">
                          <div>
                            <span className="text-muted-foreground">{detectedLang === 'ES' ? 'Volumen' : 'Volume'}</span>
                            <p className="font-semibold text-foreground">{msg.estimation.volume_min}–{msg.estimation.volume_max} yd³</p>
                          </div>
                          {msg.estimation.recommended_plan && (
                            <div>
                              <span className="text-muted-foreground">{detectedLang === 'ES' ? 'Plan' : 'Plan'}</span>
                              <p className="font-semibold text-foreground">{msg.estimation.recommended_plan}</p>
                            </div>
                          )}
                        </div>
                        {msg.estimation.heavy_mode && (
                          <div className="flex items-start gap-1.5 px-2 py-1.5 rounded bg-accent/50 border border-accent">
                            <span className="text-[10px] font-medium text-accent-foreground">
                              {detectedLang === 'ES'
                                ? 'Material pesado: solo contenedores de 5, 8 o 10 yardas. Tarifa fija sin excedentes de peso.'
                                : 'Heavy material: 5, 8, or 10 yard containers only. Flat rate with no weight overage.'}
                            </span>
                          </div>
                        )}
                        {msg.estimation.recyclable_materials && msg.estimation.recyclable_materials.length > 0 && (
                          <div>
                            <span className="text-[10px] text-muted-foreground">{detectedLang === 'ES' ? 'Separar para ahorrar' : 'Separate to save'}</span>
                            <div className="flex flex-wrap gap-1 mt-1">
                              {msg.estimation.recyclable_materials.map((m, j) => (
                                <span key={j} className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium capitalize">
                                  {m.replace(/_/g, ' ')}
                                </span>
                              ))}
                            </div>
                          </div>
                        )}
                        {msg.estimation.savings_tips && msg.estimation.savings_tips.length > 0 && (
                          <div className="pt-1.5 border-t border-border">
                            <span className="text-[10px] text-muted-foreground font-medium">
                              {detectedLang === 'ES' ? 'Consejos para ahorrar' : 'How to save'}
                            </span>
                            <ul className="mt-1 space-y-0.5">
                              {msg.estimation.savings_tips.slice(0, 3).map((tip, j) => (
                                <li key={j} className="flex items-start gap-1.5 text-[10px] text-foreground leading-snug">
                                  <Check className="w-3 h-3 text-primary flex-shrink-0 mt-0.5" />
                                  {tip}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                    {/* CTAs */}
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-[hsl(220_10%_93%)]">
                      <ActionButton
                        label={detectedLang === 'ES' ? 'Precio Exacto' : 'Get Exact Price'}
                        onClick={() => { setChatTab('guided'); logEvent('ai_tool_clicked', { tool: 'instant_price_from_ask' }); }}
                        variant="primary"
                        icon={<Zap className="w-3.5 h-3.5" />}
                      />
                      <ActionButton
                        label={detectedLang === 'ES' ? 'Subir Foto' : 'Upload Photo'}
                        onClick={() => {
                          setChatTab('guided');
                          if (state.zip && state.zipFound) {
                            setState(prev => ({ ...prev, photoPath: true, step: 'photo-upload' }));
                          }
                          logEvent('ai_tool_clicked', { tool: 'upload_photo_from_ask' });
                        }}
                        variant="outline"
                        icon={<Camera className="w-3.5 h-3.5" />}
                      />
                      <Button asChild variant="outline" className="rounded-xl h-11 text-sm border-[hsl(220_10%_90%)]">
                        <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                          <Phone className="w-3.5 h-3.5 mr-2" /> {detectedLang === 'ES' ? 'Llamar' : 'Call Us'}
                        </a>
                      </Button>
                    </div>
                  </SystemMessage>
            ))}
            {askLoading && (
              <SystemMessage>
                <div className="flex items-center gap-3 py-1">
                  <div className="flex gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '0ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '150ms' }} />
                    <span className="w-1.5 h-1.5 rounded-full bg-primary/60 animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                  <span className="text-xs text-muted-foreground">
                    {detectedLang === 'ES' ? 'Analizando proyecto' : 'Analyzing project'}
                  </span>
                </div>
              </SystemMessage>
            )}
            {/* Ask input */}
            <div className="flex gap-2 mt-2 pt-3 border-t border-[hsl(220_10%_93%)]">
              <input
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskSubmit()}
                placeholder={detectedLang === 'ES' ? 'Ej: Demoler una casa de 1,800 pies cuadrados en Oakland' : 'e.g. Demolish a 1,800 sq ft house in Oakland'}
                className="flex-1 bg-white border border-[hsl(220_10%_90%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                autoFocus
              />
              <Button
                onClick={() => handleAskSubmit()}
                disabled={!askInput.trim() || askLoading}
                className="h-11 rounded-xl bg-primary hover:bg-primary/90 px-5"
              >
                {askLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <ArrowRight className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        )}

        {/* Trust Microcopy */}
        <div className="px-5 py-3 border-t border-[hsl(220_10%_93%)] bg-muted/20">
          <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1">
            <a href="/privacy" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors">
              <Shield className="w-3 h-3" /> Privacy Policy
            </a>
            <a href="/terms" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-[10px] text-muted-foreground hover:text-primary transition-colors">
              <Check className="w-3 h-3" /> Terms of Service
            </a>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Shield className="w-3 h-3" /> Licensed & Insured
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Check className="w-3 h-3" /> Transparent Pricing
            </span>
            <span className="flex items-center gap-1.5 text-[10px] text-muted-foreground">
              <Lock className="w-3 h-3" /> Secure Checkout
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CalsanAIChat;
