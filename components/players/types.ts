export type PlayerSortKey = "winrate" | "lp" | "rank" | "updated";

export type PlayerSortDirection = "asc" | "desc";

export type PlayerRow = {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  opggUrl?: string | null;
  tier?: string | null;
  division?: string | null;
  lp?: number | null;
  wins?: number | null;
  losses?: number | null;
  notes?: string | null;
  objective?: string | null;
  monthCheckpoint?: string | null;
  lastSyncAt?: string | null;
};
