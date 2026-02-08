"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  getGroupPlayers,
  getGroupSyncSettings,
  getPublicGroupById,
  touchGroupManualSync,
  updatePlayerMeta,
} from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { syncGroupPlayers } from "@/lib/riot/sync";
import { isPast } from "@/lib/utils/time";
import { updatePlayerMetaSchema } from "@/lib/validations/admin";

const PUBLIC_SYNC_COOLDOWN_MINUTES = 1;

/**
 * Ejecuta un sync público para un grupo (cooldown 1 minuto).
 * @param formData - FormData con groupId.
 */
export async function publicSyncGroupAction(formData: FormData) {
  const groupId = formData.get("groupId");
  if (typeof groupId !== "string" || !groupId) {
    return;
  }

  const group = await getPublicGroupById(groupId);
  if (!group) {
    logger.warn("Public sync denied (group not public)", { groupId });
    return;
  }

  const settings = await getGroupSyncSettings(groupId);
  if (!settings) {
    return;
  }

  const allowed = isPast({
    timestamp: settings.lastManualSyncAt,
    minMinutes: PUBLIC_SYNC_COOLDOWN_MINUTES,
  });

  if (!allowed) {
    logger.info("Public sync cooldown not elapsed", { groupId });
    return;
  }

  await syncGroupPlayers({ groupId, force: true, limit: 5 });
  await touchGroupManualSync({ groupId });
  revalidatePath(`/g/${group.slug}`);
}

/**
 * Edita metadatos de un jugador desde la tabla pública si el usuario es admin.
 * @param formData - FormData con groupId/playerId y campos editables.
 */
export async function updateGroupPlayerMetaAction(formData: FormData) {
  const { userId } = await auth();
  if (!userId) {
    return;
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? undefined;
  if (!isAdminEmail(email)) {
    logger.warn("Player update denied (not admin)", { userId });
    return;
  }

  const parsed = updatePlayerMetaSchema.parse({
    groupId: formData.get("groupId"),
    playerId: formData.get("playerId"),
    notes: formData.get("notes"),
    objective: formData.get("objective"),
    monthCheckpoint: formData.get("monthCheckpoint"),
  });

  const group = await getPublicGroupById(parsed.groupId);
  if (!group) {
    return;
  }

  const players = await getGroupPlayers(parsed.groupId);
  if (!players.some((player) => player.id === parsed.playerId)) {
    logger.warn("Player update denied (player not in group)", {
      groupId: parsed.groupId,
      playerId: parsed.playerId,
    });
    return;
  }

  await updatePlayerMeta({
    playerId: parsed.playerId,
    notes: parsed.notes,
    objective: parsed.objective,
    monthCheckpoint: parsed.monthCheckpoint,
  });

  revalidatePath(`/g/${group.slug}`);
  revalidatePath("/admin");
}
