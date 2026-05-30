import { getCostScenarioDetail } from "@/lib/catalog";
import { formatCurrency, perPersonAmount } from "@/lib/format";

type ScenarioDetail = NonNullable<
  Awaited<ReturnType<typeof getCostScenarioDetail>>
>;

export type ProposalSummary = {
  festivalName: string;
  originIata: string | null;
  travelers: number;
  perPerson: number | null;
  perPersonLabel: string;
  totalLabel: string;
  tripWindowLabel: string;
  /** e.g. "$1,240 / person · Coachella from LAX" */
  headline: string;
  ogTitle: string;
  ogDescription: string;
};

export function buildProposalSummary(data: ScenarioDetail): ProposalSummary {
  const { scenario, tripWindowLabel } = data;
  const preference = scenario.searchRun.userPreference;
  const travelers = preference?.travelersCount ?? 1;
  const originIata = preference?.sourceAirport?.iataCode ?? null;
  const festivalName = scenario.festivalEdition.festival.name;

  const perPerson = perPersonAmount(scenario.totalAmount.toString(), travelers);
  const perPersonLabel = formatCurrency(perPerson);
  const totalLabel = formatCurrency(scenario.totalAmount.toString());

  const fromClause = originIata ? ` from ${originIata}` : "";
  const headline = `${perPersonLabel} / person · ${festivalName}${fromClause}`;

  const ogTitle = `${festivalName}: ${perPersonLabel} per person`;
  const ogDescription = `Estimated full trip cost for ${festivalName}${fromClause}. ${perPersonLabel} per person across ${travelers} ${travelers === 1 ? "traveler" : "travelers"} (${totalLabel} total) covering flights, lodging, transport, and tickets. ${tripWindowLabel}.`;

  return {
    festivalName,
    originIata,
    travelers,
    perPerson,
    perPersonLabel,
    totalLabel,
    tripWindowLabel,
    headline,
    ogTitle,
    ogDescription,
  };
}
