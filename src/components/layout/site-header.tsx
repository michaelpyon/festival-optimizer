"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/compare", label: "Compare" },
  { href: "/festivals", label: "Destinations" },
  { href: "/saved", label: "Saved" },
  { href: "/admin", label: "Insights" },
];

export function SiteHeader() {
  const pathname = usePathname();

  return (
    <nav className="fixed top-0 w-full z-50 flex justify-between items-center px-8 h-20 bg-surface/80 backdrop-blur-xl bg-gradient-to-b from-surface-container-low to-transparent shadow-[0_20px_40px_rgba(75,63,114,0.08)]">
      <Link href="/" className="text-2xl font-bold font-heading text-primary">
        Festival Companion
      </Link>
      <div className="hidden md:flex items-center gap-8">
        {navItems.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(item.href + "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              className={`font-heading tracking-tight transition-colors ${
                isActive
                  ? "text-primary border-b-2 border-primary pb-1"
                  : "text-on-surface-variant hover:text-primary"
              }`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
      <div className="flex items-center gap-4">
        <button className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-colors duration-300 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <span className="material-symbols-outlined">notifications</span>
        </button>
        <button className="p-2 min-w-[44px] min-h-[44px] flex items-center justify-center rounded-full hover:bg-surface-variant/50 transition-colors duration-300 text-primary focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary">
          <span className="material-symbols-outlined">settings</span>
        </button>
        <div className="h-10 w-10 rounded-full bg-surface-container-highest overflow-hidden border border-outline-variant/20 flex items-center justify-center">
          <span className="text-sm font-semibold text-primary">FC</span>
        </div>
      </div>
    </nav>
  );
}
