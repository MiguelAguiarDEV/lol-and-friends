import { render, screen } from "@testing-library/react";
import { useRouter, useSearchParams } from "next/navigation";
import { SortableHeader } from "@/components/players/sortable-header";

// Mock Next.js navigation hooks
jest.mock("next/navigation", () => ({
  useRouter: jest.fn(),
  useSearchParams: jest.fn(),
}));

describe("SortableHeader", () => {
  const mockPush = jest.fn();
  const mockSearchParams = new URLSearchParams();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    (useSearchParams as jest.Mock).mockReturnValue(mockSearchParams);
  });

  it("renders the column header with children", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader sortKey="winrate" currentPath="/g/test">
              Winrate
            </SortableHeader>
          </tr>
        </thead>
      </table>,
    );

    expect(screen.getByText("Winrate")).toBeInTheDocument();
  });

  it("renders with proper button accessibility", () => {
    render(
      <table>
        <thead>
          <tr>
            <SortableHeader sortKey="lp" currentPath="/g/test">
              LP
            </SortableHeader>
          </tr>
        </thead>
      </table>,
    );

    const button = screen.getByRole("button", { name: /ordenar por lp/i });
    expect(button).toBeInTheDocument();
  });

  it("highlights descending arrow when column is sorted desc", () => {
    const params = new URLSearchParams("sort=winrate&dir=desc");
    (useSearchParams as jest.Mock).mockReturnValue(params);

    const { container } = render(
      <table>
        <thead>
          <tr>
            <SortableHeader sortKey="winrate" currentPath="/g/test">
              Winrate
            </SortableHeader>
          </tr>
        </thead>
      </table>,
    );

    // Check that the descending arrow has darker color (text-gray-900)
    const svgs = container.querySelectorAll("svg");
    expect(svgs[1]).toHaveClass("text-gray-900");
    expect(svgs[0]).toHaveClass("text-gray-300");
  });

  it("highlights ascending arrow when column is sorted asc", () => {
    const params = new URLSearchParams("sort=lp&dir=asc");
    (useSearchParams as jest.Mock).mockReturnValue(params);

    const { container } = render(
      <table>
        <thead>
          <tr>
            <SortableHeader sortKey="lp" currentPath="/g/test">
              LP
            </SortableHeader>
          </tr>
        </thead>
      </table>,
    );

    // Check that the ascending arrow has darker color (text-gray-900)
    const svgs = container.querySelectorAll("svg");
    expect(svgs[0]).toHaveClass("text-gray-900");
    expect(svgs[1]).toHaveClass("text-gray-300");
  });
});
