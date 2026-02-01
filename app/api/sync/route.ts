import { type NextRequest, NextResponse } from "next/server";
import { logger } from "@/lib/logger";
import { syncDuePlayers } from "@/lib/riot/sync";

export const runtime = "nodejs";

const MAX_LIMIT = 10;

function isAuthorized(request: NextRequest) {
  const secret = process.env.CRON_SECRET;
  const url = new URL(request.url);
  const querySecret = url.searchParams.get("secret");
  const authHeader = request.headers.get("authorization") ?? "";
  const bearer = authHeader.startsWith("Bearer ")
    ? authHeader.slice("Bearer ".length)
    : null;

  if (secret && (querySecret === secret || bearer === secret)) {
    return true;
  }

  if (request.headers.get("x-vercel-cron")) {
    return true;
  }

  return !process.env.VERCEL;
}

export async function GET(request: NextRequest) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      { ok: false, error: "Unauthorized" },
      { status: 401 },
    );
  }

  const limitParam = new URL(request.url).searchParams.get("limit");
  const limit = limitParam ? Number.parseInt(limitParam, 10) : undefined;
  const safeLimit = Number.isFinite(limit)
    ? Math.min(Math.max(limit as number, 1), MAX_LIMIT)
    : undefined;

  const result = await syncDuePlayers({ limit: safeLimit });
  logger.info("Cron sync executed", { ...result, limit: safeLimit ?? null });

  return NextResponse.json({ ok: true, ...result, limit: safeLimit ?? null });
}
