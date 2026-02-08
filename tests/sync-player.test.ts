/** @jest-environment node */

/**
 * Tests for syncPlayer behavior:
 * - Fix 1: updatePlayerSync and insertRankSnapshot run inside a transaction.
 * - Fix 2: Player's preferred queue type is preserved (not overwritten by fallback).
 * - Fix 3: resolvePuuid only falls back to getSummonerByName on 404, re-throws on other errors.
 */

import { RiotApiError } from "@/lib/riot/api";

// ---- Mocks ---- //

const mockUpdatePlayerSync = jest.fn();
const mockInsertRankSnapshot = jest.fn();
const mockGetPlayersForSync = jest.fn();
const mockGetGroupPlayers = jest.fn();
const mockGetGroupSyncSettings = jest.fn();

jest.mock("@/lib/db/queries", () => ({
  getPlayersForSync: (...args: unknown[]) => mockGetPlayersForSync(...args),
  getGroupPlayers: (...args: unknown[]) => mockGetGroupPlayers(...args),
  getGroupSyncSettings: (...args: unknown[]) =>
    mockGetGroupSyncSettings(...args),
  updatePlayerSync: (...args: unknown[]) => mockUpdatePlayerSync(...args),
  insertRankSnapshot: (...args: unknown[]) => mockInsertRankSnapshot(...args),
}));

const mockTransaction = jest.fn();
jest.mock("@/lib/db/client", () => ({
  db: {
    transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}));

const mockGetAccountByRiotId = jest.fn();
const mockGetSummonerByName = jest.fn();
const mockGetLeagueEntriesByPuuid = jest.fn();

jest.mock("@/lib/riot/api", () => {
  const actual = jest.requireActual("@/lib/riot/api");
  return {
    ...actual,
    getAccountByRiotId: (...args: unknown[]) => mockGetAccountByRiotId(...args),
    getSummonerByName: (...args: unknown[]) => mockGetSummonerByName(...args),
    getLeagueEntriesByPuuid: (...args: unknown[]) =>
      mockGetLeagueEntriesByPuuid(...args),
  };
});

jest.mock("@/lib/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

// Stub time
jest.mock("@/lib/utils/time", () => ({
  isPast: () => true,
  nowIso: () => "2026-02-08T00:00:00Z",
}));

import { syncDuePlayers } from "@/lib/riot/sync";

// ---- Helpers ---- //

function makePlayerRow(overrides: Partial<Record<string, unknown>> = {}) {
  return {
    id: "player-1",
    gameName: "TestPlayer",
    tagLine: "EUW",
    region: "EUW1",
    queueType: "RANKED_SOLO_5x5",
    puuid: "existing-puuid",
    lastSyncAt: null,
    syncIntervalMinutes: 10,
    ...overrides,
  };
}

const SOLO_ENTRY = {
  queueType: "RANKED_SOLO_5x5",
  tier: "GOLD",
  rank: "II",
  leaguePoints: 55,
  wins: 100,
  losses: 80,
};

const FLEX_ENTRY = {
  queueType: "RANKED_FLEX_SR",
  tier: "SILVER",
  rank: "I",
  leaguePoints: 30,
  wins: 50,
  losses: 40,
};

// ---- Tests ---- //

describe("syncPlayer — queue preference (Fix 2)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RIOT_API_KEY = "test-key";

    // Default: transaction executes the callback immediately
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({}),
    );
    mockGetLeagueEntriesByPuuid.mockResolvedValue([SOLO_ENTRY, FLEX_ENTRY]);
    mockUpdatePlayerSync.mockResolvedValue(undefined);
    mockInsertRankSnapshot.mockResolvedValue(undefined);
  });

  it("writes preferredQueueType to player record, not the fallback queue", async () => {
    // Player prefers SOLO, but only FLEX data exists
    mockGetPlayersForSync.mockResolvedValue([
      makePlayerRow({ queueType: "RANKED_SOLO_5x5" }),
    ]);
    mockGetLeagueEntriesByPuuid.mockResolvedValue([FLEX_ENTRY]);

    await syncDuePlayers({ limit: 1 });

    // updatePlayerSync should use the PREFERRED queue, not the fallback
    expect(mockUpdatePlayerSync).toHaveBeenCalledTimes(1);
    expect(mockUpdatePlayerSync).toHaveBeenCalledWith(
      expect.objectContaining({
        queueType: "RANKED_SOLO_5x5", // preferred, NOT "RANKED_FLEX_SR"
      }),
    );

    // insertRankSnapshot records what was actually used (fallback)
    expect(mockInsertRankSnapshot).toHaveBeenCalledTimes(1);
    expect(mockInsertRankSnapshot).toHaveBeenCalledWith(
      expect.objectContaining({
        queueType: "RANKED_FLEX_SR", // actual data source
      }),
    );
  });
});

describe("syncPlayer — transaction wrap (Fix 1)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RIOT_API_KEY = "test-key";

    mockTransaction.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({}),
    );
    mockGetLeagueEntriesByPuuid.mockResolvedValue([SOLO_ENTRY]);
    mockUpdatePlayerSync.mockResolvedValue(undefined);
    mockInsertRankSnapshot.mockResolvedValue(undefined);
  });

  it("calls updatePlayerSync and insertRankSnapshot inside db.transaction", async () => {
    mockGetPlayersForSync.mockResolvedValue([makePlayerRow()]);

    await syncDuePlayers({ limit: 1 });

    // db.transaction should have been called
    expect(mockTransaction).toHaveBeenCalledTimes(1);
    expect(mockTransaction).toHaveBeenCalledWith(expect.any(Function));

    // Both DB writes should happen inside the transaction callback
    expect(mockUpdatePlayerSync).toHaveBeenCalledTimes(1);
    expect(mockInsertRankSnapshot).toHaveBeenCalledTimes(1);
  });

  it("does not call insertRankSnapshot if updatePlayerSync throws inside transaction", async () => {
    mockGetPlayersForSync.mockResolvedValue([makePlayerRow()]);
    mockUpdatePlayerSync.mockRejectedValue(new Error("DB write failed"));
    mockTransaction.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({}),
    );

    const result = await syncDuePlayers({ limit: 1 });

    // Sync should report failure
    expect(result.failed).toBe(1);
    expect(result.succeeded).toBe(0);
  });
});

describe("resolvePuuid — 404-only fallback (Fix 3)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RIOT_API_KEY = "test-key";

    mockTransaction.mockImplementation(async (cb: (tx: unknown) => unknown) =>
      cb({}),
    );
    mockUpdatePlayerSync.mockResolvedValue(undefined);
    mockInsertRankSnapshot.mockResolvedValue(undefined);
    mockGetLeagueEntriesByPuuid.mockResolvedValue([SOLO_ENTRY]);
  });

  it("falls back to getSummonerByName on 404 RiotApiError", async () => {
    // Player without puuid triggers resolvePuuid
    mockGetPlayersForSync.mockResolvedValue([makePlayerRow({ puuid: null })]);
    mockGetAccountByRiotId.mockRejectedValue(
      new RiotApiError({ status: 404, body: "Data not found" }),
    );
    mockGetSummonerByName.mockResolvedValue({
      puuid: "fallback-puuid",
      id: "summoner-id",
      accountId: "account-id",
      name: "TestPlayer",
      summonerLevel: 100,
    });

    const result = await syncDuePlayers({ limit: 1 });

    expect(mockGetSummonerByName).toHaveBeenCalledTimes(1);
    expect(result.succeeded).toBe(1);
  });

  it("does NOT fall back on 403 RiotApiError — propagates the error", async () => {
    mockGetPlayersForSync.mockResolvedValue([makePlayerRow({ puuid: null })]);
    mockGetAccountByRiotId.mockRejectedValue(
      new RiotApiError({ status: 403, body: "Forbidden" }),
    );

    const result = await syncDuePlayers({ limit: 1 });

    // Should NOT attempt fallback
    expect(mockGetSummonerByName).not.toHaveBeenCalled();
    // Should report failure
    expect(result.failed).toBe(1);
    expect(result.errors[0]?.error).toContain("403");
  });

  it("does NOT fall back on 500 RiotApiError — propagates the error", async () => {
    mockGetPlayersForSync.mockResolvedValue([makePlayerRow({ puuid: null })]);
    mockGetAccountByRiotId.mockRejectedValue(
      new RiotApiError({ status: 500, body: "Internal Server Error" }),
    );

    const result = await syncDuePlayers({ limit: 1 });

    expect(mockGetSummonerByName).not.toHaveBeenCalled();
    expect(result.failed).toBe(1);
  });
});
