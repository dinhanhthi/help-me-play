"use client";

import { useCallback, useEffect, useRef, type KeyboardEvent, type ReactNode } from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  children: ReactNode;
}

export default function Tabs({ tabs, activeTab, onChange, children }: TabsProps) {
  const tablistRef = useRef<HTMLDivElement>(null);
  const activeIndex = tabs.findIndex((t) => t.id === activeTab);

  useEffect(() => {
    const activeButton = tablistRef.current?.querySelector<HTMLButtonElement>(
      `#tab-${CSS.escape(activeTab)}`,
    );
    activeButton?.focus();
  }, [activeTab]);

  const handleKeyDown = useCallback(
    (e: KeyboardEvent<HTMLButtonElement>) => {
      const currentIndex = tabs.findIndex((t) => t.id === activeTab);
      let nextIndex = currentIndex;

      if (e.key === "ArrowRight") {
        e.preventDefault();
        nextIndex = (currentIndex + 1) % tabs.length;
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        nextIndex = (currentIndex - 1 + tabs.length) % tabs.length;
      } else if (e.key === "Home") {
        e.preventDefault();
        nextIndex = 0;
      } else if (e.key === "End") {
        e.preventDefault();
        nextIndex = tabs.length - 1;
      }

      if (nextIndex !== currentIndex) {
        onChange(tabs[nextIndex].id);
      }
    },
    [tabs, activeTab, onChange],
  );

  return (
    <div>
      <div
        ref={tablistRef}
        role="tablist"
        aria-label="Tabs"
        className="relative inline-flex rounded-full bg-card p-1 border border-border"
      >
        {/* Sliding pill indicator */}
        <div
          className="absolute top-1 bottom-1 rounded-full bg-accent transition-all duration-300 ease-in-out"
          style={{
            width: `calc(${100 / tabs.length}% - 12px)`,
            left: `calc(${(activeIndex * 100) / tabs.length}% + 6px)`,
          }}
        />

        {tabs.map((tab) => {
          const isActive = tab.id === activeTab;
          return (
            <button
              key={tab.id}
              role="tab"
              id={`tab-${tab.id}`}
              aria-selected={isActive}
              aria-controls={`tabpanel-${tab.id}`}
              tabIndex={isActive ? 0 : -1}
              onClick={() => onChange(tab.id)}
              onKeyDown={handleKeyDown}
              className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
                isActive ? "text-white" : "text-muted hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          );
        })}
      </div>
      <div
        role="tabpanel"
        id={`tabpanel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="pt-6"
      >
        {children}
      </div>
    </div>
  );
}
