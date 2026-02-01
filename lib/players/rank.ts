const tierOrder: Record<string, number> = {
  CHALLENGER: 9,
  GRANDMASTER: 8,
  MASTER: 7,
  DIAMOND: 6,
  EMERALD: 5,
  PLATINUM: 4,
  GOLD: 3,
  SILVER: 2,
  BRONZE: 1,
  IRON: 0,
  RETADOR: 9,
  GRANMAESTRO: 8,
  MAESTRO: 7,
  DIAMANTE: 6,
  ESMERALDA: 5,
  PLATINO: 4,
  ORO: 3,
  PLATA: 2,
  BRONCE: 1,
  HIERRO: 0,
};

const divisionOrder: Record<string, number> = {
  I: 3,
  II: 2,
  III: 1,
  IV: 0,
};

export function getRankScore(params: {
  tier?: string | null;
  division?: string | null;
  lp?: number | null;
}) {
  const normalizedTier = params.tier
    ? params.tier.toUpperCase().replace(/\s+/g, "")
    : null;
  const tierScore = normalizedTier ? (tierOrder[normalizedTier] ?? -1) : -1;
  const normalizedDivision = params.division?.toUpperCase() ?? null;
  const divisionScore = normalizedDivision
    ? (divisionOrder[normalizedDivision] ?? -1)
    : -1;
  const lpScore = params.lp ?? 0;

  return tierScore * 10000 + divisionScore * 100 + lpScore;
}
