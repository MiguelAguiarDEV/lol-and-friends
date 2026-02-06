"use client";

import type { ReactNode } from "react";
import { Button } from "@/components/ui/button";

type ModalProps = {
  open: boolean;
  title: string;
  description?: string;
  onClose: () => void;
  children: ReactNode;
  maxWidthClassName?: string;
};

export function Modal({
  open,
  title,
  description,
  onClose,
  children,
  maxWidthClassName = "max-w-lg",
}: ModalProps) {
  if (!open) {
    return null;
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center px-4"
    >
      <button
        type="button"
        aria-label="Cerrar modal"
        className="absolute inset-0 bg-black/45"
        onClick={onClose}
      />
      <div
        className={`relative w-full rounded-2xl border border-border bg-card p-6 shadow-xl ${maxWidthClassName}`}
      >
        <div className="mb-4 flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-card-foreground">
              {title}
            </h3>
            {description ? (
              <p className="mt-1 text-sm text-muted-foreground">
                {description}
              </p>
            ) : null}
          </div>
          <Button
            type="button"
            size="icon"
            variant="ghost"
            className="text-lg"
            onClick={onClose}
            aria-label="Cerrar"
          >
            ×
          </Button>
        </div>
        {children}
      </div>
    </div>
  );
}
