import { HotelClass, RoomType, SearchPriority } from "@prisma/client";

import { startComparisonAction } from "@/app/actions/search";
import { PendingSubmitButton } from "@/components/common/pending-submit-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";

type FestivalOption = {
  id: string;
  displayName: string;
  dateLabel: string;
  statusTone: "confirmed" | "tentative" | "historic";
  city: string;
  stateOrRegion?: string | null;
};

const selectClassName =
  "flex h-11 w-full rounded-full border border-transparent bg-input px-4 text-sm text-foreground transition-colors outline-none focus-visible:bg-accent focus-visible:ring-3 focus-visible:ring-ring/40";

export function SearchIntakeForm({
  festivalOptions,
}: {
  festivalOptions: FestivalOption[];
}) {
  return (
    <Card className="glass-panel border-0 bg-card/70 shadow-[0_20px_60px_rgb(0_0_0_/_0.26)]">
      <CardHeader className="space-y-4">
        <div className="flex flex-wrap gap-2">
          <span className="rounded-full bg-card/90 px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            Full-trip cost
          </span>
          <span className="rounded-full bg-card/90 px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            Confidence-aware
          </span>
          <span className="rounded-full bg-card/90 px-3 py-1 text-[0.68rem] uppercase tracking-[0.16em] text-muted-foreground">
            Festival-friendly tradeoffs
          </span>
        </div>
        <CardTitle className="font-heading text-3xl font-medium tracking-tight text-balance">
          Start with your trip reality
        </CardTitle>
      </CardHeader>
      <CardContent>
        <form action={startComparisonAction} className="space-y-6">
          <div className="grid gap-4 md:grid-cols-2">
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Home city
              </span>
              <Input
                name="sourceCity"
                defaultValue="New York, NY"
                placeholder="Los Angeles, CA"
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Preferred airport
              </span>
              <Input
                name="sourceAirport"
                placeholder="JFK (optional)"
                defaultValue=""
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Travelers
              </span>
              <Input
                type="number"
                name="travelers"
                min={1}
                max={8}
                defaultValue={2}
              />
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Priority
              </span>
              <select
                name="priority"
                className={selectClassName}
                defaultValue={SearchPriority.BEST_VALUE}
              >
                <option value={SearchPriority.BEST_VALUE}>Best overall value</option>
                <option value={SearchPriority.CHEAPEST}>Cheapest workable</option>
                <option value={SearchPriority.SMOOTHEST}>Smoothest trip</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Hotel class
              </span>
              <select
                name="hotelClass"
                className={selectClassName}
                defaultValue={HotelClass.MIDSCALE}
              >
                <option value={HotelClass.BUDGET}>Budget</option>
                <option value={HotelClass.MIDSCALE}>Midscale</option>
                <option value={HotelClass.UPSCALE}>Upscale</option>
                <option value={HotelClass.LUXURY}>Luxury</option>
              </select>
            </label>
            <label className="space-y-2">
              <span className="text-sm font-medium text-foreground">
                Room type
              </span>
              <select
                name="roomType"
                className={selectClassName}
                defaultValue={RoomType.PRIVATE_ROOM}
              >
                <option value={RoomType.PRIVATE_ROOM}>Private room</option>
                <option value={RoomType.SHARED_ROOM}>Shared room</option>
                <option value={RoomType.SUITE}>Suite / premium</option>
              </select>
            </label>
          </div>

          <fieldset className="space-y-3">
            <legend className="text-sm font-medium text-foreground">
              Festivals to compare
            </legend>
            <div className="grid gap-3">
              {festivalOptions.map((festival, index) => (
                <label
                  key={festival.id}
                  className={cn(
                    "flex cursor-pointer items-start gap-3 rounded-[1.25rem] bg-card/80 px-4 py-3 transition-colors hover:bg-accent/80",
                    festival.statusTone === "tentative" &&
                      "bg-secondary/35",
                  )}
                >
                  <input
                    type="checkbox"
                    name="festival"
                    value={festival.id}
                    defaultChecked={index < 3}
                    className="mt-1 size-4 rounded border-border text-primary focus-visible:outline-primary"
                  />
                  <div className="space-y-1">
                    <p className="text-sm font-semibold text-foreground">
                      {festival.displayName}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {festival.dateLabel}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {festival.city}
                      {festival.stateOrRegion ? `, ${festival.stateOrRegion}` : ""}
                    </p>
                  </div>
                </label>
              ))}
            </div>
          </fieldset>

          <div className="flex flex-col gap-3 pt-2 sm:flex-row sm:items-center sm:justify-between">
            <p className="max-w-xl text-sm leading-6 text-muted-foreground text-pretty">
              Compare uses the current festival catalog now, then layers flights,
              hotels, and local transport on top when quote collection runs.
            </p>
            <PendingSubmitButton
              label="Compare Festivals"
              pendingLabel="Running comparison..."
              size="lg"
              className="min-w-44"
            />
          </div>
        </form>
      </CardContent>
    </Card>
  );
}
