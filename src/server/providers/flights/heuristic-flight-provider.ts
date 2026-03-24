import { QuoteSourceType } from "@prisma/client";

import type {
  FlightProvider,
  FlightQuoteResult,
  FlightSearchRequest,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineMiles(input: {
  lat1: number;
  lon1: number;
  lat2: number;
  lon2: number;
}) {
  const earthRadiusMi = 3958.8;
  const deltaLat = degreesToRadians(input.lat2 - input.lat1);
  const deltaLon = degreesToRadians(input.lon2 - input.lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(degreesToRadians(input.lat1)) *
      Math.cos(degreesToRadians(input.lat2)) *
      Math.sin(deltaLon / 2) ** 2;
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusMi * c;
}

const demandMultipliers: Record<string, number> = {
  coachella: 1.22,
  "outside-lands": 1.16,
  lollapalooza: 1.14,
  "camp-flog-gnaw": 1.12,
  "shaky-knees": 1.05,
  "just-like-heaven": 1.03,
};

export class HeuristicFlightEstimatorProvider implements FlightProvider {
  key = "heuristic-flight-estimator";

  async collectFlightQuotes(
    request: FlightSearchRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<FlightQuoteResult>> {
    if (
      request.originLatitude === undefined ||
      request.originLongitude === undefined ||
      request.destinationLatitude === undefined ||
      request.destinationLongitude === undefined
    ) {
      context.warnings.push({
        code: "flight_distance_missing",
        message:
          "Heuristic flight estimate needs origin and destination coordinates.",
      });

      return {
        records: [],
        warnings: context.warnings,
        artifacts: context.artifacts,
      };
    }

    const distanceMiles = haversineMiles({
      lat1: request.originLatitude,
      lon1: request.originLongitude,
      lat2: request.destinationLatitude,
      lon2: request.destinationLongitude,
    });
    const directPremium = request.maxLayovers === 0 ? 1.12 : 1;
    const redEyeDiscount = request.redEyeOk ? 0.97 : 1;
    const demandMultiplier = request.festivalSlug
      ? demandMultipliers[request.festivalSlug] ?? 1.05
      : 1.05;
    const perTravelerAmount = (95 + distanceMiles * 0.16) * directPremium * redEyeDiscount * demandMultiplier;
    const totalAmount = Number((perTravelerAmount * request.travelers).toFixed(2));

    const observedAt = new Date().toISOString();
    const templates = [
      {
        name: "cheapest",
        multiplier: 0.9,
        layovers: request.maxLayovers === 0 ? 0 : 1,
      },
      {
        name: "balanced",
        multiplier: 1,
        layovers: Math.min(request.maxLayovers, 1),
      },
      {
        name: "convenience",
        multiplier: 1.18,
        layovers: 0,
      },
    ];

    return {
      records: templates.map((template) => ({
        rawProviderName: "Festival Companion heuristic airfare model",
        normalizedProviderName: "heuristic_airfare",
        amount: Number((totalAmount * template.multiplier).toFixed(2)),
        currency: request.currency,
        taxesIncluded: true,
        sourceUrl: "https://festival-companion.local/methodology/flights",
        sourceType: QuoteSourceType.ESTIMATE,
        observedAt,
        confidence: 0.41,
        notes:
          "Conservative airfare estimate based on straight-line distance, event demand multiplier, layover preference, and traveler count.",
        rawPayload: {
          distanceMiles,
          directPremium,
          redEyeDiscount,
          demandMultiplier,
          template: template.name,
        },
        itinerarySummary: `${request.originIata} -> ${request.destinationIata} ${template.name} heuristic roundtrip`,
        deepLinkUrl: null,
        layoverCount: template.layovers,
        isRedEye: false,
        isValidForAttendance: template.layovers <= request.maxLayovers,
      })),
      warnings: context.warnings,
      artifacts: context.artifacts,
    };
  }
}
