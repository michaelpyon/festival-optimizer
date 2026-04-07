"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { href: "/", icon: "explore", label: "Explore" },
  { href: "/compare", icon: "compare_arrows", label: "Compare" },
  { href: "/saved", icon: "bookmark", label: "Saved" },
  { href: "/admin", icon: "person", label: "Profile" },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav className="md:hidden fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-6 pb-[env(safe-area-inset-bottom)] h-20 bg-surface-container-low/90 backdrop-blur-lg rounded-t-3xl border-t border-primary/10 shadow-[0_-10px_30px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href));
        return (
          <Link
            key={item.href}
            href={item.href}
            className={`flex flex-col items-center justify-center tap-highlight-transparent active:scale-95 transition-transform ${
              isActive
                ? "bg-surface-variant text-primary rounded-xl px-4 py-1"
                : "text-on-surface-variant opacity-70"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={isActive ? { fontVariationSettings: "'FILL' 1" } : undefined}
            >
              {item.icon}
            </span>
            <span className="font-sans text-[10px] uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
