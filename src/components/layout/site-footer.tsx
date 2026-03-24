export function SiteFooter() {
  return (
    <footer className="mt-16">
      <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 px-5 py-10 text-sm text-muted-foreground sm:px-6 lg:px-8 md:flex-row md:items-center md:justify-between">
        <p className="max-w-2xl text-pretty">
          Festival Companion compares total trip cost, convenience, and travel
          friction. When a value is estimated instead of quoted, the app shows
          the source, timestamp, confidence, and assumptions.
        </p>
        <p className="font-mono text-xs tabular-nums">Next.js + Prisma + SQLite • Cinematic Concierge system</p>
      </div>
    </footer>
  );
}
