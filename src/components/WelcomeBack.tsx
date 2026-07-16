"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

const STORAGE_KEY = "djaduls-last-visit";
const DISPLAY_MS = 5000;

function formatSince(deltaMs: number) {
  const days = Math.floor(deltaMs / 86_400_000);
  if (days >= 1) return `${days} day${days === 1 ? "" : "s"} ago`;
  const hours = Math.floor(deltaMs / 3_600_000);
  if (hours >= 1) return `${hours} hour${hours === 1 ? "" : "s"} ago`;
  const minutes = Math.max(1, Math.floor(deltaMs / 60_000));
  return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
}

export default function WelcomeBack() {
  const [message, setMessage] = useState<string | null>(null);
  const hasRecordedRef = useRef(false);

  useEffect(() => {
    // Record-once guard: this reads AND immediately overwrites the same
    // localStorage key, which isn't safe to run twice (e.g. React Strict
    // Mode's intentional double-invoke in dev would otherwise stamp "now"
    // over the previous visit before it's ever read).
    if (hasRecordedRef.current) return;
    hasRecordedRef.current = true;

    const stored = window.localStorage.getItem(STORAGE_KEY);
    const now = Date.now();
    const last = stored ? Number(stored) : NaN;
    if (!Number.isNaN(last)) {
      // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a browser-only API unavailable during SSR
      setMessage(`Welcome back, Summoner — last seen ${formatSince(now - last)}.`);
    }
    window.localStorage.setItem(STORAGE_KEY, String(now));

    const timer = setTimeout(() => setMessage(null), DISPLAY_MS);
    return () => clearTimeout(timer);
  }, []);

  return (
    <AnimatePresence>
      {message && (
        <motion.div
          initial={{ opacity: 0, y: -16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -16 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          className="hextech-border pointer-events-none fixed top-4 left-1/2 z-[90] -translate-x-1/2 bg-[#010a13]/90 px-4 py-2 text-center backdrop-blur-sm"
        >
          <p className="font-heading text-[11px] uppercase tracking-[0.15em] text-gold-bright text-glow-gold">
            {message}
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
