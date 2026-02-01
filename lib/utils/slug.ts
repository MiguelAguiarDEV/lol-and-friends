/**
 * Create a URL-safe slug from a name.
 */
export function slugify(value: string): string {
  return value
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)+/g, "");
}

/**
 * Ensure slug uniqueness by appending a numeric suffix.
 */
export function withSlugSuffix(base: string, suffix: number): string {
  return `${base}-${suffix}`;
}
