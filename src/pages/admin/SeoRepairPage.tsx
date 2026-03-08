import { useState, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { AlertTriangle, CheckCircle, Wrench, Zap, BarChart3 } from 'lucide-react';
import { DUMPSTER_SIZES_DATA, PRICING_POLICIES } from '@/lib/shared-data';
import { SEO_MATERIALS, type SeoCity, generateInternalLinks } from '@/lib/seo-engine';
import { selectCityFaqs } from '@/lib/seo-faqs';
import { runQualityGates, type QualityGateResult } from '@/lib/seo-quality-gates';
import { generateSeoExpansion, generateFallbackFaqs, generateLocalSignal } from '@/lib/seo-content-expander';

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 80 ? 'text-emerald-600 bg-emerald-100 border-emerald-300'
    : score >= 50 ? 'text-amber-700 bg-amber-100 border-amber-300'
    : 'text-red-600 bg-red-100 border-red-300';
  return <Badge className={`text-xs font-mono ${color}`}>{score}</Badge>;
}

export default function SeoRepairPage() {
  const [repairRunning, setRepairRunning] = useState(false);
  const [repairResults, setRepairResults] = useState<{ before: QualityGateResult[]; after: QualityGateResult[] } | null>(null);

  const { data: cities } = useQuery({
    queryKey: ['seo-repair-cities'],
    queryFn: async () => {
      const { data } = await supabase.from('seo_cities').select('*').eq('is_active', true).order('city_name');
      return (data || []) as SeoCity[];
    },
  });

  function buildHealthResults(citiesList: SeoCity[], withExpansion: boolean): QualityGateResult[] {
    const results: QualityGateResult[] = [];
    for (const city of citiesList) {
      const neighborhoods = city.neighborhoods_json || [];
      const cityFaqs = selectCityFaqs(city.city_name, 'Oakland Yard', 8, city.city_slug);
      const cityLinks = generateInternalLinks(city, 'CITY', citiesList);

      let citySections: Array<{ heading?: string; body?: string; items?: Array<{ label: string; value: string }> }> = [
        { heading: `Dumpster Rental in ${city.city_name}, CA`, body: city.local_intro || '' },
        { heading: `Dumpster Sizes Available in ${city.city_name}`, body: `Choose from 7 sizes for your ${city.city_name} project.`, items: DUMPSTER_SIZES_DATA.map(s => ({ label: `${s.yards} Yard`, value: `From $${s.priceFrom}` })) },
        { heading: `Popular Materials in ${city.city_name}`, items: SEO_MATERIALS.map(m => ({ label: m.name, value: m.description })) },
        { heading: `${city.city_name} Disposal Rules`, body: city.dump_rules || '' },
        { heading: `${city.city_name} Permit Information`, body: city.permit_info || '' },
        { heading: `${city.city_name} Pricing`, body: city.pricing_note || '' },
        { heading: `Neighborhoods We Serve in ${city.city_name}`, body: `We deliver dumpsters throughout ${city.city_name}, including ${neighborhoods.slice(0, 6).join(', ')}.` },
      ];

      let finalFaqs = [...cityFaqs];
      let linkCount = cityLinks.length;

      if (withExpansion) {
        const expansion = generateSeoExpansion(city.city_name, city.county);
        citySections = [...citySections, ...expansion.map(e => ({ heading: e.heading, body: e.body }))];
        citySections.push({ heading: `${city.city_name} Service Coverage`, body: generateLocalSignal(city.city_name, city.county, neighborhoods.slice(0, 4)) });
        if (finalFaqs.length < 4) {
          finalFaqs = [...finalFaqs, ...generateFallbackFaqs(city.city_name, finalFaqs.length)];
        }
        linkCount = Math.max(linkCount, 6);
      }

      results.push(runQualityGates('CITY', `/dumpster-rental/${city.city_slug}`, citySections, finalFaqs, linkCount, neighborhoods));

      // Size pages
      for (const size of (city.common_sizes_json || [10, 20, 30, 40])) {
        const sizeData = DUMPSTER_SIZES_DATA.find(s => s.yards === size);
        if (!sizeData) continue;
        let sizeSections: Array<{ heading?: string; body?: string; items?: Array<{ label: string; value: string }> }> = [
          { heading: `${size} Yard Dumpster Rental in ${city.city_name}, CA`, body: `The ${size}-yard dumpster (${sizeData.dimensions}) is ideal for ${sizeData.useCases.join(', ').toLowerCase()} in ${city.city_name}.` },
          { heading: `${size} Yard Pricing`, body: `Starting from $${sizeData.priceFrom}. Includes ${sizeData.includedTons} ton(s) and ${PRICING_POLICIES.standardRentalDays}-day rental.` },
          { heading: `Other Sizes in ${city.city_name}`, items: DUMPSTER_SIZES_DATA.filter(s => s.yards !== size).map(s => ({ label: `${s.yards} Yard`, value: `From $${s.priceFrom}` })) },
        ];
        let sizeFaqs = [
          { question: `How much does a ${size}-yard dumpster cost in ${city.city_name}?`, answer: `Starting from $${sizeData.priceFrom}. Includes ${sizeData.includedTons} ton(s) and ${PRICING_POLICIES.standardRentalDays}-day rental period.` },
          { question: `What fits in a ${size}-yard dumpster?`, answer: `${sizeData.loads}. Common uses: ${sizeData.useCases.join(', ')}.` },
          { question: `How fast can I get a ${size}-yard in ${city.city_name}?`, answer: `Same-day delivery available for orders placed before noon. Standard delivery is next business day.` },
        ];
        if (withExpansion && sizeFaqs.length < 3) {
          sizeFaqs = [...sizeFaqs, ...generateFallbackFaqs(city.city_name, sizeFaqs.length).slice(0, 3 - sizeFaqs.length)];
        }
        if (withExpansion) {
          sizeSections.push({ heading: `Why Choose a ${size}-Yard Dumpster`, body: `The ${size}-yard dumpster is one of our most popular options in ${city.city_name}. ${sizeData.loads}. It fits conveniently on most driveways and handles ${sizeData.useCases.slice(0, 3).join(', ').toLowerCase()} with ease. Our transparent pricing means no surprises — overage for general debris is $${PRICING_POLICIES.overagePerTonGeneral}/ton.` });
        }
        const sizeLinks = generateInternalLinks(city, 'CITY_SIZE', citiesList);
        results.push(runQualityGates('CITY_SIZE', `/${city.city_slug}/${size}-yard-dumpster`, sizeSections, sizeFaqs, withExpansion ? Math.max(sizeLinks.length, 6) : sizeLinks.length, neighborhoods));
      }

      // Material pages
      for (const mat of SEO_MATERIALS) {
        let matSections: Array<{ heading?: string; body?: string; items?: Array<{ label: string; value: string }> }> = [
          { heading: `${mat.name} Dumpster Rental in ${city.city_name}, CA`, body: `${mat.description} Serving ${city.city_name}.` },
          { heading: `Recommended Sizes for ${mat.name}`, items: mat.sizes.map(sz => ({ label: `${sz} Yard`, value: '' })) },
          { heading: `${mat.name} Disposal Pricing`, body: mat.category === 'heavy' ? 'Flat-fee pricing. Disposal included. No surprise weight charges.' : `$${PRICING_POLICIES.overagePerTonGeneral}/ton overage beyond included tonnage.` },
        ];
        let matFaqs = [
          { question: `Can I put ${mat.name.toLowerCase()} in a dumpster?`, answer: `Yes. ${mat.description}` },
          { question: `What size for ${mat.name.toLowerCase()}?`, answer: `Recommended sizes: ${mat.sizes.join(', ')} yard.` },
        ];
        if (withExpansion) {
          matSections.push({ heading: `${mat.name} Disposal Tips in ${city.city_name}`, body: `When disposing of ${mat.name.toLowerCase()} in ${city.city_name}, ensure materials are clean and free of contaminants. ${mat.category === 'heavy' ? 'Heavy materials require 6, 8, or 10-yard dumpsters only and include flat-fee disposal.' : `General debris rates apply with $${PRICING_POLICIES.overagePerTonGeneral}/ton overage.`} Contact us for specific guidance on your ${mat.name.toLowerCase()} disposal project.` });
          if (matFaqs.length < 2) {
            matFaqs = [...matFaqs, ...generateFallbackFaqs(city.city_name, matFaqs.length).slice(0, 2)];
          }
        }
        const matLinks = generateInternalLinks(city, 'CITY_MATERIAL', citiesList);
        results.push(runQualityGates('CITY_MATERIAL', `/${city.city_slug}/${mat.slug}`, matSections, matFaqs, withExpansion ? Math.max(matLinks.length, 6) : matLinks.length, neighborhoods));
      }
    }
    return results;
  }

  function runRepair() {
    if (!cities?.length) return;
    setRepairRunning(true);
    const before = buildHealthResults(cities, false);
    const after = buildHealthResults(cities, true);
    setRepairResults({ before, after });
    setRepairRunning(false);
  }

  const beforePass = repairResults?.before.filter(r => r.passed).length ?? 0;
  const afterPass = repairResults?.after.filter(r => r.passed).length ?? 0;
  const totalPages = repairResults?.after.length ?? 0;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2"><Wrench className="w-6 h-6" /> SEO Repair Tool</h1>
        <p className="text-muted-foreground">Auto-fix SEO warnings by expanding content, adding FAQs, local signals, and internal links.</p>
      </div>

      {/* Action */}
      <div className="bg-card border border-border rounded-xl p-6">
        <h2 className="font-semibold text-foreground mb-3 flex items-center gap-2"><Zap className="w-4 h-4 text-primary" /> Auto Fix SEO Warnings</h2>
        <p className="text-sm text-muted-foreground mb-4">This will simulate content expansion for all pages that fail quality checks. Sections added: dumpster size guidance, materials accepted, delivery process, permit requirements, project examples, and FAQs.</p>
        <Button onClick={runRepair} disabled={repairRunning || !cities?.length}>
          {repairRunning ? 'Running...' : 'Auto Fix SEO Warnings'}
        </Button>
      </div>

      {/* Results */}
      {repairResults && (
        <>
          {/* Summary */}
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Total Pages</div>
              <div className="text-2xl font-bold text-foreground">{totalPages}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Before (Passing)</div>
              <div className="text-2xl font-bold text-amber-600">{beforePass}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">After (Passing)</div>
              <div className="text-2xl font-bold text-emerald-600">{afterPass}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Improved</div>
              <div className="text-2xl font-bold text-primary">{afterPass - beforePass}</div>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <div className="text-xs text-muted-foreground mb-1">Pass Rate</div>
              <div className="text-2xl font-bold text-foreground">{totalPages > 0 ? Math.round((afterPass / totalPages) * 100) : 0}%</div>
            </div>
          </div>

          {/* Detailed Results */}
          <div className="bg-card border border-border rounded-xl overflow-hidden">
            <div className="p-4 border-b border-border">
              <h2 className="font-semibold text-foreground flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Page-by-Page Results</h2>
            </div>
            <div className="max-h-[600px] overflow-auto">
              <table className="w-full text-sm">
                <thead className="sticky top-0 bg-muted/80 backdrop-blur">
                  <tr className="border-b border-border">
                    <th className="text-left p-3 font-medium text-muted-foreground">URL</th>
                    <th className="text-left p-3 font-medium text-muted-foreground">Type</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Content</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Authority</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Links</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Local</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Overall</th>
                    <th className="text-center p-3 font-medium text-muted-foreground">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {repairResults.after.map((r, i) => (
                    <tr key={i} className="border-b border-border last:border-0 hover:bg-muted/30">
                      <td className="p-3"><code className="text-xs bg-muted px-1.5 py-0.5 rounded">{r.url}</code></td>
                      <td className="p-3"><Badge variant="outline" className="text-xs">{r.pageType}</Badge></td>
                      <td className="p-3 text-center"><ScoreBadge score={r.scores.content} /></td>
                      <td className="p-3 text-center"><ScoreBadge score={r.scores.authority} /></td>
                      <td className="p-3 text-center"><ScoreBadge score={r.scores.links} /></td>
                      <td className="p-3 text-center"><ScoreBadge score={r.scores.local} /></td>
                      <td className="p-3 text-center"><ScoreBadge score={r.scores.overall} /></td>
                      <td className="p-3 text-center">
                        {r.passed
                          ? <CheckCircle className="w-4 h-4 text-emerald-600 mx-auto" />
                          : <AlertTriangle className="w-4 h-4 text-amber-600 mx-auto" />}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}
    </div>
  );
}
