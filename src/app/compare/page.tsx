import Link from "next/link";

import { SectionHeading } from "@/components/common/section-heading";
import { FestivalCompareCard } from "@/components/compare/festival-compare-card";
import { FestivalPreviewTable } from "@/components/compare/festival-preview-table";
import { FestivalResultCard } from "@/components/compare/festival-result-card";
import { FestivalResultsTable } from "@/components/compare/festival-results-table";
import { SiteShell } from "@/components/layout/site-shell";
import { Card, CardContent } from "@/components/ui/card";
import { buttonLinkVariants } from "@/lib/button-styles";
import {
  describePreferenceSnapshot,
  getCompareCatalog,
  getCompareRunData,
} from "@/lib/catalog";
import { parseCompareSearchParams } from "@/lib/search-params";

type ComparePageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

export default async function ComparePage({ searchParams }: ComparePageProps) {
  const resolvedSearchParams = parseCompareSearchParams(await searchParams);
  const runData = resolvedSearchParams.run
    ? await getCompareRunData(resolvedSearchParams.run, resolvedSearchParams.sort)
    : null;
  const rows = !runData
    ? await getCompareCatalog(resolvedSearchParams.festival)
    : null;

  const sortOptions = [
    { key: "overall", label: "Overall" },
    { key: "total", label: "Lowest total" },
    { key: "friction", label: "Smoothest" },
    { key: "confidence", label: "Highest confidence" },
    { key: "festival", label: "Festival" },
  ] as const;

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-12 sm:px-6 lg:px-8">
        {runData ? (
          <>
            <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Compare Festivals"
                  title="Ranked trip scenarios built from the full attendance window"
                  description="Festival Companion priced flights, exact stay windows, lodging clusters, and local movement for the selected festivals. Anything estimated instead of quoted stays labeled as an estimate with confidence and assumptions."
                />
                <p className="text-sm text-muted-foreground">
                  Run snapshot: {runData.preferenceSummary}
                </p>
                <p className="text-sm text-muted-foreground">
                  Started {runData.startedAtLabel}
                  {runData.completedAtLabel !== "TBD"
                    ? ` • completed ${runData.completedAtLabel}`
                    : ""}
                </p>
              </div>
              <Card className="border-border/80 bg-card shadow-sm">
                <CardContent className="space-y-3 px-5 py-5">
                  <p className="text-xs uppercase text-muted-foreground">Best current call</p>
                  <p className="font-heading text-2xl font-semibold text-balance">
                    {runData.recommendedRow?.displayName ?? "No recommendation yet"}
                  </p>
                  <p className="text-sm leading-6 text-pretty text-muted-foreground">
                    {runData.recommendedRow?.whyRankedHere ??
                      "This run did not produce a complete, recommendation-ready scenario."}
                  </p>
                  {runData.recommendedRow?.scenarioId ? (
                    <Link
                      href={`/costs/${runData.recommendedRow.scenarioId}`}
                      className={buttonLinkVariants({ className: "w-full" })}
                    >
                      Open cost breakdown
                    </Link>
                  ) : null}
                </CardContent>
              </Card>
            </section>

            {runData.warnings.length > 0 ? (
              <Card className="border-amber-200 bg-amber-50 shadow-none">
                <CardContent className="space-y-2 px-5 py-5">
                  <p className="text-xs uppercase text-amber-800">Run warnings</p>
                  <div className="grid gap-2">
                    {runData.warnings.slice(0, 6).map((warning, index) => (
                      <p
                        key={index}
                        className="text-sm leading-6 text-pretty text-amber-900"
                      >
                        {typeof warning === "object" &&
                        warning !== null &&
                        "message" in warning
                          ? String((warning as { message?: string }).message)
                          : "A collection warning was recorded for this run."}
                      </p>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ) : null}

            <section className="space-y-4">
              <div className="flex flex-wrap gap-2">
                {sortOptions.map((option) => (
                  <Link
                    key={option.key}
                    href={`/compare?run=${runData.runId}&sort=${option.key}`}
                    className={buttonLinkVariants({
                      variant:
                        resolvedSearchParams.sort === option.key ? "default" : "outline",
                      size: "sm",
                    })}
                  >
                    {option.label}
                  </Link>
                ))}
              </div>
              <div className="grid gap-4 lg:grid-cols-3">
                {runData.rows.map((row) => (
                  <FestivalResultCard key={row.id} {...row} />
                ))}
              </div>
            </section>

            <section className="space-y-5">
              <SectionHeading
                title="Side-by-side trip comparison"
                description="Sort by overall value, raw cost, smoothness, or confidence depending on the kind of decision you are trying to make."
              />
              <FestivalResultsTable rows={runData.rows} />
            </section>
          </>
        ) : (
          <>
            <section className="grid gap-6 lg:grid-cols-[1fr_20rem]">
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Compare Festivals"
                  title="Trip-planning readiness before live quote collection"
                  description="This view already knows the confirmed dates, airport mix, lodging clusters, and shuttle structure. Live flights, hotels, and friction-weighted scoring plug into the same layout next."
                />
                <p className="text-sm text-muted-foreground">
                  Current intake:{" "}
                  {describePreferenceSnapshot({
                    sourceCity: resolvedSearchParams.sourceCity,
                    sourceAirport: resolvedSearchParams.sourceAirport,
                    travelers: resolvedSearchParams.travelers,
                    roomType: resolvedSearchParams.roomType,
                    hotelClass: resolvedSearchParams.hotelClass,
                    priority: resolvedSearchParams.priority,
                  })}
                </p>
              </div>
              <Card className="border-border/80 bg-card shadow-sm">
                <CardContent className="space-y-3 px-5 py-5">
                  <p className="text-xs uppercase text-muted-foreground">
                    What you are seeing
                  </p>
                  <p className="text-sm leading-6 text-pretty text-muted-foreground">
                    Festival Companion is showing catalog-backed planning structure
                    here instead of inventing prices. Run a comparison from the landing
                    page or admin console to fill this same layout with live and
                    estimated trip scenarios.
                  </p>
                </CardContent>
              </Card>
            </section>

            <section className="grid gap-4 lg:grid-cols-3">
              {rows?.map((row) => <FestivalCompareCard key={row.id} {...row} />)}
            </section>

            <section className="space-y-5">
              <SectionHeading
                title="Sortable comparison table"
                description="For now this table highlights what is already known and where quote collection will have the biggest impact."
              />
              {rows ? <FestivalPreviewTable rows={rows} /> : null}
            </section>
          </>
        )}
      </div>
    </SiteShell>
  );
}
