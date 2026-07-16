"use client";

import { useEffect } from "react";
import { motion, useMotionValue, useSpring } from "framer-motion";

const RUNES = [
  { glyph: "ᛟ", left: "6%", top: "12%", size: 22, duration: 7, delay: 0, color: "text-gold/20" },
  { glyph: "ᛝ", left: "88%", top: "8%", size: 18, duration: 9, delay: 0.6, color: "text-hextech-blue/15" },
  { glyph: "ᚱ", left: "14%", top: "68%", size: 26, duration: 8.5, delay: 1.2, color: "text-gold/15" },
  { glyph: "ᛒ", left: "92%", top: "52%", size: 20, duration: 7.5, delay: 0.3, color: "text-hextech-blue/15" },
  { glyph: "ᚨ", left: "4%", top: "42%", size: 16, duration: 10, delay: 2, color: "text-gold/15" },
  { glyph: "ᛃ", left: "78%", top: "78%", size: 24, duration: 9, delay: 1.6, color: "text-gold/20" },
  { glyph: "ᛞ", left: "50%", top: "5%", size: 16, duration: 8, delay: 0.9, color: "text-hextech-blue/10" },
  { glyph: "ᚦ", left: "35%", top: "88%", size: 20, duration: 7.8, delay: 2.4, color: "text-gold/15" },
];

const HEXES = [
  { left: "22%", top: "22%", size: 14, duration: 9, delay: 0.4 },
  { left: "65%", top: "18%", size: 10, duration: 7, delay: 1.4 },
  { left: "40%", top: "60%", size: 16, duration: 8, delay: 0.2 },
  { left: "82%", top: "35%", size: 12, duration: 10, delay: 1.8 },
  { left: "10%", top: "85%", size: 12, duration: 8.6, delay: 0.8 },
];

// Parallax strength in pixels at the extreme edge of the viewport.
const RUNE_STRENGTH = 22;
const HEX_STRENGTH = 12;

export default function RuneField() {
  const runeMx = useMotionValue(0);
  const runeMy = useMotionValue(0);
  const hexMx = useMotionValue(0);
  const hexMy = useMotionValue(0);

  const spring = { stiffness: 40, damping: 20, mass: 0.6 };
  const runeX = useSpring(runeMx, spring);
  const runeY = useSpring(runeMy, spring);
  const hexX = useSpring(hexMx, spring);
  const hexY = useSpring(hexMy, spring);

  useEffect(() => {
    const fine = window.matchMedia("(pointer: fine)").matches;
    const reduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (!fine || reduced) return;

    const handleMove = (e: MouseEvent) => {
      const nx = e.clientX / window.innerWidth - 0.5;
      const ny = e.clientY / window.innerHeight - 0.5;
      runeMx.set(-nx * RUNE_STRENGTH);
      runeMy.set(-ny * RUNE_STRENGTH);
      hexMx.set(-nx * HEX_STRENGTH);
      hexMy.set(-ny * HEX_STRENGTH);
    };

    window.addEventListener("mousemove", handleMove);
    return () => window.removeEventListener("mousemove", handleMove);
  }, [runeMx, runeMy, hexMx, hexMy]);

  return (
    <div
      aria-hidden
      className="pointer-events-none fixed inset-0 z-0 overflow-hidden"
    >
      <motion.div style={{ x: runeX, y: runeY }} className="absolute inset-0">
        {RUNES.map((r, i) => (
          <span
            key={`rune-${i}`}
            className={`rune-float absolute font-heading select-none ${r.color}`}
            style={{
              left: r.left,
              top: r.top,
              fontSize: r.size,
              animationDuration: `${r.duration}s`,
              animationDelay: `${r.delay}s`,
            }}
          >
            {r.glyph}
          </span>
        ))}
      </motion.div>
      <motion.div style={{ x: hexX, y: hexY }} className="absolute inset-0">
        {HEXES.map((h, i) => (
          <div
            key={`hex-${i}`}
            className="rune-float clip-hex absolute border border-gold-dim/25"
            style={{
              left: h.left,
              top: h.top,
              width: h.size,
              height: h.size,
              animationDuration: `${h.duration}s`,
              animationDelay: `${h.delay}s`,
            }}
          />
        ))}
      </motion.div>
    </div>
  );
}
