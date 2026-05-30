"use client";

import { useEffect } from "react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex-1 min-h-screen pb-24 md:pb-0">
      <div className="pt-32 px-6 md:px-12 max-w-3xl mx-auto">
        <span className="editorial-kicker mb-2 block">Something slipped</span>
        <h1 className="font-heading text-5xl md:text-7xl font-light text-on-surface tracking-tight leading-none mb-6">
          We hit a <span className="italic text-primary">snag</span>
        </h1>
        <p className="text-on-surface-variant text-lg max-w-md leading-relaxed mb-8">
          This page could not load right now. Your trip data is safe. Try again, or head back and rerun the comparison.
        </p>
        <div className="flex flex-wrap gap-3">
          <button
            type="button"
            onClick={() => reset()}
            className="inline-flex min-h-[44px] items-center justify-center rounded-full bg-primary px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-primary transition-colors hover:scale-[1.02] active:scale-95"
          >
            Try again
          </button>
          <a
            href="/compare"
            className="inline-flex min-h-[44px] items-center justify-center rounded-full border border-outline-variant/40 bg-surface-container-lowest px-8 py-4 text-xs font-bold uppercase tracking-[0.2em] text-on-surface transition-colors hover:bg-surface-container-high active:scale-95"
          >
            Compare festivals
          </a>
        </div>
      </div>
    </div>
  );
}
