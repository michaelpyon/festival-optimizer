import Link from "next/link";

import { WaterfallChart } from "@/components/costs/waterfall-chart";
import { SiteShell } from "@/components/layout/site-shell";
import { getCostScenarioDetail } from "@/lib/catalog";
import { formatConfidence, formatCurrency } from "@/lib/format";

type CostBreakdownPageProps = {
  params: Promise<{ scenarioId: string }>;
};

export default async function CostBreakdownPage({
  params,
}: CostBreakdownPageProps) {
  const { scenarioId } = await params;
  const data = await getCostScenarioDetail(scenarioId);

  if (!data) {
    return (
      <SiteShell>
        <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
          <header className="mb-12">
            <span className="editorial-kicker mb-2 block">Financial Blueprint</span>
            <h1 className="font-heading text-5xl md:text-7xl font-light text-on-surface tracking-tight leading-none mb-4">
              No Scenario <span className="italic text-primary">Found</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              Run a comparison first, then open the saved scenario detail from the compare results.
            </p>
          </header>
          <Link
            href="/compare"
            className="bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs py-4 px-8 rounded-full inline-block"
          >
            Go to Compare
          </Link>
        </div>
      </SiteShell>
    );
  }

  const { scenario, selectedSources, tripWindowLabel, preferenceSummary } = data;
  const assumptions =
    scenario.assumptions && typeof scenario.assumptions === "object"
      ? Object.entries(scenario.assumptions as Record<string, unknown>)
      : [];
  const sourceTrail = selectedSources.filter(
    (
      source,
    ): source is (typeof selectedSources)[number] & {
      label: string;
      provider: string;
    } => Boolean(source),
  );

  const costItems = [
    { label: "Ticket", icon: "confirmation_number", amount: formatCurrency(scenario.ticketAmount?.toString() ?? null), note: "Face value" },
    { label: "Flight", icon: "flight", amount: formatCurrency(scenario.flightAmount.toString()), note: "Round trip" },
    { label: "Lodging", icon: "home_work", amount: formatCurrency(scenario.hotelAmount.toString()), note: "Full stay" },
    { label: "Transport", icon: "directions_bus", amount: formatCurrency(scenario.localTransportAmount.toString()), note: "Local transit" },
  ];

  return (
    <SiteShell>
      <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div className="max-w-2xl">
            <span className="editorial-kicker mb-2 block">Financial Blueprint</span>
            <h1 className="font-heading text-5xl md:text-7xl font-light text-on-surface tracking-tight leading-none mb-4">
              The Cost <br /><span className="italic text-primary">Evolution</span>
            </h1>
            <p className="text-on-surface-variant text-lg max-w-md leading-relaxed">
              {scenario.festivalEdition.festival.name} • {tripWindowLabel} • {preferenceSummary}
            </p>
          </div>
          {/* Scenario Type Switcher */}
          <div className="bg-surface-container-lowest p-1 rounded-full flex items-center shadow-lg border border-outline-variant/10 self-start md:self-auto">
            <span className="px-8 py-2 rounded-full text-xs uppercase tracking-widest bg-surface-container-highest text-primary shadow-sm">
              {scenario.scenarioType.replaceAll("_", " ").toLowerCase()}
            </span>
          </div>
        </header>

        {/* Bento Grid */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-6 mb-12">
          {/* Waterfall Chart Card */}
          <div className="md:col-span-8 bg-surface-container-low rounded-xl p-8 relative overflow-hidden">
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="font-heading text-2xl text-primary mb-1">Cumulative Waterfall</h2>
                <p className="text-sm text-on-surface-variant">
                  Projected Total: {formatCurrency(scenario.totalAmount.toString())}
                </p>
              </div>
              <div className="flex items-center gap-2 bg-tertiary-container/10 px-3 py-1.5 rounded-full">
                <span className="material-symbols-outlined text-tertiary text-lg">verified</span>
                <span className="text-[10px] uppercase tracking-wider text-tertiary font-bold">
                  {formatConfidence(scenario.confidence)}
                </span>
              </div>
            </div>
            <WaterfallChart
              ticketAmount={Number(scenario.ticketAmount ?? 0)}
              flightAmount={Number(scenario.flightAmount)}
              hotelAmount={Number(scenario.hotelAmount)}
              localTransportAmount={Number(scenario.localTransportAmount)}
              totalAmount={Number(scenario.totalAmount)}
            />
          </div>

          {/* Recommendation Card */}
          <div className="md:col-span-4 bg-secondary-container/20 border border-secondary-container/30 rounded-xl p-8 flex flex-col justify-between">
            <div>
              <span className="material-symbols-outlined text-primary text-4xl mb-6" style={{ fontVariationSettings: "'FILL' 1" }}>auto_awesome</span>
              <h3 className="font-heading text-3xl leading-tight text-on-surface mb-4">
                {scenario.recommendation ?? "Concierge Recommendation"}
              </h3>
              <p className="text-on-surface-variant leading-relaxed">
                {scenario.whyRankedHere}
              </p>
            </div>
            <Link
              href={`/festivals/${scenario.festivalEdition.festival.slug}`}
              className="w-full mt-8 bg-primary text-on-primary font-bold uppercase tracking-[0.2em] text-xs py-4 rounded-full hover:scale-[1.02] active:scale-95 transition-all text-center block"
            >
              View Festival Detail
            </Link>
          </div>

          {/* Itemized Breakdown */}
          <div className="md:col-span-12 space-y-4">
            <div className="flex items-center justify-between px-2">
              <h3 className="text-xs uppercase tracking-[0.3em] text-on-surface-variant">Itemized Breakdown</h3>
            </div>

            {costItems.map((item) => (
              <div
                key={item.label}
                className="bg-surface-container-low hover:bg-surface-container-high transition-colors p-6 rounded-xl flex flex-wrap md:flex-nowrap items-center justify-between gap-4"
              >
                <div className="flex items-center gap-6 flex-1 min-w-[200px]">
                  <div className="w-12 h-12 rounded-full bg-tertiary-container/10 flex items-center justify-center text-tertiary">
                    <span className="material-symbols-outlined">{item.icon}</span>
                  </div>
                  <div>
                    <p className="font-bold text-on-surface">{item.label}</p>
                    <p className="text-xs text-on-surface-variant">{item.note}</p>
                  </div>
                </div>
                <div className="flex flex-col items-end">
                  <span className="font-heading text-xl text-primary">{item.amount}</span>
                </div>
              </div>
            ))}

            {/* Total Row */}
            <div className="bg-primary-container/10 border border-primary-container/20 p-6 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className="w-12 h-12 rounded-full bg-primary-container/20 flex items-center justify-center text-primary">
                  <span className="material-symbols-outlined">payments</span>
                </div>
                <p className="font-heading text-xl font-bold text-on-surface">Total</p>
              </div>
              <span className="font-heading text-3xl text-primary font-bold">
                {formatCurrency(scenario.totalAmount.toString())}
              </span>
            </div>
          </div>
        </div>

        {/* Scenario Health */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          {[
            { label: "Confidence", value: formatConfidence(scenario.confidence), color: "tertiary" },
            { label: "Cost Score", value: `${Math.round(scenario.costScore)}/100`, color: "primary" },
            { label: "Friction Score", value: `${Math.round(scenario.frictionScore)}/100`, color: "secondary" },
            { label: "Overall Value", value: `${Math.round(scenario.overallValueScore)}/100`, color: "primary" },
          ].map((item) => (
            <div key={item.label} className="bg-surface-container-lowest p-6 rounded-xl border-l-2 border-primary">
              <p className="text-[10px] text-primary uppercase tracking-widest mb-2">{item.label}</p>
              <p className="font-heading text-3xl font-bold text-on-surface">{item.value}</p>
            </div>
          ))}
        </section>

        {/* Source Trail */}
        {sourceTrail.length > 0 && (
          <section className="mb-12 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-on-surface-variant px-2">Source Trail</h3>
            {sourceTrail.map((source) => (
              <div
                key={`${source.label}-${source.provider}`}
                className="bg-surface-container-low p-6 rounded-xl"
              >
                <div className="flex flex-wrap items-start justify-between gap-3 mb-2">
                  <div>
                    <p className="font-bold text-on-surface">{source.label}</p>
                    <p className="text-sm text-on-surface-variant">
                      {source.rawProvider} {"->"} {source.provider}
                    </p>
                  </div>
                  <span className="font-heading text-lg text-primary">{source.amountLabel}</span>
                </div>
                <p className="text-sm text-on-surface-variant">
                  {source.sourceType.toLowerCase()} • observed {source.observedAtLabel} • {source.confidenceLabel}
                </p>
                {source.notes && (
                  <p className="mt-2 text-sm text-on-surface-variant">{source.notes}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Assumptions */}
        {assumptions.length > 0 && (
          <section className="mb-32 space-y-4">
            <h3 className="text-xs uppercase tracking-[0.3em] text-on-surface-variant px-2">Assumptions</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {assumptions.map(([key, value]) => (
                <div key={key} className="bg-surface-container-lowest p-6 rounded-xl border-l-2 border-outline-variant/30">
                  <p className="text-[10px] uppercase tracking-widest text-outline mb-2">
                    {key.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " ")}
                  </p>
                  <p className="text-sm text-on-surface-variant">
                    {typeof value === "string"
                      ? value
                      : typeof value === "number"
                        ? value.toLocaleString("en-US")
                        : JSON.stringify(value)}
                  </p>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </SiteShell>
  );
}
