import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, CheckCircle, FileWarning, BarChart3 } from 'lucide-react';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { SEO_MATERIALS, type SeoCity, type ContentSection, type FaqItem, generateInternalLinks } from '@/lib/seo-engine';
import { SEO_JOB_TYPES } from '@/lib/seo-jobs';
import { SEO_ZIP_DATA, getZipsByCity } from '@/lib/seo-zips';
import { selectCityFaqs } from '@/lib/seo-faqs';
import { runQualityGates, type QualityGateResult } from '@/lib/seo-quality-gates';

export default function SeoHealthPage() {
  const { data: cities } = useQuery({
    queryKey: ['seo-health-cities'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('is_active', true).order('city_name');
      return (data || []) as SeoCity[];
    },
  });

  // Run quality gates on all page types
  const healthResults: QualityGateResult[] = [];

  if (cities) {
    for (const city of cities) {
      const neighborhoods = city.neighborhoods_json || [];

      // City page check
      const cityFaqs = selectCityFaqs(city.city_name, 'Oakland Yard', 8, city.city_slug);
      const cityLinks = generateInternalLinks(city, 'CITY', cities);
      const citySections: Array<{ heading?: string; body?: string; items?: Array<{ label: string; value: string }> }> = [
        { heading: `Dumpster Rental in ${city.city_name}, CA`, body: city.local_intro || '' },
        { heading: `Dumpster Sizes Available in ${city.city_name}`, body: `Choose from 7 sizes for your ${city.city_name} project.`, items: DUMPSTER_SIZES_DATA.map(s => ({ label: `${s.yards} Yard`, value: `From $${s.priceFrom}` })) },
        { heading: `Popular Materials in ${city.city_name}`, items: SEO_MATERIALS.map(m => ({ label: m.name, value: m.description })) },
        { heading: `${city.city_name} Disposal Rules`, body: city.dump_rules || '' },
        { heading: `${city.city_name} Permit Information`, body: city.permit_info || '' },
        { heading: `${city.city_name} Pricing`, body: city.pricing_note || '' },
        { heading: `Neighborhoods We Serve in ${city.city_name}`, body: `We deliver dumpsters throughout ${city.city_name}, including ${neighborhoods.slice(0, 6).join(', ')}.` },
      ];
      healthResults.push(runQualityGates('CITY', `/dumpster-rental/${city.city_slug}`, citySections, cityFaqs, cityLinks.length, neighborhoods));

      // Size pages
      for (const size of (city.common_sizes_json || [10, 20, 30, 40])) {
        const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === size);
        if (!sizeData) continue;
        const sizeSections = [
          { heading: `${size} Yard Dumpster Rental in ${city.city_name}, CA`, body: `The ${size}-yard dumpster (${sizeData.dimensions}) is ideal for ${sizeData.useCases.join(', ').toLowerCase()} in ${city.city_name}.` },
          { heading: `${size} Yard Pricing`, body: `Starting from $${sizeData.priceFrom}. Includes ${sizeData.includedTons} ton(s) and ${PRICING_POLICIES.standardRentalDays}-day rental.` },
          { heading: `Other Sizes in ${city.city_name}`, items: DUMPSTER_SIZES_DATA.filter(s => s.yards !== size).map(s => ({ label: `${s.yards} Yard`, value: `From $${s.priceFrom}` })) },
        ];
        const sizeFaqs = [
          { question: `How much does a ${size}-yard dumpster cost in ${city.city_name}?`, answer: `Starting from $${sizeData.priceFrom}.` },
          { question: `What fits in a ${size}-yard dumpster?`, answer: `${sizeData.loads}. Common uses: ${sizeData.useCases.join(', ')}.` },
          { question: `How fast can I get a ${size}-yard in ${city.city_name}?`, answer: `Same-day delivery available.` },
        ];
        const sizeLinks = generateInternalLinks(city, 'CITY_SIZE', cities);
        healthResults.push(runQualityGates('CITY_SIZE', `/${city.city_slug}/${size}-yard-dumpster`, sizeSections, sizeFaqs, sizeLinks.length, neighborhoods));
      }

      // Material pages
      for (const mat of SEO_MATERIALS) {
        const matSections = [
          { heading: `${mat.name} Dumpster Rental in ${city.city_name}, CA`, body: `${mat.description} Serving ${city.city_name}.` },
          { heading: `Recommended Sizes for ${mat.name}`, items: mat.sizes.map(sz => ({ label: `${sz} Yard`, value: '' })) },
          { heading: `${mat.name} Disposal Pricing`, body: mat.category === 'heavy' ? 'Flat-fee pricing.' : `$${PRICING_POLICIES.overagePerTonGeneral}/ton overage.` },
        ];
        const matFaqs = [
          { question: `Can I put ${mat.name.toLowerCase()} in a dumpster?`, answer: 'Yes.' },
          { question: `What size for ${mat.name.toLowerCase()}?`, answer: `${mat.sizes.join(', ')} yard.` },
        ];
        const matLinks = generateInternalLinks(city, 'CITY_MATERIAL', cities);
        healthResults.push(runQualityGates('CITY_MATERIAL', `/${city.city_slug}/${mat.slug}`, matSections, matFaqs, matLinks.length, neighborhoods));
      }
    }

    // ZIP pages
    for (const z of SEO_ZIP_DATA.filter(z => z.tier === 'A').slice(0, 20)) {
      const zipSections = [
        { heading: `Dumpster Rental in ${z.zip}`, body: `ZIP code ${z.zip} covers ${z.neighborhoods.join(', ')} in ${z.city}, CA.` },
        { heading: `Dumpster Sizes for ${z.zip}`, items: DUMPSTER_SIZES_DATA.map(s => ({ label: `${s.yards} Yard`, value: `From $${s.priceFrom}` })) },
        { heading: `Materials in ${z.zip}`, body: 'Heavy materials flat-fee. General debris overage $165/ton.' },
        { heading: `Why Calsan for ${z.zip}`, body: 'Real local yard, transparent weight rules, professional dispatch, bilingual support.' },
      ];
      const zipFaqs = Array.from({ length: 8 }, (_, i) => ({
        question: `FAQ ${i + 1} for ${z.zip}`,
        answer: `Answer about dumpster service in ${z.neighborhoods.join(', ')}, ${z.city}.`,
      }));
      healthResults.push(runQualityGates('ZIP', `/service-area/${z.zip}/dumpster-rental`, zipSections, zipFaqs, 6, z.neighborhoods));
    }
  }

  const passedCount = healthResults.filter(r => r.passed).length;
  const failedResults = healthResults.filter(r => !r.passed);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground">SEO Health Check</h1>
        <p className="text-muted-foreground">Quality gates for all SEO pages. Failing checks show as warnings — pages still render.</p>
      </div>

      {/* Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><BarChart3 className="w-4 h-4 text-primary" /><span className="text-xs text-muted-foreground">Total Pages</span></div>
          <div className="text-2xl font-bold text-foreground">{healthResults.length}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><CheckCircle className="w-4 h-4 text-emerald-600" /><span className="text-xs text-muted-foreground">Passing</span></div>
          <div className="text-2xl font-bold text-emerald-600">{passedCount}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><AlertTriangle className="w-4 h-4 text-amber-600" /><span className="text-xs text-muted-foreground">Warnings</span></div>
          <div className="text-2xl font-bold text-amber-600">{failedResults.length}</div>
        </div>
        <div className="bg-card border border-border rounded-xl p-4">
          <div className="flex items-center gap-2 mb-2"><FileWarning className="w-4 h-4 text-amber-600" /><span className="text-xs text-muted-foreground">Pass Rate</span></div>
          <div className="text-2xl font-bold text-foreground">{healthResults.length > 0 ? Math.round((passedCount / healthResults.length) * 100) : 0}%</div>
        </div>
      </div>

      {/* Warning Pages */}
      {failedResults.length > 0 && (
        <div className="bg-card border border-amber-200 rounded-xl overflow-hidden">
          <div className="p-4 border-b border-amber-200 bg-amber-50/50">
            <h2 className="font-semibold text-amber-700 flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Quality Warnings ({failedResults.length})</h2>
          </div>
          <div className="max-h-[500px] overflow-auto">
            <table className="w-full text-sm">
              <thead className="sticky top-0 bg-muted/50">
                <tr className="border-b border-border">
                  <th className="text-left p-3 font-medium text-muted-foreground">URL</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Words</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">FAQs</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Links</th>
                  <th className="text-center p-3 font-medium text-muted-foreground">Local</th>
                  <th className="text-left p-3 font-medium text-muted-foreground">Issues</th>
                </tr>
              </thead>
              <tbody>
                {failedResults.map((r, i) => (
                  <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                    <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.url}</code></td>
                    <td className="p-3"><Badge variant="outline">{r.pageType}</Badge></td>
                    <td className="p-3 text-center">
                      <span className={r.checks[0]?.passed ? 'text-emerald-600' : 'text-amber-600 font-semibold'}>{r.wordCount}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={r.checks[1]?.passed ? 'text-emerald-600' : 'text-amber-600 font-semibold'}>{r.faqCount}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={r.checks[2]?.passed ? 'text-emerald-600' : 'text-amber-600 font-semibold'}>{r.internalLinkCount}</span>
                    </td>
                    <td className="p-3 text-center">
                      <span className={r.checks[3]?.passed ? 'text-emerald-600' : 'text-amber-600 font-semibold'}>{r.neighborhoodMentions}</span>
                    </td>
                    <td className="p-3">
                      <div className="flex flex-wrap gap-1">
                        {r.checks.filter(c => !c.passed).map((c, j) => (
                          <Badge key={j} className="text-xs bg-amber-100 text-amber-800 border-amber-300">{c.name}: {String(c.actual)}/{String(c.required)}</Badge>
                        ))}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* All Pages Summary */}
      <div className="bg-card border border-border rounded-xl overflow-hidden">
        <div className="p-4 border-b border-border">
          <h2 className="font-semibold text-foreground">All Pages Quality Summary</h2>
        </div>
        <div className="max-h-[400px] overflow-auto">
          <table className="w-full text-sm">
            <thead className="sticky top-0 bg-muted/50">
              <tr className="border-b border-border">
                <th className="text-left p-3 font-medium text-muted-foreground">URL</th>
                <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Words</th>
                <th className="text-center p-3 font-medium text-muted-foreground">FAQs</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Links</th>
                <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
              </tr>
            </thead>
            <tbody>
              {healthResults.map((r, i) => (
                <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                  <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.url}</code></td>
                  <td className="p-3"><Badge variant="outline" className="text-xs">{r.pageType}</Badge></td>
                  <td className="p-3 text-center">{r.wordCount}</td>
                  <td className="p-3 text-center">{r.faqCount}</td>
                  <td className="p-3 text-center">{r.internalLinkCount}</td>
                  <td className="p-3 text-center">
                    {r.passed
                      ? <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" />
                      : <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto" />
                    }
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
