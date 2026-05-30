import { ImageResponse } from "next/og";

import { formatCurrency } from "@/lib/format";
import { getHomepageExample } from "@/lib/homepage-example";

export const alt = "Compare festivals by real trip cost, per person";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

// Home opengraph card. Uses the same illustrative LAX example numbers the
// homepage shows (built from the real catalog + the heuristic estimator the
// live engine itself uses), so the link preview matches what the visitor will
// see on first load. Numbers are labeled "Estimate" so we never claim a quote
// we did not collect.
export default function Image() {
  const example = getHomepageExample();

  const accent = "#d5c5a9";
  const surface = "#0e0e0e";
  const onSurface = "#e5e2e1";
  const muted = "#cec5b9";

  const festivals = example?.festivals ?? [];
  const subline = example
    ? `${example.travelers} travelers, ${example.originIata} starting point`
    : "Compare festivals by real trip cost";

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: surface,
          padding: "72px 80px",
          fontFamily: "sans-serif",
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: muted,
          }}
        >
          <span style={{ display: "flex" }}>Festival Optimizer</span>
          <span style={{ display: "flex", color: accent }}>Estimate</span>
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              color: onSurface,
              fontSize: 72,
              fontWeight: 600,
              lineHeight: 1.05,
              display: "flex",
            }}
          >
            Flights, hotel, transport, tickets.
          </div>
          <div
            style={{
              color: muted,
              fontSize: 36,
              fontWeight: 400,
              marginTop: 18,
              display: "flex",
            }}
          >
            All in. Per person. Source trail attached.
          </div>
        </div>

        {festivals.length === 2 ? (
          <div style={{ display: "flex", gap: 40, width: "100%" }}>
            {festivals.map((festival) => (
              <div
                key={festival.slug}
                style={{
                  flex: 1,
                  display: "flex",
                  flexDirection: "column",
                  padding: "28px 32px",
                  border: `1px solid ${muted}33`,
                  borderRadius: 28,
                  background: "#161616",
                }}
              >
                <div
                  style={{
                    display: "flex",
                    color: muted,
                    fontSize: 24,
                    letterSpacing: 4,
                    textTransform: "uppercase",
                  }}
                >
                  {festival.cityLabel}
                </div>
                <div
                  style={{
                    display: "flex",
                    color: onSurface,
                    fontSize: 40,
                    fontWeight: 600,
                    marginTop: 8,
                  }}
                >
                  {festival.name}
                </div>
                <div
                  style={{
                    display: "flex",
                    alignItems: "baseline",
                    color: accent,
                    fontSize: 92,
                    fontWeight: 700,
                    marginTop: 14,
                    lineHeight: 1,
                  }}
                >
                  {formatCurrency(festival.perPerson)}
                  <span
                    style={{
                      fontSize: 30,
                      fontWeight: 500,
                      color: muted,
                      marginLeft: 14,
                    }}
                  >
                    / person
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div
            style={{
              display: "flex",
              color: muted,
              fontSize: 32,
            }}
          >
            Per-person totals for every festival in the catalog.
          </div>
        )}

        <div
          style={{
            display: "flex",
            color: muted,
            fontSize: 26,
          }}
        >
          {subline}
        </div>
      </div>
    ),
    { ...size },
  );
}
