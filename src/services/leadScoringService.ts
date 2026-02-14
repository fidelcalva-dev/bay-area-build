// Lead Quality & Risk Scoring Engine

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'trashmail.com', 'fakeinbox.com',
];

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'live.com',
];

const HIGH_INTENT_KEYWORDS = [
  'need today', 'ready to book', 'asap', 'urgent', 'same day',
  'tomorrow', 'this week', 'need now', 'how soon', 'schedule',
  'book now', 'reserve', 'order today',
];

const SUSPICIOUS_KEYWORDS = [
  'free', 'test', 'testing', 'asdf', 'xxx', 'fake',
];

interface ScoringInput {
  customer_name?: string | null;
  customer_email?: string | null;
  customer_phone?: string | null;
  company_name?: string | null;
  address?: string | null;
  city?: string | null;
  zip?: string | null;
  project_category?: string | null;
  notes?: string | null;
  message_excerpt?: string | null;
  source_key?: string | null;
  channel_key?: string | null;
}

export interface ScoringResult {
  quality_score: number;
  risk_score: number;
  quality_label: 'GREEN' | 'AMBER' | 'RED';
  company_domain: string | null;
  customer_type_inferred: 'homeowner' | 'contractor' | 'commercial' | 'unknown';
  quality_reasons: string[];
  risk_reasons: string[];
}

export function scoreLead(input: ScoringInput): ScoringResult {
  let qualityScore = 0;
  let riskScore = 0;
  const qualityReasons: string[] = [];
  const riskReasons: string[] = [];
  let companyDomain: string | null = null;
  let customerType: 'homeowner' | 'contractor' | 'commercial' | 'unknown' = 'unknown';

  // === QUALITY SCORING ===

  // Email domain analysis
  if (input.customer_email) {
    const domain = input.customer_email.split('@')[1]?.toLowerCase();
    if (domain) {
      if (!FREE_EMAIL_DOMAINS.includes(domain) && !DISPOSABLE_DOMAINS.includes(domain)) {
        qualityScore += 15;
        qualityReasons.push('Corporate email domain');
        companyDomain = domain;
        customerType = 'contractor';
      } else if (FREE_EMAIL_DOMAINS.includes(domain)) {
        qualityScore += 5;
        customerType = 'homeowner';
      }
    }
  }

  // Name provided
  if (input.customer_name && input.customer_name.trim().length > 2) {
    qualityScore += 10;
    qualityReasons.push('Full name provided');
  }

  // Phone provided
  if (input.customer_phone && input.customer_phone.replace(/\D/g, '').length >= 10) {
    qualityScore += 10;
    qualityReasons.push('Valid phone number');
  }

  // Address/location
  if (input.address || input.city) {
    qualityScore += 10;
    qualityReasons.push('Address provided');
  }

  // ZIP code (serviceable area check)
  if (input.zip) {
    qualityScore += 15;
    qualityReasons.push('ZIP code provided');
  }

  // Project type specified
  if (input.project_category) {
    qualityScore += 10;
    qualityReasons.push('Project type specified');
  }

  // High intent keywords
  const textToCheck = [input.notes, input.message_excerpt].filter(Boolean).join(' ').toLowerCase();
  const hasHighIntent = HIGH_INTENT_KEYWORDS.some(kw => textToCheck.includes(kw));
  if (hasHighIntent) {
    qualityScore += 15;
    qualityReasons.push('High intent language detected');
  }

  // Company name
  if (input.company_name && input.company_name.trim().length > 1) {
    qualityScore += 10;
    qualityReasons.push('Company name provided');
    if (customerType === 'unknown') customerType = 'contractor';
  }

  // Cap at 100
  qualityScore = Math.min(100, qualityScore);

  // === RISK SCORING ===

  // Disposable email
  if (input.customer_email) {
    const domain = input.customer_email.split('@')[1]?.toLowerCase();
    if (domain && DISPOSABLE_DOMAINS.includes(domain)) {
      riskScore += 30;
      riskReasons.push('Disposable email domain');
    }
  }

  // Invalid phone
  if (input.customer_phone) {
    const digits = input.customer_phone.replace(/\D/g, '');
    if (digits.length < 10) {
      riskScore += 20;
      riskReasons.push('Invalid phone number format');
    }
  } else {
    riskScore += 10;
    riskReasons.push('No phone number');
  }

  // Suspicious keywords
  const hasSuspicious = SUSPICIOUS_KEYWORDS.some(kw => textToCheck.includes(kw));
  if (hasSuspicious) {
    riskScore += 20;
    riskReasons.push('Suspicious keywords detected');
  }

  // Missing name
  if (!input.customer_name || input.customer_name.trim().length < 2) {
    riskScore += 10;
    riskReasons.push('No name provided');
  }

  // Name/email mismatch patterns (single char name)
  if (input.customer_name && input.customer_name.trim().length === 1) {
    riskScore += 15;
    riskReasons.push('Single character name');
  }

  // Cap at 100
  riskScore = Math.min(100, riskScore);

  // Label
  let qualityLabel: 'GREEN' | 'AMBER' | 'RED' = 'GREEN';
  if (riskScore >= 50 || qualityScore < 20) {
    qualityLabel = 'RED';
  } else if (riskScore >= 25 || qualityScore < 40) {
    qualityLabel = 'AMBER';
  }

  return {
    quality_score: qualityScore,
    risk_score: riskScore,
    quality_label: qualityLabel,
    company_domain: companyDomain,
    customer_type_inferred: customerType,
    quality_reasons: qualityReasons,
    risk_reasons: riskReasons,
  };
}

export function getSlaDuration(createdAt: string, firstResponseAt: string | null): {
  elapsedMinutes: number;
  responseMinutes: number | null;
  status: 'on_track' | 'at_risk' | 'breached';
} {
  const now = new Date();
  const created = new Date(createdAt);
  const elapsedMinutes = Math.floor((now.getTime() - created.getTime()) / 60000);

  let responseMinutes: number | null = null;
  if (firstResponseAt) {
    const responded = new Date(firstResponseAt);
    responseMinutes = Math.floor((responded.getTime() - created.getTime()) / 60000);
  }

  const slaTarget = 15; // minutes
  let status: 'on_track' | 'at_risk' | 'breached' = 'on_track';

  if (!firstResponseAt) {
    if (elapsedMinutes > slaTarget) {
      status = 'breached';
    } else if (elapsedMinutes > slaTarget * 0.7) {
      status = 'at_risk';
    }
  } else if (responseMinutes && responseMinutes > slaTarget) {
    status = 'breached';
  }

  return { elapsedMinutes, responseMinutes, status };
}

export function formatElapsed(minutes: number): string {
  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m`;
  if (minutes < 1440) return `${Math.floor(minutes / 60)}h ${minutes % 60}m`;
  const days = Math.floor(minutes / 1440);
  return `${days}d ${Math.floor((minutes % 1440) / 60)}h`;
}
