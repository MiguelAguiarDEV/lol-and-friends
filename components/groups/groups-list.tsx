import Link from "next/link";

export type GroupListItem = {
  id: string;
  name: string;
  slug: string;
};

export function GroupsList(props: { groups: GroupListItem[] }) {
  if (props.groups.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-gray-300 bg-white p-6 text-sm text-gray-600">
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
          className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm transition hover:border-gray-300 hover:shadow"
        >
          <div className="text-sm text-gray-500">Grupo público</div>
          <div className="mt-1 text-lg font-semibold text-gray-900">
            {group.name}
          </div>
          <div className="mt-2 text-xs text-gray-500">/{group.slug}</div>
        </Link>
      ))}
    </div>
  );
}
