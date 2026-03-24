import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { SiteShell } from "@/components/layout/site-shell";
import { buttonLinkVariants } from "@/lib/button-styles";
import { Card, CardContent } from "@/components/ui/card";
import { getSavedTrips } from "@/lib/catalog";
import { formatConfidence, formatCurrency, formatDateLabel } from "@/lib/format";

export default async function SavedTripsPage() {
  const trips = await getSavedTrips();

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Saved Trips"
          title="Past comparison runs and stored trip snapshots"
          description="Saved trips will become the home for reusable quote sets and side-by-side scenario histories."
        />

        {trips.length === 0 ? (
          <Card className="border-border/80 bg-card shadow-sm">
            <CardContent className="space-y-4 px-6 py-8">
              <p className="font-heading text-2xl font-semibold text-balance">
                Nothing saved yet
              </p>
              <p className="max-w-2xl text-sm leading-6 text-pretty text-muted-foreground">
                Once you run quote collection, completed search runs will show up
                here with their best scenario, confidence, and timestamp.
              </p>
              <Link href="/" className={buttonLinkVariants({})}>
                Start a comparison
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-4">
            {trips.map((trip) => (
              <Card key={trip.id} className="border-border/80 bg-card shadow-none">
                <CardContent className="flex flex-col gap-4 px-5 py-5 md:flex-row md:items-center md:justify-between">
                  <div className="space-y-1">
                    <p className="font-medium text-foreground">
                      {trip.label ?? `Search run ${trip.id.slice(0, 8)}`}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {trip.userPreference?.sourceCity ?? "Source city TBD"} •{" "}
                      {trip.userPreference?.travelersCount ?? 0} travelers •{" "}
                      updated {formatDateLabel(trip.updatedAt)}
                    </p>
                    <p className="text-sm leading-6 text-pretty text-muted-foreground">
                      {trip.festivalSummary}
                    </p>
                  </div>
                  <div className="flex flex-col items-start gap-3 md:items-end">
                    {trip.recommendedScenario ? (
                      <>
                        <p className="font-mono text-lg font-semibold tabular-nums text-foreground">
                          {formatCurrency(trip.recommendedScenario.totalAmount.toString())}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatConfidence(trip.recommendedScenario.confidence)} confidence
                        </p>
                      </>
                    ) : (
                      <p className="text-sm text-muted-foreground">
                        {trip.costScenarios.length} saved scenarios
                      </p>
                    )}
                    <Link
                      href={`/compare?run=${trip.id}`}
                      className={buttonLinkVariants({ variant: "outline" })}
                    >
                      Open run
                    </Link>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </SiteShell>
  );
}
