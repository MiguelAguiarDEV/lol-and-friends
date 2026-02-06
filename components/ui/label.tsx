import type { LabelHTMLAttributes } from "react";

type LabelProps = LabelHTMLAttributes<HTMLLabelElement>;

export function Label({ className, children, ...props }: LabelProps) {
  return (
    // biome-ignore lint/a11y/noLabelWithoutControl: Wrapper component forwards htmlFor to associated controls.
    <label
      className={`text-sm font-medium text-muted-foreground ${className ?? ""}`}
      {...props}
    >
      {children}
    </label>
  );
}
