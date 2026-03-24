import Link from "next/link";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

type CompareRow = {
  id: string;
  slug: string;
  displayName: string;
  dateLabel: string;
  ticketLabel: string;
  airportCount: number;
  lodgingZoneCount: number;
  shuttleCount: number;
  planningConfidence: string;
  whyThisCanWork: string;
};

export function FestivalPreviewTable({ rows }: { rows: CompareRow[] }) {
  return (
    <div className="overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
      <Table>
        <TableHeader>
          <TableRow className="hover:bg-transparent">
            <TableHead>Festival</TableHead>
            <TableHead>Dates</TableHead>
            <TableHead>Base ticket</TableHead>
            <TableHead>Airport options</TableHead>
            <TableHead>Lodging zones</TableHead>
            <TableHead>Official shuttle</TableHead>
            <TableHead>Confidence</TableHead>
            <TableHead>Why this can work</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.map((row) => (
            <TableRow key={row.id}>
              <TableCell className="font-medium">
                <Link href={`/festivals/${row.slug}`} className="hover:text-primary">
                  {row.displayName}
                </Link>
              </TableCell>
              <TableCell>{row.dateLabel}</TableCell>
              <TableCell className="font-mono tabular-nums">{row.ticketLabel}</TableCell>
              <TableCell className="font-mono tabular-nums">{row.airportCount}</TableCell>
              <TableCell className="font-mono tabular-nums">
                {row.lodgingZoneCount}
              </TableCell>
              <TableCell className="font-mono tabular-nums">
                {row.shuttleCount > 0 ? "Yes" : "No"}
              </TableCell>
              <TableCell>{row.planningConfidence}</TableCell>
              <TableCell className="max-w-md text-pretty text-muted-foreground">
                {row.whyThisCanWork}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
