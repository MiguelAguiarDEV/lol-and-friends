/**
 * Returns current ISO timestamp.
 */
export function nowIso(): string {
  return new Date().toISOString();
}

export function minutesToMs(minutes: number): number {
  return minutes * 60 * 1000;
}

export function isPast(params: {
  timestamp?: string | null;
  minMinutes: number;
}) {
  if (!params.timestamp) {
    return true;
  }

  const last = Date.parse(params.timestamp);
  if (Number.isNaN(last)) {
    return true;
  }

  return Date.now() - last >= minutesToMs(params.minMinutes);
}
