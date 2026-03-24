import Link from "next/link";

import { StatusChip } from "@/components/common/status-chip";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { buttonLinkVariants } from "@/lib/button-styles";

type CompareCardProps = {
  id: string;
  slug: string;
  displayName: string;
  statusTone: "confirmed" | "tentative" | "historic";
  status: string;
  dateLabel: string;
  cityLabel: string;
  venue: string;
  ticketLabel: string;
  planningConfidence: string;
  airportCount: number;
  lodgingZoneCount: number;
  shuttleCount: number;
  whyThisCanWork: string;
};

export function FestivalCompareCard(props: CompareCardProps) {
  return (
    <Card className="h-full border-border/80 bg-card shadow-sm">
      <CardHeader className="space-y-4">
        <div className="flex items-start justify-between gap-3">
          <div className="space-y-2">
            <CardTitle className="font-heading text-2xl text-balance">
              {props.displayName}
            </CardTitle>
            <div className="flex flex-wrap gap-2">
              <StatusChip tone={props.statusTone} label={props.status} />
              <span className="rounded-full border border-border bg-background px-3 py-1 text-xs text-muted-foreground">
                {props.dateLabel}
              </span>
            </div>
          </div>
          <div className="rounded-2xl border border-border bg-background px-3 py-2 text-right">
            <p className="text-xs text-muted-foreground">Base ticket</p>
            <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
              {props.ticketLabel}
            </p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="grid grid-cols-3 gap-3">
          <div className="rounded-2xl border border-border bg-background px-3 py-3">
            <p className="text-xs text-muted-foreground">Airports</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {props.airportCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-3 py-3">
            <p className="text-xs text-muted-foreground">Lodging zones</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {props.lodgingZoneCount}
            </p>
          </div>
          <div className="rounded-2xl border border-border bg-background px-3 py-3">
            <p className="text-xs text-muted-foreground">Shuttle options</p>
            <p className="mt-1 font-mono text-lg font-semibold tabular-nums">
              {props.shuttleCount}
            </p>
          </div>
        </div>

        <div className="space-y-1">
          <p className="text-sm font-medium text-foreground">{props.cityLabel}</p>
          <p className="text-sm text-muted-foreground">{props.venue}</p>
        </div>

        <p className="text-sm leading-6 text-pretty text-muted-foreground">
          {props.whyThisCanWork}
        </p>

        <div className="rounded-2xl border border-border bg-background px-4 py-3">
          <p className="text-xs text-muted-foreground">Planning confidence</p>
          <p className="mt-1 font-medium text-foreground">
            {props.planningConfidence}
          </p>
        </div>
      </CardContent>
      <CardFooter className="flex items-center justify-between gap-3">
        <Link
          href={`/festivals/${props.slug}`}
          className={buttonLinkVariants({ variant: "outline" })}
        >
          Open Detail
        </Link>
        <Link
          href={`/festivals/${props.slug}`}
          className={buttonLinkVariants({})}
        >
          Inspect Logistics
        </Link>
      </CardFooter>
    </Card>
  );
}
