import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Calculator, ArrowRight, CheckCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const DUMPSTER_SIZES = [
  { value: '8', label: '8 Yard', price: 350 },
  { value: '10', label: '10 Yard', price: 395 },
  { value: '15', label: '15 Yard', price: 445 },
  { value: '20', label: '20 Yard', price: 495 },
  { value: '30', label: '30 Yard', price: 595 },
  { value: '40', label: '40 Yard', price: 695 },
];

const MATERIAL_TYPES = [
  { value: 'household', label: 'Household Junk' },
  { value: 'construction', label: 'Construction Debris' },
  { value: 'concrete', label: 'Concrete/Dirt' },
  { value: 'roofing', label: 'Roofing Materials' },
  { value: 'yard', label: 'Yard Waste' },
  { value: 'mixed', label: 'Mixed Materials' },
];

const RENTAL_DAYS = [
  { value: '3', label: '3 Days' },
  { value: '5', label: '5 Days' },
  { value: '7', label: '7 Days (Standard)' },
  { value: '10', label: '10 Days' },
  { value: '14', label: '14 Days' },
];

export function InstantQuoteForm() {
  const navigate = useNavigate();
  const { t } = useLanguage();
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [estimate, setEstimate] = useState<{ min: number; max: number } | null>(null);
  
  const [formData, setFormData] = useState({
    zip: '',
    size: '',
    material: '',
    deliveryDate: '',
    rentalDays: '7',
    notes: '',
    name: '',
    email: '',
    phone: '',
    address: '',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const calculateEstimate = () => {
    const sizeData = DUMPSTER_SIZES.find((s) => s.value === formData.size);
    if (!sizeData) return null;
    
    let base = sizeData.price;
    const days = parseInt(formData.rentalDays) || 7;
    const extraDays = Math.max(0, days - 7);
    const extraDayFee = extraDays * 50;
    
    // Material adjustments
    if (formData.material === 'concrete') base += 100;
    if (formData.material === 'roofing') base += 75;
    
    const min = base + extraDayFee;
    const max = min + 100;
    
    return { min, max };
  };

  const handleStep1Submit = (e: React.FormEvent) => {
    e.preventDefault();
    const est = calculateEstimate();
    setEstimate(est);
    setStep(2);
  };

  const handleFinalSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    // Simulate form submission
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    // Navigate to thank you page
    navigate('/thank-you', { state: { formData, estimate } });
  };

  if (step === 2 && estimate) {
    return (
      <div className="bg-card rounded-2xl shadow-card p-6 md:p-8">
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-success/10 text-success mb-4">
            <CheckCircle className="w-8 h-8" />
          </div>
          <h3 className="heading-md text-foreground mb-2">Your Estimated Price</h3>
          <div className="text-4xl md:text-5xl font-extrabold text-primary">
            ${estimate.min} - ${estimate.max}
          </div>
          <p className="text-muted-foreground mt-2">
            For a {formData.size} yard dumpster • {formData.rentalDays} days rental
          </p>
        </div>

        <form onSubmit={handleFinalSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('form.name')} *
              </label>
              <input
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-foreground mb-1.5">
                {t('form.phone')} *
              </label>
              <input
                type="tel"
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                required
                className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('form.email')} *
            </label>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('form.address')} *
            </label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleChange}
              required
              placeholder="Full delivery address"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>

          <div className="flex flex-col sm:flex-row gap-3 pt-4">
            <Button
              type="button"
              variant="outline"
              size="lg"
              className="flex-1"
              onClick={() => setStep(1)}
            >
              Back
            </Button>
            <Button
              type="submit"
              variant="cta"
              size="lg"
              className="flex-1"
              disabled={isSubmitting}
            >
              {isSubmitting ? t('form.submitting') : 'Request Quote'}
              <ArrowRight className="w-4 h-4" />
            </Button>
          </div>
          
          <p className="text-center text-sm text-muted-foreground">
            Or call us now: <a href="tel:+15106802150" className="font-semibold text-primary">(510) 680-2150</a>
          </p>
        </form>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl shadow-card p-6 md:p-8" id="quote">
      <div className="flex items-center gap-3 mb-6">
        <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-accent/10 text-accent">
          <Calculator className="w-6 h-6" />
        </div>
        <div>
          <h3 className="heading-sm text-foreground">{t('nav.getQuote')}</h3>
          <p className="text-sm text-muted-foreground">Get your price in 30 seconds</p>
        </div>
      </div>

      <form onSubmit={handleStep1Submit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('form.zip')} *
            </label>
            <input
              type="text"
              name="zip"
              value={formData.zip}
              onChange={handleChange}
              required
              maxLength={5}
              pattern="[0-9]{5}"
              placeholder="94606"
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('form.size')} *
            </label>
            <select
              name="size"
              value={formData.size}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="">Select size...</option>
              {DUMPSTER_SIZES.map((size) => (
                <option key={size.value} value={size.value}>
                  {size.label} - from ${size.price}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('form.material')} *
            </label>
            <select
              name="material"
              value={formData.material}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            >
              <option value="">Select material...</option>
              {MATERIAL_TYPES.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-foreground mb-1.5">
              {t('form.deliveryDate')} *
            </label>
            <input
              type="date"
              name="deliveryDate"
              value={formData.deliveryDate}
              onChange={handleChange}
              required
              min={new Date().toISOString().split('T')[0]}
              className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t('form.rentalDays')}
          </label>
          <select
            name="rentalDays"
            value={formData.rentalDays}
            onChange={handleChange}
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors"
          >
            {RENTAL_DAYS.map((day) => (
              <option key={day.value} value={day.value}>
                {day.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium text-foreground mb-1.5">
            {t('form.notes')}
          </label>
          <textarea
            name="notes"
            value={formData.notes}
            onChange={handleChange}
            rows={2}
            placeholder="Driveway placement, gate access, etc."
            className="w-full px-4 py-3 rounded-lg border border-input bg-background text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-colors resize-none"
          />
        </div>

        <Button type="submit" variant="cta" size="lg" className="w-full">
          {t('form.submit')}
          <ArrowRight className="w-4 h-4" />
        </Button>
      </form>
    </div>
  );
}
