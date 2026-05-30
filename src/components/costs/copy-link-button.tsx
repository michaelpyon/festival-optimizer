"use client";

import { useState } from "react";

export function CopyLinkButton({ className }: { className?: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    const url = typeof window !== "undefined" ? window.location.href : "";
    if (!url) {
      return;
    }

    let didCopy = false;

    if (navigator?.clipboard?.writeText) {
      try {
        await navigator.clipboard.writeText(url);
        didCopy = true;
      } catch {
        didCopy = false;
      }
    }

    if (!didCopy) {
      try {
        const field = document.createElement("textarea");
        field.value = url;
        field.setAttribute("readonly", "");
        field.style.position = "absolute";
        field.style.left = "-9999px";
        document.body.appendChild(field);
        field.select();
        document.execCommand("copy");
        document.body.removeChild(field);
        didCopy = true;
      } catch {
        didCopy = false;
      }
    }

    if (didCopy) {
      setCopied(true);
      window.setTimeout(() => setCopied(false), 2000);
    }
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      aria-live="polite"
      className={`inline-flex min-h-[44px] items-center justify-center gap-2 rounded-full border border-outline-variant/40 bg-surface-container-lowest px-6 py-3 text-xs font-bold uppercase tracking-[0.2em] text-on-surface transition-colors hover:bg-surface-container-high active:scale-95 ${className ?? ""}`}
    >
      <span className="material-symbols-outlined text-lg">
        {copied ? "check" : "link"}
      </span>
      {copied ? "Copied" : "Copy link"}
    </button>
  );
}
