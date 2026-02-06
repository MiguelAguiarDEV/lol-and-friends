import type { ReactNode } from "react";

type PageShellProps = {
  children: ReactNode;
  maxWidth?: "5xl" | "6xl";
  gapClassName?: string;
};

const widthBySize: Record<NonNullable<PageShellProps["maxWidth"]>, string> = {
  "5xl": "max-w-5xl",
  "6xl": "max-w-6xl",
};

export function PageShell({
  children,
  maxWidth = "5xl",
  gapClassName = "gap-6",
}: PageShellProps) {
  return (
    <main className="min-h-screen bg-background px-4 py-10 text-foreground sm:px-6">
      <div
        className={`mx-auto flex w-full flex-col ${widthBySize[maxWidth]} ${gapClassName}`}
      >
        {children}
      </div>
    </main>
  );
}
