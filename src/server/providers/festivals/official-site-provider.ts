import * as cheerio from "cheerio";

import { ArtifactStore } from "@/server/providers/shared/artifacts";
import type {
  FestivalMetadataObservation,
  FestivalMetadataProvider,
  ProviderContext,
  ProviderRunResult,
} from "@/server/providers/shared/types";

function isoDate(year: string, month: string, day: string) {
  return `${year}-${month.padStart(2, "0")}-${day.padStart(2, "0")}`;
}

function extractCoachellaDates(text: string) {
  const match = text.match(/APR\s+(\d{1,2})-(\d{1,2})\s*&\s*(\d{1,2})-(\d{1,2}),\s*(\d{4})/i);

  if (!match) {
    return null;
  }

  return [
    {
      label: "Weekend 1",
      startDate: isoDate(match[5], "04", match[1]),
      endDate: isoDate(match[5], "04", match[2]),
    },
    {
      label: "Weekend 2",
      startDate: isoDate(match[5], "04", match[3]),
      endDate: isoDate(match[5], "04", match[4]),
    },
  ];
}

function extractSingleRange(
  text: string,
): FestivalMetadataObservation["normalizedDateSpans"] | null {
  const sameMonth = text.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2})-(\d{1,2}),\s*(\d{4})/i,
  );

  if (sameMonth) {
    const month = new Date(`${sameMonth[1]} 1, ${sameMonth[4]}`).getMonth() + 1;
    return [
      {
        startDate: isoDate(sameMonth[4], String(month), sameMonth[2]),
        endDate: isoDate(sameMonth[4], String(month), sameMonth[3]),
      },
    ];
  }

  const verbose = text.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}).*?(\d{4}).*?(January|February|March|April|May|June|July|August|September|October|November|December)?\s*(\d{1,2}).*?(\d{4})/i,
  );

  if (verbose) {
    const startMonth = new Date(`${verbose[1]} 1, ${verbose[3]}`).getMonth() + 1;
    const endMonth = verbose[4]
      ? new Date(`${verbose[4]} 1, ${verbose[6]}`).getMonth() + 1
      : startMonth;
    const endYear = verbose[6] || verbose[3];

    return [
      {
        startDate: isoDate(verbose[3], String(startMonth), verbose[2]),
        endDate: isoDate(endYear, String(endMonth), verbose[5]),
      },
    ];
  }

  const singleDay = text.match(
    /(January|February|March|April|May|June|July|August|September|October|November|December)\s+(\d{1,2}),\s*(\d{4})/i,
  );

  if (singleDay) {
    const month = new Date(`${singleDay[1]} 1, ${singleDay[3]}`).getMonth() + 1;
    return [
      {
        startDate: isoDate(singleDay[3], String(month), singleDay[2]),
        endDate: isoDate(singleDay[3], String(month), singleDay[2]),
      },
    ];
  }

  return null;
}

function extractMetadata(url: string, title: string, text: string): FestivalMetadataObservation {
  const normalizedText = `${title} ${text}`.replace(/\s+/g, " ");
  const observedAt = new Date().toISOString();

  if (url.includes("coachella.com")) {
    return {
      sourceUrl: url,
      observedAt,
      confidence: 0.92,
      normalizedStatus: "confirmed",
      normalizedDateSpans: extractCoachellaDates(normalizedText) ?? undefined,
      rawTitle: title,
      rawDateText: normalizedText.match(/APR\s+\d{1,2}-\d{1,2}\s*&\s*\d{1,2}-\d{1,2},\s*\d{4}/i)?.[0] ?? null,
      notes: "Extracted from the official Coachella festival info page.",
    };
  }

  if (
    url.includes("lollapalooza.com") ||
    url.includes("shakykneesfestival.com") ||
    url.includes("sfoutsidelands.com") ||
    url.includes("justlikeheavenfest.com") ||
    url.includes("campfloggnaw.com")
  ) {
    const spans = extractSingleRange(normalizedText);

    return {
      sourceUrl: url,
      observedAt,
      confidence: spans ? 0.82 : 0.46,
      normalizedStatus: spans ? "confirmed" : "tentative",
      normalizedDateSpans: spans ?? undefined,
      rawTitle: title,
      rawDateText:
        normalizedText.match(
          /(January|February|March|April|May|June|July|August|September|October|November|December)[^|]{0,50}\d{4}/i,
        )?.[0] ?? null,
      notes: "Extracted from the official festival or support page title/body copy.",
    };
  }

  return {
    sourceUrl: url,
    observedAt,
    confidence: 0.35,
    rawTitle: title,
    rawDateText: null,
    notes: "No site-specific extractor matched this page yet.",
  };
}

export class OfficialFestivalSiteProvider implements FestivalMetadataProvider {
  key = "official-festival-site";

  async collectFestivalMetadata(
    url: string,
    context: ProviderContext,
  ): Promise<ProviderRunResult<FestivalMetadataObservation>> {
    const artifacts = new ArtifactStore(context);
    const response = await fetch(url, {
      headers: {
        "user-agent":
          "Festival Companion Metadata Collector/1.0 (+https://festival-companion.local)",
      },
      cache: "no-store",
    });

    const html = await response.text();
    await artifacts.writeHtml("official-source", html);

    const $ = cheerio.load(html);
    const title = $("title").first().text().trim();
    const bodyText = $("body").text().replace(/\s+/g, " ").trim();

    await artifacts.writeJson("official-source-summary", {
      url,
      responseStatus: response.status,
      title,
    });

    const record = extractMetadata(url, title, bodyText);

    if (!record.normalizedDateSpans?.length) {
      context.warnings.push({
        code: "festival_dates_not_parsed",
        message: `Could not extract structured dates from ${url}`,
      });
    }

    return {
      records: [record],
      warnings: context.warnings,
      artifacts: context.artifacts,
    };
  }
}
