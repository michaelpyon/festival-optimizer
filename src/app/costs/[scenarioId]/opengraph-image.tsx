import { ImageResponse } from "next/og";

import { getCostScenarioDetail } from "@/lib/catalog";
import { buildProposalSummary } from "@/lib/proposal";

export const alt = "Festival trip cost per person";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function Image({
  params,
}: {
  params: Promise<{ scenarioId: string }>;
}) {
  const { scenarioId } = await params;
  const data = await getCostScenarioDetail(scenarioId).catch(() => null);

  const summary = data ? buildProposalSummary(data) : null;
  const perPerson = summary?.perPersonLabel ?? "Festival trip";
  const fromClause = summary?.originIata
    ? ` from ${summary.originIata}`
    : "";
  const festival = summary?.festivalName ?? "Festival Optimizer";
  const subline = summary
    ? `${festival}${fromClause}`
    : "Compare festivals by real trip cost";

  const accent = "#d5c5a9";
  const surface = "#0e0e0e";
  const onSurface = "#e5e2e1";
  const muted = "#cec5b9";

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
            fontSize: 26,
            letterSpacing: 6,
            textTransform: "uppercase",
            color: muted,
          }}
        >
          Festival Optimizer · Trip Proposal
        </div>

        <div style={{ display: "flex", flexDirection: "column" }}>
          <div
            style={{
              display: "flex",
              alignItems: "baseline",
              color: accent,
              fontSize: 168,
              fontWeight: 700,
              lineHeight: 1,
            }}
          >
            {perPerson}
            <span
              style={{
                fontSize: 52,
                fontWeight: 500,
                color: muted,
                marginLeft: 28,
              }}
            >
              / person
            </span>
          </div>
          <div
            style={{
              display: "flex",
              color: onSurface,
              fontSize: 56,
              fontWeight: 600,
              marginTop: 28,
            }}
          >
            {subline}
          </div>
        </div>

        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            color: muted,
            fontSize: 28,
          }}
        >
          <span style={{ display: "flex" }}>
            Flights · Lodging · Transport · Tickets
          </span>
          <span style={{ display: "flex", color: accent }}>Estimated</span>
        </div>
      </div>
    ),
    { ...size },
  );
}
