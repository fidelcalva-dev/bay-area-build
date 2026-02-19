// ============================================================
// AI CHAT INTENT CLASSIFIER & DEPARTMENT ROUTER
// Rule-based + confidence scoring for handoff decisions
// ============================================================

export type ChatIntent =
  | 'READY_TO_BOOK'
  | 'NEED_PRICE'
  | 'NEED_SIZE_HELP'
  | 'HEAVY_MATERIAL'
  | 'COMMERCIAL_ACCOUNT'
  | 'CONTRACTOR_MULTI'
  | 'SCHEDULE_REQUEST'
  | 'PAYMENT_HELP'
  | 'PICKUP_REQUEST'
  | 'GENERAL_QUESTION'
  | 'OUT_OF_AREA'
  | 'SUPPORT_ISSUE';

export type HandoffDepartment = 'SALES' | 'CS' | 'DISPATCH' | 'BILLING';

export type RiskBand = 'GREEN' | 'AMBER' | 'RED';

export interface IntentResult {
  label: ChatIntent;
  confidence: number; // 0-1
  urgency: 'low' | 'medium' | 'high';
  department: HandoffDepartment;
  shouldHandoff: boolean;
  reason: string;
}

interface ClassifierContext {
  zip?: string;
  material?: string;
  size?: number;
  hasOrder?: boolean;
  isExistingCustomer?: boolean;
  riskBand?: RiskBand;
  messageCount?: number;
}

// ---- Pattern banks ----

const PATTERNS: Record<ChatIntent, RegExp[]> = {
  READY_TO_BOOK: [
    /\b(book|order|reserve|ready|let'?s do it|go ahead|sign me up|i'?m ready|let'?s go)\b/i,
    /\b(today|asap|right now|immediately|this week|tomorrow)\b/i,
  ],
  NEED_PRICE: [
    /\b(price|cost|how much|quote|estimate|rate|pricing|affordable|cheap|budget)\b/i,
  ],
  NEED_SIZE_HELP: [
    /\b(what size|which size|how big|recommend|too small|too big|fit|enough|capacity)\b/i,
  ],
  HEAVY_MATERIAL: [
    /\b(concrete|dirt|rock|asphalt|brick|soil|heavy|inert|gravel|sand|stone|rubble|fill)\b/i,
  ],
  COMMERCIAL_ACCOUNT: [
    /\b(account|commercial|business|weekly|monthly|ongoing|regular|contract)\b/i,
  ],
  CONTRACTOR_MULTI: [
    /\b(contractor|builder|multiple|second dumpster|swap|fleet|job\s?site|construction)\b/i,
  ],
  SCHEDULE_REQUEST: [
    /\b(schedule|deliver|drop.?off|when|pickup date|delivery date|time slot|morning|afternoon)\b/i,
  ],
  PAYMENT_HELP: [
    /\b(pay|payment|card|declined|charge|invoice|balance|bill|receipt|refund)\b/i,
  ],
  PICKUP_REQUEST: [
    /\b(pick\s?up|haul|remove|done|finished|full|come get|take away|empty)\b/i,
  ],
  GENERAL_QUESTION: [
    /\b(how does|what is|do you|can i|is there|where|hours|open|FAQ)\b/i,
  ],
  OUT_OF_AREA: [
    /\b(outside|don'?t serve|too far|out of area|not available|service area)\b/i,
  ],
  SUPPORT_ISSUE: [
    /\b(problem|issue|complaint|damage|wrong|broken|late|missing|cancel|change)\b/i,
  ],
};

const INTENT_PRIORITY: Record<ChatIntent, number> = {
  READY_TO_BOOK: 100,
  HEAVY_MATERIAL: 90,
  COMMERCIAL_ACCOUNT: 85,
  CONTRACTOR_MULTI: 85,
  PAYMENT_HELP: 80,
  SCHEDULE_REQUEST: 75,
  PICKUP_REQUEST: 70,
  NEED_PRICE: 60,
  SUPPORT_ISSUE: 55,
  NEED_SIZE_HELP: 50,
  OUT_OF_AREA: 40,
  GENERAL_QUESTION: 10,
};

const INTENT_URGENCY: Record<ChatIntent, 'low' | 'medium' | 'high'> = {
  READY_TO_BOOK: 'high',
  NEED_PRICE: 'medium',
  NEED_SIZE_HELP: 'medium',
  HEAVY_MATERIAL: 'high',
  COMMERCIAL_ACCOUNT: 'high',
  CONTRACTOR_MULTI: 'high',
  SCHEDULE_REQUEST: 'high',
  PAYMENT_HELP: 'high',
  PICKUP_REQUEST: 'medium',
  GENERAL_QUESTION: 'low',
  OUT_OF_AREA: 'medium',
  SUPPORT_ISSUE: 'medium',
};

// ---- Department routing ----

function routeToDepartment(intent: ChatIntent, ctx: ClassifierContext): HandoffDepartment {
  // CS for existing customers with service issues
  if (ctx.isExistingCustomer && ['SUPPORT_ISSUE', 'GENERAL_QUESTION', 'PICKUP_REQUEST'].includes(intent)) {
    return 'CS';
  }
  // Dispatch for schedule/pickup after order
  if (ctx.hasOrder && ['SCHEDULE_REQUEST', 'PICKUP_REQUEST'].includes(intent)) {
    return 'DISPATCH';
  }
  // Billing
  if (intent === 'PAYMENT_HELP') return 'BILLING';
  if (intent === 'SUPPORT_ISSUE' && ctx.isExistingCustomer) return 'CS';
  // Default to sales
  return 'SALES';
}

// ---- Should we hand off? ----

function shouldHandoff(intent: ChatIntent, confidence: number, ctx: ClassifierContext): boolean {
  // Always handoff high-value intents
  if (['READY_TO_BOOK', 'COMMERCIAL_ACCOUNT', 'CONTRACTOR_MULTI'].includes(intent) && confidence > 0.5) {
    return true;
  }
  // Handoff payment/support issues
  if (['PAYMENT_HELP', 'SUPPORT_ISSUE'].includes(intent) && confidence > 0.4) {
    return true;
  }
  // Handoff pickup/schedule if order exists
  if (['PICKUP_REQUEST', 'SCHEDULE_REQUEST'].includes(intent) && ctx.hasOrder) {
    return true;
  }
  // Handoff after enough messages (conversation going long)
  if ((ctx.messageCount || 0) >= 8 && confidence > 0.3) {
    return true;
  }
  return false;
}

// ---- Main classifier ----

export function classifyIntent(messages: string[], ctx: ClassifierContext = {}): IntentResult {
  // Analyze last 5 messages for recency bias
  const recentMessages = messages.slice(-5).join(' ');
  const allMessages = messages.join(' ');

  const scores: Partial<Record<ChatIntent, number>> = {};

  for (const [intent, patterns] of Object.entries(PATTERNS) as [ChatIntent, RegExp[]][]) {
    let matchCount = 0;
    for (const pattern of patterns) {
      // More weight to recent messages
      if (pattern.test(recentMessages)) matchCount += 2;
      else if (pattern.test(allMessages)) matchCount += 1;
    }
    if (matchCount > 0) {
      scores[intent] = matchCount * (INTENT_PRIORITY[intent] / 100);
    }
  }

  // Context boosters
  if (ctx.material === 'heavy' && scores.HEAVY_MATERIAL) scores.HEAVY_MATERIAL *= 1.5;
  if (ctx.zip && scores.NEED_PRICE) scores.NEED_PRICE *= 1.3;
  if (ctx.isExistingCustomer && scores.SUPPORT_ISSUE) scores.SUPPORT_ISSUE *= 1.5;

  // Find top intent
  let topIntent: ChatIntent = 'GENERAL_QUESTION';
  let topScore = 0;
  for (const [intent, score] of Object.entries(scores) as [ChatIntent, number][]) {
    if (score > topScore) {
      topScore = score;
      topIntent = intent;
    }
  }

  // Normalize confidence (0-1)
  const confidence = Math.min(1, topScore / 4);

  const department = routeToDepartment(topIntent, ctx);
  const handoff = shouldHandoff(topIntent, confidence, ctx);

  return {
    label: topIntent,
    confidence,
    urgency: INTENT_URGENCY[topIntent],
    department,
    shouldHandoff: handoff,
    reason: handoff
      ? `Intent: ${topIntent} (${(confidence * 100).toFixed(0)}% confidence) routed to ${department}`
      : `Intent: ${topIntent} — AI continues handling`,
  };
}

// ---- Handoff message generator ----

export function getHandoffMessage(department: HandoffDepartment, riskBand: RiskBand): string {
  const base = 'Thanks for the details. A specialist will be in touch shortly.';

  const options: string[] = [];

  if (riskBand !== 'RED') {
    options.push('"View exact pricing now" -> /quote');
  }
  options.push('"Request a callback in 5 minutes"');
  options.push('"Call us directly at (510) 680-2150"');

  return `${base}\n\nIn the meantime, you can:\n${options.map(o => `- ${o}`).join('\n')}`;
}

export function getOutsideHoursMessage(): string {
  return 'Our team will respond during the next business window (Mon-Sat 7AM-6PM PT). You can also get an instant quote anytime at /quote.';
}

// ---- Risk guardrail messages ----

export function getRiskGuardrailMessage(riskBand: RiskBand): string | null {
  if (riskBand === 'AMBER') {
    return 'Before payment, we will verify a few details for security. You can proceed with scheduling in the meantime.';
  }
  if (riskBand === 'RED') {
    return 'For your security, please call us directly at (510) 680-2150 to complete your order.';
  }
  return null;
}

// ---- Extract fields from conversation ----

export function extractFieldsFromMessages(messages: Array<{ role: string; content: string }>, ctx: Record<string, unknown> = {}): Record<string, unknown> {
  const allText = messages.map(m => m.content).join(' ');

  const fields: Record<string, unknown> = { ...ctx };

  // ZIP
  const zipMatch = allText.match(/\b(9[0-5]\d{3})\b/);
  if (zipMatch) fields.zip = zipMatch[1];

  // Phone
  const phoneMatch = allText.match(/\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}/);
  if (phoneMatch) fields.phone = phoneMatch[0];

  // Email
  const emailMatch = allText.match(/[\w.+-]+@[\w.-]+\.\w{2,}/);
  if (emailMatch) fields.email = emailMatch[0];

  // Size
  const sizeMatch = allText.match(/(\d+)\s*(?:yard|yd|cu)/i);
  if (sizeMatch) fields.size = parseInt(sizeMatch[1]);

  // Material
  if (/concrete|dirt|rock|asphalt|brick|soil|heavy|inert/i.test(allText)) {
    fields.material = 'heavy';
  } else if (/junk|furniture|general|mixed|debris|cleanout|remodel/i.test(allText)) {
    fields.material = 'general';
  }

  // Timeline
  if (/today|asap|right now|immediately/i.test(allText)) fields.timeline = 'same_day';
  else if (/tomorrow|this week/i.test(allText)) fields.timeline = 'next_day';
  else if (/next week|in a few days/i.test(allText)) fields.timeline = 'this_week';

  // Address
  const addrMatch = allText.match(/\d+\s+[\w\s]+(?:st|ave|blvd|dr|rd|ln|ct|way|pl)\b/i);
  if (addrMatch) fields.address = addrMatch[0];

  return fields;
}
