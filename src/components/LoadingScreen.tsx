"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";

const STEPS = [
  "Connecting to the Rift...",
  "Forging hextech core...",
  "Loading ability kit...",
  "Compiling quest log...",
  "Champion ready.",
];

const DURATION_MS = 1800;

export default function LoadingScreen({ onDone }: { onDone: () => void }) {
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    const start = performance.now();
    let raf = 0;

    const tick = (now: number) => {
      const elapsed = now - start;
      const pct = Math.min(100, Math.round((elapsed / DURATION_MS) * 100));
      setProgress(pct);
      if (pct < 100) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(onDone, 350);
      }
    };

    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [onDone]);

  const stepIndex = Math.min(
    STEPS.length - 1,
    Math.floor((progress / 100) * STEPS.length)
  );

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.5, ease: "easeInOut" }}
      className="fixed inset-0 z-[100] flex flex-col items-center justify-center gap-6 bg-void px-6"
    >
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.5 }}
        className="relative h-20 w-20"
      >
        <div
          className="ring-spin absolute inset-0 rounded-full"
          style={{
            background:
              "conic-gradient(from 0deg, transparent 0%, var(--color-gold) 20%, transparent 35%, transparent 65%, var(--color-hextech-blue) 80%, transparent 100%)",
            WebkitMask:
              "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
            mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
          }}
        />
        <div className="absolute inset-2 flex items-center justify-center rounded-full border border-gold-dim/50 bg-navy/60">
          <span className="font-heading text-sm font-bold text-gold-bright">
            {progress}%
          </span>
        </div>
      </motion.div>

      <h1 className="font-heading text-sm uppercase tracking-[0.35em] text-gold-bright text-glow-gold sm:text-base">
        Initializing Champion...
      </h1>

      <div className="h-1.5 w-56 overflow-hidden rounded-sm border border-gold-dim/50 bg-black/60 sm:w-72">
        <div
          className="h-full bg-gradient-to-r from-gold-dim via-gold to-hextech-blue transition-[width] duration-150 ease-linear"
          style={{ width: `${progress}%` }}
        />
      </div>

      <p className="font-mono text-[11px] text-parchment/50">
        {STEPS[stepIndex]}
      </p>
    </motion.div>
  );
}
