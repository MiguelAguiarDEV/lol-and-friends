/** @jest-environment node */

import {
  completeSyncAttempt,
  createSyncAttempt,
  type SyncAttemptResult,
} from "@/lib/riot/sync-attempts";

describe("sync attempts lifecycle", () => {
  it("creates an attempt with status running and zero counters", () => {
    const attempt = createSyncAttempt({ totalDue: 5, limit: 3 });

    expect(attempt.status).toBe("running");
    expect(attempt.totalDue).toBe(5);
    expect(attempt.limit).toBe(3);
    expect(attempt.attempted).toBe(0);
    expect(attempt.succeeded).toBe(0);
    expect(attempt.failed).toBe(0);
    expect(attempt.startedAt).toBeDefined();
    expect(attempt.finishedAt).toBeNull();
    expect(attempt.errors).toEqual([]);
  });

  it("completes attempt as success when all players succeed", () => {
    const attempt = createSyncAttempt({ totalDue: 2, limit: 2 });

    const results: SyncAttemptResult[] = [
      { playerId: "p1", outcome: "success" },
      { playerId: "p2", outcome: "success" },
    ];

    const completed = completeSyncAttempt({ attempt, results });

    expect(completed.status).toBe("success");
    expect(completed.attempted).toBe(2);
    expect(completed.succeeded).toBe(2);
    expect(completed.failed).toBe(0);
    expect(completed.finishedAt).toBeDefined();
    expect(completed.errors).toEqual([]);
  });

  it("completes attempt as partial when some players fail", () => {
    const attempt = createSyncAttempt({ totalDue: 3, limit: 3 });

    const results: SyncAttemptResult[] = [
      { playerId: "p1", outcome: "success" },
      { playerId: "p2", outcome: "failed", error: "Missing PUUID" },
      { playerId: "p3", outcome: "success" },
    ];

    const completed = completeSyncAttempt({ attempt, results });

    expect(completed.status).toBe("partial");
    expect(completed.attempted).toBe(3);
    expect(completed.succeeded).toBe(2);
    expect(completed.failed).toBe(1);
    expect(completed.finishedAt).toBeDefined();
    expect(completed.errors).toEqual([
      { playerId: "p2", error: "Missing PUUID" },
    ]);
  });

  it("completes attempt as failed when all players fail", () => {
    const attempt = createSyncAttempt({ totalDue: 2, limit: 2 });

    const results: SyncAttemptResult[] = [
      { playerId: "p1", outcome: "failed", error: "Rate limit" },
      { playerId: "p2", outcome: "failed", error: "Network error" },
    ];

    const completed = completeSyncAttempt({ attempt, results });

    expect(completed.status).toBe("failed");
    expect(completed.attempted).toBe(2);
    expect(completed.succeeded).toBe(0);
    expect(completed.failed).toBe(2);
    expect(completed.errors).toHaveLength(2);
  });

  it("completes attempt as success when no players were due", () => {
    const attempt = createSyncAttempt({ totalDue: 0, limit: 5 });

    const completed = completeSyncAttempt({ attempt, results: [] });

    expect(completed.status).toBe("success");
    expect(completed.attempted).toBe(0);
    expect(completed.succeeded).toBe(0);
    expect(completed.failed).toBe(0);
  });
});
