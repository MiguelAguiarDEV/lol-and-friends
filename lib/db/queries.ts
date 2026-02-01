import { and, desc, eq, inArray, isNotNull, sql } from "drizzle-orm";
import { db, isDbConfigured } from "@/lib/db/client";
import {
  groupMembers,
  groupPlayers,
  groups,
  players,
  rankSnapshots,
  users,
} from "@/lib/db/schema";

const screenshotMode = process.env.SCREENSHOT_MODE === "true";
const screenshotNow = new Date().toISOString();
const screenshotGroup = {
  id: "demo-group",
  name: "Reto EUW",
  slug: "demo-euw",
  ownerId: "demo-user",
  isPublic: true,
  syncIntervalMinutes: 360,
  manualCooldownMinutes: 30,
  lastManualSyncAt: null,
  createdAt: screenshotNow,
  updatedAt: screenshotNow,
};
const screenshotPlayers = [
  {
    id: "demo-player-1",
    gameName: "AkaliSensei",
    tagLine: "EUW",
    region: "euw1",
    opggUrl: "https://www.op.gg/summoners/euw/AkaliSensei-EUW",
    tier: "DIAMOND",
    division: "IV",
    lp: 54,
    wins: 126,
    losses: 98,
    notes: "Racha positiva en la última semana.",
    objective: "DIAMOND III",
    monthCheckpoint: "En progreso",
    lastSyncAt: screenshotNow,
  },
  {
    id: "demo-player-2",
    gameName: "JinxMain",
    tagLine: "EUW",
    region: "euw1",
    opggUrl: "https://www.op.gg/summoners/euw/JinxMain-EUW",
    tier: "PLATINUM",
    division: "I",
    lp: 72,
    wins: 93,
    losses: 74,
    notes: "Priorizar dúo bot.",
    objective: "EMERALD IV",
    monthCheckpoint: "Fuerte",
    lastSyncAt: screenshotNow,
  },
];

export async function ensureUser(params: { id: string; email?: string }) {
  const existing = await db.query.users.findFirst({
    where: eq(users.id, params.id),
  });

  if (existing) {
    if (params.email && existing.email !== params.email) {
      await db
        .update(users)
        .set({ email: params.email })
        .where(eq(users.id, params.id));
    }
    return existing;
  }

  await db.insert(users).values({
    id: params.id,
    email: params.email,
  });

  return db.query.users.findFirst({ where: eq(users.id, params.id) });
}

export async function getPublicGroups() {
  if (screenshotMode) {
    return [screenshotGroup];
  }

  if (!isDbConfigured()) {
    return [];
  }

  return db.query.groups.findMany({
    where: eq(groups.isPublic, true),
    orderBy: desc(groups.createdAt),
  });
}

export async function getGroupsForUser(userId: string) {
  if (!isDbConfigured()) {
    return [];
  }

  return db
    .selectDistinct({
      id: groups.id,
      name: groups.name,
      slug: groups.slug,
      ownerId: groups.ownerId,
      isPublic: groups.isPublic,
      syncIntervalMinutes: groups.syncIntervalMinutes,
      manualCooldownMinutes: groups.manualCooldownMinutes,
      lastManualSyncAt: groups.lastManualSyncAt,
    })
    .from(groups)
    .leftJoin(groupMembers, eq(groupMembers.groupId, groups.id))
    .where(orOwnerOrMember({ userId }))
    .orderBy(desc(groups.createdAt));
}

function orOwnerOrMember(params: { userId: string }) {
  return sql`(${groups.ownerId} = ${params.userId} OR ${groupMembers.userId} = ${params.userId})`;
}

export async function getGroupBySlug(slug: string) {
  if (screenshotMode) {
    if (slug !== screenshotGroup.slug) {
      return null;
    }

    return { group: screenshotGroup, players: screenshotPlayers };
  }

  if (!isDbConfigured()) {
    return null;
  }

  const group = await db.query.groups.findFirst({
    where: eq(groups.slug, slug),
  });

  if (!group) {
    return null;
  }

  const playerRows = await db
    .select({
      id: players.id,
      gameName: players.gameName,
      tagLine: players.tagLine,
      region: players.region,
      opggUrl: players.opggUrl,
      tier: players.tier,
      division: players.division,
      lp: players.lp,
      wins: players.wins,
      losses: players.losses,
      notes: players.notes,
      objective: players.objective,
      monthCheckpoint: players.monthCheckpoint,
      lastSyncAt: players.lastSyncAt,
    })
    .from(players)
    .innerJoin(groupPlayers, eq(groupPlayers.playerId, players.id))
    .where(eq(groupPlayers.groupId, group.id))
    .orderBy(desc(players.updatedAt));

  return { group, players: playerRows };
}

export async function createGroup(params: {
  id: string;
  name: string;
  slug: string;
  ownerId: string;
  isPublic: boolean;
  syncIntervalMinutes: number;
  manualCooldownMinutes: number;
}) {
  await db.insert(groups).values({
    id: params.id,
    name: params.name,
    slug: params.slug,
    ownerId: params.ownerId,
    isPublic: params.isPublic,
    syncIntervalMinutes: params.syncIntervalMinutes,
    manualCooldownMinutes: params.manualCooldownMinutes,
  });

  await db.insert(groupMembers).values({
    groupId: params.id,
    userId: params.ownerId,
    role: "owner",
  });

  return db.query.groups.findFirst({ where: eq(groups.id, params.id) });
}

export async function updateGroupSettings(params: {
  groupId: string;
  syncIntervalMinutes: number;
  manualCooldownMinutes: number;
}) {
  await db
    .update(groups)
    .set({
      syncIntervalMinutes: params.syncIntervalMinutes,
      manualCooldownMinutes: params.manualCooldownMinutes,
      updatedAt: sql`(CURRENT_TIMESTAMP)`,
    })
    .where(eq(groups.id, params.groupId));
}

export async function touchGroupManualSync(params: { groupId: string }) {
  await db
    .update(groups)
    .set({
      lastManualSyncAt: sql`(CURRENT_TIMESTAMP)`,
      updatedAt: sql`(CURRENT_TIMESTAMP)`,
    })
    .where(eq(groups.id, params.groupId));
}

export async function findPlayerByIdentity(params: {
  gameName: string;
  tagLine: string;
  region: string;
}) {
  return db.query.players.findFirst({
    where: and(
      eq(players.gameName, params.gameName),
      eq(players.tagLine, params.tagLine),
      eq(players.region, params.region),
    ),
  });
}

export async function createPlayer(params: {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  opggUrl?: string;
}) {
  await db.insert(players).values({
    id: params.id,
    gameName: params.gameName,
    tagLine: params.tagLine,
    region: params.region,
    opggUrl: params.opggUrl,
  });

  return db.query.players.findFirst({ where: eq(players.id, params.id) });
}

export async function addPlayerToGroup(params: {
  groupId: string;
  playerId: string;
}) {
  await db
    .insert(groupPlayers)
    .values({
      groupId: params.groupId,
      playerId: params.playerId,
    })
    .onConflictDoNothing();
}

export async function removePlayerFromGroup(params: {
  groupId: string;
  playerId: string;
}) {
  await db
    .delete(groupPlayers)
    .where(
      and(
        eq(groupPlayers.groupId, params.groupId),
        eq(groupPlayers.playerId, params.playerId),
      ),
    );
}

export async function getGroupPlayers(groupId: string) {
  return db
    .select({
      id: players.id,
      gameName: players.gameName,
      tagLine: players.tagLine,
      region: players.region,
      opggUrl: players.opggUrl,
      tier: players.tier,
      division: players.division,
      lp: players.lp,
      wins: players.wins,
      losses: players.losses,
      notes: players.notes,
      objective: players.objective,
      monthCheckpoint: players.monthCheckpoint,
      lastSyncAt: players.lastSyncAt,
    })
    .from(players)
    .innerJoin(groupPlayers, eq(groupPlayers.playerId, players.id))
    .where(eq(groupPlayers.groupId, groupId));
}

export async function getPlayersForSync() {
  return db
    .select({
      id: players.id,
      gameName: players.gameName,
      tagLine: players.tagLine,
      region: players.region,
      puuid: players.puuid,
      lastSyncAt: players.lastSyncAt,
      groupId: groupPlayers.groupId,
      syncIntervalMinutes: groups.syncIntervalMinutes,
    })
    .from(players)
    .innerJoin(groupPlayers, eq(groupPlayers.playerId, players.id))
    .innerJoin(groups, eq(groups.id, groupPlayers.groupId))
    .where(eq(groups.isPublic, true))
    .orderBy(desc(players.updatedAt));
}

export async function updatePlayerSync(params: {
  playerId: string;
  puuid?: string;
  tier?: string | null;
  division?: string | null;
  lp?: number | null;
  wins?: number | null;
  losses?: number | null;
  opggUrl?: string | null;
  lastSyncAt: string;
}) {
  await db
    .update(players)
    .set({
      puuid: params.puuid,
      tier: params.tier,
      division: params.division,
      lp: params.lp,
      wins: params.wins,
      losses: params.losses,
      opggUrl: params.opggUrl,
      lastSyncAt: params.lastSyncAt,
      updatedAt: sql`(CURRENT_TIMESTAMP)`,
    })
    .where(eq(players.id, params.playerId));
}

export async function insertRankSnapshot(params: {
  id: string;
  playerId: string;
  queueType: string;
  tier?: string | null;
  division?: string | null;
  lp?: number | null;
  wins?: number | null;
  losses?: number | null;
  fetchedAt: string;
}) {
  await db.insert(rankSnapshots).values({
    id: params.id,
    playerId: params.playerId,
    queueType: params.queueType,
    tier: params.tier,
    division: params.division,
    lp: params.lp,
    wins: params.wins,
    losses: params.losses,
    fetchedAt: params.fetchedAt,
  });
}

export async function getGroupSyncSettings(groupId: string) {
  return db.query.groups.findFirst({
    where: eq(groups.id, groupId),
    columns: {
      syncIntervalMinutes: true,
      manualCooldownMinutes: true,
      lastManualSyncAt: true,
    },
  });
}

export async function findGroupsByIds(groupIds: string[]) {
  if (groupIds.length === 0) {
    return [];
  }

  return db.query.groups.findMany({
    where: inArray(groups.id, groupIds),
  });
}

export async function getPlayerGroups(playerId: string) {
  return db
    .select({
      groupId: groups.id,
      syncIntervalMinutes: groups.syncIntervalMinutes,
    })
    .from(groups)
    .innerJoin(groupPlayers, eq(groupPlayers.groupId, groups.id))
    .where(eq(groupPlayers.playerId, playerId));
}

export async function getPlayersNeedingPuuid() {
  return db.query.players.findMany({
    where: and(isNotNull(players.gameName), isNotNull(players.tagLine)),
    columns: {
      id: true,
      gameName: true,
      tagLine: true,
      region: true,
    },
  });
}
