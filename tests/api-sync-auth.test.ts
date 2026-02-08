/** @jest-environment node */

import { NextRequest } from "next/server";
import { GET } from "@/app/api/sync/route";
import { syncDuePlayers } from "@/lib/riot/sync";

jest.mock("@/lib/riot/sync", () => ({
  syncDuePlayers: jest.fn(),
}));

const syncDuePlayersMock = jest.mocked(syncDuePlayers);

function setNodeEnv(value?: string) {
  const env = process.env as unknown as Record<string, string | undefined>;
  if (value === undefined) {
    delete env.NODE_ENV;
    return;
  }

  env.NODE_ENV = value;
}

function buildRequest(params?: { authHeader?: string; query?: string }) {
  const query = params?.query ?? "";
  const querySuffix = query ? `?${query}` : "";
  const headers = new Headers();
  if (params?.authHeader) {
    headers.set("authorization", params.authHeader);
  }

  return new NextRequest(`https://example.com/api/sync${querySuffix}`, {
    headers,
  });
}

describe("/api/sync authorization", () => {
  const originalCronSecret = process.env.CRON_SECRET;
  const originalVercel = process.env.VERCEL;
  const originalNodeEnv = process.env.NODE_ENV;

  beforeEach(() => {
    jest.clearAllMocks();
    delete process.env.CRON_SECRET;
    delete process.env.VERCEL;
    setNodeEnv("test");
    syncDuePlayersMock.mockResolvedValue({
      attempted: 1,
      succeeded: 1,
      failed: 0,
      totalDue: 1,
      errors: [],
    });
  });

  afterAll(() => {
    if (originalCronSecret === undefined) {
      delete process.env.CRON_SECRET;
    } else {
      process.env.CRON_SECRET = originalCronSecret;
    }

    if (originalVercel === undefined) {
      delete process.env.VERCEL;
    } else {
      process.env.VERCEL = originalVercel;
    }

    setNodeEnv(originalNodeEnv);
  });

  it("allows request in development without cron secret", async () => {
    setNodeEnv("development");

    const response = await GET(buildRequest({ query: "limit=5" }));

    expect(response.status).toBe(200);
    expect(syncDuePlayersMock).toHaveBeenCalledWith({ limit: 5 });
  });

  it("rejects request outside development when CRON_SECRET is missing", async () => {
    setNodeEnv("production");

    const response = await GET(buildRequest());

    expect(response.status).toBe(401);
    expect(syncDuePlayersMock).not.toHaveBeenCalled();
  });

  it("rejects invalid bearer token", async () => {
    setNodeEnv("production");
    process.env.CRON_SECRET = "expected-secret";

    const response = await GET(
      buildRequest({ authHeader: "Bearer invalid-secret" }),
    );

    expect(response.status).toBe(401);
    expect(syncDuePlayersMock).not.toHaveBeenCalled();
  });

  it("rejects query secret outside development", async () => {
    setNodeEnv("production");
    process.env.CRON_SECRET = "expected-secret";

    const response = await GET(
      buildRequest({ query: "secret=expected-secret" }),
    );

    expect(response.status).toBe(401);
    expect(syncDuePlayersMock).not.toHaveBeenCalled();
  });

  it("accepts valid bearer token and clamps upper limit", async () => {
    setNodeEnv("production");
    process.env.CRON_SECRET = " expected-secret ";
    syncDuePlayersMock.mockResolvedValue({
      attempted: 4,
      succeeded: 4,
      failed: 0,
      totalDue: 9,
      errors: [],
    });

    const response = await GET(
      buildRequest({
        authHeader: "bearer   expected-secret   ",
        query: "limit=99",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(syncDuePlayersMock).toHaveBeenCalledWith({ limit: 10 });
    expect(payload).toEqual({
      ok: true,
      attempted: 4,
      succeeded: 4,
      failed: 0,
      totalDue: 9,
      errors: [],
      limit: 10,
    });
  });

  it("clamps non-positive limit to minimum", async () => {
    setNodeEnv("production");
    process.env.CRON_SECRET = "expected-secret";

    const response = await GET(
      buildRequest({ authHeader: "Bearer expected-secret", query: "limit=0" }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(syncDuePlayersMock).toHaveBeenCalledWith({ limit: 1 });
    expect(payload.limit).toBe(1);
  });

  it("ignores malformed limit values", async () => {
    setNodeEnv("production");
    process.env.CRON_SECRET = "expected-secret";

    const response = await GET(
      buildRequest({
        authHeader: "Bearer expected-secret",
        query: "limit=1abc",
      }),
    );
    const payload = await response.json();

    expect(response.status).toBe(200);
    expect(syncDuePlayersMock).toHaveBeenCalledWith({ limit: undefined });
    expect(payload.limit).toBeNull();
  });

  it("rejects request when secret exists but bearer is missing", async () => {
    setNodeEnv("development");
    process.env.CRON_SECRET = "expected-secret";

    const response = await GET(buildRequest());

    expect(response.status).toBe(401);
    expect(syncDuePlayersMock).not.toHaveBeenCalled();
  });
});
