"use client";

import { useRouter, useSearchParams } from "next/navigation";

type SortKey = "winrate" | "lp" | "rank" | "updated" | "games";

type SortableHeaderProps = {
  sortKey: SortKey;
  children: React.ReactNode;
  currentPath: string;
};

/**
 * Clickable table header that updates URL params for sorting.
 * Shows arrow indicators for current sort state.
 */
export function SortableHeader({
  sortKey,
  children,
  currentPath,
}: SortableHeaderProps) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSort = searchParams.get("sort");
  const currentDir = searchParams.get("dir") || "desc";

  // Check if this column is currently sorted
  const isActive = currentSort === sortKey;
  const isAsc = isActive && currentDir === "asc";
  const isDesc = isActive && currentDir === "desc";

  const handleClick = () => {
    const params = new URLSearchParams(searchParams);

    if (isActive) {
      // Toggle direction if already sorted by this column
      params.set("dir", currentDir === "asc" ? "desc" : "asc");
    } else {
      // Set new sort column with default desc direction
      params.set("sort", sortKey);
      params.set("dir", "desc");
    }

    router.push(`${currentPath}?${params.toString()}`);
  };

  return (
    <th className="cursor-pointer select-none px-4 py-3 hover:bg-gray-100">
      <button
        type="button"
        onClick={handleClick}
        className="flex w-full items-center gap-1"
        aria-label={`Ordenar por ${children}`}
      >
        <span>{children}</span>
        <div className="flex flex-col">
          <svg
            className={`h-3 w-3 ${isAsc ? "text-gray-900" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path d="M6 3l4 4H2z" />
          </svg>
          <svg
            className={`h-3 w-3 ${isDesc ? "text-gray-900" : "text-gray-300"}`}
            fill="currentColor"
            viewBox="0 0 12 12"
            aria-hidden="true"
          >
            <path d="M6 9L2 5h8z" />
          </svg>
        </div>
      </button>
    </th>
  );
}
