"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

export default function CustomCursor() {
  const [enabled, setEnabled] = useState(false);
  const [visible, setVisible] = useState(false);

  const mx = useMotionValue(-100);
  const my = useMotionValue(-100);

  const tip = { stiffness: 900, damping: 45, mass: 0.2 };
  const mid = { stiffness: 300, damping: 32, mass: 0.5 };
  const tail = { stiffness: 140, damping: 26, mass: 0.7 };

  const tipX = useSpring(mx, tip);
  const tipY = useSpring(my, tip);
  const midX = useSpring(mx, mid);
  const midY = useSpring(my, mid);
  const tailX = useSpring(mx, tail);
  const tailY = useSpring(my, tail);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a browser-only API unavailable during SSR
    setEnabled(fine);
    if (!fine) return;

    document.documentElement.classList.add("custom-cursor-active");

    const handleMove = (e: MouseEvent) => {
      mx.set(e.clientX);
      my.set(e.clientY);
      setVisible(true);
    };
    const handleLeave = () => setVisible(false);

    window.addEventListener("mousemove", handleMove);
    document.documentElement.addEventListener("mouseleave", handleLeave);

    return () => {
      document.documentElement.classList.remove("custom-cursor-active");
      window.removeEventListener("mousemove", handleMove);
      document.documentElement.removeEventListener("mouseleave", handleLeave);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!enabled) return null;

  return (
    <div
      className="pointer-events-none fixed inset-0 z-[90] transition-opacity duration-200"
      style={{ opacity: visible ? 1 : 0 }}
    >
      <motion.div className="absolute top-0 left-0" style={{ x: tailX, y: tailY }}>
        <div className="h-2 w-2 -translate-x-1/2 -translate-y-1/2 rounded-full bg-hextech-blue/60 blur-[1px]" />
      </motion.div>
      <motion.div className="absolute top-0 left-0" style={{ x: midX, y: midY }}>
        <div className="h-2.5 w-2.5 -translate-x-1/2 -translate-y-1/2 rounded-full bg-gold/60 blur-[0.5px]" />
      </motion.div>
      <motion.div className="absolute top-0 left-0" style={{ x: tipX, y: tipY }}>
        <svg
          width="22"
          height="22"
          viewBox="0 0 24 24"
          fill="none"
          className="-translate-x-1/2 -translate-y-1/2"
        >
          <path
            d="M12 1v6.5M12 16.5V23M1 12h6.5M16.5 12H23"
            stroke="#c89b3c"
            strokeWidth="1.6"
            strokeLinecap="round"
          />
          <circle cx="12" cy="12" r="2.5" fill="#c89b3c" />
          <circle
            cx="12"
            cy="12"
            r="6.5"
            stroke="#c89b3c"
            strokeOpacity="0.5"
            strokeWidth="1"
          />
        </svg>
      </motion.div>
    </div>
  );
}
