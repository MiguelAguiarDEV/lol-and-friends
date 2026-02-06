import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  createGroupAction,
  manualSyncGroupAction,
  removePlayerAction,
  updateGroupSettingsAction,
} from "@/app/admin/actions";
import { AdminStatsGrid } from "@/components/admin/admin-stats-grid";
import { CreateGroupCard } from "@/components/admin/create-group-card";
import { GroupDetailCard } from "@/components/admin/group-detail-card";
import { GroupsOverviewCard } from "@/components/admin/groups-overview-card";
import { PageHeader } from "@/components/layout/page-header";
import { PageShell } from "@/components/layout/page-shell";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  ensureUser,
  getAllGroups,
  getGroupPlayers,
  getGroupsForUser,
} from "@/lib/db/queries";

export default async function AdminPage() {
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

  const isAdmin = isAdminEmail(email);
  const groups = isAdmin
    ? await getAllGroups()
    : await getGroupsForUser(userId);
  const playersByGroup = new Map<
    string,
    Awaited<ReturnType<typeof getGroupPlayers>>
  >(
    await Promise.all(
      groups.map(
        async (group) => [group.id, await getGroupPlayers(group.id)] as const,
      ),
    ),
  );
  const totalPlayers = Array.from(playersByGroup.values()).reduce(
    (total, players) => total + players.length,
    0,
  );

  return (
    <PageShell maxWidth="5xl" gapClassName="gap-8">
      <PageHeader
        title="Panel admin"
        description="Gestión de grupos y jugadores."
      />

      <AdminStatsGrid totalGroups={groups.length} totalPlayers={totalPlayers} />

      <CreateGroupCard action={createGroupAction} />

      <GroupsOverviewCard
        groups={groups.map((group) => ({
          id: group.id,
          name: group.name,
          slug: group.slug,
          playersCount: playersByGroup.get(group.id)?.length ?? 0,
          syncIntervalMinutes: group.syncIntervalMinutes ?? null,
        }))}
      />

      {groups.map((group) => (
        <GroupDetailCard
          key={group.id}
          group={{
            id: group.id,
            name: group.name,
            slug: group.slug,
            syncIntervalMinutes: group.syncIntervalMinutes ?? null,
            manualCooldownMinutes: group.manualCooldownMinutes ?? null,
          }}
          players={(playersByGroup.get(group.id) ?? []).map((player) => ({
            id: player.id,
            gameName: player.gameName,
            tagLine: player.tagLine,
            region: player.region,
            queueType: player.queueType,
            tier: player.tier,
            division: player.division,
          }))}
          onManualSync={manualSyncGroupAction}
          onUpdateSettings={updateGroupSettingsAction}
          onRemovePlayer={removePlayerAction}
        />
      ))}
    </PageShell>
  );
}
