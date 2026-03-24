import fs from "node:fs/promises";
import path from "node:path";

import type { Page } from "playwright";

import { getArtifactRoot } from "@/lib/env";
import type { CollectionArtifact, ProviderContext } from "@/server/providers/shared/types";

function sanitize(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

export class ArtifactStore {
  constructor(private readonly context: ProviderContext) {}

  private async ensureDirectory() {
    const directory = path.join(
      /* turbopackIgnore: true */ process.cwd(),
      getArtifactRoot(),
      this.context.runId,
      sanitize(this.context.providerKey),
    );

    await fs.mkdir(directory, { recursive: true });
    return directory;
  }

  private recordArtifact(kind: CollectionArtifact["kind"], label: string, filePath: string) {
    this.context.artifacts.push({
      kind,
      label,
      path: filePath,
    });
  }

  async writeJson(label: string, payload: unknown) {
    const directory = await this.ensureDirectory();
    const filePath = path.join(directory, `${sanitize(label)}.json`);
    await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
    this.recordArtifact("json", label, filePath);
    return filePath;
  }

  async writeHtml(label: string, html: string) {
    const directory = await this.ensureDirectory();
    const filePath = path.join(directory, `${sanitize(label)}.html`);
    await fs.writeFile(filePath, html, "utf8");
    this.recordArtifact("html", label, filePath);
    return filePath;
  }

  async appendLog(line: string) {
    const directory = await this.ensureDirectory();
    const filePath = path.join(directory, "provider.log");
    await fs.appendFile(filePath, `${new Date().toISOString()} ${line}\n`, "utf8");
    this.recordArtifact("log", "provider-log", filePath);
    return filePath;
  }

  async capturePageSnapshot(page: Page, label: string) {
    const directory = await this.ensureDirectory();
    const screenshotPath = path.join(directory, `${sanitize(label)}.png`);
    const htmlPath = path.join(directory, `${sanitize(label)}.html`);

    await page.screenshot({ path: screenshotPath, fullPage: true });
    await fs.writeFile(htmlPath, await page.content(), "utf8");

    this.recordArtifact("screenshot", `${label}-screenshot`, screenshotPath);
    this.recordArtifact("html", `${label}-html`, htmlPath);

    return {
      screenshotPath,
      htmlPath,
    };
  }
}
