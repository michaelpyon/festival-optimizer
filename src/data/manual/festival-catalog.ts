import {
  AirportType,
  FestivalEditionStatus,
  FestivalSeason,
} from "@prisma/client";

const observedAt = "2026-03-23T12:00:00-04:00";

type SeedAirport = {
  iataCode: string;
  name: string;
  city: string;
  stateOrRegion: string;
  country: string;
  timezone: string;
  latitude: number;
  longitude: number;
  airportType: AirportType;
};

type SeedAirportOption = {
  airportIata: string;
  priority: number;
  driveDistanceMi: number;
  driveMinutes: number;
  shuttleRelevant: boolean;
  shuttleStopName?: string;
  shuttleStopLatitude?: number;
  shuttleStopLongitude?: number;
  notes: string;
};

type SeedLodgingZone = {
  label: string;
  description: string;
  centroidLatitude?: number;
  centroidLongitude?: number;
  distanceToVenueMi: number;
  typicalDriveMin: number;
  convenienceScore: number;
};

type SeedShuttleOption = {
  name: string;
  operatorName?: string | null;
  fareAmount: string | null;
  currency: string;
  passType?: string | null;
  stopName?: string | null;
  stopLatitude?: number | null;
  stopLongitude?: number | null;
  operatingNotes?: string | null;
  sourceUrl?: string | null;
  observedAt?: string | null;
  confidence?: number | null;
  isOfficial: boolean;
};

type SeedEdition = {
  year: number;
  editionKey: string;
  editionName: string | null;
  status: FestivalEditionStatus;
  isCurrentEdition: boolean;
  startsAt: string | null;
  endsAt: string | null;
  gatesOpenLocalTime: string | null;
  dailyEndLocalTime: string | null;
  defaultArrivalBufferHours: number;
  defaultDepartureBufferHours: number;
  metadataSourceUrl: string | null;
  metadataObservedAt: string | null;
  metadataConfidence: number | null;
  metadataNotes: string | null;
  ticketPlaceholderAmount: string | null;
  ticketCurrency: string;
  ticketSourceUrl: string | null;
  ticketObservedAt: string | null;
  ticketConfidence: number | null;
  ticketNotes: string | null;
  shuttleOptions: SeedShuttleOption[];
};

type SeedFestivalEntry = {
  festival: {
    slug: string;
    name: string;
    description: string;
    officialWebsite: string;
    campingAvailable: boolean;
    historicMonth: number;
    historicSeason: FestivalSeason;
    shuttleNotes: string;
  };
  location: {
    slug: string;
    city: string;
    stateOrRegion: string;
    country: string;
    venue: string;
    timezone: string;
    latitude: number;
    longitude: number;
    parkingNotes: string;
    neighborhoodSummary: string;
  };
  airportOptions: SeedAirportOption[];
  lodgingZones: SeedLodgingZone[];
  editions: SeedEdition[];
};

export const airports: SeedAirport[] = [
  {
    iataCode: "ATL",
    name: "Hartsfield-Jackson Atlanta International Airport",
    city: "Atlanta",
    stateOrRegion: "GA",
    country: "USA",
    timezone: "America/New_York",
    latitude: 33.6407,
    longitude: -84.4277,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "BUR",
    name: "Hollywood Burbank Airport",
    city: "Burbank",
    stateOrRegion: "CA",
    country: "USA",
    timezone: "America/Los_Angeles",
    latitude: 34.2007,
    longitude: -118.3587,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "LAX",
    name: "Los Angeles International Airport",
    city: "Los Angeles",
    stateOrRegion: "CA",
    country: "USA",
    timezone: "America/Los_Angeles",
    latitude: 33.9416,
    longitude: -118.4085,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "MDW",
    name: "Chicago Midway International Airport",
    city: "Chicago",
    stateOrRegion: "IL",
    country: "USA",
    timezone: "America/Chicago",
    latitude: 41.7868,
    longitude: -87.7522,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "OAK",
    name: "Oakland International Airport",
    city: "Oakland",
    stateOrRegion: "CA",
    country: "USA",
    timezone: "America/Los_Angeles",
    latitude: 37.7126,
    longitude: -122.2197,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "ONT",
    name: "Ontario International Airport",
    city: "Ontario",
    stateOrRegion: "CA",
    country: "USA",
    timezone: "America/Los_Angeles",
    latitude: 34.0559,
    longitude: -117.6,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "ORD",
    name: "O'Hare International Airport",
    city: "Chicago",
    stateOrRegion: "IL",
    country: "USA",
    timezone: "America/Chicago",
    latitude: 41.9742,
    longitude: -87.9073,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "PSP",
    name: "Palm Springs International Airport",
    city: "Palm Springs",
    stateOrRegion: "CA",
    country: "USA",
    timezone: "America/Los_Angeles",
    latitude: 33.8297,
    longitude: -116.507,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "SFO",
    name: "San Francisco International Airport",
    city: "San Francisco",
    stateOrRegion: "CA",
    country: "USA",
    timezone: "America/Los_Angeles",
    latitude: 37.6213,
    longitude: -122.379,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "SJC",
    name: "San Jose Mineta International Airport",
    city: "San Jose",
    stateOrRegion: "CA",
    country: "USA",
    timezone: "America/Los_Angeles",
    latitude: 37.3639,
    longitude: -121.9289,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "AUS",
    name: "Austin-Bergstrom International Airport",
    city: "Austin",
    stateOrRegion: "TX",
    country: "USA",
    timezone: "America/Chicago",
    latitude: 30.1975,
    longitude: -97.6664,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "BCN",
    name: "Josep Tarradellas Barcelona-El Prat Airport",
    city: "Barcelona",
    stateOrRegion: "Catalonia",
    country: "Spain",
    timezone: "Europe/Madrid",
    latitude: 41.2974,
    longitude: 2.0833,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "BNA",
    name: "Nashville International Airport",
    city: "Nashville",
    stateOrRegion: "TN",
    country: "USA",
    timezone: "America/Chicago",
    latitude: 36.1245,
    longitude: -86.6782,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "BRS",
    name: "Bristol Airport",
    city: "Bristol",
    stateOrRegion: "England",
    country: "UK",
    timezone: "Europe/London",
    latitude: 51.3827,
    longitude: -2.7191,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "CHA",
    name: "Chattanooga Airport",
    city: "Chattanooga",
    stateOrRegion: "TN",
    country: "USA",
    timezone: "America/New_York",
    latitude: 35.0353,
    longitude: -85.2038,
    airportType: AirportType.REGIONAL,
  },
  {
    iataCode: "CPH",
    name: "Copenhagen Airport",
    city: "Copenhagen",
    stateOrRegion: "Capital Region",
    country: "Denmark",
    timezone: "Europe/Copenhagen",
    latitude: 55.6181,
    longitude: 12.6561,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "DTW",
    name: "Detroit Metropolitan Wayne County Airport",
    city: "Detroit",
    stateOrRegion: "MI",
    country: "USA",
    timezone: "America/Detroit",
    latitude: 42.2162,
    longitude: -83.3554,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "EWR",
    name: "Newark Liberty International Airport",
    city: "Newark",
    stateOrRegion: "NJ",
    country: "USA",
    timezone: "America/New_York",
    latitude: 40.6895,
    longitude: -74.1745,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "GRR",
    name: "Gerald R. Ford International Airport",
    city: "Grand Rapids",
    stateOrRegion: "MI",
    country: "USA",
    timezone: "America/Detroit",
    latitude: 42.8808,
    longitude: -85.5228,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "JFK",
    name: "John F. Kennedy International Airport",
    city: "New York",
    stateOrRegion: "NY",
    country: "USA",
    timezone: "America/New_York",
    latitude: 40.6413,
    longitude: -73.7781,
    airportType: AirportType.INTERNATIONAL,
  },
  {
    iataCode: "LGA",
    name: "LaGuardia Airport",
    city: "New York",
    stateOrRegion: "NY",
    country: "USA",
    timezone: "America/New_York",
    latitude: 40.7769,
    longitude: -73.874,
    airportType: AirportType.DOMESTIC,
  },
  {
    iataCode: "LHR",
    name: "Heathrow Airport",
    city: "London",
    stateOrRegion: "England",
    country: "UK",
    timezone: "Europe/London",
    latitude: 51.47,
    longitude: -0.4543,
    airportType: AirportType.INTERNATIONAL,
  },
];

export const festivalCatalog: SeedFestivalEntry[] = [
  {
    festival: {
      slug: "coachella",
      name: "Coachella",
      description:
        "A two-weekend desert flagship where camping can materially beat hotel-heavy itineraries.",
      officialWebsite: "https://www.coachella.com/",
      campingAvailable: true,
      historicMonth: 4,
      historicSeason: FestivalSeason.SPRING,
      shuttleNotes:
        "Official Any Line shuttles serve participating local hotels; camping is a real lodging substitute and should always be surfaced as a separate scenario.",
    },
    location: {
      slug: "empire-polo-club-indio",
      city: "Indio",
      stateOrRegion: "CA",
      country: "USA",
      venue: "Empire Polo Club",
      timezone: "America/Los_Angeles",
      latitude: 33.6784,
      longitude: -116.237,
      parkingNotes:
        "Large day-parking footprint, but post-show traffic is heavy and rideshare pickup queues spike after curfew.",
      neighborhoodSummary:
        "Hotel inventory is split between Palm Desert / Palm Springs resorts and closer Indio / La Quinta stock; on-site camping changes the equation entirely.",
    },
    airportOptions: [
      {
        airportIata: "PSP",
        priority: 1,
        driveDistanceMi: 21,
        driveMinutes: 35,
        shuttleRelevant: false,
        notes: "Best balance of airport convenience and desert festival access.",
      },
      {
        airportIata: "ONT",
        priority: 2,
        driveDistanceMi: 90,
        driveMinutes: 95,
        shuttleRelevant: false,
        notes: "Useful fallback when PSP fares spike or inventory disappears.",
      },
      {
        airportIata: "LAX",
        priority: 3,
        driveDistanceMi: 145,
        driveMinutes: 170,
        shuttleRelevant: false,
        notes: "Often cheapest airfare, but airport friction is materially worse.",
      },
    ],
    lodgingZones: [
      {
        label: "Onsite Camping",
        description: "Car camping or tent camping inside the festival footprint.",
        centroidLatitude: 33.6784,
        centroidLongitude: -116.237,
        distanceToVenueMi: 0.1,
        typicalDriveMin: 0,
        convenienceScore: 98,
      },
      {
        label: "Central Indio / La Quinta",
        description:
          "Closer hotel and rental inventory with a better rideshare profile than Palm Springs proper.",
        centroidLatitude: 33.7192,
        centroidLongitude: -116.2813,
        distanceToVenueMi: 5.5,
        typicalDriveMin: 18,
        convenienceScore: 84,
      },
      {
        label: "Palm Springs Resort Corridor",
        description:
          "Higher amenity and better flight overlap with PSP, but longer daily commute to the polo fields.",
        centroidLatitude: 33.8297,
        centroidLongitude: -116.5453,
        distanceToVenueMi: 24,
        typicalDriveMin: 40,
        convenienceScore: 61,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "weekend-1",
        editionName: "Weekend 1",
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-04-10T13:00:00-07:00",
        endsAt: "2026-04-13T00:00:00-07:00",
        gatesOpenLocalTime: "13:00-ish",
        dailyEndLocalTime: "Fri/Sat 01:00, Sun 00:00",
        defaultArrivalBufferHours: 16,
        defaultDepartureBufferHours: 12,
        metadataSourceUrl: "https://www.coachella.com/festival-info",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.97,
        metadataNotes:
          "Official 2026 festival info page lists both weekends and venue hours; Festival Companion models each weekend as its own attendance window.",
        ticketPlaceholderAmount: "699",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.coachella.com/residents/",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.82,
        ticketNotes:
          "Uses the official 2026 resident-sale Weekend 1 GA amount as a current placeholder, not the cheapest historical tier.",
        shuttleOptions: [
          {
            name: "Coachella Any Line Shuttle",
            operatorName: "Coachella",
            fareAmount: null,
            currency: "USD",
            passType: "3-Day Shuttle Pass",
            operatingNotes:
              "Serves participating local hotels Friday-Sunday; official pricing exists on pass bundles but is not surfaced cleanly on the current info page.",
            sourceUrl: "https://www.coachella.com/getting-here/",
            observedAt,
            confidence: 0.72,
            isOfficial: true,
          },
        ],
      },
      {
        year: 2026,
        editionKey: "weekend-2",
        editionName: "Weekend 2",
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-04-17T13:00:00-07:00",
        endsAt: "2026-04-20T00:00:00-07:00",
        gatesOpenLocalTime: "13:00-ish",
        dailyEndLocalTime: "Fri/Sat 01:00, Sun 00:00",
        defaultArrivalBufferHours: 16,
        defaultDepartureBufferHours: 12,
        metadataSourceUrl: "https://www.coachella.com/festival-info",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.97,
        metadataNotes:
          "Weekend 2 dates and venue hours come from the official 2026 festival info page.",
        ticketPlaceholderAmount: "649",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.coachella.com/residents/",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.82,
        ticketNotes:
          "Uses the official 2026 resident-sale Weekend 2 GA amount as a current placeholder, not the cheapest historical tier.",
        shuttleOptions: [
          {
            name: "Coachella Any Line Shuttle",
            operatorName: "Coachella",
            fareAmount: null,
            currency: "USD",
            passType: "3-Day Shuttle Pass",
            operatingNotes:
              "Serves participating local hotels Friday-Sunday; official pricing exists on pass bundles but is not surfaced cleanly on the current info page.",
            sourceUrl: "https://www.coachella.com/getting-here/",
            observedAt,
            confidence: 0.72,
            isOfficial: true,
          },
        ],
      },
    ],
  },
  {
    festival: {
      slug: "shaky-knees",
      name: "Shaky Knees",
      description:
        "A city festival with relatively light airport friction and strong public-transit fallback in Atlanta.",
      officialWebsite: "https://www.shakykneesfestival.com/",
      campingAvailable: false,
      historicMonth: 9,
      historicSeason: FestivalSeason.FALL,
      shuttleNotes:
        "No official paid shuttle flow is currently published; MARTA and rideshare are the main options.",
    },
    location: {
      slug: "piedmont-park-atlanta",
      city: "Atlanta",
      stateOrRegion: "GA",
      country: "USA",
      venue: "Piedmont Park (Oak Hill & The Meadow)",
      timezone: "America/New_York",
      latitude: 33.7851,
      longitude: -84.3738,
      parkingNotes:
        "No official on-site general parking; public transit and rideshare are materially smoother than driving.",
      neighborhoodSummary:
        "Midtown is the sweet spot for walkability and transit, while downtown trades a cheaper room base for slightly more venue friction.",
    },
    airportOptions: [
      {
        airportIata: "ATL",
        priority: 1,
        driveDistanceMi: 15,
        driveMinutes: 28,
        shuttleRelevant: false,
        notes: "Single-airport city with strong rail and rideshare options.",
      },
    ],
    lodgingZones: [
      {
        label: "Midtown Atlanta",
        description: "Best walk-and-rideshare mix for Piedmont Park access.",
        centroidLatitude: 33.7858,
        centroidLongitude: -84.382,
        distanceToVenueMi: 1.2,
        typicalDriveMin: 9,
        convenienceScore: 93,
      },
      {
        label: "Downtown Atlanta",
        description: "Cheaper business-hotel inventory with easy MARTA access.",
        centroidLatitude: 33.755,
        centroidLongitude: -84.39,
        distanceToVenueMi: 3.1,
        typicalDriveMin: 16,
        convenienceScore: 77,
      },
      {
        label: "Buckhead",
        description: "Comfort-heavy hotel stock but more daily commute burden.",
        centroidLatitude: 33.846,
        centroidLongitude: -84.365,
        distanceToVenueMi: 7.8,
        typicalDriveMin: 24,
        convenienceScore: 58,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-09-18T16:00:00-04:00",
        endsAt: "2026-09-20T22:30:00-04:00",
        gatesOpenLocalTime: "Fri 16:00, Sat/Sun 11:30",
        dailyEndLocalTime: "Fri/Sat 23:00, Sun 22:30",
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl:
          "https://support.shakykneesfestival.com/hc/en-us/articles/4404885185428-What-are-the-dates-and-hours-of-Shaky-Knees",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.98,
        metadataNotes:
          "Official support article confirms 2026 dates and daily open/close times.",
        ticketPlaceholderAmount: "349",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.shakykneesfestival.com/tickets",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.93,
        ticketNotes:
          "Uses the official current 3-day GA starting price on the ticket page.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "lollapalooza",
      name: "Lollapalooza",
      description:
        "A transit-friendly downtown Chicago tentpole where airport choice and hotel cluster matter more than local shuttles.",
      officialWebsite: "https://www.lollapalooza.com/",
      campingAvailable: false,
      historicMonth: 7,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "No official festival shuttle is surfaced for 2026; CTA, Metra, and rideshare handle the last mile.",
    },
    location: {
      slug: "grant-park-chicago",
      city: "Chicago",
      stateOrRegion: "IL",
      country: "USA",
      venue: "Grant Park",
      timezone: "America/Chicago",
      latitude: 41.8721,
      longitude: -87.6189,
      parkingNotes:
        "Driving into the Loop is almost always the worst option; rail and hotel walkability win on friction.",
      neighborhoodSummary:
        "Loop hotels minimize commute friction, River North gives nightlife upside, and West Loop can be a value play if rates spike downtown.",
    },
    airportOptions: [
      {
        airportIata: "MDW",
        priority: 1,
        driveDistanceMi: 11,
        driveMinutes: 28,
        shuttleRelevant: false,
        notes: "Usually the smoother airport for direct downtown access.",
      },
      {
        airportIata: "ORD",
        priority: 2,
        driveDistanceMi: 19,
        driveMinutes: 42,
        shuttleRelevant: false,
        notes: "Often best for nonstop inventory, but commutes are longer.",
      },
    ],
    lodgingZones: [
      {
        label: "Loop South",
        description: "Best walkability and lowest venue friction for Grant Park.",
        centroidLatitude: 41.8735,
        centroidLongitude: -87.624,
        distanceToVenueMi: 0.8,
        typicalDriveMin: 6,
        convenienceScore: 96,
      },
      {
        label: "River North",
        description: "Strong hotel inventory with an easy CTA or short rideshare hop.",
        centroidLatitude: 41.892,
        centroidLongitude: -87.634,
        distanceToVenueMi: 1.9,
        typicalDriveMin: 12,
        convenienceScore: 82,
      },
      {
        label: "West Loop",
        description: "Good food scene and occasional rate relief, but not a direct festival walk.",
        centroidLatitude: 41.885,
        centroidLongitude: -87.648,
        distanceToVenueMi: 2.4,
        typicalDriveMin: 16,
        convenienceScore: 72,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-07-30T11:00:00-05:00",
        endsAt: "2026-08-02T22:00:00-05:00",
        gatesOpenLocalTime: "11:00",
        dailyEndLocalTime: "22:00",
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl:
          "https://support.lollapalooza.com/hc/en-us/articles/4402035626260-What-are-the-dates-and-hours-for-Lollapalooza-2026",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.98,
        metadataNotes:
          "Official support article confirms 2026 dates, venue, and daily gate hours.",
        ticketPlaceholderAmount: "400",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.lollapalooza.com/tickets",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.35,
        ticketNotes:
          "2026 ticket pricing is not posted yet on the official ticket page as of 2026-03-23, so this is a rounded manual GA benchmark used only to keep all-in comparisons functional.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "outside-lands",
      name: "Outside Lands",
      description:
        "A premium-feeling San Francisco weekend where hotel compression and shuttle strategy often matter more than airfare.",
      officialWebsite: "https://sfoutsidelands.com/",
      campingAvailable: false,
      historicMonth: 8,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "The official Bill Graham Civic Auditorium shuttle is a meaningful friction reducer and should be compared against direct rideshare.",
    },
    location: {
      slug: "golden-gate-park-san-francisco",
      city: "San Francisco",
      stateOrRegion: "CA",
      country: "USA",
      venue: "Golden Gate Park",
      timezone: "America/Los_Angeles",
      latitude: 37.7691,
      longitude: -122.4862,
      parkingNotes:
        "Parking at the grounds is effectively not a viable festival strategy; shuttle and neighborhood lodging clusters dominate.",
      neighborhoodSummary:
        "Inner Sunset is the lowest-friction lodging play, while downtown / Civic Center works best when the official shuttle is part of the plan.",
    },
    airportOptions: [
      {
        airportIata: "SFO",
        priority: 1,
        driveDistanceMi: 16,
        driveMinutes: 30,
        shuttleRelevant: true,
        shuttleStopName: "Bill Graham Civic Auditorium",
        shuttleStopLatitude: 37.7787,
        shuttleStopLongitude: -122.4175,
        notes: "Best blend of direct service and city access.",
      },
      {
        airportIata: "OAK",
        priority: 2,
        driveDistanceMi: 23,
        driveMinutes: 40,
        shuttleRelevant: true,
        shuttleStopName: "Bill Graham Civic Auditorium",
        shuttleStopLatitude: 37.7787,
        shuttleStopLongitude: -122.4175,
        notes: "Can undercut SFO airfare, but local transit friction rises.",
      },
      {
        airportIata: "SJC",
        priority: 3,
        driveDistanceMi: 46,
        driveMinutes: 62,
        shuttleRelevant: false,
        notes: "Useful only when Bay Area airfare pricing gets weird.",
      },
    ],
    lodgingZones: [
      {
        label: "Inner Sunset / Richmond Edge",
        description: "Best venue access and lowest daily commute burden.",
        centroidLatitude: 37.7601,
        centroidLongitude: -122.4702,
        distanceToVenueMi: 1.5,
        typicalDriveMin: 10,
        convenienceScore: 92,
      },
      {
        label: "Civic Center Shuttle Zone",
        description:
          "Downtown-adjacent inventory that works when the official shuttle is part of the trip plan.",
        centroidLatitude: 37.7787,
        centroidLongitude: -122.4175,
        distanceToVenueMi: 6.1,
        typicalDriveMin: 22,
        convenienceScore: 81,
      },
      {
        label: "Union Square / SoMa",
        description: "Big hotel base with nightlife upside, but more daily commute burden.",
        centroidLatitude: 37.7879,
        centroidLongitude: -122.4074,
        distanceToVenueMi: 7.1,
        typicalDriveMin: 25,
        convenienceScore: 69,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-08-07T11:00:00-07:00",
        endsAt: "2026-08-09T22:00:00-07:00",
        gatesOpenLocalTime: "11:00 (assumed from recent official operations)",
        dailyEndLocalTime: "22:00 (assumed from recent official operations)",
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl: "https://sfoutsidelands.com/info/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.79,
        metadataNotes:
          "Official FAQ confirms Aug 7-9, 2026. Intraday start/end assumptions follow the recent published operating pattern and shuttle timetable language because exact 2026 gate hours are not yet posted.",
        ticketPlaceholderAmount: "599",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://sfoutsidelands.com/",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.9,
        ticketNotes:
          "Uses the current 3-day all-in ticket price shown on the homepage waitlist tier.",
        shuttleOptions: [
          {
            name: "Official Bill Graham Shuttle",
            operatorName: "Outside Lands",
            fareAmount: "84",
            currency: "USD",
            passType: "3-Day Local Shuttle Pass",
            stopName: "Bill Graham Civic Auditorium",
            stopLatitude: 37.7787,
            stopLongitude: -122.4175,
            operatingNotes:
              "Coach shuttle from Bill Graham Civic Auditorium to the south entrance; runs from 11 AM with returns until roughly one hour after music ends each night.",
            sourceUrl: "https://sfoutsidelands.com/info/",
            observedAt,
            confidence: 0.97,
            isOfficial: true,
          },
        ],
      },
    ],
  },
  {
    festival: {
      slug: "just-like-heaven",
      name: "Just Like Heaven",
      description:
        "A one-day Pasadena play that can win on overall friction even when airfare is only middling.",
      officialWebsite: "https://www.justlikeheavenfest.com/",
      campingAvailable: false,
      historicMonth: 8,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "Free Parsons shuttle materially reduces parking stress and can beat direct rideshare on event day.",
    },
    location: {
      slug: "brookside-rose-bowl-pasadena",
      city: "Pasadena",
      stateOrRegion: "CA",
      country: "USA",
      venue: "Brookside at the Rose Bowl",
      timezone: "America/Los_Angeles",
      latitude: 34.1613,
      longitude: -118.1676,
      parkingNotes:
        "Day parking exists, but the Parsons lot + free shuttle combo is usually the smoother non-rideshare option.",
      neighborhoodSummary:
        "Old Pasadena is the lowest-friction hotel cluster; downtown LA can work if rail / shuttle transfers are acceptable.",
    },
    airportOptions: [
      {
        airportIata: "BUR",
        priority: 1,
        driveDistanceMi: 16,
        driveMinutes: 28,
        shuttleRelevant: true,
        shuttleStopName: "Parsons Parking Lot",
        shuttleStopLatitude: 34.1478,
        shuttleStopLongitude: -118.1493,
        notes: "Usually the cleanest airport-to-Pasadena path.",
      },
      {
        airportIata: "LAX",
        priority: 2,
        driveDistanceMi: 27,
        driveMinutes: 40,
        shuttleRelevant: true,
        shuttleStopName: "Parsons Parking Lot",
        shuttleStopLatitude: 34.1478,
        shuttleStopLongitude: -118.1493,
        notes: "More nonstop inventory, but more airport friction.",
      },
      {
        airportIata: "ONT",
        priority: 3,
        driveDistanceMi: 43,
        driveMinutes: 52,
        shuttleRelevant: false,
        notes: "Occasional airfare value play, but not the default.",
      },
    ],
    lodgingZones: [
      {
        label: "Old Pasadena",
        description: "Best hotel + food + festival access mix.",
        centroidLatitude: 34.1478,
        centroidLongitude: -118.1493,
        distanceToVenueMi: 2.4,
        typicalDriveMin: 12,
        convenienceScore: 91,
      },
      {
        label: "Downtown LA / Union Station",
        description:
          "Good rail-connected inventory and easy pivot into the Parsons shuttle option.",
        centroidLatitude: 34.0562,
        centroidLongitude: -118.2365,
        distanceToVenueMi: 10.2,
        typicalDriveMin: 24,
        convenienceScore: 71,
      },
      {
        label: "Glendale / Burbank Corridor",
        description: "Airport-adjacent comfort stock with more commute friction.",
        centroidLatitude: 34.1739,
        centroidLongitude: -118.305,
        distanceToVenueMi: 13.8,
        typicalDriveMin: 26,
        convenienceScore: 62,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-08-22T12:00:00-07:00",
        endsAt: "2026-08-22T23:00:00-07:00",
        gatesOpenLocalTime: "12:00 (historical assumption)",
        dailyEndLocalTime: "23:00 (historical assumption)",
        defaultArrivalBufferHours: 6,
        defaultDepartureBufferHours: 8,
        metadataSourceUrl: "https://www.justlikeheavenfest.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.74,
        metadataNotes:
          "Official 2026 homepage confirms August 22, 2026. Venue, shuttle flow, and intraday timing are carried forward from the standing Rose Bowl transport page because detailed 2026 ops have not posted yet.",
        ticketPlaceholderAmount: "209",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.justlikeheavenfest.com/",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.95,
        ticketNotes:
          "Uses the official homepage GA starting price.",
        shuttleOptions: [
          {
            name: "Parsons Free Shuttle",
            operatorName: "Just Like Heaven",
            fareAmount: "0",
            currency: "USD",
            passType: "Free Event Shuttle",
            stopName: "Parsons Parking Lot",
            stopLatitude: 34.1478,
            stopLongitude: -118.1493,
            operatingNotes:
              "Free continuous shuttle between Parsons and Rose Bowl Lot B; the current transport page says it runs from 11 AM until one hour after the event ends.",
            sourceUrl: "https://www.justlikeheavenfest.com/getting-here/",
            observedAt,
            confidence: 0.88,
            isOfficial: true,
          },
        ],
      },
    ],
  },
  {
    festival: {
      slug: "camp-flog-gnaw",
      name: "Camp Flog Gnaw",
      description:
        "A Los Angeles city-festival trip where a future date announcement is still pending, so the app should surface the uncertainty instead of manufacturing a trip plan.",
      officialWebsite: "https://www.campfloggnaw.com/",
      campingAvailable: false,
      historicMonth: 11,
      historicSeason: FestivalSeason.FALL,
      shuttleNotes:
        "The 2025 edition offered a free Union Station shuttle to Dodger Stadium; treat that as historical context until 2026 transport details are official.",
    },
    location: {
      slug: "dodger-stadium-los-angeles",
      city: "Los Angeles",
      stateOrRegion: "CA",
      country: "USA",
      venue: "Dodger Stadium Grounds",
      timezone: "America/Los_Angeles",
      latitude: 34.0739,
      longitude: -118.2400,
      parkingNotes:
        "Dodger Stadium lots exist, but rideshare and Union Station shuttle strategies usually reduce post-show stress.",
      neighborhoodSummary:
        "Chinatown / Union Station keeps venue friction low, while downtown LA works when you care more about hotel depth than walkability.",
    },
    airportOptions: [
      {
        airportIata: "BUR",
        priority: 1,
        driveDistanceMi: 16,
        driveMinutes: 27,
        shuttleRelevant: true,
        shuttleStopName: "Union Station",
        shuttleStopLatitude: 34.0562,
        shuttleStopLongitude: -118.2365,
        notes: "Usually the smoothest airport for Dodger Stadium trips.",
      },
      {
        airportIata: "LAX",
        priority: 2,
        driveDistanceMi: 21,
        driveMinutes: 35,
        shuttleRelevant: true,
        shuttleStopName: "Union Station",
        shuttleStopLatitude: 34.0562,
        shuttleStopLongitude: -118.2365,
        notes: "Useful for nonstop depth, but airport transfer hassle is higher.",
      },
    ],
    lodgingZones: [
      {
        label: "Chinatown / Union Station",
        description: "Best launch point if the Union Station shuttle returns.",
        centroidLatitude: 34.0635,
        centroidLongitude: -118.236,
        distanceToVenueMi: 1.8,
        typicalDriveMin: 10,
        convenienceScore: 89,
      },
      {
        label: "Downtown LA / South Park",
        description: "Strong hotel depth with manageable rideshare or transit hops.",
        centroidLatitude: 34.043,
        centroidLongitude: -118.266,
        distanceToVenueMi: 3.4,
        typicalDriveMin: 16,
        convenienceScore: 76,
      },
      {
        label: "Hollywood / Burbank Corridor",
        description: "Airport-friendly comfort stock with more local transport burden.",
        centroidLatitude: 34.1016,
        centroidLongitude: -118.3269,
        distanceToVenueMi: 8.7,
        typicalDriveMin: 24,
        convenienceScore: 58,
      },
    ],
    editions: [
      {
        year: 2025,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.HISTORIC,
        isCurrentEdition: false,
        startsAt: "2025-11-22T12:00:00-08:00",
        endsAt: "2025-11-23T23:00:00-08:00",
        gatesOpenLocalTime: "12:00 (historical assumption)",
        dailyEndLocalTime: "23:00 (historical assumption)",
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl: "https://www.campfloggnaw.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.64,
        metadataNotes:
          "The official 2025 homepage title confirms Nov. 22-23, 2025. Intraday timing is inferred from the 2025 transport page because exact gate hours are not surfaced on the current pages.",
        ticketPlaceholderAmount: null,
        ticketCurrency: "USD",
        ticketSourceUrl: null,
        ticketObservedAt: null,
        ticketConfidence: null,
        ticketNotes: null,
        shuttleOptions: [
          {
            name: "Union Station Free Shuttle",
            operatorName: "Camp Flog Gnaw",
            fareAmount: "0",
            currency: "USD",
            passType: "Free Event Shuttle",
            stopName: "Union Station",
            stopLatitude: 34.0562,
            stopLongitude: -118.2365,
            operatingNotes:
              "2025 getting-here page lists free round-trip shuttle service from Union Station to Dodger Stadium.",
            sourceUrl: "https://www.campfloggnaw.com/getting-here/",
            observedAt,
            confidence: 0.91,
            isOfficial: true,
          },
        ],
      },
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.TENTATIVE,
        isCurrentEdition: true,
        startsAt: null,
        endsAt: null,
        gatesOpenLocalTime: null,
        dailyEndLocalTime: null,
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl: "https://www.campfloggnaw.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.32,
        metadataNotes:
          "As of 2026-03-23, the official site still only surfaces the 2025 edition. Festival Companion creates a tentative 2026 record with no dates so the UI can show uncertainty honestly.",
        ticketPlaceholderAmount: null,
        ticketCurrency: "USD",
        ticketSourceUrl: null,
        ticketObservedAt: null,
        ticketConfidence: null,
        ticketNotes: null,
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "bonnaroo",
      name: "Bonnaroo",
      description:
        "A camping-first Tennessee pilgrimage where the cheapest realistic trip often comes from embracing the farm instead of forcing a hotel plan.",
      officialWebsite: "https://www.bonnaroo.com/",
      campingAvailable: true,
      historicMonth: 6,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "On-site camping is the default move; if Nashville airport shuttles reappear they should be compared against rental-car and hotel fallback plans rather than assumed.",
    },
    location: {
      slug: "great-stage-park-manchester",
      city: "Manchester",
      stateOrRegion: "TN",
      country: "USA",
      venue: "Great Stage Park",
      timezone: "America/Chicago",
      latitude: 35.4797,
      longitude: -86.0886,
      parkingNotes:
        "Driving is normal here, but long post-show egress and a remote site mean on-site camping removes a huge amount of daily friction.",
      neighborhoodSummary:
        "On-site camping is the highest-convenience baseline. Manchester and Tullahoma are the closest hotel fallback, while Murfreesboro and Nashville only work if you accept a materially longer daily commute.",
    },
    airportOptions: [
      {
        airportIata: "BNA",
        priority: 1,
        driveDistanceMi: 68,
        driveMinutes: 72,
        shuttleRelevant: false,
        notes: "Primary fly-in airport and the cleanest path into a camping-first Bonnaroo trip.",
      },
      {
        airportIata: "CHA",
        priority: 2,
        driveDistanceMi: 56,
        driveMinutes: 68,
        shuttleRelevant: false,
        notes: "Smaller fallback airport that can help when Nashville fares spike.",
      },
      {
        airportIata: "ATL",
        priority: 3,
        driveDistanceMi: 183,
        driveMinutes: 195,
        shuttleRelevant: false,
        notes: "Airfare can be cheaper here, but the airport transfer penalty is substantial.",
      },
    ],
    lodgingZones: [
      {
        label: "Onsite Camping",
        description: "GA, groop, or upgraded camping directly on the Bonnaroo grounds.",
        centroidLatitude: 35.4797,
        centroidLongitude: -86.0886,
        distanceToVenueMi: 0.1,
        typicalDriveMin: 0,
        convenienceScore: 99,
      },
      {
        label: "Manchester / Tullahoma",
        description:
          "Closest practical hotel cluster, but still a meaningful late-night rideshare or drive back from the farm.",
        centroidLatitude: 35.4149,
        centroidLongitude: -86.2075,
        distanceToVenueMi: 12.5,
        typicalDriveMin: 24,
        convenienceScore: 63,
      },
      {
        label: "Murfreesboro / South Nashville",
        description:
          "Hotel-first fallback with materially more commute burden; only really worth it if your room savings are significant.",
        centroidLatitude: 35.9202,
        centroidLongitude: -86.5186,
        distanceToVenueMi: 38.4,
        typicalDriveMin: 56,
        convenienceScore: 41,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-06-11T12:00:00-05:00",
        endsAt: "2026-06-14T23:59:00-05:00",
        gatesOpenLocalTime: "Thursday noon-ish arrival assumption",
        dailyEndLocalTime: "Late-night close Sunday",
        defaultArrivalBufferHours: 16,
        defaultDepartureBufferHours: 12,
        metadataSourceUrl: "https://www.bonnaroo.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.97,
        metadataNotes:
          "Official homepage confirms Manchester, TN and June 11-14, 2026. Festival Companion treats camping as the primary attendance model and keeps intraday timing assumptions broad until detailed gate hours post.",
        ticketPlaceholderAmount: "430",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.bonnaroo.com/tickets/",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.94,
        ticketNotes:
          "Uses the official 4-day general admission starting price, not a speculative low tier.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "glastonbury",
      name: "Glastonbury",
      description:
        "An iconic Worthy Farm watchlist where camping is the real default and 2026 should stay clearly labeled as uncertain until the official calendar changes.",
      officialWebsite: "https://www.glastonburyfestivals.co.uk/",
      campingAvailable: true,
      historicMonth: 6,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "Coach packages and camping dominate the real plan here; hotel-first routing is possible, but it is fundamentally a fallback scenario.",
    },
    location: {
      slug: "worthy-farm-pilton",
      city: "Pilton",
      stateOrRegion: "Somerset",
      country: "UK",
      venue: "Worthy Farm",
      timezone: "Europe/London",
      latitude: 51.1569,
      longitude: -2.5858,
      parkingNotes:
        "This is not a smooth hotel commute festival. Coach arrivals, camping, and long internal walks matter more than pure rideshare logic.",
      neighborhoodSummary:
        "On-site camping is the only truly low-friction option. Shepton Mallet and Wells are the closest hotel fallback, while Bristol and Bath trade convenience for more inventory.",
    },
    airportOptions: [
      {
        airportIata: "BRS",
        priority: 1,
        driveDistanceMi: 22,
        driveMinutes: 44,
        shuttleRelevant: false,
        notes: "Best airport anchor if a future edition returns and you are not using a coach package.",
      },
      {
        airportIata: "LHR",
        priority: 2,
        driveDistanceMi: 112,
        driveMinutes: 126,
        shuttleRelevant: false,
        notes: "Useful for transatlantic access, but still a long transfer into Somerset.",
      },
    ],
    lodgingZones: [
      {
        label: "Onsite Camping",
        description: "Standard Glastonbury-style camping inside the festival footprint.",
        centroidLatitude: 51.1569,
        centroidLongitude: -2.5858,
        distanceToVenueMi: 0.1,
        typicalDriveMin: 0,
        convenienceScore: 99,
      },
      {
        label: "Shepton Mallet / Wells",
        description:
          "Closest realistic hotel fallback if you are skipping camping and accept a much rougher late-night exit.",
        centroidLatitude: 51.1898,
        centroidLongitude: -2.5488,
        distanceToVenueMi: 9.2,
        typicalDriveMin: 22,
        convenienceScore: 61,
      },
      {
        label: "Bristol / Bath",
        description:
          "Big-city inventory with stronger flight overlap, but a materially heavier festival-day transfer.",
        centroidLatitude: 51.4545,
        centroidLongitude: -2.5879,
        distanceToVenueMi: 27.4,
        typicalDriveMin: 58,
        convenienceScore: 42,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.TENTATIVE,
        isCurrentEdition: true,
        startsAt: null,
        endsAt: null,
        gatesOpenLocalTime: null,
        dailyEndLocalTime: null,
        defaultArrivalBufferHours: 18,
        defaultDepartureBufferHours: 12,
        metadataSourceUrl: "https://www.glastonburyfestivals.co.uk/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.24,
        metadataNotes:
          "As of 2026-03-23, the official site is promoting 2027 ticket messaging rather than a current 2026 edition. Festival Companion keeps Glastonbury in the catalog as a watchlist item with no trip window so uncertainty stays explicit.",
        ticketPlaceholderAmount: null,
        ticketCurrency: "GBP",
        ticketSourceUrl: null,
        ticketObservedAt: null,
        ticketConfidence: null,
        ticketNotes:
          "No current 2026 on-sale ticket was available to capture from official sources on 2026-03-23.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "primavera-sound-barcelona",
      name: "Primavera Sound",
      description:
        "A destination city festival where BCN access and smart neighborhood choice can make a premium-feeling Barcelona trip surprisingly efficient.",
      officialWebsite: "https://www.primaverasound.com/en/barcelona",
      campingAvailable: false,
      historicMonth: 6,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "This one is mostly a metro-and-walk game. Hotel zone and airport convenience matter more than any dedicated shuttle product.",
    },
    location: {
      slug: "parc-del-forum-barcelona",
      city: "Barcelona",
      stateOrRegion: "Catalonia",
      country: "Spain",
      venue: "Parc del Forum",
      timezone: "Europe/Madrid",
      latitude: 41.4125,
      longitude: 2.2193,
      parkingNotes:
        "Driving is usually the wrong move here; metro, tram, and neighborhood walkability are the cleaner way to frame daily access.",
      neighborhoodSummary:
        "Poblenou and Diagonal Mar are the low-friction play, while Eixample and the old city trade a longer venue hop for better hotel depth and nightlife.",
    },
    airportOptions: [
      {
        airportIata: "BCN",
        priority: 1,
        driveDistanceMi: 13,
        driveMinutes: 25,
        shuttleRelevant: false,
        notes: "The clear primary airport for Primavera Sound planning.",
      },
    ],
    lodgingZones: [
      {
        label: "Poblenou / Diagonal Mar",
        description: "Best venue-adjacent hotel strategy for Parc del Forum access.",
        centroidLatitude: 41.4088,
        centroidLongitude: 2.2107,
        distanceToVenueMi: 1.1,
        typicalDriveMin: 10,
        convenienceScore: 92,
      },
      {
        label: "Eixample",
        description:
          "Balanced central-city hotel inventory with a clean metro ride to the grounds.",
        centroidLatitude: 41.3917,
        centroidLongitude: 2.1649,
        distanceToVenueMi: 4.4,
        typicalDriveMin: 22,
        convenienceScore: 76,
      },
      {
        label: "Gothic Quarter / El Born",
        description:
          "Great culture and nightlife upside, but slightly more day-to-day transit friction than the east-side hotel clusters.",
        centroidLatitude: 41.3838,
        centroidLongitude: 2.1811,
        distanceToVenueMi: 3.9,
        typicalDriveMin: 21,
        convenienceScore: 72,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-06-04T17:00:00+02:00",
        endsAt: "2026-06-07T06:00:00+02:00",
        gatesOpenLocalTime: "17:00 core-site assumption",
        dailyEndLocalTime: "Late-night close carried from recent Parc del Forum pattern",
        defaultArrivalBufferHours: 12,
        defaultDepartureBufferHours: 12,
        metadataSourceUrl: "https://www.primaverasound.com/en/barcelona/tickets-info-barcelona",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.88,
        metadataNotes:
          "Official Barcelona ticket info confirms the 3-7 June 2026 event window and positions the Parc del Forum core program around June 4-6. Festival Companion models the full-attendance window through the end of the overnight close.",
        ticketPlaceholderAmount: "350",
        ticketCurrency: "EUR",
        ticketSourceUrl: "https://www.primaverasound.com/en/barcelona/tickets-info-barcelona",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.91,
        ticketNotes:
          "Uses the official Barcelona full-festival ticket price shown on the ticket info page.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "pitchfork-chicago",
      name: "Pitchfork Chicago",
      description:
        "A legacy Union Park watchlist where Chicago access is still attractive, but the current return is too uncertain to treat as a bookable trip.",
      officialWebsite: "https://pitchforkmusicfestival.com/",
      campingAvailable: false,
      historicMonth: 7,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "No current official shuttle plan exists. If Chicago returns, CTA and hotel walkability should still outrank driving on friction.",
    },
    location: {
      slug: "union-park-chicago",
      city: "Chicago",
      stateOrRegion: "IL",
      country: "USA",
      venue: "Union Park",
      timezone: "America/Chicago",
      latitude: 41.8854,
      longitude: -87.6689,
      parkingNotes:
        "If this returns, parking will still be the annoying option. West Loop and CTA access are the clean way to frame the trip.",
      neighborhoodSummary:
        "West Loop and Fulton Market offer the best friction profile, while Loop South and Wicker Park give you more hotel and nightlife variety with a slightly longer daily hop.",
    },
    airportOptions: [
      {
        airportIata: "MDW",
        priority: 1,
        driveDistanceMi: 9,
        driveMinutes: 24,
        shuttleRelevant: false,
        notes: "Usually the smoother airport if a future Chicago edition comes back.",
      },
      {
        airportIata: "ORD",
        priority: 2,
        driveDistanceMi: 17,
        driveMinutes: 34,
        shuttleRelevant: false,
        notes: "More nonstop depth, but with a longer airport transfer into the city.",
      },
    ],
    lodgingZones: [
      {
        label: "West Loop / Fulton Market",
        description: "Best venue-adjacent hotel and dining mix for Union Park access.",
        centroidLatitude: 41.8864,
        centroidLongitude: -87.6512,
        distanceToVenueMi: 0.9,
        typicalDriveMin: 8,
        convenienceScore: 91,
      },
      {
        label: "Loop South",
        description:
          "Reliable downtown inventory with an easy rail or short rideshare move west.",
        centroidLatitude: 41.8735,
        centroidLongitude: -87.624,
        distanceToVenueMi: 2.7,
        typicalDriveMin: 14,
        convenienceScore: 73,
      },
      {
        label: "Wicker Park / Bucktown",
        description:
          "Great neighborhood energy, but not quite as effortless as staying near the Loop or West Loop.",
        centroidLatitude: 41.9088,
        centroidLongitude: -87.6796,
        distanceToVenueMi: 2.6,
        typicalDriveMin: 15,
        convenienceScore: 68,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.TENTATIVE,
        isCurrentEdition: true,
        startsAt: null,
        endsAt: null,
        gatesOpenLocalTime: null,
        dailyEndLocalTime: null,
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl: "https://pitchforkmusicfestival.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.22,
        metadataNotes:
          "As of 2026-03-23, the official site says Pitchfork Music Festival will not be hosted in Chicago in 2025 and does not announce a 2026 Chicago return. The catalog keeps this as watchlist-only with no trip window.",
        ticketPlaceholderAmount: null,
        ticketCurrency: "USD",
        ticketSourceUrl: null,
        ticketObservedAt: null,
        ticketConfidence: null,
        ticketNotes:
          "No current Chicago edition ticket was available from official sources on 2026-03-23.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "austin-city-limits",
      name: "Austin City Limits",
      description:
        "A two-weekend Austin tentpole where hotel compression around Zilker often matters more than the face-value airfare.",
      officialWebsite: "https://www.aclfestival.com/",
      campingAvailable: false,
      historicMonth: 10,
      historicSeason: FestivalSeason.FALL,
      shuttleNotes:
        "Recent official operations have leaned on the downtown Republic Square shuttle to soften the Zilker commute; that should be compared against direct rideshare once 2026 ops are posted.",
    },
    location: {
      slug: "zilker-park-austin",
      city: "Austin",
      stateOrRegion: "TX",
      country: "USA",
      venue: "Zilker Park",
      timezone: "America/Chicago",
      latitude: 30.2669,
      longitude: -97.7723,
      parkingNotes:
        "Zilker parking is not the play on festival weekend. Shuttle, rideshare, and hotel location matter more than trying to drive in.",
      neighborhoodSummary:
        "Barton Springs and the Zilker edge minimize friction, downtown keeps inventory broad, and East Austin can be a smart value play if core hotel rates surge.",
    },
    airportOptions: [
      {
        airportIata: "AUS",
        priority: 1,
        driveDistanceMi: 12,
        driveMinutes: 24,
        shuttleRelevant: true,
        shuttleStopName: "Republic Square",
        shuttleStopLatitude: 30.2672,
        shuttleStopLongitude: -97.7472,
        notes: "Single-airport simplicity helps, especially if the downtown shuttle pattern returns.",
      },
    ],
    lodgingZones: [
      {
        label: "Barton Springs / Zilker Edge",
        description: "Best walk-and-short-rideshare option for the festival grounds.",
        centroidLatitude: 30.2643,
        centroidLongitude: -97.7605,
        distanceToVenueMi: 1.4,
        typicalDriveMin: 10,
        convenienceScore: 91,
      },
      {
        label: "Downtown / Convention Center",
        description:
          "Strong hotel inventory and nightlife with a manageable shuttle or rideshare move west.",
        centroidLatitude: 30.2644,
        centroidLongitude: -97.7396,
        distanceToVenueMi: 2.7,
        typicalDriveMin: 16,
        convenienceScore: 82,
      },
      {
        label: "East Austin / East Cesar Chavez",
        description:
          "Often a better rate story than downtown, but with a slightly less direct venue commute.",
        centroidLatitude: 30.2575,
        centroidLongitude: -97.7147,
        distanceToVenueMi: 4.4,
        typicalDriveMin: 20,
        convenienceScore: 71,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "weekend-1",
        editionName: "Weekend 1",
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-10-02T12:00:00-05:00",
        endsAt: "2026-10-04T22:00:00-05:00",
        gatesOpenLocalTime: "12:00-ish daily assumption",
        dailyEndLocalTime: "22:00-ish nightly assumption",
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl: "https://www.aclfestival.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.97,
        metadataNotes:
          "Official homepage confirms Austin, Zilker Park, and the Oct. 2-4 / 9-11, 2026 weekend split. Detailed 2026 daily ops are not posted yet, so intraday timing follows the recent festival pattern.",
        ticketPlaceholderAmount: "360",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.aclfestival.com/tickets",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.36,
        ticketNotes:
          "2026 price tiers are not surfaced yet. This is a rounded 3-day GA planning benchmark based on recent official ACL pricing rather than a claimed live quote.",
        shuttleOptions: [],
      },
      {
        year: 2026,
        editionKey: "weekend-2",
        editionName: "Weekend 2",
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-10-09T12:00:00-05:00",
        endsAt: "2026-10-11T22:00:00-05:00",
        gatesOpenLocalTime: "12:00-ish daily assumption",
        dailyEndLocalTime: "22:00-ish nightly assumption",
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl: "https://www.aclfestival.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.97,
        metadataNotes:
          "Official homepage confirms Austin, Zilker Park, and the Oct. 2-4 / 9-11, 2026 weekend split. Detailed 2026 daily ops are not posted yet, so intraday timing follows the recent festival pattern.",
        ticketPlaceholderAmount: "360",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.aclfestival.com/tickets",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.36,
        ticketNotes:
          "2026 price tiers are not surfaced yet. This is a rounded 3-day GA planning benchmark based on recent official ACL pricing rather than a claimed live quote.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "roskilde",
      name: "Roskilde",
      description:
        "A camp-heavy Denmark destination where Copenhagen access is smooth, but the real decision is whether you embrace the full-week festival model.",
      officialWebsite: "https://www.roskilde-festival.dk/en/",
      campingAvailable: true,
      historicMonth: 6,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "Camping is the default strategy; Copenhagen train links matter more than a dedicated shuttle product for most travelers.",
    },
    location: {
      slug: "roskilde-festival-grounds",
      city: "Roskilde",
      stateOrRegion: "Zealand",
      country: "Denmark",
      venue: "Roskilde Festival Grounds",
      timezone: "Europe/Copenhagen",
      latitude: 55.6414,
      longitude: 12.0803,
      parkingNotes:
        "The site is built around camping and rail access. Hotel-first plans are possible, but they add obvious commute friction during a long festival week.",
      neighborhoodSummary:
        "On-site camping is the friction winner. Roskilde Center works as the closest hotel fallback, while Copenhagen Central is the viable higher-inventory but higher-commute option.",
    },
    airportOptions: [
      {
        airportIata: "CPH",
        priority: 1,
        driveDistanceMi: 25,
        driveMinutes: 34,
        shuttleRelevant: false,
        notes: "Copenhagen Airport plus train access is the default route into Roskilde.",
      },
    ],
    lodgingZones: [
      {
        label: "Onsite Camping",
        description: "Standard festival camping on or adjacent to the Roskilde grounds.",
        centroidLatitude: 55.6414,
        centroidLongitude: 12.0803,
        distanceToVenueMi: 0.1,
        typicalDriveMin: 0,
        convenienceScore: 99,
      },
      {
        label: "Roskilde Center",
        description:
          "Closest hotel fallback if you want a real bed without moving all the way back to Copenhagen each night.",
        centroidLatitude: 55.6419,
        centroidLongitude: 12.0878,
        distanceToVenueMi: 2.6,
        typicalDriveMin: 10,
        convenienceScore: 82,
      },
      {
        label: "Copenhagen Central",
        description:
          "Deepest hotel stock and easiest long-haul airport flow, but with a materially heavier daily train or rideshare burden.",
        centroidLatitude: 55.6727,
        centroidLongitude: 12.5646,
        distanceToVenueMi: 20.4,
        typicalDriveMin: 35,
        convenienceScore: 59,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-06-27T10:00:00+02:00",
        endsAt: "2026-07-04T02:00:00+02:00",
        gatesOpenLocalTime: "Full-week camping arrival assumption",
        dailyEndLocalTime: "Late-night close through the final weekend",
        defaultArrivalBufferHours: 18,
        defaultDepartureBufferHours: 14,
        metadataSourceUrl: "https://www.roskilde-festival.dk/en/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.96,
        metadataNotes:
          "Official homepage confirms June 27 to July 4, 2026. Festival Companion models the whole published festival span because camping and week-long attendance are the normal Roskilde trip shape.",
        ticketPlaceholderAmount: "2600",
        ticketCurrency: "DKK",
        ticketSourceUrl: "https://www.roskilde-festival.dk/en/tickets",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.94,
        ticketNotes:
          "Uses the official full festival ticket amount shown on the current ticket page.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "electric-forest",
      name: "Electric Forest",
      description:
        "A remote Michigan trip where on-site camping is usually the whole point and airport transfer friction determines whether the value story still works.",
      officialWebsite: "https://www.electricforest.com/",
      campingAvailable: true,
      historicMonth: 6,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "Camping is the main product. Shuttle and coach options can exist in some years, but 2026 public details are not clean enough yet to treat them as current.",
    },
    location: {
      slug: "double-jj-resort-rothbury",
      city: "Rothbury",
      stateOrRegion: "MI",
      country: "USA",
      venue: "Double JJ Resort",
      timezone: "America/Detroit",
      latitude: 43.5162,
      longitude: -86.3498,
      parkingNotes:
        "This is another festival where daily off-site driving is the hard mode. On-site camping removes a lot of hidden friction.",
      neighborhoodSummary:
        "On-site camping is the obvious baseline. Whitehall and Montague are the closest hotel fallback, and Grand Rapids only makes sense if you value airport access over daily ease.",
    },
    airportOptions: [
      {
        airportIata: "GRR",
        priority: 1,
        driveDistanceMi: 72,
        driveMinutes: 84,
        shuttleRelevant: false,
        notes: "The cleanest airport compromise for Electric Forest.",
      },
      {
        airportIata: "DTW",
        priority: 2,
        driveDistanceMi: 203,
        driveMinutes: 196,
        shuttleRelevant: false,
        notes: "More airfare depth, but the transfer is long enough to change the whole trip feel.",
      },
    ],
    lodgingZones: [
      {
        label: "GA Camping",
        description: "Standard on-site Electric Forest camping inside the venue footprint.",
        centroidLatitude: 43.5162,
        centroidLongitude: -86.3498,
        distanceToVenueMi: 0.1,
        typicalDriveMin: 0,
        convenienceScore: 99,
      },
      {
        label: "Whitehall / Montague",
        description:
          "Closest realistic hotel fallback if you want a bed and accept the daily transfer penalty.",
        centroidLatitude: 43.4101,
        centroidLongitude: -86.357,
        distanceToVenueMi: 10.8,
        typicalDriveMin: 18,
        convenienceScore: 61,
      },
      {
        label: "Grand Rapids",
        description:
          "Airport-adjacent comfort and inventory, but definitely not the low-friction way to do Forest.",
        centroidLatitude: 42.9634,
        centroidLongitude: -85.6681,
        distanceToVenueMi: 71.7,
        typicalDriveMin: 84,
        convenienceScore: 31,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-06-25T14:00:00-04:00",
        endsAt: "2026-06-29T02:00:00-04:00",
        gatesOpenLocalTime: "Thursday afternoon arrival assumption",
        dailyEndLocalTime: "Late-night close carried from recent operating pattern",
        defaultArrivalBufferHours: 16,
        defaultDepartureBufferHours: 12,
        metadataSourceUrl: "https://www.electricforest.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.95,
        metadataNotes:
          "Official homepage confirms June 25-28, 2026. Detailed 2026 daily ops are not fully posted yet, so Festival Companion uses a broad late-night attendance window consistent with recent editions.",
        ticketPlaceholderAmount: "600",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.electricforest.com/",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.28,
        ticketNotes:
          "The official 2026 onsale flow exists, but public price extraction was blocked in this environment. This is a rounded GA planning benchmark, not a claimed live quote.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "governors-ball",
      name: "Governors Ball",
      description:
        "A Queens city-festival weekend where airport choice and hotel neighborhood do more work than the sticker price on the pass.",
      officialWebsite: "https://www.govball.com/",
      campingAvailable: false,
      historicMonth: 6,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "No current official shuttle is posted, so subway access and hotel neighborhood selection are the real friction levers.",
    },
    location: {
      slug: "flushing-meadows-corona-park",
      city: "New York",
      stateOrRegion: "NY",
      country: "USA",
      venue: "Flushing Meadows Corona Park",
      timezone: "America/New_York",
      latitude: 40.7498,
      longitude: -73.8447,
      parkingNotes:
        "Driving into festival traffic around the park is usually the wrong trade. Subway and neighborhood stays beat parking stress most years.",
      neighborhoodSummary:
        "Flushing and Corona are the lowest-friction play, Long Island City balances access with better hotel stock, and Midtown only wins if you care more about nightlife than commute ease.",
    },
    airportOptions: [
      {
        airportIata: "LGA",
        priority: 1,
        driveDistanceMi: 4,
        driveMinutes: 16,
        shuttleRelevant: false,
        notes: "The easiest airport by a wide margin for Governors Ball.",
      },
      {
        airportIata: "JFK",
        priority: 2,
        driveDistanceMi: 10,
        driveMinutes: 22,
        shuttleRelevant: false,
        notes: "Still workable, but with more airport transfer friction than LaGuardia.",
      },
      {
        airportIata: "EWR",
        priority: 3,
        driveDistanceMi: 30,
        driveMinutes: 55,
        shuttleRelevant: false,
        notes: "Useful for airfare depth, but the cross-region transfer is real.",
      },
    ],
    lodgingZones: [
      {
        label: "Flushing / Corona",
        description: "Lowest-friction stay if your main goal is getting in and out of the park easily.",
        centroidLatitude: 40.7569,
        centroidLongitude: -73.829,
        distanceToVenueMi: 1.5,
        typicalDriveMin: 10,
        convenienceScore: 91,
      },
      {
        label: "Long Island City",
        description:
          "More hotel depth and a clean subway path to Queens without fully paying Midtown rates.",
        centroidLatitude: 40.7447,
        centroidLongitude: -73.9485,
        distanceToVenueMi: 7.7,
        typicalDriveMin: 23,
        convenienceScore: 77,
      },
      {
        label: "Midtown East / Grand Central",
        description:
          "Classic NYC hotel base with nightlife upside, but definitely more daily transit burden than staying in Queens.",
        centroidLatitude: 40.7527,
        centroidLongitude: -73.9772,
        distanceToVenueMi: 10.4,
        typicalDriveMin: 32,
        convenienceScore: 61,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.CONFIRMED,
        isCurrentEdition: true,
        startsAt: "2026-06-05T12:00:00-04:00",
        endsAt: "2026-06-07T22:00:00-04:00",
        gatesOpenLocalTime: "12:00-ish daily assumption",
        dailyEndLocalTime: "22:00-ish nightly assumption",
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl: "https://www.govball.com/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.97,
        metadataNotes:
          "Official homepage confirms June 5-7, 2026 at Flushing Meadows Corona Park. Detailed 2026 daily hours are not fully posted yet, so Festival Companion keeps recent city-festival timing assumptions broad.",
        ticketPlaceholderAmount: "349",
        ticketCurrency: "USD",
        ticketSourceUrl: "https://www.govball.com/tickets",
        ticketObservedAt: observedAt,
        ticketConfidence: 0.93,
        ticketNotes:
          "Uses the official 3-day general admission starting price shown on the ticket page.",
        shuttleOptions: [],
      },
    ],
  },
  {
    festival: {
      slug: "afropunk-brooklyn",
      name: "Afropunk Brooklyn",
      description:
        "A culturally important Brooklyn watchlist where the local DNA is real, but a standalone 2026 edition is not publicly posted strongly enough to plan around yet.",
      officialWebsite: "https://afropunk.com/brooklyn/",
      campingAvailable: false,
      historicMonth: 8,
      historicSeason: FestivalSeason.SUMMER,
      shuttleNotes:
        "No current shuttle plan is posted. If Brooklyn returns in full, subway access and neighborhood choice should matter more than rideshare-only assumptions.",
    },
    location: {
      slug: "prospect-park-bandshell-brooklyn",
      city: "Brooklyn",
      stateOrRegion: "NY",
      country: "USA",
      venue: "Prospect Park Bandshell (watchlist anchor)",
      timezone: "America/New_York",
      latitude: 40.6606,
      longitude: -73.969,
      parkingNotes:
        "Prospect Park-area events are not driver-friendly. Subway access and nearby neighborhoods are the cleaner planning frame.",
      neighborhoodSummary:
        "Prospect Heights and Park Slope are the lowest-friction base, Fort Greene and Downtown Brooklyn give broader hotel stock, and Lower Manhattan is workable if you care more about city access than commute ease.",
    },
    airportOptions: [
      {
        airportIata: "JFK",
        priority: 1,
        driveDistanceMi: 13,
        driveMinutes: 28,
        shuttleRelevant: false,
        notes: "Usually the cleanest airport for Brooklyn-focused festival travel.",
      },
      {
        airportIata: "LGA",
        priority: 2,
        driveDistanceMi: 14,
        driveMinutes: 31,
        shuttleRelevant: false,
        notes: "Very workable, but the transfer path is a little less direct than JFK for south Brooklyn.",
      },
      {
        airportIata: "EWR",
        priority: 3,
        driveDistanceMi: 24,
        driveMinutes: 54,
        shuttleRelevant: false,
        notes: "Only worth it if airfare savings are meaningful enough to offset the extra airport friction.",
      },
    ],
    lodgingZones: [
      {
        label: "Prospect Heights / Park Slope",
        description: "Best low-friction neighborhood base if a Brooklyn edition returns near Prospect Park.",
        centroidLatitude: 40.6749,
        centroidLongitude: -73.9708,
        distanceToVenueMi: 1.3,
        typicalDriveMin: 9,
        convenienceScore: 89,
      },
      {
        label: "Fort Greene / Downtown Brooklyn",
        description:
          "Broad hotel access and strong subway connectivity, with a slightly longer festival-day move south.",
        centroidLatitude: 40.6895,
        centroidLongitude: -73.9833,
        distanceToVenueMi: 4.2,
        typicalDriveMin: 21,
        convenienceScore: 72,
      },
      {
        label: "Lower Manhattan",
        description:
          "Works if you want to pair the trip with a bigger NYC stay, but it is not the smoothest daily festival base.",
        centroidLatitude: 40.713,
        centroidLongitude: -74.0062,
        distanceToVenueMi: 7.6,
        typicalDriveMin: 30,
        convenienceScore: 58,
      },
    ],
    editions: [
      {
        year: 2026,
        editionKey: "main",
        editionName: null,
        status: FestivalEditionStatus.TENTATIVE,
        isCurrentEdition: true,
        startsAt: null,
        endsAt: null,
        gatesOpenLocalTime: null,
        dailyEndLocalTime: null,
        defaultArrivalBufferHours: 8,
        defaultDepartureBufferHours: 10,
        metadataSourceUrl: "https://afropunk.com/brooklyn/",
        metadataObservedAt: observedAt,
        metadataConfidence: 0.18,
        metadataNotes:
          "As of 2026-03-23, the Brooklyn page surfaces archive and partner-event context rather than a clearly announced standalone 2026 Brooklyn edition. Festival Companion keeps this as an explicit watchlist item with no trip window.",
        ticketPlaceholderAmount: null,
        ticketCurrency: "USD",
        ticketSourceUrl: null,
        ticketObservedAt: null,
        ticketConfidence: null,
        ticketNotes:
          "No current standalone Brooklyn ticket was available to capture from official sources on 2026-03-23.",
        shuttleOptions: [],
      },
    ],
  },
];
