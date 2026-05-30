import Link from "next/link";

import { SiteShell } from "@/components/layout/site-shell";

export default function NotFound() {
  return (
    <SiteShell>
      <div className="pt-32 px-6 md:px-12 max-w-3xl mx-auto">
        <span className="editorial-kicker mb-2 block">Lost the trail</span>
        <h1 className="font-heading text-5xl md:text-7xl font-light text-on-surface tracking-tight leading-none mb-6">
          Page <span className="italic text-primary">not found</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-md leading-relaxed mb-8">
          This link points somewhere that no longer exists. A shared trip proposal may have been rebuilt. Start a fresh comparison to settle which festival and what it really costs.
        </p>
        <div className="flex flex-wrap gap-3">
          <Link
            href="/compare"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-primary transition-colors hover:scale-[1.02] active:scale-95"
          >
            Compare festivals
          </Link>
          <Link
            href="/"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface transition-colors hover:bg-surface-container-high active:scale-95"
          >
            Go home
          </Link>
        </div>
      </div>
    </SiteShell>
  );
}
