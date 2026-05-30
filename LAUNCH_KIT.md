# Reddit launch kit (DRAFT, for Michael to send)

Draft copy for posting Festival Optimizer to the subreddits in the target persona.
Nothing here gets posted automatically. Michael reviews, edits, and posts.

## Do not post until these are true

1. The live site is up and the downstream routes work. As of the last audit,
   `/compare` and `/festivals/[slug]` returned HTTP 500 on the live deploy (see
   SUGGESTIONS.md, bigger bet A). Posting a link that 500s when a Redditor clicks
   "compare" is worse than not posting. Verify the full click path on the live URL
   first: home, run a comparison, open a festival, open a cost breakdown.
2. The shareable URL renders a link preview (home `opengraph-image` is in the repo
   but only takes effect once deployed).
3. You are using the real live host. Confirm the metadataBase host in
   `src/app/layout.tsx` matches wherever it is actually deployed.

## Positioning (the honest differentiator)

Most "festival cost" threads end in Notes-app napkin math the group half trusts.
The wedge here is not fake precision. It is that every number carries a source
trail: the provider, the date it was observed, and a confidence label, and
estimates are labeled as estimates rather than dressed up as quotes. Lead with
that. Do not claim live or real-time pricing unless Amadeus and SerpApi
credentials are actually configured on the deploy; without them the engine uses a
labeled heuristic estimator, which is fine to say out loud.

Rules for every post below:

- No invented dollar figures. Let people run their own city. If you cite the
  homepage example, call it an estimate, not a quote.
- No "live prices" claim unless the API credentials are live.
- Respect each subreddit's self-promotion rules. Check the sidebar and recent mod
  posts before posting. When in doubt, ask the mods first.
- Reply to comments yourself. Tools posted and abandoned read as spam.

## r/festivals and r/musicfestivals (broad, tool-friendly)

Title:
I built a tool that prices a festival trip end to end (flights, hotel, transport, tickets) per person, with a source trail on every number

Body:
Every year my group chat burns an evening with 8 tabs open trying to settle which
festival is actually cheaper for us once you count flights, hotel, ground
transport, and tickets, not just the ticket. So I built a small tool that does the
whole-trip math from your home city and shows it per person.

The part I cared about most: it does not fake precision. Each number shows where it
came from, when it was observed, and a confidence label. Estimates are clearly
marked as estimates. When live flight and hotel APIs are not available it falls
back to a labeled estimator instead of pretending.

Catalog right now is a curated set (Coachella, Lollapalooza, Outside Lands, Shaky
Knees, Just Like Heaven, Camp Flog Gnaw, and more). Free, no signup to see numbers.
Would love feedback on which festivals to add and where the estimates feel off.

[link]

## r/Coachella

Title:
Made a trip-cost tool: punch in your home city, see Coachella all-in per person (flights, hotel, transport, ticket)

Body:
Coachella threads always come down to "is it worth it once you count everything,"
so I built a tool that prices the full trip per person from wherever you are flying
from, not just the wristband. It shows the airport options, the lodging zones, and
a per-person total, and every figure carries its source and a confidence label so
you can see what is a real quote versus a labeled estimate.

The 2026 ticket figure is the official resident-sale GA amount used as a current
placeholder, not the cheapest historical tier, and it says so. Curious whether the
Indio lodging and airport assumptions match what regulars actually do.

[link]

## r/Lollapalooza

Title:
Lolla vs other festivals, priced as a full trip per person from your city

Body:
I kept trying to settle "is Lolla or [other festival] actually cheaper for us
all-in from our airport" and never trusted the napkin math, so I built a tool for
exactly that. Enter your home city, get a per-person total across flights, hotel,
ground transport, and ticket, with the source and confidence shown on each number.

It is honest about precision: where it is estimating, it says so. Would love a gut
check from people who have done the Chicago hotel and transit math for real.

[link]

## Comment-reply snippets (reuse as needed)

On "are these prices real":
The flight and hotel numbers are live quotes when the APIs are configured;
otherwise they are a labeled estimate, and the page tells you which one you are
looking at. Tickets use the official current-edition amount as a placeholder. Run
your own city and check the source trail under each number.

On "you forgot [festival]":
Catalog is curated by hand right now so the dates, airports, and lodging zones are
real rather than scraped guesses. Tell me which one you want and the home city you
would price it from and I will look at adding it.

On "where is the data from":
Festival metadata is from official or support pages with the collection date
recorded. Routing and distances are computed. Flights and hotels are live APIs when
available, labeled heuristics otherwise. Nothing is presented as more certain than
it is.
