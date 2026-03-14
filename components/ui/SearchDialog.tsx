"use client";

import { useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { Search, X, Gamepad2, User, Loader2 } from "lucide-react";
import { useI18n } from "@/lib/i18n/context";

interface SearchResult {
  id: string;
  url: string;
  meta: {
    title?: string;
    description?: string;
    image?: string;
    type?: string;
    game?: string;
    tags?: string;
  };
  excerpt: string;
}

interface PagefindResult {
  id: string;
  data: () => Promise<{
    url: string;
    meta: Record<string, string>;
    excerpt: string;
  }>;
}

interface PagefindInstance {
  search: (
    query: string,
    options?: { filters?: Record<string, string[]> },
  ) => Promise<{ results: PagefindResult[] }>;
  destroy?: () => void;
}

let pagefindInstance: PagefindInstance | null = null;

async function getPagefind(): Promise<PagefindInstance | null> {
  if (pagefindInstance) return pagefindInstance;
  try {
    // @ts-expect-error — Pagefind is loaded at runtime from the static build
    pagefindInstance = await import(/* webpackIgnore: true */ "/pagefind/pagefind.js");
    return pagefindInstance;
  } catch {
    return null;
  }
}

interface SearchDialogProps {
  onClose: () => void;
}

/**
 * Search dialog — rendered only when open (parent controls mount/unmount).
 * State resets automatically on mount.
 */
export default function SearchDialog({ onClose }: SearchDialogProps) {
  const { t } = useI18n();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const debounceRef = useRef<ReturnType<typeof setTimeout>>(null);

  // Focus input on mount
  useEffect(() => {
    const timer = setTimeout(() => inputRef.current?.focus(), 50);
    return () => clearTimeout(timer);
  }, []);

  // Lock body scroll
  useEffect(() => {
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = "";
    };
  }, []);

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  // Handle query change — debounce search in event handler
  const handleQueryChange = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!value.trim()) {
      setResults([]);
      setLoading(false);
      return;
    }

    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      const pagefind = await getPagefind();
      if (!pagefind) {
        setLoading(false);
        return;
      }

      const search = await pagefind.search(value);
      const loaded = await Promise.all(
        search.results.slice(0, 10).map(async (r) => {
          const data = await r.data();
          return {
            id: r.id,
            url: data.url,
            meta: data.meta,
            excerpt: data.excerpt,
          };
        }),
      );
      setResults(loaded);
      setSelectedIndex(0);
      setLoading(false);
    }, 200);
  }, []);

  const navigate = useCallback(
    (url: string) => {
      onClose();
      router.push(url);
    },
    [onClose, router],
  );

  // Keyboard navigation
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      switch (e.key) {
        case "ArrowDown":
          e.preventDefault();
          setSelectedIndex((i) => Math.min(i + 1, results.length - 1));
          break;
        case "ArrowUp":
          e.preventDefault();
          setSelectedIndex((i) => Math.max(i - 1, 0));
          break;
        case "Enter":
          e.preventDefault();
          if (results[selectedIndex]) {
            navigate(results[selectedIndex].url);
          }
          break;
        case "Escape":
          e.preventDefault();
          onClose();
          break;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [results, selectedIndex, navigate, onClose]);

  const typeIcon = (type?: string) => {
    switch (type) {
      case "game":
        return <Gamepad2 className="h-4 w-4 shrink-0 text-accent" />;
      case "character":
        return <User className="h-4 w-4 shrink-0 text-purple-400" />;
      default:
        return <Search className="h-4 w-4 shrink-0 text-muted" />;
    }
  };

  const typeLabel = (type?: string) => {
    switch (type) {
      case "game":
        return t.search.game;
      case "character":
        return t.search.character;
      default:
        return "";
    }
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[15vh]">
      {/* Backdrop */}
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />

      {/* Dialog */}
      <div className="relative mx-4 w-full max-w-lg overflow-hidden rounded-2xl border border-border bg-surface shadow-2xl">
        {/* Search input */}
        <div className="flex items-center gap-3 border-b border-border px-4 py-3">
          <Search className="h-5 w-5 shrink-0 text-muted" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => handleQueryChange(e.target.value)}
            placeholder={t.search.placeholder}
            className="flex-1 bg-transparent text-sm text-foreground outline-none placeholder:text-muted"
          />
          {loading && <Loader2 className="h-4 w-4 shrink-0 animate-spin text-muted" />}
          <button
            onClick={onClose}
            className="shrink-0 rounded-lg p-1 text-muted transition-colors hover:bg-card hover:text-foreground"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Results */}
        <div className="max-h-[50vh] overflow-y-auto">
          {query.trim() && !loading && results.length === 0 && (
            <div className="px-4 py-8 text-center text-sm text-muted">{t.search.noResults}</div>
          )}

          {results.length > 0 && (
            <ul className="py-2">
              {results.map((result, i) => (
                <li key={result.id}>
                  <button
                    onClick={() => navigate(result.url)}
                    onMouseEnter={() => setSelectedIndex(i)}
                    className={`flex w-full cursor-pointer items-start gap-3 px-4 py-3 text-left transition-colors ${
                      i === selectedIndex ? "bg-card" : "hover:bg-card/50"
                    }`}
                  >
                    <div className="mt-0.5">{typeIcon(result.meta.type)}</div>
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2">
                        <span className="truncate text-sm font-medium text-foreground">
                          {result.meta.title}
                        </span>
                        {result.meta.type && (
                          <span className="shrink-0 rounded-md border border-border bg-background px-1.5 py-0.5 text-[10px] font-semibold uppercase text-muted">
                            {typeLabel(result.meta.type)}
                          </span>
                        )}
                      </div>
                      {result.meta.game && (
                        <p className="mt-0.5 truncate text-xs text-accent">{result.meta.game}</p>
                      )}
                      {result.meta.description && (
                        <p className="mt-0.5 line-clamp-2 text-xs text-muted leading-relaxed">
                          {result.meta.description}
                        </p>
                      )}
                      {result.meta.tags && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {result.meta.tags.split(", ").map((tag) => (
                            <span
                              key={tag}
                              className="rounded-md bg-accent-subtle px-1.5 py-0.5 text-[10px] text-accent"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Footer hints */}
        <div className="flex items-center gap-4 border-t border-border px-4 py-2">
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              ↑↓
            </kbd>
            <span>navigate</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              ↵
            </kbd>
            <span>open</span>
          </div>
          <div className="flex items-center gap-1.5 text-[11px] text-muted">
            <kbd className="rounded border border-border bg-background px-1.5 py-0.5 font-mono text-[10px]">
              esc
            </kbd>
            <span>{t.search.close.toLowerCase()}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
