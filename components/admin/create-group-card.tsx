"use client";

import { useState } from "react";
import { SectionCard } from "@/components/layout/section-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";

type CreateGroupCardProps = {
  action: (formData: FormData) => void | Promise<void>;
};

export function CreateGroupCard({ action }: CreateGroupCardProps) {
  const [open, setOpen] = useState(false);

  return (
    <SectionCard>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-xl font-semibold text-card-foreground">Grupos</h2>
          <p className="text-sm text-muted-foreground">
            Crea grupos nuevos y gestiona jugadores en cada uno.
          </p>
        </div>
        <Button onClick={() => setOpen(true)}>Nuevo grupo</Button>
      </div>

      <Modal
        open={open}
        onClose={() => setOpen(false)}
        title="Crear grupo"
        description="Define nombre, intervalo de sync y cooldown."
      >
        <form
          action={action}
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={() => setOpen(false)}
        >
          <div className="sm:col-span-2">
            <Label htmlFor="group-name">Nombre</Label>
            <Input
              id="group-name"
              name="name"
              required
              placeholder="Reto EUW"
            />
          </div>
          <div>
            <Label htmlFor="group-sync-interval">Intervalo sync (min)</Label>
            <Input
              id="group-sync-interval"
              name="syncIntervalMinutes"
              type="number"
              min={0.5}
              step={0.5}
              max={1440}
              defaultValue={360}
            />
          </div>
          <div>
            <Label htmlFor="group-manual-cooldown">Cooldown manual (min)</Label>
            <Input
              id="group-manual-cooldown"
              name="manualCooldownMinutes"
              type="number"
              min={0.5}
              step={0.5}
              max={240}
              defaultValue={30}
            />
          </div>
          <div className="sm:col-span-2 flex justify-end gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
            >
              Cancelar
            </Button>
            <Button type="submit">Crear grupo</Button>
          </div>
        </form>
      </Modal>
    </SectionCard>
  );
}
