import { QuoteSourceType } from "@prisma/client";

import { ArtifactStore } from "@/server/providers/shared/artifacts";
import type {
  GroundTransportProvider,
  GroundTransportRequest,
  GroundTransportResult,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

type OsrmRouteResponse = {
  code: string;
  routes?: Array<{
    distance: number;
    duration: number;
  }>;
};

function surgeMultiplier(preset: GroundTransportRequest["surgePreset"]) {
  if (preset === "MILD") {
    return 1.15;
  }

  if (preset === "AGGRESSIVE") {
    return 1.75;
  }

  return 1.35;
}

function estimateRideshareAmount(input: {
  distanceMi: number;
  durationMinutes: number;
  tripCount: number;
  surge: number;
}) {
  const baseFare = 6.5;
  const perMile = 1.7;
  const perMinute = 0.38;

  const singleTrip =
    (baseFare + input.distanceMi * perMile + input.durationMinutes * perMinute) *
    input.surge;

  return Number((singleTrip * input.tripCount).toFixed(2));
}

export class OpenRouteGroundTransportProvider implements GroundTransportProvider {
  key = "osrm-ground-estimator";

  async collectGroundTransport(
    request: GroundTransportRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<GroundTransportResult>> {
    const artifacts = new ArtifactStore(context);
    const routeUrl = new URL(
      `https://router.project-osrm.org/route/v1/driving/${request.originLongitude},${request.originLatitude};${request.destinationLongitude},${request.destinationLatitude}`,
    );
    routeUrl.searchParams.set("overview", "false");
    routeUrl.searchParams.set("alternatives", "false");
    routeUrl.searchParams.set("steps", "false");

    const response = await fetch(routeUrl.toString(), { cache: "no-store" });
    const payload = (await response.json()) as OsrmRouteResponse;
    await artifacts.writeJson("osrm-route-response", payload);

    const route = payload.routes?.[0];

    if (!route) {
      context.warnings.push({
        code: "osrm_route_missing",
        message: `No route returned for ${request.originLabel} -> ${request.destinationLabel}`,
      });

      return {
        records: [],
        warnings: context.warnings,
        artifacts: context.artifacts,
      };
    }

    const distanceMi = route.distance * 0.000621371;
    const durationMinutes = route.duration / 60;
    const tripCount = request.tripCount ?? 1;
    const surge = surgeMultiplier(request.surgePreset);
    const amount = estimateRideshareAmount({
      distanceMi,
      durationMinutes,
      tripCount,
      surge,
    });

    const record: GroundTransportResult = {
      rawProviderName: "OSRM routing + Festival Companion heuristic rideshare",
      normalizedProviderName: "osrm_heuristic_rideshare",
      amount,
      currency: request.currency,
      taxesIncluded: false,
      sourceUrl: routeUrl.toString(),
      sourceType: QuoteSourceType.ESTIMATE,
      observedAt: new Date().toISOString(),
      confidence: 0.78,
      notes:
        "Routing distance and duration come from public OSRM data. Fare is a conservative rideshare estimate using configured per-mile, per-minute, and surge assumptions.",
      rawPayload: payload,
      segmentLabel: `${request.originLabel} to ${request.destinationLabel}`,
      distanceMi: Number(distanceMi.toFixed(1)),
      durationMinutes: Math.round(durationMinutes),
      tripCount,
      baseFareAmount: Number((amount / tripCount).toFixed(2)),
      estimatorAssumptions: {
        transportMode: request.transportMode,
        surgePreset: request.surgePreset,
        surgeMultiplier: surge,
        baseFare: 6.5,
        perMile: 1.7,
        perMinute: 0.38,
      },
    };

    return {
      records: [record],
      warnings: context.warnings,
      artifacts: context.artifacts,
    };
  }
}
