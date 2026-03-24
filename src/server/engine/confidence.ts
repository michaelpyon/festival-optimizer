import { average } from "@/server/engine/stats";

export function scoreScenarioConfidence(input: {
  values: number[];
  sparseHotelInventory?: boolean;
  missingLiveFlight?: boolean;
  shuttleUnavailable?: boolean;
}) {
  let score = average(input.values.filter((value) => Number.isFinite(value)));

  if (input.sparseHotelInventory) {
    score -= 0.08;
  }
  if (input.missingLiveFlight) {
    score -= 0.06;
  }
  if (input.shuttleUnavailable) {
    score -= 0.02;
  }

  return Math.max(0.12, Math.min(0.98, Number(score.toFixed(2))));
}
