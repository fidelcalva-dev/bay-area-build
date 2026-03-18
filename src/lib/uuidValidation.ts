// UUID Validation Utility
// Ensures only valid UUIDs are sent to relational DB fields

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/** Returns true if the value is a valid UUID v4 format */
export function isValidUuid(value: unknown): value is string {
  return typeof value === 'string' && UUID_REGEX.test(value);
}

/** Returns the value if it's a valid UUID, otherwise null */
export function sanitizeUuid(value: unknown): string | null {
  return isValidUuid(value) ? value : null;
}

/**
 * Sanitize all UUID fields in a payload object.
 * Pass the field names that should be UUID-validated.
 * Invalid values are set to null.
 */
export function sanitizeUuidFields<T extends Record<string, unknown>>(
  payload: T,
  uuidFieldNames: (keyof T)[]
): T {
  const result = { ...payload };
  for (const field of uuidFieldNames) {
    if (result[field] !== undefined && result[field] !== null) {
      if (!isValidUuid(result[field])) {
        console.warn(`[UUID] Invalid UUID in field "${String(field)}": "${result[field]}" → null`);
        (result as any)[field] = null;
      }
    }
  }
  return result;
}
