import { HotelClass, QuoteSourceType } from "@prisma/client";

import type {
  HotelProvider,
  HotelQuoteResult,
  HotelSearchRequest,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

const nightlyBaseByFestival: Record<string, Record<HotelClass, number>> = {
  coachella: {
    BUDGET: 220,
    MIDSCALE: 390,
    UPSCALE: 640,
    LUXURY: 950,
  },
  "shaky-knees": {
    BUDGET: 175,
    MIDSCALE: 285,
    UPSCALE: 475,
    LUXURY: 690,
  },
  lollapalooza: {
    BUDGET: 250,
    MIDSCALE: 415,
    UPSCALE: 680,
    LUXURY: 980,
  },
  "outside-lands": {
    BUDGET: 245,
    MIDSCALE: 405,
    UPSCALE: 660,
    LUXURY: 960,
  },
  "just-like-heaven": {
    BUDGET: 190,
    MIDSCALE: 320,
    UPSCALE: 520,
    LUXURY: 760,
  },
  "camp-flog-gnaw": {
    BUDGET: 205,
    MIDSCALE: 340,
    UPSCALE: 560,
    LUXURY: 810,
  },
};

function dayCount(checkInDate: string, checkOutDate: string) {
  const start = new Date(checkInDate);
  const end = new Date(checkOutDate);
  return Math.max(
    Math.round((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)),
    1,
  );
}

function zoneMultiplier(zoneLabel?: string) {
  if (!zoneLabel) {
    return 1;
  }

  const normalized = zoneLabel.toLowerCase();
  if (normalized.includes("onsite") || normalized.includes("old pasadena")) {
    return 1.08;
  }
  if (normalized.includes("airport") || normalized.includes("downtown")) {
    return 0.96;
  }
  return 1;
}

export class HeuristicHotelEstimatorProvider implements HotelProvider {
  key = "heuristic-hotel-estimator";

  async collectHotelQuotes(
    request: HotelSearchRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<HotelQuoteResult>> {
    const hotelClass = request.hotelClass ?? HotelClass.MIDSCALE;
    const nights = dayCount(request.checkInDate, request.checkOutDate);
    const nightlyBase =
      nightlyBaseByFestival[request.festivalSlug ?? ""]?.[hotelClass] ?? 300;
    const nightlyAmount = Number(
      (nightlyBase * zoneMultiplier(request.hotelZoneLabel)).toFixed(2),
    );

    const observedAt = new Date().toISOString();
    const sampleMultipliers = [0.78, 0.9, 1, 1.12, 1.28];

    return {
      records: sampleMultipliers.map((multiplier, index) => {
        const sampledNightly = Number((nightlyAmount * multiplier).toFixed(2));
        return {
          rawProviderName: "Festival Companion heuristic lodging model",
          normalizedProviderName: "heuristic_hotel",
          amount: Number((sampledNightly * nights * request.rooms).toFixed(2)),
          currency: request.currency,
          taxesIncluded: false,
          sourceUrl: "https://festival-companion.local/methodology/hotels",
          sourceType: QuoteSourceType.ESTIMATE,
          observedAt,
          confidence: 0.44,
          notes:
            "Conservative nightly lodging estimate using festival-level base rates, requested hotel class, room count, and zone multiplier.",
          rawPayload: {
            festivalSlug: request.festivalSlug,
            hotelClass,
            nightlyBase,
            zoneMultiplier: zoneMultiplier(request.hotelZoneLabel),
            nights,
            sampleMultiplier: multiplier,
          },
          hotelName: `${request.destinationLabel} heuristic sample ${index + 1}`,
          zoneLabel: request.hotelZoneLabel ?? request.destinationLabel,
          checkIn: request.checkInDate,
          checkOut: request.checkOutDate,
          nightlyAmount: sampledNightly,
        } satisfies HotelQuoteResult;
      }),
      warnings: context.warnings,
      artifacts: context.artifacts,
    };
  }
}
