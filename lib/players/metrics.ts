/**
 * Calculate total games played.
 */
export function getGames(params: { wins: number; losses: number }): number {
  return params.wins + params.losses;
}

/**
 * Calculate winrate as a fraction between 0 and 1.
 */
export function getWinrate(params: { wins: number; losses: number }): number {
  const games = getGames({ wins: params.wins, losses: params.losses });
  if (games === 0) {
    return 0;
  }

  return params.wins / games;
}

/**
 * Format a fraction as a percentage string.
 */
export function formatPercent(value: number): string {
  return `${(value * 100).toFixed(1)}%`;
}

/**
 * Calculate KDA ratio from aggregated kills/deaths/assists.
 */
export function getKda(params: {
  kills: number;
  deaths: number;
  assists: number;
}): number {
  const deaths = Math.max(1, params.deaths);
  return (params.kills + params.assists) / deaths;
}

/**
 * Format KDA with two decimals, returning "—" when missing.
 */
export function formatKda(value?: number | null): string {
  if (value === null || value === undefined) {
    return "—";
  }
  return value.toFixed(2);
}
