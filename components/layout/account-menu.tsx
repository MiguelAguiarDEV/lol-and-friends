import Link from "next/link";

type AccountMenuProps = {
  isLoggedIn: boolean;
  isAdmin: boolean;
  email?: string;
};

export function AccountMenu({ isLoggedIn, isAdmin, email }: AccountMenuProps) {
  const userInitial = (email?.trim()[0] ?? "U").toUpperCase();

  return (
    <details className="relative">
      <summary className="list-none cursor-pointer [&::-webkit-details-marker]:hidden">
        <span className="sr-only">Abrir menú de cuenta</span>
        <span className="flex size-10 items-center justify-center rounded-full border border-border bg-card text-sm font-semibold text-card-foreground hover:bg-muted">
          {isLoggedIn ? userInitial : <UserCircleIcon />}
        </span>
      </summary>
      <div className="absolute right-0 mt-2 w-56 rounded-xl border border-border bg-card p-2 shadow-lg">
        {isLoggedIn ? (
          <>
            <p className="px-2 py-1 text-sm font-medium text-card-foreground">
              {email ?? "Sesión activa"}
            </p>
            <p className="px-2 pb-2 text-sm text-muted-foreground">
              {isAdmin ? "Administrador" : "Usuario"}
            </p>
            <MenuLink href="/profile" label="Mi perfil" />
            <MenuLink href="/admin" label="Panel admin" />
          </>
        ) : (
          <>
            <p className="px-2 py-1 text-sm text-muted-foreground">Cuenta</p>
            <MenuLink href="/sign-in" label="Iniciar sesión" />
            <MenuLink href="/sign-up" label="Crear cuenta" />
          </>
        )}
      </div>
    </details>
  );
}

function MenuLink(props: { href: string; label: string }) {
  return (
    <Link
      href={props.href}
      className="block rounded-md px-2 py-2 text-sm text-muted-foreground hover:bg-muted hover:text-foreground"
    >
      {props.label}
    </Link>
  );
}

function UserCircleIcon() {
  return (
    <svg
      aria-hidden
      viewBox="0 0 24 24"
      className="size-5 text-muted-foreground"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <title>Avatar</title>
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  );
}
