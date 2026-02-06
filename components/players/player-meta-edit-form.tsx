import { Button } from "@/components/ui/button";

type PlayerMetaEditFormProps = {
  groupId: string;
  playerId: string;
  notes?: string | null;
  objective?: string | null;
  monthCheckpoint?: string | null;
  onSave: (formData: FormData) => void | Promise<void>;
};

export function PlayerMetaEditForm({
  groupId,
  playerId,
  notes,
  objective,
  monthCheckpoint,
  onSave,
}: PlayerMetaEditFormProps) {
  return (
    <details className="group">
      <summary className="inline-flex rounded-md border border-border px-2 py-1 text-sm text-muted-foreground hover:bg-muted hover:text-foreground">
        Editar
      </summary>
      <form action={onSave} className="mt-3 grid gap-2">
        <input type="hidden" name="groupId" value={groupId} />
        <input type="hidden" name="playerId" value={playerId} />
        <input
          name="objective"
          defaultValue={objective ?? ""}
          placeholder="Objetivo"
          className="w-full rounded-md border border-border bg-card px-2 py-1 text-xs"
        />
        <input
          name="monthCheckpoint"
          defaultValue={monthCheckpoint ?? ""}
          placeholder="Checkpoint mensual"
          className="w-full rounded-md border border-border bg-card px-2 py-1 text-xs"
        />
        <textarea
          name="notes"
          defaultValue={notes ?? ""}
          rows={2}
          placeholder="Notas"
          className="w-full rounded-md border border-border bg-card px-2 py-1 text-xs"
        />
        <Button type="submit" size="sm">
          Guardar
        </Button>
      </form>
    </details>
  );
}
