"use client";

import { useState } from "react";
import type { NewsItem as NewsItemType } from "@/lib/types";

export function NewsItem({ item, index }: { item: NewsItemType; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-b border-rule-soft last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left py-5 hover:bg-paper-subtle transition-colors flex gap-5 items-start group cursor-pointer px-1"
      >
        <span className="text-ink-faint tabular-nums text-xs pt-1.5 shrink-0 w-7 font-medium">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-serif text-xl sm:text-[1.35rem] leading-snug font-semibold text-ink group-hover:text-accent transition-colors">
            {item.title}
          </span>
          <span className="block mt-1.5 text-[15px] text-ink-muted leading-relaxed">
            {item.summary}
          </span>
          {item.source_meta && (
            <span className="block mt-2 text-xs text-ink-faint tabular-nums uppercase tracking-wider">
              {item.source_meta}
            </span>
          )}
        </span>
        <span
          className={`text-ink-faint text-xs pt-2 shrink-0 transition-transform ${
            open ? "rotate-90" : ""
          }`}
          aria-hidden
        >
          ▶
        </span>
      </button>

      <div
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-6 pl-12 pr-4">
            <div className="text-[15px] text-ink leading-relaxed whitespace-pre-wrap font-serif">
              {item.details}
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block mt-4 text-xs uppercase tracking-[0.18em] text-accent hover:text-accent-hover font-semibold"
            >
              read source →
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}
