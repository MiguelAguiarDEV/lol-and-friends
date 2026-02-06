import { PlayerMetaEditForm } from "@/components/players/player-meta-edit-form";
import { PlayerSortHeader } from "@/components/players/player-sort-header";
import type {
  PlayerRow,
  PlayerSortDirection,
  PlayerSortKey,
} from "@/components/players/types";
import { formatPercent, getGames, getWinrate } from "@/lib/players/metrics";
import { getRankScore } from "@/lib/players/rank";

const dateFormatter = new Intl.DateTimeFormat("es-ES", {
  dateStyle: "medium",
});

type PlayersTableProps = {
  players: PlayerRow[];
  groupSlug: string;
  sort?: PlayerSortKey;
  direction?: PlayerSortDirection;
  title?: string;
  subtitle?: string;
  showHeader?: boolean;
  showSortHint?: boolean;
  editableGroupId?: string;
  onUpdatePlayerMeta?: (formData: FormData) => void | Promise<void>;
};

/**
 * Renderiza la tabla pública con orden y edición inline para admin.
 */
export function PlayersTable({
  players,
  groupSlug,
  sort = "winrate",
  direction = "desc",
  title,
  subtitle,
  showHeader = true,
  showSortHint = true,
  editableGroupId,
  onUpdatePlayerMeta,
}: PlayersTableProps) {
  const sortedPlayers = [...players].sort((a, b) =>
    comparePlayers({ a, b, sort, direction }),
  );
  const showAdminEditor = Boolean(editableGroupId && onUpdatePlayerMeta);

  return (
    <section className="space-y-6">
      {showHeader ? (
        <header className="space-y-2">
          <h2 className="text-xl font-semibold text-foreground sm:text-2xl">
            {title ?? "Tabla de jugadores"}
          </h2>
          {subtitle ? (
            <p className="text-base text-muted-foreground">{subtitle}</p>
          ) : null}
          {showSortHint ? (
            <p className="text-sm text-muted-foreground">
              Orden:{" "}
              <span className="font-medium text-foreground">
                {getSortLabel(sort)} ({direction === "desc" ? "desc" : "asc"})
              </span>
            </p>
          ) : null}
        </header>
      ) : null}

      <div className="grid gap-4 md:hidden">
        {sortedPlayers.map((player) => (
          <PlayerMobileCard
            key={player.id}
            player={player}
            showAdminEditor={showAdminEditor}
            editableGroupId={editableGroupId}
            onUpdatePlayerMeta={onUpdatePlayerMeta}
          />
        ))}
      </div>

      <div className="hidden overflow-x-auto rounded-xl border border-border bg-card shadow-sm md:block">
        <table className="min-w-full text-left text-sm text-card-foreground">
          <thead className="bg-muted/40 text-xs uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Jugador</th>
              <th className="px-4 py-3">Región</th>
              <th className="px-4 py-3">
                <PlayerSortHeader
                  groupSlug={groupSlug}
                  label="Liga"
                  currentSort={sort}
                  currentDirection={direction}
                  targetSort="rank"
                />
              </th>
              <th className="px-4 py-3">
                <PlayerSortHeader
                  groupSlug={groupSlug}
                  label="LP"
                  currentSort={sort}
                  currentDirection={direction}
                  targetSort="lp"
                />
              </th>
              <th className="px-4 py-3">W/L</th>
              <th className="px-4 py-3">
                <PlayerSortHeader
                  groupSlug={groupSlug}
                  label="Winrate"
                  currentSort={sort}
                  currentDirection={direction}
                  targetSort="winrate"
                />
              </th>
              <th className="px-4 py-3">Objetivo</th>
              <th className="px-4 py-3">
                <PlayerSortHeader
                  groupSlug={groupSlug}
                  label="Últ. actualización"
                  currentSort={sort}
                  currentDirection={direction}
                  targetSort="updated"
                />
              </th>
              <th className="px-4 py-3">OPGG</th>
              {showAdminEditor ? <th className="px-4 py-3">Editar</th> : null}
            </tr>
          </thead>
          <tbody className="divide-y divide-border">
            {sortedPlayers.map((player) => (
              <PlayerDesktopRow
                key={player.id}
                player={player}
                showAdminEditor={showAdminEditor}
                editableGroupId={editableGroupId}
                onUpdatePlayerMeta={onUpdatePlayerMeta}
              />
            ))}
          </tbody>
        </table>
      </div>
    </section>
  );
}

function PlayerMobileCard(props: {
  player: PlayerRow;
  showAdminEditor: boolean;
  editableGroupId?: string;
  onUpdatePlayerMeta?: (formData: FormData) => void | Promise<void>;
}) {
  const wins = props.player.wins ?? 0;
  const losses = props.player.losses ?? 0;
  const games = getGames({ wins, losses });
  const winrate = getWinrate({ wins, losses });

  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div className="space-y-1">
          <div className="text-base font-semibold text-card-foreground">
            {props.player.gameName}
            <span className="text-sm text-muted-foreground">
              #{props.player.tagLine}
            </span>
          </div>
          <div className="text-xs text-muted-foreground">
            Liga actual: {props.player.tier ?? "—"}{" "}
            {props.player.division ?? ""}
          </div>
          {props.player.notes ? (
            <div className="text-xs text-muted-foreground">
              {props.player.notes}
            </div>
          ) : null}
        </div>
        <div className="text-right text-xs text-muted-foreground">
          <div className="font-semibold text-card-foreground">
            {props.player.tier ?? "—"} {props.player.division ?? ""}
          </div>
          <div>{props.player.region.toUpperCase()}</div>
        </div>
      </div>

      <div className="mt-3 grid grid-cols-2 gap-3 text-xs text-muted-foreground sm:grid-cols-3">
        <PlayerMetric label="LP" value={props.player.lp ?? "—"} />
        <div>
          <PlayerMetric label="W/L" value={`${wins}/${losses}`} />
          <div className="text-xs text-muted-foreground">{games} games</div>
        </div>
        <PlayerMetric label="WR" value={formatPercent(winrate)} />
        <div>
          <PlayerMetric
            label="Objetivo"
            value={props.player.objective ?? "—"}
          />
          <div className="text-xs text-muted-foreground">
            {props.player.monthCheckpoint ?? "—"}
          </div>
        </div>
        <PlayerMetric
          label="Actualizado"
          value={
            props.player.lastSyncAt
              ? dateFormatter.format(new Date(props.player.lastSyncAt))
              : "—"
          }
        />
        <div>
          <div className="text-xs uppercase text-muted-foreground">OPGG</div>
          {props.player.opggUrl ? (
            <a
              className="font-medium text-primary hover:text-accent"
              href={props.player.opggUrl}
              target="_blank"
              rel="noreferrer"
            >
              Ver perfil
            </a>
          ) : (
            <span className="text-muted-foreground">—</span>
          )}
        </div>
      </div>

      {props.showAdminEditor &&
      props.editableGroupId &&
      props.onUpdatePlayerMeta ? (
        <div className="mt-3 border-t border-border pt-3">
          <PlayerMetaEditForm
            groupId={props.editableGroupId}
            playerId={props.player.id}
            notes={props.player.notes}
            objective={props.player.objective}
            monthCheckpoint={props.player.monthCheckpoint}
            onSave={props.onUpdatePlayerMeta}
          />
        </div>
      ) : null}
    </article>
  );
}

function PlayerMetric(props: { label: string; value: string | number }) {
  return (
    <div>
      <div className="text-xs uppercase text-muted-foreground">
        {props.label}
      </div>
      <div className="font-medium text-card-foreground">{props.value}</div>
    </div>
  );
}

function PlayerDesktopRow(props: {
  player: PlayerRow;
  showAdminEditor: boolean;
  editableGroupId?: string;
  onUpdatePlayerMeta?: (formData: FormData) => void | Promise<void>;
}) {
  const wins = props.player.wins ?? 0;
  const losses = props.player.losses ?? 0;
  const games = getGames({ wins, losses });
  const winrate = getWinrate({ wins, losses });

  return (
    <tr className="hover:bg-muted/35">
      <td className="px-4 py-3">
        <div className="font-medium text-card-foreground">
          {props.player.gameName}
          <span className="text-xs text-muted-foreground">
            #{props.player.tagLine}
          </span>
        </div>
        <div className="text-xs text-muted-foreground">
          Liga actual: {props.player.tier ?? "—"} {props.player.division ?? ""}
        </div>
        {props.player.notes ? (
          <div className="text-xs text-muted-foreground">
            {props.player.notes}
          </div>
        ) : null}
      </td>
      <td className="px-4 py-3">{props.player.region.toUpperCase()}</td>
      <td className="px-4 py-3">
        {props.player.tier ?? "—"} {props.player.division ?? ""}
      </td>
      <td className="px-4 py-3">{props.player.lp ?? "—"}</td>
      <td className="px-4 py-3">
        {wins}/{losses}
        <div className="text-xs text-muted-foreground">{games} games</div>
      </td>
      <td className="px-4 py-3 font-medium">{formatPercent(winrate)}</td>
      <td className="px-4 py-3">
        {props.player.objective ?? "—"}
        <div className="text-xs text-muted-foreground">
          {props.player.monthCheckpoint ?? "—"}
        </div>
      </td>
      <td className="px-4 py-3 text-xs text-muted-foreground">
        {props.player.lastSyncAt
          ? dateFormatter.format(new Date(props.player.lastSyncAt))
          : "—"}
      </td>
      <td className="px-4 py-3">
        {props.player.opggUrl ? (
          <a
            className="text-primary hover:text-accent"
            href={props.player.opggUrl}
            target="_blank"
            rel="noreferrer"
          >
            Ver perfil
          </a>
        ) : (
          <span className="text-muted-foreground">—</span>
        )}
      </td>
      {props.showAdminEditor &&
      props.editableGroupId &&
      props.onUpdatePlayerMeta ? (
        <td className="px-4 py-3">
          <PlayerMetaEditForm
            groupId={props.editableGroupId}
            playerId={props.player.id}
            notes={props.player.notes}
            objective={props.player.objective}
            monthCheckpoint={props.player.monthCheckpoint}
            onSave={props.onUpdatePlayerMeta}
          />
        </td>
      ) : null}
    </tr>
  );
}

function getSortLabel(sortKey: PlayerSortKey) {
  if (sortKey === "rank") {
    return "Rango";
  }
  if (sortKey === "lp") {
    return "LP";
  }
  if (sortKey === "updated") {
    return "Última actualización";
  }
  return "Winrate";
}

function comparePlayers(params: {
  a: PlayerRow;
  b: PlayerRow;
  sort: PlayerSortKey;
  direction: PlayerSortDirection;
}) {
  const winsA = params.a.wins ?? 0;
  const lossesA = params.a.losses ?? 0;
  const winsB = params.b.wins ?? 0;
  const lossesB = params.b.losses ?? 0;

  let baseComparison = 0;
  if (params.sort === "lp") {
    baseComparison = (params.b.lp ?? 0) - (params.a.lp ?? 0);
  } else if (params.sort === "rank") {
    baseComparison =
      getRankScore({
        tier: params.b.tier,
        division: params.b.division,
        lp: params.b.lp,
      }) -
      getRankScore({
        tier: params.a.tier,
        division: params.a.division,
        lp: params.a.lp,
      });
  } else if (params.sort === "updated") {
    const timeA = params.a.lastSyncAt ? Date.parse(params.a.lastSyncAt) : 0;
    const timeB = params.b.lastSyncAt ? Date.parse(params.b.lastSyncAt) : 0;
    baseComparison = timeB - timeA;
  } else {
    baseComparison =
      getWinrate({ wins: winsB, losses: lossesB }) -
      getWinrate({ wins: winsA, losses: lossesA });
  }

  return params.direction === "asc" ? -baseComparison : baseComparison;
}
