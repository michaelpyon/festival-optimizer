-- CreateTable
CREATE TABLE "Festival" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "officialWebsite" TEXT,
    "campingAvailable" BOOLEAN NOT NULL DEFAULT false,
    "historicMonth" INTEGER,
    "historicSeason" TEXT,
    "shuttleNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FestivalLocation" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "slug" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateOrRegion" TEXT,
    "country" TEXT NOT NULL,
    "venue" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "parkingNotes" TEXT,
    "neighborhoodSummary" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "LodgingZone" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "festivalLocationId" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "description" TEXT,
    "centroidLatitude" REAL,
    "centroidLongitude" REAL,
    "distanceToVenueMi" REAL,
    "typicalDriveMin" INTEGER,
    "convenienceScore" REAL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "LodgingZone_festivalLocationId_fkey" FOREIGN KEY ("festivalLocationId") REFERENCES "FestivalLocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FestivalEdition" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "festivalId" TEXT NOT NULL,
    "locationId" TEXT NOT NULL,
    "year" INTEGER NOT NULL,
    "editionKey" TEXT NOT NULL DEFAULT 'main',
    "editionName" TEXT,
    "status" TEXT NOT NULL,
    "isCurrentEdition" BOOLEAN NOT NULL DEFAULT false,
    "startsAt" DATETIME,
    "endsAt" DATETIME,
    "gatesOpenLocalTime" TEXT,
    "dailyEndLocalTime" TEXT,
    "lastEntryLocalTime" TEXT,
    "defaultArrivalBufferHours" INTEGER NOT NULL DEFAULT 18,
    "defaultDepartureBufferHours" INTEGER NOT NULL DEFAULT 10,
    "metadataSourceUrl" TEXT,
    "metadataObservedAt" DATETIME,
    "metadataConfidence" REAL,
    "metadataNotes" TEXT,
    "ticketPlaceholderAmount" DECIMAL,
    "ticketCurrency" TEXT NOT NULL DEFAULT 'USD',
    "ticketSourceUrl" TEXT,
    "ticketObservedAt" DATETIME,
    "ticketConfidence" REAL,
    "ticketNotes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FestivalEdition_festivalId_fkey" FOREIGN KEY ("festivalId") REFERENCES "Festival" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FestivalEdition_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "FestivalLocation" ("id") ON DELETE RESTRICT ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "Airport" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "iataCode" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "stateOrRegion" TEXT,
    "country" TEXT NOT NULL,
    "timezone" TEXT NOT NULL,
    "latitude" REAL NOT NULL,
    "longitude" REAL NOT NULL,
    "airportType" TEXT NOT NULL,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "FestivalAirportOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "festivalLocationId" TEXT NOT NULL,
    "airportId" TEXT NOT NULL,
    "priority" INTEGER NOT NULL DEFAULT 1,
    "driveDistanceMi" REAL,
    "driveMinutes" INTEGER,
    "shuttleRelevant" BOOLEAN NOT NULL DEFAULT false,
    "shuttleStopName" TEXT,
    "shuttleStopLatitude" REAL,
    "shuttleStopLongitude" REAL,
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FestivalAirportOption_airportId_fkey" FOREIGN KEY ("airportId") REFERENCES "Airport" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FestivalAirportOption_festivalLocationId_fkey" FOREIGN KEY ("festivalLocationId") REFERENCES "FestivalLocation" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "SearchRun" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "label" TEXT,
    "mode" TEXT NOT NULL DEFAULT 'HYBRID',
    "status" TEXT NOT NULL DEFAULT 'DRAFT',
    "startedAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "completedAt" DATETIME,
    "savedAt" DATETIME,
    "failureReason" TEXT,
    "warnings" JSONB,
    "collectorLog" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL
);

-- CreateTable
CREATE TABLE "SearchRunFestival" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchRunId" TEXT NOT NULL,
    "festivalEditionId" TEXT NOT NULL,
    "displayOrder" INTEGER NOT NULL DEFAULT 0,
    CONSTRAINT "SearchRunFestival_searchRunId_fkey" FOREIGN KEY ("searchRunId") REFERENCES "SearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "SearchRunFestival_festivalEditionId_fkey" FOREIGN KEY ("festivalEditionId") REFERENCES "FestivalEdition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "UserPreference" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchRunId" TEXT NOT NULL,
    "sourceCity" TEXT NOT NULL,
    "sourceStateOrRegion" TEXT,
    "sourceCountry" TEXT NOT NULL DEFAULT 'United States',
    "sourceAirportId" TEXT,
    "travelersCount" INTEGER NOT NULL,
    "roomType" TEXT NOT NULL,
    "hotelClass" TEXT NOT NULL,
    "priority" TEXT NOT NULL,
    "redEyeOk" BOOLEAN NOT NULL DEFAULT false,
    "maxLayovers" INTEGER NOT NULL DEFAULT 1,
    "airportArrivalBufferHours" INTEGER NOT NULL DEFAULT 18,
    "returnDepartureBufferHours" INTEGER NOT NULL DEFAULT 10,
    "surgePreset" TEXT NOT NULL DEFAULT 'NORMAL',
    "allowRentalCar" BOOLEAN NOT NULL DEFAULT false,
    "ticketCostOverrideAmount" DECIMAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "notes" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "UserPreference_searchRunId_fkey" FOREIGN KEY ("searchRunId") REFERENCES "SearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "UserPreference_sourceAirportId_fkey" FOREIGN KEY ("sourceAirportId") REFERENCES "Airport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "FlightQuote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchRunId" TEXT NOT NULL,
    "festivalEditionId" TEXT NOT NULL,
    "sourceAirportId" TEXT,
    "destinationAirportId" TEXT,
    "providerRank" INTEGER,
    "itinerarySummary" TEXT NOT NULL,
    "deepLinkUrl" TEXT,
    "outboundDepartAt" DATETIME,
    "outboundArriveAt" DATETIME,
    "returnDepartAt" DATETIME,
    "returnArriveAt" DATETIME,
    "totalDurationMinutes" INTEGER,
    "layoverCount" INTEGER NOT NULL DEFAULT 0,
    "cabinClass" TEXT,
    "isRedEye" BOOLEAN NOT NULL DEFAULT false,
    "isValidForAttendance" BOOLEAN NOT NULL DEFAULT true,
    "rawProviderName" TEXT NOT NULL,
    "normalizedProviderName" TEXT NOT NULL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "taxesIncluded" BOOLEAN,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "observedAt" DATETIME NOT NULL,
    "confidence" REAL NOT NULL,
    "notes" TEXT,
    "rawPayload" JSONB,
    "snapshotPath" TEXT,
    "selectorLog" TEXT,
    "flaggedBadAt" DATETIME,
    "flaggedBadReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "FlightQuote_destinationAirportId_fkey" FOREIGN KEY ("destinationAirportId") REFERENCES "Airport" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "FlightQuote_festivalEditionId_fkey" FOREIGN KEY ("festivalEditionId") REFERENCES "FestivalEdition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlightQuote_searchRunId_fkey" FOREIGN KEY ("searchRunId") REFERENCES "SearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "FlightQuote_sourceAirportId_fkey" FOREIGN KEY ("sourceAirportId") REFERENCES "Airport" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "HotelQuote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchRunId" TEXT NOT NULL,
    "festivalEditionId" TEXT NOT NULL,
    "lodgingZoneId" TEXT,
    "providerRank" INTEGER,
    "hotelName" TEXT,
    "zoneLabel" TEXT NOT NULL,
    "inventoryClass" TEXT NOT NULL,
    "latitude" REAL,
    "longitude" REAL,
    "distanceToVenueMi" REAL,
    "driveMinutesToVenue" INTEGER,
    "isNearShuttleStop" BOOLEAN NOT NULL DEFAULT false,
    "checkIn" DATETIME NOT NULL,
    "checkOut" DATETIME NOT NULL,
    "nightlyAmount" DECIMAL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "taxesIncluded" BOOLEAN,
    "deepLinkUrl" TEXT,
    "rawProviderName" TEXT NOT NULL,
    "normalizedProviderName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "observedAt" DATETIME NOT NULL,
    "confidence" REAL NOT NULL,
    "notes" TEXT,
    "rawPayload" JSONB,
    "snapshotPath" TEXT,
    "selectorLog" TEXT,
    "flaggedBadAt" DATETIME,
    "flaggedBadReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "HotelQuote_festivalEditionId_fkey" FOREIGN KEY ("festivalEditionId") REFERENCES "FestivalEdition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "HotelQuote_lodgingZoneId_fkey" FOREIGN KEY ("lodgingZoneId") REFERENCES "LodgingZone" ("id") ON DELETE SET NULL ON UPDATE CASCADE,
    CONSTRAINT "HotelQuote_searchRunId_fkey" FOREIGN KEY ("searchRunId") REFERENCES "SearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "ShuttleOption" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "festivalEditionId" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "operatorName" TEXT,
    "stopName" TEXT,
    "stopLatitude" REAL,
    "stopLongitude" REAL,
    "fareAmount" DECIMAL,
    "currency" TEXT NOT NULL DEFAULT 'USD',
    "passType" TEXT,
    "operatingNotes" TEXT,
    "sourceUrl" TEXT,
    "observedAt" DATETIME,
    "confidence" REAL,
    "isOfficial" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "ShuttleOption_festivalEditionId_fkey" FOREIGN KEY ("festivalEditionId") REFERENCES "FestivalEdition" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "GroundTransportQuote" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchRunId" TEXT NOT NULL,
    "festivalEditionId" TEXT NOT NULL,
    "shuttleOptionId" TEXT,
    "transportType" TEXT NOT NULL,
    "mode" TEXT NOT NULL,
    "segmentLabel" TEXT NOT NULL,
    "originLabel" TEXT NOT NULL,
    "destinationLabel" TEXT NOT NULL,
    "distanceMi" REAL,
    "durationMinutes" INTEGER,
    "tripCount" INTEGER NOT NULL DEFAULT 1,
    "surgePreset" TEXT,
    "baseFareAmount" DECIMAL,
    "amount" DECIMAL NOT NULL,
    "currency" TEXT NOT NULL,
    "taxesIncluded" BOOLEAN,
    "rawProviderName" TEXT NOT NULL,
    "normalizedProviderName" TEXT NOT NULL,
    "sourceUrl" TEXT NOT NULL,
    "sourceType" TEXT NOT NULL,
    "observedAt" DATETIME NOT NULL,
    "confidence" REAL NOT NULL,
    "notes" TEXT,
    "rawPayload" JSONB,
    "snapshotPath" TEXT,
    "estimatorAssumptions" JSONB,
    "flaggedBadAt" DATETIME,
    "flaggedBadReason" TEXT,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "GroundTransportQuote_festivalEditionId_fkey" FOREIGN KEY ("festivalEditionId") REFERENCES "FestivalEdition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroundTransportQuote_searchRunId_fkey" FOREIGN KEY ("searchRunId") REFERENCES "SearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "GroundTransportQuote_shuttleOptionId_fkey" FOREIGN KEY ("shuttleOptionId") REFERENCES "ShuttleOption" ("id") ON DELETE SET NULL ON UPDATE CASCADE
);

-- CreateTable
CREATE TABLE "CostScenario" (
    "id" TEXT NOT NULL PRIMARY KEY,
    "searchRunId" TEXT NOT NULL,
    "festivalEditionId" TEXT NOT NULL,
    "scenarioType" TEXT NOT NULL,
    "rank" INTEGER,
    "isRecommended" BOOLEAN NOT NULL DEFAULT false,
    "bestForBadge" TEXT,
    "whyRankedHere" TEXT NOT NULL,
    "recommendation" TEXT NOT NULL,
    "stayStart" DATETIME NOT NULL,
    "stayEnd" DATETIME NOT NULL,
    "travelDays" INTEGER NOT NULL,
    "hotelNights" INTEGER NOT NULL,
    "ticketAmount" DECIMAL,
    "flightAmount" DECIMAL NOT NULL,
    "hotelAmount" DECIMAL NOT NULL,
    "localTransportAmount" DECIMAL NOT NULL,
    "totalAmount" DECIMAL NOT NULL,
    "lowAmount" DECIMAL,
    "highAmount" DECIMAL,
    "costScore" REAL NOT NULL,
    "frictionScore" REAL NOT NULL,
    "overallValueScore" REAL NOT NULL,
    "confidence" REAL NOT NULL,
    "assumptions" JSONB,
    "selectedQuoteIds" JSONB,
    "createdAt" DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" DATETIME NOT NULL,
    CONSTRAINT "CostScenario_festivalEditionId_fkey" FOREIGN KEY ("festivalEditionId") REFERENCES "FestivalEdition" ("id") ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT "CostScenario_searchRunId_fkey" FOREIGN KEY ("searchRunId") REFERENCES "SearchRun" ("id") ON DELETE CASCADE ON UPDATE CASCADE
);

-- CreateIndex
CREATE UNIQUE INDEX "Festival_slug_key" ON "Festival"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "FestivalLocation_slug_key" ON "FestivalLocation"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "LodgingZone_festivalLocationId_label_key" ON "LodgingZone"("festivalLocationId", "label");

-- CreateIndex
CREATE UNIQUE INDEX "FestivalEdition_festivalId_year_editionKey_key" ON "FestivalEdition"("festivalId", "year", "editionKey");

-- CreateIndex
CREATE UNIQUE INDEX "Airport_iataCode_key" ON "Airport"("iataCode");

-- CreateIndex
CREATE UNIQUE INDEX "FestivalAirportOption_festivalLocationId_airportId_key" ON "FestivalAirportOption"("festivalLocationId", "airportId");

-- CreateIndex
CREATE UNIQUE INDEX "SearchRunFestival_searchRunId_festivalEditionId_key" ON "SearchRunFestival"("searchRunId", "festivalEditionId");

-- CreateIndex
CREATE UNIQUE INDEX "UserPreference_searchRunId_key" ON "UserPreference"("searchRunId");

-- CreateIndex
CREATE UNIQUE INDEX "CostScenario_searchRunId_festivalEditionId_scenarioType_key" ON "CostScenario"("searchRunId", "festivalEditionId", "scenarioType");

