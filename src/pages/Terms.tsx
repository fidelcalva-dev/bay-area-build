import { Layout } from '@/components/layout/Layout';
import { BUSINESS_INFO } from '@/lib/seo';

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
          <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

          <div className="prose prose-lg max-w-none text-foreground">
            <h2 className="heading-md mb-4">1. Service Agreement</h2>
            <p className="text-muted-foreground mb-6">
              By using {BUSINESS_INFO.name} ("Company") services, you agree to these Terms of Service. 
              Our services include dumpster rental, delivery, pickup, and waste disposal across the San Francisco Bay Area.
            </p>

            <h2 className="heading-md mb-4">2. Service Windows & Scheduling</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">Important:</strong> All delivery and pickup times are <strong className="text-foreground">estimated windows</strong>, 
              not guaranteed exact times. Our standard delivery windows are:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-1">
              <li>Morning: 7:00 AM – 11:00 AM</li>
              <li>Midday: 11:00 AM – 3:00 PM</li>
              <li>Afternoon: 3:00 PM – 6:00 PM</li>
            </ul>
            <p className="text-muted-foreground mb-6">
              Traffic, weather, and operational factors may affect arrival times. We will communicate any significant delays.
              Weekend service is available by special request only, subject to availability and additional fees.
            </p>

            <h2 className="heading-md mb-4">3. Payment Terms</h2>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">Pre-Service Payment:</strong> Base rental fees are due before or at the time of delivery.
            </p>
            <p className="text-muted-foreground mb-4">
              <strong className="text-foreground">Post-Service Charges:</strong> Additional charges may apply after pickup, including:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-1">
              <li>Tonnage overages beyond included weight allowance (based on official scale tickets)</li>
              <li>Extended rental days beyond original period</li>
              <li>Dry run fees if access is blocked at time of service</li>
              <li>Prohibited material handling or reclassification fees</li>
              <li>Overfill charges if container exceeds fill line</li>
            </ul>
            <p className="text-muted-foreground mb-6">
              Final billing is determined by official scale ticket weights. You will receive an itemized invoice for any post-service charges.
            </p>

            <h2 className="heading-md mb-4">4. Container Responsibility</h2>
            <p className="text-muted-foreground mb-6">
              While on your property, you are responsible for the dumpster container. In the event of loss, theft, or damage 
              beyond normal wear and tear, you may be charged the replacement value of the container (typically $3,000–$8,000 
              depending on size). We recommend securing the container when possible and ensuring adequate lighting for placement areas.
            </p>

            <h2 className="heading-md mb-4">5. Prohibited Materials</h2>
            <p className="text-muted-foreground mb-4">
              The following materials are <strong className="text-foreground">prohibited</strong> without prior written approval:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-1">
              <li>Hazardous materials (chemicals, paints, solvents, asbestos)</li>
              <li>Medical or biohazardous waste</li>
              <li>Tires (surcharge applies if approved)</li>
              <li>Appliances with refrigerants (freon)</li>
              <li>Electronics (e-waste)</li>
              <li>Mattresses (surcharge applies in some jurisdictions)</li>
              <li>Liquids or containers with liquid residue</li>
            </ul>
            <p className="text-muted-foreground mb-6">
              <strong className="text-foreground">Material Reclassification:</strong> If your load contains materials different from what was quoted 
              (e.g., heavy materials in a general debris container), your order may be reclassified and billed at the applicable rate.
            </p>

            <h2 className="heading-md mb-4">6. Permits & Street Placement</h2>
            <p className="text-muted-foreground mb-6">
              If the dumpster is placed on a public street, sidewalk, or right-of-way, you are responsible for obtaining 
              all required permits from your local municipality. We can provide guidance on permit requirements, but 
              permit acquisition and fees remain your responsibility.
            </p>

            <h2 className="heading-md mb-4">7. Limitation of Liability</h2>
            <p className="text-muted-foreground mb-6">
              {BUSINESS_INFO.name} is not liable for damage to driveways, landscaping, underground utilities, or other property 
              unless caused by gross negligence. We recommend using plywood or boards under containers on sensitive surfaces.
              Our liability is limited to the amount paid for the specific service. We are not responsible for delays, 
              interruptions, or failures due to circumstances beyond our control, including weather, traffic, mechanical issues, 
              or third-party actions.
            </p>

            <h2 className="heading-md mb-4">8. Cancellation Policy</h2>
            <p className="text-muted-foreground mb-6">
              Cancellations made more than 24 hours before scheduled delivery are eligible for a full refund. 
              Cancellations within 24 hours may be subject to a cancellation fee. Once the container is delivered, 
              standard rental charges apply.
            </p>

            <h2 className="heading-md mb-4">9. Indemnification</h2>
            <p className="text-muted-foreground mb-6">
              You agree to indemnify and hold harmless {BUSINESS_INFO.name}, its employees, and contractors from any claims, 
              damages, or expenses arising from your use of our services, including but not limited to improper material disposal, 
              failure to obtain permits, or site conditions.
            </p>

            <h2 className="heading-md mb-4">10. Governing Law</h2>
            <p className="text-muted-foreground mb-6">
              These Terms are governed by the laws of the State of California. Any disputes shall be resolved in the 
              courts of Alameda County, California.
            </p>

            <h2 className="heading-md mb-4">11. Changes to Terms</h2>
            <p className="text-muted-foreground mb-6">
              We reserve the right to modify these Terms at any time. Continued use of our services after changes 
              constitutes acceptance of the modified Terms.
            </p>

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
