import Link from "next/link";

import { buttonLinkVariants } from "@/lib/button-styles";

const navItems = [
  { href: "/compare", label: "Compare" },
  { href: "/saved", label: "Saved Trips" },
  { href: "/admin", label: "Admin" },
];

export function SiteHeader() {
  return (
    <header className="sticky top-0 z-30">
      <div className="mx-auto flex w-full max-w-7xl items-center justify-between gap-4 px-5 py-5 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="glass-panel group flex items-center gap-4 rounded-full px-5 py-3">
            <div className="flex size-10 items-center justify-center rounded-full bg-primary text-sm font-semibold text-primary-foreground">
              FC
            </div>
            <div className="leading-tight">
              <p className="font-heading text-xl font-medium tracking-tight text-primary">
                Festival Companion
              </p>
              <p className="text-xs text-muted-foreground">
                Cinematic trip-cost comparison
              </p>
            </div>
          </Link>
        </div>
        <nav className="glass-panel hidden items-center gap-6 rounded-full px-6 py-3 text-sm text-muted-foreground md:flex">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="font-heading text-base tracking-tight transition-colors hover:text-primary"
            >
              {item.label}
            </Link>
          ))}
        </nav>
        <Link href="/compare" className={buttonLinkVariants({ size: "sm" })}>
          Enter The Grid
        </Link>
      </div>
    </header>
  );
}
