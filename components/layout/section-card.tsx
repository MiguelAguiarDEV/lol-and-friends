import type { ReactNode } from "react";

type SectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function SectionCard({ children, className }: SectionCardProps) {
  return (
    <section
      className={`rounded-xl border border-border bg-card p-6 shadow-sm ${className ?? ""}`}
    >
      {children}
    </section>
  );
}
