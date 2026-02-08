import Link from "next/link";

export type GroupListItem = {
  id: string;
  name: string;
  slug: string;
};

export function GroupsList(props: { groups: GroupListItem[] }) {
  if (props.groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-border bg-card p-6 text-sm text-muted-foreground">
        Aún no hay grupos públicos. Crea uno desde /admin.
      </div>
    );
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2">
      {props.groups.map((group) => (
        <Link
          key={group.id}
          href={`/g/${group.slug}`}
          className="rounded-xl border border-border bg-card p-5 shadow-sm transition hover:border-ring hover:shadow"
        >
          <div className="text-sm text-muted-foreground">Grupo público</div>
          <div className="mt-1 text-lg font-semibold text-card-foreground">
            {group.name}
          </div>
          <div className="mt-2 text-xs text-muted-foreground">
            /{group.slug}
          </div>
        </Link>
      ))}
    </div>
  );
}
