import { describe, expect, it } from "vitest";

import {
  pickDestinationAirportOptions,
  resolveFlightPool,
  summarizeHotelInventory,
} from "@/server/engine/run-comparison";

describe("run-comparison helpers", () => {
  it("falls back to the full flight pool when none are attendance-safe", () => {
    const pool = resolveFlightPool([
      { quote: { isValidForAttendance: false } },
      { quote: { isValidForAttendance: false } },
    ]);

    expect(pool).toHaveLength(2);
  });

  it("keeps only attendance-safe flights when they exist", () => {
    const pool = resolveFlightPool([
      { quote: { isValidForAttendance: false } },
      { quote: { isValidForAttendance: true } },
    ]);

    expect(pool).toHaveLength(1);
    expect(pool[0].quote.isValidForAttendance).toBe(true);
  });

  it("flags sparse hotel inventory", () => {
    const summary = summarizeHotelInventory([320, 410, 450]);

    expect(summary.average).toBeGreaterThan(0);
    expect(summary.sparse).toBe(true);
  });

  it("prefers the top-priority airports in multi-airport markets", () => {
    const airports = pickDestinationAirportOptions([
      { id: "oak", priority: 2 },
      { id: "sfo", priority: 1 },
      { id: "sjc", priority: 3 },
    ]);

    expect(airports.map((airport) => airport.id)).toEqual(["sfo", "oak"]);
  });
});
