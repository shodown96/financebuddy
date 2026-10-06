"use client";

import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import type { GlossaryEntry } from "@/lib/constants/technical-glossary";

const POPUP_WIDTH = 288;
const GUTTER = 16;
const GAP = 6;

export default function InfoTip({ entry }: { entry: GlossaryEntry }) {
  const [open, setOpen] = useState(false);
  const wrapperRef = useRef<HTMLSpanElement>(null);
  const popupRef = useRef<HTMLSpanElement>(null);
  // Side is chosen once on open so the popup doesn't flip while scrolling
  const sideRef = useRef<"above" | "below" | null>(null);
  const id = useId();

  // Fixed positioning so scroll containers (like the comparison table) can't clip it.
  // Opens below the icon, or above when there is more room there. Written straight
  // to the DOM because it depends on measuring the rendered popup.
  const place = useCallback(() => {
    const anchor = wrapperRef.current?.getBoundingClientRect();
    const popup = popupRef.current;
    if (!anchor || !popup) return;

    const width = Math.min(POPUP_WIDTH, window.innerWidth - GUTTER * 2);
    const left = Math.max(GUTTER, Math.min(anchor.left, window.innerWidth - GUTTER - width));
    // Width first, so the measured height matches the final layout
    popup.style.width = `${width}px`;
    const spaceBelow = window.innerHeight - anchor.bottom - GAP - GUTTER;
    const spaceAbove = anchor.top - GAP - GUTTER;
    sideRef.current ??= popup.scrollHeight > spaceBelow && spaceAbove > spaceBelow ? "above" : "below";
    const above = sideRef.current === "above";

    Object.assign(popup.style, {
      left: `${left}px`,
      maxHeight: `${above ? spaceAbove : spaceBelow}px`,
      top: above ? "" : `${anchor.bottom + GAP}px`,
      bottom: above ? `${window.innerHeight - anchor.top + GAP}px` : "",
    });
  }, []);

  useLayoutEffect(() => {
    if (!open) return;
    sideRef.current = null;
    place();
  }, [open, place]);

  useEffect(() => {
    if (!open) return;
    const onPointer = (e: MouseEvent) => {
      if (!wrapperRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("mousedown", onPointer);
    document.addEventListener("keydown", onKey);
    // Follow the icon while scrolling; close once it leaves the screen
    const onScroll = () => {
      const anchor = wrapperRef.current?.getBoundingClientRect();
      if (!anchor || anchor.bottom < 0 || anchor.top > window.innerHeight) setOpen(false);
      else place();
    };
    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", place);
    return () => {
      document.removeEventListener("mousedown", onPointer);
      document.removeEventListener("keydown", onKey);
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", place);
    };
  }, [open, place]);

  return (
    <span ref={wrapperRef} className="relative inline-flex align-middle">
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        aria-label={`What is ${entry.title}?`}
        aria-expanded={open}
        aria-controls={id}
        className="rounded-full p-0.5 text-stone-400 transition hover:text-teal-700 dark:text-stone-500 dark:hover:text-teal-400"
      >
        <Info className="h-3.5 w-3.5" />
      </button>
      {open && (
        <span
          ref={popupRef}
          id={id}
          role="dialog"
          aria-label={entry.title}
          className="fixed z-40 block overflow-y-auto overscroll-contain whitespace-normal wrap-break-word rounded-xl border border-stone-200 bg-white p-3.5 text-left text-xs font-normal normal-case leading-relaxed tracking-normal text-stone-600 shadow-lg dark:border-stone-700 dark:bg-stone-900 dark:text-stone-300"
        >
          <span className="block text-sm font-semibold text-stone-900 dark:text-stone-50">{entry.title}</span>
          <span className="mt-1 block">{entry.what}</span>
          <span className="mt-2 block space-y-1">
            {entry.read.map((r, i) => (
              <span key={i} className="flex gap-1.5">
                <span className="text-teal-600 dark:text-teal-400">•</span>
                <span>{r}</span>
              </span>
            ))}
          </span>
          {entry.tip && (
            <span className="mt-2 block rounded-lg bg-stone-50 p-2 text-stone-500 dark:bg-stone-800 dark:text-stone-400">
              {entry.tip}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
