"use client";

import { useState } from "react";
import type { NewsItem as NewsItemType } from "@/lib/types";

export function NewsItem({ item, index }: { item: NewsItemType; index: number }) {
  const [open, setOpen] = useState(false);

  return (
    <li className="border-b border-neutral-800 last:border-b-0">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-expanded={open}
        className="w-full text-left py-4 px-4 sm:px-5 hover:bg-neutral-900/60 transition-colors flex gap-4 items-start group cursor-pointer"
      >
        <span className="text-neutral-500 tabular-nums text-sm pt-0.5 shrink-0 w-6">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block text-base sm:text-[15px] font-medium text-neutral-100 group-hover:text-white">
            {item.title}
          </span>
          <span className="block mt-1 text-sm text-neutral-400 leading-relaxed">
            {item.summary}
          </span>
          {item.source_meta && (
            <span className="block mt-1.5 text-xs text-neutral-500 tabular-nums">
              {item.source_meta}
            </span>
          )}
        </span>
        <span
          className={`text-neutral-500 text-xs pt-1 shrink-0 transition-transform ${
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
          <div className="px-4 sm:px-5 pb-5 pl-14">
            <div className="text-sm text-neutral-300 leading-relaxed whitespace-pre-wrap">
              {item.details}
            </div>
            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              className="inline-block mt-3 text-xs text-blue-400 hover:text-blue-300 underline underline-offset-2"
            >
              open source →
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}
