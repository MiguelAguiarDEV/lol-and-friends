import { logger } from "@/lib/logger";
import type { RiotAccountRegion, RiotPlatformRegion } from "@/lib/riot/regions";

const apiKey = process.env.RIOT_API_KEY;
const riotUserAgent =
  process.env.RIOT_USER_AGENT ??
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/144.0.0.0 Safari/537.36";
const riotAcceptLanguage =
  process.env.RIOT_ACCEPT_LANGUAGE ?? "en-GB,en-US;q=0.9,en;q=0.8,es;q=0.7";

if (!apiKey) {
  logger.warn("Missing RIOT_API_KEY in environment");
}

export class RiotRateLimitError extends Error {
  retryAfterSeconds: number;
  limitType: string | null;
  status: number;

  constructor(params: {
    retryAfterSeconds: number;
    limitType: string | null;
    status: number;
  }) {
    super(
      `Riot API rate limited (${params.status}). Retry after ${params.retryAfterSeconds}s`,
    );
    this.name = "RiotRateLimitError";
    this.retryAfterSeconds = params.retryAfterSeconds;
    this.limitType = params.limitType;
    this.status = params.status;
  }
}

function parseRetryAfter(response: Response) {
  const header = response.headers.get("retry-after");
  if (!header) {
    return 1;
  }
  const seconds = Number.parseInt(header, 10);
  if (Number.isFinite(seconds) && seconds > 0) {
    return seconds;
  }
  return 1;
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
      "User-Agent": riotUserAgent,
      "Accept-Language": riotAcceptLanguage,
      "Accept-Charset": "application/x-www-form-urlencoded; charset=UTF-8",
    },
    cache: "no-store",
  });

  if (response.status === 429) {
    const retryAfterSeconds = parseRetryAfter(response);
    const limitType = response.headers.get("x-rate-limit-type");
    throw new RiotRateLimitError({
      retryAfterSeconds,
      limitType,
      status: response.status,
    });
  }

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
