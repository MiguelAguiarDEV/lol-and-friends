import type { ButtonHTMLAttributes } from "react";

type ButtonVariant = "primary" | "secondary" | "outline" | "ghost";
type ButtonSize = "sm" | "md" | "icon";

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: ButtonVariant;
  size?: ButtonSize;
  fullWidth?: boolean;
};

const baseClassName =
  "inline-flex items-center justify-center rounded-md font-medium transition focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring/40 disabled:opacity-60";

const variantClassName: Record<ButtonVariant, string> = {
  primary: "bg-primary text-primary-foreground hover:opacity-90",
  secondary: "bg-muted text-foreground hover:opacity-90",
  outline:
    "border border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground",
  ghost:
    "bg-transparent text-muted-foreground hover:bg-muted hover:text-foreground",
};

const sizeClassName: Record<ButtonSize, string> = {
  sm: "h-8 px-3 text-sm",
  md: "h-10 px-4 text-sm",
  icon: "size-9 rounded-full p-0 text-base",
};

function joinClassNames(values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function Button({
  variant = "primary",
  size = "md",
  fullWidth = false,
  className,
  type,
  ...props
}: ButtonProps) {
  return (
    <button
      type={type ?? "button"}
      className={joinClassNames([
        baseClassName,
        variantClassName[variant],
        sizeClassName[size],
        fullWidth ? "w-full" : "",
        className,
      ])}
      {...props}
    />
  );
}
