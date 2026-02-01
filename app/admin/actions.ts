"use server";

import { auth, currentUser } from "@clerk/nextjs/server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
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

const createGroupSchema = z.object({
  name: z.string().min(2),
  syncIntervalMinutes: z.coerce.number().min(15).max(1440).default(360),
  manualCooldownMinutes: z.coerce.number().min(5).max(240).default(30),
});

const settingsSchema = z.object({
  groupId: z.string().min(1),
  syncIntervalMinutes: z.coerce.number().min(15).max(1440),
  manualCooldownMinutes: z.coerce.number().min(5).max(240),
});

const playerSchema = z.object({
  groupId: z.string().min(1),
  gameName: z.string().min(2),
  tagLine: z.string().min(2),
  region: z.string().min(2),
});

const removePlayerSchema = z.object({
  groupId: z.string().min(1),
  playerId: z.string().min(1),
});

const manualSyncSchema = z.object({
  groupId: z.string().min(1),
});

async function requireUser() {
  const { userId } = auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  await ensureUser({
    id: userId,
    email: user?.primaryEmailAddress?.emailAddress,
  });

  return { userId };
}

async function assertGroupAccess(params: { userId: string; groupId: string }) {
  const groups = await getGroupsForUser(params.userId);
  const allowed = groups.some((group) => group.id === params.groupId);
  if (!allowed) {
    throw new Error("No access to group");
  }
}

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

export async function updateGroupSettingsAction(formData: FormData) {
  const { userId } = await requireUser();
  const parsed = settingsSchema.parse({
    groupId: formData.get("groupId"),
    syncIntervalMinutes: formData.get("syncIntervalMinutes"),
    manualCooldownMinutes: formData.get("manualCooldownMinutes"),
  });

  await assertGroupAccess({ userId, groupId: parsed.groupId });
  await updateGroupSettings(parsed);

  revalidatePath("/admin");
}

export async function addPlayerAction(formData: FormData) {
  const { userId } = await requireUser();
  const parsed = playerSchema.parse({
    groupId: formData.get("groupId"),
    gameName: formData.get("gameName"),
    tagLine: formData.get("tagLine"),
    region: formData.get("region"),
  });

  await assertGroupAccess({ userId, groupId: parsed.groupId });
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

export async function removePlayerAction(formData: FormData) {
  const { userId } = await requireUser();
  const parsed = removePlayerSchema.parse({
    groupId: formData.get("groupId"),
    playerId: formData.get("playerId"),
  });

  await assertGroupAccess({ userId, groupId: parsed.groupId });
  await removePlayerFromGroup(parsed);

  revalidatePath("/admin");
}

export async function manualSyncGroupAction(formData: FormData) {
  const { userId } = await requireUser();
  const parsed = manualSyncSchema.parse({
    groupId: formData.get("groupId"),
  });

  await assertGroupAccess({ userId, groupId: parsed.groupId });
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
