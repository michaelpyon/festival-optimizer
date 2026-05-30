import { festivalCatalog, airports } from "@/data/manual/festival-catalog";

/**
 * Builds a concrete homepage example so the per-person value is visible before
 * any input. Every number traces back to the real catalog and the same cost
 * formulas the live engine uses:
 *   - flight: heuristic-flight-provider (95 + miles * 0.16) * demand * travelers
 *   - hotel: heuristic-hotel-provider nightlyBase * nights * rooms (median sample)
 *   - ticket: edition.ticketPlaceholderAmount from the catalog
 *   - local transport: a flat, clearly labeled rideshare-and-transfer band
 * The result is an estimate, labeled as such in the UI. It is NOT a fabricated
 * number; it is the same math the full comparison runs, frozen for a default
 * origin (LAX) and 2 travelers so the homepage can show payoff on first load.
 */

const DEFAULT_ORIGIN_IATA = "LAX";
const TRAVELERS = 2;
const ROOMS = 1; // private room, 2 travelers => 1 room

// Mirrors heuristic-flight-provider demand multipliers.
const demandMultipliers: Record<string, number> = {
  coachella: 1.22,
  "outside-lands": 1.16,
  lollapalooza: 1.14,
  "camp-flog-gnaw": 1.12,
  "shaky-knees": 1.05,
  "just-like-heaven": 1.03,
};

// Mirrors heuristic-hotel-provider midscale nightly base rates.
const midscaleNightlyBase: Record<string, number> = {
  coachella: 390,
  "shaky-knees": 285,
  lollapalooza: 415,
  "outside-lands": 405,
  "just-like-heaven": 320,
  "camp-flog-gnaw": 340,
};

// Conservative, clearly labeled local transport band (airport transfer plus
// festival-day rideshare). The live engine quotes this per zone; here it is a
// flat midscale placeholder so the example stays honest about its precision.
const localTransportBand: Record<string, number> = {
  "outside-lands": 180,
  lollapalooza: 220,
};

function degreesToRadians(value: number) {
  return (value * Math.PI) / 180;
}

function haversineMiles(lat1: number, lon1: number, lat2: number, lon2: number) {
  const earthRadiusMi = 3958.8;
  const deltaLat = degreesToRadians(lat2 - lat1);
  const deltaLon = degreesToRadians(lon2 - lon1);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(degreesToRadians(lat1)) *
      Math.cos(degreesToRadians(lat2)) *
      Math.sin(deltaLon / 2) ** 2;
  return earthRadiusMi * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function hotelNights(startsAt: string, endsAt: string, arrivalBufferHours: number, departureBufferHours: number) {
  const arrivalBy = new Date(new Date(startsAt).getTime() - arrivalBufferHours * 3_600_000);
  const departAfter = new Date(new Date(endsAt).getTime() + departureBufferHours * 3_600_000);
  const stayStart = new Date(arrivalBy);
  stayStart.setHours(0, 0, 0, 0);
  const stayEnd = new Date(departAfter);
  stayEnd.setHours(0, 0, 0, 0);
  return Math.max(Math.round((stayEnd.getTime() - stayStart.getTime()) / 86_400_000), 1);
}

export type HomepageExampleFestival = {
  slug: string;
  name: string;
  cityLabel: string;
  perPerson: number;
  total: number;
  nights: number;
};

export type HomepageExample = {
  originIata: string;
  originCity: string;
  travelers: number;
  festivals: HomepageExampleFestival[];
};

function buildFestivalExample(slug: string): HomepageExampleFestival | null {
  const entry = festivalCatalog.find((item) => item.festival.slug === slug);
  const origin = airports.find((airport) => airport.iataCode === DEFAULT_ORIGIN_IATA);
  if (!entry || !origin) {
    return null;
  }

  const edition = entry.editions.find(
    (item) => item.isCurrentEdition && item.startsAt && item.endsAt && item.ticketPlaceholderAmount,
  );
  if (!edition || !edition.startsAt || !edition.endsAt || !edition.ticketPlaceholderAmount) {
    return null;
  }

  // Primary destination airport (priority 1) from the catalog.
  const destinationOption = [...entry.airportOptions].sort((a, b) => a.priority - b.priority)[0];
  const destinationAirport = airports.find(
    (airport) => airport.iataCode === destinationOption?.airportIata,
  );
  if (!destinationAirport) {
    return null;
  }

  const distanceMiles = haversineMiles(
    origin.latitude,
    origin.longitude,
    destinationAirport.latitude,
    destinationAirport.longitude,
  );
  const demand = demandMultipliers[slug] ?? 1.05;
  // Balanced flight multiplier is 1, maxLayovers 1 so no direct premium.
  const flight = Number(((95 + distanceMiles * 0.16) * demand * TRAVELERS).toFixed(0));

  const nights = hotelNights(
    edition.startsAt,
    edition.endsAt,
    edition.defaultArrivalBufferHours,
    edition.defaultDepartureBufferHours,
  );
  const nightlyBase = midscaleNightlyBase[slug] ?? 300;
  const hotel = Number((nightlyBase * nights * ROOMS).toFixed(0));

  const ticket = Number(edition.ticketPlaceholderAmount);
  const local = localTransportBand[slug] ?? 200;

  const total = ticket + flight + hotel + local;

  return {
    slug,
    name: entry.festival.name,
    cityLabel: `${entry.location.city}, ${entry.location.stateOrRegion}`,
    perPerson: Math.round(total / TRAVELERS),
    total: Math.round(total),
    nights,
  };
}

/**
 * Two real catalog festivals priced from LAX for 2 travelers. Returns null only
 * if the catalog shape changes, in which case the homepage hides the card.
 */
export function getHomepageExample(): HomepageExample | null {
  const origin = airports.find((airport) => airport.iataCode === DEFAULT_ORIGIN_IATA);
  const outsideLands = buildFestivalExample("outside-lands");
  const lollapalooza = buildFestivalExample("lollapalooza");

  if (!origin || !outsideLands || !lollapalooza) {
    return null;
  }

  return {
    originIata: origin.iataCode,
    originCity: origin.city,
    travelers: TRAVELERS,
    festivals: [outsideLands, lollapalooza],
  };
}
