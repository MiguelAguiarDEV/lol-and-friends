/** Drizzle schema definitions for users, groups, players, and rank snapshots. */
import { sql } from "drizzle-orm";
import {
  index,
  integer,
  primaryKey,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const users = sqliteTable("users", {
  id: text("id").primaryKey(),
  email: text("email"),
  createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
});

export const groups = sqliteTable(
  "groups",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    ownerId: text("owner_id")
      .notNull()
      .references(() => users.id),
    isPublic: integer("is_public", { mode: "boolean" }).notNull().default(true),
    syncIntervalMinutes: integer("sync_interval_minutes")
      .notNull()
      .default(360),
    manualCooldownMinutes: integer("manual_cooldown_minutes")
      .notNull()
      .default(30),
    lastManualSyncAt: text("last_manual_sync_at"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  },
  (table) => {
    return {
      slugIndex: uniqueIndex("groups_slug_unique").on(table.slug),
      ownerIndex: index("groups_owner_idx").on(table.ownerId),
    };
  },
);

export const groupMembers = sqliteTable(
  "group_members",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    userId: text("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    role: text("role").notNull().default("owner"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.groupId, table.userId] }),
      userIndex: index("group_members_user_idx").on(table.userId),
    };
  },
);

export const players = sqliteTable(
  "players",
  {
    id: text("id").primaryKey(),
    gameName: text("game_name").notNull(),
    tagLine: text("tag_line").notNull(),
    region: text("region").notNull(),
    puuid: text("puuid"),
    opggUrl: text("opgg_url"),
    tier: text("tier"),
    division: text("division"),
    lp: integer("lp"),
    wins: integer("wins"),
    losses: integer("losses"),
    notes: text("notes"),
    objective: text("objective"),
    monthCheckpoint: text("month_checkpoint"),
    lastSyncAt: text("last_sync_at"),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    updatedAt: text("updated_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  },
  (table) => {
    return {
      identity: uniqueIndex("players_identity_unique").on(
        table.gameName,
        table.tagLine,
        table.region,
      ),
      puuidIndex: index("players_puuid_idx").on(table.puuid),
    };
  },
);

export const groupPlayers = sqliteTable(
  "group_players",
  {
    groupId: text("group_id")
      .notNull()
      .references(() => groups.id, { onDelete: "cascade" }),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  },
  (table) => {
    return {
      pk: primaryKey({ columns: [table.groupId, table.playerId] }),
      playerIndex: index("group_players_player_idx").on(table.playerId),
    };
  },
);

export const rankSnapshots = sqliteTable(
  "rank_snapshots",
  {
    id: text("id").primaryKey(),
    playerId: text("player_id")
      .notNull()
      .references(() => players.id, { onDelete: "cascade" }),
    queueType: text("queue_type").notNull(),
    tier: text("tier"),
    division: text("division"),
    lp: integer("lp"),
    wins: integer("wins"),
    losses: integer("losses"),
    fetchedAt: text("fetched_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
    createdAt: text("created_at").default(sql`(CURRENT_TIMESTAMP)`).notNull(),
  },
  (table) => {
    return {
      playerIndex: index("rank_snapshots_player_idx").on(table.playerId),
    };
  },
);
