import {
  HotelClass,
  QuoteSourceType,
  SurgePreset,
  TransportMode,
} from "@prisma/client";

export type CollectionArtifact = {
  kind: "screenshot" | "html" | "json" | "log";
  label: string;
  path: string;
};

export type ProviderWarning = {
  code: string;
  message: string;
};

export type ProviderContext = {
  runId: string;
  providerKey: string;
  requestedAt: string;
  artifacts: CollectionArtifact[];
  warnings: ProviderWarning[];
};

export type BaseQuoteRecord = {
  rawProviderName: string;
  normalizedProviderName: string;
  amount: number;
  currency: string;
  taxesIncluded?: boolean | null;
  sourceUrl: string;
  sourceType: QuoteSourceType;
  observedAt: string;
  confidence: number;
  notes?: string | null;
  snapshotPath?: string | null;
  selectorLog?: string | null;
  rawPayload?: unknown;
};

export type FestivalMetadataObservation = {
  sourceUrl: string;
  observedAt: string;
  confidence: number;
  normalizedStatus?: "confirmed" | "tentative";
  normalizedDateSpans?: Array<{
    label?: string;
    startDate: string | null;
    endDate: string | null;
  }>;
  rawTitle?: string | null;
  rawDateText?: string | null;
  rawVenueText?: string | null;
  notes?: string | null;
};

export type FlightSearchRequest = {
  originIata: string;
  destinationIata: string;
  departureDate: string;
  returnDate: string;
  travelers: number;
  redEyeOk: boolean;
  maxLayovers: number;
  originLatitude?: number;
  originLongitude?: number;
  destinationLatitude?: number;
  destinationLongitude?: number;
  festivalSlug?: string;
  arrivalByIso?: string;
  departAfterIso?: string;
  currency: string;
};

export type FlightQuoteResult = BaseQuoteRecord & {
  itinerarySummary: string;
  deepLinkUrl?: string | null;
  outboundDepartAt?: string | null;
  outboundArriveAt?: string | null;
  returnDepartAt?: string | null;
  returnArriveAt?: string | null;
  totalDurationMinutes?: number | null;
  layoverCount?: number | null;
  isRedEye?: boolean;
  isValidForAttendance: boolean;
};

export type HotelSearchRequest = {
  destinationLabel: string;
  checkInDate: string;
  checkOutDate: string;
  latitude?: number;
  longitude?: number;
  festivalSlug?: string;
  hotelClass?: HotelClass;
  hotelZoneLabel?: string;
  travelers: number;
  rooms: number;
  currency: string;
};

export type HotelQuoteResult = BaseQuoteRecord & {
  hotelName?: string | null;
  zoneLabel: string;
  checkIn: string;
  checkOut: string;
  nightlyAmount?: number | null;
  latitude?: number | null;
  longitude?: number | null;
  distanceToVenueMi?: number | null;
  driveMinutesToVenue?: number | null;
  deepLinkUrl?: string | null;
};

export type GroundTransportRequest = {
  originLabel: string;
  originLatitude: number;
  originLongitude: number;
  destinationLabel: string;
  destinationLatitude: number;
  destinationLongitude: number;
  currency: string;
  surgePreset: SurgePreset;
  transportMode: TransportMode;
  tripCount?: number;
};

export type GroundTransportResult = BaseQuoteRecord & {
  segmentLabel: string;
  distanceMi?: number | null;
  durationMinutes?: number | null;
  tripCount: number;
  baseFareAmount?: number | null;
  estimatorAssumptions?: Record<string, unknown>;
};

export type ProviderRunResult<T> = {
  records: T[];
  warnings: ProviderWarning[];
  artifacts: CollectionArtifact[];
};

export interface FestivalMetadataProvider {
  key: string;
  collectFestivalMetadata(
    url: string,
    context: ProviderContext,
  ): Promise<ProviderRunResult<FestivalMetadataObservation>>;
}

export interface FlightProvider {
  key: string;
  collectFlightQuotes(
    request: FlightSearchRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<FlightQuoteResult>>;
}

export interface HotelProvider {
  key: string;
  collectHotelQuotes(
    request: HotelSearchRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<HotelQuoteResult>>;
}

export interface GroundTransportProvider {
  key: string;
  collectGroundTransport(
    request: GroundTransportRequest,
    context: ProviderContext,
  ): Promise<ProviderRunResult<GroundTransportResult>>;
}
