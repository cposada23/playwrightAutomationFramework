import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";

async function postToSlack(webhookUrl: string, payload: any) {
  const res = await fetch(webhookUrl, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(payload) });
  if (!res.ok) {
    console.error(`Slack webhook failed: ${res.status} ${await res.text()}`);
  }
}

type FinalStatus = "passed" | "failed" | "timedOut" | "skipped";

export default class SlackReporter implements Reporter {
  private webhookUrl: string;
  private totalTests = 0;
  private finalById = new Map<string, FinalStatus>();

  constructor(opts: { webhookUrl: string }) {
    this.webhookUrl = opts?.webhookUrl;
  }

  onBegin(config: FullConfig, suite: Suite) {
    // Count unique tests at start using runtime API if available
    const s: any = suite as any;
    const tests: TestCase[] = typeof s.allTests === "function" ? s.allTests() : [];
    this.totalTests = tests.length;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    // Overwrite with the latest attempt's status; final attempt reflects end result
    const status = result.status as FinalStatus;
    this.finalById.set(test.id, status);
  }

  async onEnd(result: FullResult) {
    if (!this.webhookUrl) return;

    let passed = 0, failed = 0, skipped = 0;
    for (const status of this.finalById.values()) {
      if (status === "passed") passed++;
      else if (status === "skipped") skipped++;
      else failed++;
    }
    const total = this.totalTests || this.finalById.size;
    const status = result.status.toUpperCase();

    const text = `Playwright Run: ${status}\nTotal: ${total}, Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`;
    await postToSlack(this.webhookUrl, { text });
  }
}
