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
  getLeagueEntriesByPuuid,
  RiotRateLimitError,
} from "@/lib/riot/api";
import type { RiotQueueType } from "@/lib/riot/queues";
import {
  accountRegionForPlatform,
  normalizePlatformRegion,
  opggRegion,
} from "@/lib/riot/regions";
import { isPast, nowIso } from "@/lib/utils/time";

const QUEUE_SOLO = "RANKED_SOLO_5x5";
const DEFAULT_BATCH_SIZE = 5;
const API_DELAY_MS = 350;
const RATE_LIMIT_RETRIES = 2;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function withRateLimitRetry<T>(
  fn: () => Promise<T>,
  context: Record<string, unknown>,
) {
  let attempt = 0;
  while (true) {
    try {
      return await fn();
    } catch (error) {
      if (error instanceof RiotRateLimitError && attempt < RATE_LIMIT_RETRIES) {
        const waitSeconds = Math.max(1, error.retryAfterSeconds);
        const jitter = Math.floor(Math.random() * 250);
        logger.warn("Riot rate limit hit, retrying", {
          ...context,
          attempt,
          retryAfterSeconds: waitSeconds,
          limitType: error.limitType,
        });
        await sleep(waitSeconds * 1000 + jitter);
        attempt += 1;
        continue;
      }
      throw error;
    }
  }
}

/**
 * Sincroniza jugadores cuyo intervalo de actualización ha expirado.
 * @param params - Opciones de sincronización.
 * @param params.limit - Máximo de jugadores a procesar.
 * @returns Resumen con procesados y pendientes.
 */
export async function syncDuePlayers(params?: { limit?: number }) {
  const rows = await getPlayersForSync();
  const byPlayer = new Map<
    string,
    {
      id: string;
      gameName: string;
      tagLine: string;
      region: string;
      queueType: RiotQueueType;
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
        queueType: (row.queueType ?? QUEUE_SOLO) as RiotQueueType,
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

/**
 * Sincroniza jugadores de un grupo específico.
 * @param params - Opciones de sincronización.
 * @param params.groupId - ID del grupo.
 * @param params.force - Si true, ignora intervalos y sincroniza todo.
 * @param params.limit - Máximo de jugadores a procesar.
 * @returns Resumen con procesados y pendientes.
 */
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
      queueType: (player.queueType ?? QUEUE_SOLO) as RiotQueueType,
      puuid: player.puuid ?? null,
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
  queueType: RiotQueueType;
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
      const account = await withRateLimitRetry(
        () =>
          getAccountByRiotId({
            accountRegion,
            gameName: player.gameName,
            tagLine: player.tagLine,
          }),
        {
          playerId: player.id,
          action: "getAccountByRiotId",
          region: player.region,
        },
      );
      puuid = account.puuid;
    }

    if (!puuid) {
      throw new Error(
        `Missing PUUID for ${player.gameName}#${player.tagLine} (${player.region})`,
      );
    }

    const entries = await withRateLimitRetry(
      () =>
        getLeagueEntriesByPuuid({
          platformRegion,
          puuid,
        }),
      {
        playerId: player.id,
        action: "getLeagueEntriesByPuuid",
        region: player.region,
      },
    );

    const queueType = player.queueType ?? QUEUE_SOLO;
    const solo = entries.find((entry) => entry.queueType === queueType);

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
      queueType,
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
      queueType,
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
