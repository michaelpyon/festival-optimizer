# Festival Companion Autoresearch Program

## Goal

Improve Festival Companion's manual festival catalog coverage so `/compare?sourceAirport=JFK` is meaningfully useful for major festival decision-making before live quote collection runs.

## Primary Metric

Catalog completeness score across the target major festivals, scored `0-3` per festival for a maximum of `33`.

Scoring rubric:

- `0`: festival absent from the compare catalog
- `1`: festival present but missing major compare inputs
- `2`: usable watchlist or starter record with airport + lodging structure and honest tentative notes
- `3`: compare-ready record with current status, realistic airport options, lodging zones, and a workable ticket/transport framing

Target festivals for this loop:

- Bonnaroo
- Glastonbury
- Primavera Sound
- Pitchfork Chicago
- Outside Lands
- Austin City Limits
- Roskilde
- Electric Forest
- Governors Ball
- Lollapalooza
- Afropunk Brooklyn

## Guardrails

- Do not change the Prisma schema.
- Do not add APIs.
- Do not add dependencies.
- Use realistic public data and keep uncertainty explicit.
- If current-year details are not confirmed, prefer a tentative watchlist record over invented precision.
- Keep only changes that improve the catalog completeness score or clearly close a documented catalog gap without making the compare experience less honest.

## Canonical Loop

1. Read this file.
2. Seed and run the app locally.
3. Open `/compare?sourceAirport=JFK`.
4. Score the target festival catalog completeness.
5. Make one targeted catalog improvement in `src/data/manual/festival-catalog.ts`.
6. Re-seed, re-open `/compare`, and re-score.
7. Keep the change only if the score improves.
8. Log the iteration here and sync this file to `~/brain/projects/autoresearch/festival-optimizer/program.md`.

## Iteration Log

### 2026-03-23

- Context:
  The provided machine-local loop file (`/Users/openclaw/.openclaw/workspace/projects/autoresearch/festival-optimizer/program.md`) did not exist on this machine, so this repo-root `program.md` is now the canonical loop file and should be synced into `~/brain/projects/autoresearch/festival-optimizer/program.md`.
- Baseline `/compare?sourceAirport=JFK` completeness:
  - Bonnaroo: `0`
  - Glastonbury: `0`
  - Primavera Sound: `0`
  - Pitchfork Chicago: `0`
  - Outside Lands: `3`
  - Austin City Limits: `0`
  - Roskilde: `0`
  - Electric Forest: `0`
  - Governors Ball: `0`
  - Lollapalooza: `3`
  - Afropunk Brooklyn: `0`
  - Total: `6 / 33`
- Change tested:
  Expanded `src/data/manual/festival-catalog.ts` with 12 missing airports and 9 missing target festivals, using confirmed records where public 2026 data exists and tentative watchlist records where current-year publication is still missing.
- Re-score after `npm run db:seed` and reloading `/compare?sourceAirport=JFK`:
  - Bonnaroo: `3`
  - Glastonbury: `2`
  - Primavera Sound: `3`
  - Pitchfork Chicago: `2`
  - Outside Lands: `3`
  - Austin City Limits: `3`
  - Roskilde: `3`
  - Electric Forest: `3`
  - Governors Ball: `3`
  - Lollapalooza: `3`
  - Afropunk Brooklyn: `2`
  - Total: `30 / 33`
- Decision:
  Keep the change. The compare catalog moved from two compare-ready targets to full visible coverage for all eleven, while still labeling uncertain festivals as watchlist-only instead of pretending they are bookable.
- Verification:
  - `npm run db:seed`
  - `curl http://localhost:3001/compare?sourceAirport=JFK`
  - `npm run lint`
  - `npm test`
  - `npm run build`
- Notes:
  - Glastonbury, Pitchfork Chicago, and Afropunk Brooklyn remain tentative because current-year official publication is not strong enough to support a real trip window.
  - Primavera Sound and Roskilde keep official local-currency ticket placeholders in the catalog. Cross-currency ticket normalization is still a future engine improvement, not part of this loop.
  - Local verification required repairing malformed package install paths in `node_modules` (`dist 2` / `cjs 2` / `shim 2`) so build tooling could resolve existing dependencies. That was an environment repair, not an app-code change.
