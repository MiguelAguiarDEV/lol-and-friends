import { auth, currentUser } from "@clerk/nextjs/server";
import { notFound } from "next/navigation";
import { updateGroupSettingsAction } from "@/app/admin/actions";
import {
  publicSyncGroupAction,
  updateGroupPlayerMetaAction,
} from "@/app/g/[slug]/actions";
import { GroupAdminSettingsCard } from "@/components/group/group-admin-settings-card";
import { GroupPageHeader } from "@/components/group/group-page-header";
import { PageShell } from "@/components/layout/page-shell";
import { PlayersTable } from "@/components/players/players-table";
import type {
  PlayerSortDirection,
  PlayerSortKey,
} from "@/components/players/types";
import { isAdminEmail } from "@/lib/auth/admin";
import { getGroupBySlug } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type GroupPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ sort?: string; dir?: string }>;
};

export default async function GroupPage({
  params,
  searchParams,
}: GroupPageProps) {
  const { slug } = await params;
  const resolvedSearchParams = searchParams ? await searchParams : undefined;
  const data = await getGroupBySlug(slug);
  if (!data || !data.group.isPublic) {
    notFound();
  }

  const publicCooldownMinutes = 1;
  const sort = normalizeSort(resolvedSearchParams?.sort);
  const direction = normalizeDirection(resolvedSearchParams?.dir);
  const showAdminControls = await canShowAdminControls();

  return (
    <PageShell maxWidth="6xl">
      <GroupPageHeader
        groupId={data.group.id}
        groupName={data.group.name}
        lastManualSyncAt={data.group.lastManualSyncAt}
        cooldownMinutes={publicCooldownMinutes}
        onPublicSync={publicSyncGroupAction}
      />

      {showAdminControls ? (
        <GroupAdminSettingsCard
          groupId={data.group.id}
          syncIntervalMinutes={data.group.syncIntervalMinutes}
          manualCooldownMinutes={data.group.manualCooldownMinutes}
          onSave={updateGroupSettingsAction}
        />
      ) : null}

      <PlayersTable
        players={data.players.map((player) => ({
          id: player.id,
          gameName: player.gameName,
          tagLine: player.tagLine,
          region: player.region,
          opggUrl: player.opggUrl,
          tier: player.tier,
          division: player.division,
          lp: player.lp,
          wins: player.wins,
          losses: player.losses,
          notes: player.notes,
          objective: player.objective,
          monthCheckpoint: player.monthCheckpoint,
          lastSyncAt: player.lastSyncAt,
        }))}
        sort={sort}
        direction={direction}
        showHeader={false}
        showSortHint={false}
        groupSlug={data.group.slug}
        editableGroupId={showAdminControls ? data.group.id : undefined}
        onUpdatePlayerMeta={
          showAdminControls ? updateGroupPlayerMetaAction : undefined
        }
      />
    </PageShell>
  );
}

function normalizeSort(value?: string): PlayerSortKey {
  if (value === "lp" || value === "rank" || value === "updated") {
    return value;
  }
  return "winrate";
}

function normalizeDirection(value?: string): PlayerSortDirection {
  if (value === "asc") {
    return "asc";
  }
  return "desc";
}

async function canShowAdminControls() {
  const hasClerkKey = Boolean(process.env.NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY);
  if (!hasClerkKey) {
    return false;
  }

  const { userId } = await auth();
  if (!userId) {
    return false;
  }

  const user = await currentUser();
  return isAdminEmail(user?.primaryEmailAddress?.emailAddress);
}
