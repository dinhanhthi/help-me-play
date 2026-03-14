"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Plus, Search } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import SearchDialog from "@/components/ui/SearchDialog";

export default function Header() {
  const { t } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);

  // Global Ctrl+K / Cmd+K shortcut
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setSearchOpen((prev) => !prev);
      }
    }
    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-surface">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="font-display text-lg font-semibold tracking-tight">
              {t.header.brand}
            </span>
          </Link>
          <div className="flex items-center gap-5">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-lg border border-border bg-background px-3 py-1.5 text-sm text-muted transition-colors hover:border-border-hover hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              <span className="hidden sm:inline">{t.search.openSearch}</span>
              <kbd className="hidden rounded border border-border bg-surface px-1.5 py-0.5 font-mono text-[10px] text-muted sm:inline">
                ⌘K
              </kbd>
            </button>
            <Link
              href="/#games"
              className="cursor-pointer text-sm font-medium text-muted transition-colors hover:text-accent"
            >
              {t.header.games}
            </Link>
            <a
              href="https://github.com/dinhanhthi/help-me-play/blob/main/CONTRIBUTING.md"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 rounded-full border border-accent/30 bg-accent-subtle px-3 py-1 text-sm font-medium text-accent transition-all hover:border-accent/60 hover:bg-accent-muted"
            >
              <Plus className="h-3.5 w-3.5" />
              {t.header.addGames}
            </a>
            <a
              href="https://github.com/dinhanhthi/help-me-play"
              target="_blank"
              rel="noopener noreferrer"
              className="text-muted transition-colors hover:text-accent"
              aria-label="GitHub"
            >
              <Github className="h-5 w-5" />
            </a>
            <LocaleSwitcher />
          </div>
        </nav>
      </header>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </>
  );
}
