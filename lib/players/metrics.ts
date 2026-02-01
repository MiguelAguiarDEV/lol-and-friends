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
