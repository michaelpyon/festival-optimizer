import fs from "node:fs/promises";
import os from "node:os";
import path from "node:path";

import type { Page } from "playwright";

import { getArtifactRoot } from "@/lib/env";
import type { CollectionArtifact, ProviderContext } from "@/server/providers/shared/types";

function sanitize(label: string) {
  return label.toLowerCase().replace(/[^a-z0-9]+/g, "-");
}

const configuredRoot = getArtifactRoot();

// On serverless hosts like Vercel the deploy filesystem under process.cwd() is
// read-only, so artifact writes there throw. Absolute roots (an explicit
// COLLECTION_ARTIFACT_DIR pointing at /tmp, for example) are honored as-is;
// relative roots are anchored under the OS temp dir, which is always writable.
function resolveArtifactBase() {
  if (path.isAbsolute(configuredRoot)) {
    return configuredRoot;
  }

  return path.join(os.tmpdir(), configuredRoot);
}

const artifactBase = resolveArtifactBase();

export class ArtifactStore {
  constructor(private readonly context: ProviderContext) {}

  private async ensureDirectory() {
    const directory = path.join(
      artifactBase,
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

  // Artifact writes are diagnostic only and must never fail a collection run.
  // If the filesystem is read-only or otherwise unavailable, record a warning
  // and continue so live API data is always returned to the engine.
  private noteWriteFailure(label: string, error: unknown) {
    const message = error instanceof Error ? error.message : String(error);
    this.context.warnings.push({
      code: "artifact_write_failed",
      message: `Could not persist artifact "${label}": ${message}`,
    });
  }

  async writeJson(label: string, payload: unknown) {
    try {
      const directory = await this.ensureDirectory();
      const filePath = path.join(directory, `${sanitize(label)}.json`);
      await fs.writeFile(filePath, JSON.stringify(payload, null, 2), "utf8");
      this.recordArtifact("json", label, filePath);
      return filePath;
    } catch (error) {
      this.noteWriteFailure(label, error);
      return null;
    }
  }

  async writeHtml(label: string, html: string) {
    try {
      const directory = await this.ensureDirectory();
      const filePath = path.join(directory, `${sanitize(label)}.html`);
      await fs.writeFile(filePath, html, "utf8");
      this.recordArtifact("html", label, filePath);
      return filePath;
    } catch (error) {
      this.noteWriteFailure(label, error);
      return null;
    }
  }

  async appendLog(line: string) {
    try {
      const directory = await this.ensureDirectory();
      const filePath = path.join(directory, "provider.log");
      await fs.appendFile(filePath, `${new Date().toISOString()} ${line}\n`, "utf8");
      this.recordArtifact("log", "provider-log", filePath);
      return filePath;
    } catch (error) {
      this.noteWriteFailure("provider-log", error);
      return null;
    }
  }

  async capturePageSnapshot(page: Page, label: string) {
    try {
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
    } catch (error) {
      this.noteWriteFailure(label, error);
      return {
        screenshotPath: null,
        htmlPath: null,
      };
    }
  }
}
