import { describe, expect, it } from "vitest";

import {
  normalizeSerpApiHotelProperty,
  parsePriceText,
} from "@/server/providers/hotels/google-hotels-serpapi-provider";

describe("hotel quote normalization", () => {
  it("parses money text into numeric amounts", () => {
    expect(parsePriceText("$1,249")).toBe(1249);
    expect(parsePriceText(undefined)).toBe(0);
  });

  it("normalizes raw SerpApi hotel properties into quote records", () => {
    const normalized = normalizeSerpApiHotelProperty({
      property: {
        property_name: "Hotel Figueroa",
        rate_per_night: {
          lowest: "$329",
        },
        total_rate: {
          lowest: "$1,012",
        },
        link: "https://example.com/hotel",
      },
      request: {
        destinationLabel: "Downtown LA",
        hotelZoneLabel: "Downtown LA",
        checkInDate: "2026-05-01",
        checkOutDate: "2026-05-04",
        travelers: 2,
        rooms: 1,
        currency: "USD",
      },
    });

    expect(normalized).not.toBeNull();
    expect(normalized?.normalizedProviderName).toBe("serpapi_google_hotels");
    expect(normalized?.amount).toBe(1012);
    expect(normalized?.nightlyAmount).toBe(329);
    expect(normalized?.zoneLabel).toBe("Downtown LA");
  });
});
