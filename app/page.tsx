import { PlayersTable } from "@/components/players/players-table";
import { mockPlayers } from "@/lib/players/mock";

/**
 * Public leaderboard page (read-only).
 */
export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50 px-4 py-10 text-gray-900 sm:px-6">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8">
        <PlayersTable players={mockPlayers} />
      </div>
    </main>
  );
}
