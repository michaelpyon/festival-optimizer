import { addHours, differenceInCalendarDays, startOfDay } from "date-fns";

export function inferTravelWindow(input: {
  startsAt: Date | null;
  endsAt: Date | null;
  arrivalBufferHours: number;
  departureBufferHours: number;
}) {
  if (!input.startsAt || !input.endsAt) {
    return null;
  }

  const arrivalBy = addHours(input.startsAt, -input.arrivalBufferHours);
  const departAfter = addHours(input.endsAt, input.departureBufferHours);
  const stayStart = startOfDay(arrivalBy);
  let stayEnd = startOfDay(departAfter);

  if (stayEnd <= stayStart) {
    stayEnd = addHours(stayStart, 24);
  }

  return {
    arrivalBy,
    departAfter,
    stayStart,
    stayEnd,
    hotelNights: Math.max(differenceInCalendarDays(stayEnd, stayStart), 1),
    travelDays: Math.max(differenceInCalendarDays(stayEnd, stayStart) + 1, 1),
    festivalDays: Math.max(
      differenceInCalendarDays(startOfDay(input.endsAt), startOfDay(input.startsAt)) +
        1,
      1,
    ),
    departureDate: stayStart.toISOString().slice(0, 10),
    returnDate: stayEnd.toISOString().slice(0, 10),
  };
}
