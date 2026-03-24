import { format } from "date-fns";

function toNumber(value: number | string | null | undefined) {
  if (value === null || value === undefined) {
    return null;
  }

  const next = Number(value);
  return Number.isFinite(next) ? next : null;
}

export function formatCurrency(
  value: number | string | null | undefined,
  currency = "USD",
) {
  const amount = toNumber(value);

  if (amount === null) {
    return "TBD";
  }

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency,
    maximumFractionDigits: 0,
  }).format(amount);
}

export function formatConfidence(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "Unrated";
  }

  return `${Math.round(value * 100)}%`;
}

export function formatPercent(value: number | null | undefined) {
  if (value === null || value === undefined) {
    return "TBD";
  }

  return `${Math.round(value * 100)}%`;
}

export function formatDateLabel(value: Date | string | null | undefined) {
  if (!value) {
    return "TBD";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "MMM d, yyyy");
}

export function formatDateTimeLabel(value: Date | string | null | undefined) {
  if (!value) {
    return "TBD";
  }

  const date = typeof value === "string" ? new Date(value) : value;
  return format(date, "MMM d, yyyy h:mm a");
}

export function formatAirportLabel(
  city: string,
  iataCode: string,
  stateOrRegion?: string | null,
) {
  return `${city}${stateOrRegion ? `, ${stateOrRegion}` : ""} (${iataCode})`;
}
