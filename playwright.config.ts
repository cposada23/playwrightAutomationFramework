import { defineConfig, devices } from "@playwright/test";
import { loadRuntimeConfig } from "@/utils/env";

const env = process.env.ENV || process.env.NODE_ENV || "dev";
const cfg = loadRuntimeConfig(env);

export default defineConfig({
  testDir: "./tests",
  fullyParallel: true,
  retries: 2,
  workers: undefined,
  timeout: 30_000,
  expect: { timeout: 5_000 },
  reporter: (() => {
    const reporters: any[] = [
      ["list"],
      ["html", { open: "never", outputFolder: "playwright-report" }],
      ["json", { outputFile: "reports/report.json" }]
    ];
    if (process.env.SLACK_WEBHOOK_URL && process.env.SLACK_ENABLED === "true") {
      reporters.push([
        "./src/reporters/slack-reporter.ts",
        {
          webhookUrl: process.env.SLACK_WEBHOOK_URL,
          channelId: process.env.SLACK_CHANNEL_ID
        }
      ]);
    }
    return reporters;
  })(),
  use: {
    baseURL: cfg.app.baseURL,
    trace: "on-first-retry",
    screenshot: "only-on-failure",
    video: "retain-on-failure",
    actionTimeout: 15_000,
    navigationTimeout: 25_000,
    storageState: `storage_states/${env}.json`
  },
  projects: [
    { name: "Chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "Firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "WebKit", use: { ...devices["Desktop Safari"] } }
  ],
  metadata: { env },
  globalSetup: "./src/setup/global-setup.ts"
});
