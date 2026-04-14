import Link from "next/link";

import { StatusChip } from "@/components/common/status-chip";
import { SiteShell } from "@/components/layout/site-shell";
import { SiteFooter } from "@/components/layout/site-footer";
import { startComparisonAction } from "@/app/actions/search";
import { PendingSubmitButton } from "@/components/common/pending-submit-button";
import { getLandingData } from "@/lib/catalog";

export default async function Home() {
  const data = await getLandingData();

  // Grab the first 6 festival edition IDs for auto-comparison
  const autoCompareIds = data.festivalOptions.slice(0, 6).map((f) => f.id);

  return (
    <SiteShell>
      {/* Hero Section */}
      <section className="relative min-h-[90vh] flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="w-full h-full bg-gradient-to-br from-secondary-container/20 via-surface to-surface" />
          <div className="absolute inset-0 bg-gradient-to-t from-surface via-surface/40 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-surface/60 via-transparent to-surface/60" />
          <div className="absolute top-20 right-20 w-64 h-64 bg-primary/8 rounded-full blur-[100px]" />
          <div className="absolute bottom-40 left-10 w-48 h-48 bg-secondary-container/30 rounded-full blur-[80px]" />
        </div>
        <div className="relative z-10 w-full max-w-3xl px-6 text-center">
          <p className="editorial-kicker mb-6">
            {data.stats.currentEditions} festivals tracked across {data.stats.savedTripsCount > 0 ? `${data.stats.savedTripsCount} saved trips` : "the globe"}
          </p>
          <h1 className="text-6xl md:text-8xl font-heading font-medium text-primary tracking-tight leading-tight mb-6">
            Where are you <br /><span className="italic">flying from?</span>
          </h1>
          <p className="text-xl text-on-surface-variant max-w-xl mx-auto mb-12">
            Enter your city. We'll price out flights, hotels, transport, and tickets for every festival in the catalog.
          </p>

          {/* Single City Search */}
          <form action={startComparisonAction} className="glass-panel p-3 rounded-full shadow-2xl max-w-2xl mx-auto border border-outline-variant/10">
            {/* Hidden defaults */}
            <input type="hidden" name="travelers" value="2" />
            <input type="hidden" name="roomType" value="PRIVATE_ROOM" />
            <input type="hidden" name="hotelClass" value="MIDSCALE" />
            <input type="hidden" name="priority" value="BEST_VALUE" />
            {autoCompareIds.map((id) => (
              <input key={id} type="hidden" name="festival" value={id} />
            ))}

            <div className="flex items-center gap-2">
              <div className="flex-1 flex items-center px-6 py-3 gap-4">
                <span className="material-symbols-outlined text-primary text-2xl">location_on</span>
                <input
                  name="sourceCity"
                  type="text"
                  required
                  placeholder="Los Angeles, CA"
                  className="bg-transparent border-none p-0 focus:ring-0 focus:outline-none text-on-surface text-lg font-medium placeholder:text-outline-variant w-full"
                />
              </div>
              <PendingSubmitButton
                label="Find Festivals"
                pendingLabel="Searching..."
                size="lg"
                className="rounded-full px-8 h-14 text-sm"
              />
            </div>
          </form>

          <p className="text-sm text-outline mt-6">
            Compares the top {autoCompareIds.length} festivals with balanced pricing. Takes about 30 seconds.
          </p>
        </div>
      </section>

      {/* How It Works */}
      <section className="py-24 px-6 max-w-5xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-1">
          <div className="bg-surface-container-low p-10 rounded-l-xl md:border-r border-outline-variant/10">
            <span className="material-symbols-outlined text-3xl mb-6 text-primary">search</span>
            <h4 className="font-heading text-2xl text-on-surface mb-4">1. Enter your city</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Type where you're flying from. The engine prices real flights from your nearest airports.
            </p>
          </div>
          <div className="bg-surface-container-low p-10">
            <span className="material-symbols-outlined text-3xl mb-6 text-primary">compare_arrows</span>
            <h4 className="font-heading text-2xl text-on-surface mb-4">2. See every festival priced</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Flights, hotels, ground transport, and tickets all roll up into one total per festival.
            </p>
          </div>
          <div className="bg-surface-container-low p-10 rounded-r-xl md:border-l border-outline-variant/10">
            <span className="material-symbols-outlined text-3xl mb-6 text-primary">confirmation_number</span>
            <h4 className="font-heading text-2xl text-on-surface mb-4">3. Pick yours and go deep</h4>
            <p className="text-sm text-on-surface-variant leading-relaxed">
              Click any festival to see the full cost breakdown, transport options, and booking timeline.
            </p>
          </div>
        </div>
      </section>

      {/* Feature Bento */}
      <section className="py-24 px-6 max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
          <div className="md:col-span-7 flex flex-col justify-center">
            <h2 className="text-5xl md:text-7xl font-heading font-medium text-on-surface mb-8 leading-tight">
              Total cost transparency.<br />
              <span className="text-primary italic">No hidden encores.</span>
            </h2>
            <p className="text-lg text-on-surface-variant leading-relaxed mb-12 max-w-xl">
              We calculate the true price of your journey. From the flights to the late-night rides back to your hotel, see it all upfront.
            </p>
          </div>
          <div className="md:col-span-5 bg-surface-container-low rounded-[2rem] p-12 relative overflow-hidden group">
            <div className="absolute top-0 right-0 p-8">
              <span className="material-symbols-outlined text-6xl text-primary/20 group-hover:text-primary transition-colors">analytics</span>
            </div>
            <div className="relative z-10 mt-20">
              <div className="inline-flex items-center gap-2 bg-tertiary-container text-on-tertiary-container px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest mb-4">
                High Confidence
              </div>
              <h3 className="text-3xl font-heading font-medium text-primary mb-4">Price Prediction</h3>
              <p className="text-on-surface-variant">
                Historical trends tell you exactly when to book for the optimal cost-to-experience ratio.
              </p>
            </div>
          </div>

          <div className="md:col-span-4 bg-surface-container-low rounded-[2rem] p-8 overflow-hidden">
            <span className="material-symbols-outlined text-secondary text-4xl mb-6 block">hotel_class</span>
            <h3 className="text-2xl font-heading font-medium text-on-surface mb-2">Smart Lodging</h3>
            <p className="text-sm text-on-surface-variant">
              Zones ranked by convenience score, distance to venue, and realistic drive times.
            </p>
          </div>
          <div className="md:col-span-4 bg-primary-container text-on-primary-container rounded-[2rem] p-8 overflow-hidden">
            <span className="material-symbols-outlined text-4xl mb-6 block">stadium</span>
            <h3 className="text-2xl font-heading font-medium mb-2">Full-Event Windows</h3>
            <p className="text-sm opacity-80">
              Itinerary logic starts with full-event attendance, not the cheapest flight someone might technically book.
            </p>
          </div>
          <div className="md:col-span-4 bg-secondary-container rounded-[2rem] p-8 overflow-hidden">
            <span className="material-symbols-outlined text-secondary text-4xl mb-6 block" style={{ fontVariationSettings: "'FILL' 1" }}>travel_explore</span>
            <h3 className="text-2xl font-heading font-medium text-secondary mb-2">Seamless Transit</h3>
            <p className="text-sm text-on-secondary-container">
              Ground transport, shuttles, and rideshare pain all show up in the total so nothing hides.
            </p>
          </div>
        </div>
      </section>

      {/* Festival Preview Grid */}
      <section className="py-24 bg-surface-container-low/30">
        <div className="max-w-7xl mx-auto px-6">
          <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
            <div>
              <span className="editorial-kicker mb-4 block">What We Compare</span>
              <h2 className="text-5xl font-heading font-medium text-on-surface">The Catalog</h2>
            </div>
            <p className="text-on-surface-variant max-w-sm text-sm">
              These are the festivals the engine prices when you search. Confirmed dates, airport options, and lodging clusters pre-loaded.
            </p>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {data.festivalOptions.map((festival) => (
              <Link
                key={festival.id}
                href={`/festivals/${festival.slug}`}
                className="group bg-surface-container-low rounded-xl p-5 hover:bg-surface-container-high transition-colors"
              >
                <h3 className="font-heading text-lg font-medium text-on-surface group-hover:text-primary transition-colors mb-1">
                  {festival.displayName}
                </h3>
                <p className="text-xs text-on-surface-variant mb-2">
                  {festival.city}{festival.stateOrRegion ? `, ${festival.stateOrRegion}` : ""}
                </p>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-outline">{festival.dateLabel}</span>
                </div>
                <div className="mt-3">
                  <StatusChip tone={festival.statusTone} label={festival.status.toLowerCase()} />
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-32 px-6 text-center">
        <div className="max-w-3xl mx-auto">
          <h2 className="text-5xl md:text-6xl font-heading font-medium mb-6 text-on-surface">
            Your next story awaits.
          </h2>
          <p className="text-xl text-on-surface-variant mb-10 max-w-lg mx-auto">
            Just tell us where you're coming from.
          </p>
          <Link
            href="/"
            className="bg-primary text-on-primary h-16 px-10 rounded-full text-lg font-bold hover:bg-primary-container transition-colors inline-flex items-center gap-3"
          >
            Back to search
            <span className="material-symbols-outlined">arrow_upward</span>
          </Link>
        </div>
      </section>

      <SiteFooter />
    </SiteShell>
  );
}
