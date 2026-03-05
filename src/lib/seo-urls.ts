// Canonical SEO URL helpers — single source of truth for all URL patterns
// All SEO pages use /dumpster-rental/{citySlug}/ prefix

export function cityUrl(citySlug: string): string {
  return `/dumpster-rental/${citySlug}`;
}

export function citySizeUrl(citySlug: string, sizeYd: number): string {
  return `/dumpster-rental/${citySlug}/${sizeYd}-yard`;
}

export function cityMaterialUrl(citySlug: string, materialSlug: string): string {
  return `/dumpster-rental/${citySlug}/${materialSlug}`;
}

export function cityJobUrl(citySlug: string, jobSlug: string): string {
  return `/dumpster-rental/${citySlug}/${jobSlug}`;
}

export function zipUrl(zip: string): string {
  return `/service-area/${zip}/dumpster-rental`;
}

export function countyUrl(countySlug: string): string {
  return `/county/${countySlug}/dumpster-rental`;
}

export function useCaseUrl(useCaseSlug: string): string {
  return `/use-cases/${useCaseSlug}`;
}

export function yardHubUrl(yardSlug: string): string {
  return `/yards/${yardSlug}`;
}
