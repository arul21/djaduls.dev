"use client";

import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useSound } from "@/lib/sound-context";
import { useAchievements } from "@/lib/achievements-context";

const SEQUENCE = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
];

const VISIBLE_MS = 3600;
const FRAME_W = 340;
const FRAME_H = Math.round((FRAME_W * 287) / 440);

export default function KonamiEasterEgg() {
  const [active, setActive] = useState(false);
  const progressRef = useRef(0);
  const { playFanfare } = useSound();
  const { unlock } = useAchievements();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const expected = SEQUENCE[progressRef.current];
      const key = e.key.length === 1 ? e.key.toLowerCase() : e.key;

      if (key === expected) {
        progressRef.current += 1;
        if (progressRef.current === SEQUENCE.length) {
          progressRef.current = 0;
          playFanfare();
          unlock("konami-master");
          setActive(true);
          setTimeout(() => setActive(false), VISIBLE_MS);
        }
      } else {
        progressRef.current = key === SEQUENCE[0] ? 1 : 0;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [playFanfare, unlock]);

  return (
    <AnimatePresence>
      {active && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.4 }}
          className='pointer-events-none fixed inset-0 z-[110] flex items-center justify-center bg-void/85 px-6'
        >
          <motion.div
            initial={{ scale: 0.7, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0 }}
            transition={{ type: "spring", stiffness: 220, damping: 18 }}
            className='flex flex-col items-center'
          >
            <div
              className='relative'
              style={{ width: FRAME_W + 100, height: FRAME_H + 100 }}
            >
              {/* Ornamental blue wing frame, behind the portrait roundel */}
              <Image
                src='/images/pentakill.png'
                alt=''
                fill
                sizes={`${FRAME_W}px`}
                className='pointer-events-none object-contain'
                priority
              />

              {/* Yasuo portrait with a solid gold ring, masking the frame's own glow orb */}
              <div
                className='absolute -translate-x-1/2 -translate-y-1/2 overflow-hidden rounded-full border-[3px] border-gold bg-navy'
                style={{
                  left: "50.4%",
                  top: FRAME_H * 0.36,
                  width: FRAME_W * 0.25,
                  height: FRAME_W * 0.25,
                  boxShadow:
                    "0 0 14px rgba(200,155,60,0.7), 0 0 0 1px rgba(200,155,60,0.4)",
                }}
              >
                <Image
                  src='/images/yasuo.jpeg'
                  alt='Pentakill'
                  fill
                  sizes='140px'
                  className='object-cover'
                />
              </div>

              {/* Text sits in the empty band baked into the artwork, between the
                  ring ornament above and the wing/shield ornament below. */}
              <motion.h2
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{
                  delay: 0.15,
                  type: "spring",
                  stiffness: 260,
                  damping: 14,
                }}
                className='absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap font-heading text-4xl font-bold uppercase tracking-[0.3em] sm:text-5xl'
                style={{
                  left: "50%",
                  top: 158,
                  backgroundImage:
                    "linear-gradient(180deg, #f7ecd2 0%, #c89b3c 55%, #8a6a2c 100%)",
                  WebkitBackgroundClip: "text",
                  backgroundClip: "text",
                  color: "transparent",
                  filter: "drop-shadow(0 2px 2px rgba(0,0,0,0.6))",
                }}
              >
                Pentakill!
              </motion.h2>
            </div>

            <motion.p
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              className='mt-2 text-center font-heading text-[10px] uppercase tracking-[0.3em] text-hextech-blue text-glow-blue sm:text-xs'
            >
              Achievement Unlocked · Konami Master
            </motion.p>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
