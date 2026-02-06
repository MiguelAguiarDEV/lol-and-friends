import Link from "next/link";
import { AccountMenu } from "@/components/layout/account-menu";
import { ThemeSwitcher } from "@/components/theme/theme-switcher";

type AppNavbarProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  email?: string;
};

export function AppNavbar({ isLoggedIn, isAdmin, email }: AppNavbarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur">
      <div className="mx-auto flex w-full max-w-6xl items-center justify-between gap-4 px-4 py-3 sm:px-6">
        <div className="flex items-center gap-3 sm:gap-6">
          <Link
            href="/"
            className="text-base font-semibold tracking-tight text-card-foreground"
          >
            LoL & Friends
          </Link>
          <nav className="flex items-center gap-2 text-sm">
            <Link
              href="/"
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Inicio
            </Link>
            <Link
              href="/admin"
              className="rounded-md px-2.5 py-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            >
              Admin
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <ThemeSwitcher />
          {isLoggedIn ? (
            <span
              className={`hidden rounded-full px-2.5 py-1 text-sm sm:inline-flex ${
                isAdmin
                  ? "bg-primary text-primary-foreground"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {isAdmin ? "Admin" : "Usuario"}
            </span>
          ) : null}
          <AccountMenu
            isLoggedIn={isLoggedIn}
            isAdmin={isAdmin}
            email={email}
          />
        </div>
      </div>
    </header>
  );
}
