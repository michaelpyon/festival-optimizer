import Link from "next/link";

import { StatusChip } from "@/components/common/status-chip";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonLinkVariants } from "@/lib/button-styles";

type CompareResultCardProps = {
  slug: string;
  scenarioId: string | null;
  displayName: string;
  statusTone: "confirmed" | "tentative" | "historic";
  status: string;
  dateLabel: string;
  stayWindowLabel: string;
  totalAmountLabel: string;
  flightAmountLabel: string;
  hotelAmountLabel: string;
  localTransportAmountLabel: string;
  confidenceLabel: string;
  bestForBadge: string;
  whyRankedHere: string;
  recommendation: string;
  lowAmountLabel: string;
  highAmountLabel: string;
  rank: number | null;
  isRecommended: boolean;
};

export function FestivalResultCard(props: CompareResultCardProps) {
  return (
    <Card className="h-full border-border/80 bg-card shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-2">
              <StatusChip tone={props.statusTone} label={props.status} />
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                {props.bestForBadge}
              </span>
              {props.isRecommended ? (
                <span className="rounded-full border border-primary/25 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
                  Recommended
                </span>
              ) : null}
            </div>
            <CardTitle className="font-heading text-2xl text-balance">
              {props.displayName}
            </CardTitle>
            <p className="text-sm text-muted-foreground">
              {props.dateLabel} • {props.stayWindowLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3 text-right">
            <p className="text-xs text-muted-foreground">
              {props.rank ? `Rank #${props.rank}` : "Scenario total"}
            </p>
            <p className="font-mono text-2xl font-semibold tabular-nums text-foreground">
              {props.totalAmountLabel}
            </p>
            <p className="mt-1 text-xs text-muted-foreground">
              {props.lowAmountLabel} to {props.highAmountLabel}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid gap-3 sm:grid-cols-3">
          <div className="rounded-2xl border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">Flight</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {props.flightAmountLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">Hotel</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {props.hotelAmountLabel}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-4 py-3">
            <p className="text-xs text-muted-foreground">Local transport</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {props.localTransportAmountLabel}
            </p>
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground">Confidence</p>
          <p className="mt-1 font-medium text-foreground">{props.confidenceLabel}</p>
        </div>

        <div className="space-y-2">
          <p className="text-sm font-medium text-foreground">{props.whyRankedHere}</p>
          <p className="text-sm leading-6 text-pretty text-muted-foreground">
            {props.recommendation}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <Link
          href={`/festivals/${props.slug}`}
          className={buttonLinkVariants({ variant: "outline" })}
        >
          Festival Detail
        </Link>
        <Link
          href={props.scenarioId ? `/costs/${props.scenarioId}` : `/festivals/${props.slug}`}
          className={buttonLinkVariants({})}
        >
          {props.scenarioId ? "Cost Breakdown" : "Inspect Festival"}
        </Link>
      </CardFooter>
    </Card>
  );
}
