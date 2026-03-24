import {
  CostScenarioType,
  HotelClass,
  Prisma,
  QuoteSourceType,
  RoomType,
  SearchPriority,
  SearchRunStatus,
  SurgePreset,
  TransportMode,
} from "@prisma/client";

import { getPrimaryScenarioType } from "@/lib/search-params";
import { prisma } from "@/lib/prisma";
import { geocodePlace } from "@/server/geo/geocode";
import { scoreScenarioConfidence } from "@/server/engine/confidence";
import { inferTravelWindow } from "@/server/engine/date-window";
import { buildRankingReason, buildScenarioNarrative } from "@/server/engine/explain";
import { chooseFestivalAccessPlan } from "@/server/engine/local-transport";
import { applyRelativeCostScores, computeFrictionScore } from "@/server/engine/scoring";
import { average, median, percentile } from "@/server/engine/stats";
import { createProviderContext } from "@/server/providers";
import { AmadeusFlightProvider } from "@/server/providers/flights/amadeus-provider";
import { HeuristicFlightEstimatorProvider } from "@/server/providers/flights/heuristic-flight-provider";
import { OpenRouteGroundTransportProvider } from "@/server/providers/ground/open-route-provider";
import { GoogleHotelsSerpApiProvider } from "@/server/providers/hotels/google-hotels-serpapi-provider";
import { HeuristicHotelEstimatorProvider } from "@/server/providers/hotels/heuristic-hotel-provider";
import type { ProviderContext, ProviderRunResult } from "@/server/providers/shared/types";

export type ComparisonRunInput = {
  sourceCity: string;
  sourceAirport?: string;
  travelers: number;
  roomType: RoomType;
  hotelClass: HotelClass;
  priority: SearchPriority;
  festivalEditionIds: string[];
};

type ScenarioDraft = {
  searchRunId: string;
  festivalEditionId: string;
  scenarioType: CostScenarioType;
  whyRankedHere: string;
  recommendation: string;
  stayStart: Date;
  stayEnd: Date;
  travelDays: number;
  hotelNights: number;
  ticketAmount: number;
  flightAmount: number;
  hotelAmount: number;
  localTransportAmount: number;
  totalAmount: number;
  lowAmount: number;
  highAmount: number;
  costScore: number;
  frictionScore: number;
  overallValueScore: number;
  confidence: number;
  bestForBadge?: string;
  rank?: number | null;
  isRecommended?: boolean;
  assumptions: Record<string, unknown>;
  selectedQuoteIds: Record<string, string | null>;
};

function normalizeAirportCode(value?: string) {
  return value?.trim().toUpperCase() || undefined;
}

function toNumber(value: number | string | { toString(): string } | null | undefined) {
  if (value === null || value === undefined) {
    return 0;
  }

  const amount = Number(typeof value === "object" ? value.toString() : value);
  return Number.isFinite(amount) ? amount : 0;
}

function buildRunLabel(input: Pick<ComparisonRunInput, "sourceCity" | "priority">) {
  const priorityLabel = input.priority.toLowerCase().replaceAll("_", " ");
  return `${input.sourceCity} • ${priorityLabel}`;
}

function roundMoney(value: number) {
  return Number(value.toFixed(2));
}

function roomCountForParty(travelers: number, roomType: RoomType) {
  if (roomType === RoomType.SHARED_ROOM) {
    return Math.max(1, Math.ceil(travelers / 4));
  }

  if (roomType === RoomType.SUITE) {
    return Math.max(1, Math.ceil(travelers / 3));
  }

  return Math.max(1, Math.ceil(travelers / 2));
}

function toJsonValue(
  value: unknown,
): Prisma.InputJsonValue | Prisma.NullableJsonNullValueInput | undefined {
  if (value === undefined) {
    return undefined;
  }

  return value as Prisma.InputJsonValue;
}

function pickBalanced<T>(items: T[], getAmount: (item: T) => number) {
  if (items.length === 0) {
    return null;
  }

  const target = median(items.map((item) => getAmount(item)));
  return (
    [...items].sort(
      (left, right) =>
        Math.abs(getAmount(left) - target) - Math.abs(getAmount(right) - target),
    )[0] ?? null
  );
}

function clampRank(sortedIds: string[], id: string) {
  const index = sortedIds.indexOf(id);
  return index === -1 ? null : index + 1;
}

export function pickDestinationAirportOptions<T extends { priority: number }>(
  options: T[],
  limit = 2,
) {
  return [...options].sort((left, right) => left.priority - right.priority).slice(0, limit);
}

export function resolveFlightPool<
  T extends { quote: { isValidForAttendance: boolean } },
>(quotes: T[]) {
  const validQuotes = quotes.filter(({ quote }) => quote.isValidForAttendance);
  return validQuotes.length > 0 ? validQuotes : quotes;
}

export function summarizeHotelInventory(amounts: number[]) {
  return {
    average: average(amounts),
    median: median(amounts),
    p75: percentile(amounts, 0.75),
    sparse: amounts.length < 5,
  };
}

export async function runComparison(input: ComparisonRunInput) {
  const collectorLog: Array<Record<string, unknown>> = [];
  const runWarnings: Array<Record<string, unknown>> = [];

  const searchRun = await prisma.searchRun.create({
    data: {
      label: buildRunLabel(input),
      status: SearchRunStatus.RUNNING,
      mode: "HYBRID",
    },
  });

  const appendProviderResult = <T>(
    editionId: string,
    providerKey: string,
    result: ProviderRunResult<T>,
  ) => {
    if (result.warnings.length > 0 || result.artifacts.length > 0) {
      collectorLog.push({
        editionId,
        providerKey,
        warnings: result.warnings,
        artifacts: result.artifacts,
      });
    }

    for (const warning of result.warnings) {
      runWarnings.push({
        editionId,
        provider: providerKey,
        code: warning.code,
        message: warning.message,
      });
    }
  };

  const collectSafely = async <T>(inputArgs: {
    editionId: string;
    providerKey: string;
    runSegment: string;
    callback: (context: ProviderContext) => Promise<ProviderRunResult<T>>;
  }) => {
    const context = createProviderContext(inputArgs.providerKey, inputArgs.runSegment);

    try {
      const result = await inputArgs.callback(context);
      appendProviderResult(inputArgs.editionId, inputArgs.providerKey, result);
      return result;
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown provider collection failure.";
      const failure = {
        records: [] as T[],
        warnings: [
          {
            code: `${inputArgs.providerKey}_failed`,
            message,
          },
        ],
        artifacts: context.artifacts,
      };

      appendProviderResult(inputArgs.editionId, inputArgs.providerKey, failure);
      return failure;
    }
  };

  const sourceAirportCode = normalizeAirportCode(input.sourceAirport);
  const knownSourceAirport = sourceAirportCode
    ? await prisma.airport.findUnique({
        where: { iataCode: sourceAirportCode },
      })
    : null;

  const sourceGeo = knownSourceAirport
    ? {
        latitude: knownSourceAirport.latitude,
        longitude: knownSourceAirport.longitude,
        label: `${knownSourceAirport.city} (${knownSourceAirport.iataCode})`,
      }
    : await geocodePlace(input.sourceCity);

  if (!sourceGeo) {
    runWarnings.push({
      provider: "geocoder",
      code: "source_geocode_missing",
      message: `Could not geocode ${input.sourceCity}. Heuristic airfare will be unavailable unless a source airport is provided.`,
    });
  }

  await prisma.userPreference.create({
    data: {
      searchRunId: searchRun.id,
      sourceCity: input.sourceCity,
      sourceAirportId: knownSourceAirport?.id ?? null,
      travelersCount: input.travelers,
      roomType: input.roomType,
      hotelClass: input.hotelClass,
      priority: input.priority,
      surgePreset: SurgePreset.NORMAL,
    },
  });

  const editions = await prisma.festivalEdition.findMany({
    where: {
      id: { in: input.festivalEditionIds },
    },
    include: {
      festival: true,
      location: {
        include: {
          airportOptions: {
            include: {
              airport: true,
            },
            orderBy: { priority: "asc" },
          },
          lodgingZones: {
            orderBy: { convenienceScore: "desc" },
          },
        },
      },
      shuttleOptions: true,
    },
  });

  await prisma.searchRunFestival.createMany({
    data: editions.map((edition, index) => ({
      searchRunId: searchRun.id,
      festivalEditionId: edition.id,
      displayOrder: index,
    })),
  });

  const groundProvider = new OpenRouteGroundTransportProvider();
  const flightApiProvider = new AmadeusFlightProvider();
  const heuristicFlightProvider = new HeuristicFlightEstimatorProvider();
  const hotelApiProvider = new GoogleHotelsSerpApiProvider();
  const heuristicHotelProvider = new HeuristicHotelEstimatorProvider();
  const scenarioDrafts: ScenarioDraft[] = [];
  const selectedFestivalIdsWithScenarios = new Set<string>();

  for (const edition of editions) {
    const travelWindow = inferTravelWindow({
      startsAt: edition.startsAt,
      endsAt: edition.endsAt,
      arrivalBufferHours: edition.defaultArrivalBufferHours,
      departureBufferHours: edition.defaultDepartureBufferHours,
    });

    if (!travelWindow) {
      runWarnings.push({
        editionId: edition.id,
        code: "travel_window_missing",
        message: `${edition.festival.name} is missing confirmed dates, so scenario generation was skipped.`,
      });
      continue;
    }

    const destinationAirportOptions = pickDestinationAirportOptions(
      edition.location.airportOptions,
    );
    const rooms = roomCountForParty(input.travelers, input.roomType);

    const createdFlightQuotes: Array<{
      airportOption: (typeof edition.location.airportOptions)[number];
      quote: Awaited<ReturnType<typeof prisma.flightQuote.create>>;
    }> = [];

    for (const airportOption of destinationAirportOptions) {
      const flightCandidates = [];

      if (sourceAirportCode) {
        const amadeusResult = await collectSafely({
          editionId: edition.id,
          providerKey: flightApiProvider.key,
          runSegment: `${searchRun.id}-${edition.id}-${airportOption.airport.iataCode}-amadeus`,
          callback: (context) =>
            flightApiProvider.collectFlightQuotes(
              {
                originIata: sourceAirportCode,
                destinationIata: airportOption.airport.iataCode,
                departureDate: travelWindow.departureDate,
                returnDate: travelWindow.returnDate,
                travelers: input.travelers,
                redEyeOk: false,
                maxLayovers: 1,
                arrivalByIso: travelWindow.arrivalBy.toISOString(),
                departAfterIso: travelWindow.departAfter.toISOString(),
                currency: "USD",
              },
              context,
            ),
        });

        flightCandidates.push(...amadeusResult.records);
      }

      if (sourceGeo) {
        const heuristicFlightResult = await collectSafely({
          editionId: edition.id,
          providerKey: heuristicFlightProvider.key,
          runSegment: `${searchRun.id}-${edition.id}-${airportOption.airport.iataCode}-heuristic-flight`,
          callback: (context) =>
            heuristicFlightProvider.collectFlightQuotes(
              {
                originIata: sourceAirportCode ?? input.sourceCity,
                destinationIata: airportOption.airport.iataCode,
                departureDate: travelWindow.departureDate,
                returnDate: travelWindow.returnDate,
                travelers: input.travelers,
                redEyeOk: false,
                maxLayovers: 1,
                currency: "USD",
                originLatitude: sourceGeo.latitude,
                originLongitude: sourceGeo.longitude,
                destinationLatitude: airportOption.airport.latitude,
                destinationLongitude: airportOption.airport.longitude,
                festivalSlug: edition.festival.slug,
              },
              context,
            ),
        });

        flightCandidates.push(...heuristicFlightResult.records);
      }

      for (const quote of flightCandidates) {
        const createdQuote = await prisma.flightQuote.create({
          data: {
            searchRunId: searchRun.id,
            festivalEditionId: edition.id,
            sourceAirportId: knownSourceAirport?.id ?? null,
            destinationAirportId: airportOption.airport.id,
            itinerarySummary: quote.itinerarySummary,
            deepLinkUrl: quote.deepLinkUrl ?? null,
            outboundDepartAt: quote.outboundDepartAt ?? null,
            outboundArriveAt: quote.outboundArriveAt ?? null,
            returnDepartAt: quote.returnDepartAt ?? null,
            returnArriveAt: quote.returnArriveAt ?? null,
            totalDurationMinutes: quote.totalDurationMinutes ?? null,
            layoverCount: quote.layoverCount ?? 0,
            isRedEye: quote.isRedEye ?? false,
            isValidForAttendance: quote.isValidForAttendance,
            rawProviderName: quote.rawProviderName,
            normalizedProviderName: quote.normalizedProviderName,
            amount: quote.amount,
            currency: quote.currency,
            taxesIncluded: quote.taxesIncluded ?? null,
            sourceUrl: quote.sourceUrl,
            sourceType: quote.sourceType,
            observedAt: new Date(quote.observedAt),
            confidence: quote.confidence,
            notes: quote.notes ?? null,
            rawPayload: toJsonValue(quote.rawPayload),
            snapshotPath: quote.snapshotPath ?? null,
            selectorLog: quote.selectorLog ?? null,
          },
        });

        createdFlightQuotes.push({
          airportOption,
          quote: createdQuote,
        });
      }
    }

    if (createdFlightQuotes.length === 0) {
      runWarnings.push({
        editionId: edition.id,
        code: "flight_quotes_missing",
        message: `${edition.festival.name} produced no workable flight data from the current inputs.`,
      });
      continue;
    }

    const createdHotelQuotes: Array<{
      zone: (typeof edition.location.lodgingZones)[number];
      quote: Awaited<ReturnType<typeof prisma.hotelQuote.create>>;
    }> = [];

    for (const zone of edition.location.lodgingZones) {
      const apiResult = await collectSafely({
        editionId: edition.id,
        providerKey: hotelApiProvider.key,
        runSegment: `${searchRun.id}-${edition.id}-${zone.id}-hotel-api`,
        callback: (context) =>
          hotelApiProvider.collectHotelQuotes(
            {
              destinationLabel: `${zone.label}, ${edition.location.city}`,
              checkInDate: travelWindow.departureDate,
              checkOutDate: travelWindow.returnDate,
              latitude: zone.centroidLatitude ?? edition.location.latitude,
              longitude: zone.centroidLongitude ?? edition.location.longitude,
              festivalSlug: edition.festival.slug,
              hotelClass: input.hotelClass,
              hotelZoneLabel: zone.label,
              travelers: input.travelers,
              rooms,
              currency: "USD",
            },
            context,
          ),
      });

      const hotelCandidates = [...apiResult.records];

      if (apiResult.records.length < 4) {
        const heuristicHotelResult = await collectSafely({
          editionId: edition.id,
          providerKey: heuristicHotelProvider.key,
          runSegment: `${searchRun.id}-${edition.id}-${zone.id}-heuristic-hotel`,
          callback: (context) =>
            heuristicHotelProvider.collectHotelQuotes(
              {
                destinationLabel: `${zone.label}, ${edition.location.city}`,
                checkInDate: travelWindow.departureDate,
                checkOutDate: travelWindow.returnDate,
                latitude: zone.centroidLatitude ?? edition.location.latitude,
                longitude: zone.centroidLongitude ?? edition.location.longitude,
                festivalSlug: edition.festival.slug,
                hotelClass: input.hotelClass,
                hotelZoneLabel: zone.label,
                travelers: input.travelers,
                rooms,
                currency: "USD",
              },
              context,
            ),
        });

        hotelCandidates.push(...heuristicHotelResult.records);
      }

      for (const quote of hotelCandidates) {
        const createdQuote = await prisma.hotelQuote.create({
          data: {
            searchRunId: searchRun.id,
            festivalEditionId: edition.id,
            lodgingZoneId: zone.id,
            hotelName: quote.hotelName ?? null,
            zoneLabel: quote.zoneLabel,
            inventoryClass: input.hotelClass,
            latitude: quote.latitude ?? zone.centroidLatitude ?? null,
            longitude: quote.longitude ?? zone.centroidLongitude ?? null,
            distanceToVenueMi: quote.distanceToVenueMi ?? zone.distanceToVenueMi ?? null,
            driveMinutesToVenue: quote.driveMinutesToVenue ?? zone.typicalDriveMin ?? null,
            checkIn: new Date(`${quote.checkIn}T00:00:00.000Z`),
            checkOut: new Date(`${quote.checkOut}T00:00:00.000Z`),
            nightlyAmount: quote.nightlyAmount ?? null,
            amount: quote.amount,
            currency: quote.currency,
            taxesIncluded: quote.taxesIncluded ?? null,
            deepLinkUrl: quote.deepLinkUrl ?? null,
            rawProviderName: quote.rawProviderName,
            normalizedProviderName: quote.normalizedProviderName,
            sourceUrl: quote.sourceUrl,
            sourceType: quote.sourceType,
            observedAt: new Date(quote.observedAt),
            confidence: quote.confidence,
            notes: quote.notes ?? null,
            rawPayload: toJsonValue(quote.rawPayload),
            snapshotPath: quote.snapshotPath ?? null,
            selectorLog: quote.selectorLog ?? null,
          },
        });

        createdHotelQuotes.push({
          zone,
          quote: createdQuote,
        });
      }
    }

    if (createdHotelQuotes.length === 0) {
      runWarnings.push({
        editionId: edition.id,
        code: "hotel_quotes_missing",
        message: `${edition.festival.name} produced no hotel inventory for the required stay window.`,
      });
      continue;
    }

    const createdGroundQuotes: Array<{
      zoneLabel: string;
      key: "airportTransfer" | "directCommute" | "shuttleFare" | "shuttleAccess";
      shuttleOptionId?: string;
      quote: Awaited<ReturnType<typeof prisma.groundTransportQuote.create>>;
    }> = [];

    const primaryAirport = destinationAirportOptions[0]?.airport;

    for (const zone of edition.location.lodgingZones) {
      const zoneLatitude = zone.centroidLatitude ?? edition.location.latitude;
      const zoneLongitude = zone.centroidLongitude ?? edition.location.longitude;

      if (primaryAirport) {
        const airportTransferResult = await collectSafely({
          editionId: edition.id,
          providerKey: groundProvider.key,
          runSegment: `${searchRun.id}-${edition.id}-${zone.id}-airport-transfer`,
          callback: (context) =>
            groundProvider.collectGroundTransport(
              {
                originLabel: primaryAirport.iataCode,
                originLatitude: primaryAirport.latitude,
                originLongitude: primaryAirport.longitude,
                destinationLabel: zone.label,
                destinationLatitude: zoneLatitude,
                destinationLongitude: zoneLongitude,
                currency: "USD",
                surgePreset: SurgePreset.MILD,
                transportMode: TransportMode.RIDESHARE,
                tripCount: 2,
              },
              context,
            ),
        });

        for (const quote of airportTransferResult.records) {
          const createdQuote = await prisma.groundTransportQuote.create({
            data: {
              searchRunId: searchRun.id,
              festivalEditionId: edition.id,
              transportType: "AIRPORT_TO_LODGING",
              mode: TransportMode.RIDESHARE,
              segmentLabel: `${zone.label} airport transfer`,
              originLabel: primaryAirport.iataCode,
              destinationLabel: zone.label,
              distanceMi: quote.distanceMi ?? null,
              durationMinutes: quote.durationMinutes ?? null,
              tripCount: quote.tripCount,
              surgePreset: SurgePreset.MILD,
              baseFareAmount: quote.baseFareAmount ?? null,
              amount: quote.amount,
              currency: quote.currency,
              taxesIncluded: quote.taxesIncluded ?? null,
              rawProviderName: quote.rawProviderName,
              normalizedProviderName: quote.normalizedProviderName,
              sourceUrl: quote.sourceUrl,
              sourceType: quote.sourceType,
              observedAt: new Date(quote.observedAt),
              confidence: quote.confidence,
              notes: quote.notes ?? null,
              rawPayload: toJsonValue(quote.rawPayload),
              estimatorAssumptions: toJsonValue(quote.estimatorAssumptions),
            },
          });

          createdGroundQuotes.push({
            zoneLabel: zone.label,
            key: "airportTransfer",
            quote: createdQuote,
          });
        }
      }

      const commuteResult = await collectSafely({
        editionId: edition.id,
        providerKey: groundProvider.key,
        runSegment: `${searchRun.id}-${edition.id}-${zone.id}-commute`,
        callback: (context) =>
          groundProvider.collectGroundTransport(
            {
              originLabel: zone.label,
              originLatitude: zoneLatitude,
              originLongitude: zoneLongitude,
              destinationLabel: edition.location.venue,
              destinationLatitude: edition.location.latitude,
              destinationLongitude: edition.location.longitude,
              currency: "USD",
              surgePreset: SurgePreset.NORMAL,
              transportMode: TransportMode.RIDESHARE,
              tripCount: travelWindow.festivalDays * 2,
            },
            context,
          ),
      });

      for (const quote of commuteResult.records) {
        const createdQuote = await prisma.groundTransportQuote.create({
          data: {
            searchRunId: searchRun.id,
            festivalEditionId: edition.id,
            transportType: "LODGING_TO_FESTIVAL",
            mode: TransportMode.RIDESHARE,
            segmentLabel: `${zone.label} festival commute`,
            originLabel: zone.label,
            destinationLabel: edition.location.venue,
            distanceMi: quote.distanceMi ?? null,
            durationMinutes: quote.durationMinutes ?? null,
            tripCount: quote.tripCount,
            surgePreset: SurgePreset.NORMAL,
            baseFareAmount: quote.baseFareAmount ?? null,
            amount: quote.amount,
            currency: quote.currency,
            taxesIncluded: quote.taxesIncluded ?? null,
            rawProviderName: quote.rawProviderName,
            normalizedProviderName: quote.normalizedProviderName,
            sourceUrl: quote.sourceUrl,
              sourceType: quote.sourceType,
              observedAt: new Date(quote.observedAt),
              confidence: quote.confidence,
              notes: quote.notes ?? null,
              rawPayload: toJsonValue(quote.rawPayload),
              estimatorAssumptions: toJsonValue(quote.estimatorAssumptions),
            },
          });

        createdGroundQuotes.push({
          zoneLabel: zone.label,
          key: "directCommute",
          quote: createdQuote,
        });
      }

      for (const shuttle of edition.shuttleOptions) {
        const shuttleStopLatitude = shuttle.stopLatitude;
        const shuttleStopLongitude = shuttle.stopLongitude;

        if (shuttleStopLatitude !== null && shuttleStopLongitude !== null) {
          const shuttleAccessResult = await collectSafely({
            editionId: edition.id,
            providerKey: groundProvider.key,
            runSegment: `${searchRun.id}-${edition.id}-${zone.id}-${shuttle.id}-shuttle-access`,
            callback: (context) =>
              groundProvider.collectGroundTransport(
                {
                  originLabel: zone.label,
                  originLatitude: zoneLatitude,
                  originLongitude: zoneLongitude,
                  destinationLabel: shuttle.stopName ?? shuttle.name,
                  destinationLatitude: shuttleStopLatitude,
                  destinationLongitude: shuttleStopLongitude,
                  currency: "USD",
                  surgePreset: SurgePreset.MILD,
                  transportMode: TransportMode.RIDESHARE,
                  tripCount: travelWindow.festivalDays * 2,
                },
                context,
              ),
          });

          for (const quote of shuttleAccessResult.records) {
            const createdQuote = await prisma.groundTransportQuote.create({
              data: {
                searchRunId: searchRun.id,
                festivalEditionId: edition.id,
                shuttleOptionId: shuttle.id,
                transportType: "LODGING_TO_FESTIVAL",
                mode: TransportMode.RIDESHARE,
                segmentLabel: `${zone.label} shuttle access`,
                originLabel: zone.label,
                destinationLabel: shuttle.stopName ?? shuttle.name,
                distanceMi: quote.distanceMi ?? null,
                durationMinutes: quote.durationMinutes ?? null,
                tripCount: quote.tripCount,
                surgePreset: SurgePreset.MILD,
                baseFareAmount: quote.baseFareAmount ?? null,
                amount: quote.amount,
                currency: quote.currency,
                taxesIncluded: quote.taxesIncluded ?? null,
                rawProviderName: quote.rawProviderName,
                normalizedProviderName: quote.normalizedProviderName,
                sourceUrl: quote.sourceUrl,
                sourceType: quote.sourceType,
                observedAt: new Date(quote.observedAt),
                confidence: quote.confidence,
                notes: quote.notes ?? null,
                rawPayload: toJsonValue(quote.rawPayload),
                estimatorAssumptions: toJsonValue(quote.estimatorAssumptions),
              },
            });

            createdGroundQuotes.push({
              zoneLabel: zone.label,
              key: "shuttleAccess",
              shuttleOptionId: shuttle.id,
              quote: createdQuote,
            });
          }
        }

        const shuttleFareAmount = toNumber(shuttle.fareAmount?.toString()) * input.travelers;
        const createdQuote = await prisma.groundTransportQuote.create({
          data: {
            searchRunId: searchRun.id,
            festivalEditionId: edition.id,
            shuttleOptionId: shuttle.id,
            transportType: "SHUTTLE_FARE",
            mode: TransportMode.SHUTTLE,
            segmentLabel: `${zone.label} shuttle fare`,
            originLabel: shuttle.stopName ?? zone.label,
            destinationLabel: edition.location.venue,
            tripCount: 1,
            amount: shuttleFareAmount,
            currency: shuttle.currency,
            taxesIncluded: true,
            rawProviderName: shuttle.operatorName ?? shuttle.name,
            normalizedProviderName: "official_shuttle",
            sourceUrl:
              shuttle.sourceUrl ??
              edition.metadataSourceUrl ??
              "https://festival-companion.local",
            sourceType: QuoteSourceType.MANUAL_SEED,
            observedAt: shuttle.observedAt ?? new Date(),
            confidence: shuttle.confidence ?? 0.72,
            notes:
              shuttle.operatingNotes ??
              "Official shuttle fare from curated festival metadata.",
          },
        });

        createdGroundQuotes.push({
          zoneLabel: zone.label,
          key: "shuttleFare",
          shuttleOptionId: shuttle.id,
          quote: createdQuote,
        });
      }
    }

    const flightPool = resolveFlightPool(createdFlightQuotes);

    if (flightPool.length === 0) {
      runWarnings.push({
        editionId: edition.id,
        code: "no_valid_flights",
        message: `${edition.festival.name} had no flights that cleared the attendance window.`,
      });
      continue;
    }

    const hotelAmounts = createdHotelQuotes.map(({ quote }) => toNumber(quote.amount.toString()));
    const hotelInventory = summarizeHotelInventory(hotelAmounts);
    const cheapestFlight =
      [...flightPool].sort(
        (left, right) => toNumber(left.quote.amount) - toNumber(right.quote.amount),
      )[0] ?? null;
    const balancedFlight =
      pickBalanced(flightPool, ({ quote }) => toNumber(quote.amount.toString())) ?? null;
    const convenienceFlight =
      [...flightPool].sort((left, right) => {
        const layoverDelta = left.quote.layoverCount - right.quote.layoverCount;
        if (layoverDelta !== 0) {
          return layoverDelta;
        }

        const durationDelta =
          (left.quote.totalDurationMinutes ?? Number.MAX_SAFE_INTEGER) -
          (right.quote.totalDurationMinutes ?? Number.MAX_SAFE_INTEGER);
        if (durationDelta !== 0) {
          return durationDelta;
        }

        return toNumber(left.quote.amount.toString()) - toNumber(right.quote.amount.toString());
      })[0] ?? null;
    const cheapestHotel =
      [...createdHotelQuotes].sort(
        (left, right) => toNumber(left.quote.amount.toString()) - toNumber(right.quote.amount.toString()),
      )[0] ?? null;
    const balancedHotel =
      pickBalanced(
        createdHotelQuotes,
        ({ quote }) => toNumber(quote.amount.toString()),
      ) ?? null;
    const comfortHotel =
      [...createdHotelQuotes].sort(
        (left, right) => toNumber(right.quote.amount.toString()) - toNumber(left.quote.amount.toString()),
      )[0] ?? null;

    const scenarioTemplates = [
      {
        scenarioType: CostScenarioType.CHEAPEST_WORKABLE,
        flight: cheapestFlight,
        hotel: cheapestHotel,
        bestForBadge: "Cheapest workable",
      },
      {
        scenarioType: CostScenarioType.BALANCED,
        flight: balancedFlight,
        hotel: balancedHotel,
        bestForBadge: "Balanced pick",
      },
      {
        scenarioType: CostScenarioType.COMFORT,
        flight: convenienceFlight,
        hotel: comfortHotel,
        bestForBadge: "Smoothest plan",
      },
    ];

    for (const template of scenarioTemplates) {
      if (!template.flight || !template.hotel) {
        continue;
      }

      const hotelZone = template.hotel.zone;
      const airportTransfer = createdGroundQuotes.find(
        (item) => item.zoneLabel === hotelZone.label && item.key === "airportTransfer",
      )?.quote;
      const directCommute = createdGroundQuotes.find(
        (item) => item.zoneLabel === hotelZone.label && item.key === "directCommute",
      )?.quote;
      const matchingShuttleFare = createdGroundQuotes.find(
        (item) => item.zoneLabel === hotelZone.label && item.key === "shuttleFare",
      );
      const matchingShuttleAccess = matchingShuttleFare
        ? createdGroundQuotes.find(
            (item) =>
              item.zoneLabel === hotelZone.label &&
              item.key === "shuttleAccess" &&
              item.shuttleOptionId === matchingShuttleFare.shuttleOptionId,
          )
        : null;
      const festivalAccessPlan = chooseFestivalAccessPlan({
        directCommute: directCommute
          ? {
              id: directCommute.id,
              amount: toNumber(directCommute.amount.toString()),
              durationMinutes: directCommute.durationMinutes,
              confidence: directCommute.confidence,
            }
          : null,
        shuttleFare: matchingShuttleFare
          ? {
              id: matchingShuttleFare.quote.id,
              amount: toNumber(matchingShuttleFare.quote.amount.toString()),
              durationMinutes: matchingShuttleFare.quote.durationMinutes,
              confidence: matchingShuttleFare.quote.confidence,
            }
          : null,
        shuttleAccess: matchingShuttleAccess
          ? {
              id: matchingShuttleAccess.quote.id,
              amount: toNumber(matchingShuttleAccess.quote.amount.toString()),
              durationMinutes: matchingShuttleAccess.quote.durationMinutes,
              confidence: matchingShuttleAccess.quote.confidence,
            }
          : null,
      });

      const ticketAmount = toNumber(edition.ticketPlaceholderAmount?.toString());
      const flightAmount = toNumber(template.flight.quote.amount.toString());
      const hotelAmount = toNumber(template.hotel.quote.amount.toString());
      const airportTransferAmount = toNumber(airportTransfer?.amount?.toString());
      const localTransportAmount = roundMoney(
        airportTransferAmount + festivalAccessPlan.amount,
      );
      const totalAmount = roundMoney(
        ticketAmount + flightAmount + hotelAmount + localTransportAmount,
      );
      const confidence = scoreScenarioConfidence({
        values: [
          edition.metadataConfidence ?? 0.5,
          edition.ticketConfidence ?? 0.55,
          template.flight.quote.confidence,
          template.hotel.quote.confidence,
          airportTransfer?.confidence ?? 0.72,
          ...festivalAccessPlan.confidenceValues,
        ],
        sparseHotelInventory: hotelInventory.sparse,
        missingLiveFlight: template.flight.quote.sourceType === QuoteSourceType.ESTIMATE,
        shuttleUnavailable: !edition.shuttleOptions.length,
      });
      const frictionScore = computeFrictionScore({
        travelDays: travelWindow.travelDays,
        layoverCount: template.flight.quote.layoverCount,
        airportDriveMinutes: template.flight.airportOption.driveMinutes ?? 30,
        zoneDistanceMi: hotelZone.distanceToVenueMi ?? 4,
        commuteMinutes:
          festivalAccessPlan.durationMinutes ||
          directCommute?.durationMinutes ||
          hotelZone.typicalDriveMin ||
          20,
        confidencePenalty: 1 - confidence,
      });

      scenarioDrafts.push({
        searchRunId: searchRun.id,
        festivalEditionId: edition.id,
        scenarioType: template.scenarioType,
        whyRankedHere: "",
        recommendation: buildScenarioNarrative({
          festivalName: edition.festival.name,
          hotelZoneLabel: template.hotel.quote.zoneLabel,
          shuttleUsed: festivalAccessPlan.shuttleUsed,
          totalAmount,
          ticketAmount,
          priority: input.priority,
        }),
        stayStart: travelWindow.stayStart,
        stayEnd: travelWindow.stayEnd,
        travelDays: travelWindow.travelDays,
        hotelNights: travelWindow.hotelNights,
        ticketAmount: roundMoney(ticketAmount),
        flightAmount: roundMoney(flightAmount),
        hotelAmount: roundMoney(hotelAmount),
        localTransportAmount,
        totalAmount,
        lowAmount: roundMoney(
          ticketAmount +
          toNumber(cheapestFlight?.quote.amount.toString()) +
          toNumber(cheapestHotel?.quote.amount.toString()) +
          airportTransferAmount +
          Math.min(
            toNumber(directCommute?.amount?.toString()) || Number.POSITIVE_INFINITY,
            festivalAccessPlan.amount || Number.POSITIVE_INFINITY,
          ),
        ),
        highAmount: roundMoney(
          ticketAmount +
          toNumber(convenienceFlight?.quote.amount.toString()) +
          hotelInventory.p75 +
          airportTransferAmount +
          Math.max(
            toNumber(directCommute?.amount?.toString()),
            festivalAccessPlan.amount,
          ),
        ),
        costScore: 0,
        frictionScore,
        overallValueScore: 0,
        confidence,
        bestForBadge: template.bestForBadge,
        assumptions: {
          hotelSampleSize: createdHotelQuotes.length,
          hotelAverage: hotelInventory.average,
          hotelMedian: hotelInventory.median,
          hotelP75: hotelInventory.p75,
          airportTransferQuoteId: airportTransfer?.id ?? null,
          directCommuteQuoteId: directCommute?.id ?? null,
          shuttleFareQuoteId: festivalAccessPlan.selectedQuoteIds.shuttleFareQuoteId ?? null,
          shuttleAccessQuoteId:
            festivalAccessPlan.selectedQuoteIds.shuttleAccessQuoteId ?? null,
          festivalAccessMode: festivalAccessPlan.label,
          festivalAccessNotes: festivalAccessPlan.notes,
          sourceCity: input.sourceCity,
          sourceAirportCode,
          selectedAirportCode: template.flight.airportOption.airport.iataCode,
        },
        selectedQuoteIds: {
          flightQuoteId: template.flight.quote.id,
          hotelQuoteId: template.hotel.quote.id,
          airportTransferQuoteId: airportTransfer?.id ?? null,
          localTransportQuoteId:
            festivalAccessPlan.selectedQuoteIds.directCommuteQuoteId ??
            festivalAccessPlan.selectedQuoteIds.shuttleFareQuoteId ??
            null,
          shuttleAccessQuoteId:
            festivalAccessPlan.selectedQuoteIds.shuttleAccessQuoteId ?? null,
        },
      });
    }

    if (scenarioDrafts.some((draft) => draft.festivalEditionId === edition.id)) {
      selectedFestivalIdsWithScenarios.add(edition.id);
    }
  }

  const scoredDrafts = applyRelativeCostScores(scenarioDrafts).map((draft) => ({
    ...draft,
    whyRankedHere: buildRankingReason({
      priority: input.priority,
      costScore: draft.costScore,
      frictionScore: draft.frictionScore,
      shuttleUsed:
        draft.assumptions.festivalAccessMode === "shuttle_combo" ||
        draft.selectedQuoteIds.shuttleAccessQuoteId !== null,
    }),
  }));

  const comparableScenarioType = getPrimaryScenarioType(input.priority);
  const comparableDrafts = scoredDrafts.filter(
    (draft) => draft.scenarioType === comparableScenarioType,
  );
  const sortedComparableIds = [...comparableDrafts]
    .sort((left, right) => {
      if (input.priority === SearchPriority.CHEAPEST) {
        return left.totalAmount - right.totalAmount;
      }

      if (input.priority === SearchPriority.SMOOTHEST) {
        return right.frictionScore - left.frictionScore;
      }

      return right.overallValueScore - left.overallValueScore;
    })
    .map((draft) => draft.festivalEditionId);

  for (const draft of scoredDrafts) {
    const rank =
      draft.scenarioType === comparableScenarioType
        ? clampRank(sortedComparableIds, draft.festivalEditionId)
        : null;
    const isRecommended = draft.scenarioType === comparableScenarioType && rank === 1;

    await prisma.costScenario.create({
      data: {
        searchRunId: draft.searchRunId,
        festivalEditionId: draft.festivalEditionId,
        scenarioType: draft.scenarioType,
        rank,
        isRecommended,
        bestForBadge: draft.bestForBadge,
        whyRankedHere: draft.whyRankedHere,
        recommendation: draft.recommendation,
        stayStart: draft.stayStart,
        stayEnd: draft.stayEnd,
        travelDays: draft.travelDays,
        hotelNights: draft.hotelNights,
        ticketAmount: draft.ticketAmount,
        flightAmount: draft.flightAmount,
        hotelAmount: draft.hotelAmount,
        localTransportAmount: draft.localTransportAmount,
        totalAmount: draft.totalAmount,
        lowAmount: draft.lowAmount,
        highAmount: draft.highAmount,
        costScore: draft.costScore,
        frictionScore: draft.frictionScore,
        overallValueScore: draft.overallValueScore,
        confidence: draft.confidence,
        assumptions: toJsonValue(draft.assumptions),
        selectedQuoteIds: toJsonValue(draft.selectedQuoteIds),
      },
    });
  }

  await prisma.searchRun.update({
    where: { id: searchRun.id },
    data: {
      status:
        selectedFestivalIdsWithScenarios.size === 0
          ? SearchRunStatus.FAILED
          : runWarnings.length > 0
            ? SearchRunStatus.PARTIAL
            : SearchRunStatus.COMPLETED,
      completedAt: new Date(),
      savedAt: new Date(),
      failureReason:
        selectedFestivalIdsWithScenarios.size === 0
          ? "No complete trip scenarios could be produced from the selected festivals and source inputs."
          : null,
      warnings: toJsonValue(runWarnings),
      collectorLog: toJsonValue(collectorLog),
    },
  });

  return searchRun.id;
}
