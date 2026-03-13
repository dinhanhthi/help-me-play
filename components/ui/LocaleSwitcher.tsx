"use client";

import { useState, useRef, useEffect } from "react";
import { useI18n } from "@/lib/i18n/context";
import { locales, localeLabels, type Locale } from "@/lib/i18n";

export default function LocaleSwitcher() {
  const { locale, setLocale } = useI18n();
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, []);

  useEffect(() => {
    function handleKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    if (open) {
      document.addEventListener("keydown", handleKey);
      return () => document.removeEventListener("keydown", handleKey);
    }
  }, [open]);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen((prev) => !prev)}
        className="cursor-pointer flex items-center gap-1.5 rounded-lg px-2.5 py-1.5 text-sm font-medium text-muted transition-colors hover:text-accent focus:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        aria-haspopup="listbox"
        aria-expanded={open}
        aria-label="Select language"
      >
        {localeLabels[locale]}
        <svg className={`h-3.5 w-3.5 transition-transform duration-200 ${open ? "rotate-180" : ""}`} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>

      {open && (
        <ul
          role="listbox"
          aria-label="Select language"
          className="absolute right-0 z-50 mt-1.5 min-w-[130px] overflow-hidden rounded-xl border border-border bg-card p-1"
        >
          {locales.map((loc: Locale) => {
            const isActive = locale === loc;
            return (
              <li key={loc} role="option" aria-selected={isActive}>
                <button
                  onClick={() => {
                    setLocale(loc);
                    setOpen(false);
                  }}
                  className={`cursor-pointer flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm transition-colors ${
                    isActive
                      ? "font-semibold text-accent"
                      : "text-muted hover:bg-surface hover:text-foreground"
                  }`}
                >
                  {isActive && (
                    <svg className="h-3.5 w-3.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                  )}
                  {!isActive && <span className="w-3.5" />}
                  {localeLabels[loc]}
                </button>
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
