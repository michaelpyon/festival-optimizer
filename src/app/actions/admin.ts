"use server";

import { FestivalEditionStatus } from "@prisma/client";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { prisma } from "@/lib/prisma";
import { OfficialFestivalSiteProvider } from "@/server/providers/festivals/official-site-provider";
import { TicketmasterDiscoveryProvider } from "@/server/providers/festivals/ticketmaster-provider";
import { createProviderContext } from "@/server/providers";

const overrideEditionSchema = z.object({
  editionId: z.string().min(1),
  slug: z.string().min(1),
  status: z.nativeEnum(FestivalEditionStatus),
  startsAt: z.string().trim().optional(),
  endsAt: z.string().trim().optional(),
  metadataNotes: z.string().trim().optional(),
});

const flagQuoteSchema = z.object({
  quoteId: z.string().min(1),
  quoteType: z.enum(["flight", "hotel", "ground"]),
  reason: z.string().trim().min(3).max(160),
});

function dateOnlyToDate(value?: string | null, endOfDay?: boolean) {
  if (!value) {
    return null;
  }

  return new Date(`${value}T${endOfDay ? "23:00:00.000Z" : "12:00:00.000Z"}`);
}

function findBestSpan(input: {
  editionName: string | null;
  spans: Array<{ label?: string; startDate: string | null; endDate: string | null }>;
}) {
  const normalizedEditionName = input.editionName?.toLowerCase() ?? "";

  return (
    input.spans.find((span) => {
      const label = span.label?.toLowerCase() ?? "";
      return label.length > 0 && normalizedEditionName.includes(label);
    }) ?? input.spans[0]
  );
}

export async function refreshFestivalMetadataAction() {
  const editions = await prisma.festivalEdition.findMany({
    where: {
      isCurrentEdition: true,
    },
    include: {
      festival: true,
    },
    orderBy: [{ year: "desc" }, { editionKey: "asc" }],
  });

  const officialProvider = new OfficialFestivalSiteProvider();
  const ticketmasterProvider = new TicketmasterDiscoveryProvider();
  let updatedCount = 0;

  for (const edition of editions) {
    const observations = [];

    if (edition.festival.officialWebsite) {
      const officialResult = await officialProvider.collectFestivalMetadata(
        edition.festival.officialWebsite,
        createProviderContext(officialProvider.key, `admin-${edition.id}-official`),
      );
      observations.push(...officialResult.records);
    }

    const ticketmasterResult = await ticketmasterProvider.collectFestivalMetadata(
      edition.festival.name,
      createProviderContext(ticketmasterProvider.key, `admin-${edition.id}-ticketmaster`),
    );
    observations.push(...ticketmasterResult.records);

    const bestObservation =
      [...observations].sort((left, right) => right.confidence - left.confidence)[0] ?? null;

    if (!bestObservation) {
      continue;
    }

    const bestSpan =
      bestObservation.normalizedDateSpans && bestObservation.normalizedDateSpans.length > 0
        ? findBestSpan({
            editionName: edition.editionName,
            spans: bestObservation.normalizedDateSpans,
          })
        : null;

    await prisma.festivalEdition.update({
      where: { id: edition.id },
      data: {
        status:
          bestObservation.normalizedStatus === "confirmed"
            ? FestivalEditionStatus.CONFIRMED
            : FestivalEditionStatus.TENTATIVE,
        startsAt: bestSpan?.startDate
          ? dateOnlyToDate(bestSpan.startDate, false)
          : edition.startsAt,
        endsAt: bestSpan?.endDate ? dateOnlyToDate(bestSpan.endDate, true) : edition.endsAt,
        metadataSourceUrl: bestObservation.sourceUrl,
        metadataObservedAt: new Date(bestObservation.observedAt),
        metadataConfidence: bestObservation.confidence,
        metadataNotes: bestObservation.notes ?? edition.metadataNotes,
      },
    });

    updatedCount += 1;
    revalidatePath(`/festivals/${edition.festival.slug}`);
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath("/compare");

  redirect(`/admin?message=metadata-refreshed&updated=${updatedCount}`);
}

export async function updateEditionOverrideAction(formData: FormData) {
  const parsed = overrideEditionSchema.parse({
    editionId: formData.get("editionId"),
    slug: formData.get("slug"),
    status: formData.get("status"),
    startsAt: formData.get("startsAt"),
    endsAt: formData.get("endsAt"),
    metadataNotes: formData.get("metadataNotes"),
  });

  await prisma.festivalEdition.update({
    where: { id: parsed.editionId },
    data: {
      status: parsed.status,
      startsAt: parsed.startsAt ? dateOnlyToDate(parsed.startsAt, false) : null,
      endsAt: parsed.endsAt ? dateOnlyToDate(parsed.endsAt, true) : null,
      metadataNotes: parsed.metadataNotes || null,
      metadataObservedAt: new Date(),
    },
  });

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/festivals/${parsed.slug}`);

  redirect("/admin?message=festival-updated");
}

export async function flagQuoteAction(formData: FormData) {
  const parsed = flagQuoteSchema.parse({
    quoteId: formData.get("quoteId"),
    quoteType: formData.get("quoteType"),
    reason: formData.get("reason"),
  });

  const data = {
    flaggedBadAt: new Date(),
    flaggedBadReason: parsed.reason,
  };

  if (parsed.quoteType === "flight") {
    await prisma.flightQuote.update({
      where: { id: parsed.quoteId },
      data,
    });
  } else if (parsed.quoteType === "hotel") {
    await prisma.hotelQuote.update({
      where: { id: parsed.quoteId },
      data,
    });
  } else {
    await prisma.groundTransportQuote.update({
      where: { id: parsed.quoteId },
      data,
    });
  }

  revalidatePath("/admin");
  redirect("/admin?message=quote-flagged");
}
