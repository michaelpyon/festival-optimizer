import { z } from "zod";

const envSchema = z.object({
  DATABASE_URL: z.string().min(1),
  AMADEUS_CLIENT_ID: z.string().optional(),
  AMADEUS_CLIENT_SECRET: z.string().optional(),
  TICKETMASTER_API_KEY: z.string().optional(),
  SERPAPI_KEY: z.string().optional(),
  COLLECTION_ARTIFACT_DIR: z.string().optional(),
  PLAYWRIGHT_HEADFUL: z
    .enum(["true", "false"])
    .optional()
    .transform((value) => value === "true"),
  DEFAULT_CURRENCY: z.string().default("USD"),
});

export const env = envSchema.parse(process.env);

export function getArtifactRoot() {
  return env.COLLECTION_ARTIFACT_DIR ?? "artifacts/collection";
}
