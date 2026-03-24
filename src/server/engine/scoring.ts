const OVERALL_WEIGHTS = {
  cost: 0.5,
  friction: 0.35,
  confidence: 0.15,
} as const;

export function computeFrictionScore(input: {
  travelDays: number;
  layoverCount: number;
  airportDriveMinutes: number;
  zoneDistanceMi: number;
  commuteMinutes: number;
  confidencePenalty: number;
}) {
  const penalty =
    (input.travelDays - 1) * 4 +
    input.layoverCount * 14 +
    input.airportDriveMinutes * 0.32 +
    input.zoneDistanceMi * 2.4 +
    input.commuteMinutes * 0.28 +
    input.confidencePenalty * 20;

  return Math.max(0, Math.min(100, Number((100 - penalty).toFixed(1))));
}

export function applyRelativeCostScores<
  T extends {
    totalAmount: number;
    costScore?: number;
    frictionScore: number;
    confidence: number;
    overallValueScore?: number;
  },
>(scenarios: T[]) {
  if (scenarios.length === 0) {
    return [];
  }

  const minTotal = Math.min(...scenarios.map((scenario) => scenario.totalAmount));

  return scenarios.map((scenario) => {
    const normalizedBaseline = minTotal > 0 ? minTotal : Math.max(scenario.totalAmount, 1);
    const costScore = Number(
      Math.max(
        12,
        Math.min(100, (normalizedBaseline / Math.max(scenario.totalAmount, 1)) * 100),
      ).toFixed(1),
    );
    const overallValueScore = Number(
      (
        costScore * OVERALL_WEIGHTS.cost +
        scenario.frictionScore * OVERALL_WEIGHTS.friction +
        scenario.confidence * 100 * OVERALL_WEIGHTS.confidence
      ).toFixed(1)
    );

    return {
      ...scenario,
      costScore,
      overallValueScore,
    };
  });
}
