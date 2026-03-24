import Link from "next/link";

import { WaterfallChart } from "@/components/costs/waterfall-chart";
import { SectionHeading } from "@/components/common/section-heading";
import { SiteShell } from "@/components/layout/site-shell";
import { Card, CardContent } from "@/components/ui/card";
import { buttonLinkVariants } from "@/lib/button-styles";
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
        <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-12 sm:px-6 lg:px-8">
          <SectionHeading
            eyebrow="Cost Breakdown"
            title="No saved scenario yet"
            description="This page is reserved for the waterfall chart, component totals, and assumption trail once a comparison run creates cost scenarios."
          />
          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="px-6 py-8 text-sm leading-6 text-pretty text-muted-foreground">
              Run a comparison first, then open the saved scenario detail from
              the compare results or saved trips view.
            </CardContent>
          </Card>
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

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-5xl flex-col gap-8 px-5 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Cost Breakdown"
          title={`${scenario.festivalEdition.festival.name} scenario`}
          description={`${tripWindowLabel} • ${preferenceSummary}`}
        />
        <div className="grid gap-4 md:grid-cols-4">
          {[
            {
              label: "Ticket",
              value: formatCurrency(scenario.ticketAmount?.toString() ?? null),
            },
            {
              label: "Flight",
              value: formatCurrency(scenario.flightAmount.toString()),
            },
            {
              label: "Hotel",
              value: formatCurrency(scenario.hotelAmount.toString()),
            },
            {
              label: "Local transport",
              value: formatCurrency(scenario.localTransportAmount.toString()),
            },
            {
              label: "Total",
              value: formatCurrency(scenario.totalAmount.toString()),
            },
          ].map((item) => (
            <Card key={item.label} className="border-border/80 bg-card shadow-none">
              <CardContent className="space-y-2 px-5 py-5">
                <p className="text-xs uppercase text-muted-foreground">
                  {item.label}
                </p>
                <p className="font-mono text-2xl font-semibold tabular-nums">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
        <section className="grid gap-6 lg:grid-cols-[1.15fr_0.85fr]">
          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-5 px-6 py-6">
              <div className="space-y-2">
                <p className="font-heading text-2xl font-semibold text-balance">
                  {scenario.recommendation}
                </p>
                <p className="text-sm leading-6 text-pretty text-muted-foreground">
                  {scenario.whyRankedHere}
                </p>
              </div>
              <WaterfallChart
                ticketAmount={Number(scenario.ticketAmount ?? 0)}
                flightAmount={Number(scenario.flightAmount)}
                hotelAmount={Number(scenario.hotelAmount)}
                localTransportAmount={Number(scenario.localTransportAmount)}
                totalAmount={Number(scenario.totalAmount)}
              />
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-4 px-6 py-6">
              <p className="font-heading text-2xl font-semibold text-balance">
                Scenario health
              </p>
              <div className="grid gap-3">
                {[
                  {
                    label: "Confidence",
                    value: formatConfidence(scenario.confidence),
                  },
                  {
                    label: "Cost score",
                    value: `${Math.round(scenario.costScore)}/100`,
                  },
                  {
                    label: "Friction score",
                    value: `${Math.round(scenario.frictionScore)}/100`,
                  },
                  {
                    label: "Overall value",
                    value: `${Math.round(scenario.overallValueScore)}/100`,
                  },
                ].map((item) => (
                  <div
                    key={item.label}
                    className="rounded-2xl border border-border bg-background px-4 py-3"
                  >
                    <p className="text-xs text-muted-foreground">{item.label}</p>
                    <p className="mt-1 font-mono text-lg font-semibold tabular-nums text-foreground">
                      {item.value}
                    </p>
                  </div>
                ))}
              </div>
              <Link
                href={`/festivals/${scenario.festivalEdition.festival.slug}`}
                className={buttonLinkVariants({ variant: "outline", className: "w-full" })}
              >
                Festival detail
              </Link>
            </CardContent>
          </Card>
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-4 px-6 py-6">
              <p className="font-heading text-2xl font-semibold text-balance">
                Source trail
              </p>
              <div className="grid gap-3">
                {sourceTrail.map((source) => (
                  <div
                    key={`${source.label}-${source.provider}`}
                    className="rounded-2xl border border-border bg-background px-4 py-4"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <p className="font-medium text-foreground">{source.label}</p>
                        <p className="text-sm text-muted-foreground">
                          {source.rawProvider} {"->"} {source.provider}
                        </p>
                      </div>
                      <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
                        {source.amountLabel}
                      </p>
                    </div>
                    <p className="mt-2 text-sm text-muted-foreground">
                      {source.sourceType.toLowerCase()} • observed {source.observedAtLabel} •{" "}
                      {source.confidenceLabel}
                    </p>
                    {source.notes ? (
                      <p className="mt-2 text-sm leading-6 text-pretty text-muted-foreground">
                        {source.notes}
                      </p>
                    ) : null}
                    <a
                      href={source.sourceUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="mt-3 inline-flex text-sm font-medium text-primary"
                    >
                      Open source
                    </a>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-4 px-6 py-6">
              <p className="font-heading text-2xl font-semibold text-balance">
                Assumptions
              </p>
              <div className="grid gap-3">
                {assumptions.map(([key, value]) => (
                  <div
                    key={key}
                    className="rounded-2xl border border-border bg-background px-4 py-3"
                  >
                    <p className="text-xs uppercase text-muted-foreground">
                      {key.replaceAll(/([A-Z])/g, " $1").replaceAll("_", " ")}
                    </p>
                    <p className="mt-1 text-sm leading-6 text-pretty text-foreground">
                      {typeof value === "string"
                        ? value
                        : typeof value === "number"
                          ? value.toLocaleString("en-US")
                          : JSON.stringify(value)}
                    </p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </SiteShell>
  );
}
