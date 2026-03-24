import { format } from "date-fns";

export function formatFestivalDateRange(
  start: Date | null | undefined,
  end: Date | null | undefined,
) {
  if (!start || !end) {
    return "Dates not announced yet";
  }

  const sameMonth = format(start, "MMM") === format(end, "MMM");
  const sameYear = format(start, "yyyy") === format(end, "yyyy");

  if (sameMonth && sameYear) {
    return `${format(start, "MMM d")}–${format(end, "d, yyyy")}`;
  }

  return `${format(start, "MMM d, yyyy")}–${format(end, "MMM d, yyyy")}`;
}

export function formatTripWindow(
  start: Date | null | undefined,
  end: Date | null | undefined,
) {
  if (!start || !end) {
    return "Needs current dates";
  }

  return `${format(start, "EEE, MMM d")} to ${format(end, "EEE, MMM d")}`;
}

export function describeEdition(
  festivalName: string,
  editionName: string | null | undefined,
) {
  return editionName ? `${festivalName} ${editionName}` : festivalName;
}
