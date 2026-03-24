import {
  CostScenarioType,
  HotelClass,
  RoomType,
  SearchPriority,
} from "@prisma/client";
import { z } from "zod";

const baseCompareFieldsSchema = z.object({
  sourceCity: z.string().trim().default("New York, NY"),
  sourceAirport: z
    .string()
    .trim()
    .optional()
    .transform((value) => value || undefined),
  travelers: z.coerce.number().int().min(1).max(8).default(2),
  roomType: z.nativeEnum(RoomType).default(RoomType.PRIVATE_ROOM),
  hotelClass: z.nativeEnum(HotelClass).default(HotelClass.MIDSCALE),
  priority: z.nativeEnum(SearchPriority).default(SearchPriority.BEST_VALUE),
});

const compareSearchParamsSchema = baseCompareFieldsSchema.extend({
  festival: z.array(z.string()).default([]),
  run: z.string().trim().optional(),
  sort: z
    .enum(["overall", "total", "friction", "confidence", "festival"])
    .default("overall"),
});

export type CompareSearchParams = z.infer<typeof compareSearchParamsSchema>;
export type ComparisonFormInput = z.infer<typeof comparisonFormSchema>;

const comparisonFormSchema = baseCompareFieldsSchema.extend({
  festival: z.array(z.string()).min(1).max(6),
});

export function parseCompareSearchParams(
  raw: Record<string, string | string[] | undefined>,
) {
  return compareSearchParamsSchema.parse({
    sourceCity: raw.sourceCity,
    sourceAirport: raw.sourceAirport,
    travelers: raw.travelers,
    roomType: raw.roomType,
    hotelClass: raw.hotelClass,
    priority: raw.priority,
    festival: Array.isArray(raw.festival)
      ? raw.festival
      : raw.festival
        ? [raw.festival]
        : [],
    run: raw.run,
    sort: raw.sort,
  });
}

export function parseComparisonFormData(formData: FormData) {
  return comparisonFormSchema.parse({
    sourceCity: formData.get("sourceCity"),
    sourceAirport: formData.get("sourceAirport"),
    travelers: formData.get("travelers"),
    roomType: formData.get("roomType"),
    hotelClass: formData.get("hotelClass"),
    priority: formData.get("priority"),
    festival: formData.getAll("festival"),
  });
}

export function getPrimaryScenarioType(priority: SearchPriority) {
  if (priority === SearchPriority.CHEAPEST) {
    return CostScenarioType.CHEAPEST_WORKABLE;
  }

  if (priority === SearchPriority.SMOOTHEST) {
    return CostScenarioType.COMFORT;
  }

  return CostScenarioType.BALANCED;
}
