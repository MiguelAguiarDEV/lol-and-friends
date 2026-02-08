/** @jest-environment node */

/**
 * Tests for RiotApiError class and riotFetch error handling.
 * Verifies that non-429 API failures throw RiotApiError with status code.
 */

// We test the exported classes and functions through the public API functions
// that use riotFetch internally.
import {
  getAccountByRiotId,
  RiotApiError,
  RiotRateLimitError,
} from "@/lib/riot/api";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

// Suppress logger output in tests
jest.mock("@/lib/logger", () => ({
  logger: { info: jest.fn(), warn: jest.fn(), error: jest.fn() },
}));

describe("RiotApiError", () => {
  it("has correct name, status, and message", () => {
    const error = new RiotApiError({ status: 403, body: "Forbidden" });

    expect(error).toBeInstanceOf(Error);
    expect(error.name).toBe("RiotApiError");
    expect(error.status).toBe(403);
    expect(error.message).toBe("Riot API error 403: Forbidden");
  });

  it("is distinguishable from RiotRateLimitError", () => {
    const apiError = new RiotApiError({ status: 500, body: "Internal" });
    const rateError = new RiotRateLimitError({
      retryAfterSeconds: 5,
      limitType: null,
      status: 429,
    });

    expect(apiError).not.toBeInstanceOf(RiotRateLimitError);
    expect(rateError).not.toBeInstanceOf(RiotApiError);
  });
});

describe("riotFetch throws RiotApiError for non-429 failures", () => {
  beforeEach(() => {
    jest.clearAllMocks();
    process.env.RIOT_API_KEY = "test-key";
  });

  it("throws RiotApiError with status on 403", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 403,
      headers: new Headers(),
      text: async () => "Forbidden",
    });

    await expect(
      getAccountByRiotId({
        accountRegion: "europe",
        gameName: "Test",
        tagLine: "EUW",
      }),
    ).rejects.toThrow(RiotApiError);

    try {
      mockFetch.mockResolvedValueOnce({
        ok: false,
        status: 403,
        headers: new Headers(),
        text: async () => "Forbidden",
      });
      await getAccountByRiotId({
        accountRegion: "europe",
        gameName: "Test",
        tagLine: "EUW",
      });
    } catch (error) {
      expect(error).toBeInstanceOf(RiotApiError);
      expect((error as RiotApiError).status).toBe(403);
    }
  });

  it("throws RiotApiError with status on 404", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 404,
      headers: new Headers(),
      text: async () => "Data not found",
    });

    await expect(
      getAccountByRiotId({
        accountRegion: "europe",
        gameName: "Unknown",
        tagLine: "NA1",
      }),
    ).rejects.toThrow(RiotApiError);
  });

  it("throws RiotApiError with status on 500", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 500,
      headers: new Headers(),
      text: async () => "Internal Server Error",
    });

    await expect(
      getAccountByRiotId({
        accountRegion: "europe",
        gameName: "Test",
        tagLine: "EUW",
      }),
    ).rejects.toThrow(RiotApiError);
  });

  it("still throws RiotRateLimitError on 429", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: false,
      status: 429,
      headers: new Headers({ "retry-after": "5" }),
      text: async () => "Rate limited",
    });

    await expect(
      getAccountByRiotId({
        accountRegion: "europe",
        gameName: "Test",
        tagLine: "EUW",
      }),
    ).rejects.toThrow(RiotRateLimitError);
  });
});
