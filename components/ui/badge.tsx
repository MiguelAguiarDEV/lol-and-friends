import type { HTMLAttributes } from "react";

type BadgeVariant = "default" | "muted";

type BadgeProps = HTMLAttributes<HTMLSpanElement> & {
  variant?: BadgeVariant;
};

const variantClassName: Record<BadgeVariant, string> = {
  default: "bg-primary text-primary-foreground",
  muted: "bg-muted text-muted-foreground",
};

export function Badge({
  variant = "default",
  className,
  children,
  ...props
}: BadgeProps) {
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${variantClassName[variant]} ${className ?? ""}`}
      {...props}
    >
      {children}
    </span>
  );
}
