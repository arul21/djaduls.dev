"use client";

import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { TABS } from "./TabNav";

export default function ShortcutsOverlay() {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "?") {
        e.preventDefault();
        setOpen((prev) => !prev);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[110] flex items-center justify-center bg-black/70 px-6 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.92, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.92, y: 10 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            onClick={(e) => e.stopPropagation()}
            className="hextech-border gold-glow w-full max-w-xs bg-[#010a13] p-6"
          >
            <h2 className="mb-4 text-center font-heading text-xs uppercase tracking-[0.3em] text-gold-bright text-glow-gold">
              Keyboard Shortcuts
            </h2>
            <ul className="flex flex-col gap-2.5">
              {TABS.map((tab) => (
                <li
                  key={tab.key}
                  className="flex items-center justify-between text-xs text-parchment/70"
                >
                  <span>{tab.label}</span>
                  <kbd className="rounded-sm border border-gold-dim/40 px-2 py-0.5 font-mono text-[10px] text-gold-bright">
                    {tab.hotkey}
                  </kbd>
                </li>
              ))}
              <li className="flex items-center justify-between border-t border-gold-dim/20 pt-2.5 text-xs text-parchment/70">
                <span>Toggle this menu</span>
                <kbd className="rounded-sm border border-gold-dim/40 px-2 py-0.5 font-mono text-[10px] text-gold-bright">
                  ?
                </kbd>
              </li>
            </ul>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
