# Festival Companion

Festival Companion is a Next.js decision engine for comparing music festivals by the full trip, not just the ticket. It prices the minimum viable attendance window, flight options, lodging zones, shuttle tradeoffs, and local transport burden from a traveler’s source city or airport.

The current scaffold is production-shaped:

- curated festival catalog with normalized Prisma models
- persisted comparison runs and cost scenarios
- provider abstraction for festival metadata, flights, hotels, and ground transport
- hybrid data collection strategy with API-first adapters and conservative labeled fallbacks
- admin tools for metadata refresh, quote review, and manual overrides
- tests around the decision engine and normalization helpers

## Product shape

Main routes:

- `/` landing page with intake form
- `/compare` ranked comparison results or catalog preview
- `/festivals/[slug]` festival logistics and scenario detail
- `/costs/[scenarioId]` breakdown, waterfall chart, assumptions, and source trail
- `/saved` persisted search runs
- `/admin` refresh, review, and override controls

## Stack

- Next.js 16 / React 19 / TypeScript
- Tailwind CSS + shadcn-style component primitives
- Prisma + SQLite for local dev
- Zod for validation
- Playwright for browser automation adapters
- Recharts for cost visualization
- date-fns for windowing logic
- Vitest for logic tests

## Architecture

### App layer

- `src/app/*` contains the route tree and server actions.
- `src/components/*` contains presentational UI and small client helpers like pending submit buttons and the Recharts waterfall.

### Decision engine

- `src/server/engine/date-window.ts` infers the minimum trip window that still allows full attendance.
- `src/server/engine/run-comparison.ts` orchestrates provider collection, quote persistence, scenario construction, ranking, and recommendation copy.
- `src/server/engine/local-transport.ts` compares direct rideshare against shuttle-access combinations.
- `src/server/engine/scoring.ts` computes cost, friction, and overall value scores.

### Provider layer

- `src/server/providers/festivals/*`
  - official festival page extraction
  - Ticketmaster Discovery fallback when configured
- `src/server/providers/flights/*`
  - Amadeus API adapter
  - Skyscanner Playwright fallback
  - heuristic airfare estimator when live data is missing
- `src/server/providers/hotels/*`
  - SerpApi Google Hotels adapter
  - Booking Playwright fallback
  - heuristic hotel estimator when inventory is sparse or blocked
- `src/server/providers/ground/*`
  - OSRM routing + rideshare estimator

### Persistence

The Prisma schema is normalized around:

- festivals, locations, editions, airports, lodging zones
- search runs and user preferences
- flight, hotel, and ground transport quotes
- shuttle options
- persisted cost scenarios

Manual migrations are applied through `scripts/apply-migrations.ts` because the local Prisma migration engine was unreliable in this environment. The project still uses standard Prisma models and generated client code.

## Data strategy

Festival Companion does not fake precision. Every quote record stores provider name, normalized provider, amount, source URL, source type, observed timestamp, confidence, and notes.

### Exact vs estimated

Exact or near-exact when available:

- official festival metadata from festival sites
- Ticketmaster metadata when configured
- Amadeus flight offers when credentials are present
- SerpApi hotel pricing when credentials are present

Estimated, but clearly labeled:

- heuristic airfare when live APIs are missing or blocked
- heuristic hotel pricing when inventory is sparse or blocked
- OSRM-routed rideshare estimates for airport transfers and festival commutes
- shuttle comparisons when only fare or stop metadata is known

### Browser automation philosophy

Playwright adapters:

- run headful when desired
- save HTML and screenshots to `artifacts/collection`
- log warnings instead of silently swallowing failures
- do not bypass auth walls or anti-bot systems

If a page blocks automation, the app falls back to a conservative estimate and keeps the confidence score honest.

## Seeded festivals

The starter catalog includes:

- Coachella
- Shaky Knees
- Lollapalooza
- Outside Lands
- Just Like Heaven
- Camp Flog Gnaw

Festival dates are seeded from official or support sources collected on March 23, 2026. Camp Flog Gnaw 2026 remains tentative by design because current-year dates were not officially announced.

## Setup

1. Install dependencies:

```bash
npm install
```

2. Copy environment values:

```bash
cp .env.example .env
```

3. Generate Prisma client, apply the SQLite schema, and seed the catalog:

```bash
npm run db:setup
```

4. Install Playwright Chromium if you want browser automation adapters:

```bash
npm run playwright:install
```

5. Start the app:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Environment variables

Required for local dev:

- `DATABASE_URL`

Optional:

- `AMADEUS_CLIENT_ID`
- `AMADEUS_CLIENT_SECRET`
- `SERPAPI_KEY`
- `TICKETMASTER_API_KEY`
- `COLLECTION_ARTIFACT_DIR`
- `PLAYWRIGHT_HEADFUL`
- `DEFAULT_CURRENCY`

## Scripts

- `npm run dev`
- `npm run build`
- `npm run lint`
- `npm test`
- `npm run db:generate`
- `npm run db:migrate`
- `npm run db:seed`
- `npm run db:setup`
- `npm run db:studio`
- `npm run playwright:install`

## What currently works

- real festival metadata refresh from official pages
- real routing and distance estimates for ground transport
- persisted comparison runs with three scenario types per festival
- admin review and manual override flows
- cost breakdown page with source trail and assumptions

## Known tradeoffs

- live flight collection is strongest when Amadeus credentials are provided; otherwise the app relies on conservative heuristics
- live hotel pricing is strongest with SerpApi credentials; browser automation can be blocked by hotel sites
- the admin refresh tool updates current-edition metadata but does not yet maintain a historical observation table
- SQLite is excellent for local iteration, but Postgres should back shared or concurrent environments

## Testing

Vitest covers:

- attendance-window inference
- averages, medians, and percentiles
- confidence penalties
- scoring behavior
- shuttle-vs-rideshare logic
- quote normalization
- edge cases like no valid flights, sparse hotel samples, no shuttle path, and multi-airport selection

Run:

```bash
npm test
```
