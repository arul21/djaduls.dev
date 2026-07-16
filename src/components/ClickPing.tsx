"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

type Ping = { id: number; x: number; y: number };

export default function ClickPing() {
  const [pings, setPings] = useState<Ping[]>([]);
  const idRef = useRef(0);

  useEffect(() => {
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (reduced) return;

    const handlePointerDown = (e: PointerEvent) => {
      const id = idRef.current++;
      setPings((prev) => [...prev, { id, x: e.clientX, y: e.clientY }]);
      setTimeout(() => {
        setPings((prev) => prev.filter((p) => p.id !== id));
      }, 650);
    };

    window.addEventListener("pointerdown", handlePointerDown);
    return () => window.removeEventListener("pointerdown", handlePointerDown);
  }, []);

  return (
    <div className="pointer-events-none fixed inset-0 z-[85] overflow-hidden">
      <AnimatePresence>
        {pings.map((p) => (
          <motion.div
            key={p.id}
            initial={{ opacity: 0.8, scale: 0.2 }}
            animate={{ opacity: 0, scale: 1.4 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="absolute h-12 w-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-gold"
            style={{
              left: p.x,
              top: p.y,
              boxShadow: "0 0 18px rgba(200, 155, 60, 0.5)",
            }}
          />
        ))}
      </AnimatePresence>
    </div>
  );
}
