export type RiotPlatformRegion = "euw1";
export type RiotAccountRegion = "europe";

const platformMap: Record<string, RiotPlatformRegion> = {
  euw: "euw1",
  euw1: "euw1",
};

const opggRegionMap: Record<RiotPlatformRegion, string> = {
  euw1: "euw",
};

/**
 * Normaliza y mapea una región a RiotPlatformRegion.
 * @param input - Región ingresada por usuario.
 * @returns Región de plataforma soportada.
 * @throws Error si la región no está soportada.
 */
export function normalizePlatformRegion(input: string): RiotPlatformRegion {
  const normalized = input.toLowerCase().trim();
  const mapped = platformMap[normalized];
  if (!mapped) {
    throw new Error(`Unsupported region: ${input}`);
  }
  return mapped;
}

/**
 * Mapea una región de plataforma a región de cuenta.
 * @param _region - Región de plataforma.
 * @returns Región de cuenta.
 */
export function accountRegionForPlatform(
  _region: RiotPlatformRegion,
): RiotAccountRegion {
  return "europe";
}

/**
 * Mapea una región de plataforma a slug usado por op.gg.
 * @param region - Región de plataforma.
 * @returns Slug de región para op.gg.
 */
export function opggRegion(region: RiotPlatformRegion): string {
  return opggRegionMap[region] ?? "euw";
}
