// Auto-Detect Customer Type Hook
// Scores signals to determine customer type with confidence

import { useState, useEffect, useMemo, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

// ============================================================
// TYPES
// ============================================================

export type CustomerType = 'homeowner' | 'contractor' | 'business' | 'preferred_contractor' | 'wholesaler';

export interface DetectionSignal {
  ruleCode: string;
  ruleName: string;
  signalType: string;
  matchedValue: string | boolean;
  outputType: CustomerType;
  weight: number;
}

export interface DetectionResult {
  detectedType: CustomerType;
  confidenceScore: number;
  confidenceLevel: 'high' | 'medium' | 'low';
  signals: DetectionSignal[];
  wasAutoDetected: boolean;
}

export interface CustomerTypeRule {
  id: string;
  rule_code: string;
  rule_name: string;
  signal_type: string;
  conditions_json: {
    domains?: string[];
    pattern?: string;
    patterns?: string[];
    has_value?: boolean;
    min_quantity?: number;
    is_recurring?: boolean;
    same_day?: boolean;
    multiple_jobs?: boolean;
    selected_type?: string;
  };
  output_customer_type: CustomerType;
  weight: number;
}

export interface DetectionInputs {
  email?: string;
  companyName?: string;
  quantity?: number;
  isRecurring?: boolean;
  isSameDay?: boolean;
  hasMultipleJobs?: boolean;
  projectDescription?: string;
  explicitSelection?: CustomerType | null;
}

// Personal email domains that indicate homeowner
const PERSONAL_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 
  'icloud.com', 'aol.com', 'live.com', 'msn.com', 'me.com'
];

// ============================================================
// DETECTION LOGIC
// ============================================================

function getEmailDomain(email: string): string | null {
  if (!email || !email.includes('@')) return null;
  return email.split('@')[1]?.toLowerCase() || null;
}

function isCompanyEmail(email: string): boolean {
  const domain = getEmailDomain(email);
  if (!domain) return false;
  return !PERSONAL_EMAIL_DOMAINS.includes(domain);
}

function matchesPatterns(text: string, patterns: string[]): boolean {
  if (!text) return false;
  const lowerText = text.toLowerCase();
  return patterns.some(pattern => lowerText.includes(pattern.toLowerCase()));
}

// ============================================================
// HOOK: useCustomerTypeDetection
// ============================================================

export function useCustomerTypeDetection(inputs: DetectionInputs) {
  const [rules, setRules] = useState<CustomerTypeRule[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch detection rules from database
  useEffect(() => {
    async function fetchRules() {
      try {
        const { data, error } = await supabase
          .from('customer_type_rules')
          .select('*')
          .eq('is_active', true)
          .order('display_order', { ascending: true });

        if (error) throw error;
        setRules((data || []) as CustomerTypeRule[]);
      } catch (err) {
        console.error('Failed to fetch customer type rules:', err);
        setRules([]);
      } finally {
        setIsLoading(false);
      }
    }

    fetchRules();
  }, []);

  // Compute detection result
  const result = useMemo<DetectionResult>(() => {
    const signals: DetectionSignal[] = [];
    const scores: Record<CustomerType, number> = {
      homeowner: 0,
      contractor: 0,
      business: 0,
      preferred_contractor: 0,
      wholesaler: 0,
    };

    // If explicit selection is provided, use it immediately
    if (inputs.explicitSelection) {
      return {
        detectedType: inputs.explicitSelection,
        confidenceScore: 100,
        confidenceLevel: 'high',
        signals: [{
          ruleCode: 'explicit_selection',
          ruleName: 'User Selection',
          signalType: 'explicit',
          matchedValue: inputs.explicitSelection,
          outputType: inputs.explicitSelection,
          weight: 100,
        }],
        wasAutoDetected: false,
      };
    }

    // Process each rule
    for (const rule of rules) {
      let matched = false;
      let matchedValue: string | boolean = false;

      switch (rule.signal_type) {
        case 'email_domain': {
          if (inputs.email) {
            const domain = getEmailDomain(inputs.email);
            if (domain) {
              if (rule.conditions_json.domains) {
                matched = rule.conditions_json.domains.includes(domain);
                matchedValue = domain;
              } else if (rule.conditions_json.pattern === 'company_domain') {
                matched = isCompanyEmail(inputs.email);
                matchedValue = domain;
              }
            }
          }
          break;
        }

        case 'company_name': {
          if (rule.conditions_json.has_value) {
            matched = !!inputs.companyName && inputs.companyName.trim().length > 0;
            matchedValue = !!inputs.companyName;
          } else if (rule.conditions_json.patterns && inputs.companyName) {
            matched = matchesPatterns(inputs.companyName, rule.conditions_json.patterns);
            matchedValue = inputs.companyName;
          }
          break;
        }

        case 'quantity': {
          if (inputs.quantity !== undefined && rule.conditions_json.min_quantity) {
            matched = inputs.quantity >= rule.conditions_json.min_quantity;
            matchedValue = `${inputs.quantity} dumpsters`;
          }
          break;
        }

        case 'recurring': {
          if (rule.conditions_json.is_recurring && inputs.isRecurring) {
            matched = true;
            matchedValue = true;
          }
          break;
        }

        case 'urgency': {
          if (rule.conditions_json.same_day && rule.conditions_json.multiple_jobs) {
            matched = !!inputs.isSameDay && !!inputs.hasMultipleJobs;
            matchedValue = matched;
          }
          break;
        }

        case 'keywords': {
          if (rule.conditions_json.patterns && inputs.projectDescription) {
            matched = matchesPatterns(inputs.projectDescription, rule.conditions_json.patterns);
            matchedValue = inputs.projectDescription;
          }
          break;
        }
      }

      if (matched) {
        signals.push({
          ruleCode: rule.rule_code,
          ruleName: rule.rule_name,
          signalType: rule.signal_type,
          matchedValue,
          outputType: rule.output_customer_type,
          weight: rule.weight,
        });
        scores[rule.output_customer_type] += rule.weight;
      }
    }

    // Find the type with the highest score
    let detectedType: CustomerType = 'homeowner';
    let maxScore = 0;
    
    for (const [type, score] of Object.entries(scores)) {
      if (score > maxScore) {
        maxScore = score;
        detectedType = type as CustomerType;
      }
    }

    // Calculate confidence (capped at 100)
    const totalPossibleScore = rules.reduce((sum, r) => sum + r.weight, 0) || 100;
    const confidenceScore = Math.min(100, Math.round((maxScore / Math.max(totalPossibleScore * 0.5, 1)) * 100));

    // Determine confidence level
    let confidenceLevel: 'high' | 'medium' | 'low' = 'low';
    if (confidenceScore >= 70) {
      confidenceLevel = 'high';
    } else if (confidenceScore >= 40) {
      confidenceLevel = 'medium';
    }

    return {
      detectedType,
      confidenceScore,
      confidenceLevel,
      signals,
      wasAutoDetected: signals.length > 0 && confidenceScore >= 60,
    };
  }, [rules, inputs]);

  return {
    ...result,
    isLoading,
    hasSignals: result.signals.length > 0,
  };
}

// ============================================================
// HOOK: useCustomerTypeLabels
// ============================================================

export function getCustomerTypeLabel(type: CustomerType, isSpanish = false): string {
  const labels: Record<CustomerType, { en: string; es: string }> = {
    homeowner: { en: 'Homeowner', es: 'Propietario' },
    contractor: { en: 'Contractor', es: 'Contratista' },
    business: { en: 'Business', es: 'Negocio' },
    preferred_contractor: { en: 'Preferred Contractor', es: 'Contratista Preferido' },
    wholesaler: { en: 'Wholesaler/Broker', es: 'Mayorista' },
  };
  return labels[type]?.[isSpanish ? 'es' : 'en'] || type;
}

export function getCustomerTypeIcon(type: CustomerType): string {
  const icons: Record<CustomerType, string> = {
    homeowner: 'home',
    contractor: 'hard-hat',
    business: 'building-2',
    preferred_contractor: 'star',
    wholesaler: 'warehouse',
  };
  return icons[type] || 'user';
}

export function getConfidenceBadgeColor(level: 'high' | 'medium' | 'low'): string {
  switch (level) {
    case 'high':
      return 'bg-green-100 text-green-800 border-green-200';
    case 'medium':
      return 'bg-amber-100 text-amber-800 border-amber-200';
    case 'low':
      return 'bg-muted text-muted-foreground border-border';
  }
}
