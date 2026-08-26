"use client";

import { useId, useState } from "react";
import type { NewsItem as NewsItemType } from "@/lib/types";

export function NewsItem({ item, index }: { item: NewsItemType; index: number }) {
  const [open, setOpen] = useState(false);
  const panelId = useId();
  const hasParagraph = !!item.paragraph?.trim();
  const hasDetails = !!item.details?.trim();

  return (
    <li className="border-b border-rule-soft last:border-b-0">
      {/* Heading wraps the trigger (ARIA accordion pattern) so each item is a
          real <h3> for crawlers. Tailwind preflight resets heading styles, so
          this adds semantics without changing the visual design. */}
      <h3>
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-expanded={open}
          aria-controls={panelId}
          className="w-full text-left py-5 hover:bg-paper-subtle transition-colors flex gap-5 items-start group cursor-pointer px-1"
        >
          <span
            className="text-ink-faint tabular-nums text-xs pt-1.5 shrink-0 w-7 font-medium"
            aria-hidden
          >
            {String(index + 1).padStart(2, "0")}
          </span>
          <span className="flex-1 min-w-0">
            <span className="block font-serif text-xl sm:text-[1.35rem] leading-snug font-semibold text-ink group-hover:text-accent transition-colors">
              {item.title}
            </span>
            <span className="block mt-1.5 text-[15px] text-ink-muted leading-relaxed">
              {item.summary}
            </span>
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
      </h3>

      {/* Deliberately NOT `inert` when closed: the panel holds the explainer and
          discussion digest, which is the most substantial text on the page and
          must stay in the accessibility tree for crawlers and text extractors.
          The single focusable child is taken out of the tab order instead, so
          keyboard focus never lands in the collapsed region. */}
      <div
        id={panelId}
        className={`grid transition-[grid-template-rows] duration-200 ease-out ${
          open ? "grid-rows-[1fr]" : "grid-rows-[0fr]"
        }`}
      >
        <div className="overflow-hidden">
          <div className="pb-7 pl-12 pr-4 space-y-5">
            {hasParagraph && (
              <p className="font-serif text-[17px] text-ink leading-[1.65] whitespace-pre-wrap">
                {item.paragraph}
              </p>
            )}

            {hasDetails && (
              <div>
                <p className="text-[10px] uppercase tracking-[0.22em] text-accent font-semibold mb-2">
                  What people are saying
                </p>
                <div className="text-[15px] text-ink-muted leading-relaxed whitespace-pre-wrap">
                  {item.details}
                </div>
              </div>
            )}

            <a
              href={item.url}
              target="_blank"
              rel="noreferrer noopener"
              tabIndex={open ? undefined : -1}
              className="inline-block text-xs uppercase tracking-[0.18em] text-accent hover:text-accent-hover font-semibold"
            >
              read source →
            </a>
          </div>
        </div>
      </div>
    </li>
  );
}
