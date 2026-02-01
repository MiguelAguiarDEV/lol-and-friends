/**
 * Returns current ISO timestamp.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

/**
 * Convierte minutos a milisegundos.
 * @param minutes - Minutos a convertir.
 * @returns Milisegundos equivalentes.
 */
export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

/**
 * Indica si un timestamp es más antiguo que un umbral en minutos.
 * @param params - Parámetros de evaluación.
 * @param params.timestamp - Timestamp ISO a evaluar.
 * @param params.minMinutes - Minutos mínimos para considerar expirado.
 * @returns True si el timestamp falta, es inválido o está expirado.
 */
export function isPast(params: {
  timestamp?: string | null;
  minMinutes: number;
}): boolean {
  if (!params.timestamp) {
    return true;
  }

  const last = Date.parse(params.timestamp);
  if (Number.isNaN(last)) {
    return true;
  }

  return Date.now() - last >= minutesToMs(params.minMinutes);
}
