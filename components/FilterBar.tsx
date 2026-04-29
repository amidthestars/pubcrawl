"use client";

import { useEffect, useRef, useState } from "react";

const TAGS = [
  "clinical trial",
  "case report",
  "randomized controlled trial",
  "observational",
  "multicenter",
];

type Filters = { unreadOnly: boolean; tags: Set<string> };

export default function FilterBar({ filters, onChange }: { filters: Filters; onChange: (f: Filters) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  function toggleTag(tag: string) {
    const next = new Set(filters.tags);
    next.has(tag) ? next.delete(tag) : next.add(tag);
    onChange({ ...filters, tags: next });
  }

  const hasFilters = filters.unreadOnly || filters.tags.size > 0;
  const activeCount = (filters.unreadOnly ? 1 : 0) + filters.tags.size;

  return (
    <div className="relative mb-6" ref={ref}>
      <div className="flex items-center gap-2">
        <button
          onClick={() => setOpen((o) => !o)}
          className={`text-xs px-3 py-1 rounded-full border transition-colors ${
            open || hasFilters
              ? "border-neutral-500 text-white"
              : "border-neutral-700 text-neutral-400 hover:border-neutral-500"
          }`}
        >
          Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        </button>
        {hasFilters && (
          <button
            onClick={() => onChange({ unreadOnly: false, tags: new Set() })}
            className="text-xs text-neutral-500 hover:text-white transition-colors"
          >
            clear
          </button>
        )}
      </div>

      {open && (
        <div className="absolute top-8 left-0 z-10 bg-neutral-900 border border-neutral-700 rounded-xl p-3 flex flex-col gap-2 min-w-48">
          <button
            onClick={() => onChange({ ...filters, unreadOnly: !filters.unreadOnly })}
            className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-colors ${
              filters.unreadOnly
                ? "bg-white text-black border-white"
                : "text-neutral-400 border-neutral-700 hover:border-neutral-500"
            }`}
          >
            unread only
          </button>
          <div className="border-t border-neutral-800 my-1" />
          {TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => toggleTag(tag)}
              className={`text-xs px-3 py-1.5 rounded-lg border text-left transition-colors ${
                filters.tags.has(tag)
                  ? "bg-violet-500 text-white border-violet-500"
                  : "text-neutral-400 border-neutral-700 hover:border-neutral-500"
              }`}
            >
              {tag}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
