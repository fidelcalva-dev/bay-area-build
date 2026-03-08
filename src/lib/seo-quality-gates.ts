// SEO Quality Gates — Anti-spam validation for all SEO pages
// Pages must pass ALL gates to be considered fully optimized
// WARNING: Quality gates are diagnostic ONLY — they never block page rendering

export interface QualityGateResult {
  passed: boolean;
  pageType: string;
  url: string;
  checks: QualityCheck[];
  wordCount: number;
  faqCount: number;
  internalLinkCount: number;
  neighborhoodMentions: number;
  scores: QualityScores;
}

export interface QualityCheck {
  name: string;
  passed: boolean;
  required: number | string;
  actual: number | string;
}

export interface QualityScores {
  content: number;    // 0-100
  authority: number;  // 0-100
  links: number;      // 0-100
  local: number;      // 0-100
  overall: number;    // 0-100
}

// Minimum thresholds by page type
const THRESHOLDS: Record<string, { minWords: number; minFaqs: number; minLinks: number; minNeighborhoods: number }> = {
  CITY:          { minWords: 700, minFaqs: 4, minLinks: 6, minNeighborhoods: 1 },
  CITY_SIZE:     { minWords: 350, minFaqs: 3, minLinks: 6, minNeighborhoods: 0 },
  CITY_MATERIAL: { minWords: 350, minFaqs: 2, minLinks: 6, minNeighborhoods: 0 },
  CITY_JOB:      { minWords: 350, minFaqs: 3, minLinks: 6, minNeighborhoods: 0 },
  ZIP:           { minWords: 400, minFaqs: 4, minLinks: 6, minNeighborhoods: 1 },
  COUNTY:        { minWords: 600, minFaqs: 4, minLinks: 6, minNeighborhoods: 1 },
  USE_CASE:      { minWords: 900, minFaqs: 4, minLinks: 6, minNeighborhoods: 0 },
};

/**
 * Count words in all text content of a page
 */
export function countPageWords(sections: Array<{ heading?: string; body?: string; items?: Array<{ label: string; value: string }> }>, faqs: Array<{ question: string; answer: string }>): number {
  let text = '';
  for (const s of sections) {
    if (s.heading) text += ' ' + s.heading;
    if (s.body) text += ' ' + s.body;
    if (s.items) {
      for (const item of s.items) {
        text += ' ' + item.label + ' ' + item.value;
      }
    }
  }
  for (const faq of faqs) {
    text += ' ' + faq.question + ' ' + faq.answer;
  }
  return text.trim().split(/\s+/).filter(w => w.length > 0).length;
}

/**
 * Count unique neighborhood/local mentions in page content
 */
export function countNeighborhoodMentions(content: string, neighborhoods: string[]): number {
  if (!neighborhoods.length) return 0;
  const lower = content.toLowerCase();
  return neighborhoods.filter(n => lower.includes(n.toLowerCase())).length;
}

/**
 * Calculate quality scores (0-100) per dimension
 */
function calculateScores(
  wordCount: number,
  faqCount: number,
  linkCount: number,
  neighborhoodMentions: number,
  thresholds: { minWords: number; minFaqs: number; minLinks: number; minNeighborhoods: number },
): QualityScores {
  const content = Math.min(100, Math.round((wordCount / thresholds.minWords) * 100));
  const authority = Math.min(100, Math.round((faqCount / Math.max(thresholds.minFaqs, 1)) * 100));
  const links = Math.min(100, Math.round((linkCount / Math.max(thresholds.minLinks, 1)) * 100));
  const local = thresholds.minNeighborhoods === 0
    ? 100
    : Math.min(100, Math.round((neighborhoodMentions / thresholds.minNeighborhoods) * 100));
  const overall = Math.round(content * 0.4 + authority * 0.2 + links * 0.2 + local * 0.2);
  return { content, authority, links, local, overall };
}

/**
 * Run all quality gates for a page
 */
export function runQualityGates(
  pageType: string,
  url: string,
  sections: Array<{ heading?: string; body?: string; items?: Array<{ label: string; value: string }> }>,
  faqs: Array<{ question: string; answer: string }>,
  internalLinkCount: number,
  neighborhoods: string[] = [],
): QualityGateResult {
  const thresholds = THRESHOLDS[pageType] || THRESHOLDS.CITY;
  const wordCount = countPageWords(sections, faqs);
  const faqCount = faqs.length;

  // Build full text for neighborhood check
  let fullText = '';
  for (const s of sections) {
    if (s.heading) fullText += ' ' + s.heading;
    if (s.body) fullText += ' ' + s.body;
  }
  for (const faq of faqs) {
    fullText += ' ' + faq.question + ' ' + faq.answer;
  }
  const neighborhoodMentions = countNeighborhoodMentions(fullText, neighborhoods);

  const checks: QualityCheck[] = [
    {
      name: 'Word Count',
      passed: wordCount >= thresholds.minWords,
      required: thresholds.minWords,
      actual: wordCount,
    },
    {
      name: 'FAQ Count',
      passed: faqCount >= thresholds.minFaqs,
      required: thresholds.minFaqs,
      actual: faqCount,
    },
    {
      name: 'Internal Links',
      passed: internalLinkCount >= thresholds.minLinks,
      required: thresholds.minLinks,
      actual: internalLinkCount,
    },
    {
      name: 'Local Mentions',
      passed: neighborhoodMentions >= thresholds.minNeighborhoods,
      required: thresholds.minNeighborhoods,
      actual: neighborhoodMentions,
    },
  ];

  const scores = calculateScores(wordCount, faqCount, internalLinkCount, neighborhoodMentions, thresholds);

  return {
    passed: checks.every(c => c.passed),
    pageType,
    url,
    checks,
    wordCount,
    faqCount,
    internalLinkCount,
    neighborhoodMentions,
    scores,
  };
}

/**
 * Get quality gate summary for admin display
 */
export function getQualityGateSummary(results: QualityGateResult[]): {
  total: number;
  passed: number;
  failed: number;
  failedPages: QualityGateResult[];
} {
  const passed = results.filter(r => r.passed).length;
  return {
    total: results.length,
    passed,
    failed: results.length - passed,
    failedPages: results.filter(r => !r.passed),
  };
}
