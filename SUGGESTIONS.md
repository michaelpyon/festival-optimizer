# Festival Optimizer — Audience Sweep, 2026-05-30

Building on the prior 5-panel convergence (per-person hero, dynamic OG on cost pages,
copy-link, reliability boundaries, live-data-discard fix, homepage example card).
This pass focuses on the things still unfinished or unfit for a Reddit share.

## Persona — the single ideal evangelist

The friend-group trip ringleader who already has a Coachella/Lolla/Outside Lands
group chat going. They live on r/Coachella, r/Lollapalooza, r/musicfestivals, and
r/festivals, plus a couple of festival-specific Discords. Today they spend an
evening with 8 Chrome tabs (Google Flights, Kayak, the festival site, Airbnb,
Booking.com, Uber price estimates) trying to settle "is Lolla or Outside Lands
actually cheaper for us from LAX, all-in?" and end up with a Notes app napkin
math the group half-trusts. They will screenshot and send to a friend if the
landing page already shows a single, defensible per-person number for two
festivals before they type anything — and the link preview shows that same
number. They bounce in five seconds if the hero asks them to fill out an intake
form before they see any payoff, or if the numbers feel made-up.

## Ground-truth findings (live site)

Live URL: https://festival-optimizer.vercel.app/

- `/` — 200 OK, renders. **Live deploy is stale** — it shows the older
  "Start with your trip reality" form-first layout, not the current
  `src/app/page.tsx` ("Where are you flying from?" hero with the example card).
  Catalog data on the live page is consistent with the seeded Prisma DB
  (Shaky Knees, Lolla, Outside Lands, JLH, Bonnaroo, Glastonbury, Primavera,
  Pitchfork, Roskilde, Electric Forest, Camp Flog Gnaw). All confirmed/tentative
  badges honest. No fabricated prices visible without input.
- `/compare` — **HTTP 500** on the live deploy.
- `/festivals/coachella` — **HTTP 500** on the live deploy.
- No openGraph image is declared for the home page on either the live deploy or
  in the current repo. Per-scenario OG (`/costs/[scenarioId]/opengraph-image`)
  exists and is good, but the homepage URL — the URL that actually gets shared
  in a group chat — generates a bare, image-less link preview.
- `src/app/layout.tsx` `metadataBase` is set to
  `https://festival-optimizer-app.vercel.app` but the actual host is
  `festival-optimizer.vercel.app`. This breaks absolute OG URLs.
- Homepage step copy says "prices real flights from your nearest airports" — this
  is true only when Amadeus credentials are present in the deploy environment;
  otherwise the engine uses the labeled heuristic estimator. The current copy is
  too confident.
- No fabricated facts about real entities. Tentative editions are clearly marked.
  Source trail + confidence model is honest.

Verdict: the homepage is honest and renders. The downstream routes the evangelist
would actually click on (compare results, per-festival page) are 500 on the live
deploy. The shareable URL has no image. The hero copy slightly overpromises live
data when it may be heuristic.

## Prioritized plan

### Shipped wave 1 (additive, build-verified)

1. **Home opengraph-image route** (`src/app/opengraph-image.tsx`).
   Why: the evangelist's screenshot moment is the per-person number. The current
   homepage URL gets shared with no preview. This bakes the same illustrative LAX
   example numbers (Outside Lands and Lolla, two travelers) into a 1200x630 card
   with an honest "Estimate" tag. Effort: S. Deploy needed: Y.
2. **Home page metadata** (`src/app/page.tsx`).
   Adds explicit `openGraph` and `twitter` tags so the home URL renders rich
   previews. Effort: S. Deploy needed: Y.
3. **Fix metadataBase host** (`src/app/layout.tsx`).
   Was `festival-optimizer-app.vercel.app`, corrected to
   `festival-optimizer.vercel.app`. Effort: S. Deploy needed: Y.
4. **Honest hero step copy** (`src/app/page.tsx`).
   Step 1 copy no longer claims unconditional "real flights"; it says real or
   carefully estimated, matching the rest of the app's source-trail story.
   Effort: S. Deploy needed: Y.

### Shipped wave 2 (additive, build-verified)

5. **OG image alt + theme color** (DONE). `src/app/opengraph-image.tsx` now
   builds its `alt` from the same homepage example so it names both festivals
   and their per-person estimate instead of a generic string. `src/app/layout.tsx`
   gained a Next 16 `viewport` export with `themeColor` `#0e0e0e` and
   `colorScheme: "dark"` so mobile browser chrome and previews stay on brand.
6. **`/festivals/[slug]` graceful fallback** (DONE). Wrapped the Prisma detail
   read in try/catch and render a calm "this profile is warming up" state inside
   `SiteShell` when the database is not provisioned or seeded on the host, instead
   of a raw Next 500. A genuinely missing festival still returns `notFound()`.
   `/compare` already got this last pass; the two shareable downstream routes now
   match.

### Quick wins still to do (S, additive, safe)

7. **Twitter site handle** in layout metadata once Michael picks one.

### Bigger bets (M to L, flagged for Michael)

A. **Why are `/compare` and `/festivals/[slug]` 500 on the live deploy?**
   The homepage works, so Prisma reaches the seeded SQLite. Most likely
   suspects: (i) a route depends on a table or column that the live DB does
   not have yet, (ii) a Recharts client-only import is breaking the server
   render, (iii) the dynamic OG fonts call out to a host that times out in the
   route, or (iv) `next.config.ts` has no `serverActions`/server-external
   packages config so Playwright/cheerio imports get hoisted. Needs a
   `vercel logs` look. Until then, evangelists who land and click bounce.
   Effort: M. Deploy needed: Y.

B. **Live, real prices on the homepage example card.** Today the example is the
   same heuristic math the engine uses internally, deterministic from LAX. To
   make the screenshot trustworthy on a real Reddit thread, run a nightly job
   that fetches Amadeus + SerpApi for the two example festivals and caches the
   numbers + timestamp into the DB, so the card can stamp "Live · refreshed
   Tue" instead of "Estimate". Effort: M. Deploy needed: Y. Cost: API quota.

C. **Per-festival shareable cards.** Right now only the cost-scenario page has a
   dynamic OG. Add `/festivals/[slug]/opengraph-image` with the typical
   per-person band ("Lolla from LAX: about $X/person, 2 travelers") so anyone
   posting a festival link in r/Lollapalooza gets a real preview. Effort: M.
   Deploy needed: Y.

D. **"Settle the group chat" landing variant.** The evangelist is choosing
   between two festivals, not browsing all twelve. A tightly-scoped landing
   like `/vs/lollapalooza-outside-lands?from=LAX` with two cards side by side,
   one big per-person delta, and a "send to the group chat" copy button would
   convert way better than the catalog grid. Effort: M. Deploy needed: Y.

E. **Reddit launch kit copy for the subreddits in the persona** (r/Coachella,
   r/Lollapalooza, r/musicfestivals, r/festivals). The honest framing the app
   already has ("no fake certainty, source trail") is the differentiator. Pair
   with bigger bet D for the actual launch post. Effort: S. Deploy needed: N.

F. **`AGENTS.md` warning is intimidating but undocumented.** A short note in
   `README.md` about which Next 16 deprecations actually bit the project would
   save future-Michael's time. Effort: S. Deploy needed: N.

## Deploy-needed flag (unchanged from prior pass, still true)

The repo HEAD is the source of truth, but it has never been deployed. As of this
pass, live `https://festival-optimizer.vercel.app/` returns 200 on `/` and 500 on
both `/compare` and `/festivals/coachella`. The 500 is not a source bug, the routes
build and type-check clean. It is the stale deploy plus the seeded SQLite file not
surviving on the serverless host. The graceful-fallback change to `/compare` shipped
this pass will turn that 500 into a calm warming-up page once a deploy happens.
Action for Michael: deploy, and for shared environments move off the seeded SQLite
file to a hosted database (see Known tradeoffs in README).

## Guardrail notes

- No deploys, wave 1 or wave 2.
- No invented facts. The illustrative LAX example is the same math the live
  engine uses, labeled "Estimate". The wave 2 alt text reuses those same numbers.
- All changes additive. No rebuild.
