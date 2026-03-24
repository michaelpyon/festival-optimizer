import { describe, expect, it } from "vitest";

import { scoreScenarioConfidence } from "@/server/engine/confidence";

describe("scoreScenarioConfidence", () => {
  it("penalizes sparse inventory and missing live flight data", () => {
    const baseline = scoreScenarioConfidence({
      values: [0.9, 0.86, 0.8],
    });

    const penalized = scoreScenarioConfidence({
      values: [0.9, 0.86, 0.8],
      sparseHotelInventory: true,
      missingLiveFlight: true,
    });

    expect(penalized).toBeLessThan(baseline);
  });

  it("clamps to a conservative minimum floor", () => {
    expect(
      scoreScenarioConfidence({
        values: [0.01],
        sparseHotelInventory: true,
        missingLiveFlight: true,
        shuttleUnavailable: true,
      }),
    ).toBe(0.12);
  });
});
