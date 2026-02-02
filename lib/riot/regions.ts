export type RiotPlatformRegion =
  | "euw1"
  | "eun1"
  | "na1"
  | "kr"
  | "jp1"
  | "br1"
  | "la1"
  | "la2"
  | "oc1"
  | "tr1"
  | "ru";
export type RiotAccountRegion = "americas" | "europe" | "asia";

const platformMap: Record<string, RiotPlatformRegion> = {
  euw: "euw1",
  euw1: "euw1",
  eune: "eun1",
  eun1: "eun1",
  na: "na1",
  na1: "na1",
  kr: "kr",
  jp: "jp1",
  jp1: "jp1",
  br: "br1",
  br1: "br1",
  lan: "la1",
  la1: "la1",
  las: "la2",
  la2: "la2",
  oce: "oc1",
  oc1: "oc1",
  tr: "tr1",
  tr1: "tr1",
  ru: "ru",
};

const accountRegionMap: Record<RiotPlatformRegion, RiotAccountRegion> = {
  euw1: "europe",
  eun1: "europe",
  tr1: "europe",
  ru: "europe",
  na1: "americas",
  br1: "americas",
  la1: "americas",
  la2: "americas",
  oc1: "americas",
  kr: "asia",
  jp1: "asia",
};

const opggRegionMap: Record<RiotPlatformRegion, string> = {
  euw1: "euw",
  eun1: "eune",
  na1: "na",
  kr: "kr",
  jp1: "jp",
  br1: "br",
  la1: "lan",
  la2: "las",
  oc1: "oce",
  tr1: "tr",
  ru: "ru",
};

export const PLATFORM_REGION_OPTIONS: Array<{
  value: RiotPlatformRegion;
  label: string;
}> = [
  { value: "euw1", label: "EUW" },
  { value: "eun1", label: "EUNE" },
  { value: "na1", label: "NA" },
  { value: "kr", label: "KR" },
  { value: "jp1", label: "JP" },
  { value: "br1", label: "BR" },
  { value: "la1", label: "LAN" },
  { value: "la2", label: "LAS" },
  { value: "oc1", label: "OCE" },
  { value: "tr1", label: "TR" },
  { value: "ru", label: "RU" },
];

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
  region: RiotPlatformRegion,
): RiotAccountRegion {
  return accountRegionMap[region] ?? "europe";
}

/**
 * Mapea una región de plataforma a slug usado por op.gg.
 * @param region - Región de plataforma.
 * @returns Slug de región para op.gg.
 */
export function opggRegion(region: RiotPlatformRegion): string {
  return opggRegionMap[region] ?? "euw";
}
