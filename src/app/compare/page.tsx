import Link from "next/link";

import { FestivalCompareCard } from "@/components/compare/festival-compare-card";
import { FestivalPreviewTable } from "@/components/compare/festival-preview-table";
import { FestivalResultCard } from "@/components/compare/festival-result-card";
import { FestivalResultsTable } from "@/components/compare/festival-results-table";
import { SiteShell } from "@/components/layout/site-shell";
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
      <div className="pt-32 pb-24 px-4 md:px-8 max-w-7xl mx-auto min-h-screen">
        {/* Header */}
        <header className="mb-16 flex flex-col md:flex-row md:items-end justify-between gap-8">
          <div className="max-w-2xl">
            <h1 className="text-6xl md:text-7xl font-heading font-bold text-on-surface mb-6 leading-[0.9] tracking-tighter">
              Global<br />
              <span className="text-primary italic">Circuit</span> Comparison
            </h1>
            <p className="text-on-surface-variant text-lg leading-relaxed max-w-md">
              {runData
                ? `Ranked trip scenarios built from the full attendance window. ${runData.preferenceSummary}`
                : "Synthesizing real-time logistics, local economies, and cultural impact to refine your seasonal itinerary."}
            </p>
            {runData && (
              <p className="text-sm text-outline mt-3">
                Started {runData.startedAtLabel}
                {runData.completedAtLabel !== "TBD" ? ` • completed ${runData.completedAtLabel}` : ""}
              </p>
            )}
          </div>
          <div className="flex items-center gap-3 bg-surface-container-low p-1.5 rounded-full self-start md:self-auto">
            <button className="px-6 py-2.5 rounded-full bg-surface-container-highest text-primary text-sm font-medium transition-colors">
              Grid Perspective
            </button>
            <button className="px-6 py-2.5 rounded-full text-on-surface-variant text-sm font-medium hover:text-on-surface transition-colors">
              Analysis View
            </button>
          </div>
        </header>

        {runData ? (
          <>
            {/* Best Recommendation */}
            {runData.recommendedRow && (
              <div className="mb-12 bg-secondary-container/20 border border-secondary-container/30 rounded-xl p-8">
                <div className="flex items-center gap-2 mb-4">
                  <span className="material-symbols-outlined text-primary text-4xl" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
                  <span className="text-xs font-bold uppercase tracking-widest text-tertiary-container">Best Current Call</span>
                </div>
                <h3 className="font-heading text-3xl leading-tight text-on-surface mb-4">
                  {runData.recommendedRow.displayName}
                </h3>
                <p className="text-on-surface-variant leading-relaxed mb-6">
                  {runData.recommendedRow.whyRankedHere}
                </p>
                {runData.recommendedRow.scenarioId && (
                  <Link
                    href={`/costs/${runData.recommendedRow.scenarioId}`}
                    className="bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs py-4 px-8 rounded-full hover:scale-[1.02] active:scale-95 transition-colors inline-block"
                  >
                    Open Cost Breakdown
                  </Link>
                )}
              </div>
            )}

            {/* Warnings */}
            {runData.warnings.length > 0 && (
              <div className="mb-8 bg-error-container/10 border border-error/20 rounded-xl p-6">
                <p className="text-xs uppercase tracking-widest text-error font-bold mb-3">Run Warnings</p>
                {runData.warnings.slice(0, 6).map((warning, index) => (
                  <p key={index} className="text-sm text-on-surface-variant">
                    {typeof warning === "object" && warning !== null && "message" in warning
                      ? String((warning as { message?: string }).message)
                      : "A collection warning was recorded for this run."}
                  </p>
                ))}
              </div>
            )}

            {/* Sort Filters */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12 py-6 border-y border-outline-variant/10">
              <div className="flex items-center gap-6 overflow-x-auto hide-scrollbar pb-2 md:pb-0">
                <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant whitespace-nowrap">Sort by:</span>
                {sortOptions.map((option) => (
                  <Link
                    key={option.key}
                    href={`/compare?run=${runData.runId}&sort=${option.key}`}
                    className={`text-sm font-medium whitespace-nowrap transition-colors flex items-center gap-2 ${
                      resolvedSearchParams.sort === option.key
                        ? "text-primary"
                        : "text-on-surface-variant hover:text-on-surface"
                    }`}
                  >
                    {option.label}
                    {resolvedSearchParams.sort === option.key && (
                      <span className="material-symbols-outlined text-sm">arrow_downward</span>
                    )}
                  </Link>
                ))}
              </div>
            </div>

            {/* Result Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {runData.rows.map((row) => (
                <FestivalResultCard key={row.id} {...row} />
              ))}
            </div>

            {/* Table View */}
            <section className="mt-24">
              <h2 className="text-4xl font-heading font-bold mb-10 tracking-tight text-on-surface">Technical Breakdown</h2>
              <FestivalResultsTable rows={runData.rows} />
            </section>
          </>
        ) : (
          <>
            {/* Catalog View */}
            <div className="flex flex-wrap items-center justify-between gap-4 mb-12 py-6 border-y border-outline-variant/10">
              <div className="flex items-center gap-6">
                <span className="text-xs uppercase tracking-[0.2em] text-on-surface-variant whitespace-nowrap">Showing:</span>
                <span className="text-sm font-medium text-primary">
                  {describePreferenceSnapshot({
                    sourceCity: resolvedSearchParams.sourceCity,
                    sourceAirport: resolvedSearchParams.sourceAirport,
                    travelers: resolvedSearchParams.travelers,
                    roomType: resolvedSearchParams.roomType,
                    hotelClass: resolvedSearchParams.hotelClass,
                    priority: resolvedSearchParams.priority,
                  })}
                </span>
              </div>
              <div className="bg-tertiary-container/10 border border-tertiary-container/20 px-4 py-2 rounded-full">
                <span className="text-xs uppercase tracking-widest text-tertiary font-bold">Catalog Preview Mode</span>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-24">
              {rows?.map((row) => <FestivalCompareCard key={row.id} {...row} />)}
            </div>

            <section className="mt-24">
              <h2 className="text-4xl font-heading font-bold mb-10 tracking-tight text-on-surface">Sortable Comparison</h2>
              {rows ? <FestivalPreviewTable rows={rows} /> : null}
            </section>
          </>
        )}
      </div>
    </SiteShell>
  );
}
