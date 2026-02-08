import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

type GroupAdminSettingsCardProps = {
  groupId: string;
  syncIntervalMinutes: number | null;
  manualCooldownMinutes: number | null;
  onSave: (formData: FormData) => void | Promise<void>;
};

export function GroupAdminSettingsCard({
  groupId,
  syncIntervalMinutes,
  manualCooldownMinutes,
  onSave,
}: GroupAdminSettingsCardProps) {
  return (
    <SectionCard className="p-4">
      <h2 className="text-sm font-semibold text-card-foreground">
        Ajustes del grupo (admin)
      </h2>
      <form action={onSave} className="mt-3 grid gap-3 sm:grid-cols-3">
        <input type="hidden" name="groupId" value={groupId} />
        <div>
          <Label htmlFor="public-group-sync-interval">
            Intervalo sync (min)
          </Label>
          <Input
            id="public-group-sync-interval"
            name="syncIntervalMinutes"
            type="number"
            min={0.5}
            step={0.5}
            max={1440}
            defaultValue={syncIntervalMinutes ?? 360}
          />
        </div>
        <div>
          <Label htmlFor="public-group-manual-cooldown">
            Cooldown manual (min)
          </Label>
          <Input
            id="public-group-manual-cooldown"
            name="manualCooldownMinutes"
            type="number"
            min={0.5}
            step={0.5}
            max={240}
            defaultValue={manualCooldownMinutes ?? 30}
          />
        </div>
        <Button type="submit" size="sm" className="h-fit">
          Guardar ajustes
        </Button>
      </form>
    </SectionCard>
  );
}
