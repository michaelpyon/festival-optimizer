import Link from "next/link";
import { notFound } from "next/navigation";

import { SectionHeading } from "@/components/common/section-heading";
import { StatusChip } from "@/components/common/status-chip";
import { SiteShell } from "@/components/layout/site-shell";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
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
    return "This festival is in the catalog, but it still needs enough current logistics data before Festival Companion should recommend it confidently.";
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

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-12 sm:px-6 lg:px-8">
        <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
          <div className="space-y-4">
            <div className="flex flex-wrap gap-2">
              {currentEditions.map((edition) => (
                <StatusChip
                  key={edition.id}
                  tone={
                    edition.status === "CONFIRMED"
                      ? "confirmed"
                      : edition.status === "TENTATIVE"
                        ? "tentative"
                        : "historic"
                  }
                  label={
                    edition.editionName
                      ? `${edition.status.toLowerCase()} ${edition.editionName.toLowerCase()}`
                      : edition.status.toLowerCase()
                  }
                />
              ))}
            </div>
            <SectionHeading
              eyebrow="Festival Detail"
              title={festival.name}
              description={`${location?.city ?? "Location TBD"}${location?.stateOrRegion ? `, ${location.stateOrRegion}` : ""} • ${location?.venue ?? "Venue TBD"}`}
            />
            <p className="max-w-3xl text-lg leading-8 text-pretty text-muted-foreground">
              {festival.description}
            </p>
          </div>
          <Card className="border-border/80 bg-card shadow-sm">
            <CardContent className="space-y-4 px-5 py-5">
              <p className="text-xs uppercase text-muted-foreground">Recommendation</p>
              <p className="text-sm leading-6 text-pretty text-muted-foreground">
                {recommendation}
              </p>
              {festival.officialWebsite ? (
                <a
                  href={festival.officialWebsite}
                  target="_blank"
                  rel="noreferrer"
                  className={buttonLinkVariants({
                    variant: "outline",
                    className: "w-full",
                  })}
                >
                  Official site
                </a>
              ) : null}
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-4 lg:grid-cols-3">
          {currentEditions.map((edition) => (
            (() => {
              const travelWindow = inferTravelWindow({
                startsAt: edition.startsAt,
                endsAt: edition.endsAt,
                arrivalBufferHours: edition.defaultArrivalBufferHours,
                departureBufferHours: edition.defaultDepartureBufferHours,
              });

              return (
                <Card key={edition.id} className="border-border/80 bg-card shadow-none">
                  <CardHeader className="space-y-2">
                    <CardTitle className="font-heading text-2xl">
                      {edition.editionName ?? `${edition.year} edition`}
                    </CardTitle>
                    <p className="text-sm text-muted-foreground">
                      {formatFestivalDateRange(edition.startsAt, edition.endsAt)}
                    </p>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-1">
                      <p className="text-xs uppercase text-muted-foreground">
                        Ticket placeholder
                      </p>
                      <p className="font-mono text-lg font-semibold tabular-nums">
                        {formatCurrency(
                          edition.ticketPlaceholderAmount?.toString() ?? null,
                          edition.ticketCurrency,
                        )}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Confidence {formatConfidence(edition.ticketConfidence)}
                      </p>
                    </div>
                    <Separator />
                    <div className="space-y-1 text-sm text-muted-foreground">
                      <p>
                        Suggested stay window:{" "}
                        {travelWindow
                          ? formatTripWindow(travelWindow.stayStart, travelWindow.stayEnd)
                          : "Needs current dates"}
                      </p>
                      <p>Venue opens: {edition.gatesOpenLocalTime ?? "TBD"}</p>
                      <p>Daily end: {edition.dailyEndLocalTime ?? "TBD"}</p>
                      <p>
                        Metadata confidence {formatConfidence(edition.metadataConfidence)}
                      </p>
                    </div>
                  </CardContent>
                </Card>
              );
            })()
          ))}
        </section>

        {location ? (
          <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
            <div className="space-y-5">
              <SectionHeading
                title="Airport options"
                description="Ranked nearby airports and their rough ground-transfer burden into the festival market."
              />
              <div className="grid gap-3">
                {location.airportOptions.map((option) => (
                  <Card key={option.id} className="border-border/80 bg-card shadow-none">
                    <CardContent className="space-y-3 px-5 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">
                            {formatAirportLabel(
                              option.airport.city,
                              option.airport.iataCode,
                              option.airport.stateOrRegion,
                            )}
                          </p>
                          <p className="text-sm text-muted-foreground">
                            {option.airport.name}
                          </p>
                        </div>
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                          Priority {option.priority}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>{option.driveDistanceMi ?? "TBD"} mi</span>
                        <span>{option.driveMinutes ?? "TBD"} min</span>
                        <span>{option.shuttleRelevant ? "Shuttle relevant" : "Direct venue transfer"}</span>
                      </div>
                      {option.notes ? (
                        <p className="text-sm leading-6 text-pretty text-muted-foreground">
                          {option.notes}
                        </p>
                      ) : null}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>

            <div className="space-y-5">
              <SectionHeading
                title="Lodging zones"
                description="The app searches near the venue first, then falls back to practical hotel clusters when the close-in inventory gets ugly."
              />
              <div className="grid gap-3">
                {location.lodgingZones.map((zone) => (
                  <Card key={zone.id} className="border-border/80 bg-card shadow-none">
                    <CardContent className="space-y-3 px-5 py-5">
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="font-medium text-foreground">{zone.label}</p>
                          <p className="text-sm text-muted-foreground">
                            {zone.description}
                          </p>
                        </div>
                        <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                          {zone.convenienceScore ?? "TBD"} / 100
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 text-sm text-muted-foreground">
                        <span>{zone.distanceToVenueMi ?? "TBD"} mi to venue</span>
                        <span>{zone.typicalDriveMin ?? "TBD"} min typical drive</span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </section>
        ) : null}

        <section className="grid gap-8 lg:grid-cols-[1fr_1fr]">
          <div className="space-y-5">
            <SectionHeading
              title="Shuttle analysis"
              description="Official shuttle options are broken out separately because they can beat direct rideshare on both cost and sanity."
            />
            <div className="grid gap-3">
              {currentEditions.flatMap((edition) => edition.shuttleOptions).length > 0 ? (
                currentEditions.flatMap((edition) =>
                  edition.shuttleOptions.map((option) => (
                    <Card key={option.id} className="border-border/80 bg-card shadow-none">
                      <CardContent className="space-y-3 px-5 py-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">{option.name}</p>
                            <p className="text-sm text-muted-foreground">
                              {option.passType ?? option.operatorName ?? "Official shuttle"}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                            {formatCurrency(option.fareAmount?.toString() ?? null, option.currency)}
                          </span>
                        </div>
                        <p className="text-sm leading-6 text-pretty text-muted-foreground">
                          {option.operatingNotes ?? "More detailed shuttle logic will populate after quote collection."}
                        </p>
                      </CardContent>
                    </Card>
                  )),
                )
              ) : (
                <Card className="border-border/80 bg-card shadow-none">
                  <CardContent className="px-5 py-5 text-sm leading-6 text-pretty text-muted-foreground">
                    No official shuttle is currently seeded for this festival, so
                    the engine will compare direct rideshare, transit, and
                    drive-yourself fallbacks instead.
                  </CardContent>
                </Card>
              )}
            </div>
          </div>

          <div className="space-y-5">
            <SectionHeading
              title="Cost scenario placeholders"
              description="Cheapest workable, balanced, and comfort scenarios appear here from the most recent comparison runs attached to this festival."
            />
            <div className="grid gap-3">
              {currentEditions.some((edition) => edition.costScenarios.length > 0) ? (
                currentEditions.flatMap((edition) =>
                  groupEditionScenarios(edition.costScenarios).map((scenario) => (
                    <Card key={scenario.id} className="border-border/80 bg-card shadow-none">
                      <CardContent className="space-y-3 px-5 py-5">
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="font-medium text-foreground">
                              {edition.editionName
                                ? `${edition.editionName} • ${scenario.scenarioType
                                    .toLowerCase()
                                    .replaceAll("_", " ")}`
                                : scenario.scenarioType.toLowerCase().replaceAll("_", " ")}
                            </p>
                            <p className="text-sm text-muted-foreground">
                              Confidence {scenario.confidenceLabel}
                            </p>
                          </div>
                          <span className="font-mono text-sm font-semibold tabular-nums text-foreground">
                            {scenario.totalAmountLabel}
                          </span>
                        </div>
                        <Link
                          href={`/costs/${scenario.id}`}
                          className={buttonLinkVariants({ variant: "outline", className: "w-full" })}
                        >
                          Open breakdown
                        </Link>
                      </CardContent>
                    </Card>
                  )),
                )
              ) : (
                [
                  {
                    title: "Cheapest workable",
                    body: "Cuts costs aggressively while still respecting the full-attendance trip window.",
                  },
                  {
                    title: "Balanced",
                    body: "Targets the best overall value when you do not want the cheapest trip to feel punishing.",
                  },
                  {
                    title: "Comfort",
                    body: "Pays for easier airport, hotel, and venue logistics where the friction savings look worth it.",
                  },
                ].map((scenario) => (
                  <Card key={scenario.title} className="border-border/80 bg-card shadow-none">
                    <CardContent className="space-y-2 px-5 py-5">
                      <p className="font-medium text-foreground">{scenario.title}</p>
                      <p className="text-sm leading-6 text-pretty text-muted-foreground">
                        {scenario.body}
                      </p>
                    </CardContent>
                  </Card>
                ))
              )}
            </div>
            <Link
              href="/compare"
              className={buttonLinkVariants({ className: "w-full" })}
            >
              Go run a comparison
            </Link>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
