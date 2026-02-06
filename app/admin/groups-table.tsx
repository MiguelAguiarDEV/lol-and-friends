"use client";

import { useActionState, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import { addPlayerAction } from "@/app/admin/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Modal } from "@/components/ui/modal";
import { Select } from "@/components/ui/select";
import { QUEUE_OPTIONS } from "@/lib/riot/queues";
import { PLATFORM_REGION_OPTIONS } from "@/lib/riot/regions";

type AddPlayerActionState = {
  status: "idle" | "success" | "error";
  message: string;
};

const initialAddPlayerActionState: AddPlayerActionState = {
  status: "idle",
  message: "",
};

type GroupSummary = {
  id: string;
  name: string;
  slug: string;
  playersCount: number;
  syncIntervalMinutes: number | null;
};

type GroupsTableProps = {
  groups: GroupSummary[];
};

export function GroupsTable({ groups }: GroupsTableProps) {
  const [selectedGroup, setSelectedGroup] = useState<GroupSummary | null>(null);
  const groupRows = useMemo(() => groups, [groups]);

  if (groupRows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Aún no hay grupos. Usa “Nuevo grupo” para crear el primero.
      </p>
    );
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:hidden">
        {groupRows.map((group) => (
          <GroupMobileCard
            key={group.id}
            group={group}
            onAddPlayer={() => setSelectedGroup(group)}
          />
        ))}
      </div>

      <div className="hidden overflow-hidden rounded-xl border border-border bg-card md:block">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Grupo</th>
              <th className="px-4 py-3">Slug</th>
              <th className="px-4 py-3">Jugadores</th>
              <th className="px-4 py-3">Sync (min)</th>
              <th className="px-4 py-3 text-right">Acciones</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-border bg-card">
            {groupRows.map((group) => (
              <tr key={group.id} className="text-card-foreground">
                <td className="px-4 py-3 font-medium">{group.name}</td>
                <td className="px-4 py-3 text-sm text-muted-foreground">
                  /{group.slug}
                </td>
                <td className="px-4 py-3">{group.playersCount}</td>
                <td className="px-4 py-3">
                  {group.syncIntervalMinutes ?? "—"}
                </td>
                <td className="px-4 py-3 text-right">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => setSelectedGroup(group)}
                  >
                    Añadir jugador
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedGroup ? (
        <AddPlayerModal
          key={selectedGroup.id}
          group={selectedGroup}
          onClose={() => setSelectedGroup(null)}
        />
      ) : null}
    </div>
  );
}

function GroupMobileCard(props: {
  group: GroupSummary;
  onAddPlayer: () => void;
}) {
  return (
    <article className="rounded-xl border border-border bg-card p-4 shadow-sm">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-base font-semibold text-card-foreground">
            {props.group.name}
          </h3>
          <p className="text-sm text-muted-foreground">/{props.group.slug}</p>
        </div>
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={props.onAddPlayer}
        >
          Añadir
        </Button>
      </div>
      <div className="mt-3 grid grid-cols-2 gap-2 text-sm text-muted-foreground">
        <p>Jugadores: {props.group.playersCount}</p>
        <p>Sync: {props.group.syncIntervalMinutes ?? "—"} min</p>
      </div>
    </article>
  );
}

function AddPlayerModal(props: { group: GroupSummary; onClose: () => void }) {
  const [actionState, formAction] = useActionState(
    addPlayerAction,
    initialAddPlayerActionState,
  );

  return (
    <Modal
      open
      title="Añadir jugador"
      description={`Grupo: ${props.group.name}`}
      onClose={props.onClose}
    >
      <form action={formAction} className="mt-2 grid gap-4">
        <input type="hidden" name="groupId" value={props.group.id} />
        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="modal-game-name">Riot ID</Label>
            <Input
              id="modal-game-name"
              name="gameName"
              required
              placeholder="GameName"
            />
          </div>
          <div>
            <Label htmlFor="modal-tag-line">Tag</Label>
            <Input
              id="modal-tag-line"
              name="tagLine"
              required
              placeholder="EUW"
            />
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="modal-queue">Cola</Label>
            <Select
              id="modal-queue"
              name="queueType"
              defaultValue="RANKED_SOLO_5x5"
            >
              {QUEUE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
          <div>
            <Label htmlFor="modal-region">Región</Label>
            <Select id="modal-region" name="region" defaultValue="euw1">
              {PLATFORM_REGION_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
          </div>
        </div>

        <ActionFeedback actionState={actionState} />

        <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
          <Button type="button" variant="outline" onClick={props.onClose}>
            Cancelar
          </Button>
          <SubmitAddPlayerButton />
        </div>
      </form>
    </Modal>
  );
}

function ActionFeedback(props: { actionState: AddPlayerActionState }) {
  if (props.actionState.status === "idle") {
    return null;
  }

  if (props.actionState.status === "success") {
    return (
      <p className="rounded-md border border-green-300 bg-green-50 px-3 py-2 text-sm text-green-900">
        {props.actionState.message}
      </p>
    );
  }

  return (
    <p className="rounded-md border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-900">
      {props.actionState.message}
    </p>
  );
}

function SubmitAddPlayerButton() {
  const { pending } = useFormStatus();

  return (
    <Button type="submit" disabled={pending}>
      {pending ? "Guardando..." : "Guardar jugador"}
    </Button>
  );
}
