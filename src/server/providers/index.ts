import type {
  FestivalMetadataProvider,
  FlightProvider,
  GroundTransportProvider,
  HotelProvider,
  ProviderContext,
} from "@/server/providers/shared/types";
import { OfficialFestivalSiteProvider, TicketmasterDiscoveryProvider } from "@/server/providers/festivals";
import {
  AmadeusFlightProvider,
  HeuristicFlightEstimatorProvider,
  SkyscannerPlaywrightProvider,
} from "@/server/providers/flights";
import { OpenRouteGroundTransportProvider } from "@/server/providers/ground";
import {
  BookingPlaywrightProvider,
  GoogleHotelsSerpApiProvider,
  HeuristicHotelEstimatorProvider,
} from "@/server/providers/hotels";

export function createProviderContext(providerKey: string, runId?: string): ProviderContext {
  return {
    runId: runId ?? `manual-${Date.now()}`,
    providerKey,
    requestedAt: new Date().toISOString(),
    artifacts: [],
    warnings: [],
  };
}

export function getFestivalMetadataProviders(): FestivalMetadataProvider[] {
  return [new TicketmasterDiscoveryProvider(), new OfficialFestivalSiteProvider()];
}

export function getFlightProviders(): FlightProvider[] {
  return [
    new AmadeusFlightProvider(),
    new SkyscannerPlaywrightProvider(),
    new HeuristicFlightEstimatorProvider(),
  ];
}

export function getHotelProviders(): HotelProvider[] {
  return [
    new GoogleHotelsSerpApiProvider(),
    new BookingPlaywrightProvider(),
    new HeuristicHotelEstimatorProvider(),
  ];
}

export function getGroundTransportProviders(): GroundTransportProvider[] {
  return [new OpenRouteGroundTransportProvider()];
}
