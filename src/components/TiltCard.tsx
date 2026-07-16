"use client";

import { useRef } from "react";
import {
  motion,
  useMotionValue,
  useSpring,
  useMotionTemplate,
  type HTMLMotionProps,
} from "framer-motion";

type TiltCardProps = HTMLMotionProps<"div"> & {
  children: React.ReactNode;
};

const TILT_SPRING = { stiffness: 220, damping: 20, mass: 0.4 };
const GLOW_SPRING = { stiffness: 200, damping: 24 };
const MAX_TILT_DEG = 10;

export default function TiltCard({
  children,
  className,
  onMouseEnter,
  onMouseLeave,
  ...motionProps
}: TiltCardProps) {
  const ref = useRef<HTMLDivElement>(null);

  const rotX = useMotionValue(0);
  const rotY = useMotionValue(0);
  const shineX = useMotionValue(50);
  const shineY = useMotionValue(50);
  const shineOpacity = useMotionValue(0);

  const rotateX = useSpring(rotX, TILT_SPRING);
  const rotateY = useSpring(rotY, TILT_SPRING);
  const glowOpacity = useSpring(shineOpacity, GLOW_SPRING);
  const shineBackground = useMotionTemplate`radial-gradient(circle at ${shineX}% ${shineY}%, rgba(255,255,255,0.16), transparent 55%)`;

  function handleMouseMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = ref.current?.getBoundingClientRect();
    if (!rect) return;
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    rotY.set((px - 0.5) * MAX_TILT_DEG);
    rotX.set((0.5 - py) * MAX_TILT_DEG);
    shineX.set(px * 100);
    shineY.set(py * 100);
  }

  function handleMouseEnter(e: React.MouseEvent<HTMLDivElement>) {
    shineOpacity.set(1);
    onMouseEnter?.(e);
  }

  function handleMouseLeave(e: React.MouseEvent<HTMLDivElement>) {
    rotX.set(0);
    rotY.set(0);
    shineOpacity.set(0);
    onMouseLeave?.(e);
  }

  return (
    <motion.div
      {...motionProps}
      ref={ref}
      onMouseMove={handleMouseMove}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      style={{ perspective: 900 }}
    >
      <motion.div
        style={{ rotateX, rotateY }}
        className={`relative ${className ?? ""}`}
      >
        {children}
        <motion.div
          aria-hidden
          className="pointer-events-none absolute inset-0"
          style={{ backgroundImage: shineBackground, opacity: glowOpacity }}
        />
      </motion.div>
    </motion.div>
  );
}
