import { QuoteSourceType } from "@prisma/client";

import { ArtifactStore } from "@/server/providers/shared/artifacts";
import { PlaywrightCollector } from "@/server/providers/shared/playwright-session";
import type {
  FlightProvider,
  FlightQuoteResult,
  FlightSearchRequest,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

function toSkyscannerDate(value: string) {
  return value.replaceAll("-", "").slice(2);
}

function parseDollarAmount(input: string) {
  const match = input.match(/\$([\d,]+)/);
  return match ? Number(match[1].replaceAll(",", "")) : null;
}

function parseLayovers(input: string) {
  if (/non.?stop/i.test(input)) {
    return 0;
  }

  const match = input.match(/(\d+)\s+stop/i);
  return match ? Number(match[1]) : null;
}

export class SkyscannerPlaywrightProvider implements FlightProvider {
  key = "skyscanner-playwright";

  async collectFlightQuotes(
    request: FlightSearchRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<FlightQuoteResult>> {
    const artifacts = new ArtifactStore(context);
    const collector = new PlaywrightCollector(context, artifacts);
    const selectorLog: string[] = [];

    const searchUrl = `https://www.skyscanner.com/transport/flights/${request.originIata.toLowerCase()}/${request.destinationIata.toLowerCase()}/${toSkyscannerDate(request.departureDate)}/${toSkyscannerDate(request.returnDate)}/?adultsv2=${request.travelers}&cabinclass=economy&preferdirects=${request.maxLayovers === 0 ? "true" : "false"}`;

    try {
      const page = await collector.start();
      await collector.goto(searchUrl, "skyscanner-results");
      await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => null);

      const selectors = [
        "[data-test-id*='itinerary']",
        "[data-testid*='itinerary']",
        "article",
      ];

      let cardTexts: string[] = [];

      for (const selector of selectors) {
        const locator = page.locator(selector);
        const count = await locator.count();
        selectorLog.push(`${selector}: ${count}`);

        if (count > 0) {
          cardTexts = await locator.evaluateAll((nodes) =>
            nodes.slice(0, 8).map((node) => node.textContent ?? ""),
          );
          break;
        }
      }

      await artifacts.writeJson("skyscanner-selector-log", selectorLog);

      const records = cardTexts
        .map((text) => text.replace(/\s+/g, " ").trim())
        .flatMap((text, index) => {
          const amount = parseDollarAmount(text);
          if (!amount) {
            return [];
          }

          const layoverCount = parseLayovers(text);
          return [
            {
              rawProviderName: "Skyscanner",
              normalizedProviderName: "skyscanner",
              amount,
              currency: request.currency,
              taxesIncluded: null,
              sourceUrl: searchUrl,
              sourceType: QuoteSourceType.SCRAPE,
              observedAt: new Date().toISOString(),
              confidence: 0.74,
              notes:
                "User-visible fare scraped from Skyscanner results. Itinerary extraction is best-effort and may need manual verification.",
              rawPayload: { text },
              selectorLog: selectorLog.join(" | "),
              itinerarySummary: text.slice(0, 220) || `Result ${index + 1}`,
              deepLinkUrl: searchUrl,
              layoverCount,
              isRedEye: /red-eye/i.test(text),
              isValidForAttendance:
                layoverCount === null || layoverCount <= request.maxLayovers,
            } satisfies FlightQuoteResult,
          ];
        });

      if (records.length === 0) {
        context.warnings.push({
          code: "skyscanner_no_prices_found",
          message:
            "Skyscanner loaded, but no prices were extracted from the visible page.",
        });
      }

      return {
        records,
        warnings: context.warnings,
        artifacts: context.artifacts,
      };
    } catch (error) {
      context.warnings.push({
        code: "skyscanner_collection_failed",
        message: `Skyscanner collection failed: ${String(error)}`,
      });

      await artifacts.appendLog(`Skyscanner collection failed: ${String(error)}`);

      return {
        records: [],
        warnings: context.warnings,
        artifacts: context.artifacts,
      };
    } finally {
      await collector.stop();
    }
  }
}
