"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/",         label: "News" },
  { href: "/voices",   label: "Voices" },
  { href: "/trending", label: "Trending" },
];

export function Nav() {
  const pathname = usePathname();
  return (
    <nav className="border-b border-rule bg-paper sticky top-0 z-10">
      <div className="mx-auto w-full max-w-[1600px] px-4 sm:px-6 lg:px-10 xl:px-14">
        <ul className="flex gap-6 sm:gap-8">
          {TABS.map((tab) => {
            const active =
              tab.href === "/"
                ? pathname === "/"
                : pathname === tab.href || pathname.startsWith(`${tab.href}/`);
            return (
              <li key={tab.href}>
                <Link
                  href={tab.href}
                  aria-current={active ? "page" : undefined}
                  className={`block py-4 text-[11px] uppercase tracking-[0.22em] font-semibold transition-colors border-b-2 -mb-px ${
                    active
                      ? "text-accent border-accent"
                      : "text-ink-muted border-transparent hover:text-ink"
                  }`}
                >
                  {tab.label}
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
