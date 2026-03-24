import { describe, expect, it } from "vitest";

import { applyRelativeCostScores, computeFrictionScore } from "@/server/engine/scoring";

describe("scoring", () => {
  it("drops friction as burden increases", () => {
    const smoother = computeFrictionScore({
      travelDays: 3,
      layoverCount: 0,
      airportDriveMinutes: 25,
      zoneDistanceMi: 2,
      commuteMinutes: 18,
      confidencePenalty: 0.05,
    });
    const messier = computeFrictionScore({
      travelDays: 5,
      layoverCount: 2,
      airportDriveMinutes: 70,
      zoneDistanceMi: 12,
      commuteMinutes: 55,
      confidencePenalty: 0.2,
    });

    expect(smoother).toBeGreaterThan(messier);
  });

  it("assigns higher cost score to cheaper scenarios", () => {
    const scored = applyRelativeCostScores([
      {
        totalAmount: 1200,
        frictionScore: 80,
        confidence: 0.8,
      },
      {
        totalAmount: 1800,
        frictionScore: 88,
        confidence: 0.9,
      },
    ]);

    expect(scored[0].costScore).toBeGreaterThan(scored[1].costScore);
    expect(scored[1].overallValueScore).toBeGreaterThan(0);
  });
});
