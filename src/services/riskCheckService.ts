/**
 * Scam Risk Check Service
 * Evaluates email/phone for fraud signals using first-party data and heuristics.
 * No external scraping — only allowed reputation signals.
 */

import { supabase } from '@/integrations/supabase/client';

// Type-bypass for risk_checks table (not in generated types yet)
const RISK_CHECKS_TABLE = 'risk_checks' as 'orders';

// ─── Domain Lists ───────────────────────────────────────────────

const DISPOSABLE_DOMAINS = [
  'mailinator.com', 'guerrillamail.com', 'tempmail.com', 'throwaway.email',
  'yopmail.com', 'sharklasers.com', 'trashmail.com', 'fakeinbox.com',
  'temp-mail.org', 'guerrillamailblock.com', 'grr.la', 'dispostable.com',
  'maildrop.cc', 'mohmal.com', 'getnada.com', '10minutemail.com',
  'burnermail.io', 'tempail.com', 'mailnesia.com', 'harakirimail.com',
];

const FREE_EMAIL_DOMAINS = [
  'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'aol.com',
  'icloud.com', 'mail.com', 'protonmail.com', 'live.com', 'msn.com',
];

// ─── Types ──────────────────────────────────────────────────────

export interface RiskReason {
  code: string;
  label: string;
  weight: number;
  detail: string;
}

export type RiskBand = 'GREEN' | 'AMBER' | 'RED';

export interface RiskCheckResult {
  riskScore: number;
  riskBand: RiskBand;
  reasons: RiskReason[];
  recommendedAction: string;
}

export interface RiskCheckInput {
  entityType: 'LEAD' | 'CUSTOMER' | 'CONTACT' | 'ORDER';
  entityId?: string;
  email?: string | null;
  phone?: string | null;
  customerName?: string | null;
  companyName?: string | null;
  address?: string | null;
  zip?: string | null;
  customerId?: string | null;
}

// ─── Helpers ────────────────────────────────────────────────────

function normalizePhone(phone: string): string {
  const digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) return digits.slice(1);
  return digits;
}

function isRandomString(local: string): boolean {
  // Heuristic: >8 chars with mostly consonants and digits, few vowels
  if (local.length < 8) return false;
  const vowels = (local.match(/[aeiou]/gi) || []).length;
  const digits = (local.match(/\d/g) || []).length;
  const ratio = vowels / local.length;
  return ratio < 0.15 && digits >= 3;
}

function getBand(score: number): RiskBand {
  if (score >= 60) return 'RED';
  if (score >= 30) return 'AMBER';
  return 'GREEN';
}

function getRecommendedAction(band: RiskBand): string {
  switch (band) {
    case 'GREEN':
      return 'Proceed normally — low risk.';
    case 'AMBER':
      return 'Request address confirmation. Require ID verification before payment. No discounts > 5% without approval.';
    case 'RED':
      return 'Block payment links. Require manual call + manager review. Require ID verification and deposit only.';
  }
}

// ─── Core Scoring Engine ────────────────────────────────────────

async function computeScore(input: RiskCheckInput): Promise<RiskCheckResult> {
  const reasons: RiskReason[] = [];
  let score = 0;

  const addReason = (code: string, label: string, weight: number, detail: string) => {
    reasons.push({ code, label, weight, detail });
    score += weight;
  };

  // ── EMAIL SIGNALS ──

  if (input.email) {
    const emailLower = input.email.toLowerCase().trim();
    const parts = emailLower.split('@');
    const local = parts[0] || '';
    const domain = parts[1] || '';

    if (DISPOSABLE_DOMAINS.includes(domain)) {
      addReason('DISPOSABLE_EMAIL', 'Disposable email domain', 30, `Domain "${domain}" is a known disposable email provider`);
    } else if (FREE_EMAIL_DOMAINS.includes(domain)) {
      addReason('FREE_EMAIL', 'Free email provider', 5, `Using free email domain "${domain}"`);
    }

    if (isRandomString(local)) {
      addReason('SUSPICIOUS_EMAIL_FORMAT', 'Suspicious email format', 10, `Email local part "${local}" appears randomly generated`);
    }

    // Corporate domain match (positive)
    if (input.companyName && domain && !FREE_EMAIL_DOMAINS.includes(domain) && !DISPOSABLE_DOMAINS.includes(domain)) {
      const companyNorm = input.companyName.toLowerCase().replace(/[^a-z0-9]/g, '');
      const domainBase = domain.split('.')[0];
      if (domainBase.includes(companyNorm) || companyNorm.includes(domainBase)) {
        addReason('CORPORATE_EMAIL_MATCH', 'Email matches company', -10, `Email domain matches company name "${input.companyName}"`);
      }
    }

    // Corporate email (positive)
    if (domain && !FREE_EMAIL_DOMAINS.includes(domain) && !DISPOSABLE_DOMAINS.includes(domain)) {
      addReason('CORPORATE_EMAIL', 'Corporate email domain', -15, `Email uses corporate domain "${domain}"`);
    }
  }

  // ── PHONE SIGNALS ──

  const phoneNorm = input.phone ? normalizePhone(input.phone) : null;

  if (input.phone) {
    if (!phoneNorm || phoneNorm.length !== 10) {
      addReason('INVALID_PHONE', 'Invalid phone number', 30, `Phone "${input.phone}" does not have valid 10-digit US format`);
    } else {
      // Check velocity: same phone in multiple leads within 24h
      const past24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
      try {
        const { data: recentLeads } = await supabase
          .from('sales_leads' as 'orders')
          .select('id, customer_name, customer_email')
          .eq('customer_phone' as 'id', phoneNorm)
          .gte('created_at' as 'id', past24h);

        if (recentLeads && recentLeads.length > 3) {
          addReason('PHONE_VELOCITY', 'Phone used in multiple leads (24h)', 25,
            `Phone used in ${recentLeads.length} leads in the last 24 hours`);
        }

        // Different names using same phone
        if (recentLeads && recentLeads.length >= 2) {
          const names = new Set(
            recentLeads.map((l: any) => l.customer_name?.toLowerCase().trim()).filter(Boolean)
          );
          if (names.size >= 3) {
            addReason('IDENTITY_MISMATCH', 'Multiple names on same phone', 20,
              `${names.size} different names used with this phone in recent leads`);
          }
        }
      } catch (e) {
        console.error('Phone velocity check error:', e);
      }

      // Check chargeback/dispute history
      if (input.customerId) {
        try {
          const { count } = await supabase
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('customer_id', input.customerId)
            .in('payment_status', ['disputed', 'chargeback'] as any);

          if ((count || 0) > 0) {
            addReason('CHARGEBACK_HISTORY', 'Previous chargebacks/disputes', 40,
              `${count} chargeback(s) or dispute(s) on record`);
          }
        } catch (e) {
          console.error('Chargeback check error:', e);
        }
      }
    }
  }

  // ── BEHAVIOR SIGNALS (first-party) ──

  // Address provided (positive)
  if (input.address && input.zip) {
    addReason('ADDRESS_WITH_ZIP', 'Address and ZIP provided', -10, 'Full delivery address provided');
  } else if (!input.address && !input.zip) {
    addReason('NO_ADDRESS', 'No address provided', 10, 'Lead has no delivery address on file');
  }

  // Returning customer with paid history (positive)
  if (input.customerId) {
    try {
      const { count } = await supabase
        .from('orders')
        .select('id', { count: 'exact', head: true })
        .eq('customer_id', input.customerId)
        .eq('status', 'completed')
        .gt('amount_paid', 0);

      if ((count || 0) >= 2) {
        addReason('PAID_HISTORY', 'Returning customer with paid orders', -30,
          `${count} completed paid orders on record`);
      }
    } catch (e) {
      console.error('Paid history check error:', e);
    }
  }

  // Clamp 0-100
  score = Math.max(0, Math.min(100, score));
  const band = getBand(score);

  return {
    riskScore: score,
    riskBand: band,
    reasons,
    recommendedAction: getRecommendedAction(band),
  };
}

// ─── Public API ─────────────────────────────────────────────────

export async function runRiskCheck(input: RiskCheckInput): Promise<RiskCheckResult & { checkId?: string }> {
  const result = await computeScore(input);
  const phoneNorm = input.phone ? normalizePhone(input.phone) : null;

  // Persist to risk_checks
  try {
    const { data: { user } } = await supabase.auth.getUser();

    const { data } = await supabase
      .from(RISK_CHECKS_TABLE)
      .insert([{
        entity_type: input.entityType,
        entity_id: input.entityId || null,
        requested_by_user_id: user?.id || null,
        email_input: input.email || null,
        phone_input: input.phone || null,
        phone_normalized: phoneNorm,
        risk_score: result.riskScore,
        risk_band: result.riskBand,
        reasons_json: result.reasons,
      }] as never)
      .select('id')
      .single();

    const checkId = (data as unknown as { id: string })?.id;

    // Create fraud_flags for RED/AMBER
    if (result.riskBand === 'RED' || result.riskBand === 'AMBER') {
      const topReason = result.reasons.filter(r => r.weight > 0).sort((a, b) => b.weight - a.weight)[0];
      if (topReason) {
        await supabase
          .from('fraud_flags' as 'orders')
          .insert([{
            phone: input.phone || null,
            flag_type: topReason.code,
            entity_type: input.entityType,
            entity_id: input.entityId || null,
            severity: result.riskBand === 'RED' ? 'high' : 'medium',
            status: 'open',
            notes: `Risk score: ${result.riskScore}. ${topReason.label}: ${topReason.detail}`,
            risk_check_id: checkId || null,
            risk_score: result.riskScore,
            risk_level: result.riskBand.toLowerCase(),
          }] as never);
      }
    }

    // Log audit event
    if (input.entityId && input.entityType === 'LEAD') {
      await supabase.from('lead_actions' as 'orders').insert([{
        lead_id: input.entityId,
        action_type: 'RISK_CHECK',
        performed_by_user_id: user?.id || null,
        summary: `Risk check completed: ${result.riskBand} (score: ${result.riskScore})`,
        provider: 'SYSTEM',
      }] as never);
    }

    return { ...result, checkId };
  } catch (err) {
    console.error('Failed to persist risk check:', err);
    return result;
  }
}

// ─── Guardrail Checks ──────────────────────────────────────────

export interface GuardrailResult {
  allowed: boolean;
  reason?: string;
  riskBand: RiskBand;
}

export async function checkGuardrail(
  entityType: 'LEAD' | 'CUSTOMER' | 'ORDER',
  entityId: string,
  action: 'SEND_PAYMENT_LINK' | 'SEND_DISCOUNT' | 'SEND_SCHEDULE_LINK'
): Promise<GuardrailResult> {
  try {
    // Get latest risk check for this entity
    const { data } = await supabase
      .from(RISK_CHECKS_TABLE)
      .select('risk_band, risk_score')
      .eq('entity_type' as 'id', entityType)
      .eq('entity_id' as 'id', entityId)
      .order('created_at' as 'id', { ascending: false })
      .limit(1)
      .single();

    if (!data) {
      return { allowed: true, riskBand: 'GREEN' };
    }

    const band = (data as any).risk_band as RiskBand;

    if (band === 'RED') {
      if (action === 'SEND_PAYMENT_LINK') {
        return { allowed: false, reason: 'Payment links blocked — RED risk. Manager approval required.', riskBand: band };
      }
      if (action === 'SEND_DISCOUNT') {
        return { allowed: false, reason: 'Discounts blocked — RED risk. Manager approval required.', riskBand: band };
      }
    }

    if (band === 'AMBER') {
      if (action === 'SEND_PAYMENT_LINK') {
        return { allowed: false, reason: 'Payment link requires ID verification — AMBER risk.', riskBand: band };
      }
      if (action === 'SEND_DISCOUNT') {
        return { allowed: false, reason: 'Discounts >5% require manager approval — AMBER risk.', riskBand: band };
      }
    }

    return { allowed: true, riskBand: band };
  } catch {
    return { allowed: true, riskBand: 'GREEN' };
  }
}

// ─── Fetch latest risk check for display ────────────────────────

export async function getLatestRiskCheck(
  entityType: string,
  entityId: string
): Promise<RiskCheckResult | null> {
  try {
    const { data } = await supabase
      .from(RISK_CHECKS_TABLE)
      .select('risk_score, risk_band, reasons_json, created_at')
      .eq('entity_type' as 'id', entityType)
      .eq('entity_id' as 'id', entityId)
      .order('created_at' as 'id', { ascending: false })
      .limit(1)
      .single();

    if (!data) return null;

    const d = data as any;
    return {
      riskScore: d.risk_score,
      riskBand: d.risk_band,
      reasons: d.reasons_json || [],
      recommendedAction: getRecommendedAction(d.risk_band),
    };
  } catch {
    return null;
  }
}
