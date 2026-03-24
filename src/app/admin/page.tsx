import { HotelClass, RoomType, SearchPriority } from "@prisma/client";

import {
  flagQuoteAction,
  refreshFestivalMetadataAction,
  updateEditionOverrideAction,
} from "@/app/actions/admin";
import { startComparisonAction } from "@/app/actions/search";
import { PendingSubmitButton } from "@/components/common/pending-submit-button";
import { SectionHeading } from "@/components/common/section-heading";
import { SiteShell } from "@/components/layout/site-shell";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminDashboardData,
  summarizeQuoteRecord,
} from "@/lib/catalog";
import { formatCurrency, formatDateLabel } from "@/lib/format";

const selectClassName =
  "flex h-10 w-full rounded-xl border border-input bg-card px-3 text-sm text-foreground shadow-xs transition-colors outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/40";

type AdminPageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
};

function QuoteReviewCard({
  quoteType,
  quote,
  amountLabel,
}: {
  quoteType: "flight" | "hotel" | "ground";
  quote: {
    id: string;
    rawProviderName: string;
    normalizedProviderName: string;
    sourceType: string;
    observedAt: Date;
    confidence: number;
    sourceUrl: string;
    notes: string | null;
    snapshotPath?: string | null;
    flaggedBadReason?: string | null;
    festivalEdition: {
      festival: {
        name: string;
      };
      editionName: string | null;
    };
  };
  amountLabel: string;
}) {
  return (
    <Card className="border-border/80 bg-card shadow-none">
      <CardContent className="space-y-4 px-5 py-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="font-medium text-foreground">
              {quote.festivalEdition.festival.name}
              {quote.festivalEdition.editionName
                ? ` ${quote.festivalEdition.editionName}`
                : ""}
            </p>
            <p className="text-sm text-muted-foreground">
              {summarizeQuoteRecord({
                rawProviderName: quote.rawProviderName,
                normalizedProviderName: quote.normalizedProviderName,
                sourceType: quote.sourceType,
                observedAt: quote.observedAt,
                confidence: quote.confidence,
              })}
            </p>
          </div>
          <p className="font-mono text-sm font-semibold tabular-nums text-foreground">
            {amountLabel}
          </p>
        </div>
        {quote.notes ? (
          <p className="text-sm leading-6 text-pretty text-muted-foreground">
            {quote.notes}
          </p>
        ) : null}
        <div className="flex flex-wrap gap-3 text-sm">
          <a
            href={quote.sourceUrl}
            target="_blank"
            rel="noreferrer"
            className="font-medium text-primary"
          >
            Open source
          </a>
          {quote.snapshotPath ? (
            <span className="text-muted-foreground">{quote.snapshotPath}</span>
          ) : null}
        </div>
        {quote.flaggedBadReason ? (
          <div className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-900">
            Flagged: {quote.flaggedBadReason}
          </div>
        ) : (
          <form action={flagQuoteAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
            <input type="hidden" name="quoteId" value={quote.id} />
            <input type="hidden" name="quoteType" value={quoteType} />
            <Input name="reason" defaultValue="Suspicious outlier or bad extraction." />
            <PendingSubmitButton
              label="Flag quote"
              pendingLabel="Flagging..."
              variant="outline"
            />
          </form>
        )}
      </CardContent>
    </Card>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const data = await getAdminDashboardData();
  const resolvedSearchParams = await searchParams;
  const message =
    typeof resolvedSearchParams.message === "string"
      ? resolvedSearchParams.message
      : null;
  const updatedCount =
    typeof resolvedSearchParams.updated === "string"
      ? resolvedSearchParams.updated
      : null;

  return (
    <SiteShell>
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-10 px-5 py-12 sm:px-6 lg:px-8">
        <SectionHeading
          eyebrow="Admin"
          title="Catalog health, quote collection, and review controls"
          description="This is the internal operator surface for refreshing festival metadata, kicking off comparison runs, inspecting normalized versus raw quote records, and overriding bad data."
        />

        {message ? (
          <Card className="border-emerald-200 bg-emerald-50 shadow-none">
            <CardContent className="px-5 py-4 text-sm text-emerald-900">
              {message === "metadata-refreshed"
                ? `Festival metadata refreshed for ${updatedCount ?? "0"} current editions.`
                : message === "festival-updated"
                  ? "Festival override saved."
                  : message === "quote-flagged"
                    ? "Quote flagged for review."
                    : "Admin action completed."}
            </CardContent>
          </Card>
        ) : null}

        <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            { label: "Festivals", value: data.stats.festivals },
            { label: "Editions", value: data.stats.editions },
            { label: "Airports", value: data.stats.airports },
            { label: "Search runs", value: data.stats.searchRuns },
          ].map((item) => (
            <Card key={item.label} className="border-border/80 bg-card shadow-none">
              <CardContent className="space-y-2 px-5 py-5">
                <p className="text-xs uppercase text-muted-foreground">{item.label}</p>
                <p className="font-mono text-3xl font-semibold tabular-nums text-foreground">
                  {item.value}
                </p>
              </CardContent>
            </Card>
          ))}
        </section>

        <section className="grid gap-6 lg:grid-cols-[0.95fr_1.05fr]">
          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-5 px-5 py-5">
              <p className="font-heading text-2xl font-semibold text-balance">
                Refresh and collection
              </p>
              <form action={refreshFestivalMetadataAction} className="space-y-3">
                <p className="text-sm leading-6 text-pretty text-muted-foreground">
                  Pull current dates and status from official festival pages, with
                  Ticketmaster as a lower-priority fallback when configured.
                </p>
                <PendingSubmitButton
                  label="Refresh festival metadata"
                  pendingLabel="Refreshing metadata..."
                  className="w-full"
                />
              </form>
              <Separator />
              <form action={startComparisonAction} className="space-y-4">
                <p className="font-medium text-foreground">Quick quote collection</p>
                <div className="grid gap-3 sm:grid-cols-2">
                  <Input name="sourceCity" defaultValue="New York, NY" />
                  <Input name="sourceAirport" placeholder="JFK (optional)" />
                  <Input type="number" name="travelers" min={1} max={8} defaultValue={2} />
                  <select name="priority" className={selectClassName} defaultValue={SearchPriority.BEST_VALUE}>
                    <option value={SearchPriority.BEST_VALUE}>Best overall value</option>
                    <option value={SearchPriority.CHEAPEST}>Cheapest workable</option>
                    <option value={SearchPriority.SMOOTHEST}>Smoothest trip</option>
                  </select>
                  <select name="hotelClass" className={selectClassName} defaultValue={HotelClass.MIDSCALE}>
                    <option value={HotelClass.BUDGET}>Budget</option>
                    <option value={HotelClass.MIDSCALE}>Midscale</option>
                    <option value={HotelClass.UPSCALE}>Upscale</option>
                    <option value={HotelClass.LUXURY}>Luxury</option>
                  </select>
                  <select name="roomType" className={selectClassName} defaultValue={RoomType.PRIVATE_ROOM}>
                    <option value={RoomType.PRIVATE_ROOM}>Private room</option>
                    <option value={RoomType.SHARED_ROOM}>Shared room</option>
                    <option value={RoomType.SUITE}>Suite / premium</option>
                  </select>
                </div>
                <div className="grid gap-2">
                  {data.currentEditions.map((edition, index) => (
                    <label
                      key={edition.id}
                      className="flex items-start gap-3 rounded-2xl border border-border bg-background px-4 py-3"
                    >
                      <input
                        type="checkbox"
                        name="festival"
                        value={edition.id}
                        defaultChecked={index < 3}
                        className="mt-1 size-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-foreground">
                          {edition.festival.name}
                          {edition.editionName ? ` ${edition.editionName}` : ""}
                        </p>
                        <p className="text-sm text-muted-foreground">
                          {formatDateLabel(edition.startsAt)} to {formatDateLabel(edition.endsAt)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                <PendingSubmitButton
                  label="Run quote collection"
                  pendingLabel="Collecting quotes..."
                  className="w-full"
                />
              </form>
            </CardContent>
          </Card>

          <Card className="border-border/80 bg-card shadow-none">
            <CardContent className="space-y-5 px-5 py-5">
              <p className="font-heading text-2xl font-semibold text-balance">
                Manual festival overrides
              </p>
              <div className="grid gap-4">
                {data.currentEditions.map((edition) => (
                  <form
                    key={edition.id}
                    action={updateEditionOverrideAction}
                    className="space-y-3 rounded-2xl border border-border bg-background px-4 py-4"
                  >
                    <input type="hidden" name="editionId" value={edition.id} />
                    <input type="hidden" name="slug" value={edition.festival.slug} />
                    <div>
                      <p className="font-medium text-foreground">
                        {edition.festival.name}
                        {edition.editionName ? ` ${edition.editionName}` : ""}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        Last updated {formatDateLabel(edition.updatedAt)}
                      </p>
                    </div>
                    <div className="grid gap-3 sm:grid-cols-3">
                      <select
                        name="status"
                        className={selectClassName}
                        defaultValue={edition.status}
                      >
                        <option value="CONFIRMED">Confirmed</option>
                        <option value="TENTATIVE">Tentative</option>
                        <option value="HISTORIC">Historic</option>
                      </select>
                      <Input
                        type="date"
                        name="startsAt"
                        defaultValue={
                          edition.startsAt ? edition.startsAt.toISOString().slice(0, 10) : ""
                        }
                      />
                      <Input
                        type="date"
                        name="endsAt"
                        defaultValue={
                          edition.endsAt ? edition.endsAt.toISOString().slice(0, 10) : ""
                        }
                      />
                    </div>
                    <Textarea
                      name="metadataNotes"
                      defaultValue={edition.metadataNotes ?? ""}
                      rows={3}
                    />
                    <PendingSubmitButton
                      label="Save override"
                      pendingLabel="Saving override..."
                      variant="outline"
                    />
                  </form>
                ))}
              </div>
            </CardContent>
          </Card>
        </section>

        <section className="space-y-5">
          <SectionHeading
            title="Tentative editions to watch"
            description="These records are still valuable for airport and hotel-market planning, but they should not be treated as book-now safe until dates are confirmed."
          />
          <div className="grid gap-3">
            {data.tentativeEditions.map((edition) => (
              <div
                key={edition.id}
                className="rounded-2xl border border-amber-200 bg-amber-50 px-4 py-3"
              >
                <p className="font-medium text-amber-900">
                  {edition.festival.name} {edition.editionName ?? ""}
                </p>
                <p className="text-sm text-amber-800">
                  {edition.year} • updated {formatDateLabel(edition.updatedAt)}
                </p>
                <p className="mt-2 text-sm leading-6 text-pretty text-amber-800">
                  {edition.metadataNotes}
                </p>
              </div>
            ))}
          </div>
        </section>

        <section className="grid gap-6 xl:grid-cols-3">
          <div className="space-y-4">
            <SectionHeading
              title="Recent flight quotes"
              description="Raw provider names sit next to normalized providers so bad mappings are easy to spot."
            />
            <div className="grid gap-3">
              {data.recentFlightQuotes.map((quote) => (
                <QuoteReviewCard
                  key={quote.id}
                  quoteType="flight"
                  quote={quote}
                  amountLabel={formatCurrency(quote.amount.toString(), quote.currency)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeading
              title="Recent hotel quotes"
              description="Sparse or obviously inflated inventory can be flagged here before it affects recommendation logic."
            />
            <div className="grid gap-3">
              {data.recentHotelQuotes.map((quote) => (
                <QuoteReviewCard
                  key={quote.id}
                  quoteType="hotel"
                  quote={quote}
                  amountLabel={formatCurrency(quote.amount.toString(), quote.currency)}
                />
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <SectionHeading
              title="Recent ground quotes"
              description="Ground estimates are often where hidden trip pain shows up first, so they deserve explicit review."
            />
            <div className="grid gap-3">
              {data.recentGroundQuotes.map((quote) => (
                <QuoteReviewCard
                  key={quote.id}
                  quoteType="ground"
                  quote={quote}
                  amountLabel={formatCurrency(quote.amount.toString(), quote.currency)}
                />
              ))}
            </div>
          </div>
        </section>
      </div>
    </SiteShell>
  );
}
