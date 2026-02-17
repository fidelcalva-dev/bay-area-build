// SEO Quality Gates — Anti-spam validation for all SEO pages
// Pages must pass ALL gates before being considered publishable

export interface QualityGateResult {
  passed: boolean;
  pageType: string;
  url: string;
  checks: QualityCheck[];
  wordCount: number;
  faqCount: number;
  internalLinkCount: number;
  neighborhoodMentions: number;
}

export interface QualityCheck {
  name: string;
  passed: boolean;
  required: number | string;
  actual: number | string;
}

// Minimum thresholds by page type
const THRESHOLDS: Record<string, { minWords: number; minFaqs: number; minLinks: number; minNeighborhoods: number }> = {
  CITY: { minWords: 900, minFaqs: 8, minLinks: 6, minNeighborhoods: 3 },
  CITY_SIZE: { minWords: 700, minFaqs: 3, minLinks: 6, minNeighborhoods: 1 },
  CITY_MATERIAL: { minWords: 700, minFaqs: 2, minLinks: 6, minNeighborhoods: 1 },
  CITY_JOB: { minWords: 700, minFaqs: 5, minLinks: 6, minNeighborhoods: 1 },
  ZIP: { minWords: 600, minFaqs: 8, minLinks: 6, minNeighborhoods: 3 },
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

  return {
    passed: checks.every(c => c.passed),
    pageType,
    url,
    checks,
    wordCount,
    faqCount,
    internalLinkCount,
    neighborhoodMentions,
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
