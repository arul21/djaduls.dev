"use client";

import { motion } from "framer-motion";
import { useSound } from "@/lib/sound-context";

export type TabKey =
  | "stats"
  | "abilities"
  | "quests"
  | "history"
  | "techstack";

export const TABS: { key: TabKey; label: string; rune: string; hotkey: string }[] = [
  { key: "stats", label: "Stats", rune: "◆", hotkey: "1" },
  { key: "abilities", label: "Abilities", rune: "✦", hotkey: "2" },
  { key: "quests", label: "Quests", rune: "⚔", hotkey: "3" },
  { key: "history", label: "History", rune: "⏳", hotkey: "4" },
  { key: "techstack", label: "Stack", rune: "⬡", hotkey: "5" },
];

export default function TabNav({
  active,
  onChange,
}: {
  active: TabKey;
  onChange: (tab: TabKey) => void;
}) {
  const { playClick } = useSound();

  return (
    <nav className="pointer-events-auto sticky top-0 z-20 mx-auto flex w-full max-w-2xl justify-center gap-1 border-y border-gold-dim/40 bg-[#010a13]/90 px-2 backdrop-blur-sm sm:gap-2">
      {TABS.map((tab) => {
        const isActive = tab.key === active;
        return (
          <button
            key={tab.key}
            onClick={() => {
              playClick();
              onChange(tab.key);
            }}
            className="relative flex-1 cursor-pointer py-3 text-center outline-none transition-colors focus-visible:ring-2 focus-visible:ring-gold/70 focus-visible:ring-offset-2 focus-visible:ring-offset-void sm:py-4"
          >
            <kbd className="absolute top-1 right-1 hidden rounded-sm border border-gold-dim/40 px-1 font-mono text-[8px] text-parchment/40 sm:top-1.5 sm:right-2 sm:inline-block">
              {tab.hotkey}
            </kbd>
            <span
              className={`relative z-10 flex flex-col items-center gap-1 font-heading text-[10px] uppercase tracking-[0.2em] transition-colors sm:text-xs sm:tracking-[0.3em] ${
                isActive ? "text-gold-bright text-glow-gold" : "text-parchment/50 hover:text-parchment/80"
              }`}
            >
              <span className="text-sm sm:text-base">{tab.rune}</span>
              {tab.label}
            </span>
            {isActive && (
              <motion.div
                layoutId="tab-underline"
                className="absolute inset-x-2 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-gold to-transparent sm:inset-x-4"
                transition={{ type: "spring", stiffness: 400, damping: 32 }}
              />
            )}
          </button>
        );
      })}
    </nav>
  );
}
