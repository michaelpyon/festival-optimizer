import { QuoteSourceType } from "@prisma/client";

import { env } from "@/lib/env";
import { ArtifactStore } from "@/server/providers/shared/artifacts";
import type {
  FlightProvider,
  FlightQuoteResult,
  FlightSearchRequest,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

type AmadeusTokenResponse = {
  access_token: string;
  expires_in: number;
};

type AmadeusOfferResponse = {
  data?: Array<{
    price?: {
      total?: string;
      currency?: string;
      grandTotal?: string;
    };
    itineraries?: Array<{
      duration?: string;
      segments?: Array<{
        departure?: { at?: string };
        arrival?: { at?: string };
      }>;
    }>;
  }>;
};

type AmadeusOffer = NonNullable<AmadeusOfferResponse["data"]>[number];

let cachedToken:
  | {
      token: string;
      expiresAt: number;
    }
  | undefined;

function parseDuration(duration?: string) {
  if (!duration) {
    return null;
  }

  const hours = Number(duration.match(/(\d+)H/)?.[1] ?? 0);
  const minutes = Number(duration.match(/(\d+)M/)?.[1] ?? 0);
  return hours * 60 + minutes;
}

function isRedEye(iso?: string | null) {
  if (!iso) {
    return false;
  }

  const date = new Date(iso);
  const hour = date.getHours();
  return hour >= 21 || hour <= 5;
}

function totalLayovers(response: AmadeusOffer) {
  return (
    response.itineraries?.reduce((sum, itinerary) => {
      return sum + Math.max((itinerary.segments?.length ?? 1) - 1, 0);
    }, 0) ?? 0
  );
}

export class AmadeusFlightProvider implements FlightProvider {
  key = "amadeus";

  private async getToken() {
    if (
      cachedToken &&
      Date.now() < cachedToken.expiresAt &&
      cachedToken.token.length > 0
    ) {
      return cachedToken.token;
    }

    if (!env.AMADEUS_CLIENT_ID || !env.AMADEUS_CLIENT_SECRET) {
      throw new Error("Amadeus credentials are not configured.");
    }

    const tokenResponse = await fetch(
      "https://test.api.amadeus.com/v1/security/oauth2/token",
      {
        method: "POST",
        headers: {
          "content-type": "application/x-www-form-urlencoded",
        },
        body: new URLSearchParams({
          grant_type: "client_credentials",
          client_id: env.AMADEUS_CLIENT_ID,
          client_secret: env.AMADEUS_CLIENT_SECRET,
        }),
      },
    );

    const payload = (await tokenResponse.json()) as AmadeusTokenResponse;
    cachedToken = {
      token: payload.access_token,
      expiresAt: Date.now() + payload.expires_in * 1000 - 60_000,
    };

    return payload.access_token;
  }

  async collectFlightQuotes(
    request: FlightSearchRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<FlightQuoteResult>> {
    if (!env.AMADEUS_CLIENT_ID || !env.AMADEUS_CLIENT_SECRET) {
      return {
        records: [],
        warnings: [
          {
            code: "amadeus_not_configured",
            message: "AMADEUS_CLIENT_ID and AMADEUS_CLIENT_SECRET are required.",
          },
        ],
        artifacts: [],
      };
    }

    const artifacts = new ArtifactStore(context);
    const token = await this.getToken();
    const url = new URL("https://test.api.amadeus.com/v2/shopping/flight-offers");
    url.searchParams.set("originLocationCode", request.originIata);
    url.searchParams.set("destinationLocationCode", request.destinationIata);
    url.searchParams.set("departureDate", request.departureDate);
    url.searchParams.set("returnDate", request.returnDate);
    url.searchParams.set("adults", String(request.travelers));
    url.searchParams.set("currencyCode", request.currency);
    url.searchParams.set("max", "20");
    if (request.maxLayovers === 0) {
      url.searchParams.set("nonStop", "true");
    }

    const response = await fetch(url.toString(), {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      cache: "no-store",
    });

    const payload = (await response.json()) as AmadeusOfferResponse;
    await artifacts.writeJson("amadeus-flight-offers", payload);

    const records =
      payload.data
        ?.map((offer) => {
          const outbound = offer.itineraries?.[0];
          const inbound = offer.itineraries?.[1];
          const outboundArriveAt = outbound?.segments?.at(-1)?.arrival?.at ?? null;
          const inboundDepartAt = inbound?.segments?.[0]?.departure?.at ?? null;
          const layoverCount = totalLayovers(offer);
          const validArrival =
            !request.arrivalByIso ||
            (outboundArriveAt ? outboundArriveAt <= request.arrivalByIso : false);
          const validReturn =
            !request.departAfterIso ||
            (inboundDepartAt ? inboundDepartAt >= request.departAfterIso : false);

          return {
            rawProviderName: "Amadeus Self-Service API",
            normalizedProviderName: "amadeus",
            amount: Number(
              offer.price?.grandTotal ?? offer.price?.total ?? "0",
            ),
            currency: offer.price?.currency ?? request.currency,
            taxesIncluded: true,
            sourceUrl: url.toString(),
            sourceType: QuoteSourceType.API,
            observedAt: new Date().toISOString(),
            confidence: 0.92,
            notes:
              "Live API fare from Amadeus. Deep linking is not provided by this endpoint.",
            rawPayload: offer,
            itinerarySummary: `${request.originIata} to ${request.destinationIata}`,
            deepLinkUrl: null,
            outboundDepartAt:
              outbound?.segments?.[0]?.departure?.at ?? null,
            outboundArriveAt,
            returnDepartAt: inboundDepartAt,
            returnArriveAt:
              inbound?.segments?.at(-1)?.arrival?.at ?? null,
            totalDurationMinutes:
              (parseDuration(outbound?.duration) ?? 0) +
              (parseDuration(inbound?.duration) ?? 0),
            layoverCount,
            isRedEye: isRedEye(outbound?.segments?.[0]?.departure?.at ?? null),
            isValidForAttendance:
              validArrival &&
              validReturn &&
              layoverCount <= request.maxLayovers &&
              (request.redEyeOk || !isRedEye(outbound?.segments?.[0]?.departure?.at ?? null)),
          } satisfies FlightQuoteResult;
        })
        .filter((record) => record.amount > 0) ?? [];

    return {
      records,
      warnings: context.warnings,
      artifacts: context.artifacts,
    };
  }
}
