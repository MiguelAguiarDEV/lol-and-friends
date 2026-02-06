import { GroupsList } from "@/components/groups/groups-list";
import { PublicGroupsHeader } from "@/components/groups/public-groups-header";
import { PageShell } from "@/components/layout/page-shell";
import { getPublicGroups } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type PublicGroup = {
  id: string;
  name: string;
  slug: string;
};

/** Página principal con listado de grupos públicos. */
export default async function HomePage() {
  const groups = (await getPublicGroups()) as PublicGroup[];

  return (
    <PageShell maxWidth="5xl">
      <PublicGroupsHeader />
      <GroupsList
        groups={groups.map((group) => ({
          id: group.id,
          name: group.name,
          slug: group.slug,
        }))}
      />
    </PageShell>
  );
}
