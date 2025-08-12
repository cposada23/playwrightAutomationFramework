import { chromium, FullConfig } from "@playwright/test";
import fs from "fs";
import path from "path";
import { loadRuntimeConfig } from "@/utils/env";

async function ensureDir(filePath: string) {
  const dir = path.dirname(filePath);
  await fs.promises.mkdir(dir, { recursive: true });
}

export default async function globalSetup(config: FullConfig) {
  const env = process.env.ENV || process.env.NODE_ENV || "dev";
  const storagePath = path.resolve(process.cwd(), `storage_states/${env}.json`);

  if (fs.existsSync(storagePath)) {
    return; // reuse existing session
  }

  const cfg = loadRuntimeConfig(env);

  if (!cfg.app.baseURL) return;

  // Optional UI-based login placeholder. Customize selectors for your app if needed.
  const headless = true;
  const browser = await chromium.launch({ headless });
  const context = await browser.newContext();
  const page = await context.newPage();
  await page.goto(cfg.app.baseURL);
  // TODO: implement real login if applicable
  // Example (pseudo):
  // await page.fill('input[name="email"]', cfg.auth.username);
  // await page.fill('input[name="password"]', cfg.auth.password);
  // await page.click('button[type="submit"]');
  // await page.waitForURL(/dashboard/);

  await ensureDir(storagePath);
  await context.storageState({ path: storagePath });

  await browser.close();
}
