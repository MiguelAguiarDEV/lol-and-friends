import Link from "next/link";
import type {
  PlayerSortDirection,
  PlayerSortKey,
} from "@/components/players/types";

type PlayerSortHeaderProps = {
  groupSlug: string;
  label: string;
  currentSort: PlayerSortKey;
  currentDirection: PlayerSortDirection;
  targetSort: PlayerSortKey;
};

export function PlayerSortHeader({
  groupSlug,
  label,
  currentSort,
  currentDirection,
  targetSort,
}: PlayerSortHeaderProps) {
  const isActive = currentSort === targetSort;
  const nextDirection = isActive
    ? currentDirection === "desc"
      ? "asc"
      : "desc"
    : "desc";
  const isAsc = isActive && currentDirection === "asc";
  const isDesc = isActive && currentDirection === "desc";

  return (
    <Link
      href={`/g/${groupSlug}?sort=${targetSort}&dir=${nextDirection}`}
      className={`inline-flex items-center gap-2 ${
        isActive
          ? "text-foreground"
          : "text-muted-foreground hover:text-foreground"
      }`}
    >
      <span>{label}</span>
      <span
        aria-hidden
        className="inline-flex flex-col text-[9px] leading-[8px] font-semibold"
      >
        <span className={isAsc ? "text-primary" : "text-border"}>↑</span>
        <span className={isDesc ? "text-primary" : "text-border"}>↓</span>
      </span>
    </Link>
  );
}
