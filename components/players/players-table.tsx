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
        <h1 className="text-3xl font-semibold text-gray-900">
          Reto LoL — Tabla pública
        </h1>
        <p className="text-sm text-gray-600">
          Vista read-only. Los datos se actualizarán desde el panel admin.
        </p>
      </header>

      <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white shadow-sm">
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
