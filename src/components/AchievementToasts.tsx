"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useAchievements } from "@/lib/achievements-context";
import { ACHIEVEMENTS } from "@/lib/achievements";
import { TrophyIcon } from "./icons";

export default function AchievementToasts() {
  const { toasts } = useAchievements();

  return (
    <div className="pointer-events-none fixed top-16 left-1/2 z-[95] flex -translate-x-1/2 flex-col items-center gap-2 px-4">
      <AnimatePresence>
        {toasts.map((t) => {
          const meta = ACHIEVEMENTS[t.id];
          return (
            <motion.div
              key={t.key}
              initial={{ opacity: 0, y: -16, scale: 0.92 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -16, scale: 0.92 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="hextech-border gold-glow flex items-center gap-3 bg-[#010a13]/95 px-4 py-2.5 backdrop-blur-sm"
            >
              <TrophyIcon className="h-6 w-6 shrink-0 text-gold-bright" />
              <div>
                <p className="font-heading text-[9px] uppercase tracking-[0.25em] text-gold">
                  Achievement Unlocked
                </p>
                <p className="font-heading text-sm text-gold-bright text-glow-gold">
                  {meta.title}
                </p>
                <p className="text-[11px] text-parchment/60">
                  {meta.description}
                </p>
              </div>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
  );
}
