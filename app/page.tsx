import { GroupsList } from "@/components/groups/groups-list";
import { getPublicGroups } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const groups = await getPublicGroups();

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-6">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Reto LoL — Grupos públicos
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Explora los grupos abiertos y sus rankings.
          </p>
        </header>

        <GroupsList
          groups={groups.map((group) => ({
            id: group.id,
            name: group.name,
            slug: group.slug,
          }))}
        />
      </div>
    </main>
  );
}
