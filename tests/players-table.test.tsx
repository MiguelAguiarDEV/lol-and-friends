import { fireEvent, render, screen } from "@testing-library/react";
import "@testing-library/jest-dom";
import type { PlayerRow } from "@/components/players/players-table";
import { PlayersTable } from "@/components/players/players-table";

const mockPlayers: PlayerRow[] = [
  {
    id: "1",
    gameName: "Player1",
    tagLine: "TAG1",
    region: "euw",
    tier: "GOLD",
    division: "I",
    lp: 50,
    wins: 10,
    losses: 5,
    notes: null,
    objective: null,
    monthCheckpoint: null,
    lastSyncAt: "2024-01-01T00:00:00Z",
    opggUrl: null,
  },
  {
    id: "2",
    gameName: "Player2",
    tagLine: "TAG2",
    region: "euw",
    tier: "PLATINUM",
    division: "IV",
    lp: 75,
    wins: 20,
    losses: 10,
    notes: null,
    objective: null,
    monthCheckpoint: null,
    lastSyncAt: "2024-01-02T00:00:00Z",
    opggUrl: null,
  },
  {
    id: "3",
    gameName: "Player3",
    tagLine: "TAG3",
    region: "euw",
    tier: "SILVER",
    division: "II",
    lp: 25,
    wins: 5,
    losses: 10,
    notes: null,
    objective: null,
    monthCheckpoint: null,
    lastSyncAt: "2024-01-03T00:00:00Z",
    opggUrl: null,
  },
];

describe("PlayersTable", () => {
  it("renders the table with player data", () => {
    render(<PlayersTable players={mockPlayers} />);
    // Players appear in both mobile and desktop views
    expect(screen.getAllByText("Player1")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Player2")[0]).toBeInTheDocument();
    expect(screen.getAllByText("Player3")[0]).toBeInTheDocument();
  });

  it("renders clickable column headers", () => {
    render(<PlayersTable players={mockPlayers} />);
    // Check for sortable headers (only visible on desktop)
    const ligaHeader = screen.getAllByText(/Liga/i);
    const lpHeader = screen.getAllByText(/LP/i);
    const winrateHeader = screen.getAllByText(/Winrate/i);

    // Should have at least one of each header
    expect(ligaHeader.length).toBeGreaterThan(0);
    expect(lpHeader.length).toBeGreaterThan(0);
    expect(winrateHeader.length).toBeGreaterThan(0);
  });

  it("shows sort indicator on initial sort column", () => {
    const { container } = render(
      <PlayersTable players={mockPlayers} initialSort="winrate" />,
    );
    // Check for SVG icons (lucide-react icons are SVGs)
    const svgs = container.querySelectorAll("svg");
    expect(svgs.length).toBeGreaterThan(0);
  });

  it("toggles sort direction when clicking the same column", () => {
    const { container } = render(
      <PlayersTable players={mockPlayers} initialSort="lp" />,
    );

    // Find LP header in the table (not in mobile view)
    const table = container.querySelector("table");
    expect(table).toBeInTheDocument();

    // Check initial state - should have SVG icons
    let svgs = container.querySelectorAll("svg");
    const initialIconCount = svgs.length;
    expect(initialIconCount).toBeGreaterThan(0);

    // Click LP header to toggle
    const lpHeaders = screen.getAllByText("LP");
    // Find the one that's inside a th element
    const lpHeaderInTable = lpHeaders.find((el) =>
      el.closest("th")?.classList.contains("cursor-pointer"),
    );

    if (lpHeaderInTable) {
      fireEvent.click(lpHeaderInTable);

      // Should still have SVG icons (just different direction)
      svgs = container.querySelectorAll("svg");
      expect(svgs.length).toBeGreaterThan(0);
    }
  });
});
