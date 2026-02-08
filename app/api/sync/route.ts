import { timingSafeEqual } from "node:crypto";
import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { syncDuePlayers } from "@/lib/riot/sync";

export const runtime = "nodejs";

const MAX_LIMIT = 10;

function isDevelopmentEnvironment() {
  return process.env.NODE_ENV === "development";
}

function safeSecretCompare(params: { expected: string; received: string }) {
  const expectedBuffer = Buffer.from(params.expected);
  const receivedBuffer = Buffer.from(params.received);
  if (expectedBuffer.length !== receivedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, receivedBuffer);
}

function getBearerToken(authHeader: string) {
  const match = /^Bearer\s+(.+)$/i.exec(authHeader.trim());
  if (!match) {
    return null;
  }

  const token = match[1]?.trim();
  return token ? token : null;
}

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET?.trim();
  const authHeader = request.headers.get("authorization") ?? "";
  const bearer = getBearerToken(authHeader);

  if (!secret) {
    if (isDevelopmentEnvironment()) {
      return true;
    }

    logger.error("CRON_SECRET missing outside development");
    return false;
  }

  if (bearer && safeSecretCompare({ expected: secret, received: bearer })) {
    return true;
  }

  return false;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const limitParam = new URL(request.url).searchParams.get("limit");
  const parsedLimit =
    limitParam && /^-?\d+$/.test(limitParam)
      ? Number.parseInt(limitParam, 10)
      : undefined;
  const safeLimit = Number.isFinite(parsedLimit)
    ? Math.min(Math.max(parsedLimit as number, 1), MAX_LIMIT)
    : undefined;

  const result = await syncDuePlayers({ limit: safeLimit });
  logger.info("Cron sync executed", { ...result, limit: safeLimit ?? null });

  return NextResponse.json({ ok: true, ...result, limit: safeLimit ?? null });
}
