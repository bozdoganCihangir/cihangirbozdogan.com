"use client";

import { useState } from "react";
import type { TrendingItem as TrendingItemType } from "@/lib/types";

export function TrendingItem({ item }: { item: TrendingItemType }) {
  const [open, setOpen] = useState(false);
  const hasParagraph = !!item.paragraph?.trim();

  return (
    <li className="border-b border-rule-soft last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left py-3 px-1 hover:bg-paper-subtle transition-colors flex items-start gap-3 group cursor-pointer"
      >
        <span className="text-ink-faint tabular-nums text-[11px] pt-1 shrink-0 w-5 font-medium">
          {String(item.rank).padStart(2, "0")}
        </span>
        <span className="flex-1 min-w-0">
          <span className="flex items-baseline justify-between gap-3">
            <span className="font-serif font-semibold text-[15px] leading-tight text-ink group-hover:text-accent transition-colors truncate">
              {item.name}
            </span>
            <span className="text-[10px] tabular-nums uppercase tracking-wider text-accent font-semibold shrink-0">
              {item.signal}
            </span>
          </span>
          {item.subcategory && (
            <span className="block mt-0.5 text-[10px] uppercase tracking-[0.18em] text-ink-faint">
              {item.subcategory}
            </span>
          )}
          <span className="block mt-1 text-[12.5px] text-ink-muted leading-snug line-clamp-2">
            {item.one_liner}
          </span>
        </span>
      </button>

      {hasParagraph && (
        <div
          className={`grid transition-[grid-template-rows] duration-200 ease-out ${
            open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
          }`}
        >
          <div className="overflow-hidden">
            <div className="pb-4 pl-9 pr-2 space-y-3">
              <p className="font-serif text-[14px] text-ink leading-[1.6] whitespace-pre-wrap">
                {item.paragraph}
              </p>
              <a
                href={item.url}
                target="_blank"
                rel="noreferrer noopener"
                className="inline-block text-[10px] uppercase tracking-[0.18em] text-accent hover:text-accent-hover font-semibold"
              >
                open →
              </a>
            </div>
          </div>
        </div>
      )}
    </li>
  );
}
