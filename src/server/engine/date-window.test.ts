import { describe, expect, it } from "vitest";

import { inferTravelWindow } from "@/server/engine/date-window";

describe("inferTravelWindow", () => {
  it("builds the minimum viable stay window around a full festival run", () => {
    const window = inferTravelWindow({
      startsAt: new Date("2026-08-01T15:00:00.000Z"),
      endsAt: new Date("2026-08-03T06:00:00.000Z"),
      arrivalBufferHours: 18,
      departureBufferHours: 10,
    });

    expect(window).not.toBeNull();
    expect(window?.hotelNights).toBe(3);
    expect(window?.travelDays).toBe(4);
    expect(window?.festivalDays).toBe(3);
    expect(window?.departureDate).toBe("2026-07-31");
    expect(window?.returnDate).toBe("2026-08-03");
  });

  it("returns null when dates are missing", () => {
    expect(
      inferTravelWindow({
        startsAt: null,
        endsAt: new Date("2026-08-03T06:00:00.000Z"),
        arrivalBufferHours: 18,
        departureBufferHours: 10,
      }),
    ).toBeNull();
  });
});
