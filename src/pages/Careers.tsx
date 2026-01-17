import { useState } from 'react';
import { Layout } from '@/components/layout/Layout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { 
  Truck, 
  Users, 
  Handshake, 
  MapPin, 
  CheckCircle2, 
  Phone, 
  Mail,
  ChevronRight,
  Building2,
  DollarSign,
  Shield,
  Clock
} from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { useToast } from '@/hooks/use-toast';
import { z } from 'zod';

const applicationSchema = z.object({
  name: z.string().trim().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
  email: z.string().trim().email('Invalid email address').max(255, 'Email must be less than 255 characters'),
  phone: z.string().trim().min(10, 'Phone must be at least 10 digits').max(20, 'Phone must be less than 20 characters'),
  role: z.string().min(1, 'Please select a role'),
  experience: z.string().trim().max(2000, 'Experience must be less than 2000 characters'),
  message: z.string().trim().max(2000, 'Message must be less than 2000 characters'),
});

type ApplicationData = z.infer<typeof applicationSchema>;

const roles = [
  {
    id: 'drivers',
    title: 'Drivers (W2 or 1099)',
    icon: Truck,
    description: 'Join our team as a roll-off truck driver serving the Bay Area.',
    benefits: [
      'Competitive pay per load',
      'Flexible W2 or 1099 options',
      'Local routes — home every night',
      'Modern equipment & trucks',
      'Fuel cards & maintenance support',
    ],
    requirements: [
      'Valid Class A or B CDL',
      '2+ years roll-off or similar experience',
      'Clean driving record',
      'Bay Area knowledge preferred',
    ],
  },
  {
    id: 'owner-operators',
    title: 'Owner Operators',
    icon: Building2,
    description: 'Partner with us using the Local Operators Model. We provide the infrastructure, you run the operations.',
    benefits: [
      'We provide dumpsters & yard access',
      'You handle deliveries & pickups',
      'Local market exclusivity opportunities',
      'Full dispatch & CRM support',
      'Keep more of what you earn',
    ],
    requirements: [
      'Own your roll-off truck',
      'Business license & insurance',
      '3+ years industry experience',
      'Strong local market knowledge',
    ],
  },
  {
    id: 'sales',
    title: 'Sales Representatives',
    icon: Handshake,
    description: 'Grow with us by bringing in new customers and building relationships with contractors.',
    benefits: [
      'Competitive base + commission',
      'Warm leads provided',
      'Remote-friendly position',
      'Growth into management',
      'Full training & support',
    ],
    requirements: [
      'Sales experience preferred',
      'Construction/waste industry a plus',
      'Bilingual (Spanish) a plus',
      'Self-motivated & organized',
    ],
  },
  {
    id: 'city-operators',
    title: 'Future City Operators',
    icon: MapPin,
    description: 'Be the exclusive operator in a new California city. We\'re expanding to Sacramento, Stockton, Fresno, LA, and beyond.',
    benefits: [
      'Exclusive territory rights',
      'Turnkey business system',
      'Marketing & lead generation',
      'National account access',
      'Ongoing operational support',
    ],
    requirements: [
      'Existing yard or land access',
      'Capital for initial dumpster fleet',
      'Local business connections',
      'Commitment to service quality',
    ],
  },
];

const Careers = () => {
  const [applicationOpen, setApplicationOpen] = useState(false);
  const [selectedRole, setSelectedRole] = useState('');
  const [formData, setFormData] = useState<ApplicationData>({
    name: '',
    email: '',
    phone: '',
    role: '',
    experience: '',
    message: '',
  });
  const [errors, setErrors] = useState<Partial<Record<keyof ApplicationData, string>>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { toast } = useToast();

  const handleInputChange = (field: keyof ApplicationData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const result = applicationSchema.safeParse(formData);
    
    if (!result.success) {
      const fieldErrors: Partial<Record<keyof ApplicationData, string>> = {};
      result.error.errors.forEach(err => {
        if (err.path[0]) {
          fieldErrors[err.path[0] as keyof ApplicationData] = err.message;
        }
      });
      setErrors(fieldErrors);
      setIsSubmitting(false);
      return;
    }

    // Simulate form submission
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    toast({
      title: 'Application Submitted!',
      description: 'We\'ll review your application and get back to you within 2-3 business days.',
    });
    
    setFormData({ name: '', email: '', phone: '', role: '', experience: '', message: '' });
    setApplicationOpen(false);
    setIsSubmitting(false);
  };

  const openApplicationWithRole = (roleId: string) => {
    setSelectedRole(roleId);
    setFormData(prev => ({ ...prev, role: roleId }));
    setApplicationOpen(true);
  };

  return (
    <Layout>
      {/* Hero Section */}
      <section className="gradient-hero text-white py-20 md:py-28">
        <div className="container-wide">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="heading-xl mb-6">
              We're Expanding Across California
            </h1>
            <p className="text-xl md:text-2xl text-white/90 mb-8 max-w-3xl mx-auto">
              We provide the yard, dumpsters, and systems. You provide local operations. Let's grow together.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Dialog open={applicationOpen} onOpenChange={setApplicationOpen}>
                <DialogTrigger asChild>
                  <Button size="lg" variant="cta" className="text-lg px-8">
                    Apply Now
                    <ChevronRight className="ml-2 h-5 w-5" />
                  </Button>
                </DialogTrigger>
                <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
                  <DialogHeader>
                    <DialogTitle>Join Our Team</DialogTitle>
                    <DialogDescription>
                      Fill out the form below and we'll get back to you within 2-3 business days.
                    </DialogDescription>
                  </DialogHeader>
                  <form onSubmit={handleSubmit} className="space-y-4 mt-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name *</Label>
                      <Input
                        id="name"
                        value={formData.name}
                        onChange={(e) => handleInputChange('name', e.target.value)}
                        placeholder="John Smith"
                        className={errors.name ? 'border-destructive' : ''}
                      />
                      {errors.name && <p className="text-sm text-destructive">{errors.name}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="email">Email *</Label>
                      <Input
                        id="email"
                        type="email"
                        value={formData.email}
                        onChange={(e) => handleInputChange('email', e.target.value)}
                        placeholder="john@example.com"
                        className={errors.email ? 'border-destructive' : ''}
                      />
                      {errors.email && <p className="text-sm text-destructive">{errors.email}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone *</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(510) 555-1234"
                        className={errors.phone ? 'border-destructive' : ''}
                      />
                      {errors.phone && <p className="text-sm text-destructive">{errors.phone}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="role">Position Interest *</Label>
                      <Select
                        value={formData.role}
                        onValueChange={(value) => handleInputChange('role', value)}
                      >
                        <SelectTrigger className={errors.role ? 'border-destructive' : ''}>
                          <SelectValue placeholder="Select a position" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="drivers">Driver (W2 or 1099)</SelectItem>
                          <SelectItem value="owner-operators">Owner Operator</SelectItem>
                          <SelectItem value="sales">Sales Representative</SelectItem>
                          <SelectItem value="city-operators">Future City Operator</SelectItem>
                        </SelectContent>
                      </Select>
                      {errors.role && <p className="text-sm text-destructive">{errors.role}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="experience">Relevant Experience</Label>
                      <Textarea
                        id="experience"
                        value={formData.experience}
                        onChange={(e) => handleInputChange('experience', e.target.value)}
                        placeholder="Tell us about your experience..."
                        rows={3}
                        className={errors.experience ? 'border-destructive' : ''}
                      />
                      {errors.experience && <p className="text-sm text-destructive">{errors.experience}</p>}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="message">Additional Information</Label>
                      <Textarea
                        id="message"
                        value={formData.message}
                        onChange={(e) => handleInputChange('message', e.target.value)}
                        placeholder="Anything else you'd like us to know..."
                        rows={3}
                        className={errors.message ? 'border-destructive' : ''}
                      />
                      {errors.message && <p className="text-sm text-destructive">{errors.message}</p>}
                    </div>

                    <Button type="submit" className="w-full" variant="cta" disabled={isSubmitting}>
                      {isSubmitting ? 'Submitting...' : 'Submit Application'}
                    </Button>
                  </form>
                </DialogContent>
              </Dialog>

              <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10" asChild>
                <a href="tel:+15106802150">
                  <Phone className="mr-2 h-5 w-5" />
                  Call to Discuss
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Why Partner With Us */}
      <section className="section-padding bg-background">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">Why Partner With Calsan?</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              We've built the systems, brand, and customer base. Join us and focus on what you do best.
            </p>
          </div>

          <div className="grid md:grid-cols-4 gap-6">
            {[
              { icon: Building2, title: 'Infrastructure', desc: 'Yards, dumpsters, and equipment ready to go' },
              { icon: Users, title: 'Lead Generation', desc: 'Steady flow of customers from our marketing' },
              { icon: Shield, title: 'Support', desc: 'Dispatch, CRM, and operational training' },
              { icon: DollarSign, title: 'Earn More', desc: 'Competitive pay and partnership structures' },
            ].map((item, i) => (
              <div key={i} className="text-center p-6 bg-card rounded-xl border border-border/50">
                <div className="w-14 h-14 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary" />
                </div>
                <h3 className="font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Role Sections */}
      <section className="section-padding bg-muted/30">
        <div className="container-wide">
          <div className="text-center mb-12">
            <h2 className="heading-lg text-foreground mb-4">Open Opportunities</h2>
            <p className="text-lg text-muted-foreground">
              Find the role that fits your skills and goals.
            </p>
          </div>

          <div className="space-y-8">
            {roles.map((role, index) => (
              <div
                key={role.id}
                id={role.id}
                className="bg-card rounded-2xl border border-border/50 overflow-hidden"
              >
                <div className="p-6 md:p-8">
                  <div className="flex flex-col lg:flex-row lg:items-start gap-6">
                    {/* Role Header */}
                    <div className="flex-1">
                      <div className="flex items-center gap-4 mb-4">
                        <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center">
                          <role.icon className="h-7 w-7 text-primary" />
                        </div>
                        <div>
                          <h3 className="text-xl font-bold text-foreground">{role.title}</h3>
                          <p className="text-muted-foreground">{role.description}</p>
                        </div>
                      </div>

                      <div className="grid md:grid-cols-2 gap-6 mt-6">
                        {/* Benefits */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <CheckCircle2 className="h-4 w-4 text-primary" />
                            What We Offer
                          </h4>
                          <ul className="space-y-2">
                            {role.benefits.map((benefit, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                                {benefit}
                              </li>
                            ))}
                          </ul>
                        </div>

                        {/* Requirements */}
                        <div>
                          <h4 className="font-semibold text-foreground mb-3 flex items-center gap-2">
                            <Clock className="h-4 w-4 text-accent" />
                            Requirements
                          </h4>
                          <ul className="space-y-2">
                            {role.requirements.map((req, i) => (
                              <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                                <ChevronRight className="h-4 w-4 text-accent shrink-0 mt-0.5" />
                                {req}
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    </div>

                    {/* CTA */}
                    <div className="lg:w-48 flex flex-col gap-3">
                      <Button
                        variant="cta"
                        className="w-full"
                        onClick={() => openApplicationWithRole(role.id)}
                      >
                        Apply Now
                      </Button>
                      <Button variant="outline" className="w-full" asChild>
                        <a href="tel:+15106802150">
                          <Phone className="mr-2 h-4 w-4" />
                          Call Us
                        </a>
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How the Operator Model Works */}
      <section className="section-padding bg-background border-y border-border">
        <div className="container-wide">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-accent/10 text-accent rounded-full text-sm font-semibold mb-4">
              <Building2 className="w-4 h-4" />
              The Calsan Operator Model
            </div>
            <h2 className="heading-lg text-foreground mb-4">
              We Provide the Platform. You Run the Business.
            </h2>
            <p className="text-lg text-muted-foreground max-w-3xl mx-auto">
              Our unique partnership model lets you focus on what you do best—hauling and customer service—while we handle the rest.
            </p>
          </div>

          {/* Visual Comparison */}
          <div className="grid lg:grid-cols-2 gap-8 mb-12">
            {/* What Calsan Provides */}
            <div className="bg-primary/5 rounded-2xl p-8 border border-primary/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-primary/20 flex items-center justify-center">
                  <Building2 className="w-6 h-6 text-primary" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">What Calsan Provides</h3>
                  <p className="text-sm text-muted-foreground">Your infrastructure partner</p>
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: Building2, title: 'Yard Access', desc: 'Use our yards for staging and storage' },
                  { icon: Truck, title: 'Dumpster Fleet', desc: 'Brand new dumpsters in all sizes (6-50 yard)' },
                  { icon: Users, title: 'Dispatch & CRM', desc: 'Full dispatch software and customer management' },
                  { icon: DollarSign, title: 'Lead Generation', desc: 'Steady flow of customers from our marketing' },
                  { icon: Shield, title: 'Brand & Insurance', desc: 'Operate under our established brand' },
                  { icon: Handshake, title: 'Training & Support', desc: 'Operational training and ongoing support' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            {/* What You Provide */}
            <div className="bg-accent/5 rounded-2xl p-8 border border-accent/20">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-xl bg-accent/20 flex items-center justify-center">
                  <Truck className="w-6 h-6 text-accent" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-foreground">What You Provide</h3>
                  <p className="text-sm text-muted-foreground">Your local expertise</p>
                </div>
              </div>
              <ul className="space-y-4">
                {[
                  { icon: Truck, title: 'Your Truck', desc: 'Roll-off truck (Class A/B CDL required)' },
                  { icon: MapPin, title: 'Local Knowledge', desc: 'Know your streets, neighborhoods, and customers' },
                  { icon: Clock, title: 'Reliable Service', desc: 'On-time deliveries and pickups' },
                  { icon: Shield, title: 'Professionalism', desc: 'Clean appearance, courteous service' },
                  { icon: Users, title: 'Customer Care', desc: 'Build relationships and earn repeat business' },
                  { icon: CheckCircle2, title: 'Commitment', desc: 'Dedication to quality and growth' },
                ].map((item, i) => (
                  <li key={i} className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-lg bg-accent/10 flex items-center justify-center shrink-0 mt-0.5">
                      <item.icon className="w-4 h-4 text-accent" />
                    </div>
                    <div>
                      <p className="font-semibold text-foreground">{item.title}</p>
                      <p className="text-sm text-muted-foreground">{item.desc}</p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Result */}
          <div className="bg-gradient-to-r from-primary/10 via-accent/10 to-primary/10 rounded-2xl p-8 border border-border text-center">
            <h3 className="text-2xl font-bold text-foreground mb-4">= Your Own Business, With Full Support</h3>
            <p className="text-muted-foreground max-w-2xl mx-auto mb-6">
              Earn more than traditional employment while building equity in your own operation. 
              Exclusive territories available in Sacramento, Stockton, Fresno, LA, San Diego, and more.
            </p>
            <div className="flex flex-wrap gap-4 justify-center">
              <Button
                variant="cta"
                size="lg"
                onClick={() => openApplicationWithRole('owner-operators')}
              >
                Become an Operator
                <ChevronRight className="ml-2 h-5 w-5" />
              </Button>
              <Button variant="outline" size="lg" asChild>
                <a href="mailto:partners@calsandumpsters.com">
                  <Mail className="mr-2 h-5 w-5" />
                  partners@calsandumpsters.com
                </a>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="section-padding bg-secondary text-secondary-foreground">
        <div className="container-wide">
          <div className="grid md:grid-cols-4 gap-6">
            {[
              { value: '9', label: 'Bay Area Counties', sublabel: 'Currently Served' },
              { value: '100+', label: 'Cities Active', sublabel: 'And Growing' },
              { value: '6', label: 'New Markets', sublabel: 'Expansion Cities' },
              { value: '$150K+', label: 'Earning Potential', sublabel: 'Top Operators' },
            ].map((stat, i) => (
              <div key={i} className="bg-card/10 backdrop-blur rounded-xl p-6 text-center border border-border/20">
                <div className="text-3xl md:text-4xl font-bold text-accent mb-1">{stat.value}</div>
                <div className="font-semibold text-secondary-foreground">{stat.label}</div>
                <div className="text-sm text-muted-foreground">{stat.sublabel}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Final CTA */}
      <section className="section-padding bg-primary text-primary-foreground">
        <div className="container-wide text-center">
          <h2 className="heading-lg mb-4">Ready to Join the Team?</h2>
          <p className="text-xl text-primary-foreground/80 mb-8 max-w-2xl mx-auto">
            Whether you're a driver, operator, or entrepreneur — we have opportunities for you.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              size="lg"
              variant="cta"
              className="text-lg px-8"
              onClick={() => setApplicationOpen(true)}
            >
              Apply Now
              <ChevronRight className="ml-2 h-5 w-5" />
            </Button>
            <Button size="lg" variant="outline" className="text-lg px-8 border-white text-white hover:bg-white/10" asChild>
              <a href="tel:+15106802150">
                <Phone className="mr-2 h-5 w-5" />
                (510) 680-2150
              </a>
            </Button>
          </div>
        </div>
      </section>
    </Layout>
  );
};

export default Careers;
