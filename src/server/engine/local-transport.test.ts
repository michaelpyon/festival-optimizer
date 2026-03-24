import { describe, expect, it } from "vitest";

import { chooseFestivalAccessPlan } from "@/server/engine/local-transport";

describe("chooseFestivalAccessPlan", () => {
  it("prefers shuttle when it is materially cheaper", () => {
    const plan = chooseFestivalAccessPlan({
      directCommute: {
        id: "direct",
        amount: 180,
        durationMinutes: 50,
        confidence: 0.8,
      },
      shuttleFare: {
        id: "shuttle-fare",
        amount: 70,
        durationMinutes: 0,
        confidence: 0.72,
      },
      shuttleAccess: {
        id: "shuttle-access",
        amount: 20,
        durationMinutes: 18,
        confidence: 0.78,
      },
    });

    expect(plan.shuttleUsed).toBe(true);
    expect(plan.amount).toBe(90);
  });

  it("falls back to direct rideshare when no shuttle exists", () => {
    const plan = chooseFestivalAccessPlan({
      directCommute: {
        id: "direct",
        amount: 110,
        durationMinutes: 32,
        confidence: 0.8,
      },
    });

    expect(plan.shuttleUsed).toBe(false);
    expect(plan.label).toBe("direct_rideshare");
    expect(plan.amount).toBe(110);
  });

  it("marks access unavailable when neither option exists", () => {
    const plan = chooseFestivalAccessPlan({});

    expect(plan.label).toBe("unavailable");
    expect(plan.amount).toBe(0);
  });
});
