import Link from "next/link";
import { notFound } from "next/navigation";

import { StatusChip } from "@/components/common/status-chip";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonLinkVariants } from "@/lib/button-styles";
import {
  formatAirportLabel,
  formatConfidence,
  formatCurrency,
} from "@/lib/format";
import { formatFestivalDateRange, formatTripWindow } from "@/lib/date";
import { getFestivalDetailData, groupEditionScenarios } from "@/lib/catalog";
import { inferTravelWindow } from "@/server/engine/date-window";

type FestivalDetailPageProps = {
  params: Promise<{ slug: string }>;
};

function buildRecommendation(festival: NonNullable<Awaited<ReturnType<typeof getFestivalDetailData>>>) {
  const currentEdition = festival.editions.find((edition) => edition.isCurrentEdition);
  const firstLocation = currentEdition?.location ?? festival.editions[0]?.location;

  if (!currentEdition || !firstLocation) {
    return "This festival is in the catalog, but it still needs enough current logistics data before the app should recommend it confidently.";
  }

  if (currentEdition.status === "TENTATIVE") {
    return "This is one to monitor rather than book today. The venue and airport logic are still useful, but the current-year dates are not official yet.";
  }

  if (festival.campingAvailable) {
    return "This can be a sneaky value winner if you are open to camping. The ticket is not the cheapest, but the lodging substitute can fundamentally change the trip total.";
  }

  if (currentEdition.shuttleOptions.length > 0) {
    return "This one gets much more attractive when you price the official shuttle against direct rideshare. The shuttle meaningfully lowers the local-friction ceiling.";
  }

  return "This is primarily a hotel-cluster and airport-choice problem. If you pick the wrong neighborhood, the trip gets expensive fast; if you pick well, it stays manageable.";
}

export default async function FestivalDetailPage({
  params,
}: FestivalDetailPageProps) {
  const { slug } = await params;
  const festival = await getFestivalDetailData(slug);

  if (!festival) {
    notFound();
  }

  const currentEditions = festival.editions.filter((edition) => edition.isCurrentEdition);
  const location = currentEditions[0]?.location ?? festival.editions[0]?.location;
  const recommendation = buildRecommendation(festival);
  const firstEdition = currentEditions[0];
  const travelWindow = firstEdition ? inferTravelWindow({
    startsAt: firstEdition.startsAt,
    endsAt: firstEdition.endsAt,
    arrivalBufferHours: firstEdition.defaultArrivalBufferHours,
    departureBufferHours: firstEdition.defaultDepartureBufferHours,
  }) : null;

  return (
    <SiteShell>
      {/* Hero Section */}
      <section className="relative min-h-[700px] w-full overflow-hidden flex items-end">
        <div className="absolute inset-0 bg-gradient-to-br from-secondary-container/20 via-surface to-surface" />
        <div className="absolute inset-0 bg-gradient-to-t from-surface via-transparent to-transparent z-10" />
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2">
          <span className="material-symbols-outlined text-[200px] text-primary/10">festival</span>
        </div>
        <div className="relative z-20 w-full max-w-7xl mx-auto px-8 md:px-20 pb-20">
          <span className="editorial-kicker mb-4 block">
            {location?.stateOrRegion ?? ""} • {firstEdition?.year ?? ""}
          </span>
          <h1 className="font-heading text-7xl md:text-9xl font-bold text-on-surface leading-[0.9] tracking-tighter mb-8">
            {festival.name}
          </h1>
          <div className="flex flex-wrap gap-4 mt-8">
            {firstEdition && (
              <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>calendar_today</span>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {formatFestivalDateRange(firstEdition.startsAt, firstEdition.endsAt)}
                </span>
              </div>
            )}
            {location && (
              <div className="glass-panel px-6 py-3 rounded-full flex items-center gap-3">
                <span className="material-symbols-outlined text-primary" style={{ fontVariationSettings: "'FILL' 1" }}>location_on</span>
                <span className="text-xs font-bold uppercase tracking-widest text-on-surface-variant">
                  {location.city}{location.stateOrRegion ? `, ${location.stateOrRegion}` : ""}
                </span>
              </div>
            )}
            {currentEditions.map((edition) => (
              <StatusChip
                key={edition.id}
                tone={edition.status === "CONFIRMED" ? "confirmed" : edition.status === "TENTATIVE" ? "tentative" : "historic"}
                label={edition.editionName ? `${edition.status.toLowerCase()} ${edition.editionName.toLowerCase()}` : edition.status.toLowerCase()}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Lineup & Quick Stats */}
      <section className="px-8 md:px-20 max-w-7xl mx-auto -mt-16 relative z-30">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          {/* Description Card */}
          <div className="md:col-span-8 bg-surface-container-low p-10 rounded-xl">
            <div className="flex justify-between items-end mb-8">
              <h2 className="font-heading text-4xl text-on-surface">About</h2>
              <span className="text-xs text-on-surface-variant tracking-[0.2em] uppercase">
                {location?.venue ?? "Venue TBD"}
              </span>
            </div>
            <p className="text-on-surface-variant text-lg leading-relaxed mb-8">
              {festival.description}
            </p>

            {/* Edition Details */}
            {currentEditions.length > 0 && (
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8 pt-8 border-t border-outline-variant/10">
                {currentEditions.map((edition) => {
                  const editionWindow = inferTravelWindow({
                    startsAt: edition.startsAt,
                    endsAt: edition.endsAt,
                    arrivalBufferHours: edition.defaultArrivalBufferHours,
                    departureBufferHours: edition.defaultDepartureBufferHours,
                  });

                  return (
                    <div key={edition.id}>
                      <p className="text-[10px] text-tertiary-container uppercase tracking-widest mb-2">
                        {edition.editionName ?? `${edition.year} Edition`}
                      </p>
                      <p className="font-heading text-2xl text-on-surface mb-2">
                        {formatCurrency(edition.ticketPlaceholderAmount?.toString() ?? null, edition.ticketCurrency)}
                      </p>
                      <p className="text-xs text-on-surface-variant">
                        {formatConfidence(edition.ticketConfidence)} confidence
                      </p>
                      {editionWindow && (
                        <p className="text-xs text-on-surface-variant mt-1">
                          Stay: {formatTripWindow(editionWindow.stayStart, editionWindow.stayEnd)}
                        </p>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Recommendation Card */}
          <div className="md:col-span-4 bg-tertiary-container p-8 rounded-xl flex flex-col justify-between">
            <div>
              <span className="text-[10px] text-on-tertiary-fixed uppercase tracking-widest mb-4 block">Recommendation</span>
              <span className="material-symbols-outlined text-on-tertiary-fixed text-3xl mb-4 block" style={{ fontVariationSettings: "'FILL' 1" }}>lightbulb</span>
            </div>
            <p className="text-sm text-on-tertiary-container leading-relaxed">
              {recommendation}
            </p>
            {festival.officialWebsite && (
              <a
                href={festival.officialWebsite}
                target="_blank"
                rel="noreferrer"
                className="mt-6 text-[10px] font-bold uppercase tracking-widest text-on-tertiary-fixed hover:underline"
              >
                Official Site →
              </a>
            )}
          </div>
        </div>
      </section>

      {/* Cost Scenarios & Logistics */}
      <section className="px-8 md:px-20 max-w-7xl mx-auto mt-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Cost Scenarios */}
          <div>
            <h2 className="font-heading text-4xl text-on-surface mb-8">Cost Scenarios</h2>
            <div className="space-y-6">
              {currentEditions.some((edition) => edition.costScenarios.length > 0) ? (
                currentEditions.flatMap((edition) =>
                  groupEditionScenarios(edition.costScenarios).map((scenario) => (
                    <div
                      key={scenario.id}
                      className="bg-surface-container-low p-6 rounded-xl flex justify-between items-center group hover:bg-surface-container transition-colors cursor-pointer"
                    >
                      <div className="flex items-center gap-6">
                        <span className="material-symbols-outlined text-primary text-3xl">payments</span>
                        <div>
                          <p className="font-heading text-xl text-on-surface">
                            {edition.editionName
                              ? `${edition.editionName} • ${scenario.scenarioType.toLowerCase().replaceAll("_", " ")}`
                              : scenario.scenarioType.toLowerCase().replaceAll("_", " ")}
                          </p>
                          <p className="text-xs text-on-surface-variant uppercase tracking-widest">
                            {scenario.confidenceLabel}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-heading text-2xl text-on-surface">{scenario.totalAmountLabel}</p>
                        <Link
                          href={`/costs/${scenario.id}`}
                          className="text-[10px] text-primary uppercase tracking-widest hover:underline"
                        >
                          Open Breakdown
                        </Link>
                      </div>
                    </div>
                  )),
                )
              ) : (
                [
                  { title: "Cheapest workable", body: "Cuts costs aggressively while still respecting the full-attendance trip window.", icon: "savings" },
                  { title: "Balanced", body: "Best overall value when you don't want the cheapest trip to feel punishing.", icon: "balance" },
                  { title: "Comfort", body: "Pays for easier airport, hotel, and venue logistics.", icon: "spa" },
                ].map((scenario) => (
                  <div key={scenario.title} className="bg-surface-container-low p-6 rounded-xl flex justify-between items-center">
                    <div className="flex items-center gap-6">
                      <span className="material-symbols-outlined text-primary text-3xl">{scenario.icon}</span>
                      <div>
                        <p className="font-heading text-xl text-on-surface">{scenario.title}</p>
                        <p className="text-xs text-on-surface-variant">{scenario.body}</p>
                      </div>
                    </div>
                    <span className="text-on-surface-variant text-sm">Awaiting data</span>
                  </div>
                ))
              )}
            </div>
            <Link href="/compare" className="mt-8 w-full bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs py-4 rounded-full text-center block">
              Run a Comparison
            </Link>
          </div>

          {/* Transport Comparison */}
          <div>
            <h2 className="font-heading text-4xl text-on-surface mb-8">Transport Options</h2>
            <div className="grid grid-cols-1 gap-1">
              {currentEditions.flatMap((edition) => edition.shuttleOptions).length > 0 ? (
                currentEditions.flatMap((edition) =>
                  edition.shuttleOptions.map((option) => (
                    <div key={option.id} className="bg-surface-container-low p-8 rounded-xl">
                      <div className="flex items-center gap-4 mb-4">
                        <span className="material-symbols-outlined text-3xl text-primary">directions_bus</span>
                        <div>
                          <h4 className="font-heading text-2xl text-on-surface">{option.name}</h4>
                          <p className="text-sm text-on-surface-variant">
                            {option.passType ?? option.operatorName ?? "Official shuttle"}
                          </p>
                        </div>
                      </div>
                      <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                        {option.operatingNotes ?? "More detailed shuttle logic will populate after quote collection."}
                      </p>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-primary" />
                          <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">High Reliability</span>
                        </div>
                        <span className="font-heading text-xl text-primary">
                          {formatCurrency(option.fareAmount?.toString() ?? null, option.currency)}
                        </span>
                      </div>
                    </div>
                  )),
                )
              ) : (
                <div className="bg-surface-container-low p-8 rounded-xl">
                  <span className="material-symbols-outlined text-3xl mb-6 text-on-surface-variant">commute</span>
                  <h4 className="font-heading text-2xl text-on-surface mb-4">No Shuttle Data</h4>
                  <p className="text-sm text-on-surface-variant leading-relaxed mb-4">
                    No official shuttle is currently seeded. The engine will compare direct rideshare, transit, and drive-yourself fallbacks.
                  </p>
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-tertiary-container" />
                    <span className="text-[10px] uppercase tracking-widest text-on-surface-variant">Awaiting Data</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* Airport & Lodging Sections */}
      {location && (
        <section className="px-8 md:px-20 max-w-7xl mx-auto mt-24 mb-12">
          <details className="group bg-surface-container-lowest border border-outline-variant/10 rounded-xl overflow-hidden">
            <summary className="flex items-center justify-between p-8 cursor-pointer list-none hover:bg-surface-container-low transition-colors">
              <div className="flex items-center gap-6">
                <span className="material-symbols-outlined text-tertiary-container">database</span>
                <h3 className="font-heading text-2xl text-on-surface">Airports &amp; Lodging Zones</h3>
              </div>
              <span className="material-symbols-outlined group-open:rotate-180 transition-transform">expand_more</span>
            </summary>
            <div className="p-8 pt-0 grid grid-cols-1 md:grid-cols-2 gap-12 border-t border-outline-variant/5">
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Airport Options</p>
                {location.airportOptions.map((option) => (
                  <div key={option.id} className="bg-surface-container-low p-4 rounded-xl">
                    <p className="font-bold text-on-surface text-sm">
                      {formatAirportLabel(option.airport.city, option.airport.iataCode, option.airport.stateOrRegion)}
                    </p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {option.driveDistanceMi ?? "TBD"} mi • {option.driveMinutes ?? "TBD"} min • Priority {option.priority}
                    </p>
                    {option.notes && <p className="text-xs text-on-surface-variant mt-2">{option.notes}</p>}
                  </div>
                ))}
              </div>
              <div className="space-y-4">
                <p className="text-[10px] uppercase tracking-widest text-primary mb-2">Lodging Zones</p>
                {location.lodgingZones.map((zone) => (
                  <div key={zone.id} className="bg-surface-container-low p-4 rounded-xl">
                    <div className="flex justify-between items-start">
                      <p className="font-bold text-on-surface text-sm">{zone.label}</p>
                      <span className="text-xs text-on-surface-variant">{zone.convenienceScore ?? "TBD"}/100</span>
                    </div>
                    <p className="text-xs text-on-surface-variant mt-1">{zone.description}</p>
                    <p className="text-xs text-on-surface-variant mt-1">
                      {zone.distanceToVenueMi ?? "TBD"} mi • {zone.typicalDriveMin ?? "TBD"} min drive
                    </p>
                  </div>
                ))}
              </div>
            </div>
          </details>
        </section>
      )}
    </SiteShell>
  );
}
