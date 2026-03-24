import {
  CostScenarioType,
  FestivalEditionStatus,
  GroundTransportQuote,
  HotelClass,
  RoomType,
  SearchPriority,
} from "@prisma/client";
import { cache } from "react";

import { describeEdition, formatFestivalDateRange, formatTripWindow } from "@/lib/date";
import {
  formatConfidence,
  formatCurrency,
  formatDateLabel,
  formatDateTimeLabel,
} from "@/lib/format";
import { prisma } from "@/lib/prisma";
import { getPrimaryScenarioType } from "@/lib/search-params";

function summarizeValueProps(input: {
  campingAvailable: boolean;
  shuttleCount: number;
  airportCount: number;
  status: FestivalEditionStatus;
}) {
  if (input.status === FestivalEditionStatus.TENTATIVE) {
    return "Current-year dates are still tentative, so treat this as watchlist material.";
  }

  if (input.campingAvailable) {
    return "Camping can materially lower the total trip compared with a hotel-first plan.";
  }

  if (input.shuttleCount > 0) {
    return "An official shuttle exists, which can beat festival-night rideshare chaos.";
  }

  if (input.airportCount === 1) {
    return "Single-airport simplicity keeps planning cleaner, even if airfare is only average.";
  }

  return "This one tends to live or die on hotel cluster choice more than airfare alone.";
}

function statusTone(
  status: FestivalEditionStatus,
): "confirmed" | "tentative" | "historic" {
  if (status === FestivalEditionStatus.CONFIRMED) {
    return "confirmed";
  }

  if (status === FestivalEditionStatus.TENTATIVE) {
    return "tentative";
  }

  return "historic";
}

function parseWarnings(raw: unknown) {
  return Array.isArray(raw) ? raw : [];
}

function buildCompareSortValue(input: {
  sort: "overall" | "total" | "friction" | "confidence" | "festival";
  row: {
    displayName: string;
    totalAmount?: number | null;
    overallValueScore?: number | null;
    frictionScore?: number | null;
    confidence?: number | null;
  };
}) {
  if (input.sort === "festival") {
    return input.row.displayName;
  }

  if (input.row.totalAmount === null || input.row.totalAmount === undefined) {
    return Number.NEGATIVE_INFINITY;
  }

  if (input.sort === "total") {
    return input.row.totalAmount * -1;
  }

  if (input.sort === "friction") {
    return input.row.frictionScore ?? 0;
  }

  if (input.sort === "confidence") {
    return input.row.confidence ?? 0;
  }

  return input.row.overallValueScore ?? 0;
}

function sortRows<T extends { displayName: string; totalAmount?: number | null }>(
  rows: T[],
  sort: "overall" | "total" | "friction" | "confidence" | "festival",
) {
  return [...rows].sort((left, right) => {
    const leftValue = buildCompareSortValue({ sort, row: left as never });
    const rightValue = buildCompareSortValue({ sort, row: right as never });

    if (sort === "festival") {
      return String(leftValue).localeCompare(String(rightValue));
    }

    return Number(rightValue) - Number(leftValue);
  });
}

export const getLandingData = cache(async () => {
  const [editions, airports, savedTripsCount] = await Promise.all([
    prisma.festivalEdition.findMany({
      where: {
        isCurrentEdition: true,
      },
      include: {
        festival: true,
        location: {
          include: {
            airportOptions: {
              include: {
                airport: true,
              },
              orderBy: {
                priority: "asc",
              },
            },
            lodgingZones: {
              orderBy: {
                convenienceScore: "desc",
              },
            },
          },
        },
        shuttleOptions: true,
      },
      orderBy: [{ year: "desc" }, { editionKey: "asc" }],
    }),
    prisma.airport.findMany({
      orderBy: [{ city: "asc" }, { iataCode: "asc" }],
    }),
    prisma.searchRun.count(),
  ]);

  const festivalOptions = editions.map((edition) => ({
    id: edition.id,
    slug: edition.festival.slug,
    displayName: describeEdition(edition.festival.name, edition.editionName),
    festivalName: edition.festival.name,
    editionName: edition.editionName,
    dateLabel: formatFestivalDateRange(edition.startsAt, edition.endsAt),
    status: edition.status,
    statusTone: statusTone(edition.status),
    city: edition.location.city,
    stateOrRegion: edition.location.stateOrRegion,
    venue: edition.location.venue,
    airportCount: edition.location.airportOptions.length,
    shuttleCount: edition.shuttleOptions.length,
    ticketLabel: formatCurrency(
      edition.ticketPlaceholderAmount?.toString() ?? null,
      edition.ticketCurrency,
    ),
    ticketConfidenceLabel: formatConfidence(edition.ticketConfidence),
    valueProps: summarizeValueProps({
      campingAvailable: edition.festival.campingAvailable,
      shuttleCount: edition.shuttleOptions.length,
      airportCount: edition.location.airportOptions.length,
      status: edition.status,
    }),
  }));

  return {
    airports: airports.map((airport) => ({
      id: airport.id,
      iataCode: airport.iataCode,
      label: `${airport.city}${airport.stateOrRegion ? `, ${airport.stateOrRegion}` : ""} (${airport.iataCode})`,
    })),
    festivalOptions,
    stats: {
      currentEditions: editions.length,
      tentativeEditions: editions.filter(
        (edition) => edition.status === FestivalEditionStatus.TENTATIVE,
      ).length,
      savedTripsCount,
    },
  };
});

export const getCompareCatalog = cache(async (editionIds?: string[]) => {
  const editions = await prisma.festivalEdition.findMany({
    where: {
      isCurrentEdition: true,
      ...(editionIds && editionIds.length > 0 ? { id: { in: editionIds } } : {}),
    },
    include: {
      festival: true,
      location: {
        include: {
          airportOptions: {
            include: {
              airport: true,
            },
            orderBy: {
              priority: "asc",
            },
          },
          lodgingZones: {
            orderBy: {
              convenienceScore: "desc",
            },
          },
        },
      },
      shuttleOptions: true,
    },
    orderBy: [{ year: "desc" }, { editionKey: "asc" }],
  });

  return editions.map((edition) => ({
    id: edition.id,
    slug: edition.festival.slug,
    displayName: describeEdition(edition.festival.name, edition.editionName),
    status: edition.status,
    statusTone: statusTone(edition.status),
    dateLabel: formatFestivalDateRange(edition.startsAt, edition.endsAt),
    cityLabel: `${edition.location.city}${edition.location.stateOrRegion ? `, ${edition.location.stateOrRegion}` : ""}`,
    venue: edition.location.venue,
    ticketLabel: formatCurrency(
      edition.ticketPlaceholderAmount?.toString() ?? null,
      edition.ticketCurrency,
    ),
    planningConfidence: formatConfidence(edition.metadataConfidence),
    airportCount: edition.location.airportOptions.length,
    lodgingZoneCount: edition.location.lodgingZones.length,
    shuttleCount: edition.shuttleOptions.length,
    whyThisCanWork: summarizeValueProps({
      campingAvailable: edition.festival.campingAvailable,
      shuttleCount: edition.shuttleOptions.length,
      airportCount: edition.location.airportOptions.length,
      status: edition.status,
    }),
    sourceLabel: edition.metadataSourceUrl ?? "Manual curation",
  }));
});

export async function getCompareRunData(
  runId: string,
  sort: "overall" | "total" | "friction" | "confidence" | "festival",
) {
  const run = await prisma.searchRun.findUnique({
    where: { id: runId },
    include: {
      userPreference: {
        include: {
          sourceAirport: true,
        },
      },
      selectedFestivals: {
        orderBy: { displayOrder: "asc" },
        include: {
          festivalEdition: {
            include: {
              festival: true,
              location: true,
            },
          },
        },
      },
      costScenarios: {
        include: {
          festivalEdition: {
            include: {
              festival: true,
              location: true,
            },
          },
        },
      },
    },
  });

  if (!run) {
    return null;
  }

  const priority = run.userPreference?.priority ?? SearchPriority.BEST_VALUE;
  const primaryScenarioType = getPrimaryScenarioType(priority);
  const warnings = parseWarnings(run.warnings);
  const primaryScenarios = run.costScenarios.filter(
    (scenario) => scenario.scenarioType === primaryScenarioType,
  );
  const fallbackScenarios = run.costScenarios.filter(
    (scenario) => scenario.scenarioType === CostScenarioType.BALANCED,
  );
  const scenarioLookup = new Map(
    [...primaryScenarios, ...fallbackScenarios].map((scenario) => [
      scenario.festivalEditionId,
      scenario,
    ]),
  );

  const rows = run.selectedFestivals.map((selection) => {
    const edition = selection.festivalEdition;
    const scenario = scenarioLookup.get(edition.id);
    const missingReason =
      warnings.find(
        (warning) =>
          typeof warning === "object" &&
          warning !== null &&
          "editionId" in warning &&
          (warning as { editionId?: string }).editionId === edition.id,
      ) ?? null;

    return {
      id: edition.id,
      scenarioId: scenario?.id ?? null,
      slug: edition.festival.slug,
      displayName: describeEdition(edition.festival.name, edition.editionName),
      statusTone: statusTone(edition.status),
      status: edition.status.toLowerCase(),
      dateLabel: formatFestivalDateRange(edition.startsAt, edition.endsAt),
      cityLabel: `${edition.location.city}${edition.location.stateOrRegion ? `, ${edition.location.stateOrRegion}` : ""}`,
      stayWindowLabel: scenario
        ? formatTripWindow(scenario.stayStart, scenario.stayEnd)
        : "Needs current dates",
      totalAmount: scenario ? Number(scenario.totalAmount) : null,
      totalAmountLabel: scenario
        ? formatCurrency(scenario.totalAmount.toString())
        : "Unavailable",
      flightAmountLabel: scenario
        ? formatCurrency(scenario.flightAmount.toString())
        : "Unavailable",
      hotelAmountLabel: scenario
        ? formatCurrency(scenario.hotelAmount.toString())
        : "Unavailable",
      localTransportAmountLabel: scenario
        ? formatCurrency(scenario.localTransportAmount.toString())
        : "Unavailable",
      confidence: scenario?.confidence ?? null,
      confidenceLabel: formatConfidence(scenario?.confidence),
      bestForBadge:
        scenario?.bestForBadge ??
        (scenario?.isRecommended ? "Recommended" : "Catalog watch"),
      whyRankedHere:
        scenario?.whyRankedHere ??
        (typeof missingReason === "object" && missingReason !== null && "message" in missingReason
          ? String((missingReason as { message?: string }).message)
          : "This festival was selected, but the run could not build a complete scenario yet."),
      recommendation: scenario?.recommendation ?? "Still needs more current data.",
      rank: scenario?.rank ?? null,
      isRecommended: scenario?.isRecommended ?? false,
      travelDays: scenario?.travelDays ?? null,
      hotelNights: scenario?.hotelNights ?? null,
      lowAmountLabel: scenario
        ? formatCurrency(scenario.lowAmount?.toString() ?? null)
        : "Unavailable",
      highAmountLabel: scenario
        ? formatCurrency(scenario.highAmount?.toString() ?? null)
        : "Unavailable",
      costScore: scenario?.costScore ?? null,
      frictionScore: scenario?.frictionScore ?? null,
      overallValueScore: scenario?.overallValueScore ?? null,
    };
  });

  return {
    runId: run.id,
    label: run.label,
    status: run.status,
    startedAtLabel: formatDateTimeLabel(run.startedAt),
    completedAtLabel: formatDateTimeLabel(run.completedAt),
    warnings,
    preferenceSummary: run.userPreference
      ? describePreferenceSnapshot({
          sourceCity: run.userPreference.sourceCity,
          sourceAirport: run.userPreference.sourceAirport?.iataCode ?? undefined,
          travelers: run.userPreference.travelersCount,
          roomType: run.userPreference.roomType,
          hotelClass: run.userPreference.hotelClass,
          priority: run.userPreference.priority,
        })
      : "Preferences unavailable",
    rows: sortRows(rows, sort),
    recommendedRow: rows.find((row) => row.isRecommended) ?? rows[0] ?? null,
  };
}

export const getFestivalDetailData = cache(async (slug: string) => {
  return prisma.festival.findUnique({
    where: { slug },
    include: {
      editions: {
        include: {
          location: {
            include: {
              airportOptions: {
                include: {
                  airport: true,
                },
                orderBy: {
                  priority: "asc",
                },
              },
              lodgingZones: {
                orderBy: {
                  convenienceScore: "desc",
                },
              },
            },
          },
          shuttleOptions: true,
          costScenarios: {
            orderBy: [{ createdAt: "desc" }],
            take: 6,
          },
        },
        orderBy: [{ year: "desc" }, { editionKey: "asc" }],
      },
    },
  });
});

export async function getCostScenarioDetail(scenarioId: string) {
  const scenario = await prisma.costScenario.findUnique({
    where: { id: scenarioId },
    include: {
      searchRun: {
        include: {
          userPreference: {
            include: {
              sourceAirport: true,
            },
          },
        },
      },
      festivalEdition: {
        include: {
          festival: true,
          location: true,
        },
      },
    },
  });

  if (!scenario) {
    return null;
  }

  const selectedQuoteIds = (scenario.selectedQuoteIds ?? {}) as Record<
    string,
    string | null | undefined
  >;
  const [flightQuote, hotelQuote, airportTransferQuote, localTransportQuote, shuttleAccessQuote] =
    await Promise.all([
      selectedQuoteIds.flightQuoteId
        ? prisma.flightQuote.findUnique({ where: { id: selectedQuoteIds.flightQuoteId } })
        : Promise.resolve(null),
      selectedQuoteIds.hotelQuoteId
        ? prisma.hotelQuote.findUnique({ where: { id: selectedQuoteIds.hotelQuoteId } })
        : Promise.resolve(null),
      selectedQuoteIds.airportTransferQuoteId
        ? prisma.groundTransportQuote.findUnique({
            where: { id: selectedQuoteIds.airportTransferQuoteId },
          })
        : Promise.resolve(null),
      selectedQuoteIds.localTransportQuoteId
        ? prisma.groundTransportQuote.findUnique({
            where: { id: selectedQuoteIds.localTransportQuoteId },
          })
        : Promise.resolve(null),
      selectedQuoteIds.shuttleAccessQuoteId
        ? prisma.groundTransportQuote.findUnique({
            where: { id: selectedQuoteIds.shuttleAccessQuoteId },
          })
        : Promise.resolve(null),
    ]);

  const selectedSources = [
    flightQuote
      ? {
          label: "Flight",
          provider: flightQuote.normalizedProviderName,
          rawProvider: flightQuote.rawProviderName,
          amountLabel: formatCurrency(flightQuote.amount.toString(), flightQuote.currency),
          sourceUrl: flightQuote.sourceUrl,
          sourceType: flightQuote.sourceType,
          observedAtLabel: formatDateTimeLabel(flightQuote.observedAt),
          confidenceLabel: formatConfidence(flightQuote.confidence),
          notes: flightQuote.notes,
        }
      : null,
    hotelQuote
      ? {
          label: "Hotel",
          provider: hotelQuote.normalizedProviderName,
          rawProvider: hotelQuote.rawProviderName,
          amountLabel: formatCurrency(hotelQuote.amount.toString(), hotelQuote.currency),
          sourceUrl: hotelQuote.sourceUrl,
          sourceType: hotelQuote.sourceType,
          observedAtLabel: formatDateTimeLabel(hotelQuote.observedAt),
          confidenceLabel: formatConfidence(hotelQuote.confidence),
          notes: hotelQuote.notes,
        }
      : null,
    airportTransferQuote
      ? {
          label: "Airport transfer",
          provider: airportTransferQuote.normalizedProviderName,
          rawProvider: airportTransferQuote.rawProviderName,
          amountLabel: formatCurrency(
            airportTransferQuote.amount.toString(),
            airportTransferQuote.currency,
          ),
          sourceUrl: airportTransferQuote.sourceUrl,
          sourceType: airportTransferQuote.sourceType,
          observedAtLabel: formatDateTimeLabel(airportTransferQuote.observedAt),
          confidenceLabel: formatConfidence(airportTransferQuote.confidence),
          notes: airportTransferQuote.notes,
        }
      : null,
    localTransportQuote
      ? {
          label: "Festival access",
          provider: localTransportQuote.normalizedProviderName,
          rawProvider: localTransportQuote.rawProviderName,
          amountLabel: formatCurrency(
            localTransportQuote.amount.toString(),
            localTransportQuote.currency,
          ),
          sourceUrl: localTransportQuote.sourceUrl,
          sourceType: localTransportQuote.sourceType,
          observedAtLabel: formatDateTimeLabel(localTransportQuote.observedAt),
          confidenceLabel: formatConfidence(localTransportQuote.confidence),
          notes: localTransportQuote.notes,
        }
      : null,
    shuttleAccessQuote
      ? {
          label: "Shuttle access",
          provider: shuttleAccessQuote.normalizedProviderName,
          rawProvider: shuttleAccessQuote.rawProviderName,
          amountLabel: formatCurrency(
            shuttleAccessQuote.amount.toString(),
            shuttleAccessQuote.currency,
          ),
          sourceUrl: shuttleAccessQuote.sourceUrl,
          sourceType: shuttleAccessQuote.sourceType,
          observedAtLabel: formatDateTimeLabel(shuttleAccessQuote.observedAt),
          confidenceLabel: formatConfidence(shuttleAccessQuote.confidence),
          notes: shuttleAccessQuote.notes,
        }
      : null,
  ].filter(Boolean);

  return {
    scenario,
    preferenceSummary: scenario.searchRun.userPreference
      ? describePreferenceSnapshot({
          sourceCity: scenario.searchRun.userPreference.sourceCity,
          sourceAirport:
            scenario.searchRun.userPreference.sourceAirport?.iataCode ?? undefined,
          travelers: scenario.searchRun.userPreference.travelersCount,
          roomType: scenario.searchRun.userPreference.roomType,
          hotelClass: scenario.searchRun.userPreference.hotelClass,
          priority: scenario.searchRun.userPreference.priority,
        })
      : "Preference snapshot unavailable",
    tripWindowLabel: formatTripWindow(scenario.stayStart, scenario.stayEnd),
    selectedSources,
  };
}

export const getSavedTrips = cache(async () => {
  const runs = await prisma.searchRun.findMany({
    orderBy: {
      updatedAt: "desc",
    },
    include: {
      selectedFestivals: {
        include: {
          festivalEdition: {
            include: {
              festival: true,
            },
          },
        },
        orderBy: { displayOrder: "asc" },
      },
      costScenarios: {
        orderBy: [{ createdAt: "desc" }, { rank: "asc" }],
      },
      userPreference: {
        include: {
          sourceAirport: true,
        },
      },
    },
    take: 24,
  });

  return runs.map((run) => {
    const primaryScenarioType = getPrimaryScenarioType(
      run.userPreference?.priority ?? SearchPriority.BEST_VALUE,
    );
    const recommendedScenario =
      run.costScenarios.find((scenario) => scenario.scenarioType === primaryScenarioType) ??
      run.costScenarios[0] ??
      null;

    return {
      ...run,
      recommendedScenario,
      festivalSummary: run.selectedFestivals
        .map((selection) =>
          describeEdition(
            selection.festivalEdition.festival.name,
            selection.festivalEdition.editionName,
          ),
        )
        .join(", "),
    };
  });
});

export const getAdminDashboardData = cache(async () => {
  const [
    festivals,
    editions,
    airports,
    searchRuns,
    currentEditions,
    tentativeEditions,
    recentFlightQuotes,
    recentHotelQuotes,
    recentGroundQuotes,
  ] = await Promise.all([
    prisma.festival.count(),
    prisma.festivalEdition.count(),
    prisma.airport.count(),
    prisma.searchRun.count(),
    prisma.festivalEdition.findMany({
      where: {
        isCurrentEdition: true,
      },
      include: {
        festival: true,
      },
      orderBy: [{ year: "desc" }, { editionKey: "asc" }],
    }),
    prisma.festivalEdition.findMany({
      where: {
        status: FestivalEditionStatus.TENTATIVE,
      },
      include: {
        festival: true,
      },
      orderBy: {
        updatedAt: "desc",
      },
    }),
    prisma.flightQuote.findMany({
      orderBy: {
        observedAt: "desc",
      },
      take: 6,
      include: {
        festivalEdition: {
          include: {
            festival: true,
          },
        },
      },
    }),
    prisma.hotelQuote.findMany({
      orderBy: {
        observedAt: "desc",
      },
      take: 6,
      include: {
        festivalEdition: {
          include: {
            festival: true,
          },
        },
      },
    }),
    prisma.groundTransportQuote.findMany({
      orderBy: {
        observedAt: "desc",
      },
      take: 6,
      include: {
        festivalEdition: {
          include: {
            festival: true,
          },
        },
      },
    }),
  ]);

  return {
    stats: {
      festivals,
      editions,
      airports,
      searchRuns,
    },
    currentEditions,
    tentativeEditions,
    recentFlightQuotes,
    recentHotelQuotes,
    recentGroundQuotes,
  };
});

export function describePreferenceSnapshot(input: {
  sourceCity: string;
  sourceAirport?: string;
  travelers: number;
  roomType: RoomType;
  hotelClass: HotelClass;
  priority: SearchPriority;
}) {
  return [
    input.sourceCity,
    input.sourceAirport ? `airport ${input.sourceAirport}` : null,
    `${input.travelers} traveler${input.travelers === 1 ? "" : "s"}`,
    input.roomType.toLowerCase().replaceAll("_", " "),
    input.hotelClass.toLowerCase(),
    input.priority.toLowerCase().replaceAll("_", " "),
  ]
    .filter(Boolean)
    .join(" / ");
}

export function countScenarioQuotes(quotes: GroundTransportQuote[]) {
  return quotes.length;
}

export function groupEditionScenarios(
  scenarios: Array<{
    scenarioType: CostScenarioType;
    totalAmount: { toString(): string };
    confidence: number;
    id: string;
  }>,
) {
  return [CostScenarioType.CHEAPEST_WORKABLE, CostScenarioType.BALANCED, CostScenarioType.COMFORT]
    .map((scenarioType) => scenarios.find((scenario) => scenario.scenarioType === scenarioType))
    .filter(Boolean)
    .map((scenario) => ({
      id: scenario!.id,
      scenarioType: scenario!.scenarioType,
      totalAmountLabel: formatCurrency(scenario!.totalAmount.toString()),
      confidenceLabel: formatConfidence(scenario!.confidence),
    }));
}

export function summarizeQuoteRecord(input: {
  rawProviderName: string;
  normalizedProviderName: string;
  sourceType: string;
  observedAt: Date;
  confidence: number;
}) {
  return `${input.rawProviderName} -> ${input.normalizedProviderName} • ${input.sourceType.toLowerCase()} • ${formatDateLabel(input.observedAt)} • ${formatConfidence(input.confidence)}`;
}
