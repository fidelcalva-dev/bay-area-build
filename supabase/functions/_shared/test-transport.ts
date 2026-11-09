// CAL 010 — Test transport.
// Quotes whose contact email uses the reserved domain "@calsan.test" are isolated
// test data. For them, functions skip real outbound side effects (SMS, email,
// lead-ingest, internal alerts, contract requests) and record that the step was
// suppressed. Production services stay on for everyone else; nothing is disabled
// globally. A real customer cannot be affected because ".test" is a reserved
// top-level domain that never receives mail.
export const TEST_EMAIL_DOMAIN = "@calsan.test";

export function isTestContact(email: unknown): boolean {
  return typeof email === "string" && email.trim().toLowerCase().endsWith(TEST_EMAIL_DOMAIN);
}
