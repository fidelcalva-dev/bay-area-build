// ============================================================
// QUOTE FLOW STATE MACHINE - Single Source of Truth
// ============================================================
import { useState, useCallback, useMemo, useEffect } from 'react';
import { analytics } from '@/lib/analytics';

// Step definitions
export type QuoteStep = 
  | 'location'    // Step 1
  | 'material'    // Step 2
  | 'size'        // Step 3
  | 'price'       // Step 4
  | 'notice'      // Step 5 (conditional)
  | 'confirm'     // Step 6
  | 'success';    // Post-order

// Material categories
export type MaterialCategory = 
  | 'GENERAL_DEBRIS' 
  | 'HEAVY_MATERIALS' 
  | 'YARD_WASTE' 
  | 'CLEAN_RECYCLING';

// Service types for heavy materials
export type HeavyServiceType = 'HEAVY_BASE' | 'GREEN_HALO' | null;

// Flow state
export interface QuoteFlowState {
  // Step tracking
  step: QuoteStep;
  stepIndex: number;
  
  // Location
  zip: string;
  marketCode: string | null;
  zoneId: string | null;
  zoneName: string | null;
  cityName: string | null;
  zoneMultiplier: number;
  yardId: string | null;
  yardName: string | null;
  distanceMiles: number | null;
  
  // Material
  materialCategory: MaterialCategory | null;
  materialCode: string | null;
  serviceType: HeavyServiceType;
  
  // Size
  sizeYd: number;
  
  // Computed quote
  computedPrice: number;
  includedTons: number;
  isFlatFee: boolean;
  
  // Flags
  isHeavy: boolean;
  requiresFillLine: boolean;
  showNoticeStep: boolean;
  isYardWaste: boolean;
  
  // Contact
  customerName: string;
  customerPhone: string;
  customerEmail: string;
  
  // Result
  quoteId: string | null;
  orderConfirmed: boolean;
  
  // Terms checkbox
  termsAccepted: boolean;
}

// Actions
export type QuoteFlowAction =
  | { type: 'SET_ZIP'; zip: string }
  | { type: 'SET_ZONE'; zoneId: string; zoneName: string; cityName?: string; multiplier: number }
  | { type: 'SET_YARD'; yardId: string; yardName: string; distanceMiles: number }
  | { type: 'CLEAR_ZONE' }
  | { type: 'SET_MATERIAL_CATEGORY'; category: MaterialCategory }
  | { type: 'SET_MATERIAL_CODE'; code: string }
  | { type: 'SET_SERVICE_TYPE'; serviceType: HeavyServiceType }
  | { type: 'SET_SIZE'; sizeYd: number }
  | { type: 'SET_PRICE'; price: number; includedTons: number; isFlatFee: boolean }
  | { type: 'SET_CONTACT'; name: string; phone: string; email: string }
  | { type: 'SET_TERMS_ACCEPTED'; accepted: boolean }
  | { type: 'SET_QUOTE_ID'; quoteId: string }
  | { type: 'CONFIRM_ORDER' }
  | { type: 'GO_TO_STEP'; step: QuoteStep }
  | { type: 'NEXT_STEP' }
  | { type: 'PREV_STEP' }
  | { type: 'RESET' };

// Step order (notice is conditional)
const STEP_ORDER: QuoteStep[] = ['location', 'material', 'size', 'price', 'notice', 'confirm', 'success'];

// Step index lookup
function getStepIndex(step: QuoteStep): number {
  return STEP_ORDER.indexOf(step);
}

// Initial state
const INITIAL_STATE: QuoteFlowState = {
  step: 'location',
  stepIndex: 0,
  zip: '',
  marketCode: null,
  zoneId: null,
  zoneName: null,
  cityName: null,
  zoneMultiplier: 1,
  yardId: null,
  yardName: null,
  distanceMiles: null,
  materialCategory: null,
  materialCode: null,
  serviceType: null,
  sizeYd: 20,
  computedPrice: 0,
  includedTons: 0,
  isFlatFee: false,
  isHeavy: false,
  requiresFillLine: false,
  showNoticeStep: false,
  isYardWaste: false,
  customerName: '',
  customerPhone: '',
  customerEmail: '',
  quoteId: null,
  orderConfirmed: false,
  termsAccepted: false,
};

// Reducer
function quoteFlowReducer(state: QuoteFlowState, action: QuoteFlowAction): QuoteFlowState {
  switch (action.type) {
    case 'SET_ZIP':
      return { ...state, zip: action.zip };
    
    case 'SET_ZONE':
      return {
        ...state,
        zoneId: action.zoneId,
        zoneName: action.zoneName,
        cityName: action.cityName || null,
        zoneMultiplier: action.multiplier,
      };
    
    case 'SET_YARD':
      return {
        ...state,
        yardId: action.yardId,
        yardName: action.yardName,
        distanceMiles: action.distanceMiles,
      };
    
    case 'CLEAR_ZONE':
      return {
        ...state,
        zoneId: null,
        zoneName: null,
        cityName: null,
        zoneMultiplier: 1,
        yardId: null,
        yardName: null,
        distanceMiles: null,
      };
    
    case 'SET_MATERIAL_CATEGORY': {
      const isHeavy = action.category === 'HEAVY_MATERIALS';
      const isYardWaste = action.category === 'YARD_WASTE';
      
      // Auto-adjust size for heavy
      let newSize = state.sizeYd;
      if (isHeavy && newSize > 10) {
        newSize = 10;
      }
      
      // Yard waste -> force to debris heavy internally
      const materialCode = isYardWaste ? 'GRASS_YARD_WASTE' : null;
      
      return {
        ...state,
        materialCategory: action.category,
        materialCode,
        isHeavy,
        isYardWaste,
        requiresFillLine: isHeavy,
        showNoticeStep: isHeavy || isYardWaste,
        serviceType: isHeavy && !isYardWaste ? 'HEAVY_BASE' : null,
        sizeYd: newSize,
      };
    }
    
    case 'SET_MATERIAL_CODE':
      return { ...state, materialCode: action.code };
    
    case 'SET_SERVICE_TYPE':
      return { ...state, serviceType: action.serviceType };
    
    case 'SET_SIZE':
      return { ...state, sizeYd: action.sizeYd };
    
    case 'SET_PRICE':
      return {
        ...state,
        computedPrice: action.price,
        includedTons: action.includedTons,
        isFlatFee: action.isFlatFee,
      };
    
    case 'SET_CONTACT':
      return {
        ...state,
        customerName: action.name,
        customerPhone: action.phone,
        customerEmail: action.email,
      };
    
    case 'SET_TERMS_ACCEPTED':
      return { ...state, termsAccepted: action.accepted };
    
    case 'SET_QUOTE_ID':
      return { ...state, quoteId: action.quoteId };
    
    case 'CONFIRM_ORDER':
      return { ...state, orderConfirmed: true };
    
    case 'GO_TO_STEP': {
      // Skip notice step if not needed
      let targetStep = action.step;
      if (targetStep === 'notice' && !state.showNoticeStep) {
        targetStep = 'confirm';
      }
      return {
        ...state,
        step: targetStep,
        stepIndex: getStepIndex(targetStep),
      };
    }
    
    case 'NEXT_STEP': {
      const currentIndex = getStepIndex(state.step);
      let nextIndex = currentIndex + 1;
      
      // Skip notice step if not needed
      if (STEP_ORDER[nextIndex] === 'notice' && !state.showNoticeStep) {
        nextIndex++;
      }
      
      if (nextIndex >= STEP_ORDER.length) {
        return state;
      }
      
      const nextStep = STEP_ORDER[nextIndex];
      return {
        ...state,
        step: nextStep,
        stepIndex: nextIndex,
      };
    }
    
    case 'PREV_STEP': {
      const currentIndex = getStepIndex(state.step);
      let prevIndex = currentIndex - 1;
      
      // Skip notice step going back
      if (STEP_ORDER[prevIndex] === 'notice' && !state.showNoticeStep) {
        prevIndex--;
      }
      
      if (prevIndex < 0) {
        return state;
      }
      
      const prevStep = STEP_ORDER[prevIndex];
      return {
        ...state,
        step: prevStep,
        stepIndex: prevIndex,
      };
    }
    
    case 'RESET':
      return INITIAL_STATE;
    
    default:
      return state;
  }
}

// Hook
export function useQuoteFlow() {
  const [state, dispatch] = useState<QuoteFlowState>(INITIAL_STATE);
  const [stepStartTime, setStepStartTime] = useState(Date.now());

  // Track step timing
  useEffect(() => {
    setStepStartTime(Date.now());
  }, [state.step]);

  // Dispatch wrapper with analytics
  const send = useCallback((action: QuoteFlowAction) => {
    // Track step changes
    if (action.type === 'NEXT_STEP' || action.type === 'GO_TO_STEP') {
      const duration = Date.now() - stepStartTime;
      analytics.quoteStepComplete(state.step, duration);
    }
    
    dispatch(prev => quoteFlowReducer(prev, action));
  }, [state.step, stepStartTime]);

  // Convenience methods
  const setZip = useCallback((zip: string) => send({ type: 'SET_ZIP', zip }), [send]);
  const setZone = useCallback((zoneId: string, zoneName: string, cityName: string | undefined, multiplier: number) => 
    send({ type: 'SET_ZONE', zoneId, zoneName, cityName, multiplier }), [send]);
  const setYard = useCallback((yardId: string, yardName: string, distanceMiles: number) =>
    send({ type: 'SET_YARD', yardId, yardName, distanceMiles }), [send]);
  const clearZone = useCallback(() => send({ type: 'CLEAR_ZONE' }), [send]);
  const setMaterialCategory = useCallback((category: MaterialCategory) =>
    send({ type: 'SET_MATERIAL_CATEGORY', category }), [send]);
  const setMaterialCode = useCallback((code: string) => send({ type: 'SET_MATERIAL_CODE', code }), [send]);
  const setServiceType = useCallback((serviceType: HeavyServiceType) =>
    send({ type: 'SET_SERVICE_TYPE', serviceType }), [send]);
  const setSize = useCallback((sizeYd: number) => send({ type: 'SET_SIZE', sizeYd }), [send]);
  const setPrice = useCallback((price: number, includedTons: number, isFlatFee: boolean) =>
    send({ type: 'SET_PRICE', price, includedTons, isFlatFee }), [send]);
  const setContact = useCallback((name: string, phone: string, email: string) =>
    send({ type: 'SET_CONTACT', name, phone, email }), [send]);
  const setTermsAccepted = useCallback((accepted: boolean) =>
    send({ type: 'SET_TERMS_ACCEPTED', accepted }), [send]);
  const setQuoteId = useCallback((quoteId: string) => send({ type: 'SET_QUOTE_ID', quoteId }), [send]);
  const confirmOrder = useCallback(() => send({ type: 'CONFIRM_ORDER' }), [send]);
  const goToStep = useCallback((step: QuoteStep) => send({ type: 'GO_TO_STEP', step }), [send]);
  const nextStep = useCallback(() => send({ type: 'NEXT_STEP' }), [send]);
  const prevStep = useCallback(() => send({ type: 'PREV_STEP' }), [send]);
  const reset = useCallback(() => send({ type: 'RESET' }), [send]);

  // Computed values
  const canGoNext = useMemo(() => {
    switch (state.step) {
      case 'location':
        return state.zip.length === 5 && !!state.zoneId;
      case 'material':
        return !!state.materialCategory;
      case 'size':
        return !!state.sizeYd;
      case 'price':
        return state.computedPrice > 0;
      case 'notice':
        return true;
      case 'confirm':
        return state.customerName && state.customerPhone && state.termsAccepted;
      default:
        return false;
    }
  }, [state]);

  // Progress (1-6)
  const progressStep = useMemo(() => {
    // Map internal steps to display steps (1-6)
    switch (state.step) {
      case 'location': return 1;
      case 'material': return 2;
      case 'size': return 3;
      case 'price': return 4;
      case 'notice': return 5;
      case 'confirm': return state.showNoticeStep ? 6 : 5;
      case 'success': return state.showNoticeStep ? 6 : 5;
      default: return 1;
    }
  }, [state.step, state.showNoticeStep]);

  const totalSteps = state.showNoticeStep ? 6 : 5;

  return {
    state,
    send,
    // Convenience methods
    setZip,
    setZone,
    setYard,
    clearZone,
    setMaterialCategory,
    setMaterialCode,
    setServiceType,
    setSize,
    setPrice,
    setContact,
    setTermsAccepted,
    setQuoteId,
    confirmOrder,
    goToStep,
    nextStep,
    prevStep,
    reset,
    // Computed
    canGoNext,
    progressStep,
    totalSteps,
  };
}

export type QuoteFlowReturn = ReturnType<typeof useQuoteFlow>;
