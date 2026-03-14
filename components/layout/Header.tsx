"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Github, Menu, Plus, Search, X } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";
import SearchDialog from "@/components/ui/SearchDialog";

export default function Header() {
  const { t } = useI18n();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);

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

  // Close mobile menu on resize to desktop
  useEffect(() => {
    function handleResize() {
      if (window.innerWidth >= 640) setMenuOpen(false);
    }
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <>
      <header className="sticky top-0 z-50 border-b border-border bg-surface">
        <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3 sm:px-8">
          <Link href="/" className="flex items-center gap-2.5 transition-opacity hover:opacity-80">
            <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
            <span className="font-display text-lg font-semibold tracking-tight">
              {t.header.brand}
            </span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden items-center gap-5 sm:flex">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex cursor-pointer items-center gap-2 rounded-full border border-border bg-background px-4 py-1.5 text-sm text-muted transition-colors hover:border-border-hover hover:text-foreground"
            >
              <Search className="h-3.5 w-3.5" />
              <span>{t.search.openSearch}</span>
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

          {/* Mobile: search + locale + burger */}
          <div className="flex items-center gap-3 sm:hidden">
            <button
              onClick={() => setSearchOpen(true)}
              className="flex cursor-pointer items-center justify-center rounded-full border border-border bg-background p-2 text-muted transition-colors hover:border-border-hover hover:text-foreground"
              aria-label="Search"
            >
              <Search className="h-4 w-4" />
            </button>
            <LocaleSwitcher />
            <button
              onClick={() => setMenuOpen((prev) => !prev)}
              className="flex cursor-pointer items-center justify-center rounded-lg p-1.5 text-muted transition-colors hover:text-foreground"
              aria-label="Toggle menu"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Mobile dropdown menu */}
        {menuOpen && (
          <div className="border-t border-border bg-surface px-5 pb-4 pt-3 sm:hidden">
            <div className="flex flex-col gap-3">
              <Link
                href="/#games"
                onClick={() => setMenuOpen(false)}
                className="text-sm font-medium text-muted transition-colors hover:text-accent"
              >
                {t.header.games}
              </Link>
              <a
                href="https://github.com/dinhanhthi/help-me-play/blob/main/CONTRIBUTING.md"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-accent transition-colors hover:text-accent"
              >
                <Plus className="h-3.5 w-3.5" />
                {t.header.addGames}
              </a>
              <a
                href="https://github.com/dinhanhthi/help-me-play"
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setMenuOpen(false)}
                className="inline-flex items-center gap-1.5 text-sm font-medium text-muted transition-colors hover:text-accent"
              >
                <Github className="h-4 w-4" />
                GitHub
              </a>
            </div>
          </div>
        )}
      </header>
      {searchOpen && <SearchDialog onClose={() => setSearchOpen(false)} />}
    </>
  );
}
