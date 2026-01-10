import { useState, useMemo } from 'react';
import { MessageCircle, Zap, MapPin, Package, Recycle, Calendar } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage } from '@/contexts/LanguageContext';

const DUMPSTER_SIZES = [
  { value: '8', label: '8 Yard', price: 350, desc: 'Small cleanouts' },
  { value: '10', label: '10 Yard', price: 395, desc: 'Garage/basement' },
  { value: '15', label: '15 Yard', price: 445, desc: 'Kitchen remodel' },
  { value: '20', label: '20 Yard', price: 495, desc: 'Full renovation', popular: true },
  { value: '30', label: '30 Yard', price: 595, desc: 'Construction' },
  { value: '40', label: '40 Yard', price: 695, desc: 'Large projects' },
];

const MATERIAL_TYPES = [
  { value: 'household', label: 'Household Junk', icon: '🏠', adjustment: 0 },
  { value: 'construction', label: 'Construction', icon: '🔨', adjustment: 0 },
  { value: 'concrete', label: 'Concrete/Dirt', icon: '🪨', adjustment: 100 },
  { value: 'roofing', label: 'Roofing', icon: '🏗️', adjustment: 75 },
  { value: 'yard', label: 'Yard Waste', icon: '🌿', adjustment: 0 },
  { value: 'mixed', label: 'Mixed', icon: '📦', adjustment: 25 },
];

const RENTAL_DAYS = [
  { value: '3', label: '3 Days', extra: 0 },
  { value: '5', label: '5 Days', extra: 0 },
  { value: '7', label: '7 Days', extra: 0, popular: true },
  { value: '10', label: '10 Days', extra: 150 },
  { value: '14', label: '14 Days', extra: 350 },
];

const SERVICE_AREAS = [
  { zip: '94601', city: 'Oakland' },
  { zip: '94606', city: 'Oakland' },
  { zip: '94501', city: 'Alameda' },
  { zip: '94577', city: 'San Leandro' },
  { zip: '94541', city: 'Hayward' },
  { zip: '94536', city: 'Fremont' },
  { zip: '95112', city: 'San Jose' },
  { zip: '94102', city: 'San Francisco' },
  { zip: '94806', city: 'Richmond' },
  { zip: '94520', city: 'Concord' },
];

export function InstantQuoteForm() {
  const { t } = useLanguage();
  
  const [formData, setFormData] = useState({
    zip: '',
    size: '20',
    material: 'household',
    rentalDays: '7',
  });

  const selectedSize = DUMPSTER_SIZES.find((s) => s.value === formData.size);
  const selectedMaterial = MATERIAL_TYPES.find((m) => m.value === formData.material);
  const selectedDays = RENTAL_DAYS.find((d) => d.value === formData.rentalDays);

  const estimate = useMemo(() => {
    if (!selectedSize) return null;
    const base = selectedSize.price;
    const materialAdj = selectedMaterial?.adjustment || 0;
    const daysAdj = selectedDays?.extra || 0;
    const min = base + materialAdj + daysAdj;
    const max = min + 75;
    return { min, max };
  }, [selectedSize, selectedMaterial, selectedDays]);

  const matchedCity = SERVICE_AREAS.find((a) => a.zip === formData.zip)?.city;

  const handleConfirmByText = () => {
    const message = `Hi! I'd like a quote for a ${formData.size} yard dumpster.%0A%0A📍 ZIP: ${formData.zip}${matchedCity ? ` (${matchedCity})` : ''}%0A📦 Size: ${selectedSize?.label}%0A♻️ Material: ${selectedMaterial?.label}%0A📅 Rental: ${selectedDays?.label}%0A💰 Estimate: $${estimate?.min}-$${estimate?.max}`;
    window.open(`sms:+15106802150?body=${message}`, '_blank');
  };

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden" id="quote">
      {/* Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-5 py-4 text-primary-foreground">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-10 h-10 rounded-full bg-white/20">
            <Zap className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-bold text-lg">Instant Quote</h3>
            <p className="text-sm text-primary-foreground/80">Get your price in seconds</p>
          </div>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* ZIP/City Input */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <MapPin className="w-4 h-4 text-muted-foreground" />
            ZIP Code
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.zip}
              onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
              placeholder="Enter ZIP code"
              className="w-full px-4 py-3.5 rounded-xl border-2 border-input bg-background text-foreground text-lg font-medium focus:outline-none focus:border-primary transition-colors"
            />
            {matchedCity && (
              <span className="absolute right-4 top-1/2 -translate-y-1/2 text-sm text-success font-medium">
                ✓ {matchedCity}
              </span>
            )}
          </div>
        </div>

        {/* Dumpster Size Selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Package className="w-4 h-4 text-muted-foreground" />
            Dumpster Size
          </label>
          <div className="grid grid-cols-3 gap-2">
            {DUMPSTER_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, size: size.value }))}
                className={`relative p-3 rounded-xl border-2 text-center transition-all ${
                  formData.size === size.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-input bg-background hover:border-muted-foreground/50'
                }`}
              >
                {size.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.5 bg-accent text-accent-foreground text-[10px] font-bold rounded-full uppercase">
                    Popular
                  </span>
                )}
                <div className="text-lg font-bold text-foreground">{size.value}</div>
                <div className="text-[11px] text-muted-foreground">yards</div>
              </button>
            ))}
          </div>
          {selectedSize && (
            <p className="mt-2 text-sm text-muted-foreground text-center">
              Best for: {selectedSize.desc}
            </p>
          )}
        </div>

        {/* Material Type Selector */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Recycle className="w-4 h-4 text-muted-foreground" />
            Material Type
          </label>
          <div className="grid grid-cols-2 gap-2">
            {MATERIAL_TYPES.map((type) => (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, material: type.value }))}
                className={`flex items-center gap-2 p-3 rounded-xl border-2 text-left transition-all ${
                  formData.material === type.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-input bg-background hover:border-muted-foreground/50'
                }`}
              >
                <span className="text-xl">{type.icon}</span>
                <span className="text-sm font-medium text-foreground">{type.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Rental Duration */}
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-foreground mb-2">
            <Calendar className="w-4 h-4 text-muted-foreground" />
            Rental Duration
          </label>
          <div className="flex gap-2 overflow-x-auto pb-1 -mx-1 px-1">
            {RENTAL_DAYS.map((day) => (
              <button
                key={day.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, rentalDays: day.value }))}
                className={`relative flex-shrink-0 px-4 py-2.5 rounded-xl border-2 text-center transition-all ${
                  formData.rentalDays === day.value
                    ? 'border-primary bg-primary/5 ring-2 ring-primary/20'
                    : 'border-input bg-background hover:border-muted-foreground/50'
                }`}
              >
                {day.popular && (
                  <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-1.5 py-0.5 bg-success text-success-foreground text-[9px] font-bold rounded-full">
                    STD
                  </span>
                )}
                <span className="text-sm font-semibold text-foreground">{day.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Price Estimate */}
        {estimate && (
          <div className="bg-gradient-to-br from-success/10 to-success/5 rounded-xl p-4 border border-success/20">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground mb-1">Estimated Price</p>
                <div className="text-3xl font-extrabold text-foreground">
                  ${estimate.min}
                  <span className="text-lg font-medium text-muted-foreground"> - ${estimate.max}</span>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-muted-foreground">Includes</p>
                <p className="text-sm font-medium text-success">Delivery + Pickup</p>
              </div>
            </div>
          </div>
        )}

        {/* CTA Button */}
        <Button
          type="button"
          variant="cta"
          size="lg"
          className="w-full gap-2"
          onClick={handleConfirmByText}
          disabled={!formData.zip || formData.zip.length < 5}
        >
          <MessageCircle className="w-5 h-5" />
          Confirm by Text
        </Button>

        {/* Secondary Options */}
        <div className="flex items-center justify-center gap-4 text-sm">
          <a href="tel:+15106802150" className="text-muted-foreground hover:text-primary transition-colors">
            Or call <span className="font-semibold text-foreground">(510) 680-2150</span>
          </a>
        </div>
      </div>
    </div>
  );
}
