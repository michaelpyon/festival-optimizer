"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";

import { parseComparisonFormData } from "@/lib/search-params";
import { runComparison } from "@/server/engine/run-comparison";

export async function startComparisonAction(formData: FormData) {
  const parsed = parseComparisonFormData(formData);
  const runId = await runComparison({
    sourceCity: parsed.sourceCity,
    sourceAirport: parsed.sourceAirport,
    travelers: parsed.travelers,
    roomType: parsed.roomType,
    hotelClass: parsed.hotelClass,
    priority: parsed.priority,
    festivalEditionIds: parsed.festival,
  });

  revalidatePath("/");
  revalidatePath("/compare");
  revalidatePath("/saved");
  revalidatePath("/admin");

  redirect(`/compare?run=${runId}`);
}
