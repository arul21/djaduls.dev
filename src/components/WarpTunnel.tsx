"use client";

import { useEffect, useMemo, useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import * as THREE from "three";
import { motion } from "framer-motion";
import { useSound } from "@/lib/sound-context";

const STREAK_COUNT = 420;
const DURATION_MS = 2100;
const FLASH_AT_MS = 1700;
const DEPTH = 60;

function easeInQuad(t: number) {
  return t * t;
}

type StreakField = {
  x: Float32Array;
  y: Float32Array;
  z: Float32Array;
};

function buildField(): StreakField {
  const x = new Float32Array(STREAK_COUNT);
  const y = new Float32Array(STREAK_COUNT);
  const z = new Float32Array(STREAK_COUNT);
  for (let i = 0; i < STREAK_COUNT; i++) {
    // Annulus around the center so the "black hole" core stays open.
    const angle = Math.random() * Math.PI * 2;
    const radius = 0.7 + Math.random() * 7;
    x[i] = Math.cos(angle) * radius;
    y[i] = Math.sin(angle) * radius;
    z[i] = -Math.random() * DEPTH;
  }
  return { x, y, z };
}

function Streaks() {
  const linesRef = useRef<THREE.LineSegments>(null);
  const startRef = useRef(-1);
  const fieldRef = useRef<StreakField | null>(null);

  const { positions, colors } = useMemo(() => {
    const positions = new Float32Array(STREAK_COUNT * 6);
    const colors = new Float32Array(STREAK_COUNT * 6);
    const gold = new THREE.Color("#c89b3c");
    const teal = new THREE.Color("#0bc4e3");
    for (let i = 0; i < STREAK_COUNT; i++) {
      const c = i % 3 === 0 ? teal : gold;
      // head vertex brighter than tail for a comet look
      colors[i * 6 + 0] = c.r;
      colors[i * 6 + 1] = c.g;
      colors[i * 6 + 2] = c.b;
      colors[i * 6 + 3] = c.r * 0.15;
      colors[i * 6 + 4] = c.g * 0.15;
      colors[i * 6 + 5] = c.b * 0.15;
    }
    return { positions, colors };
  }, []);

  useFrame(({ clock }, rawDelta) => {
    const lines = linesRef.current;
    if (!lines) return;
    if (startRef.current < 0) startRef.current = clock.elapsedTime;
    if (!fieldRef.current) fieldRef.current = buildField();
    const field = fieldRef.current;

    const t = THREE.MathUtils.clamp(
      ((clock.elapsedTime - startRef.current) * 1000) / DURATION_MS,
      0,
      1
    );
    const speed = THREE.MathUtils.lerp(6, 110, easeInQuad(t));
    const tail = speed * 0.045;
    const delta = Math.min(rawDelta || 0.016, 0.05);

    const pos = lines.geometry.getAttribute(
      "position"
    ) as THREE.BufferAttribute;
    const arr = pos.array as Float32Array;

    for (let i = 0; i < STREAK_COUNT; i++) {
      field.z[i] += speed * delta;
      if (field.z[i] > 2) field.z[i] = -DEPTH;

      arr[i * 6 + 0] = field.x[i];
      arr[i * 6 + 1] = field.y[i];
      arr[i * 6 + 2] = field.z[i];
      arr[i * 6 + 3] = field.x[i];
      arr[i * 6 + 4] = field.y[i];
      arr[i * 6 + 5] = field.z[i] - tail;
    }
    pos.needsUpdate = true;
  });

  return (
    <lineSegments ref={linesRef}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
        <bufferAttribute attach="attributes-color" args={[colors, 3]} />
      </bufferGeometry>
      <lineBasicMaterial
        vertexColors
        transparent
        opacity={0.9}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
      />
    </lineSegments>
  );
}

export default function WarpTunnel({ onComplete }: { onComplete: () => void }) {
  const { playWarp } = useSound();
  const onCompleteRef = useRef(onComplete);

  useEffect(() => {
    onCompleteRef.current = onComplete;
  }, [onComplete]);

  useEffect(() => {
    playWarp();
    const timer = setTimeout(() => onCompleteRef.current(), DURATION_MS);
    return () => clearTimeout(timer);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- fire once on mount
  }, []);

  return (
    <motion.div
      exit={{ opacity: 0 }}
      transition={{ duration: 0.35 }}
      className="fixed inset-0 z-[105] bg-black"
    >
      <Canvas
        camera={{ position: [0, 0, 0], fov: 85 }}
        gl={{ antialias: true }}
        dpr={[1, 1.75]}
      >
        <Streaks />
      </Canvas>

      {/* Tunnel vignette: darkness closing in from the edges */}
      <div
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, transparent 30%, rgba(0,0,0,0.85) 90%)",
        }}
      />

      {/* Exit flash right before landing in the chamber */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0, 1] }}
        transition={{
          duration: DURATION_MS / 1000,
          times: [0, FLASH_AT_MS / DURATION_MS, 1],
          ease: "easeIn",
        }}
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(circle at 50% 50%, rgba(240,230,210,0.95), rgba(200,155,60,0.5) 45%, transparent 75%)",
        }}
      />
    </motion.div>
  );
}
