import { Layout } from '@/components/layout/Layout';
import { CTAButtons, TrustStrip } from '@/components/shared';
import { Link } from 'react-router-dom';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { 
  Package, Scale, Shield, Truck, FileText, Recycle, 
  Ban, Calendar, AlertCircle, Ruler, ClipboardCheck,
  CheckCircle, ChevronRight, HardHat
} from 'lucide-react';

// Section data with icons
const BEST_PRACTICES_SECTIONS = [
  {
    id: 'materials',
    number: 1,
    title: 'Choose the correct dumpster for your material',
    subtitle: 'Most important',
    icon: Package,
    content: (
      <div className="space-y-4">
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">Inert materials: Concrete, dirt/soil, brick, asphalt</h4>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Use inert-only dumpsters (typically 5-yd or 10-yd)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Pure loads only — no trash or mixed debris
            </li>
          </ul>
          <div className="mt-3 p-3 bg-warning/10 border border-warning/30 rounded-lg">
            <p className="text-sm text-warning-foreground font-medium flex items-start gap-2">
              <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
              <span><strong>Important:</strong> Mixing trash triggers reclassification and fees; always use separate containers.</span>
            </p>
          </div>
        </div>
        
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-2">General debris: wood, drywall, plastics, packaging, junk</h4>
          <ul className="space-y-2 text-muted-foreground text-sm">
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Use general debris dumpsters (10/20/30/40/50)
            </li>
            <li className="flex items-start gap-2">
              <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
              Each size includes a specific weight allowance
            </li>
          </ul>
          <p className="mt-3 text-sm text-muted-foreground">
            <strong>Why it matters:</strong> Heavy materials count toward limits; keep heavy & light separate.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'weight',
    number: 2,
    title: 'Understand weight & overage rules',
    subtitle: 'Different rules for heavy vs general',
    icon: Scale,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-success/10 flex items-center justify-center shrink-0">
              <Package className="w-4 h-4 text-success" />
            </div>
            <div>
              <span className="font-medium text-foreground">Heavy/Inert dumpsters (6-10yd):</span> <span className="text-success font-semibold">FLAT FEE</span> — Disposal included with no extra weight charges. Pure loads only (concrete, dirt, brick, asphalt).
            </div>
          </li>
          <li className="flex items-start gap-3">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
              <Scale className="w-4 h-4 text-primary" />
            </div>
            <div>
              <span className="font-medium text-foreground">General debris (all sizes):</span> Includes weight by size. Overage: <span className="font-semibold">$165/ton</span> based on scale ticket.
            </div>
          </li>
        </ul>
        <div className="p-3 bg-warning/10 border border-warning/30 rounded-lg">
          <p className="text-sm text-warning-foreground">
            <strong>Note:</strong> If inert/heavy load contains trash, it may be reclassified and different rates apply.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'loading',
    number: 3,
    title: 'Load the dumpster safely and correctly',
    subtitle: null,
    icon: Shield,
    content: (
      <ul className="space-y-3 text-muted-foreground">
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          Distribute weight evenly; heavy at bottom
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          Do not overfill above rim
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          Use rear door when available; secure before pickup
        </li>
        <li className="flex items-start gap-2">
          <Ban className="w-4 h-4 text-destructive mt-0.5 shrink-0" />
          Never load prohibited/hazardous materials
        </li>
      </ul>
    ),
  },
  {
    id: 'site-prep',
    number: 4,
    title: 'Prepare the site for delivery and pickup',
    subtitle: null,
    icon: Truck,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span><strong>Access:</strong> ~60 feet straight-line access</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span><strong>Overhead clearance:</strong> 23–25 feet</span>
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            <span><strong>Surface:</strong> Flat, hard surfaces preferred</span>
          </li>
        </ul>
        <div className="p-3 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Note:</strong> You don't need to be onsite, but availability helps on tight sites.
          </p>
        </div>
      </div>
    ),
  },
  {
    id: 'permits',
    number: 5,
    title: 'Street placement & permits',
    subtitle: null,
    icon: FileText,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            Public right-of-way often requires city permit/reservation
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            Contractors responsible for permits
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            If unsure, we can point you in the right direction by city
          </li>
        </ul>
        <Link 
          to="/contractors#permit-helper" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          View City Permit Helper <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
  {
    id: 'recycling',
    number: 6,
    title: 'Recycling & diversion compliance (WMP / Green Halo)',
    subtitle: null,
    icon: Recycle,
    content: (
      <div className="space-y-4">
        <ul className="space-y-3 text-muted-foreground">
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            Many cities require WMP, diversion tracking, and weight ticket uploads
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            Requirements vary by city/project
          </li>
          <li className="flex items-start gap-2">
            <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
            Working with a compliant hauler simplifies compliance
          </li>
        </ul>
        <Link 
          to="/green-halo" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          Learn about Green Halo™ tracking <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
  {
    id: 'prohibited',
    number: 7,
    title: 'Materials not allowed in dumpsters',
    subtitle: null,
    icon: Ban,
    content: (
      <div className="space-y-4">
        <div className="p-4 bg-destructive/5 border border-destructive/20 rounded-lg">
          <h4 className="font-semibold text-destructive mb-2">Prohibited materials:</h4>
          <p className="text-sm text-muted-foreground">
            Hazardous waste, batteries, medical waste, pressurized tanks, certain electronics/appliances
          </p>
        </div>
        <div className="p-4 bg-muted rounded-lg">
          <p className="text-sm text-muted-foreground">
            <strong>Special handling:</strong> Some items may be accepted with additional fees (mattresses, appliances, tires) — ask first.
          </p>
        </div>
        <Link 
          to="/materials" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          View full materials guide <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
  {
    id: 'rental-basics',
    number: 8,
    title: 'Rental basics (how our service works)',
    subtitle: null,
    icon: Calendar,
    content: (
      <ul className="space-y-3 text-muted-foreground">
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          Delivery and pickup included
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          7-day rental period included by default
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          Same-day delivery may be available (order before noon)
        </li>
        <li className="flex items-start gap-2">
          <CheckCircle className="w-4 h-4 text-success mt-0.5 shrink-0" />
          Keep access clear on pickup day to avoid failed pickup charges
        </li>
      </ul>
    ),
  },
  {
    id: 'avoidable-fees',
    number: 9,
    title: 'Fees you can easily avoid',
    subtitle: null,
    icon: AlertCircle,
    content: (
      <div className="grid sm:grid-cols-2 gap-3">
        {[
          { fee: 'Same-day service fee', tip: 'Order day before' },
          { fee: 'Blocked access / failed delivery', tip: 'Keep path clear' },
          { fee: 'Wrong materials (reclassification)', tip: 'Separate heavy from general' },
          { fee: 'Overfilled dumpsters', tip: 'Load below rim only' },
        ].map((item) => (
          <div key={item.fee} className="p-3 bg-muted/50 rounded-lg">
            <p className="font-medium text-foreground text-sm">{item.fee}</p>
            <p className="text-xs text-muted-foreground mt-1">Tip: {item.tip}</p>
          </div>
        ))}
      </div>
    ),
  },
  {
    id: 'sizing-guide',
    number: 10,
    title: 'Dumpster sizing quick guide',
    subtitle: null,
    icon: Ruler,
    content: (
      <div className="space-y-4">
        <div className="bg-success/5 border border-success/30 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-1">Inert (Heavy Materials) — FLAT FEE</h4>
          <p className="text-xs text-success mb-3">Disposal included, no extra weight charges</p>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong>6 yd:</strong> Small pads, trenches, walkways</li>
            <li><strong>8 yd:</strong> Driveway removal, foundation work</li>
            <li><strong>10 yd:</strong> Flatwork, masonry, tear-outs</li>
          </ul>
        </div>
        <div className="bg-muted/50 rounded-lg p-4">
          <h4 className="font-semibold text-foreground mb-3">General Debris</h4>
          <ul className="space-y-2 text-sm text-muted-foreground">
            <li><strong>5-10 yd:</strong> Small remodel, garage cleanout <span className="text-xs text-muted-foreground">(overage: $30/yard)</span></li>
            <li><strong>20 yd:</strong> Medium remodel, roofing projects <span className="text-xs text-muted-foreground">(2T included, overage: $165/ton)</span></li>
            <li><strong>30 yd:</strong> Large renovation, small demo <span className="text-xs text-muted-foreground">(3T included, overage: $165/ton)</span></li>
            <li><strong>40-50 yd:</strong> Large demos, commercial projects <span className="text-xs text-muted-foreground">(4-5T included, overage: $165/ton)</span></li>
          </ul>
        </div>
        <Link 
          to="/sizes" 
          className="inline-flex items-center gap-2 text-sm text-primary hover:underline"
        >
          View all dumpster sizes with dimensions <ChevronRight className="w-4 h-4" />
        </Link>
      </div>
    ),
  },
  {
    id: 'inspection-checklist',
    number: 11,
    title: 'Inspection-ready checklist',
    subtitle: null,
    icon: ClipboardCheck,
    content: (
      <div className="space-y-3">
        {[
          'Separate inert vs mixed dumpsters',
          'Track/upload weight tickets',
          'Load evenly and below rim',
          'Keep access clear for pickups',
          'Work with compliant haulers',
        ].map((item, i) => (
          <div key={i} className="flex items-center gap-3 p-3 bg-success/5 border border-success/20 rounded-lg">
            <div className="w-6 h-6 rounded-full bg-success flex items-center justify-center">
              <CheckCircle className="w-4 h-4 text-success-foreground" />
            </div>
            <span className="text-sm font-medium text-foreground">{item}</span>
          </div>
        ))}
      </div>
    ),
  },
];

export default function ContractorBestPractices() {
  return (
    <Layout
      title="Dumpster Rental Best Practices for Contractors | Bay Area | CALSAN Dumpsters"
      description="Contractor dumpster rental best practices for the Bay Area. Choose the right size, avoid fees, stay compliant with WMP requirements. Professional guide from CALSAN Dumpsters."
      canonical="/contractor-best-practices"
    >
      {/* Hero Section */}
      <section className="bg-gradient-to-br from-primary/5 via-background to-muted py-12 lg:py-16">
        <div className="container-wide">
          <div className="max-w-3xl">
            <TrustStrip 
              badges={['licensedInsured', 'fiveStarReviews', 'googleGuaranteed']}
              variant="light"
              className="mb-6"
            />
            
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 rounded-xl bg-primary flex items-center justify-center">
                <HardHat className="w-6 h-6 text-primary-foreground" />
              </div>
              <span className="text-sm font-medium text-primary bg-primary/10 px-3 py-1 rounded-full">
                Contractor Resource
              </span>
            </div>
            
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-foreground mb-4 leading-tight">
              Dumpster Rental Best Practices
              <span className="block text-primary mt-1">for Contractors</span>
            </h1>
            
            <p className="text-lg text-muted-foreground mb-4 max-w-2xl">
              Built to keep your job moving, inspections clean, and costs predictable.
            </p>
            
            <p className="text-base text-muted-foreground mb-8 max-w-2xl">
              Our goal is simple: help contractors choose the right dumpster, stay compliant with local rules, and avoid unnecessary fees. This guide highlights what matters most in the field.
            </p>
            
            <CTAButtons variant="hero" />
          </div>
        </div>
      </section>

      {/* Best Practices Accordion */}
      <section className="py-12 lg:py-16 bg-background">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <Accordion type="multiple" className="space-y-4">
              {BEST_PRACTICES_SECTIONS.map((section) => (
                <AccordionItem 
                  key={section.id} 
                  value={section.id}
                  className="bg-card border border-border rounded-xl overflow-hidden shadow-sm"
                >
                  <AccordionTrigger className="px-5 py-4 hover:no-underline hover:bg-muted/50 transition-colors [&[data-state=open]]:bg-muted/30">
                    <div className="flex items-center gap-4 text-left">
                      <div className="flex items-center justify-center w-10 h-10 rounded-lg bg-primary/10 text-primary shrink-0">
                        <section.icon className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-bold text-primary bg-primary/10 px-2 py-0.5 rounded">
                            {section.number}
                          </span>
                          <h3 className="font-semibold text-foreground">{section.title}</h3>
                        </div>
                        {section.subtitle && (
                          <p className="text-sm text-muted-foreground mt-0.5">{section.subtitle}</p>
                        )}
                      </div>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-5 pb-5 pt-2">
                    {section.content}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </div>
      </section>

      {/* Internal Links Section */}
      <section className="py-12 bg-muted/30">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-xl font-bold text-foreground mb-6">Related Resources</h2>
            <div className="grid sm:grid-cols-2 lg:grid-cols-5 gap-4">
              {[
                { to: '/pricing', label: 'Pricing', desc: 'Transparent rates' },
                { to: '/sizes', label: 'Dumpster Sizes', desc: 'Find your fit' },
                { to: '/capacity-guide', label: 'Capacity Guide', desc: 'Pickup loads & scenarios' },
                { to: '/areas', label: 'Service Areas', desc: 'Bay Area coverage' },
                { to: '/green-halo', label: 'Green Halo™', desc: 'Sustainability tracking' },
              ].map((link) => (
                <Link 
                  key={link.to}
                  to={link.to}
                  className="flex items-center gap-3 p-4 bg-card rounded-xl border border-border hover:border-primary/50 hover:shadow-md transition-all group"
                >
                  <div className="flex-1">
                    <p className="font-semibold text-foreground group-hover:text-primary transition-colors">{link.label}</p>
                    <p className="text-sm text-muted-foreground">{link.desc}</p>
                  </div>
                  <ChevronRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors" />
                </Link>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 lg:py-20 bg-gradient-to-br from-primary to-primary/80">
        <div className="container-wide">
          <div className="max-w-3xl mx-auto text-center">
            <h2 className="text-2xl md:text-3xl lg:text-4xl font-extrabold text-primary-foreground mb-4">
              Need help choosing the right dumpster?
            </h2>
            <p className="text-lg text-primary-foreground/90 mb-8 max-w-2xl mx-auto">
              Tell us your material type, estimated volume, and job location. We'll recommend the safest, most cost-effective option and flag any permit or compliance considerations.
            </p>
            <CTAButtons 
              variant="hero" 
              className="justify-center"
              quoteLabel="Get Instant Quote"
            />
          </div>
        </div>
      </section>
    </Layout>
  );
}
