import { auth, currentUser } from "@clerk/nextjs/server";
import { redirect } from "next/navigation";
import {
  createGroupAction,
  manualSyncGroupAction,
  removePlayerAction,
  updateGroupSettingsAction,
} from "@/app/admin/actions";
import { GroupsTable } from "@/app/admin/groups-table";
import { isAdminEmail } from "@/lib/auth/admin";
import {
  ensureUser,
  getAllGroups,
  getGroupPlayers,
  getGroupsForUser,
} from "@/lib/db/queries";
import { getQueueLabel } from "@/lib/riot/queues";

export default async function AdminPage() {
  const { userId } = await auth();
  if (!userId) {
    redirect("/sign-in");
  }

  const user = await currentUser();
  const email = user?.primaryEmailAddress?.emailAddress ?? null;
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

  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8">
        <header className="space-y-2">
          <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
            Panel admin
          </h1>
          <p className="text-sm text-gray-600 sm:text-base">
            Gestiona tus grupos públicos y jugadores.
          </p>
        </header>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-gray-900">Crear grupo</h2>
          <form
            action={createGroupAction}
            className="mt-4 grid gap-4 sm:grid-cols-4"
          >
            <div className="sm:col-span-2">
              <label
                htmlFor="group-name"
                className="text-xs font-medium text-gray-500"
              >
                Nombre
              </label>
              <input
                id="group-name"
                name="name"
                required
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                placeholder="Reto EUW"
              />
            </div>
            <div>
              <label
                htmlFor="group-sync-interval"
                className="text-xs font-medium text-gray-500"
              >
                Intervalo sync (min)
              </label>
              <input
                id="group-sync-interval"
                name="syncIntervalMinutes"
                type="number"
                min={0.5}
                step={0.5}
                max={1440}
                defaultValue={360}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <div>
              <label
                htmlFor="group-manual-cooldown"
                className="text-xs font-medium text-gray-500"
              >
                Cooldown manual (min)
              </label>
              <input
                id="group-manual-cooldown"
                name="manualCooldownMinutes"
                type="number"
                min={5}
                max={240}
                defaultValue={30}
                className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="submit"
              className="inline-flex items-center justify-center rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white sm:col-span-4 sm:w-fit"
            >
              Crear grupo
            </button>
          </form>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm">
          <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Grupos</h2>
              <p className="text-sm text-gray-600">
                Selecciona un grupo para añadir jugadores.
              </p>
            </div>
          </div>
          <div className="mt-4">
            <GroupsTable
              groups={groups.map((group) => ({
                id: group.id,
                name: group.name,
                slug: group.slug,
                playersCount: playersByGroup.get(group.id)?.length ?? 0,
                syncIntervalMinutes: group.syncIntervalMinutes ?? null,
              }))}
            />
          </div>
        </section>

        {groups.map((group) => {
          const players = playersByGroup.get(group.id) ?? [];
          const syncId = `group-${group.id}-sync`;
          const cooldownId = `group-${group.id}-cooldown`;

          return (
            <section
              key={group.id}
              className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm"
            >
              <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">
                    {group.name}
                  </h3>
                  <p className="text-xs text-gray-500">/{group.slug}</p>
                </div>
                <form action={manualSyncGroupAction}>
                  <input type="hidden" name="groupId" value={group.id} />
                  <button
                    type="submit"
                    className="rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-xs font-medium text-gray-700"
                  >
                    Sync manual
                  </button>
                </form>
              </div>

              <form
                action={updateGroupSettingsAction}
                className="mt-4 grid gap-4 sm:grid-cols-3"
              >
                <input type="hidden" name="groupId" value={group.id} />
                <div>
                  <label
                    htmlFor={syncId}
                    className="text-xs font-medium text-gray-500"
                  >
                    Intervalo sync (min)
                  </label>
                  <input
                    id={syncId}
                    name="syncIntervalMinutes"
                    type="number"
                    min={0.5}
                    step={0.5}
                    max={1440}
                    defaultValue={group.syncIntervalMinutes ?? 360}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <div>
                  <label
                    htmlFor={cooldownId}
                    className="text-xs font-medium text-gray-500"
                  >
                    Cooldown manual (min)
                  </label>
                  <input
                    id={cooldownId}
                    name="manualCooldownMinutes"
                    type="number"
                    min={5}
                    max={240}
                    defaultValue={group.manualCooldownMinutes ?? 30}
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                  />
                </div>
                <button
                  type="submit"
                  className="h-fit rounded-md bg-gray-900 px-3 py-2 text-xs font-medium text-white"
                >
                  Guardar ajustes
                </button>
              </form>

              <div className="mt-6">
                <h4 className="text-sm font-semibold text-gray-900">
                  Jugadores ({players.length})
                </h4>
                <div className="mt-3 space-y-3">
                  {players.length === 0 ? (
                    <p className="text-sm text-gray-500">Sin jugadores aún.</p>
                  ) : (
                    players.map((player) => (
                      <div
                        key={player.id}
                        className="flex flex-col gap-3 rounded-md border border-gray-100 p-3 sm:flex-row sm:items-center sm:justify-between"
                      >
                        <div>
                          <div className="text-sm font-medium text-gray-900">
                            {player.gameName}#{player.tagLine}
                          </div>
                          <div className="text-xs text-gray-500">
                            {player.region.toUpperCase()} ·{" "}
                            {getQueueLabel(player.queueType)} ·{" "}
                            {player.tier ?? "—"} {player.division ?? ""}
                          </div>
                        </div>
                        <form action={removePlayerAction}>
                          <input
                            type="hidden"
                            name="groupId"
                            value={group.id}
                          />
                          <input
                            type="hidden"
                            name="playerId"
                            value={player.id}
                          />
                          <button
                            type="submit"
                            className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-600"
                          >
                            Quitar
                          </button>
                        </form>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>
          );
        })}
      </div>
    </main>
  );
}
