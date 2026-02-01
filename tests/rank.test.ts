import { getRankScore } from "@/lib/players/rank";

describe("rank score", () => {
  it("orders tiers correctly", () => {
    const diamond = getRankScore({ tier: "DIAMOND", division: "IV", lp: 0 });
    const gold = getRankScore({ tier: "GOLD", division: "I", lp: 99 });
    expect(diamond).toBeGreaterThan(gold);
  });

  it("handles spanish tier labels", () => {
    const platino = getRankScore({ tier: "Platino", division: "II", lp: 20 });
    const oro = getRankScore({ tier: "Oro", division: "I", lp: 99 });
    expect(platino).toBeGreaterThan(oro);
  });

  it("uses lp within the same tier", () => {
    const low = getRankScore({ tier: "SILVER", division: "I", lp: 10 });
    const high = getRankScore({ tier: "SILVER", division: "I", lp: 80 });
    expect(high).toBeGreaterThan(low);
  });
});
