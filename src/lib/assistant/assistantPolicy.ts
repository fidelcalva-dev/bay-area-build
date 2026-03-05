// ============================================================
// Assistant Policy — Intent classification + response routing
// ============================================================

export type AssistantIntent =
  | 'PRICE'
  | 'SIZE'
  | 'MATERIALS_ALLOWED'
  | 'DELIVERY_SPEED'
  | 'HEAVY_MATERIAL'
  | 'PERMIT'
  | 'READY_TO_BOOK'
  | 'OTHER';

export type RecommendedAction = 'QUOTE' | 'PHOTO' | 'SCHEDULE' | 'CALL';

export interface AssistantResponse {
  answer_text: string;
  recommended_action: RecommendedAction;
  suggested_size_range: string | null;
  should_capture_lead: boolean;
}

// Keyword-based intent classification (used client-side for chip routing)
const INTENT_PATTERNS: Record<AssistantIntent, RegExp[]> = {
  PRICE: [/price|cost|how much|rate|fee|charge|afford|budget|cheap|expensive|dollar|\$/i],
  SIZE: [/size|yard|how big|which dumpster|what do i need|fit|capacity/i],
  MATERIALS_ALLOWED: [/can i put|allow|accept|throw away|dispose|material|drywall|wood|shingle|carpet|junk|furniture/i],
  DELIVERY_SPEED: [/deliver|today|tomorrow|fast|urgent|rush|same.?day|next.?day|when|how soon|asap/i],
  HEAVY_MATERIAL: [/concrete|dirt|soil|brick|asphalt|rock|heavy|inert|demo/i],
  PERMIT: [/permit|street|public|right.?of.?way|city|regulation|law|legal/i],
  READY_TO_BOOK: [/book|order|reserve|ready|sign.?up|let.?s go|start|schedule.*delivery/i],
  OTHER: [],
};

export function classifyIntent(question: string): AssistantIntent {
  const q = question.toLowerCase().trim();

  // Check in priority order
  if (INTENT_PATTERNS.READY_TO_BOOK.some((r) => r.test(q))) return 'READY_TO_BOOK';
  if (INTENT_PATTERNS.PRICE.some((r) => r.test(q))) return 'PRICE';
  if (INTENT_PATTERNS.HEAVY_MATERIAL.some((r) => r.test(q))) return 'HEAVY_MATERIAL';
  if (INTENT_PATTERNS.DELIVERY_SPEED.some((r) => r.test(q))) return 'DELIVERY_SPEED';
  if (INTENT_PATTERNS.PERMIT.some((r) => r.test(q))) return 'PERMIT';
  if (INTENT_PATTERNS.MATERIALS_ALLOWED.some((r) => r.test(q))) return 'MATERIALS_ALLOWED';
  if (INTENT_PATTERNS.SIZE.some((r) => r.test(q))) return 'SIZE';
  return 'OTHER';
}

/** Maps intent to recommended CTA action */
export function getActionForIntent(intent: AssistantIntent): RecommendedAction {
  switch (intent) {
    case 'PRICE':
    case 'READY_TO_BOOK':
      return 'QUOTE';
    case 'SIZE':
    case 'HEAVY_MATERIAL':
      return 'PHOTO';
    case 'DELIVERY_SPEED':
      return 'SCHEDULE';
    case 'PERMIT':
      return 'CALL';
    case 'MATERIALS_ALLOWED':
    case 'OTHER':
    default:
      return 'QUOTE';
  }
}

/** Should we trigger lead capture for this intent? */
export function shouldCaptureLead(intent: AssistantIntent): boolean {
  return intent === 'READY_TO_BOOK' || intent === 'PRICE';
}
