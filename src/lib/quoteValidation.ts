// Quote Form Input Validation with Zod
import { z } from 'zod';

// Phone validation: Must be valid US 10-digit, returns E.164 format
const phoneRegex = /^\d{10}$/;

export const quoteContactSchema = z.object({
  customerName: z.string()
    .trim()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name must be less than 100 characters')
    .regex(/^[a-zA-Z\s\-'À-ÿ]+$/, 'Name contains invalid characters')
    .transform(val => val.replace(/<[^>]*>/g, '').trim()), // Strip any HTML tags
  
  customerEmail: z.string()
    .trim()
    .email('Invalid email format')
    .max(255, 'Email must be less than 255 characters')
    .optional()
    .or(z.literal(''))
    .transform(val => val || undefined),
  
  customerPhone: z.string()
    .trim()
    .transform(val => val.replace(/\D/g, '')) // Strip non-digits
    .transform(val => {
      // Handle leading country code
      if (val.length === 11 && val.startsWith('1')) {
        return val.substring(1);
      }
      return val;
    })
    .refine(val => val.length === 10, {
      message: 'Phone must be exactly 10 digits'
    })
    .refine(val => !val.startsWith('0') && !val.startsWith('1'), {
      message: 'Invalid area code'
    })
    .transform(val => `+1${val}`), // Convert to E.164
});

export const quoteDataSchema = z.object({
  userType: z.enum(['homeowner', 'contractor', 'business', 'property_manager'], {
    errorMap: () => ({ message: 'Please select a valid user type' })
  }),
  
  zipCode: z.string()
    .trim()
    .regex(/^\d{5}$/, 'ZIP code must be 5 digits'),
  
  materialType: z.enum(['general', 'heavy'], {
    errorMap: () => ({ message: 'Please select material type' })
  }),
  
  sizeYards: z.number()
    .int()
    .min(5, 'Minimum size is 5 yards')
    .max(50, 'Maximum size is 50 yards'),
  
  rentalDays: z.number()
    .int()
    .min(1, 'Minimum rental is 1 day')
    .max(30, 'Maximum rental is 30 days'),
  
  estimatedMin: z.number()
    .nonnegative('Price cannot be negative'),
  
  estimatedMax: z.number()
    .nonnegative('Price cannot be negative'),
  
  subtotal: z.number()
    .nonnegative('Subtotal cannot be negative'),
});

// Combined schema for full quote validation
export const fullQuoteSchema = quoteContactSchema.merge(quoteDataSchema);

export type ValidatedContact = z.infer<typeof quoteContactSchema>;
export type ValidatedQuoteData = z.infer<typeof quoteDataSchema>;
export type ValidatedQuote = z.infer<typeof fullQuoteSchema>;

/**
 * Validate contact information for quote form
 */
export function validateQuoteContact(data: {
  name?: string;
  email?: string;
  phone?: string;
}): { 
  valid: boolean; 
  data?: ValidatedContact; 
  errors?: Record<string, string>;
} {
  const result = quoteContactSchema.safeParse({
    customerName: data.name,
    customerEmail: data.email,
    customerPhone: data.phone,
  });

  if (result.success) {
    return { valid: true, data: result.data };
  }

  const errors: Record<string, string> = {};
  result.error.errors.forEach(err => {
    const field = err.path[0] as string;
    // Map field names to form field names
    const fieldMap: Record<string, string> = {
      customerName: 'name',
      customerEmail: 'email',
      customerPhone: 'phone',
    };
    errors[fieldMap[field] || field] = err.message;
  });

  return { valid: false, errors };
}

/**
 * Sanitize text input to prevent XSS
 */
export function sanitizeText(input: string): string {
  return input
    .replace(/<[^>]*>/g, '') // Remove HTML tags
    .replace(/[<>]/g, '') // Remove angle brackets
    .trim()
    .slice(0, 500); // Limit length
}

/**
 * Validate and normalize phone number for display
 */
export function validatePhoneInput(phone: string): {
  valid: boolean;
  formatted: string;
  e164?: string;
  error?: string;
} {
  const digits = phone.replace(/\D/g, '');
  
  // Handle leading country code
  let normalized = digits;
  if (digits.length === 11 && digits.startsWith('1')) {
    normalized = digits.substring(1);
  }

  if (normalized.length === 0) {
    return { valid: false, formatted: '', error: 'Phone number is required' };
  }

  if (normalized.length !== 10) {
    return { 
      valid: false, 
      formatted: phone,
      error: normalized.length < 10 ? 'Phone number is too short' : 'Phone number is too long'
    };
  }

  // Validate area code
  if (normalized.startsWith('0') || normalized.startsWith('1')) {
    return { valid: false, formatted: phone, error: 'Invalid area code' };
  }

  return {
    valid: true,
    formatted: `(${normalized.slice(0, 3)}) ${normalized.slice(3, 6)}-${normalized.slice(6)}`,
    e164: `+1${normalized}`,
  };
}

/**
 * Validate email format
 */
export function validateEmailInput(email: string): {
  valid: boolean;
  error?: string;
} {
  if (!email || email.trim() === '') {
    return { valid: true }; // Email is optional
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email.trim())) {
    return { valid: false, error: 'Please enter a valid email address' };
  }

  if (email.length > 255) {
    return { valid: false, error: 'Email address is too long' };
  }

  return { valid: true };
}
