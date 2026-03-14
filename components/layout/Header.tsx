"use client";

import Link from "next/link";
import { Github, Plus } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";
import LocaleSwitcher from "@/components/ui/LocaleSwitcher";

export default function Header() {
  const { t } = useI18n();

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 sm:px-8">
        <Link
          href="/"
          className="flex items-center gap-2.5 transition-opacity hover:opacity-80"
        >
          <img src="/logo.svg" alt="Logo" className="h-8 w-8" />
          <span className="font-display text-lg font-semibold tracking-tight">
            {t.header.brand}
          </span>
        </Link>
        <div className="flex items-center gap-5">
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
  );
}
