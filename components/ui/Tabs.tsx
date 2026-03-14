"use client";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
  type KeyboardEvent,
  type ReactNode,
} from "react";

interface Tab {
  id: string;
  label: string;
}

interface TabsBaseProps {
  tabs: Tab[];
  activeTab: string;
  onChange: (id: string) => void;
  "aria-label"?: string;
}

interface TabsWithPanel extends TabsBaseProps {
  children: ReactNode;
}

interface TabsToggle extends TabsBaseProps {
  children?: never;
}

type TabsProps = TabsWithPanel | TabsToggle;

export default function Tabs({ tabs, activeTab, onChange, children, ...rest }: TabsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRefs = useRef<Map<string, HTMLButtonElement>>(new Map());
  const [pill, setPill] = useState({ width: 0, left: 0 });

  const isToggle = !children;

  const updatePill = useCallback(() => {
    const el = buttonRefs.current.get(activeTab);
    if (el) {
      setPill({ width: el.offsetWidth, left: el.offsetLeft });
    }
  }, [activeTab]);

  useEffect(() => {
    updatePill();
  }, [updatePill]);

  useEffect(() => {
    if (!isToggle) {
      const activeButton = containerRef.current?.querySelector<HTMLButtonElement>(
        `#tab-${CSS.escape(activeTab)}`,
      );
      activeButton?.focus();
    }
  }, [activeTab, isToggle]);

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

  const pillBar = (
    <div
      ref={containerRef}
      role={isToggle ? "radiogroup" : "tablist"}
      aria-label={rest["aria-label"] ?? "Tabs"}
      className="relative inline-flex rounded-full bg-card p-1 border border-border"
    >
      {/* Sliding pill indicator */}
      <div
        className="absolute top-1 bottom-1 rounded-full bg-accent transition-all duration-300 ease-in-out"
        style={{ width: pill.width, left: pill.left }}
      />

      {tabs.map((tab) => {
        const isActive = tab.id === activeTab;
        return (
          <button
            key={tab.id}
            ref={(el) => {
              if (el) buttonRefs.current.set(tab.id, el);
            }}
            role={isToggle ? "radio" : "tab"}
            id={isToggle ? undefined : `tab-${tab.id}`}
            aria-selected={isToggle ? undefined : isActive}
            aria-checked={isToggle ? isActive : undefined}
            aria-controls={isToggle ? undefined : `tabpanel-${tab.id}`}
            tabIndex={isToggle ? undefined : isActive ? 0 : -1}
            onClick={() => onChange(tab.id)}
            onKeyDown={isToggle ? undefined : handleKeyDown}
            className={`relative z-10 cursor-pointer rounded-full px-5 py-2 text-sm font-semibold transition-colors duration-300 focus:outline-none focus-visible:ring-2 focus-visible:ring-accent ${
              isActive ? "text-white" : "text-muted hover:text-foreground"
            }`}
          >
            {tab.label}
          </button>
        );
      })}
    </div>
  );

  if (isToggle) return pillBar;

  return (
    <div>
      {pillBar}
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
