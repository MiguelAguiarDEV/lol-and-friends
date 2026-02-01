import {
  getGroupPlayers,
  getGroupSyncSettings,
  getPlayersForSync,
  insertRankSnapshot,
  updatePlayerSync,
} from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import {
  getAccountByRiotId,
  getLeagueEntriesBySummoner,
  getSummonerByPuuid,
} from "@/lib/riot/api";
import {
  accountRegionForPlatform,
  normalizePlatformRegion,
  opggRegion,
} from "@/lib/riot/regions";
import { isPast, nowIso } from "@/lib/utils/time";

const QUEUE_SOLO = "RANKED_SOLO_5x5";
const DEFAULT_BATCH_SIZE = 5;
const API_DELAY_MS = 250;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export async function syncDuePlayers(params?: { limit?: number }) {
  const rows = await getPlayersForSync();
  const byPlayer = new Map<
    string,
    {
      id: string;
      gameName: string;
      tagLine: string;
      region: string;
      puuid: string | null;
      lastSyncAt: string | null;
      minInterval: number;
    }
  >();

  for (const row of rows) {
    const existing = byPlayer.get(row.id);
    if (!existing) {
      byPlayer.set(row.id, {
        id: row.id,
        gameName: row.gameName,
        tagLine: row.tagLine,
        region: row.region,
        puuid: row.puuid ?? null,
        lastSyncAt: row.lastSyncAt ?? null,
        minInterval: row.syncIntervalMinutes,
      });
      continue;
    }

    if (row.syncIntervalMinutes < existing.minInterval) {
      existing.minInterval = row.syncIntervalMinutes;
    }
  }

  const duePlayers = Array.from(byPlayer.values())
    .filter((player) =>
      isPast({
        timestamp: player.lastSyncAt,
        minMinutes: player.minInterval,
      }),
    )
    .sort((a, b) => {
      const aTime = a.lastSyncAt ? Date.parse(a.lastSyncAt) : 0;
      const bTime = b.lastSyncAt ? Date.parse(b.lastSyncAt) : 0;
      return aTime - bTime;
    });

  const limit = params?.limit ?? DEFAULT_BATCH_SIZE;

  for (const player of duePlayers.slice(0, limit)) {
    await syncPlayer(player);
    await sleep(API_DELAY_MS);
  }

  return {
    processed: Math.min(duePlayers.length, limit),
    totalDue: duePlayers.length,
  };
}

export async function syncGroupPlayers(params: {
  groupId: string;
  force?: boolean;
  limit?: number;
}) {
  const settings = await getGroupSyncSettings(params.groupId);
  if (!settings) {
    return { processed: 0, totalDue: 0 };
  }

  const players = await getGroupPlayers(params.groupId);
  const duePlayers = players.filter((player) => {
    if (params.force) {
      return true;
    }

    return isPast({
      timestamp: player.lastSyncAt ?? null,
      minMinutes: settings.syncIntervalMinutes,
    });
  });

  const limit = params.limit ?? DEFAULT_BATCH_SIZE;

  for (const player of duePlayers.slice(0, limit)) {
    await syncPlayer({
      id: player.id,
      gameName: player.gameName,
      tagLine: player.tagLine,
      region: player.region,
      puuid: null,
      lastSyncAt: player.lastSyncAt ?? null,
      minInterval: settings.syncIntervalMinutes,
    });
    await sleep(API_DELAY_MS);
  }

  return {
    processed: Math.min(duePlayers.length, limit),
    totalDue: duePlayers.length,
  };
}

async function syncPlayer(player: {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  puuid: string | null;
  lastSyncAt: string | null;
  minInterval: number;
}) {
  const platformRegion = normalizePlatformRegion(player.region);
  const accountRegion = accountRegionForPlatform(platformRegion);
  const now = nowIso();

  try {
    let puuid = player.puuid;
    if (!puuid) {
      const account = await getAccountByRiotId({
        accountRegion,
        gameName: player.gameName,
        tagLine: player.tagLine,
      });
      puuid = account.puuid;
    }

    const summoner = await getSummonerByPuuid({
      platformRegion,
      puuid: puuid ?? "",
    });

    const entries = await getLeagueEntriesBySummoner({
      platformRegion,
      summonerId: summoner.id,
    });

    const solo = entries.find((entry) => entry.queueType === QUEUE_SOLO);

    await updatePlayerSync({
      playerId: player.id,
      puuid,
      tier: solo?.tier ?? null,
      division: solo?.rank ?? null,
      lp: solo?.leaguePoints ?? null,
      wins: solo?.wins ?? null,
      losses: solo?.losses ?? null,
      opggUrl: `https://www.op.gg/summoners/${opggRegion(platformRegion)}/${encodeURIComponent(
        `${player.gameName}-${player.tagLine}`,
      )}`,
      lastSyncAt: now,
    });

    await insertRankSnapshot({
      id: crypto.randomUUID(),
      playerId: player.id,
      queueType: QUEUE_SOLO,
      tier: solo?.tier ?? null,
      division: solo?.rank ?? null,
      lp: solo?.leaguePoints ?? null,
      wins: solo?.wins ?? null,
      losses: solo?.losses ?? null,
      fetchedAt: now,
    });

    logger.info("Riot sync success", {
      playerId: player.id,
      gameName: player.gameName,
      tagLine: player.tagLine,
    });
  } catch (error) {
    logger.error("Riot sync failed", {
      playerId: player.id,
      gameName: player.gameName,
      tagLine: player.tagLine,
      error: error instanceof Error ? error.message : String(error),
    });
  }
}
