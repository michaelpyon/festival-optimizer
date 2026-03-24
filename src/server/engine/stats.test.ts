import { describe, expect, it } from "vitest";

import { average, median, percentile } from "@/server/engine/stats";

describe("stats helpers", () => {
  it("calculates average and median", () => {
    expect(average([100, 200, 300])).toBe(200);
    expect(median([100, 300, 200])).toBe(200);
    expect(median([100, 200, 300, 400])).toBe(250);
  });

  it("calculates percentile for sparse and full samples", () => {
    expect(percentile([100, 200, 300, 400], 0.75)).toBe(300);
    expect(percentile([], 0.75)).toBe(0);
  });
});
