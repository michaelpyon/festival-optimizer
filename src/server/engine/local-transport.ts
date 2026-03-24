type QuoteLike = {
  id: string;
  amount: number;
  durationMinutes?: number | null;
  confidence?: number | null;
};

export type FestivalAccessPlan = {
  shuttleUsed: boolean;
  label: "direct_rideshare" | "shuttle_combo" | "unavailable";
  amount: number;
  durationMinutes: number;
  confidenceValues: number[];
  selectedQuoteIds: {
    shuttleFareQuoteId?: string | null;
    shuttleAccessQuoteId?: string | null;
    directCommuteQuoteId?: string | null;
  };
  notes: string;
};

export function chooseFestivalAccessPlan(input: {
  directCommute?: QuoteLike | null;
  shuttleFare?: QuoteLike | null;
  shuttleAccess?: QuoteLike | null;
}) {
  const directAmount = input.directCommute?.amount ?? Number.POSITIVE_INFINITY;
  const shuttleAmount =
    (input.shuttleFare?.amount ?? 0) + (input.shuttleAccess?.amount ?? 0);
  const hasDirect = Number.isFinite(directAmount);
  const hasShuttle = Boolean(input.shuttleFare);

  if (!hasDirect && !hasShuttle) {
    return {
      shuttleUsed: false,
      label: "unavailable",
      amount: 0,
      durationMinutes: 0,
      confidenceValues: [],
      selectedQuoteIds: {},
      notes: "No local festival-access quote was available, so this scenario uses a zeroed placeholder.",
    } satisfies FestivalAccessPlan;
  }

  const shuttleCloseEnoughToPrefer =
    hasShuttle &&
    (shuttleAmount <= directAmount * 0.9 ||
      (shuttleAmount <= directAmount * 1.05 &&
        (input.shuttleAccess?.durationMinutes ?? 0) <= 35));

  if (!hasDirect || shuttleCloseEnoughToPrefer) {
    return {
      shuttleUsed: true,
      label: "shuttle_combo",
      amount: shuttleAmount,
      durationMinutes:
        (input.shuttleAccess?.durationMinutes ?? 0) +
        (input.shuttleFare?.durationMinutes ?? 0),
      confidenceValues: [
        input.shuttleFare?.confidence ?? null,
        input.shuttleAccess?.confidence ?? null,
      ].filter((value): value is number => value !== null),
      selectedQuoteIds: {
        shuttleFareQuoteId: input.shuttleFare?.id ?? null,
        shuttleAccessQuoteId: input.shuttleAccess?.id ?? null,
      },
      notes:
        "Shuttle access won because it either materially undercut direct rideshare or landed close enough on cost while avoiding the ugliest festival-night pickup risk.",
    } satisfies FestivalAccessPlan;
  }

  return {
    shuttleUsed: false,
    label: "direct_rideshare",
    amount: directAmount,
    durationMinutes: input.directCommute?.durationMinutes ?? 0,
    confidenceValues: [
      input.directCommute?.confidence ?? null,
    ].filter((value): value is number => value !== null),
    selectedQuoteIds: {
      directCommuteQuoteId: input.directCommute?.id ?? null,
    },
    notes:
      "Direct rideshare stayed competitive enough that the shuttle detour did not buy back enough cost or hassle to justify the extra transfer step.",
  } satisfies FestivalAccessPlan;
}
