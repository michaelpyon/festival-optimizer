import { QuoteSourceType } from "@prisma/client";

import { ArtifactStore } from "@/server/providers/shared/artifacts";
import { PlaywrightCollector } from "@/server/providers/shared/playwright-session";
import type {
  HotelProvider,
  HotelQuoteResult,
  HotelSearchRequest,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

function parseDollarAmount(input: string) {
  const match = input.match(/\$([\d,]+)/);
  return match ? Number(match[1].replaceAll(",", "")) : null;
}

function hotelSearchUrl(request: HotelSearchRequest) {
  const url = new URL("https://www.booking.com/searchresults.html");
  url.searchParams.set("ss", request.destinationLabel);
  url.searchParams.set("checkin", request.checkInDate);
  url.searchParams.set("checkout", request.checkOutDate);
  url.searchParams.set("group_adults", String(request.travelers));
  url.searchParams.set("no_rooms", String(request.rooms));
  url.searchParams.set("selected_currency", request.currency);
  return url.toString();
}

export class BookingPlaywrightProvider implements HotelProvider {
  key = "booking-playwright";

  async collectHotelQuotes(
    request: HotelSearchRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<HotelQuoteResult>> {
    const artifacts = new ArtifactStore(context);
    const collector = new PlaywrightCollector(context, artifacts);
    const selectorLog: string[] = [];
    const searchUrl = hotelSearchUrl(request);

    try {
      const page = await collector.start();
      await collector.goto(searchUrl, "booking-results");
      await page.waitForLoadState("networkidle", { timeout: 20_000 }).catch(() => null);

      const selectors = [
        "[data-testid='property-card']",
        "[data-testid='property-card-container']",
      ];

      let cardHandles: Array<{
        hotelName: string | null;
        totalText: string | null;
        href: string | null;
        rawText: string;
      }> = [];

      for (const selector of selectors) {
        const cards = page.locator(selector);
        const count = await cards.count();
        selectorLog.push(`${selector}: ${count}`);

        if (count > 0) {
          cardHandles = await cards.evaluateAll((nodes) =>
            nodes.slice(0, 12).map((node) => {
              const element = node as HTMLElement;
              const title =
                element.querySelector("[data-testid='title']")?.textContent?.trim() ??
                null;
              const price =
                element
                  .querySelector("[data-testid='price-and-discounted-price']")
                  ?.textContent?.trim() ?? null;
              const link =
                (element.querySelector("a[data-testid='title-link']") as HTMLAnchorElement | null)
                  ?.href ?? null;
              return {
                hotelName: title,
                totalText: price,
                href: link,
                rawText: element.textContent ?? "",
              };
            }),
          );
          break;
        }
      }

      await artifacts.writeJson("booking-selector-log", selectorLog);

      const records = cardHandles
        .flatMap((card) => {
          const amount = parseDollarAmount(card.totalText ?? card.rawText);
          if (!amount) {
            return [];
          }

          return [
            {
              rawProviderName: "Booking.com",
              normalizedProviderName: "booking",
              amount,
              currency: request.currency,
              taxesIncluded: null,
              sourceUrl: card.href ?? searchUrl,
              sourceType: QuoteSourceType.SCRAPE,
              observedAt: new Date().toISOString(),
              confidence: 0.79,
              notes:
                "User-visible Booking.com total price scraped from the public results page.",
              rawPayload: card,
              selectorLog: selectorLog.join(" | "),
              hotelName: card.hotelName,
              zoneLabel: request.destinationLabel,
              checkIn: request.checkInDate,
              checkOut: request.checkOutDate,
              nightlyAmount: null,
              deepLinkUrl: card.href,
            } satisfies HotelQuoteResult,
          ];
        });

      if (records.length === 0) {
        context.warnings.push({
          code: "booking_no_prices_found",
          message: "Booking.com loaded, but no visible prices were extracted.",
        });
      }

      return {
        records,
        warnings: context.warnings,
        artifacts: context.artifacts,
      };
    } catch (error) {
      context.warnings.push({
        code: "booking_collection_failed",
        message: `Booking.com collection failed: ${String(error)}`,
      });

      await artifacts.appendLog(`Booking.com collection failed: ${String(error)}`);

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
