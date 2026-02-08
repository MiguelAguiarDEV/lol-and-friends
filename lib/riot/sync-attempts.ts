import { nowIso } from "@/lib/utils/time";

/** Posibles estados de un intento de sincronización. */
export type SyncAttemptStatus = "running" | "success" | "partial" | "failed";

/** Resultado individual de sincronizar un jugador. */
export type SyncAttemptResult =
  | { playerId: string; outcome: "success" }
  | { playerId: string; outcome: "failed"; error: string };

/** Error registrado por jugador. */
export interface SyncAttemptError {
  playerId: string;
  error: string;
}

/** Intento de sincronización con contadores y estado. */
export interface SyncAttempt {
  status: SyncAttemptStatus;
  totalDue: number;
  limit: number | null;
  attempted: number;
  succeeded: number;
  failed: number;
  errors: SyncAttemptError[];
  startedAt: string;
  finishedAt: string | null;
}

/**
 * Crea un intento de sincronización en estado "running" con contadores a cero.
 * @param params - Total de jugadores pendientes y límite del batch.
 */
export function createSyncAttempt(params: {
  totalDue: number;
  limit: number | null;
}): SyncAttempt {
  return {
    status: "running",
    totalDue: params.totalDue,
    limit: params.limit,
    attempted: 0,
    succeeded: 0,
    failed: 0,
    errors: [],
    startedAt: nowIso(),
    finishedAt: null,
  };
}

/**
 * Completa un intento de sincronización calculando contadores y estado final.
 * - "success" si no hubo fallos (incluye 0 intentados).
 * - "failed" si todos fallaron.
 * - "partial" si hubo mezcla de éxitos y fallos.
 * @param params - Intento en curso y resultados por jugador.
 */
export function completeSyncAttempt(params: {
  attempt: SyncAttempt;
  results: SyncAttemptResult[];
}): SyncAttempt {
  const { attempt, results } = params;

  const succeeded = results.filter((r) => r.outcome === "success").length;
  const failed = results.filter((r) => r.outcome === "failed").length;
  const errors: SyncAttemptError[] = results
    .filter(
      (r): r is Extract<SyncAttemptResult, { outcome: "failed" }> =>
        r.outcome === "failed",
    )
    .map((r) => ({ playerId: r.playerId, error: r.error }));

  let status: SyncAttemptStatus;
  if (failed === 0) {
    status = "success";
  } else if (succeeded === 0) {
    status = "failed";
  } else {
    status = "partial";
  }

  return {
    ...attempt,
    status,
    attempted: results.length,
    succeeded,
    failed,
    errors,
    finishedAt: nowIso(),
  };
}
