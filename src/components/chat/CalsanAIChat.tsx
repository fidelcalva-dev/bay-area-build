// ============================================================
// CALSAN AI — Structured Conversation Engine + Booking Engine
// Decision tree: ZIP → Type → Project → Material → Size → Price → Contact → Schedule → Payment → Confirm
// + Photo Upload path: ZIP → Photo → Result → Size → Price → Contact → Schedule → Payment → Confirm
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, Phone, Upload, Check, Camera, Lock, CreditCard, CalendarDays, Clock, Shield, MapPin, MessageSquare, Zap } from 'lucide-react';
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

const GENERAL_SIZES = [10, 15, 20, 25, 30, 40];
const HEAVY_SIZES = [8, 10];

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
  if (p.includes('cleanout') || p.includes('yard')) return 15;
  if (p.includes('remodel') || p.includes('framing')) return 20;
  if (p.includes('roofing')) return 20;
  if (p.includes('demo') || p.includes('construction') || p.includes('warehouse') || p.includes('large')) return 30;
  return 20;
}

function getIncludedTons(size: number, heavy: boolean): number {
  if (heavy) return size === 8 ? 4 : 5;
  if (size <= 10) return 1;
  if (size <= 15) return 2;
  if (size <= 20) return 3;
  if (size <= 25) return 3;
  if (size <= 30) return 4;
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

// ---- Safe Answer Generator (no secrets exposed) ----
function generateSafeAnswer(question: string): string {
  const q = question.toLowerCase();
  if (q.includes('heavy') || q.includes('concrete') || q.includes('dirt') || q.includes('soil') || q.includes('rock') || q.includes('brick')) {
    return 'Heavy materials such as concrete, dirt, soil, and asphalt are restricted to 6-10 yard containers. These have a mandatory fill-line — you cannot exceed it. Included tonnage is typically 4-5 tons depending on size. Overage charges apply beyond included weight.\n\nWould you like exact pricing for your ZIP?';
  }
  if (q.includes('ton') || q.includes('weight') || q.includes('included') || q.includes('overage')) {
    return 'Each dumpster includes a set amount of disposal tonnage (typically 1-5 tons depending on size and material). If your debris exceeds the included weight, an overage charge of $165 per additional ton applies. The included tons are clearly shown during the quote process.\n\nWould you like exact pricing for your ZIP?';
  }
  if (q.includes('day') || q.includes('rental') || q.includes('how long') || q.includes('keep')) {
    return 'Standard rental period is 7 days. Extensions are available and priced per day. Contact dispatch for extended rental arrangements.\n\nWould you like exact pricing for your ZIP?';
  }
  if (q.includes('price') || q.includes('cost') || q.includes('how much') || q.includes('rate')) {
    return 'Pricing varies by ZIP code, dumpster size, and material type. We offer transparent, all-inclusive pricing with no hidden fees. Use the Guided Quote to see your exact price in seconds.\n\nWould you like exact pricing for your ZIP?';
  }
  if (q.includes('size') || q.includes('yard') || q.includes('which dumpster') || q.includes('recommend')) {
    return 'For most residential cleanouts, a 15-20 yard dumpster is sufficient. Remodels and construction typically need 20-30 yards. Heavy materials are limited to 6-10 yard containers. Upload a photo for a personalized AI recommendation.\n\nWould you like exact pricing for your ZIP?';
  }
  if (q.includes('deliver') || q.includes('schedule') || q.includes('when') || q.includes('pickup') || q.includes('next day')) {
    return 'We deliver Monday through Friday. Next-business-day delivery is available in most service areas. You can choose your preferred delivery window during booking: Morning, Midday, or Afternoon.\n\nWould you like exact pricing for your ZIP?';
  }
  if (q.includes('pay') || q.includes('payment') || q.includes('deposit') || q.includes('credit card')) {
    return 'We accept all major credit cards. You can pay a 50% deposit to reserve, pay in full, or reserve now and pay before delivery. All payments are processed securely through Authorize.Net with 256-bit encryption.\n\nWould you like exact pricing for your ZIP?';
  }
  return 'I can help with dumpster sizes, material rules, pricing guidance, rental periods, and scheduling. For exact pricing, use the Guided Quote — it takes about 30 seconds and shows your all-inclusive price.\n\nWould you like exact pricing for your ZIP?';
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
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(undefined);
  const [selectedWindow, setSelectedWindow] = useState<string | null>(null);
  const [chatTab, setChatTab] = useState<ChatTab>('guided');
  const [askInput, setAskInput] = useState('');
  const [askMessages, setAskMessages] = useState<Array<{ role: 'user' | 'assistant'; text: string }>>([]);
  const [askLoading, setAskLoading] = useState(false);
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

  // ---- Ask a Question handler ----
  const handleAskSubmit = async () => {
    const q = askInput.trim();
    if (!q || askLoading) return;
    logEvent('ai_question_submitted', { question: q });
    setAskMessages(prev => [...prev, { role: 'user', text: q }]);
    setAskInput('');
    setAskLoading(true);

    // Generate a professional answer about dumpster rental (no secrets)
    const safeAnswer = generateSafeAnswer(q);
    await new Promise(r => setTimeout(r, 600)); // simulate brief thinking
    setAskMessages(prev => [...prev, { role: 'assistant', text: safeAnswer }]);
    setAskLoading(false);
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
      if (getFeatureFlag('ai_home.photo_upload.enabled')) {
        setChatTab('guided');
        if (state.zip && state.zipFound) {
          setState(prev => ({ ...prev, photoPath: true, step: 'photo-upload' }));
        }
        // If no ZIP yet, stay on ZIP step — user enters ZIP first
      }
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
          source_channel: 'AI_ASSISTANT',
          source_detail: state.photoPath ? 'photo_flow' : 'structured_flow',
          customer_name: name,
          phone: phoneInput,
          email: emailInput.trim() || null,
          zip_code: state.zip,
          notes: [
            state.customerType ? `Type: ${state.customerType}` : null,
            state.projectType ? `Project: ${state.projectType}` : null,
            `Material: ${MATERIAL_TYPES.find(m => m.id === state.materialType)?.label || state.materialType || 'Not specified'}`,
            `Size: ${state.size}yd`,
            `Price: $${state.price}`,
            state.photoAnalysis ? `Photo confidence: ${state.photoAnalysis.confidence}%` : null,
          ].filter(Boolean).join('. '),
          priority: 'MEDIUM',
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

    setLoading(true);
    setState(prev => ({ ...prev, step: 'photo-analyzing' }));
    logEvent('photo_uploaded', { fileSize: file.size, fileType: file.type });

    try {
      const base64 = await compressImage(file);

      const fileName = `photo_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.jpg`;
      try {
        await supabase.storage.from('waste-uploads').upload(fileName, file, {
          contentType: file.type,
          upsert: false,
        });
      } catch { /* non-blocking */ }

      const { data, error } = await supabase.functions.invoke('analyze-waste', {
        body: { images: [base64] },
      });

      if (error) throw error;

      const rec = data?.recommendation;
      const materials = data?.analysis?.materials || data?.materials || [];
      const primaryMaterial = materials[0]?.name || rec?.materialCategory || 'general debris';
      const confidence = Math.round((rec?.confidence || 0.7) * 100);
      const recommendedSize = rec?.recommendedSize || 20;
      const explanation = rec?.explanation || `Pile estimated at approximately ${recommendedSize} cubic yards.`;

      const detected = mapDetectedMaterial(primaryMaterial);

      const analysis: PhotoAnalysis = {
        recommendedSize,
        confidence,
        materialType: primaryMaterial,
        explanation,
        heavy: detected.heavy,
      };

      logEvent('photo_analyzed', {
        confidence,
        recommendedSize,
        material: primaryMaterial,
        heavy: detected.heavy,
      });

      setState(prev => ({
        ...prev,
        photoAnalysis: analysis,
        materialType: detected.id,
        heavy: detected.heavy,
        step: 'photo-result',
      }));
    } catch (err) {
      console.error('Photo analysis failed:', err);
      setState(prev => ({
        ...prev,
        photoPath: false,
        photoAnalysis: null,
        step: 'customer-type',
      }));
    } finally {
      setLoading(false);
    }
  }, [logEvent]);

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
                ? 'Choose how you\'d like to get started:'
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
                      Instant Price (60 seconds)
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight pl-5.5">
                      Exact price by ZIP, including delivery and included disposal.
                    </span>
                  </button>
                  <button
                    onClick={() => handleQuickTool('upload_photo')}
                    disabled={!getFeatureFlag('ai_home.photo_upload.enabled')}
                    className={cn(
                      "flex flex-col items-start gap-1 px-3 py-3 border border-[hsl(220_10%_90%)] rounded-xl text-left transition-all",
                      getFeatureFlag('ai_home.photo_upload.enabled')
                        ? "hover:border-primary/30 hover:bg-primary/[0.03]"
                        : "opacity-50 cursor-not-allowed"
                    )}
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Camera className="w-3.5 h-3.5 flex-shrink-0" />
                      Upload Photo
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight pl-5.5">
                      AI size recommendation based on your debris.
                    </span>
                  </button>
                  <a
                    href={`tel:${BUSINESS_INFO.phone.sales}`}
                    onClick={() => logEvent('ai_tool_clicked', { tool: 'talk_to_dispatch' })}
                    className="flex flex-col items-start gap-1 px-3 py-3 border border-[hsl(220_10%_90%)] rounded-xl text-left hover:border-primary/30 hover:bg-primary/[0.03] transition-all"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-foreground">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
                      Talk to Dispatch
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight pl-5.5">
                      Fast answers from a live team member.
                    </span>
                  </a>
                  <button
                    onClick={() => handleQuickTool('book_now')}
                    className="flex flex-col items-start gap-1 px-3 py-3 border border-primary bg-primary/5 rounded-xl text-left hover:bg-primary/10 transition-all"
                  >
                    <span className="flex items-center gap-2 text-xs font-medium text-primary">
                      <CalendarDays className="w-3.5 h-3.5 flex-shrink-0" />
                      Book & Schedule Now
                    </span>
                    <span className="text-[10px] text-muted-foreground leading-tight pl-5.5">
                      Go straight to size selection and checkout.
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
                        <p className="text-xs text-muted-foreground mt-0.5">Get an AI size recommendation</p>
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
              <p className="text-sm text-foreground mb-4">
                Take a photo of your debris pile. I will estimate the correct dumpster size.
              </p>
              <div
                onClick={() => fileRef.current?.click()}
                className="border-2 border-dashed border-[hsl(220_10%_88%)] rounded-xl p-8 text-center cursor-pointer hover:border-primary/30 transition-colors"
              >
                <Upload className="w-7 h-7 text-muted-foreground mx-auto mb-2" strokeWidth={1.5} />
                <p className="text-sm font-medium text-foreground">Tap to upload a photo</p>
                <p className="text-xs text-muted-foreground mt-1">JPG, PNG accepted</p>
                <input
                  ref={fileRef}
                  type="file"
                  accept="image/jpeg,image/png,image/webp"
                  capture="environment"
                  className="hidden"
                  onChange={(e) => e.target.files && handlePhotoUpload(e.target.files)}
                />
              </div>
              <div className="mt-3">
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
            <UserBubble text="Photo uploaded" />
            {photoPreview && (
              <div className="flex justify-end animate-in fade-in-0 duration-200">
                <div className="rounded-xl overflow-hidden max-w-[200px] border border-[hsl(220_10%_90%)]">
                  <img src={photoPreview} alt="Uploaded debris" className="w-full h-auto" />
                </div>
              </div>
            )}
            <SystemMessage>
              <div className="flex items-center gap-3 py-2">
                <Loader2 className="w-5 h-5 text-primary animate-spin" />
                <div>
                  <p className="text-sm text-foreground font-medium">Analyzing your photo</p>
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
                <div>
                  <p className="text-sm text-foreground mb-2">
                    Photo analysis was inconclusive ({analysis.confidence}% confidence).
                    Please select your dumpster size manually for the most accurate recommendation.
                  </p>
                  <div className="flex flex-col sm:flex-row gap-2 mt-3">
                    <ActionButton label="Select Size Manually" onClick={handlePhotoManualSelect} variant="primary" />
                    <Button asChild variant="ghost" className="rounded-xl h-11 text-sm">
                      <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                        <Phone className="w-3.5 h-3.5 mr-2" /> Talk to Specialist
                      </a>
                    </Button>
                  </div>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-foreground mb-3">Based on your photo, I recommend:</p>
                  <div className="border border-[hsl(220_10%_90%)] rounded-xl p-4 bg-white">
                    <div className="flex items-start justify-between mb-2">
                      <div>
                        <h3 className="text-base font-semibold text-foreground">
                          {analysis.recommendedSize} Yard Dumpster
                        </h3>
                        <p className="text-xs text-muted-foreground mt-0.5 capitalize">
                          {analysis.materialType}
                        </p>
                      </div>
                      <span className="text-lg font-bold text-foreground">${price}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mb-3">{analysis.explanation}</p>
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide">Confidence</span>
                      <span className="text-xs font-semibold text-foreground">{analysis.confidence}%</span>
                    </div>
                    <Progress value={analysis.confidence} className="h-1.5 bg-[hsl(220_10%_93%)]" />
                    {state.heavy && (
                      <div className="bg-[hsl(40_90%_95%)] border border-[hsl(40_60%_80%)] rounded-lg px-3 py-2 mt-3">
                        <p className="text-xs text-foreground font-medium">Heavy Material Detected</p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          Sizes restricted to 6-10 yard containers. Fill-line compliance required.
                        </p>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col sm:flex-row gap-2 mt-4">
                    <ActionButton
                      label="Accept Recommendation"
                      onClick={handleAcceptPhotoRecommendation}
                      variant="primary"
                      icon={<Check className="w-4 h-4" />}
                    />
                    <ActionButton
                      label="See Larger Option"
                      onClick={handleSeeLargerOption}
                      variant="outline"
                    />
                    <Button asChild variant="ghost" className="rounded-xl h-11 text-sm">
                      <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                        <Phone className="w-3.5 h-3.5 mr-2" /> Talk to Specialist
                      </a>
                    </Button>
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
                    Heavy materials are restricted to 6-10 yard containers with mandatory fill-line compliance.
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
                <span className="text-sm font-semibold text-foreground">Calsan Dumpster Advisor</span>
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
              Ask a Question
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
          /* Ask a Question Mode */
          <div className="px-5 py-5 space-y-3 overflow-y-auto" style={{ minHeight: '320px', maxHeight: 'calc(100vh - 420px)' }}>
            {askMessages.length === 0 && (
              <SystemMessage animate={false}>
                <p className="text-sm text-foreground leading-relaxed">
                  Ask me anything about dumpster sizes, materials, pricing rules, rental periods, or scheduling. I will answer concisely and professionally.
                </p>
              </SystemMessage>
            )}
            {askMessages.map((msg, i) => (
              msg.role === 'user'
                ? <UserBubble key={i} text={msg.text} />
                : <SystemMessage key={i}>
                    <p className="text-sm text-foreground leading-relaxed whitespace-pre-line">{msg.text}</p>
                    <div className="flex flex-col sm:flex-row gap-2 mt-3 pt-3 border-t border-[hsl(220_10%_93%)]">
                      <ActionButton
                        label="Get Instant Price"
                        onClick={() => { setChatTab('guided'); logEvent('ai_tool_clicked', { tool: 'instant_price_from_ask' }); }}
                        variant="primary"
                        icon={<Zap className="w-3.5 h-3.5" />}
                      />
                      <Button asChild variant="outline" className="rounded-xl h-11 text-sm border-[hsl(220_10%_90%)]">
                        <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                          <Phone className="w-3.5 h-3.5 mr-2" /> Talk to Dispatch
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
                  <span className="text-xs text-muted-foreground">Preparing response</span>
                </div>
              </SystemMessage>
            )}
            {/* Ask input */}
            <div className="flex gap-2 mt-2 pt-3 border-t border-[hsl(220_10%_93%)]">
              <input
                value={askInput}
                onChange={(e) => setAskInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleAskSubmit()}
                placeholder="Ask anything about dumpsters, materials, pricing rules, or scheduling..."
                className="flex-1 bg-white border border-[hsl(220_10%_90%)] rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground/60 focus:outline-none focus:border-primary/40 focus:ring-1 focus:ring-primary/20 transition-all"
                autoFocus
              />
              <Button
                onClick={handleAskSubmit}
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
