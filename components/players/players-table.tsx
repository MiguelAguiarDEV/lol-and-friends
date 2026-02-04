"use client";

import { ArrowDown, ArrowUp, ArrowUpDown } from "lucide-react";
import { useState } from "react";
import { formatPercent, getGames, getWinrate } from "@/lib/players/metrics";
import { getRankScore } from "@/lib/players/rank";

export type PlayerRow = {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  opggUrl?: string | null;
  tier?: string | null;
  division?: string | null;
  lp?: number | null;
  wins?: number | null;
  losses?: number | null;
  notes?: string | null;
  objective?: string | null;
  monthCheckpoint?: string | null;
  lastSyncAt?: string | null;
};

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
});

type SortKey = "winrate" | "lp" | "rank" | "updated";
type SortDirection = "asc" | "desc";

type PlayersTableProps = {
  players: PlayerRow[];
  title?: string;
  subtitle?: string;
  initialSort?: SortKey;
};

/**
 * Render the public players table with sortable column headers.
 */
export function PlayersTable(props: PlayersTableProps) {
  const [sortKey, setSortKey] = useState<SortKey>(
    props.initialSort ?? "winrate",
  );
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc");

  const handleSort = (key: SortKey) => {
    if (sortKey === key) {
      // Toggle direction if clicking the same column
      setSortDirection(sortDirection === "desc" ? "asc" : "desc");
    } else {
      // New column - default to desc for most metrics
      setSortKey(key);
      setSortDirection("desc");
    }
  };

  const sortedPlayers = [...props.players].sort((a, b) => {
    const winsA = a.wins ?? 0;
    const lossesA = a.losses ?? 0;
    const winsB = b.wins ?? 0;
    const lossesB = b.losses ?? 0;

    let comparison = 0;

    if (sortKey === "lp") {
      comparison = (b.lp ?? 0) - (a.lp ?? 0);
    } else if (sortKey === "rank") {
      comparison =
        getRankScore({ tier: b.tier, division: b.division, lp: b.lp }) -
        getRankScore({ tier: a.tier, division: a.division, lp: a.lp });
    } else if (sortKey === "updated") {
      const timeA = a.lastSyncAt ? Date.parse(a.lastSyncAt) : 0;
      const timeB = b.lastSyncAt ? Date.parse(b.lastSyncAt) : 0;
      comparison = timeB - timeA;
    } else {
      comparison =
        getWinrate({ wins: winsB, losses: lossesB }) -
        getWinrate({ wins: winsA, losses: lossesA });
    }

    // Apply direction
    return sortDirection === "desc" ? comparison : -comparison;
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-neutral-900 dark:text-neutral-100 sm:text-3xl">
          {props.title ?? "Reto LoL — Tabla pública"}
        </h1>
        <p className="text-sm text-neutral-600 dark:text-neutral-400 sm:text-base">
          {props.subtitle ??
            "Vista read-only. Los datos se actualizarán desde el panel admin."}
        </p>
      </header>

      <div className="grid gap-4 md:hidden">
        {sortedPlayers.map((player) => {
          const wins = player.wins ?? 0;
          const losses = player.losses ?? 0;
          const games = getGames({ wins, losses });
          const winrate = getWinrate({ wins, losses });

          return (
            <article
              key={player.id}
              className="rounded-lg border border-neutral-200 bg-white p-4 shadow-sm dark:border-neutral-800 dark:bg-neutral-950"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-neutral-900 dark:text-neutral-100">
                    {player.gameName}
                    <span className="text-sm text-neutral-400 dark:text-neutral-500">
                      #{player.tagLine}
                    </span>
                  </div>
                  <div className="text-xs text-neutral-500 dark:text-neutral-400">
                    Liga actual: {player.tier ?? "—"} {player.division ?? ""}
                  </div>
                  {player.notes ? (
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">
                      {player.notes}
                    </div>
                  ) : null}
                </div>
                <div className="text-right text-xs text-neutral-600 dark:text-neutral-400">
                  <div className="font-semibold text-neutral-900 dark:text-neutral-100">
                    {player.tier ?? "—"} {player.division ?? ""}
                  </div>
                  <div>{player.region.toUpperCase()}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-neutral-600 dark:text-neutral-400 sm:grid-cols-3">
                <div>
                  <div className="text-[10px] uppercase text-neutral-400 dark:text-neutral-500">
                    LP
                  </div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {player.lp ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-neutral-400 dark:text-neutral-500">
                    W/L
                  </div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {wins}/{losses}
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {games} games
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-neutral-400 dark:text-neutral-500">
                    WR
                  </div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {formatPercent(winrate)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-neutral-400 dark:text-neutral-500">
                    Objetivo
                  </div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {player.objective ?? "—"}
                  </div>
                  <div className="text-[10px] text-neutral-400 dark:text-neutral-500">
                    {player.monthCheckpoint ?? "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-neutral-400 dark:text-neutral-500">
                    Actualizado
                  </div>
                  <div className="font-medium text-neutral-900 dark:text-neutral-100">
                    {player.lastSyncAt
                      ? dateFormatter.format(new Date(player.lastSyncAt))
                      : "—"}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-neutral-400 dark:text-neutral-500">
                    OPGG
                  </div>
                  {player.opggUrl ? (
                    <a
                      className="font-medium text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition-colors hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-700 dark:hover:decoration-neutral-100"
                      href={player.opggUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver perfil
                    </a>
                  ) : (
                    <span className="text-neutral-400 dark:text-neutral-500">
                      —
                    </span>
                  )}
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-lg border border-neutral-200 bg-white shadow-sm md:block dark:border-neutral-800 dark:bg-neutral-950">
        <table className="min-w-full text-left text-sm text-neutral-900 dark:text-neutral-100">
          <thead className="border-b border-neutral-200 bg-neutral-50 text-[11px] font-medium uppercase tracking-wider text-neutral-600 dark:border-neutral-800 dark:bg-neutral-900 dark:text-neutral-400">
            <tr>
              <th className="px-4 py-3">Jugador</th>
              <th className="px-4 py-3">Región</th>
              <th
                className="cursor-pointer select-none px-4 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => handleSort("rank")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("rank");
                  }
                }}
                tabIndex={0}
                aria-sort={
                  sortKey === "rank"
                    ? sortDirection === "desc"
                      ? "descending"
                      : "ascending"
                    : "none"
                }
              >
                <div className="flex items-center gap-1.5">
                  Liga
                  {sortKey === "rank" ? (
                    sortDirection === "desc" ? (
                      <ArrowDown
                        className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <ArrowUp
                        className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100"
                        strokeWidth={2.5}
                      />
                    )
                  ) : (
                    <ArrowUpDown
                      className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                      strokeWidth={2}
                    />
                  )}
                </div>
              </th>
              <th
                className="cursor-pointer select-none px-4 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => handleSort("lp")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("lp");
                  }
                }}
                tabIndex={0}
                aria-sort={
                  sortKey === "lp"
                    ? sortDirection === "desc"
                      ? "descending"
                      : "ascending"
                    : "none"
                }
              >
                <div className="flex items-center gap-1.5">
                  LP
                  {sortKey === "lp" ? (
                    sortDirection === "desc" ? (
                      <ArrowDown
                        className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <ArrowUp
                        className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100"
                        strokeWidth={2.5}
                      />
                    )
                  ) : (
                    <ArrowUpDown
                      className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                      strokeWidth={2}
                    />
                  )}
                </div>
              </th>
              <th className="px-4 py-3">W/L</th>
              <th
                className="cursor-pointer select-none px-4 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => handleSort("winrate")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("winrate");
                  }
                }}
                tabIndex={0}
                aria-sort={
                  sortKey === "winrate"
                    ? sortDirection === "desc"
                      ? "descending"
                      : "ascending"
                    : "none"
                }
              >
                <div className="flex items-center gap-1.5">
                  Winrate
                  {sortKey === "winrate" ? (
                    sortDirection === "desc" ? (
                      <ArrowDown
                        className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <ArrowUp
                        className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100"
                        strokeWidth={2.5}
                      />
                    )
                  ) : (
                    <ArrowUpDown
                      className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                      strokeWidth={2}
                    />
                  )}
                </div>
              </th>
              <th className="px-4 py-3">Objetivo</th>
              <th
                className="cursor-pointer select-none px-4 py-3 transition-colors hover:bg-neutral-100 dark:hover:bg-neutral-800"
                onClick={() => handleSort("updated")}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    handleSort("updated");
                  }
                }}
                tabIndex={0}
                aria-sort={
                  sortKey === "updated"
                    ? sortDirection === "desc"
                      ? "descending"
                      : "ascending"
                    : "none"
                }
              >
                <div className="flex items-center gap-1.5">
                  Últ. actualización
                  {sortKey === "updated" ? (
                    sortDirection === "desc" ? (
                      <ArrowDown
                        className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100"
                        strokeWidth={2.5}
                      />
                    ) : (
                      <ArrowUp
                        className="h-3.5 w-3.5 text-neutral-900 dark:text-neutral-100"
                        strokeWidth={2.5}
                      />
                    )
                  ) : (
                    <ArrowUpDown
                      className="h-3.5 w-3.5 text-neutral-400 dark:text-neutral-500"
                      strokeWidth={2}
                    />
                  )}
                </div>
              </th>
              <th className="px-4 py-3">OPGG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-neutral-100 dark:divide-neutral-800">
            {sortedPlayers.map((player) => {
              const wins = player.wins ?? 0;
              const losses = player.losses ?? 0;
              const games = getGames({ wins, losses });
              const winrate = getWinrate({ wins, losses });

              return (
                <tr
                  key={player.id}
                  className="transition-colors hover:bg-neutral-50 dark:hover:bg-neutral-900/50"
                >
                  <td className="px-4 py-3">
                    <div className="font-medium text-neutral-900 dark:text-neutral-100">
                      {player.gameName}
                      <span className="text-xs text-neutral-400 dark:text-neutral-500">
                        #{player.tagLine}
                      </span>
                    </div>
                    <div className="text-xs text-neutral-500 dark:text-neutral-400">
                      Liga actual: {player.tier ?? "—"} {player.division ?? ""}
                    </div>
                    {player.notes ? (
                      <div className="text-xs text-neutral-400 dark:text-neutral-500">
                        {player.notes}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{player.region.toUpperCase()}</td>
                  <td className="px-4 py-3">
                    {player.tier ?? "—"} {player.division ?? ""}
                  </td>
                  <td className="px-4 py-3">{player.lp ?? "—"}</td>
                  <td className="px-4 py-3">
                    {wins}/{losses}
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">
                      {games} games
                    </div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPercent(winrate)}
                  </td>
                  <td className="px-4 py-3">
                    {player.objective ?? "—"}
                    <div className="text-xs text-neutral-400 dark:text-neutral-500">
                      {player.monthCheckpoint ?? "—"}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-neutral-500 dark:text-neutral-400">
                    {player.lastSyncAt
                      ? dateFormatter.format(new Date(player.lastSyncAt))
                      : "—"}
                  </td>
                  <td className="px-4 py-3">
                    {player.opggUrl ? (
                      <a
                        className="text-neutral-900 underline decoration-neutral-300 underline-offset-2 transition-colors hover:decoration-neutral-900 dark:text-neutral-100 dark:decoration-neutral-700 dark:hover:decoration-neutral-100"
                        href={player.opggUrl}
                        target="_blank"
                        rel="noreferrer"
                      >
                        Ver perfil
                      </a>
                    ) : (
                      <span className="text-neutral-400 dark:text-neutral-500">
                        —
                      </span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </section>
  );
}
