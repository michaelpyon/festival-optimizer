import { QuoteSourceType } from "@prisma/client";

import { env } from "@/lib/env";
import { ArtifactStore } from "@/server/providers/shared/artifacts";
import type {
  HotelProvider,
  HotelQuoteResult,
  HotelSearchRequest,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

type SerpApiHotelResult = {
  property_name?: string;
  rate_per_night?: {
    lowest?: string;
  };
  total_rate?: {
    lowest?: string;
  };
  link?: string;
};

export function parsePriceText(value?: string) {
  return Number(value?.replace(/[^\d.]/g, "") ?? "0");
}

export function normalizeSerpApiHotelProperty(input: {
  property: SerpApiHotelResult;
  request: HotelSearchRequest;
}) {
  const total = parsePriceText(input.property.total_rate?.lowest);
  const nightly = parsePriceText(input.property.rate_per_night?.lowest);

  if (!total && !nightly) {
    return null;
  }

  return {
    rawProviderName: "SerpApi Google Hotels",
    normalizedProviderName: "serpapi_google_hotels",
    amount: total || nightly,
    currency: input.request.currency,
    taxesIncluded: null,
    sourceUrl: input.property.link ?? "https://serpapi.com/search.json",
    sourceType: QuoteSourceType.API,
    observedAt: new Date().toISOString(),
    confidence: 0.88,
    notes: "API hotel rate from SerpApi Google Hotels search.",
    rawPayload: input.property,
    hotelName: input.property.property_name ?? null,
    zoneLabel: input.request.hotelZoneLabel ?? input.request.destinationLabel,
    checkIn: input.request.checkInDate,
    checkOut: input.request.checkOutDate,
    nightlyAmount: nightly || null,
  } satisfies HotelQuoteResult;
}

export class GoogleHotelsSerpApiProvider implements HotelProvider {
  key = "google-hotels-serpapi";

  async collectHotelQuotes(
    request: HotelSearchRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<HotelQuoteResult>> {
    if (!env.SERPAPI_KEY) {
      return {
        records: [],
        warnings: [
          {
            code: "serpapi_not_configured",
            message: "SERPAPI_KEY is not configured.",
          },
        ],
        artifacts: [],
      };
    }

    const artifacts = new ArtifactStore(context);
    const url = new URL("https://serpapi.com/search.json");
    url.searchParams.set("engine", "google_hotels");
    url.searchParams.set("q", request.destinationLabel);
    url.searchParams.set("check_in_date", request.checkInDate);
    url.searchParams.set("check_out_date", request.checkOutDate);
    url.searchParams.set("adults", String(request.travelers));
    url.searchParams.set("currency", request.currency);
    url.searchParams.set("api_key", env.SERPAPI_KEY);

    const response = await fetch(url.toString(), { cache: "no-store" });
    const payload = (await response.json()) as {
      properties?: SerpApiHotelResult[];
    };

    await artifacts.writeJson("serpapi-hotels-response", payload);

    const records =
      payload.properties
        ?.flatMap((property) => {
          const normalized = normalizeSerpApiHotelProperty({
            property,
            request,
          });

          if (!normalized) {
            return [];
          }

          return [
            {
              ...normalized,
              sourceUrl: property.link ?? url.toString(),
            },
          ];
        }) ?? [];

    return {
      records,
      warnings: context.warnings,
      artifacts: context.artifacts,
    };
  }
}
