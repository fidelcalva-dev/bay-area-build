import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { HardHat, CheckCircle, ArrowRight, ArrowLeft, Phone, Loader2, Send } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { BUSINESS_INFO } from '@/lib/seo';
import { Link } from 'react-router-dom';
import { PrivacyNoticeAtCollection } from '@/components/legal/PrivacyNoticeAtCollection';
import {
  type ContractorFormData,
  getInitialFormData,
  calculateContractorFitScore,
  APPLICATION_STEPS,
} from '@/components/contractor/ContractorApplicationTypes';
import { CompanyInfoStep } from '@/components/contractor/steps/CompanyInfoStep';
import { ContractorProfileStep } from '@/components/contractor/steps/ContractorProfileStep';
import { ServiceNeedsStep } from '@/components/contractor/steps/ServiceNeedsStep';
import { DocumentUploadStep } from '@/components/contractor/steps/DocumentUploadStep';
import { ReviewStep } from '@/components/contractor/steps/ReviewStep';

export default function ContractorApplication() {
  const { toast } = useToast();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [data, setData] = useState<ContractorFormData>(getInitialFormData());

  const update = (updates: Partial<ContractorFormData>) => setData(prev => ({ ...prev, ...updates }));

  function validateStep(): boolean {
    switch (step) {
      case 1:
        if (!data.legal_business_name || !data.contact_name || !data.phone || !data.email || !data.business_address || !data.city || !data.zip) {
          toast({ title: 'Please fill in all required fields', variant: 'destructive' });
          return false;
        }
        return true;
      case 2:
        if (!data.contractor_type) {
          toast({ title: 'Please select a contractor type', variant: 'destructive' });
          return false;
        }
        return true;
      case 3:
        return true;
      case 4:
        return true;
      default:
        return true;
    }
  }

  function nextStep() {
    if (validateStep()) setStep(s => Math.min(s + 1, 5));
  }

  async function handleSubmit() {
    setIsSubmitting(true);
    try {
      const fitScore = calculateContractorFitScore(data);

      // Insert contractor application
      const { data: appData, error } = await supabase.from('contractor_applications').insert({
        company_name: data.legal_business_name,
        legal_business_name: data.legal_business_name,
        dba_name: data.dba_name || null,
        contact_name: data.contact_name,
        role_title: data.role_title || null,
        phone: data.phone,
        email: data.email,
        website: data.website || null,
        business_address: data.business_address,
        city: data.city,
        state: data.state,
        zip: data.zip,
        contractor_type: data.contractor_type,
        license_number: data.license_number || null,
        is_insured: data.is_insured,
        years_in_business: data.years_in_business ? parseInt(data.years_in_business) : null,
        service_area: data.service_area || null,
        typical_project_type: data.typical_project_type || null,
        current_active_projects: data.current_active_projects ? parseInt(data.current_active_projects) : null,
        average_project_size: data.average_project_size || null,
        service_line_interest: data.service_line_interest,
        monthly_dumpster_usage_estimate: data.monthly_dumpster_usage_estimate || null,
        monthly_cleanup_usage_estimate: data.monthly_cleanup_usage_estimate || null,
        recurring_service_interest: data.recurring_service_interest,
        preferred_cleanup_frequency: data.preferred_cleanup_frequency || null,
        common_dumpster_sizes: data.common_dumpster_sizes.length > 0 ? data.common_dumpster_sizes : null,
        common_materials: data.common_materials.length > 0 ? data.common_materials : null,
        need_priority_service: data.need_priority_service,
        need_net_terms: data.need_net_terms,
        required_dump_sites: data.required_dump_sites || null,
        notes: data.notes || null,
        docs_uploaded_json: data.uploadedFiles.length > 0 ? data.uploadedFiles : {},
        contractor_fit_score: fitScore,
        status: 'submitted',
        service_cities: data.service_area ? data.service_area.split(', ').filter(Boolean) : null,
        typical_sizes: data.common_dumpster_sizes.length > 0 ? data.common_dumpster_sizes : null,
        materials_handled: data.common_materials.length > 0 ? data.common_materials : null,
        estimated_monthly_volume: data.monthly_dumpster_usage_estimate || null,
      } as any).select('id').single();

      if (error) throw error;
      const appId = appData?.id;

      // Lead ingest — capture contractor application as a lead
      supabase.functions.invoke('lead-ingest', {
        body: {
          source_channel: 'CONTRACTOR_APPLICATION',
          source_detail: 'contractor_application_form_v2',
          source_page: '/contractor-application',
          source_module: 'contractor_application',
          brand: 'CALSAN_DUMPSTERS_PRO',
          lead_intent: 'CONTRACTOR_ACCOUNT',
          name: data.contact_name,
          phone: data.phone,
          email: data.email,
          company_name: data.legal_business_name,
          customer_type: 'contractor',
          city: data.city,
          zip: data.zip,
          message: `Contractor Application: ${data.legal_business_name} | Type: ${data.contractor_type} | Service: ${data.service_line_interest} | Fit Score: ${fitScore}`,
          consent_status: 'TRANSACTIONAL',
          raw_payload: {
            service_line: data.service_line_interest,
            contractor_application_flag: true,
            contractor_flag: true,
            contractor_application_id: appId,
            contractor_type: data.contractor_type,
            service_area: data.service_area,
            recurring_interest: data.recurring_service_interest,
            active_projects: data.current_active_projects,
            fit_score: fitScore,
            need_priority_service: data.need_priority_service,
            need_net_terms: data.need_net_terms,
            docs_count: data.uploadedFiles.length,
          },
        },
      }).catch(err => console.warn('lead-ingest (non-blocking):', err));

      setIsSubmitted(true);
      toast({ title: 'Application submitted successfully!' });
    } catch (err) {
      console.error('Error submitting:', err);
      toast({ title: 'Failed to submit. Please try again or call us.', variant: 'destructive' });
    } finally {
      setIsSubmitting(false);
    }
  }

  if (isSubmitted) {
    return (
      <Layout
        title="Application Received | Calsan Dumpsters Pro"
        description="Your contractor account application has been received."
        canonical="/contractor-application"
      >
        <section className="py-16 md:py-24 bg-background">
          <div className="container-narrow text-center">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
              <CheckCircle className="w-8 h-8 text-primary" />
            </div>
            <h1 className="heading-lg text-foreground mb-4">Application Received</h1>
            <p className="text-lg text-muted-foreground mb-8 max-w-md mx-auto">
              Thank you! Our team will review your application and contact you within 1–2 business days.
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button asChild size="lg">
                <Link to="/quote">Get a Quote Now <ArrowRight className="w-4 h-4 ml-2" /></Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <a href={`tel:${BUSINESS_INFO.phone.sales}`}>
                  <Phone className="w-4 h-4 mr-2" />
                  Call Us: {BUSINESS_INFO.phone.salesFormatted}
                </a>
              </Button>
            </div>
          </div>
        </section>
      </Layout>
    );
  }

  return (
    <Layout
      title="Contractor Account Application | Calsan Dumpsters Pro"
      description="Apply for a contractor or commercial dumpster rental account. Priority dispatch, volume pricing, and dedicated support for Bay Area construction professionals."
      canonical="/contractor-application"
    >
      {/* Hero */}
      <section className="gradient-hero text-primary-foreground py-8 md:py-12">
        <div className="container-narrow text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-primary-foreground/10 rounded-full text-sm mb-4">
            <HardHat className="w-4 h-4" />
            Contractor & Commercial Accounts
          </div>
          <h1 className="heading-lg mb-3">Apply for a Contractor Account</h1>
          <p className="text-base text-primary-foreground/85 max-w-lg mx-auto">
            Priority dispatch, dedicated support, and volume pricing for Bay Area contractors.
          </p>
        </div>
      </section>

      {/* Steps Progress */}
      <section className="py-6 bg-muted/30 border-b">
        <div className="container-narrow max-w-2xl">
          <div className="flex items-center justify-between gap-1">
            {APPLICATION_STEPS.map((s, i) => (
              <div key={s.id} className="flex items-center gap-1 flex-1">
                <div className={`flex items-center justify-center w-7 h-7 rounded-full text-xs font-bold shrink-0 ${
                  step > s.id ? 'bg-primary text-primary-foreground' :
                  step === s.id ? 'bg-primary text-primary-foreground' :
                  'bg-muted text-muted-foreground'
                }`}>
                  {step > s.id ? <CheckCircle className="w-4 h-4" /> : s.id}
                </div>
                <span className={`text-xs hidden sm:inline ${step === s.id ? 'font-semibold text-foreground' : 'text-muted-foreground'}`}>
                  {s.label}
                </span>
                {i < APPLICATION_STEPS.length - 1 && <div className={`h-px flex-1 mx-1 ${step > s.id ? 'bg-primary' : 'bg-border'}`} />}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Form */}
      <section className="py-8 md:py-12 bg-background">
        <div className="container-narrow max-w-2xl">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Badge variant="outline" className="text-xs">Step {step} of 5</Badge>
                {APPLICATION_STEPS[step - 1]?.label}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {step === 1 && <CompanyInfoStep data={data} onChange={update} />}
              {step === 2 && <ContractorProfileStep data={data} onChange={update} />}
              {step === 3 && <ServiceNeedsStep data={data} onChange={update} />}
              {step === 4 && <DocumentUploadStep data={data} onChange={update} />}
              {step === 5 && <ReviewStep data={data} />}
            </CardContent>
          </Card>

          {step === 5 && <div className="mt-4"><PrivacyNoticeAtCollection variant="compact" /></div>}

          {/* Nav Buttons */}
          <div className="flex items-center justify-between mt-6 gap-3">
            <Button variant="outline" onClick={() => setStep(s => Math.max(s - 1, 1))} disabled={step === 1}>
              <ArrowLeft className="w-4 h-4 mr-1" /> Back
            </Button>
            {step < 5 ? (
              <Button onClick={nextStep}>
                Next <ArrowRight className="w-4 h-4 ml-1" />
              </Button>
            ) : (
              <Button onClick={handleSubmit} disabled={isSubmitting} size="lg" className="gap-2">
                {isSubmitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                {isSubmitting ? 'Submitting...' : 'Submit Application'}
              </Button>
            )}
          </div>

          <p className="text-sm text-muted-foreground text-center mt-4">
            Prefer to talk? Call{' '}
            <a href={`tel:${BUSINESS_INFO.phone.sales}`} className="text-primary font-semibold">
              {BUSINESS_INFO.phone.salesFormatted}
            </a>
          </p>
        </div>
      </section>
    </Layout>
  );
}
