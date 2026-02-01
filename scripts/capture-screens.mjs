import "dotenv/config";
import { spawn } from "node:child_process";
import { randomUUID } from "node:crypto";
import { mkdir } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { createClient } from "@libsql/client";
import { chromium, devices } from "@playwright/test";

const port = Number(process.env.SCREENSHOT_PORT ?? 3100);
const baseUrl = `http://127.0.0.1:${port}`;
const outputDir = new URL("../docs/screenshots/", import.meta.url).pathname;
const seedEnabled = process.env.SCREENSHOT_SEED === "true";
const screenshotGroup = { slug: "demo-euw", name: "Reto EUW" };

async function gotoWithRetries(params) {
  const { page, url, retries, delayMs } = params;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      await page.goto(url, { waitUntil: "domcontentloaded", timeout: 10_000 });
      return;
    } catch {
      await delay(delayMs);
    }
  }

  throw new Error(`Unable to reach ${url}`);
}

async function getClient() {
  const url = process.env.TURSO_DATABASE_URL;
  if (!url) {
    throw new Error("Missing TURSO_DATABASE_URL");
  }

  return createClient({
    url,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });
}

async function fetchFirstPublicGroup(client) {
  const result = await client.execute({
    sql: "select id, name, slug from groups where is_public = 1 limit 1",
  });

  if (!result.rows?.length) {
    return null;
  }

  const row = result.rows[0];
  return {
    id: String(row.id),
    name: String(row.name),
    slug: String(row.slug),
  };
}

async function seedGroupData(client) {
  const userId = `seed-${randomUUID()}`;
  const groupId = `seed-${randomUUID()}`;
  const groupSlug = `demo-${randomUUID().slice(0, 6)}`;
  const groupName = "Demo EUW";

  await client.execute({
    sql: "insert into users (id, email) values (?, ?)",
    args: [userId, "seed@example.com"],
  });

  await client.execute({
    sql: "insert into groups (id, name, slug, owner_id, is_public, sync_interval_minutes, manual_cooldown_minutes) values (?, ?, ?, ?, 1, 360, 30)",
    args: [groupId, groupName, groupSlug, userId],
  });

  await client.execute({
    sql: "insert into group_members (group_id, user_id, role) values (?, ?, ?)",
    args: [groupId, userId, "owner"],
  });

  const players = [
    {
      id: `seed-${randomUUID()}`,
      gameName: "AkaliSensei",
      tagLine: "EUW",
      region: "euw1",
      tier: "DIAMOND",
      division: "IV",
      lp: 54,
      wins: 126,
      losses: 98,
      objective: "DIAMOND III",
      notes: "Racha positiva en la última semana.",
      monthCheckpoint: "En progreso",
    },
    {
      id: `seed-${randomUUID()}`,
      gameName: "JinxMain",
      tagLine: "EUW",
      region: "euw1",
      tier: "PLATINUM",
      division: "I",
      lp: 72,
      wins: 93,
      losses: 74,
      objective: "EMERALD IV",
      notes: "Priorizar dúo bot.",
      monthCheckpoint: "Fuerte",
    },
  ];

  for (const player of players) {
    await client.execute({
      sql: "insert into players (id, game_name, tag_line, region, tier, division, lp, wins, losses, notes, objective, month_checkpoint, last_sync_at) values (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, datetime('now'))",
      args: [
        player.id,
        player.gameName,
        player.tagLine,
        player.region,
        player.tier,
        player.division,
        player.lp,
        player.wins,
        player.losses,
        player.notes,
        player.objective,
        player.monthCheckpoint,
      ],
    });

    await client.execute({
      sql: "insert into group_players (group_id, player_id) values (?, ?)",
      args: [groupId, player.id],
    });
  }

  return {
    group: { id: groupId, name: groupName, slug: groupSlug },
    playerIds: players.map((player) => player.id),
    userId,
  };
}

async function cleanupSeedData(client, seed) {
  if (!seed) {
    return;
  }

  if (seed.playerIds.length > 0) {
    const placeholders = seed.playerIds.map(() => "?").join(",");
    await client.execute({
      sql: `delete from players where id in (${placeholders})`,
      args: seed.playerIds,
    });
  }

  await client.execute({
    sql: "delete from group_players where group_id = ?",
    args: [seed.group.id],
  });
  await client.execute({
    sql: "delete from group_members where group_id = ?",
    args: [seed.group.id],
  });
  await client.execute({
    sql: "delete from groups where id = ?",
    args: [seed.group.id],
  });
  await client.execute({
    sql: "delete from users where id = ?",
    args: [seed.userId],
  });
}

async function captureScreens() {
  await mkdir(outputDir, { recursive: true });

  console.log("Starting dev server for screenshots...");
  const devServer = spawn(
    "bun",
    ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", String(port)],
    {
      stdio: "inherit",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
        SCREENSHOT_MODE: "true",
      },
    },
  );

  const client = seedEnabled ? await getClient() : null;
  let seed = null;

  try {
    console.log("Server ready, capturing screenshots...");
    if (client) {
      seed = await seedGroupData(client);
    }
    const existingGroup = client
      ? (seed?.group ?? (await fetchFirstPublicGroup(client)))
      : screenshotGroup;

    const browser = await chromium.launch();

    const desktopPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await gotoWithRetries({
      page: desktopPage,
      url: baseUrl,
      retries: 40,
      delayMs: 500,
    });
    await desktopPage.getByText("Reto LoL — Grupos públicos").waitFor();
    await desktopPage.screenshot({
      path: `${outputDir}/groups-home-desktop.png`,
      fullPage: true,
    });
    console.log("Saved groups-home-desktop.png");

    const mobileDevice = devices["iPhone 13"];
    const mobileContext = await browser.newContext({
      ...mobileDevice,
    });
    const mobilePage = await mobileContext.newPage();
    await gotoWithRetries({
      page: mobilePage,
      url: baseUrl,
      retries: 40,
      delayMs: 500,
    });
    await mobilePage.getByText("Reto LoL — Grupos públicos").waitFor();
    await mobilePage.screenshot({
      path: `${outputDir}/groups-home-mobile.png`,
      fullPage: true,
    });
    console.log("Saved groups-home-mobile.png");

    if (existingGroup) {
      const groupUrl = `${baseUrl}/g/${existingGroup.slug}`;
      await gotoWithRetries({
        page: desktopPage,
        url: groupUrl,
        retries: 40,
        delayMs: 500,
      });
      await desktopPage
        .getByRole("heading", { name: existingGroup.name })
        .waitFor();
      await desktopPage.screenshot({
        path: `${outputDir}/group-page-desktop.png`,
        fullPage: true,
      });
      console.log("Saved group-page-desktop.png");

      await gotoWithRetries({
        page: mobilePage,
        url: groupUrl,
        retries: 40,
        delayMs: 500,
      });
      await mobilePage
        .getByRole("heading", { name: existingGroup.name })
        .waitFor();
      await mobilePage.screenshot({
        path: `${outputDir}/group-page-mobile.png`,
        fullPage: true,
      });
      console.log("Saved group-page-mobile.png");
    }

    await browser.close();
  } finally {
    devServer.kill("SIGTERM");
    if (client) {
      await cleanupSeedData(client, seed);
    }
  }
}

await captureScreens();
