/**
 * Build fingerprint — generated at build time by Vite's define.
 * Used to verify which version is deployed.
 */
export const BUILD_INFO = {
  timestamp: __BUILD_TIMESTAMP__ as string,
  env: import.meta.env.MODE,
};

// Vite injects these at build time
declare const __BUILD_TIMESTAMP__: string;
