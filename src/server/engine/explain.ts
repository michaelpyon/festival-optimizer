import { SearchPriority } from "@prisma/client";

export function buildScenarioNarrative(input: {
  festivalName: string;
  hotelZoneLabel: string;
  shuttleUsed: boolean;
  totalAmount: number;
  ticketAmount: number;
  priority: SearchPriority;
}) {
  const priceFrame =
    input.totalAmount < 1400
      ? "keeps the trip in a relatively sane budget lane"
      : input.totalAmount < 2200
        ? "lands in the middle of the pack on total trip spend"
        : "leans expensive once the full trip is counted";

  if (input.shuttleUsed) {
    return `${input.festivalName} is not automatically cheap, but it ${priceFrame} because the ${input.hotelZoneLabel} plan can lean on an official shuttle instead of pure festival-night rideshare.`;
  }

  if (input.ticketAmount > 500) {
    return `${input.festivalName} has a pricier ticket, but the trip can still work if the ${input.hotelZoneLabel} lodging plan keeps local friction under control.`;
  }

  if (input.priority === SearchPriority.SMOOTHEST) {
    return `${input.festivalName} wins more on simplicity than on raw sticker price: cleaner airport flow and a more workable hotel cluster make the trip feel easier.`;
  }

  return `${input.festivalName} is the kind of option where hotel cluster choice does a lot of the work. The ${input.hotelZoneLabel} plan is what keeps the full trip competitive.`;
}

export function buildRankingReason(input: {
  priority: SearchPriority;
  costScore: number;
  frictionScore: number;
  shuttleUsed: boolean;
}) {
  if (input.priority === SearchPriority.CHEAPEST) {
    return input.shuttleUsed
      ? "This ranks well because the total stays lower once shuttle savings replace the worst local rideshare moments."
      : "This ranks well because the all-in total stays lower than the other workable options.";
  }

  if (input.priority === SearchPriority.SMOOTHEST) {
    return "This ranks well because airport transfer friction, layover exposure, and local commute burden are lower than the alternatives.";
  }

  return input.costScore >= input.frictionScore
    ? "This is not just cheap on paper; the trip still holds together after flights, lodging, and local movement are added."
    : "This is not the cheapest line item by line item, but it earns the recommendation by avoiding the biggest friction traps.";
}
