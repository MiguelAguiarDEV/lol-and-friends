import { SectionCard } from "@/components/layout/section-card";

type AdminStatsGridProps = {
  totalGroups: number;
  totalPlayers: number;
};

export function AdminStatsGrid({
  totalGroups,
  totalPlayers,
}: AdminStatsGridProps) {
  const averagePlayers =
    totalGroups > 0 ? (totalPlayers / totalGroups).toFixed(1) : "0.0";

  return (
    <div className="grid gap-3 sm:grid-cols-3">
      <StatCard label="Grupos" value={String(totalGroups)} />
      <StatCard label="Jugadores" value={String(totalPlayers)} />
      <StatCard label="Media / grupo" value={averagePlayers} />
    </div>
  );
}

function StatCard(props: { label: string; value: string }) {
  return (
    <SectionCard className="p-4">
      <p className="text-sm text-muted-foreground">{props.label}</p>
      <p className="mt-1 text-2xl font-semibold text-card-foreground">
        {props.value}
      </p>
    </SectionCard>
  );
}
