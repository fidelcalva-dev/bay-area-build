import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { DUMPSTER_SIZES_DATA } from '@/lib/shared-data';
import { cn } from '@/lib/utils';

interface PriceAnchorProps {
  className?: string;
  variant?: 'hero' | 'compact' | 'inline';
}

// Fetches the lowest BASE price from DB or falls back to shared-data
export function PriceAnchor({ className, variant = 'hero' }: PriceAnchorProps) {
  const [lowestPrice, setLowestPrice] = useState<number | null>(null);

  useEffect(() => {
    async function fetchLowestPrice() {
      try {
        const { data } = await supabase
          .from('dumpster_sizes')
          .select('base_price')
          .eq('is_active', true)
          .order('base_price', { ascending: true })
          .limit(1);
        
        if (data && data.length > 0) {
          setLowestPrice(data[0].base_price);
        } else {
          // Fallback to shared-data
          const fallback = Math.min(...DUMPSTER_SIZES_DATA.map(s => s.priceFrom));
          setLowestPrice(fallback);
        }
      } catch {
        // Fallback to shared-data on error
        const fallback = Math.min(...DUMPSTER_SIZES_DATA.map(s => s.priceFrom));
        setLowestPrice(fallback);
      }
    }
    fetchLowestPrice();
  }, []);

  if (lowestPrice === null) return null;

  const priceText = `Starting at $${lowestPrice}`;
  const rentalText = '7-day rentals';
  const includedText = 'Delivery & pickup included · Pricing varies by area';

  if (variant === 'compact') {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        {priceText} · {rentalText}
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        From ${lowestPrice}
      </span>
    );
  }

  // Hero variant (default)
  return (
    <p className={cn(
      "text-sm text-primary-foreground/70 mt-3",
      className
    )}>
      {priceText} · {rentalText} · {includedText}
    </p>
  );
}

// Static version for SSR/prerendering (uses shared-data directly)
export function PriceAnchorStatic({ className, variant = 'hero' }: PriceAnchorProps) {
  const lowestPrice = Math.min(...DUMPSTER_SIZES_DATA.map(s => s.priceFrom));

  if (variant === 'compact') {
    return (
      <span className={cn("text-sm text-muted-foreground", className)}>
        Starting at ${lowestPrice} · 7-day rentals
      </span>
    );
  }

  if (variant === 'inline') {
    return (
      <span className={cn("text-xs text-muted-foreground", className)}>
        From ${lowestPrice}
      </span>
    );
  }

  return (
    <p className={cn(
      "text-sm text-primary-foreground/70 mt-3",
      className
    )}>
      Dumpsters from ${lowestPrice} · 7-day rentals · Delivery & pickup included
    </p>
  );
}
