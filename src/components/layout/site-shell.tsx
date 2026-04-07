import type { ReactNode } from "react";

import { BottomNav } from "@/components/layout/bottom-nav";
import { SiteHeader } from "@/components/layout/site-header";

export function SiteShell({ children }: { children: ReactNode }) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1 min-h-screen pb-24 md:pb-0">{children}</main>
      <BottomNav />
    </>
  );
}
