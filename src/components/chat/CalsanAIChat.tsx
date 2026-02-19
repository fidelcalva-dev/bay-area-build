// ============================================================
// CALSAN AI — Structured Conversation Engine
// 8-step decision tree: ZIP → Type → Project → Material → Size → Price → Contact → Confirm
// ============================================================
import { useState, useRef, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, ArrowLeft, Loader2, Phone, Upload, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { cn } from '@/lib/utils';
import { supabase } from '@/integrations/supabase/client';
import { BUSINESS_INFO } from '@/lib/shared-data';
import { getPriceByZip } from '@/lib/price-list-data';

// ============================================================
// TYPES & CONSTANTS
// ============================================================

export type ChatMode = 'default' | 'sales' | 'commercial' | 'contractor';

type FlowStep = 'zip' | 'customer-type' | 'project' | 'material' | 'size' | 'price' | 'contact' | 'confirm';

const STEPS: FlowStep[] = ['zip', 'customer-type', 'project', 'material', 'size', 'price', 'contact', 'confirm'];

interface ConversationMessage {
  id: string;
  role: 'system' | 'user';
  content: string;
  component?: React.ReactNode;
}

type CustomerType = 'homeowner' | 'contractor' | 'commercial';

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
};

const STORAGE_KEY = 'calsan_structured_chat_v1';
const STATE_TTL_MS = 30 * 60 * 1000;

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
  const scrollRef = useRef<HTMLDivElement>(null);
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
  }, [state.step]);

  const stepIndex = STEPS.indexOf(state.step);
  const progress = Math.round(((stepIndex + 1) / STEPS.length) * 100);

  const goTo = (step: FlowStep) => setState(prev => ({ ...prev, step }));

  const canGoBack = stepIndex > 0 && state.step !== 'confirm';

  const goBack = () => {
    if (stepIndex > 0) goTo(STEPS[stepIndex - 1]);
  };

  const resetConversation = useCallback(() => {
    setState({ ...INITIAL_STATE });
    setZipInput('');
    setNameInput('');
    setPhoneInput('');
    setEmailInput('');
    setZipError('');
    setPhoneError('');
    localStorage.removeItem(STORAGE_KEY);
  }, []);

  // ---- Step Handlers ----

  const handleZipSubmit = async () => {
    const zip = zipInput.trim();
    if (!ZIP_RE.test(zip)) { setZipError('Please enter a valid 5-digit ZIP code.'); return; }
    setZipError('');
    setLoading(true);
    logEvent('step_zip', { zip });

    // Validate service area via price lookup
    const result = getPriceByZip(zip, 20, 'GENERAL');
    setLoading(false);

    if (!result.zipFound || result.price === 0) {
      setZipError('This ZIP code is outside our current service area. Call us for a custom quote.');
      return;
    }

    setState(prev => ({ ...prev, zip, zipFound: true, step: 'customer-type' }));
  };

  const handleCustomerType = (type: CustomerType) => {
    logEvent('step_customer_type', { type });
    setState(prev => ({ ...prev, customerType: type, step: 'project' }));
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

  const handleReserve = () => goTo('contact');

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
    logEvent('step_contact', { hasEmail: !!emailInput.trim() });

    try {
      await supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'AI_ASSISTANT',
          source_detail: 'structured_flow',
          customer_name: name,
          phone: phoneInput,
          email: emailInput.trim() || null,
          zip_code: state.zip,
          notes: [
            `Type: ${state.customerType}`,
            `Project: ${state.projectType}`,
            `Material: ${MATERIAL_TYPES.find(m => m.id === state.materialType)?.label || state.materialType}`,
            `Size: ${state.size}yd`,
            `Price: $${state.price}`,
          ].join('. '),
          priority: 'MEDIUM',
        },
      });
    } catch { /* silent */ }

    setState(prev => ({
      ...prev,
      name, phone: phoneInput, email: emailInput.trim(),
      leadCreated: true, step: 'confirm',
    }));
    setLoading(false);
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

  // ============================================================
  // STEP RENDERS
  // ============================================================

  const renderStep = () => {
    switch (state.step) {
      case 'zip':
        return (
          <SystemMessage>
            <p className="text-sm text-foreground leading-relaxed">
              {showWelcome
                ? 'Welcome to Calsan Dumpsters Pro.\n\nPlease enter your ZIP code so I can calculate exact pricing.'
                : ''}
            </p>
            {showWelcome && (
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
            )}
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
          </SystemMessage>
        );

      case 'customer-type':
        return (
          <>
            <UserBubble text={state.zip} />
            <SystemMessage>
              <p className="text-sm text-foreground mb-4">
                Service confirmed for {state.zip}. Which best describes you?
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                <OptionButton label="Homeowner" onClick={() => handleCustomerType('homeowner')} />
                <OptionButton label="Contractor" onClick={() => handleCustomerType('contractor')} />
                <OptionButton label="Commercial" onClick={() => handleCustomerType('commercial')} />
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
        const recommended = getSizeRecommendation(state.projectType, state.heavy);
        const availableSizes = state.heavy ? HEAVY_SIZES : GENERAL_SIZES;
        const materialLabel = MATERIAL_TYPES.find(m => m.id === state.materialType)?.label || '';

        return (
          <>
            <UserBubble text={materialLabel} />
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
              <div className="flex flex-col sm:flex-row gap-2 mt-4">
                <ActionButton label="Reserve This Dumpster" onClick={handleReserve} variant="primary" icon={<ArrowRight className="w-4 h-4" />} />
                <ActionButton label="Change Size" onClick={handleChangeSize} variant="outline" />
                <Button asChild variant="ghost" className="rounded-xl h-11 text-sm">
                  <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                    <Phone className="w-3.5 h-3.5 mr-2" /> Call Instead
                  </a>
                </Button>
              </div>
            </SystemMessage>
          </>
        );
      }

      case 'contact':
        return (
          <SystemMessage>
            <p className="text-sm text-foreground mb-1 font-medium">You are 1 step away from confirmation.</p>
            <p className="text-xs text-muted-foreground mb-4">We will reach out shortly to finalize your delivery.</p>
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
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Submit'}
              </Button>
            </div>
          </SystemMessage>
        );

      case 'confirm':
        return (
          <SystemMessage>
            <div className="text-center py-4">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                <Check className="w-6 h-6 text-primary" />
              </div>
              <h3 className="text-base font-semibold text-foreground">Request Submitted</h3>
              <p className="text-sm text-muted-foreground mt-1 mb-4">
                A team member will contact you shortly to finalize your {state.size}-yard dumpster rental for {state.zip}.
              </p>
              <div className="flex flex-col sm:flex-row gap-2 justify-center">
                <ActionButton
                  label="Continue to Booking"
                  onClick={() => {
                    const params = new URLSearchParams({ v3: '1' });
                    if (state.zip) params.set('zip', state.zip);
                    if (state.size) params.set('size', String(state.size));
                    if (state.materialType) params.set('material', state.materialType);
                    navigate(`/quote?${params.toString()}`);
                  }}
                  variant="primary"
                  icon={<ArrowRight className="w-4 h-4" />}
                />
                <ActionButton label="Start Over" onClick={resetConversation} variant="outline" />
              </div>
            </div>
          </SystemMessage>
        );

      default:
        return null;
    }
  };

  const UserBubble = ({ text }: { text: string }) => (
    <div className="flex justify-end animate-in fade-in-0 slide-in-from-bottom-2 duration-200">
      <div className="bg-[hsl(220_10%_92%)] rounded-xl px-4 py-2.5 max-w-[85%]">
        <p className="text-sm text-foreground">{text}</p>
      </div>
    </div>
  );

  return (
    <div className={cn("w-full max-w-[850px] mx-auto", className)}>
      <div className="bg-white rounded-2xl shadow-[0_4px_24px_-4px_rgba(0,0,0,0.08)] border border-[hsl(220_10%_93%)] overflow-hidden">
        {/* Header */}
        <div className="px-5 py-3.5 border-b border-[hsl(220_10%_93%)] flex items-center justify-between">
          <div className="flex items-center gap-3">
            {canGoBack && (
              <button onClick={goBack} className="p-1.5 -ml-1.5 rounded-lg hover:bg-muted/50 transition-colors">
                <ArrowLeft className="w-4 h-4 text-muted-foreground" />
              </button>
            )}
            <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center">
              <span className="text-xs font-bold text-primary-foreground">C</span>
            </div>
            <div>
              <span className="text-sm font-semibold text-foreground">Calsan</span>
              <span className="text-xs text-muted-foreground ml-2">Dumpster Advisor</span>
            </div>
          </div>
          {state.step !== 'zip' && state.step !== 'confirm' && (
            <button onClick={resetConversation} className="text-xs text-muted-foreground hover:text-foreground transition-colors">
              Start over
            </button>
          )}
        </div>

        {/* Progress */}
        <div className="px-5 pt-3">
          <Progress value={progress} className="h-1 bg-[hsl(220_10%_93%)]" />
          <p className="text-[10px] text-muted-foreground mt-1.5 text-right">
            Step {stepIndex + 1} of {STEPS.length}
          </p>
        </div>

        {/* Conversation Area */}
        <div
          ref={scrollRef}
          className="px-5 py-5 overflow-y-auto space-y-4"
          style={{ minHeight: '320px', maxHeight: 'calc(100vh - 380px)' }}
        >
          {renderStep()}
        </div>
      </div>
    </div>
  );
}

export default CalsanAIChat;
