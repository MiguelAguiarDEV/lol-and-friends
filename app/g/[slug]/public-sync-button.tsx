"use client";

import { useActionState, useEffect, useMemo, useState } from "react";
import { useFormStatus } from "react-dom";
import type { SyncActionState } from "@/app/g/[slug]/sync-types";
import { initialSyncActionState } from "@/app/g/[slug]/sync-types";
import { Button } from "@/components/ui/button";

type PublicSyncButtonProps = {
  groupId: string;
  lastManualSyncAt: string | null;
  cooldownMinutes: number;
  onSync: (
    previousState: SyncActionState,
    formData: FormData,
  ) => Promise<SyncActionState>;
};

function getRemainingSeconds(params: {
  lastManualSyncAt: string | null;
  cooldownMinutes: number;
}) {
  if (!params.lastManualSyncAt) {
    return 0;
  }
  const last = Date.parse(params.lastManualSyncAt);
  if (Number.isNaN(last)) {
    return 0;
  }
  const cooldownMs = params.cooldownMinutes * 60 * 1000;
  const remainingMs = cooldownMs - (Date.now() - last);
  return Math.max(0, Math.ceil(remainingMs / 1000));
}

/**
 * Botón de sync público con useActionState.
 * Gestiona el formulario, estado pendiente y cooldown.
 */
export function PublicSyncButton({
  groupId,
  lastManualSyncAt,
  cooldownMinutes,
  onSync,
}: PublicSyncButtonProps) {
  const [state, formAction] = useActionState(onSync, initialSyncActionState);

  // Usar el timestamp más reciente entre el prop del server y el retornado por la action
  const effectiveLastSync = useMemo(() => {
    if (!state.syncedAt) return lastManualSyncAt;
    if (!lastManualSyncAt) return state.syncedAt;
    return Date.parse(state.syncedAt) > Date.parse(lastManualSyncAt)
      ? state.syncedAt
      : lastManualSyncAt;
  }, [state.syncedAt, lastManualSyncAt]);

  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds({
      lastManualSyncAt: effectiveLastSync,
      cooldownMinutes,
    }),
  );

  useEffect(() => {
    setRemainingSeconds(
      getRemainingSeconds({
        lastManualSyncAt: effectiveLastSync,
        cooldownMinutes,
      }),
    );

    const interval = setInterval(() => {
      setRemainingSeconds(
        getRemainingSeconds({
          lastManualSyncAt: effectiveLastSync,
          cooldownMinutes,
        }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [effectiveLastSync, cooldownMinutes]);

  return (
    <form action={formAction} className="flex items-center">
      <input type="hidden" name="groupId" value={groupId} />
      <SyncSubmitButton
        canSync={remainingSeconds === 0}
        remainingSeconds={remainingSeconds}
      />
    </form>
  );
}

/** Botón submit interno que usa useFormStatus para detectar pending. */
function SyncSubmitButton(props: {
  canSync: boolean;
  remainingSeconds: number;
}) {
  const { pending } = useFormStatus();

  const label = useMemo(() => {
    if (pending) return "Sincronizando…";
    if (props.canSync) return "Actualizar ahora";
    return `Disponible en ${props.remainingSeconds}s`;
  }, [pending, props.canSync, props.remainingSeconds]);

  return (
    <Button
      type="submit"
      disabled={!props.canSync || pending}
      variant={props.canSync && !pending ? "outline" : "secondary"}
      size="sm"
    >
      {label}
    </Button>
  );
}
