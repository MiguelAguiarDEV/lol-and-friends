"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  addPlayerToGroup,
  createGroup,
  createPlayer,
  ensureUser,
  findPlayerByIdentity,
  getGroupBySlug,
  getGroupSyncSettings,
  getGroupsForUser,
  removePlayerFromGroup,
  touchGroupManualSync,
  updateGroupSettings,
} from "@/lib/db/queries";
import { logger } from "@/lib/logger";
import { normalizePlatformRegion, opggRegion } from "@/lib/riot/regions";
import { syncGroupPlayers } from "@/lib/riot/sync";
import { slugify, withSlugSuffix } from "@/lib/utils/slug";
import { isPast } from "@/lib/utils/time";
import {
  createGroupSchema,
  manualSyncSchema,
  playerSchema,
  removePlayerSchema,
  settingsSchema,
} from "@/lib/validations/admin";

/**
 * Garantiza una sesión válida y sincroniza usuario en DB.
 * @returns IDs de sesión.
 */
async function requireUser() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? undefined;
  await ensureUser({
    id: userId,
    email,
  });

  return { userId, isAdmin: isAdminEmail(email) };
}

/**
 * Valida que el usuario tenga acceso al grupo.
 * @param params - IDs de usuario y grupo.
 */
async function assertGroupAccess(params: { userId: string; groupId: string }) {
  const groups = await getGroupsForUser(params.userId);
  const allowed = groups.some((group) => group.id === params.groupId);
  if (!allowed) {
    throw new Error("No access to group");
  }
}

/**
 * Crea un grupo público desde el panel admin.
 * @param formData - Datos del formulario.
 */
export async function createGroupAction(formData: FormData) {
  const { userId } = await requireUser();
  const parsed = createGroupSchema.parse({
    name: formData.get("name"),
    syncIntervalMinutes: formData.get("syncIntervalMinutes"),
    manualCooldownMinutes: formData.get("manualCooldownMinutes"),
  });

  const baseSlug = slugify(parsed.name);
  if (!baseSlug) {
    throw new Error("Slug inválido");
  }

  let slug = baseSlug;
  let suffix = 2;
  while (await getGroupBySlug(slug)) {
    slug = withSlugSuffix(baseSlug, suffix);
    suffix += 1;
  }

  await createGroup({
    id: crypto.randomUUID(),
    name: parsed.name,
    slug,
    ownerId: userId,
    isPublic: true,
    syncIntervalMinutes: parsed.syncIntervalMinutes,
    manualCooldownMinutes: parsed.manualCooldownMinutes,
  });

  revalidatePath("/admin");
}

/**
 * Actualiza settings del grupo.
 * @param formData - Datos del formulario.
 */
export async function updateGroupSettingsAction(formData: FormData) {
  const { userId, isAdmin } = await requireUser();
  const parsed = settingsSchema.parse({
    groupId: formData.get("groupId"),
    syncIntervalMinutes: formData.get("syncIntervalMinutes"),
    manualCooldownMinutes: formData.get("manualCooldownMinutes"),
  });

  if (!isAdmin) {
    await assertGroupAccess({ userId, groupId: parsed.groupId });
  }
  await updateGroupSettings(parsed);

  revalidatePath("/admin");
}

/**
 * Añade un jugador a un grupo.
 * @param formData - Datos del formulario.
 */
export async function addPlayerAction(formData: FormData) {
  const { userId, isAdmin } = await requireUser();
  const parsed = playerSchema.parse({
    groupId: formData.get("groupId"),
    gameName: formData.get("gameName"),
    tagLine: formData.get("tagLine"),
    region: formData.get("region"),
    queueType: formData.get("queueType"),
  });

  if (!isAdmin) {
    await assertGroupAccess({ userId, groupId: parsed.groupId });
  }
  const region = normalizePlatformRegion(parsed.region);

  let player = await findPlayerByIdentity({
    gameName: parsed.gameName,
    tagLine: parsed.tagLine,
    region,
  });

  if (!player) {
    player = await createPlayer({
      id: crypto.randomUUID(),
      gameName: parsed.gameName,
      tagLine: parsed.tagLine,
      region,
      queueType: parsed.queueType,
      opggUrl: `https://www.op.gg/summoners/${opggRegion(region)}/${encodeURIComponent(
        `${parsed.gameName}-${parsed.tagLine}`,
      )}`,
    });
  }

  if (player) {
    await addPlayerToGroup({ groupId: parsed.groupId, playerId: player.id });
  }

  revalidatePath("/admin");
}

/**
 * Quita un jugador de un grupo.
 * @param formData - Datos del formulario.
 */
export async function removePlayerAction(formData: FormData) {
  const { userId, isAdmin } = await requireUser();
  const parsed = removePlayerSchema.parse({
    groupId: formData.get("groupId"),
    playerId: formData.get("playerId"),
  });

  if (!isAdmin) {
    await assertGroupAccess({ userId, groupId: parsed.groupId });
  }
  await removePlayerFromGroup(parsed);

  revalidatePath("/admin");
}

/**
 * Ejecuta un sync manual con cooldown.
 * @param formData - Datos del formulario.
 */
export async function manualSyncGroupAction(formData: FormData) {
  const { userId, isAdmin } = await requireUser();
  const parsed = manualSyncSchema.parse({
    groupId: formData.get("groupId"),
  });

  if (!isAdmin) {
    await assertGroupAccess({ userId, groupId: parsed.groupId });
  }
  const settings = await getGroupSyncSettings(parsed.groupId);
  if (!settings) {
    return;
  }

  const allowed = isPast({
    timestamp: settings.lastManualSyncAt,
    minMinutes: settings.manualCooldownMinutes,
  });

  if (!allowed) {
    logger.warn("Manual sync cooldown not elapsed", {
      groupId: parsed.groupId,
    });
    return;
  }

  await syncGroupPlayers({ groupId: parsed.groupId, force: true, limit: 5 });
  await touchGroupManualSync({ groupId: parsed.groupId });

  revalidatePath("/admin");
}
