import type { FullConfig, FullResult, Reporter, Suite, TestCase, TestResult } from "@playwright/test/reporter";
import fs from "fs";
import path from "path";
import axios from "axios";
import archiver from "archiver";
import { WebClient } from "@slack/web-api";

async function postToSlack(webhookUrl: string, payload: any) {
  try {
    const res = await axios.post(webhookUrl, payload, { headers: { "Content-Type": "application/json" } });
    if (res.status !== 200) {
      console.error(`Slack webhook failed: ${res.status} ${res.statusText}`);
    }
  } catch (error: any) {
    console.error("Error posting to Slack webhook:", error.response?.data || error.message);
  }
}

async function createReportZip(reportDir: string): Promise<string | null> {
  return new Promise((resolve, reject) => {
    const zipPath = path.join(reportDir, '..', 'playwright-report.zip');
    const output = fs.createWriteStream(zipPath);
    const archive = archiver('zip', { zlib: { level: 9 } });

    output.on('close', () => {
      console.log(`[Slack Reporter] ZIP created: ${archive.pointer()} bytes`);
      resolve(zipPath);
    });

    archive.on('error', (err: any) => {
      console.error(`[Slack Reporter] Error creating ZIP:`, err);
      reject(err);
    });

    archive.pipe(output);
    
    // Add the entire report directory to the ZIP
    archive.directory(reportDir, false);
    archive.finalize();
  });
}

async function uploadReportToSlack(botToken: string, channelId: string, reportPath: string, comment: string) {
  const reportDir = path.dirname(reportPath);
  
  if (!fs.existsSync(reportDir)) {
    console.error(`[Slack Reporter] Error: Report directory not found at ${reportDir}`);
    return;
  }

  console.log(`[Slack Reporter] Creating ZIP archive of report directory: ${reportDir}`);
  
  // Create a ZIP file of the entire report
  const zipPath = await createReportZip(reportDir);
  if (!zipPath) {
    console.error(`[Slack Reporter] Error: Failed to create ZIP file`);
    return;
  }

  const web = new WebClient(botToken);

  try {
    console.log(`[Slack Reporter] Uploading report to Slack channel: ${channelId}`);
    
    // Use the simpler files.uploadV2 method that should handle permissions better
    const result = await web.files.uploadV2({
      channel_id: channelId,
      file: fs.createReadStream(zipPath),
      filename: 'playwright-report.zip',
      title: 'Playwright Test Report',
      initial_comment: `🎭 *Playwright Test Results*\n\`\`\`${comment}\`\`\`\n\n📊 *Download and extract the ZIP file, then open \`index.html\` in your browser to view the interactive report with screenshots and traces.*`
    });

    if (result.ok) {
      console.log(`[Slack Reporter] Report uploaded successfully!`);
      const fileResult = result as any;
      if (fileResult.file) {
        console.log(`[Slack Reporter] File ID: ${fileResult.file.id}`);
        console.log(`[Slack Reporter] File permalink: ${fileResult.file.permalink}`);
      }
    } else {
      console.error(`[Slack Reporter] Upload failed: ${result.error || 'Unknown error'}`);
      
      // Fallback: Post a message with results if upload fails
      await web.chat.postMessage({
        channel: channelId,
        text: `🎭 *Playwright Test Results*\n\`\`\`${comment}\`\`\`\n\n⚠️ *Report upload failed, but you can view the full report locally at:*\n\`${reportPath}\`\n\n💡 *To view:* Run \`npx playwright show-report\` or open the file directly in your browser.`
      });
      console.log("[Slack Reporter] Posted fallback message with results");
    }

  } catch (error: any) {
    console.error("[Slack Reporter] Exception during upload:", error.message);
    
    // Fallback: Post a message with results if upload fails
    try {
      await web.chat.postMessage({
        channel: channelId,
        text: `🎭 *Playwright Test Results*\n\`\`\`${comment}\`\`\`\n\n⚠️ *Report upload failed, but you can view the full report locally at:*\n\`${reportPath}\`\n\n💡 *To view:* Run \`npx playwright show-report\` or open the file directly in your browser.`
      });
      console.log("[Slack Reporter] Posted fallback message with results");
    } catch (fallbackError: any) {
      console.error("[Slack Reporter] Fallback message also failed:", fallbackError.message);
    }
  } finally {
    // Clean up the ZIP file
    try {
      if (zipPath && fs.existsSync(zipPath)) {
        fs.unlinkSync(zipPath);
        console.log(`[Slack Reporter] Cleaned up temporary ZIP file: ${zipPath}`);
      }
    } catch (cleanupError) {
      console.warn(`[Slack Reporter] Warning: Could not clean up ZIP file: ${cleanupError}`);
    }
  }
}

type FinalStatus = "passed" | "failed" | "timedOut" | "skipped";

export default class SlackReporter implements Reporter {
  private webhookUrl: string;
  private channelId: string;
  private totalTests = 0;
  private finalById = new Map<string, FinalStatus>();

  constructor(opts: { webhookUrl: string; channelId: string }) {
    this.webhookUrl = opts?.webhookUrl;
    this.channelId = opts?.channelId;
  }

  onBegin(config: FullConfig, suite: Suite) {
    const s: any = suite as any;
    const tests: TestCase[] = typeof s.allTests === "function" ? s.allTests() : [];
    this.totalTests = tests.length;
  }

  onTestEnd(test: TestCase, result: TestResult) {
    const status = result.status as FinalStatus;
    this.finalById.set(test.id, status);
  }

  async onEnd(result: FullResult) {
    let passed = 0,
      failed = 0,
      skipped = 0;
    for (const status of this.finalById.values()) {
      if (status === "passed") passed++;
      else if (status === "skipped") skipped++;
      else failed++;
    }
    const total = this.totalTests || this.finalById.size;
    const status = result.status.toUpperCase();
    const text = `Playwright Run: ${status}\nTotal: ${total}, Passed: ${passed}, Failed: ${failed}, Skipped: ${skipped}`;

    if (this.webhookUrl) {
      await postToSlack(this.webhookUrl, { text });
    }

    if (process.env.SLACK_BOT_TOKEN && this.channelId) {
      const reportPath = path.resolve(process.cwd(), "playwright-report/index.html");
      await uploadReportToSlack(process.env.SLACK_BOT_TOKEN, this.channelId, reportPath, text);
    }
  }
}
