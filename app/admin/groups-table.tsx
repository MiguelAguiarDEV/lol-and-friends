"use client";

import { useMemo, useState } from "react";
import { addPlayerAction } from "@/app/admin/actions";
import { QUEUE_OPTIONS } from "@/lib/riot/queues";
import { PLATFORM_REGION_OPTIONS } from "@/lib/riot/regions";

type GroupSummary = {
  id: string;
  name: string;
  slug: string;
  playersCount: number;
  syncIntervalMinutes: number | null;
};

type GroupsTableProps = {
  groups: GroupSummary[];
};

export function GroupsTable({ groups }: GroupsTableProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);

  const hasGroups = groups.length > 0;
  const groupRows = useMemo(() => groups, [groups]);

  return (
    <div className="space-y-4">
      {!hasGroups ? (
        <p className="text-sm text-gray-500">
          Crea un grupo para añadir jugadores.
        </p>
      ) : (
        <div className="overflow-hidden rounded-xl border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50 text-left text-xs font-semibold uppercase tracking-wide text-gray-500">
              <tr>
                <th className="px-4 py-3">Grupo</th>
                <th className="px-4 py-3">Slug</th>
                <th className="px-4 py-3">Jugadores</th>
                <th className="px-4 py-3">Sync (min)</th>
                <th className="px-4 py-3 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 bg-white">
              {groupRows.map((group) => (
                <tr key={group.id} className="text-gray-700">
                  <td className="px-4 py-3 font-medium text-gray-900">
                    {group.name}
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    /{group.slug}
                  </td>
                  <td className="px-4 py-3">{group.playersCount}</td>
                  <td className="px-4 py-3">
                    {group.syncIntervalMinutes ?? "—"}
                  </td>
                  <td className="px-4 py-3 text-right">
                    <button
                      type="button"
                      className="rounded-md border border-gray-200 bg-white px-3 py-1 text-xs font-medium text-gray-700 transition hover:border-gray-900 hover:text-gray-900"
                      onClick={() => setSelectedGroup(group)}
                    >
                      Añadir jugador
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedGroup ? (
        <div
          role="dialog"
          aria-modal="true"
          className="fixed inset-0 z-50 flex items-center justify-center px-4"
        >
          <button
            type="button"
            aria-label="Cerrar modal"
            className="absolute inset-0 bg-gray-900/40"
            onClick={() => setSelectedGroup(null)}
          />
          <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-xl">
            <div className="space-y-1">
              <h3 className="text-lg font-semibold text-gray-900">
                Añadir jugador
              </h3>
              <p className="text-xs text-gray-500">
                Grupo: {selectedGroup.name}
              </p>
            </div>
            <form action={addPlayerAction} className="mt-4 grid gap-4">
              <input type="hidden" name="groupId" value={selectedGroup.id} />
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="modal-game-name"
                    className="text-xs font-medium text-gray-500"
                  >
                    Riot ID
                  </label>
                  <input
                    id="modal-game-name"
                    name="gameName"
                    required
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="GameName"
                  />
                </div>
                <div>
                  <label
                    htmlFor="modal-tag-line"
                    className="text-xs font-medium text-gray-500"
                  >
                    Tag
                  </label>
                  <input
                    id="modal-tag-line"
                    name="tagLine"
                    required
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    placeholder="EUW"
                  />
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="modal-queue"
                    className="text-xs font-medium text-gray-500"
                  >
                    Cola
                  </label>
                  <select
                    id="modal-queue"
                    name="queueType"
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    defaultValue="RANKED_SOLO_5x5"
                  >
                    {QUEUE_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label
                    htmlFor="modal-region"
                    className="text-xs font-medium text-gray-500"
                  >
                    Región
                  </label>
                  <select
                    id="modal-region"
                    name="region"
                    className="mt-1 w-full rounded-md border border-gray-200 px-3 py-2 text-sm"
                    defaultValue="euw1"
                  >
                    {PLATFORM_REGION_OPTIONS.map((option) => (
                      <option key={option.value} value={option.value}>
                        {option.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  className="rounded-md border border-gray-200 bg-white px-4 py-2 text-sm font-medium text-gray-700"
                  onClick={() => setSelectedGroup(null)}
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  className="rounded-md bg-gray-900 px-4 py-2 text-sm font-medium text-white"
                >
                  Guardar jugador
                </button>
              </div>
            </form>
          </div>
        </div>
      ) : null}
    </div>
  );
}
