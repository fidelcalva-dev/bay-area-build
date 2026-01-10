import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Link, useNavigate } from 'react-router-dom';
import { 
  Building2, 
  Megaphone, 
  Headphones, 
  TrendingUp,
  ChevronRight,
  MapPin,
  Truck,
  User,
  Briefcase
} from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const benefits = [
  {
    icon: Building2,
    title: 'No Dumpster Investment',
    description: 'We provide the roll-off containers — you focus on running the business.',
  },
  {
    icon: Megaphone,
    title: 'Established Brand',
    description: 'Leverage our reputation, reviews, and marketing from day one.',
  },
  {
    icon: Headphones,
    title: 'Centralized Dispatch & Billing',
    description: 'Our systems handle scheduling, payments, and customer support.',
  },
  {
    icon: TrendingUp,
    title: 'Growth Opportunities',
    description: 'Expand into multiple cities as you grow your operations.',
  },
];


const truckTypes = [
  { value: 'hook-lift', label: 'Hook Lift Truck' },
  { value: 'roll-off', label: 'Roll-Off Truck' },
  { value: 'both', label: 'Both Hook Lift & Roll-Off' },
  { value: 'none', label: "Don't have a truck yet" },
];

const experienceLevels = [
  { value: 'none', label: 'No experience (willing to learn)' },
  { value: '1-2', label: '1-2 years' },
  { value: '3-5', label: '3-5 years' },
  { value: '5+', label: '5+ years' },
];

export const CityOperatorSection = () => {
  const navigate = useNavigate();
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    city: '',
    truckType: '',
    experience: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.name || !formData.city || !formData.truckType || !formData.experience) {
      toast({
        title: "Please fill all fields",
        description: "All fields are required to submit your application.",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    navigate('/thank-you', { 
      state: { 
        formType: 'operator',
        name: formData.name,
        city: formData.city,
      } 
    });
  };

  return (
    <section className="section-padding bg-gradient-to-br from-secondary via-secondary to-secondary/95">
      <div className="container-wide">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div>
            <div className="inline-flex items-center gap-2 bg-accent/20 text-accent px-4 py-2 rounded-full text-sm font-medium mb-6">
              <MapPin className="h-4 w-4" />
              Now Expanding Across California
            </div>
            
            <h2 className="heading-lg text-secondary-foreground mb-6">
              Become a Local Dumpster Operator
            </h2>
            
            <p className="text-lg text-muted-foreground mb-8 leading-relaxed">
              Calsan provides the dumpsters, yard, systems, branding, and marketing. 
              You focus on operations in your city. It's a turnkey opportunity for 
              entrepreneurs who want to own their local market.
            </p>

            {/* Benefits Grid */}
            <div className="grid sm:grid-cols-2 gap-4 mb-8">
              {benefits.map((benefit, index) => (
                <div 
                  key={index}
                  className="flex items-start gap-3 p-4 bg-card/5 rounded-xl border border-border/10"
                >
                  <div className="w-10 h-10 rounded-lg bg-primary/20 flex items-center justify-center shrink-0">
                    <benefit.icon className="h-5 w-5 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-secondary-foreground text-sm mb-1">
                      {benefit.title}
                    </h3>
                    <p className="text-xs text-muted-foreground leading-relaxed">
                      {benefit.description}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Secondary CTA */}
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" size="lg" className="border-border" asChild>
                <Link to="/careers">
                  View All Opportunities
                  <ChevronRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
            </div>
          </div>

          {/* Operator Interest Form */}
          <div className="relative">
            <div className="bg-card rounded-2xl p-8 border border-border/30 shadow-xl">
              <h3 className="font-bold text-foreground text-xl mb-2 text-center">
                Interested in Operating a City?
              </h3>
              <p className="text-sm text-muted-foreground text-center mb-6">
                Fill out this form and we'll reach out within 24 hours.
              </p>
              
              <form onSubmit={handleSubmit} className="space-y-4">
                {/* Name */}
                <div className="space-y-2">
                  <Label htmlFor="operator-name" className="flex items-center gap-2 text-foreground">
                    <User className="h-4 w-4 text-primary" />
                    Full Name
                  </Label>
                  <Input
                    id="operator-name"
                    placeholder="John Smith"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>

                {/* City */}
                <div className="space-y-2">
                  <Label htmlFor="operator-city" className="flex items-center gap-2 text-foreground">
                    <MapPin className="h-4 w-4 text-primary" />
                    City You Want to Operate
                  </Label>
                  <Input
                    id="operator-city"
                    placeholder="e.g., Fresno, Sacramento, Los Angeles"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="bg-background border-border"
                  />
                </div>

                {/* Truck Type */}
                <div className="space-y-2">
                  <Label htmlFor="operator-truck" className="flex items-center gap-2 text-foreground">
                    <Truck className="h-4 w-4 text-primary" />
                    Truck Type
                  </Label>
                  <Select
                    value={formData.truckType}
                    onValueChange={(value) => setFormData({ ...formData, truckType: value })}
                  >
                    <SelectTrigger id="operator-truck" className="bg-background border-border">
                      <SelectValue placeholder="Select your truck type" />
                    </SelectTrigger>
                    <SelectContent>
                      {truckTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          {type.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Experience */}
                <div className="space-y-2">
                  <Label htmlFor="operator-experience" className="flex items-center gap-2 text-foreground">
                    <Briefcase className="h-4 w-4 text-primary" />
                    Experience in Waste/Hauling
                  </Label>
                  <Select
                    value={formData.experience}
                    onValueChange={(value) => setFormData({ ...formData, experience: value })}
                  >
                    <SelectTrigger id="operator-experience" className="bg-background border-border">
                      <SelectValue placeholder="Select your experience level" />
                    </SelectTrigger>
                    <SelectContent>
                      {experienceLevels.map((level) => (
                        <SelectItem key={level.value} value={level.value}>
                          {level.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                {/* Submit Button */}
                <Button 
                  type="submit" 
                  variant="cta" 
                  size="lg" 
                  className="w-full mt-6"
                  disabled={isSubmitting}
                >
                  {isSubmitting ? 'Submitting...' : 'Become a Local Operator'}
                  <ChevronRight className="ml-2 h-5 w-5" />
                </Button>
              </form>

              <div className="text-center pt-6 mt-6 border-t border-border/30">
                <p className="text-sm text-muted-foreground mb-3">
                  Prefer to talk? Call us directly.
                </p>
                <Button variant="outline" size="sm" asChild>
                  <a href="tel:+15106802150">
                    (510) 680-2150
                  </a>
                </Button>
              </div>
            </div>

            {/* Decorative elements */}
            <div className="absolute -top-4 -right-4 w-24 h-24 bg-accent/10 rounded-full blur-2xl" />
            <div className="absolute -bottom-4 -left-4 w-32 h-32 bg-primary/10 rounded-full blur-2xl" />
          </div>
        </div>
      </div>
    </section>
  );
};
