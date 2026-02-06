import { SectionCard } from "@/components/layout/section-card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getQueueLabel } from "@/lib/riot/queues";

type GroupDetail = {
  id: string;
  name: string;
  slug: string;
  syncIntervalMinutes: number | null;
  manualCooldownMinutes: number | null;
};

type GroupPlayer = {
  id: string;
  gameName: string;
  tagLine: string;
  region: string;
  queueType: string;
  tier?: string | null;
  division?: string | null;
};

type GroupDetailCardProps = {
  group: GroupDetail;
  players: GroupPlayer[];
  onManualSync: (formData: FormData) => void | Promise<void>;
  onUpdateSettings: (formData: FormData) => void | Promise<void>;
  onRemovePlayer: (formData: FormData) => void | Promise<void>;
};

export function GroupDetailCard({
  group,
  players,
  onManualSync,
  onUpdateSettings,
  onRemovePlayer,
}: GroupDetailCardProps) {
  const syncId = `group-${group.id}-sync`;
  const cooldownId = `group-${group.id}-cooldown`;

  return (
    <SectionCard>
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h3 className="text-xl font-semibold text-card-foreground">
            {group.name}
          </h3>
          <p className="text-sm text-muted-foreground">/{group.slug}</p>
        </div>
        <form action={onManualSync}>
          <input type="hidden" name="groupId" value={group.id} />
          <Button type="submit" variant="outline" size="sm">
            Sync manual
          </Button>
        </form>
      </div>

      <form
        action={onUpdateSettings}
        className="mt-4 grid gap-4 sm:grid-cols-3"
      >
        <input type="hidden" name="groupId" value={group.id} />
        <div>
          <Label htmlFor={syncId}>Intervalo sync (min)</Label>
          <Input
            id={syncId}
            name="syncIntervalMinutes"
            type="number"
            min={0.5}
            step={0.5}
            max={1440}
            defaultValue={group.syncIntervalMinutes ?? 360}
          />
        </div>
        <div>
          <Label htmlFor={cooldownId}>Cooldown manual (min)</Label>
          <Input
            id={cooldownId}
            name="manualCooldownMinutes"
            type="number"
            min={0.5}
            step={0.5}
            max={240}
            defaultValue={group.manualCooldownMinutes ?? 30}
          />
        </div>
        <Button type="submit" size="sm" className="h-fit">
          Guardar ajustes
        </Button>
      </form>

      <div className="mt-6">
        <div className="flex items-center gap-2">
          <h4 className="text-base font-semibold text-card-foreground">
            Jugadores
          </h4>
          <Badge variant="muted">{players.length}</Badge>
        </div>
        <div className="mt-3 space-y-3">
          {players.length === 0 ? (
            <p className="text-sm text-muted-foreground">Sin jugadores aún.</p>
          ) : (
            players.map((player) => (
              <div
                key={player.id}
                className="flex flex-col gap-3 rounded-md border border-border/70 p-3 sm:flex-row sm:items-center sm:justify-between"
              >
                <div>
                  <div className="text-sm font-medium text-card-foreground">
                    {player.gameName}#{player.tagLine}
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {player.region.toUpperCase()} ·{" "}
                    {getQueueLabel(player.queueType)} · {player.tier ?? "—"}{" "}
                    {player.division ?? ""}
                  </div>
                </div>
                <form action={onRemovePlayer}>
                  <input type="hidden" name="groupId" value={group.id} />
                  <input type="hidden" name="playerId" value={player.id} />
                  <Button type="submit" variant="outline" size="sm">
                    Quitar
                  </Button>
                </form>
              </div>
            ))
          )}
        </div>
      </div>
    </SectionCard>
  );
}
