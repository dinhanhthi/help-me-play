"use client";

import Link from "next/link";
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
          <LocaleSwitcher />
        </div>
      </nav>
    </header>
  );
}
