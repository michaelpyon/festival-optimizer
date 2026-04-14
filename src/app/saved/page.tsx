import Link from "next/link";

import { SiteShell } from "@/components/layout/site-shell";
import { getSavedTrips } from "@/lib/catalog";
import { formatConfidence, formatCurrency, formatDateLabel } from "@/lib/format";

export default async function SavedTripsPage() {
  const trips = await getSavedTrips();

  return (
    <SiteShell>
      <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-16">
          <span className="editorial-kicker mb-4 block">Personal Archive</span>
          <h1 className="text-6xl md:text-8xl font-heading font-bold text-on-background tracking-tighter leading-none">
            Saved <br />
            <span className="text-outline italic">Journeys.</span>
          </h1>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-[1.5fr_1fr] gap-8">
          {/* Left Column: Saved Runs */}
          <section className="space-y-12">
            <div className="flex items-center justify-between">
              <h2 className="text-2xl font-heading text-on-surface">Saved Comparisons</h2>
              <span className="text-on-surface-variant text-sm">{trips.length} TOTAL</span>
            </div>

            {trips.length === 0 ? (
              <div className="bg-surface-container-low rounded-xl p-8 text-center">
                <span className="material-symbols-outlined text-4xl text-outline mb-4 block">bookmark_border</span>
                <h3 className="font-heading text-2xl text-on-surface mb-2">Nothing saved yet</h3>
                <p className="text-on-surface-variant text-sm mb-6 leading-relaxed max-w-md mx-auto">
                  Once you run quote collection, completed search runs will show up here with their best scenario, confidence, and timestamp.
                </p>
                <Link
                  href="/"
                  className="bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-lg py-4 px-8 inline-flex items-center gap-3 active:scale-95 transition-transform"
                >
                  <span className="material-symbols-outlined text-sm">add</span>
                  Start a Comparison
                </Link>
              </div>
            ) : (
              <div className="space-y-6">
                {trips.map((trip) => (
                  <div
                    key={trip.id}
                    className="group relative overflow-hidden rounded-xl bg-surface-container-low p-1 transition-colors duration-500 hover:bg-surface-container-high shadow-xl"
                  >
                    <div className="p-6">
                      <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                        <div>
                          <h3 className="text-xl font-heading text-on-surface mb-1">
                            {trip.label ?? `Search run ${trip.id.slice(0, 8)}`}
                          </h3>
                          <p className="text-sm text-on-surface-variant">
                            {trip.userPreference?.sourceCity ?? "Source city TBD"} •{" "}
                            {trip.userPreference?.travelersCount ?? 0} travelers
                          </p>
                        </div>
                        {trip.recommendedScenario && (
                          <div className="text-right">
                            <p className="font-heading text-2xl text-primary">
                              {formatCurrency(trip.recommendedScenario.totalAmount.toString())}
                            </p>
                            <p className="text-[10px] uppercase tracking-widest text-on-surface-variant">
                              {formatConfidence(trip.recommendedScenario.confidence)} confidence
                            </p>
                          </div>
                        )}
                      </div>

                      <p className="text-sm text-on-surface-variant mb-4">{trip.festivalSummary}</p>

                      <div className="flex items-center justify-between border-t border-outline-variant/10 pt-4">
                        <span className="text-[10px] uppercase tracking-widest text-outline">
                          Updated {formatDateLabel(trip.updatedAt)}
                        </span>
                        <Link
                          href={`/compare?run=${trip.id}`}
                          className="h-12 w-12 rounded-full bg-surface-container-highest flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-on-primary transition-colors duration-300"
                        >
                          <span className="material-symbols-outlined">arrow_forward</span>
                        </Link>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* Right Column */}
          <aside className="space-y-12">
            {/* Quick Action */}
            <div className="bg-secondary-container/10 border border-secondary-container/20 rounded-xl p-8 backdrop-blur-sm relative overflow-hidden">
              <div className="absolute -top-12 -right-12 w-32 h-32 bg-secondary-container/20 blur-3xl rounded-full" />
              <h3 className="text-xl font-heading text-on-surface mb-2">New Comparison</h3>
              <p className="text-on-surface-variant text-sm mb-6 leading-relaxed">
                Run a fresh festival comparison with updated quotes and pricing data.
              </p>
              <Link
                href="/"
                className="w-full py-4 bg-primary text-on-primary font-bold text-xs uppercase tracking-widest rounded-lg flex items-center justify-center gap-3 active:scale-95 transition-transform"
              >
                <span className="material-symbols-outlined text-sm" style={{ fontVariationSettings: "'FILL' 1" }}>compare_arrows</span>
                Start New Comparison
              </Link>
            </div>

            {/* Info Card */}
            <div className="bg-tertiary-container/5 border border-tertiary-container/10 rounded-xl p-8 flex flex-col items-center text-center">
              <span className="material-symbols-outlined text-tertiary-container text-4xl mb-4">info</span>
              <h3 className="text-lg font-heading text-on-surface mb-2">How Saved Trips Work</h3>
              <p className="text-on-surface-variant text-sm mb-6">
                Every comparison run is automatically saved. Reopen any run to see the full breakdown, ranking logic, and source trail.
              </p>
              <Link
                href="/admin"
                className="px-6 py-2 border border-tertiary-container/30 rounded-full text-tertiary text-xs uppercase tracking-widest hover:bg-tertiary/10 transition-colors"
              >
                View Admin Panel
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </SiteShell>
  );
}
