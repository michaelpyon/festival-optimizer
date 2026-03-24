import { PrismaClient } from "@prisma/client";

import { airports, festivalCatalog } from "../src/data/manual/festival-catalog";

const prisma = new PrismaClient();

async function main() {
  const airportIds = new Map<string, string>();

  for (const airport of airports) {
    const record = await prisma.airport.upsert({
      where: { iataCode: airport.iataCode },
      update: airport,
      create: airport,
    });

    airportIds.set(airport.iataCode, record.id);
  }

  for (const entry of festivalCatalog) {
    const festival = await prisma.festival.upsert({
      where: { slug: entry.festival.slug },
      update: entry.festival,
      create: entry.festival,
    });

    const location = await prisma.festivalLocation.upsert({
      where: { slug: entry.location.slug },
      update: entry.location,
      create: entry.location,
    });

    await prisma.festivalAirportOption.deleteMany({
      where: { festivalLocationId: location.id },
    });

    await prisma.festivalAirportOption.createMany({
      data: entry.airportOptions.map((option) => ({
        festivalLocationId: location.id,
        airportId: airportIds.get(option.airportIata)!,
        priority: option.priority,
        driveDistanceMi: option.driveDistanceMi,
        driveMinutes: option.driveMinutes,
        shuttleRelevant: option.shuttleRelevant,
        shuttleStopName: option.shuttleStopName ?? null,
        shuttleStopLatitude: option.shuttleStopLatitude ?? null,
        shuttleStopLongitude: option.shuttleStopLongitude ?? null,
        notes: option.notes,
      })),
    });

    await prisma.lodgingZone.deleteMany({
      where: { festivalLocationId: location.id },
    });

    await prisma.lodgingZone.createMany({
      data: entry.lodgingZones.map((zone) => ({
        festivalLocationId: location.id,
        label: zone.label,
        description: zone.description,
        centroidLatitude: zone.centroidLatitude ?? null,
        centroidLongitude: zone.centroidLongitude ?? null,
        distanceToVenueMi: zone.distanceToVenueMi,
        typicalDriveMin: zone.typicalDriveMin,
        convenienceScore: zone.convenienceScore,
      })),
    });

    for (const edition of entry.editions) {
      const editionRecord = await prisma.festivalEdition.upsert({
        where: {
          festivalId_year_editionKey: {
            festivalId: festival.id,
            year: edition.year,
            editionKey: edition.editionKey,
          },
        },
        update: {
          locationId: location.id,
          editionName: edition.editionName,
          status: edition.status,
          isCurrentEdition: edition.isCurrentEdition,
          startsAt: edition.startsAt,
          endsAt: edition.endsAt,
          gatesOpenLocalTime: edition.gatesOpenLocalTime,
          dailyEndLocalTime: edition.dailyEndLocalTime,
          defaultArrivalBufferHours: edition.defaultArrivalBufferHours,
          defaultDepartureBufferHours: edition.defaultDepartureBufferHours,
          metadataSourceUrl: edition.metadataSourceUrl,
          metadataObservedAt: edition.metadataObservedAt,
          metadataConfidence: edition.metadataConfidence,
          metadataNotes: edition.metadataNotes,
          ticketPlaceholderAmount: edition.ticketPlaceholderAmount,
          ticketCurrency: edition.ticketCurrency,
          ticketSourceUrl: edition.ticketSourceUrl,
          ticketObservedAt: edition.ticketObservedAt,
          ticketConfidence: edition.ticketConfidence,
          ticketNotes: edition.ticketNotes,
        },
        create: {
          festivalId: festival.id,
          locationId: location.id,
          year: edition.year,
          editionKey: edition.editionKey,
          editionName: edition.editionName,
          status: edition.status,
          isCurrentEdition: edition.isCurrentEdition,
          startsAt: edition.startsAt,
          endsAt: edition.endsAt,
          gatesOpenLocalTime: edition.gatesOpenLocalTime,
          dailyEndLocalTime: edition.dailyEndLocalTime,
          defaultArrivalBufferHours: edition.defaultArrivalBufferHours,
          defaultDepartureBufferHours: edition.defaultDepartureBufferHours,
          metadataSourceUrl: edition.metadataSourceUrl,
          metadataObservedAt: edition.metadataObservedAt,
          metadataConfidence: edition.metadataConfidence,
          metadataNotes: edition.metadataNotes,
          ticketPlaceholderAmount: edition.ticketPlaceholderAmount,
          ticketCurrency: edition.ticketCurrency,
          ticketSourceUrl: edition.ticketSourceUrl,
          ticketObservedAt: edition.ticketObservedAt,
          ticketConfidence: edition.ticketConfidence,
          ticketNotes: edition.ticketNotes,
        },
      });

      await prisma.shuttleOption.deleteMany({
        where: { festivalEditionId: editionRecord.id },
      });

      if (edition.shuttleOptions.length > 0) {
        await prisma.shuttleOption.createMany({
          data: edition.shuttleOptions.map((option) => ({
            festivalEditionId: editionRecord.id,
            name: option.name,
            operatorName: option.operatorName ?? null,
            stopName: option.stopName ?? null,
            stopLatitude: option.stopLatitude ?? null,
            stopLongitude: option.stopLongitude ?? null,
            fareAmount: option.fareAmount,
            currency: option.currency,
            passType: option.passType ?? null,
            operatingNotes: option.operatingNotes ?? null,
            sourceUrl: option.sourceUrl ?? null,
            observedAt: option.observedAt ?? null,
            confidence: option.confidence ?? null,
            isOfficial: option.isOfficial,
          })),
        });
      }
    }
  }

  const festivalCount = await prisma.festival.count();
  const editionCount = await prisma.festivalEdition.count();
  const airportCount = await prisma.airport.count();

  console.log(
    `Seeded ${festivalCount} festivals, ${editionCount} editions, and ${airportCount} airports.`,
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
