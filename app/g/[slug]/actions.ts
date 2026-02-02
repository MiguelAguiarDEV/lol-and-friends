"use server";

import { revalidatePath } from "next/cache";
import {
  getGroupSyncSettings,
  getPublicGroupById,
  touchGroupManualSync,
} from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { syncGroupPlayers } from "@/lib/riot/sync";
import { isPast } from "@/lib/utils/time";

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
