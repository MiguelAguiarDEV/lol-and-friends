export type RiotPlatformRegion = "euw1";
export type RiotAccountRegion = "europe";

const platformMap: Record<string, RiotPlatformRegion> = {
  euw: "euw1",
  euw1: "euw1",
};

const opggRegionMap: Record<RiotPlatformRegion, string> = {
  euw1: "euw",
};

export function normalizePlatformRegion(input: string): RiotPlatformRegion {
  const normalized = input.toLowerCase().trim();
  const mapped = platformMap[normalized];
  if (!mapped) {
    throw new Error(`Unsupported region: ${input}`);
  }
  return mapped;
}

export function accountRegionForPlatform(
  _region: RiotPlatformRegion,
): RiotAccountRegion {
  return "europe";
}

export function opggRegion(region: RiotPlatformRegion): string {
  return opggRegionMap[region] ?? "euw";
}
