import { chromium, type Browser, type BrowserContext, type Page } from "playwright";

import { env } from "@/lib/env";
import { ArtifactStore } from "@/server/providers/shared/artifacts";
import { withRetry } from "@/server/providers/shared/retry";
import type { ProviderContext } from "@/server/providers/shared/types";

export class PlaywrightCollector {
  private browser: Browser | null = null;
  private context: BrowserContext | null = null;
  private page: Page | null = null;

  constructor(
    private readonly providerContext: ProviderContext,
    private readonly artifacts: ArtifactStore,
  ) {}

  async start() {
    this.browser = await chromium.launch({
      headless: !env.PLAYWRIGHT_HEADFUL,
    });
    this.context = await this.browser.newContext({
      viewport: { width: 1440, height: 960 },
    });
    this.page = await this.context.newPage();
    return this.page;
  }

  getPage() {
    if (!this.page) {
      throw new Error("Playwright page not initialized.");
    }

    return this.page;
  }

  async goto(url: string, label: string) {
    const page = this.getPage();

    await withRetry(
      async () => {
        await page.goto(url, {
          waitUntil: "domcontentloaded",
          timeout: 45_000,
        });
      },
      {
        retries: 2,
        initialDelayMs: 1500,
        onError: async (error, attempt) => {
          this.providerContext.warnings.push({
            code: "playwright_navigation_retry",
            message: `Navigation retry ${attempt} for ${url}: ${String(error)}`,
          });
          await this.artifacts.appendLog(
            `navigation retry ${attempt} for ${label}: ${String(error)}`,
          );
        },
      },
    );

    await this.artifacts.capturePageSnapshot(page, label);
  }

  async stop() {
    await this.context?.close();
    await this.browser?.close();
  }
}
