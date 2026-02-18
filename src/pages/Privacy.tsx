import { Layout } from '@/components/layout/Layout';
import { BUSINESS_INFO } from '@/lib/seo';

export default function Privacy() {
  return (
    <Layout
      title="Privacy Policy | Calsan Dumpsters Pro"
      description="Privacy policy for Calsan Dumpsters Pro. Learn how we collect, use, and protect your personal information."
      canonical="/privacy"
    >
      <section className="section-padding bg-background">
        <div className="container-narrow">
          <h1 className="heading-xl text-foreground mb-6">Privacy Policy</h1>
          <p className="text-muted-foreground mb-8">Last updated: January 2026</p>

          <div className="prose prose-lg max-w-none text-foreground">
            <h2 className="heading-md mb-4">1. Information We Collect</h2>
            <p className="text-muted-foreground mb-4">
              {BUSINESS_INFO.name} ("we," "us," or "our") collects information necessary to provide dumpster rental services:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
              <li><strong className="text-foreground">Contact Information:</strong> Name, phone number, email address</li>
              <li><strong className="text-foreground">Service Address:</strong> Delivery location and placement details</li>
              <li><strong className="text-foreground">Placement Information:</strong> GPS coordinates, placement photos, and property access notes</li>
              <li><strong className="text-foreground">Billing Information:</strong> Payment method details (processed securely through third-party providers)</li>
              <li><strong className="text-foreground">Service Records:</strong> Scale tickets, dump receipts, delivery/pickup photos, and service history</li>
              <li><strong className="text-foreground">Communications:</strong> SMS messages, emails, and call records related to your service</li>
            </ul>

            <h2 className="heading-md mb-4">2. How We Use Your Information</h2>
            <p className="text-muted-foreground mb-4">We use collected information to:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
              <li>Provide and schedule dumpster rental services</li>
              <li>Process payments and billing</li>
              <li>Communicate service updates (delivery windows, pickup reminders)</li>
              <li>Generate invoices and receipts with accurate documentation</li>
              <li>Comply with local, state, and federal regulations</li>
              <li>Improve our services and customer experience</li>
              <li>Resolve disputes and maintain service records</li>
            </ul>

            <h2 className="heading-md mb-4">3. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">We may share your information with:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-1">
              <li><strong className="text-foreground">Service Providers:</strong> Drivers, dispatchers, and waste disposal facilities necessary to complete your service</li>
              <li><strong className="text-foreground">Payment Processors:</strong> Secure third-party payment services</li>
              <li><strong className="text-foreground">Regulatory Bodies:</strong> When required by law or to comply with waste disposal regulations</li>
            </ul>
            <p className="text-muted-foreground mb-6">
              <strong className="text-foreground">We do not sell your personal data</strong> to third parties for marketing purposes.
            </p>

            <h2 className="heading-md mb-4">4. SMS Communications and Consent</h2>
            <p className="text-muted-foreground mb-4">
              By submitting your information through our website, you agree to receive SMS messages from CALSAN DUMPSTERS PRO related to:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-1">
              <li>Appointments</li>
              <li>Appointment confirmations</li>
              <li>Delivery and pickup notifications</li>
              <li>Billing updates</li>
              <li>Promotions and offers</li>
            </ul>
            <p className="text-muted-foreground mb-4">
              The frequency of messages may vary. Standard message and data rates may apply.
            </p>
            <p className="text-muted-foreground mb-4">
              You may unsubscribe at any time by replying:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-4 space-y-1">
              <li><strong className="text-foreground">STOP</strong> to unsubscribe</li>
              <li><strong className="text-foreground">HELP</strong> for assistance</li>
            </ul>
            <p className="text-muted-foreground mb-6">
              Consent to receive SMS messages is not a condition of purchase.
            </p>

            <h2 className="heading-md mb-4">5. Information Sharing</h2>
            <p className="text-muted-foreground mb-4">
              We do not sell, rent, or trade your personal information.
            </p>
            <p className="text-muted-foreground mb-6">
              We may share information only with trusted service providers (such as payment processors or messaging platforms) strictly for business operations and compliance purposes.
            </p>

            <h2 className="heading-md mb-4">6. Data Retention</h2>
            <p className="text-muted-foreground mb-6">
              We retain your information for as long as necessary to provide services and comply with legal obligations:
            </p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
              <li><strong className="text-foreground">Service Records:</strong> 7 years (for tax and compliance purposes)</li>
              <li><strong className="text-foreground">Scale Tickets & Receipts:</strong> 7 years</li>
              <li><strong className="text-foreground">Contact Information:</strong> Until you request deletion or account closure</li>
              <li><strong className="text-foreground">Photos & Documentation:</strong> 2 years after service completion</li>
            </ul>

            <h2 className="heading-md mb-4">7. Data Security</h2>
            <p className="text-muted-foreground mb-6">
              We implement industry-standard security measures to protect your information, including encrypted data 
              transmission, secure payment processing, and access controls. However, no system is completely secure, 
              and we cannot guarantee absolute security.
            </p>

            <h2 className="heading-md mb-4">8. Your Rights</h2>
            <p className="text-muted-foreground mb-4">Under California law (CCPA), you have the right to:</p>
            <ul className="list-disc pl-6 text-muted-foreground mb-6 space-y-1">
              <li>Request access to personal information we hold about you</li>
              <li>Request deletion of your personal information (subject to legal retention requirements)</li>
              <li>Opt out of marketing communications</li>
              <li>Know what categories of information we collect and share</li>
            </ul>

            <h2 className="heading-md mb-4">9. Cookies & Tracking</h2>
            <p className="text-muted-foreground mb-6">
              Our website uses cookies and similar technologies to improve user experience, analyze site traffic, 
              and remember preferences. You can control cookie settings through your browser. Essential cookies 
              required for site functionality cannot be disabled.
            </p>

            <h2 className="heading-md mb-4">10. Third-Party Services</h2>
            <p className="text-muted-foreground mb-6">
              Our website may contain links to third-party services. We are not responsible for the privacy 
              practices of these external sites. We encourage you to review their privacy policies.
            </p>

            <h2 className="heading-md mb-4">11. Children's Privacy</h2>
            <p className="text-muted-foreground mb-6">
              Our services are not directed to individuals under 18 years of age. We do not knowingly 
              collect personal information from children.
            </p>

            <h2 className="heading-md mb-4">12. Changes to This Policy</h2>
            <p className="text-muted-foreground mb-6">
              We may update this Privacy Policy periodically. Changes will be posted on this page with 
              an updated revision date. Continued use of our services after changes constitutes acceptance.
            </p>

            <h2 className="heading-md mb-4">Contact Us</h2>
            <p className="text-muted-foreground mb-4">
              For privacy-related requests or questions, contact us at:
            </p>
            <ul className="list-none text-muted-foreground mt-2 space-y-1">
              <li><strong className="text-foreground">Phone:</strong> {BUSINESS_INFO.phone.salesFormatted}</li>
              <li><strong className="text-foreground">Email:</strong> {BUSINESS_INFO.email}</li>
              <li><strong className="text-foreground">Address:</strong> {BUSINESS_INFO.address.full}</li>
            </ul>
            <p className="text-muted-foreground mt-4">
              To submit a privacy request, please include "Privacy Request" in your email subject line 
              or mention it when calling.
            </p>
          </div>
        </div>
      </section>
    </Layout>
  );
}
