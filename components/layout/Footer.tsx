"use client";

import { useI18n } from "@/lib/i18n/context";

export default function Footer() {
  const { t } = useI18n();

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto max-w-6xl px-5 py-6 sm:px-8">
        <p className="text-center text-sm text-muted">
          &copy; {new Date().getFullYear()} {t.footer.copyright}
        </p>
      </div>
    </footer>
  );
}
