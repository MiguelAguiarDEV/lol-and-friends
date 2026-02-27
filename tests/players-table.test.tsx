import { render, screen, within } from "@testing-library/react";
import { PlayersTable } from "@/components/players/players-table";

describe("PlayersTable default sorting", () => {
  it("orders players by rank (including LP) from best to worst by default", () => {
    const players = [
      {
        id: "low",
        gameName: "LowRank",
        tagLine: "AAA",
        region: "la2",
        tier: "PLATINUM",
        division: "IV",
        lp: 0,
      },
      {
        id: "top",
        gameName: "TopRank",
        tagLine: "BBB",
        region: "la2",
        tier: "DIAMOND",
        division: "I",
        lp: 90,
      },
      {
        id: "mid",
        gameName: "MidRank",
        tagLine: "CCC",
        region: "la2",
        tier: "DIAMOND",
        division: "I",
        lp: 10,
      },
    ];

    render(
      <PlayersTable
        players={players}
        groupSlug="grupo"
        showHeader={false}
        showSortHint={false}
      />,
    );

    const rows = screen.getAllByRole("row").slice(1);

    expect(within(rows[0]).getByText(/TopRank/)).toBeInTheDocument();
    expect(within(rows[1]).getByText(/MidRank/)).toBeInTheDocument();
    expect(within(rows[2]).getByText(/LowRank/)).toBeInTheDocument();
  });
});
