import { spawn } from "node:child_process";
import { mkdir } from "node:fs/promises";
import { setTimeout as delay } from "node:timers/promises";
import { chromium, devices } from "@playwright/test";

const baseUrl = "http://127.0.0.1:3000";
const outputDir = new URL("../docs/screenshots/", import.meta.url).pathname;

async function waitForServer(params) {
  const { url, retries, delayMs } = params;

  for (let attempt = 0; attempt < retries; attempt += 1) {
    try {
      const response = await fetch(url, { method: "GET" });
      if (response.ok) {
        return;
      }
    } catch {
      // ignore and retry
    }

    await delay(delayMs);
  }

  throw new Error(`Server not ready at ${url}`);
}

async function captureScreens() {
  await mkdir(outputDir, { recursive: true });

  const devServer = spawn(
    "bun",
    ["run", "dev", "--", "--hostname", "127.0.0.1", "--port", "3000"],
    {
      stdio: "ignore",
      env: {
        ...process.env,
        FORCE_COLOR: "0",
      },
    },
  );

  try {
    await waitForServer({ url: baseUrl, retries: 40, delayMs: 500 });

    const browser = await chromium.launch();

    const desktopPage = await browser.newPage({
      viewport: { width: 1440, height: 900 },
    });
    await desktopPage.goto(baseUrl, { waitUntil: "networkidle" });
    await desktopPage.getByText("Reto LoL — Tabla pública").waitFor();
    await desktopPage.screenshot({
      path: `${outputDir}/public-table-desktop.png`,
      fullPage: true,
    });

    const mobileDevice = devices["iPhone 13"];
    const mobileContext = await browser.newContext({
      ...mobileDevice,
    });
    const mobilePage = await mobileContext.newPage();
    await mobilePage.goto(baseUrl, { waitUntil: "networkidle" });
    await mobilePage.getByText("Reto LoL — Tabla pública").waitFor();
    await mobilePage.screenshot({
      path: `${outputDir}/public-table-mobile.png`,
      fullPage: true,
    });

    await browser.close();
  } finally {
    devServer.kill("SIGTERM");
  }
}

await captureScreens();
