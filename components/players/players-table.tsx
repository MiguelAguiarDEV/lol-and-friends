import { formatPercent, getGames, getWinrate } from "@/lib/players/metrics";
import type { Player } from "@/lib/types";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
});

/**
 * Render the public players table.
 */
export function PlayersTable(props: { players: Player[] }) {
  const sortedPlayers = [...props.players].sort((a, b) => {
    return (
      getWinrate({ wins: b.wins, losses: b.losses }) -
      getWinrate({ wins: a.wins, losses: a.losses })
    );
  });

  return (
    <section className="space-y-6">
      <header className="space-y-2">
        <h1 className="text-2xl font-semibold text-gray-900 sm:text-3xl">
          Reto LoL — Tabla pública
        </h1>
        <p className="text-sm text-gray-600 sm:text-base">
          Vista read-only. Los datos se actualizarán desde el panel admin.
        </p>
      </header>

      <div className="grid gap-4 md:hidden">
        {sortedPlayers.map((player) => {
          const games = getGames({ wins: player.wins, losses: player.losses });
          const winrate = getWinrate({
            wins: player.wins,
            losses: player.losses,
          });

          return (
            <article
              key={player.id}
              className="rounded-xl border border-gray-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="text-base font-semibold text-gray-900">
                    {player.name}
                  </div>
                  <div className="text-xs text-gray-500">
                    Pico: {player.peakRank}
                  </div>
                  {player.notes ? (
                    <div className="text-xs text-gray-400">{player.notes}</div>
                  ) : null}
                </div>
                <div className="text-right text-xs text-gray-600">
                  <div className="font-semibold text-gray-900">
                    {player.tier} {player.division}
                  </div>
                  <div>{player.role}</div>
                </div>
              </div>

              <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-gray-600 sm:grid-cols-3">
                <div>
                  <div className="text-[10px] uppercase text-gray-400">LP</div>
                  <div className="font-medium text-gray-900">{player.lp}</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">W/L</div>
                  <div className="font-medium text-gray-900">
                    {player.wins}/{player.losses}
                  </div>
                  <div className="text-[10px] text-gray-400">{games} games</div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">WR</div>
                  <div className="font-medium text-gray-900">
                    {formatPercent(winrate)}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">
                    Objetivo
                  </div>
                  <div className="font-medium text-gray-900">
                    {player.objective}
                  </div>
                  <div className="text-[10px] text-gray-400">
                    {player.monthCheckpoint}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">
                    Actualizado
                  </div>
                  <div className="font-medium text-gray-900">
                    {dateFormatter.format(new Date(player.lastUpdated))}
                  </div>
                </div>
                <div>
                  <div className="text-[10px] uppercase text-gray-400">
                    OPGG
                  </div>
                  <a
                    className="font-medium text-blue-600 hover:text-blue-800"
                    href={player.opggUrl}
                    target="_blank"
                    rel="noreferrer"
                  >
                    Ver perfil
                  </a>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm md:block">
        <table className="min-w-full text-left text-sm text-gray-700">
          <thead className="bg-gray-50 text-xs uppercase tracking-wide text-gray-500">
            <tr>
              <th className="px-4 py-3">Jugador</th>
              <th className="px-4 py-3">Rol</th>
              <th className="px-4 py-3">Liga</th>
              <th className="px-4 py-3">LP</th>
              <th className="px-4 py-3">W/L</th>
              <th className="px-4 py-3">Winrate</th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">Últ. actualización</th>
              <th className="px-4 py-3">OPGG</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {sortedPlayers.map((player) => {
              const games = getGames({
                wins: player.wins,
                losses: player.losses,
              });
              const winrate = getWinrate({
                wins: player.wins,
                losses: player.losses,
              });

              return (
                <tr key={player.id} className="hover:bg-gray-50">
                  <td className="px-4 py-3">
                    <div className="font-medium text-gray-900">
                      {player.name}
                    </div>
                    <div className="text-xs text-gray-500">
                      Pico: {player.peakRank}
                    </div>
                    {player.notes ? (
                      <div className="text-xs text-gray-400">
                        {player.notes}
                      </div>
                    ) : null}
                  </td>
                  <td className="px-4 py-3">{player.role}</td>
                  <td className="px-4 py-3">
                    {player.tier} {player.division}
                  </td>
                  <td className="px-4 py-3">{player.lp}</td>
                  <td className="px-4 py-3">
                    {player.wins}/{player.losses}
                    <div className="text-xs text-gray-400">{games} games</div>
                  </td>
                  <td className="px-4 py-3 font-medium">
                    {formatPercent(winrate)}
                  </td>
                  <td className="px-4 py-3">
                    {player.objective}
                    <div className="text-xs text-gray-400">
                      {player.monthCheckpoint}
                    </div>
                  </td>
                  <td className="px-4 py-3 text-xs text-gray-500">
                    {dateFormatter.format(new Date(player.lastUpdated))}
                  </td>
                  <td className="px-4 py-3">
                    <a
                      className="text-blue-600 hover:text-blue-800"
                      href={player.opggUrl}
                      target="_blank"
                      rel="noreferrer"
                    >
                      Ver perfil
                    </a>
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
