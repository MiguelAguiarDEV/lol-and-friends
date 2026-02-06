"use client";

import { useEffect, useMemo, useState } from "react";
import { Button } from "@/components/ui/button";

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
    <Button
      type="submit"
      disabled={!canSync}
      variant={canSync ? "outline" : "secondary"}
      size="sm"
    >
      {label}
    </Button>
  );
}
