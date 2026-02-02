"use client";

import { useEffect, useMemo, useState } from "react";

type PublicSyncButtonProps = {
  lastManualSyncAt: string | null;
  cooldownMinutes: number;
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

export function PublicSyncButton({
  lastManualSyncAt,
  cooldownMinutes,
}: PublicSyncButtonProps) {
  const [remainingSeconds, setRemainingSeconds] = useState(() =>
    getRemainingSeconds({ lastManualSyncAt, cooldownMinutes }),
  );

  useEffect(() => {
    const interval = setInterval(() => {
      setRemainingSeconds(
        getRemainingSeconds({ lastManualSyncAt, cooldownMinutes }),
      );
    }, 1000);
    return () => clearInterval(interval);
  }, [lastManualSyncAt, cooldownMinutes]);

  const canSync = remainingSeconds === 0;
  const label = useMemo(() => {
    if (canSync) {
      return "Actualizar ahora";
    }
    return `Disponible en ${remainingSeconds}s`;
  }, [canSync, remainingSeconds]);

  return (
    <button
      type="submit"
      disabled={!canSync}
      className={`rounded-md border px-3 py-2 text-xs font-medium transition ${
        canSync
          ? "border-gray-200 bg-white text-gray-700 hover:border-gray-900 hover:text-gray-900 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-gray-900/20"
          : "cursor-not-allowed border-gray-100 bg-gray-100 text-gray-400"
      }`}
    >
      {label}
    </button>
  );
}
