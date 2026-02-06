import { selectLeagueEntryForSync } from "@/lib/riot/sync";

describe("selectLeagueEntryForSync", () => {
  const solo = {
    queueType: "RANKED_SOLO_5x5",
    tier: "GOLD",
    rank: "II",
    leaguePoints: 55,
    wins: 12,
    losses: 10,
  };

  const flex = {
    queueType: "RANKED_FLEX_SR",
    tier: "PLATINUM",
    rank: "IV",
    leaguePoints: 23,
    wins: 20,
    losses: 18,
  };

  it("returns preferred queue when present", () => {
    const result = selectLeagueEntryForSync({
      entries: [solo, flex],
      preferredQueueType: "RANKED_SOLO_5x5",
    });

    expect(result?.queueType).toBe("RANKED_SOLO_5x5");
  });

  it("falls back to flex when solo is missing", () => {
    const result = selectLeagueEntryForSync({
      entries: [flex],
      preferredQueueType: "RANKED_SOLO_5x5",
    });

    expect(result?.queueType).toBe("RANKED_FLEX_SR");
  });

  it("returns undefined when there are no entries", () => {
    const result = selectLeagueEntryForSync({
      entries: [],
      preferredQueueType: "RANKED_SOLO_5x5",
    });

    expect(result).toBeUndefined();
  });
});
