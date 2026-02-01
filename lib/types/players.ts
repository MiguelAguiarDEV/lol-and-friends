/**
 * Domain types for LoL players.
 */
export type PlayerRole = "Top" | "Jungle" | "Mid" | "ADC" | "Supp";

export type RankTier =
  | "Hierro"
  | "Bronce"
  | "Plata"
  | "Oro"
  | "Platino"
  | "Esmeralda"
  | "Diamante"
  | "Master"
  | "Grandmaster"
  | "Challenger";

export type RankDivision = "I" | "II" | "III" | "IV";

export type Player = {
  id: string;
  name: string;
  role: PlayerRole;
  tier: RankTier;
  division: RankDivision;
  lp: number;
  wins: number;
  losses: number;
  peakRank: string;
  lastUpdated: string;
  notes?: string;
  objective: string;
  monthCheckpoint: string;
  opggUrl: string;
};
