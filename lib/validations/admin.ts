/** Zod schemas for admin actions. */
import { z } from "zod";

export const createGroupSchema = z.object({
  name: z.string().min(2),
  syncIntervalMinutes: z.coerce.number().min(0.5).max(1440).default(360),
  manualCooldownMinutes: z.coerce.number().min(0.5).max(240).default(30),
});

export const settingsSchema = z.object({
  groupId: z.string().min(1),
  syncIntervalMinutes: z.coerce.number().min(0.5).max(1440),
  manualCooldownMinutes: z.coerce.number().min(0.5).max(240),
});

export const playerSchema = z.object({
  groupId: z.string().min(1),
  gameName: z.string().min(2),
  tagLine: z.string().min(2),
  region: z.string().min(2),
  queueType: z
    .enum(["RANKED_SOLO_5x5", "RANKED_FLEX_SR"])
    .default("RANKED_SOLO_5x5"),
});

export const removePlayerSchema = z.object({
  groupId: z.string().min(1),
  playerId: z.string().min(1),
});

export const manualSyncSchema = z.object({
  groupId: z.string().min(1),
});

const nullablePlayerText = z
  .string()
  .max(160)
  .or(z.literal(""))
  .transform((value) => {
    const trimmed = value.trim();
    return trimmed.length > 0 ? trimmed : null;
  });

export const updatePlayerMetaSchema = z.object({
  groupId: z.string().min(1),
  playerId: z.string().min(1),
  notes: nullablePlayerText,
  objective: nullablePlayerText,
  monthCheckpoint: nullablePlayerText,
});
