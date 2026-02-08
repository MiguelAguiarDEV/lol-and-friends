"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import type { SyncActionState } from "@/app/g/[slug]/sync-types";
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
 * Compatible con useActionState: recibe (previousState, formData) y retorna SyncActionState.
 */
export async function publicSyncGroupAction(
  _previousState: SyncActionState,
  formData: FormData,
): Promise<SyncActionState> {
  const groupId = formData.get("groupId");
  if (typeof groupId !== "string" || !groupId) {
    return { status: "error", syncedAt: null };
  }

  const group = await getPublicGroupById(groupId);
  if (!group) {
    logger.warn("Public sync denied (group not public)", { groupId });
    return { status: "error", syncedAt: null };
  }

  const settings = await getGroupSyncSettings(groupId);
  if (!settings) {
    return { status: "error", syncedAt: null };
  }

  const allowed = isPast({
    timestamp: settings.lastManualSyncAt,
    minMinutes: PUBLIC_SYNC_COOLDOWN_MINUTES,
  });

  if (!allowed) {
    logger.info("Public sync cooldown not elapsed", { groupId });
    return { status: "cooldown", syncedAt: settings.lastManualSyncAt };
  }

  try {
    const result = await syncGroupPlayers({ groupId, force: true });

    logger.info("publicSyncGroupAction completed", {
      groupId,
      slug: group.slug,
      attempted: result.attempted,
      succeeded: result.succeeded,
      failed: result.failed,
      totalDue: result.totalDue,
      errors: result.errors,
    });

    await touchGroupManualSync({ groupId });
    revalidatePath(`/g/${group.slug}`);

    return { status: "success", syncedAt: new Date().toISOString() };
  } catch (error) {
    logger.error("publicSyncGroupAction failed", { groupId, error });
    return { status: "error", syncedAt: null };
  }
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
