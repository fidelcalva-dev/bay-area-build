// Phone validation utilities shared across the application
// Mirrors the logic in send-otp edge function for consistency

export interface PhoneValidationResult {
  valid: boolean;
  formatted: string;
  error?: string;
}

/**
 * Validate and format a US phone number to E.164 format (+1XXXXXXXXXX)
 * This should be used before any SMS operations to prevent Twilio errors
 */
export function validateAndFormatPhone(phone: string): PhoneValidationResult {
  if (!phone) {
    return { valid: false, formatted: '', error: 'Phone number is required' };
  }

  // Strip all non-digits
  let digits = phone.replace(/\D/g, '');

  // Handle numbers that start with country code
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.substring(1); // Remove leading 1
  }

  // US phone numbers should have exactly 10 digits
  if (digits.length !== 10) {
    return { 
      valid: false, 
      formatted: '', 
      error: digits.length < 10 
        ? 'Phone number is too short (need 10 digits)' 
        : 'Phone number is too long' 
    };
  }

  // Validate area code (can't start with 0 or 1)
  const areaCode = digits.substring(0, 3);
  if (areaCode.startsWith('0') || areaCode.startsWith('1')) {
    return { 
      valid: false, 
      formatted: '', 
      error: 'Invalid area code' 
    };
  }

  return { valid: true, formatted: `+1${digits}` };
}

/**
 * Format phone for display (XXX) XXX-XXXX
 */
export function formatPhoneDisplay(phone: string): string {
  const digits = phone.replace(/\D/g, '').slice(-10);
  if (digits.length !== 10) return phone;
  return `(${digits.slice(0, 3)}) ${digits.slice(3, 6)}-${digits.slice(6)}`;
}

/**
 * Strip phone to just 10 digits for storage
 */
export function normalizePhoneForStorage(phone: string): string {
  let digits = phone.replace(/\D/g, '');
  if (digits.length === 11 && digits.startsWith('1')) {
    digits = digits.substring(1);
  }
  return digits;
}
