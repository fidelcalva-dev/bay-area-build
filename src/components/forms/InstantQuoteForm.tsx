import { useState, useMemo } from 'react';
import { MessageCircle, Zap, MapPin, Package, Recycle, Calendar, Home, HardHat, Building2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const USER_TYPES = [
  { value: 'homeowner', label: 'Homeowner', icon: Home, benefits: ['Same-day delivery', 'Simple pricing'] },
  { value: 'contractor', label: 'Contractor', icon: HardHat, benefits: ['10% discount', 'Priority scheduling'] },
  { value: 'business', label: 'Business', icon: Building2, benefits: ['Sustainability reports', 'Flexible billing'] },
];

const DUMPSTER_SIZES = [
  { value: '10', label: '10 yd', price: 395, desc: 'Garage cleanout' },
  { value: '15', label: '15 yd', price: 445, desc: 'Kitchen remodel' },
  { value: '20', label: '20 yd', price: 495, desc: 'Full renovation', popular: true },
  { value: '30', label: '30 yd', price: 595, desc: 'Construction' },
];

const MATERIAL_TYPES = [
  { value: 'household', label: 'Household', icon: '🏠', adjustment: 0 },
  { value: 'construction', label: 'Construction', icon: '🔨', adjustment: 0 },
  { value: 'concrete', label: 'Heavy', icon: '🪨', adjustment: 100 },
  { value: 'yard', label: 'Yard', icon: '🌿', adjustment: 0 },
];

const RENTAL_DAYS = [
  { value: '3', label: '3 days', extra: 0 },
  { value: '7', label: '7 days', extra: 0, popular: true },
  { value: '14', label: '14 days', extra: 350 },
];

export function InstantQuoteForm() {
  const [formData, setFormData] = useState({
    userType: 'homeowner',
    zip: '',
    size: '20',
    material: 'household',
    rentalDays: '7',
  });

  const selectedUserType = USER_TYPES.find((u) => u.value === formData.userType);
  const selectedSize = DUMPSTER_SIZES.find((s) => s.value === formData.size);
  const selectedMaterial = MATERIAL_TYPES.find((m) => m.value === formData.material);
  const selectedDays = RENTAL_DAYS.find((d) => d.value === formData.rentalDays);

  const estimate = useMemo(() => {
    if (!selectedSize) return null;
    const base = selectedSize.price;
    const materialAdj = selectedMaterial?.adjustment || 0;
    const daysAdj = selectedDays?.extra || 0;
    const discount = formData.userType === 'contractor' ? 0.1 : 0;
    const subtotal = base + materialAdj + daysAdj;
    const min = Math.round(subtotal * (1 - discount));
    const max = Math.round((subtotal + 75) * (1 - discount));
    return { min, max, hasDiscount: discount > 0 };
  }, [selectedSize, selectedMaterial, selectedDays, formData.userType]);

  const handleConfirmByText = () => {
    const message = `Quote: ${formData.size}yd ${selectedMaterial?.label} - ${selectedDays?.label}%0AZIP: ${formData.zip}%0AEst: $${estimate?.min}-$${estimate?.max}`;
    window.open(`sms:+15106802150?body=${encodeURIComponent(decodeURIComponent(message))}`, '_blank');
  };

  const isValid = formData.zip.length === 5;

  return (
    <div className="bg-card rounded-2xl shadow-card overflow-hidden" id="quote">
      {/* Compact Header */}
      <div className="bg-gradient-to-r from-primary to-primary/80 px-4 py-3 flex items-center gap-3">
        <div className="w-9 h-9 rounded-full bg-white/20 flex items-center justify-center">
          <Zap className="w-4 h-4 text-primary-foreground" />
        </div>
        <div>
          <h3 className="font-bold text-primary-foreground">Instant Quote</h3>
          <p className="text-xs text-primary-foreground/80">Price in 30 seconds</p>
        </div>
      </div>

      <div className="p-4 space-y-4">
        {/* User Type - Compact Pills */}
        <div className="flex gap-2">
          {USER_TYPES.map((type) => {
            const Icon = type.icon;
            return (
              <button
                key={type.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, userType: type.value }))}
                className={cn(
                  'flex-1 flex items-center justify-center gap-1.5 py-2.5 rounded-lg border-2 text-sm font-medium transition-all',
                  formData.userType === type.value
                    ? 'border-primary bg-primary/10 text-primary'
                    : 'border-input bg-background text-muted-foreground hover:border-primary/50'
                )}
              >
                <Icon className="w-4 h-4" />
                <span className="hidden xs:inline">{type.label}</span>
              </button>
            );
          })}
        </div>

        {/* ZIP Input - Large Touch Target */}
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
          <input
            type="tel"
            inputMode="numeric"
            value={formData.zip}
            onChange={(e) => setFormData((prev) => ({ ...prev, zip: e.target.value.replace(/\D/g, '').slice(0, 5) }))}
            placeholder="Enter ZIP code"
            className="w-full pl-10 pr-4 py-3.5 rounded-xl border-2 border-input bg-background text-foreground text-lg font-semibold placeholder:font-normal placeholder:text-muted-foreground focus:outline-none focus:border-primary transition-colors"
          />
          {isValid && (
            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-success text-lg">✓</span>
          )}
        </div>

        {/* Size Grid - 2x2 on mobile */}
        <div>
          <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
            <Package className="w-3.5 h-3.5" /> Size
          </div>
          <div className="grid grid-cols-4 gap-1.5">
            {DUMPSTER_SIZES.map((size) => (
              <button
                key={size.value}
                type="button"
                onClick={() => setFormData((prev) => ({ ...prev, size: size.value }))}
                className={cn(
                  'relative py-3 rounded-lg border-2 text-center transition-all',
                  formData.size === size.value
                    ? 'border-primary bg-primary/10'
                    : 'border-input bg-background hover:border-primary/50'
                )}
              >
                {size.popular && (
                  <span className="absolute -top-1.5 inset-x-0 mx-auto w-fit px-1.5 bg-accent text-accent-foreground text-[9px] font-bold rounded-full">
                    BEST
                  </span>
                )}
                <div className="text-base font-bold text-foreground">{size.value}</div>
                <div className="text-[10px] text-muted-foreground">yard</div>
              </button>
            ))}
          </div>
        </div>

        {/* Material + Days Row */}
        <div className="grid grid-cols-2 gap-3">
          {/* Material */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Recycle className="w-3.5 h-3.5" /> Material
            </div>
            <div className="grid grid-cols-2 gap-1.5">
              {MATERIAL_TYPES.map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, material: type.value }))}
                  className={cn(
                    'py-2 px-1 rounded-lg border-2 text-center transition-all',
                    formData.material === type.value
                      ? 'border-primary bg-primary/10'
                      : 'border-input bg-background hover:border-primary/50'
                  )}
                >
                  <div className="text-base">{type.icon}</div>
                  <div className="text-[10px] font-medium text-foreground truncate">{type.label}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Days */}
          <div>
            <div className="flex items-center gap-1.5 text-xs font-medium text-muted-foreground mb-2">
              <Calendar className="w-3.5 h-3.5" /> Duration
            </div>
            <div className="space-y-1.5">
              {RENTAL_DAYS.map((day) => (
                <button
                  key={day.value}
                  type="button"
                  onClick={() => setFormData((prev) => ({ ...prev, rentalDays: day.value }))}
                  className={cn(
                    'w-full py-2 rounded-lg border-2 text-sm font-medium transition-all flex items-center justify-center gap-1',
                    formData.rentalDays === day.value
                      ? 'border-primary bg-primary/10 text-primary'
                      : 'border-input bg-background text-foreground hover:border-primary/50'
                  )}
                >
                  {day.label}
                  {day.popular && <span className="text-[9px] bg-success/20 text-success px-1 rounded">STD</span>}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Price Estimate - Prominent */}
        {estimate && (
          <div className="bg-gradient-to-r from-success/10 to-success/5 rounded-xl p-3 border border-success/30">
            <div className="flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Your estimate</span>
                  {estimate.hasDiscount && (
                    <span className="px-1.5 py-0.5 bg-primary text-primary-foreground text-[9px] font-bold rounded">
                      -10%
                    </span>
                  )}
                </div>
                <div className="text-2xl font-extrabold text-foreground">
                  ${estimate.min}<span className="text-base font-medium text-muted-foreground">–${estimate.max}</span>
                </div>
              </div>
              <div className="text-right text-xs text-muted-foreground">
                <div className="text-success font-medium">All-in price</div>
                <div>Delivery + Pickup</div>
              </div>
            </div>
          </div>
        )}

        {/* CTA */}
        <Button
          type="button"
          variant="cta"
          size="lg"
          className="w-full gap-2 text-base"
          onClick={handleConfirmByText}
          disabled={!isValid}
        >
          <MessageCircle className="w-5 h-5" />
          Confirm by Text
        </Button>

        <p className="text-center text-xs text-muted-foreground">
          Or call <a href="tel:+15106802150" className="font-semibold text-foreground hover:text-primary">(510) 680-2150</a>
        </p>
      </div>
    </div>
  );
}
