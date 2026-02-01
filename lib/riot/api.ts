import { logger } from "@/lib/logger";
import type { RiotAccountRegion, RiotPlatformRegion } from "@/lib/riot/regions";

const apiKey = process.env.RIOT_API_KEY;

if (!apiKey) {
  logger.warn("Missing RIOT_API_KEY in environment");
}

/**
 * Ejecuta una petición autenticada a la API de Riot y parsea JSON.
 * @param url - URL completa del endpoint.
 * @returns Respuesta tipada.
 */
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

/**
 * Obtiene entradas de liga por PUUID.
 * @param params - Región de plataforma y PUUID.
 * @returns Entradas de liga.
 */
export async function getLeagueEntriesByPuuid(params: {
  platformRegion: RiotPlatformRegion;
  puuid: string;
}) {
  const url = `https://${params.platformRegion}.api.riotgames.com/lol/league/v4/entries/by-puuid/${params.puuid}`;
  return riotFetch<RiotLeagueEntry[]>(url);
}

/**
 * Obtiene cuenta de Riot a partir de Riot ID (gameName + tag).
 * @param params - Región y Riot ID.
 * @returns Cuenta con PUUID.
 */
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

/**
 * Obtiene summoner por PUUID.
 * @param params - Región de plataforma y PUUID.
 * @returns Summoner con ID.
 */
export async function getSummonerByPuuid(params: {
  platformRegion: RiotPlatformRegion;
  puuid: string;
}) {
  const url = `https://${params.platformRegion}.api.riotgames.com/lol/summoner/v4/summoners/by-puuid/${params.puuid}`;
  return riotFetch<RiotSummoner>(url);
}

/**
 * Obtiene entradas de liga por ID de summoner.
 * @param params - Región de plataforma e ID de summoner.
 * @returns Entradas de liga.
 */
export async function getLeagueEntriesBySummoner(params: {
  platformRegion: RiotPlatformRegion;
  summonerId: string;
}) {
  const url = `https://${params.platformRegion}.api.riotgames.com/lol/league/v4/entries/by-summoner/${params.summonerId}`;
  return riotFetch<RiotLeagueEntry[]>(url);
}
