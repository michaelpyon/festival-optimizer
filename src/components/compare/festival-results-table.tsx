import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CompareResultRow = {
  id: string;
  scenarioId: string | null;
  slug: string;
  displayName: string;
  dateLabel: string;
  stayWindowLabel: string;
  totalAmountLabel: string;
  flightAmountLabel: string;
  hotelAmountLabel: string;
  localTransportAmountLabel: string;
  confidenceLabel: string;
  bestForBadge: string;
  whyRankedHere: string;
};

export function FestivalResultsTable({ rows }: { rows: CompareResultRow[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Festival</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Stay window</TableHead>
            <TableHead>Total trip</TableHead>
            <TableHead>Flight</TableHead>
            <TableHead>Hotel</TableHead>
            <TableHead>Local transport</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Best for</TableHead>
            <TableHead>Why this ranked here</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                <Link
                  href={row.scenarioId ? `/costs/${row.scenarioId}` : `/festivals/${row.slug}`}
                  className="hover:text-primary"
                >
                  {row.displayName}
                </Link>
              </TableCell>
              <TableCell>{row.dateLabel}</TableCell>
              <TableCell>{row.stayWindowLabel}</TableCell>
              <TableCell className="font-mono tabular-nums">{row.totalAmountLabel}</TableCell>
              <TableCell className="font-mono tabular-nums">{row.flightAmountLabel}</TableCell>
              <TableCell className="font-mono tabular-nums">{row.hotelAmountLabel}</TableCell>
              <TableCell className="font-mono tabular-nums">
                {row.localTransportAmountLabel}
              </TableCell>
              <TableCell>{row.confidenceLabel}</TableCell>
              <TableCell>{row.bestForBadge}</TableCell>
              <TableCell className="max-w-md text-pretty text-muted-foreground">
                {row.whyRankedHere}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
