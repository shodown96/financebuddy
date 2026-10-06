"use client";

import { useEffect, useId, useRef, useState } from "react";
import { searchSymbols } from "@/actions/technical-analysis";
import type { Market, SymbolMatch } from "@/lib/market-data";

export default function SymbolSearch({
  market,
  value,
  onChange,
  onSelect,
  placeholder,
  className,
}: {
  market: Market;
  value: string;
  onChange: (v: string) => void;
  onSelect: (symbol: string) => void;
  placeholder: string;
  className: string;
}) {
  const [results, setResults] = useState<SymbolMatch[]>([]);
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(-1);
  const [searching, setSearching] = useState(false);
  const requestId = useRef(0);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const listId = useId();

  // Debounced search; stale responses are dropped by comparing request ids
  useEffect(() => {
    if (!open) return;
    const q = value.trim();
    const id = ++requestId.current;
    if (!q) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setResults([]);
      return;
    }
    const timer = setTimeout(async () => {
      setSearching(true);
      const matches = await searchSymbols(market, q).catch(() => []);
      if (id !== requestId.current) return;
      setResults(matches);
      setActive(matches.length ? 0 : -1);
      setSearching(false);
    }, 200);
    return () => clearTimeout(timer);
  }, [value, market, open]);

  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const choose = (m: SymbolMatch) => {
    onChange(m.symbol);
    setOpen(false);
    onSelect(m.symbol);
  };

  const showList = open && value.trim().length > 0;

  return (
    <div ref={wrapperRef} className="relative flex-1">
      <input
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setOpen(true);
        }}
        onFocus={() => setOpen(true)}
        onKeyDown={(e) => {
          if (!showList || results.length === 0) return;
          if (e.key === "ArrowDown") {
            e.preventDefault();
            setActive((i) => (i + 1) % results.length);
          } else if (e.key === "ArrowUp") {
            e.preventDefault();
            setActive((i) => (i - 1 + results.length) % results.length);
          } else if (e.key === "Enter" && active >= 0) {
            e.preventDefault();
            choose(results[active]);
          } else if (e.key === "Escape") {
            setOpen(false);
          }
        }}
        placeholder={placeholder}
        className={className}
        role="combobox"
        aria-expanded={showList}
        aria-controls={listId}
        aria-autocomplete="list"
        aria-activedescendant={active >= 0 ? `${listId}-${active}` : undefined}
        autoComplete="off"
        spellCheck={false}
      />
      {showList && (
        <ul
          id={listId}
          role="listbox"
          className="absolute left-0 right-0 top-full z-30 mt-1 max-h-80 overflow-y-auto rounded-xl border border-stone-200 bg-white py-1 shadow-lg dark:border-stone-700 dark:bg-stone-900"
        >
          {results.length === 0 ? (
            <li className="px-3 py-2 text-sm text-stone-400 dark:text-stone-500">
              {searching ? "Searching…" : "No matches. Press Load to try this ticker anyway."}
            </li>
          ) : (
            results.map((m, i) => (
              <li
                key={m.symbol}
                id={`${listId}-${i}`}
                role="option"
                aria-selected={i === active}
                onMouseDown={(e) => {
                  e.preventDefault();
                  choose(m);
                }}
                onMouseEnter={() => setActive(i)}
                className={`flex cursor-pointer items-baseline gap-3 px-3 py-2 text-sm ${
                  i === active ? "bg-teal-50 dark:bg-teal-900/30" : ""
                }`}
              >
                <span className="w-24 shrink-0 font-semibold text-stone-900 dark:text-stone-50">{m.symbol}</span>
                <span className="truncate text-stone-500 dark:text-stone-400">{m.name}</span>
              </li>
            ))
          )}
        </ul>
      )}
    </div>
  );
}
