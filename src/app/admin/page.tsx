import { HotelClass, RoomType, SearchPriority } from "@prisma/client";

import {
  flagQuoteAction,
  refreshFestivalMetadataAction,
  updateEditionOverrideAction,
} from "@/app/actions/admin";
import { startComparisonAction } from "@/app/actions/search";
import { PendingSubmitButton } from "@/components/common/pending-submit-button";
import { SiteShell } from "@/components/layout/site-shell";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  getAdminDashboardData,
  summarizeQuoteRecord,
} from "@/lib/catalog";
import { formatCurrency, formatDateLabel } from "@/lib/format";

const selectClassName =
  "flex h-10 w-full rounded-xl border border-outline-variant/20 bg-surface-container-low px-3 text-sm text-on-surface shadow-xs transition-colors outline-none focus-visible:border-primary focus-visible:ring-3 focus-visible:ring-primary/20";

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
    <div className="bg-surface-container-high p-5 rounded-xl border-l-2 border-outline-variant/30">
      <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
        <div>
          <p className="font-bold text-sm text-on-surface">
            {quote.festivalEdition.festival.name}
            {quote.festivalEdition.editionName ? ` ${quote.festivalEdition.editionName}` : ""}
          </p>
          <p className="text-xs text-on-surface-variant">
            {summarizeQuoteRecord({
              rawProviderName: quote.rawProviderName,
              normalizedProviderName: quote.normalizedProviderName,
              sourceType: quote.sourceType,
              observedAt: quote.observedAt,
              confidence: quote.confidence,
            })}
          </p>
        </div>
        <p className="font-heading text-lg text-primary font-bold">{amountLabel}</p>
      </div>
      {quote.notes && (
        <p className="text-sm text-on-surface-variant mb-3">{quote.notes}</p>
      )}
      <div className="flex flex-wrap gap-3 text-sm mb-3">
        <a href={quote.sourceUrl} target="_blank" rel="noreferrer" className="inline-flex min-h-[44px] items-center text-primary font-medium hover:underline">
          Open source
        </a>
      </div>
      {quote.flaggedBadReason ? (
        <div className="rounded-lg bg-error-container/10 border border-error/20 px-4 py-3 text-sm text-error">
          Flagged: {quote.flaggedBadReason}
        </div>
      ) : (
        <form action={flagQuoteAction} className="grid gap-3 sm:grid-cols-[1fr_auto]">
          <input type="hidden" name="quoteId" value={quote.id} />
          <input type="hidden" name="quoteType" value={quoteType} />
          <Input name="reason" defaultValue="Suspicious outlier or bad extraction." />
          <PendingSubmitButton label="Flag" pendingLabel="Flagging..." variant="outline" />
        </form>
      )}
    </div>
  );
}

export default async function AdminPage({ searchParams }: AdminPageProps) {
  const data = await getAdminDashboardData();
  const resolvedSearchParams = await searchParams;
  const message =
    typeof resolvedSearchParams.message === "string" ? resolvedSearchParams.message : null;
  const updatedCount =
    typeof resolvedSearchParams.updated === "string" ? resolvedSearchParams.updated : null;

  return (
    <SiteShell>
      <div className="pt-32 px-6 md:px-12 max-w-7xl mx-auto">
        {/* Header */}
        <header className="mb-12 flex flex-col md:flex-row md:items-end justify-between gap-6">
          <div>
            <span className="editorial-kicker mb-2 block">System Controller</span>
            <h1 className="font-heading text-5xl md:text-7xl font-bold text-on-surface tracking-tight leading-none mb-4">
              Data Quality <span className="italic text-primary">Center</span>
            </h1>
            <p className="text-on-surface-variant text-sm">
              Catalog health, quote collection, and review controls
            </p>
          </div>
        </header>

        {/* Status Message */}
        {message && (
          <div className="mb-8 bg-tertiary-container/10 border border-tertiary/20 rounded-xl p-4 text-sm text-tertiary">
            {message === "metadata-refreshed"
              ? `Festival metadata refreshed for ${updatedCount ?? "0"} current editions.`
              : message === "festival-updated"
                ? "Festival override saved."
                : message === "quote-flagged"
                  ? "Quote flagged for review."
                  : "Admin action completed."}
          </div>
        )}

        {/* Stats Bento Grid */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-12">
          <div className="md:col-span-2 bg-surface-container-low p-8 rounded-xl relative overflow-hidden flex flex-col justify-between min-h-[220px]">
            <div className="relative z-10">
              <p className="text-[10px] uppercase tracking-[0.2em] text-tertiary font-bold mb-2">Total Festivals</p>
              <h3 className="font-heading text-6xl text-on-surface">{data.stats.festivals}</h3>
              <p className="text-sm text-on-surface-variant mt-2">
                {data.stats.editions} editions tracked across all festival circuits.
              </p>
            </div>
            <div className="absolute -right-8 -bottom-8 w-48 h-48 bg-tertiary-container/10 rounded-full blur-[60px]" />
          </div>
          <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-outline font-bold mb-4">Airports</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-on-surface">{data.stats.airports}</span>
                <span className="text-on-surface-variant text-sm">mapped</span>
              </div>
            </div>
            <div className="flex items-center gap-2 text-[10px] text-tertiary-fixed font-bold bg-on-tertiary/20 w-fit px-3 py-1 rounded-full uppercase">
              <span className="w-1.5 h-1.5 bg-tertiary-fixed rounded-full" />
              Active
            </div>
          </div>
          <div className="bg-surface-container-low p-8 rounded-xl flex flex-col justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-primary font-bold mb-4">Search Runs</p>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-on-surface">{data.stats.searchRuns}</span>
              </div>
            </div>
            <div className="text-[10px] text-on-surface-variant leading-tight">
              Completed comparisons
            </div>
          </div>
        </section>

        {/* Operational Modules */}
        <section className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-12">
          {/* Quote Refresh */}
          <div className="lg:col-span-1 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-heading text-xl text-primary-fixed">Data Refresh</h4>
              <span className="text-[10px] text-outline uppercase tracking-widest">Manual Trigger</span>
            </div>
            <div className="space-y-4">
              <div className="bg-surface-container-high p-5 rounded-xl border-l-2 border-primary-container">
                <form action={refreshFestivalMetadataAction} className="space-y-3">
                  <p className="font-bold text-sm text-on-surface">Metadata Refresh</p>
                  <p className="text-xs text-on-surface-variant">
                    Pull current dates and status from official festival pages.
                  </p>
                  <PendingSubmitButton
                    label="Refresh Now"
                    pendingLabel="Refreshing..."
                    className="w-full"
                  />
                </form>
              </div>
            </div>
          </div>

          {/* Quick Quote Collection */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h4 className="font-heading text-xl text-primary-fixed">Quote Collection</h4>
            </div>
            <div className="bg-surface-container-low rounded-xl p-6">
              <form action={startComparisonAction} className="space-y-4">
                <p className="font-bold text-on-surface mb-4">Quick Comparison Run</p>
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
                <div className="grid gap-2 max-h-60 overflow-y-auto">
                  {data.currentEditions.map((edition, index) => (
                    <label
                      key={edition.id}
                      className="flex items-start gap-3 rounded-xl border border-outline-variant/10 bg-surface-container px-4 py-3 cursor-pointer hover:bg-surface-container-high transition-colors"
                    >
                      <input
                        type="checkbox"
                        name="festival"
                        value={edition.id}
                        defaultChecked={index < 3}
                        className="mt-1 size-4"
                      />
                      <div>
                        <p className="text-sm font-medium text-on-surface">
                          {edition.festival.name}{edition.editionName ? ` ${edition.editionName}` : ""}
                        </p>
                        <p className="text-xs text-on-surface-variant">
                          {formatDateLabel(edition.startsAt)} to {formatDateLabel(edition.endsAt)}
                        </p>
                      </div>
                    </label>
                  ))}
                </div>
                <PendingSubmitButton
                  label="Run Quote Collection"
                  pendingLabel="Collecting quotes..."
                  className="w-full"
                />
              </form>
            </div>
          </div>
        </section>

        {/* Manual Overrides */}
        <section className="mb-12 space-y-6">
          <h4 className="font-heading text-xl text-primary-fixed">Edition Overrides</h4>
          <div className="grid gap-4">
            {data.currentEditions.map((edition) => (
              <form
                key={edition.id}
                action={updateEditionOverrideAction}
                className="bg-surface-container-low rounded-xl p-6 hover:bg-surface-container-high/40 transition-colors"
              >
                <input type="hidden" name="editionId" value={edition.id} />
                <input type="hidden" name="slug" value={edition.festival.slug} />
                <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
                  <div>
                    <p className="text-sm font-bold text-on-surface">
                      {edition.festival.name}{edition.editionName ? ` ${edition.editionName}` : ""}
                    </p>
                    <p className="text-[10px] text-on-surface-variant">
                      Updated {formatDateLabel(edition.updatedAt)}
                    </p>
                  </div>
                </div>
                <div className="grid gap-3 sm:grid-cols-4">
                  <select name="status" className={selectClassName} defaultValue={edition.status}>
                    <option value="CONFIRMED">Confirmed</option>
                    <option value="TENTATIVE">Tentative</option>
                    <option value="HISTORIC">Historic</option>
                  </select>
                  <Input
                    type="date"
                    name="startsAt"
                    defaultValue={edition.startsAt ? edition.startsAt.toISOString().slice(0, 10) : ""}
                  />
                  <Input
                    type="date"
                    name="endsAt"
                    defaultValue={edition.endsAt ? edition.endsAt.toISOString().slice(0, 10) : ""}
                  />
                  <PendingSubmitButton label="Save" pendingLabel="..." variant="outline" />
                </div>
              </form>
            ))}
          </div>
        </section>

        {/* Tentative Editions */}
        {data.tentativeEditions.length > 0 && (
          <section className="mb-12 space-y-4">
            <h4 className="font-heading text-xl text-primary-fixed">Tentative Watchlist</h4>
            {data.tentativeEditions.map((edition) => (
              <div
                key={edition.id}
                className="bg-secondary-container/10 border border-secondary-container/20 rounded-xl px-6 py-4"
              >
                <p className="font-bold text-on-surface text-sm">
                  {edition.festival.name} {edition.editionName ?? ""}
                </p>
                <p className="text-xs text-on-surface-variant">
                  {edition.year} • updated {formatDateLabel(edition.updatedAt)}
                </p>
                {edition.metadataNotes && (
                  <p className="mt-2 text-sm text-on-surface-variant">{edition.metadataNotes}</p>
                )}
              </div>
            ))}
          </section>
        )}

        {/* Recent Quotes */}
        <section className="grid gap-6 xl:grid-cols-3 mb-32">
          <div className="space-y-4">
            <h4 className="font-heading text-xl text-primary-fixed">Recent Flight Quotes</h4>
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
            <h4 className="font-heading text-xl text-primary-fixed">Recent Hotel Quotes</h4>
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
            <h4 className="font-heading text-xl text-primary-fixed">Recent Ground Quotes</h4>
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
