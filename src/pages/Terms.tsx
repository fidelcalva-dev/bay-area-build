import { Layout } from '@/components/layout/Layout';
import { BUSINESS_INFO } from '@/lib/seo';
import {
  POLICY_VERSION,
  TERMS_VERSION,
  SERVICE_WINDOWS_NOTICE,
  PAYMENT_TERMS_NOTICE,
  CONTAINER_RESPONSIBILITY_NOTICE,
  PROHIBITED_MATERIALS_NOTICE,
  HEAVY_MATERIAL_NOTICE,
  CONTAMINATION_NOTICE,
  MISDECLARED_REROUTE_NOTICE,
  OVERAGE_NOTICE,
  PLACEMENT_PERMIT_NOTICE,
  EXTRA_DAY_NOTICE,
  DRY_RUN_NOTICE,
  FILL_LINE_NOTICE,
  CANCELLATION_NOTICE,
  ESIGN_CONSENT,
  LIABILITY_NOTICE,
  INDEMNIFICATION_NOTICE,
  GOVERNING_LAW_NOTICE,
  PHOTO_DOCUMENTATION_NOTICE,
} from '@/lib/policyLanguage';

export default function Terms() {
  return (
    <Layout
      title="Terms of Service | Calsan Dumpsters Pro"
      description="Terms of service for Calsan Dumpsters Pro dumpster rental services in the San Francisco Bay Area."
      canonical="/terms"
    >
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h1 className="heading-xl text-foreground mb-6">Terms of Service</h1>
          <p className="text-muted-foreground mb-2">Last updated: March 2026</p>
          <p className="text-xs text-muted-foreground mb-8">Terms Version: {TERMS_VERSION} | Policy Version: {POLICY_VERSION}</p>

          <div className="prose prose-lg max-w-none text-foreground">

            <Section num={1} title="Service Agreement">
              By using {BUSINESS_INFO.name} ("Company") services, you agree to these Terms of Service.
              Our services include dumpster rental, delivery, pickup, and waste disposal across the San Francisco Bay Area.
              Individual services are governed by this agreement, the applicable quote, and any Service Addendum for your location.
            </Section>

            <Section num={2} title="Quotes & Estimates">
              All quotes are estimates based on the information you provide, including address, material type, dumpster size, and timing.
              Final billing may differ based on actual weight (scale tickets), material reclassification, extra rental days, or operational exceptions.
              A quote does not guarantee availability until confirmed by our team.
            </Section>

            <Section num={3} title="Service Windows & Scheduling">
              <p className="text-muted-foreground mb-4">
                <strong className="text-foreground">Important:</strong> {SERVICE_WINDOWS_NOTICE.en}
              </p>
              <p className="text-muted-foreground mb-6">
                Weekend service is available by special request only, subject to availability and additional fees.
              </p>
            </Section>

            <Section num={4} title="Accepted & Prohibited Materials">
              <p className="text-muted-foreground mb-6">{PROHIBITED_MATERIALS_NOTICE.en}</p>
              <p className="text-muted-foreground mb-6">
                <strong className="text-foreground">Material Reclassification:</strong> If your load contains materials different from what was quoted
                (e.g., heavy materials in a general debris container), your order may be reclassified and billed at the applicable rate.
              </p>
            </Section>

            <Section num={5} title="Heavy Material Rules">
              <p className="text-muted-foreground mb-4">{HEAVY_MATERIAL_NOTICE.en}</p>
              <p className="text-muted-foreground mb-4">{CONTAMINATION_NOTICE.en}</p>
              <p className="text-muted-foreground mb-4">{MISDECLARED_REROUTE_NOTICE.en}</p>
              <p className="text-muted-foreground mb-6">{FILL_LINE_NOTICE.en}</p>
            </Section>

            <Section num={6} title="Weight & Overage">
              <p className="text-muted-foreground mb-6">{OVERAGE_NOTICE.en}</p>
            </Section>

            <Section num={7} title="Placement, Access & Permits">
              <p className="text-muted-foreground mb-6">{PLACEMENT_PERMIT_NOTICE.en}</p>
            </Section>

            <Section num={8} title="Rental Period & Extra Days">
              <p className="text-muted-foreground mb-6">{EXTRA_DAY_NOTICE.en}</p>
            </Section>

            <Section num={9} title="Dry Runs, Blocked Access & Wait Time">
              <p className="text-muted-foreground mb-6">{DRY_RUN_NOTICE.en}</p>
            </Section>

            <Section num={10} title="Photo Documentation">
              <p className="text-muted-foreground mb-6">{PHOTO_DOCUMENTATION_NOTICE.en}</p>
            </Section>

            <Section num={11} title="Payment Terms">
              <p className="text-muted-foreground mb-6">{PAYMENT_TERMS_NOTICE.en}</p>
            </Section>

            <Section num={12} title="Container Responsibility">
              <p className="text-muted-foreground mb-6">{CONTAINER_RESPONSIBILITY_NOTICE.en}</p>
            </Section>

            <Section num={13} title="Cancellation & Rescheduling">
              <p className="text-muted-foreground mb-6">{CANCELLATION_NOTICE.en}</p>
            </Section>

            <Section num={14} title="Electronic Records & Signatures">
              <p className="text-muted-foreground mb-6">{ESIGN_CONSENT.en}</p>
            </Section>

            <Section num={15} title="Limitation of Liability">
              <p className="text-muted-foreground mb-6">{LIABILITY_NOTICE.en}</p>
            </Section>

            <Section num={16} title="Indemnification">
              <p className="text-muted-foreground mb-6">{INDEMNIFICATION_NOTICE.en}</p>
            </Section>

            <Section num={17} title="Governing Law & Disputes">
              <p className="text-muted-foreground mb-6">{GOVERNING_LAW_NOTICE.en}</p>
            </Section>

            <Section num={18} title="Changes to Terms">
              We reserve the right to modify these Terms at any time. Continued use of our services after changes
              constitutes acceptance of the modified Terms. The version number at the top of this page indicates the current version.
            </Section>

            <h2 className="heading-md mb-4">Contact Us</h2>
            <p className="text-muted-foreground">
              If you have questions about these Terms, contact us at:
            </p>
            <ul className="list-none text-muted-foreground mt-2 space-y-1">
              <li><strong className="text-foreground">Phone:</strong> {BUSINESS_INFO.phone.salesFormatted}</li>
              <li><strong className="text-foreground">Email:</strong> {BUSINESS_INFO.email}</li>
              <li><strong className="text-foreground">Address:</strong> {BUSINESS_INFO.address.full}</li>
            </ul>
          </div>
        </div>
      </section>
    </Layout>
  );
}

function Section({ num, title, children }: { num: number; title: string; children: React.ReactNode }) {
  return (
    <>
      <h2 className="heading-md mb-4">{num}. {title}</h2>
      {typeof children === 'string' ? (
        <p className="text-muted-foreground mb-6">{children}</p>
      ) : (
        children
      )}
    </>
  );
}
