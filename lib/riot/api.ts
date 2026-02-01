import { logger } from "@/lib/logger";
import type { RiotAccountRegion, RiotPlatformRegion } from "@/lib/riot/regions";

const apiKey = process.env.RIOT_API_KEY;

if (!apiKey) {
  logger.warn("Missing RIOT_API_KEY in environment");
}

async function riotFetch<T>(url: string): Promise<T> {
  const response = await fetch(url, {
    headers: {
      "X-Riot-Token": apiKey ?? "",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Riot API error ${response.status}: ${text}`);
  }

  return (await response.json()) as T;
}

export type RiotAccount = {
  puuid: string;
  gameName: string;
  tagLine: string;
};

export type RiotSummoner = {
  id: string;
  accountId: string;
  puuid: string;
  name: string;
  summonerLevel: number;
};

export type RiotLeagueEntry = {
  queueType: string;
  tier: string;
  rank: string;
  leaguePoints: number;
  wins: number;
  losses: number;
};

export async function getAccountByRiotId(params: {
  accountRegion: RiotAccountRegion;
  gameName: string;
  tagLine: string;
}) {
  const url = `https://${params.accountRegion}.api.riotgames.com/riot/account/v1/accounts/by-riot-id/${encodeURIComponent(
    params.gameName,
  )}/${encodeURIComponent(params.tagLine)}`;
  return riotFetch<RiotAccount>(url);
}

export async function getSummonerByPuuid(params: {
  platformRegion: RiotPlatformRegion;
  puuid: string;
}) {
  const url = `https://${params.platformRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${params.puuid}`;
  return riotFetch<RiotSummoner>(url);
}

export async function getLeagueEntriesBySummoner(params: {
  platformRegion: RiotPlatformRegion;
  summonerId: string;
}) {
  const url = `https://${params.platformRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${params.summonerId}`;
  return riotFetch<RiotLeagueEntry[]>(url);
}
