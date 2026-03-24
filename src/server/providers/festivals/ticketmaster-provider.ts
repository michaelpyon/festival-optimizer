import { env } from "@/lib/env";
import { ArtifactStore } from "@/server/providers/shared/artifacts";
import type {
  FestivalMetadataObservation,
  FestivalMetadataProvider,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

type TicketmasterEvent = {
  dates?: {
    start?: {
      localDate?: string;
    };
    end?: {
      localDate?: string;
    };
  };
  name?: string;
  url?: string;
  _embedded?: {
    venues?: Array<{
      name?: string;
    }>;
  };
};

export class TicketmasterDiscoveryProvider implements FestivalMetadataProvider {
  key = "ticketmaster-discovery";

  async collectFestivalMetadata(
    keyword: string,
    context: ProviderContext,
  ): Promise<ProviderRunResult<FestivalMetadataObservation>> {
    if (!env.TICKETMASTER_API_KEY) {
      return {
        records: [],
        warnings: [
          {
            code: "ticketmaster_not_configured",
            message: "TICKETMASTER_API_KEY is not configured.",
          },
        ],
        artifacts: [],
      };
    }

    const artifacts = new ArtifactStore(context);
    const url = new URL("https://app.ticketmaster.com/discovery/v2/events.json");
    url.searchParams.set("apikey", env.TICKETMASTER_API_KEY);
    url.searchParams.set("keyword", keyword);
    url.searchParams.set("classificationName", "music");
    url.searchParams.set("size", "5");

    const response = await fetch(url.toString(), { cache: "no-store" });
    const payload = (await response.json()) as {
      _embedded?: {
        events?: TicketmasterEvent[];
      };
    };

    await artifacts.writeJson("ticketmaster-response", payload);

    const records =
      payload._embedded?.events?.map((event) => ({
        sourceUrl: event.url ?? url.toString(),
        observedAt: new Date().toISOString(),
        confidence: 0.76,
        normalizedStatus: event.dates?.start?.localDate
          ? ("confirmed" as const)
          : ("tentative" as const),
        normalizedDateSpans: [
          {
            startDate: event.dates?.start?.localDate ?? null,
            endDate: event.dates?.end?.localDate ?? event.dates?.start?.localDate ?? null,
          },
        ],
        rawTitle: event.name ?? null,
        rawDateText: event.dates?.start?.localDate ?? null,
        rawVenueText: event._embedded?.venues?.[0]?.name ?? null,
        notes: "Ticketmaster Discovery API event match.",
      })) ?? [];

    return {
      records,
      warnings: context.warnings,
      artifacts: context.artifacts,
    };
  }
}
