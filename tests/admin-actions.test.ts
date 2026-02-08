/** @jest-environment node */

/**
 * Tests for addPlayerAction:
 * - Fix 5: When createPlayer returns null, action returns an error status
 *   instead of silently treating it as success.
 */

// ---- Mocks ---- //

const mockAuth = jest.fn();
const mockCurrentUser = jest.fn();

jest.mock("@clerk/nextjs/server", () => ({
  auth: () => mockAuth(),
  currentUser: () => mockCurrentUser(),
}));

jest.mock("next/cache", () => ({
  revalidatePath: jest.fn(),
}));

jest.mock("next/navigation", () => ({
  redirect: jest.fn((url: string) => {
    throw new Error(`REDIRECT:${url}`);
  }),
}));

const mockFindPlayerByIdentity = jest.fn();
const mockCreatePlayer = jest.fn();
const mockAddPlayerToGroup = jest.fn();
const mockEnsureUser = jest.fn();

jest.mock("@/lib/db/queries", () => ({
  findPlayerByIdentity: (...args: unknown[]) =>
    mockFindPlayerByIdentity(...args),
  createPlayer: (...args: unknown[]) => mockCreatePlayer(...args),
  addPlayerToGroup: (...args: unknown[]) => mockAddPlayerToGroup(...args),
  ensureUser: (...args: unknown[]) => mockEnsureUser(...args),
  getGroupsForUser: jest.fn().mockResolvedValue([{ id: "group-1" }]),
  getGroupBySlug: jest.fn(),
  getGroupSyncSettings: jest.fn(),
  createGroup: jest.fn(),
  removePlayerFromGroup: jest.fn(),
  touchGroupManualSync: jest.fn(),
  updateGroupSettings: jest.fn(),
}));

jest.mock("@/lib/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

jest.mock("@/lib/riot/sync", () => ({
  syncGroupPlayers: jest.fn(),
}));

import { addPlayerAction } from "@/app/admin/actions";

// ---- Helpers ---- //

function makeFormData(fields: Record<string, string>) {
  const fd = new FormData();
  for (const [key, value] of Object.entries(fields)) {
    fd.set(key, value);
  }
  return fd;
}

// ---- Tests ---- //

describe("addPlayerAction — null player guard (Fix 5)", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    mockAuth.mockResolvedValue({ userId: "user-1" });
    mockCurrentUser.mockResolvedValue({
      primaryEmailAddress: { emailAddress: "admin@test.com" },
    });
    mockEnsureUser.mockResolvedValue(undefined);
    // Mock isAdminEmail to return true so we skip group access check
    process.env.ADMIN_EMAILS = "admin@test.com";
  });

  it("returns error when createPlayer returns null", async () => {
    mockFindPlayerByIdentity.mockResolvedValue(null);
    mockCreatePlayer.mockResolvedValue(null);

    const formData = makeFormData({
      groupId: "group-1",
      gameName: "TestPlayer",
      tagLine: "EUW",
      region: "EUW1",
      queueType: "RANKED_SOLO_5x5",
    });

    const result = await addPlayerAction(formData);

    expect(result.status).toBe("error");
    expect(result.message).toBeDefined();
    // Should NOT call addPlayerToGroup since there's no player
    expect(mockAddPlayerToGroup).not.toHaveBeenCalled();
  });

  it("succeeds when createPlayer returns a valid player", async () => {
    mockFindPlayerByIdentity.mockResolvedValue(null);
    mockCreatePlayer.mockResolvedValue({
      id: "player-new",
      gameName: "TestPlayer",
      tagLine: "EUW",
      region: "euw1",
    });

    const formData = makeFormData({
      groupId: "group-1",
      gameName: "TestPlayer",
      tagLine: "EUW",
      region: "EUW1",
      queueType: "RANKED_SOLO_5x5",
    });

    const result = await addPlayerAction(formData);

    expect(result.status).toBe("success");
    expect(mockAddPlayerToGroup).toHaveBeenCalledWith(
      expect.objectContaining({
        groupId: "group-1",
        playerId: "player-new",
      }),
    );
  });
});
