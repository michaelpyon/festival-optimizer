import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { StatusChip } from "@/components/common/status-chip";
import { SiteShell } from "@/components/layout/site-shell";
import { SearchIntakeForm } from "@/components/landing/search-intake-form";
import { Card, CardContent } from "@/components/ui/card";
import { getLandingData } from "@/lib/catalog";

export default async function Home() {
  const data = await getLandingData();

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-20 px-5 py-12 sm:px-6 lg:px-8 lg:py-16">
        <section className="editorial-shell px-6 py-10 sm:px-8 lg:px-10">
          <div className="absolute inset-0 bg-gradient-to-br from-secondary/18 via-transparent to-transparent" />
          <div className="absolute inset-x-0 bottom-0 h-48 bg-gradient-to-t from-background to-transparent" />
          <div className="absolute right-10 top-8 hidden size-32 rounded-full bg-primary/8 blur-3xl lg:block" />
          <div className="absolute bottom-12 left-8 hidden h-28 w-44 rounded-full bg-secondary/22 blur-3xl lg:block" />
          <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="relative z-10 space-y-8">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full bg-primary/12 px-3 py-1 text-[0.68rem] font-medium uppercase tracking-[0.16em] text-primary">
                  Not just a festival directory
                </span>
                <span className="rounded-full bg-card/80 px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                  All-in trip math
                </span>
              </div>
              <div className="space-y-6">
                <p className="editorial-kicker">Atmospheric precision for real festival travel</p>
                <h1 className="max-w-4xl font-heading text-6xl font-medium leading-[0.92] tracking-tight text-balance text-foreground sm:text-7xl">
                  Choose the festival that still wins when the whole trip hits the ledger.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-pretty text-muted-foreground">
                  Festival Companion compares the real trip, not just the lineup
                  poster. It ranks options by total trip cost, convenience, and
                  travel friction from your city or airport.
                </p>
              </div>
              <div className="grid gap-3 sm:grid-cols-3">
                <Card className="bg-card/85 shadow-none">
                  <CardContent className="space-y-2 px-5 py-5">
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                      Current editions
                    </p>
                    <p className="font-mono text-2xl font-semibold tabular-nums">
                      {data.stats.currentEditions}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/85 shadow-none">
                  <CardContent className="space-y-2 px-5 py-5">
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                      Tentative records
                    </p>
                    <p className="font-mono text-2xl font-semibold tabular-nums">
                      {data.stats.tentativeEditions}
                    </p>
                  </CardContent>
                </Card>
                <Card className="bg-card/85 shadow-none">
                  <CardContent className="space-y-2 px-5 py-5">
                    <p className="text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
                      Saved trip runs
                    </p>
                    <p className="font-mono text-2xl font-semibold tabular-nums">
                      {data.stats.savedTripsCount}
                    </p>
                  </CardContent>
                </Card>
              </div>
            </div>
            <SearchIntakeForm
              festivalOptions={data.festivalOptions}
            />
          </div>
        </section>

        <section className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
          <SectionHeading
            eyebrow="How It Thinks"
            title="The app is opinionated about the part people usually undercount"
            description="It looks at the minimum viable trip window, filters travel that actually lets you attend the full festival, and keeps every estimate tied to a source and confidence level."
          />
          <div className="grid gap-4 sm:grid-cols-3">
            {[
              {
                title: "Attendance-safe windows",
                body: "Itinerary logic starts with full-event attendance, not the cheapest flight someone might technically book.",
              },
              {
                title: "Ground transport matters",
                body: "Airport transfers, daily venue commutes, shuttle detours, and late-night rideshare pain all show up in the total.",
              },
              {
                title: "No fake certainty",
                body: "If a number is estimated instead of quoted, the UI shows the assumptions and confidence instead of pretending it is exact.",
              },
            ].map((item) => (
              <Card key={item.title} className="border-border/80 bg-card shadow-none">
                <CardContent className="space-y-3 px-5 py-5">
                  <h3 className="font-heading text-xl font-semibold text-balance">
                    {item.title}
                  </h3>
                  <p className="text-sm leading-6 text-pretty text-muted-foreground">
                    {item.body}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        <section className="space-y-8">
          <SectionHeading
            eyebrow="Seeded Right Now"
            title="A curated starter catalog that already distinguishes confirmed versus tentative editions"
            description="Coachella is modeled as separate weekends. Festivals with no current-year date announcement stay tentative instead of getting fake dates."
          />
          <div className="grid gap-4 lg:grid-cols-3">
            {data.festivalOptions.map((festival) => (
              <Card key={festival.id} className="border-border/80 bg-card shadow-none">
                <CardContent className="space-y-4 px-5 py-5">
                  <div className="flex items-start justify-between gap-3">
                    <div className="space-y-2">
                      <h3 className="font-heading text-2xl font-semibold text-balance">
                        {festival.displayName}
                      </h3>
                      <StatusChip
                        tone={festival.statusTone}
                        label={festival.status.toLowerCase()}
                      />
                    </div>
                    <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                      {festival.city}
                      {festival.stateOrRegion ? `, ${festival.stateOrRegion}` : ""}
                    </span>
                  </div>
                  <p className="text-sm text-muted-foreground">{festival.dateLabel}</p>
                  <p className="text-sm leading-6 text-pretty text-muted-foreground">
                    {festival.valueProps}
                  </p>
                  <Link
                    href={`/festivals/${festival.slug}`}
                    className="inline-flex text-sm font-medium text-primary"
                  >
                    Open festival detail
                  </Link>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
