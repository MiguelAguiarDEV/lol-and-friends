import { GroupsTable } from "@/app/admin/groups-table";
import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";

type GroupSummary = {
  id: string;
  name: string;
  slug: string;
  playersCount: number;
  syncIntervalMinutes: number | null;
};

type GroupsOverviewCardProps = {
  groups: GroupSummary[];
};

export function GroupsOverviewCard({ groups }: GroupsOverviewCardProps) {
  return (
    <SectionCard>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">
            Directorio de grupos
          </h2>
          <p className="text-sm text-muted-foreground">
            Añade jugadores en un click.
          </p>
        </div>
        <Badge variant="muted">{groups.length} grupos</Badge>
      </div>
      <div className="mt-4">
        <GroupsTable groups={groups} />
      </div>
    </SectionCard>
  );
}
