import Link from "next/link";
import { notFound } from "next/navigation";
import { publicSyncGroupAction } from "@/app/g/[slug]/actions";
import { PublicSyncButton } from "@/app/g/[slug]/public-sync-button";
import { PlayersTable } from "@/components/players/players-table";
import { getGroupBySlug } from "@/lib/db/queries";

export const dynamic = "force-dynamic";

type GroupPageProps = {
  params: Promise<{ slug: string }>;
  searchParams?: Promise<{ sort?: string }>;
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
  const sortOptions = [
    { value: "winrate", label: "Winrate" },
    { value: "rank", label: "Rango" },
    { value: "lp", label: "LP" },
    { value: "updated", label: "Actualizado" },
  ];

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
              {data.group.name}
            </h1>
            <p className="text-sm text-gray-600 sm:text-base">
              Ranking actualizado automáticamente desde Riot.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
            <span>Ordenar por</span>
            <div className="flex flex-wrap gap-2">
              {sortOptions.map((option) => (
                <Link
                  key={option.value}
                  href={`/g/${data.group.slug}?sort=${option.value}`}
                  className={`rounded-full border px-3 py-1 text-xs ${
                    sort === option.value
                      ? "border-gray-900 bg-gray-900 text-white"
                      : "border-gray-200 bg-white text-gray-700"
                  }`}
                >
                  {option.label}
                </Link>
              ))}
            </div>
          </div>
          <form action={publicSyncGroupAction} className="flex items-center">
            <input type="hidden" name="groupId" value={data.group.id} />
            <PublicSyncButton
              lastManualSyncAt={data.group.lastManualSyncAt}
              cooldownMinutes={publicCooldownMinutes}
            />
          </form>
        </div>
        <p className="text-xs text-gray-500">Cooldown público: 1 minuto.</p>

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
          title="Tabla pública"
          subtitle="Vista read-only del grupo."
          sort={sort}
        />
      </div>
    </main>
  );
}

function normalizeSort(value?: string) {
  if (value === "lp" || value === "rank" || value === "updated") {
    return value;
  }
  return "winrate";
}
