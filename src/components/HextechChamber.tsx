"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import {
  AnimatePresence,
  motion,
  useScroll,
  useTransform,
  type MotionValue,
} from "framer-motion";
import { useSound } from "@/lib/sound-context";
import { useAchievements } from "@/lib/achievements-context";
import { PingDangerIcon, PingForwardIcon, PingMissingIcon } from "./icons";

const COMBO_WINDOW_MS = 2500;
const COMBO_TARGET = 3;

type TimePalette = {
  primary: string;
  secondary: string;
  ambient: number;
  primaryIntensity: number;
  secondaryIntensity: number;
};

// Shifts the chamber's lighting palette to match the visitor's local time of
// day — warmer/dimmer at the edges of the day, brightest at midday. This
// component only ever renders client-side (loaded with ssr: false), so
// reading the local clock during initial render is safe here.
function getTimePalette(): TimePalette {
  const hour = new Date().getHours();
  if (hour >= 5 && hour < 11) {
    // Morning — warm gold, gentle
    return {
      primary: "#e0a94a",
      secondary: "#0bc4e3",
      ambient: 0.65,
      primaryIntensity: 95,
      secondaryIntensity: 85,
    };
  }
  if (hour >= 11 && hour < 17) {
    // Midday — brightest, balanced
    return {
      primary: "#c89b3c",
      secondary: "#0bc4e3",
      ambient: 0.7,
      primaryIntensity: 100,
      secondaryIntensity: 100,
    };
  }
  if (hour >= 17 && hour < 21) {
    // Evening — sunset warmth
    return {
      primary: "#e0703c",
      secondary: "#7b3ce0",
      ambient: 0.55,
      primaryIntensity: 100,
      secondaryIntensity: 80,
    };
  }
  // Night — cool blue, dimmer
  return {
    primary: "#5b7cfa",
    secondary: "#0bc4e3",
    ambient: 0.4,
    primaryIntensity: 70,
    secondaryIntensity: 90,
  };
}

type PingKind = "onMyWay" | "danger" | "missing";

type PingMarker = { id: number; x: number; y: number; kind: PingKind };

const PING_KINDS: PingKind[] = ["onMyWay", "danger", "missing"];

const PING_META: Record<
  PingKind,
  { label: string; color: string; icon: React.ComponentType<{ className?: string }> }
> = {
  onMyWay: { label: "ON MY WAY!", color: "#0bc4e3", icon: PingForwardIcon },
  danger: { label: "DANGER!", color: "#e05a4e", icon: PingDangerIcon },
  missing: { label: "MISSING!", color: "#c89b3c", icon: PingMissingIcon },
};

const CRYSTAL_COUNT = 14;
const ENTRANCE_DURATION = 2.4;
const ENTRANCE_STAGGER = 0.12;

type CrystalSpec = {
  position: [number, number, number];
  scale: number;
  speed: number;
  color: string;
};

function buildCrystalField(count: number): CrystalSpec[] {
  const items: CrystalSpec[] = [];
  for (let i = 0; i < count; i++) {
    const angle = (i / count) * Math.PI * 2 + i * 0.7;
    const radius = 3.2 + (i % 3) * 0.9;
    const height = Math.sin(i * 1.3) * 2.2;
    items.push({
      position: [Math.cos(angle) * radius, height, Math.sin(angle) * radius],
      scale: 0.16 + (i % 4) * 0.05,
      speed: 0.2 + (i % 5) * 0.08,
      color: i % 2 === 0 ? "#c89b3c" : "#0bc4e3",
    });
  }
  return items;
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function FloatingCrystal({
  spec,
  index,
  onHoverSound,
  onBurstSound,
}: {
  spec: CrystalSpec;
  index: number;
  onHoverSound: () => void;
  onBurstSound: () => void;
}) {
  const ref = useRef<THREE.Mesh>(null);
  const matRef = useRef<THREE.MeshPhysicalMaterial>(null);
  const hoveredRef = useRef(false);
  const burstRequestedRef = useRef(false);
  const burstAtRef = useRef(-1);
  const spawnAtRef = useRef(-1);
  const { position, scale, speed, color } = spec;
  const baseY = position[1];

  useFrame(({ clock }) => {
    const mesh = ref.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    if (spawnAtRef.current < 0) {
      spawnAtRef.current = clock.elapsedTime + index * ENTRANCE_STAGGER;
    }

    mesh.rotation.y += 0.006 * speed;
    mesh.rotation.x += 0.003 * speed;
    mesh.position.y =
      baseY + Math.sin(clock.elapsedTime * speed + position[0]) * 0.4;

    // Staggered spawn-in after the chamber's entrance begins.
    const sinceSpawn = clock.elapsedTime - spawnAtRef.current;
    const spawn = easeOutCubic(THREE.MathUtils.clamp(sinceSpawn / 0.8, 0, 1));

    // Click burst: a quick pop that settles back down.
    if (burstRequestedRef.current) {
      burstRequestedRef.current = false;
      burstAtRef.current = clock.elapsedTime;
    }
    let burst = 0;
    if (burstAtRef.current >= 0) {
      const sinceBurst = clock.elapsedTime - burstAtRef.current;
      if (sinceBurst < 0.6) {
        burst = Math.sin((sinceBurst / 0.6) * Math.PI);
      } else {
        burstAtRef.current = -1;
      }
    }

    const hoverBoost = hoveredRef.current ? 0.35 : 0;
    const targetScale = scale * spawn * (1 + hoverBoost + burst * 0.9);
    mesh.scale.setScalar(
      THREE.MathUtils.lerp(mesh.scale.x || 0.0001, targetScale, 0.18)
    );

    const targetEmissive =
      (0.55 + (hoveredRef.current ? 0.9 : 0) + burst * 2.2) * spawn;
    mat.emissiveIntensity = THREE.MathUtils.lerp(
      mat.emissiveIntensity,
      targetEmissive,
      0.15
    );
  });

  return (
    <mesh
      ref={ref}
      position={position}
      scale={0.0001}
      onPointerOver={(e) => {
        e.stopPropagation();
        if (!hoveredRef.current) onHoverSound();
        hoveredRef.current = true;
        document.body.style.cursor = "pointer";
      }}
      onPointerOut={() => {
        hoveredRef.current = false;
        document.body.style.cursor = "";
      }}
      onClick={(e) => {
        e.stopPropagation();
        burstRequestedRef.current = true;
        onBurstSound();
      }}
      onPointerDown={(e) => e.stopPropagation()}
    >
      <octahedronGeometry args={[1, 0]} />
      <meshPhysicalMaterial
        ref={matRef}
        color="#0a1428"
        metalness={0.4}
        roughness={0.2}
        clearcoat={1}
        emissive={color}
        emissiveIntensity={0}
      />
    </mesh>
  );
}

function CentralGem({ audioLevel }: { audioLevel: MotionValue<number> }) {
  const ref = useRef<THREE.Mesh>(null);

  useFrame((_, delta) => {
    const mesh = ref.current;
    if (!mesh) return;
    mesh.rotation.y += delta * 0.25;
    const level = audioLevel.get();
    const target = 1 + level * 0.15;
    mesh.scale.setScalar(THREE.MathUtils.lerp(mesh.scale.x, target, 0.1));
  });

  return (
    <mesh ref={ref} position={[0, -0.3, -2.6]}>
      <icosahedronGeometry args={[1.15, 0]} />
      <meshPhysicalMaterial
        color="#0a1428"
        metalness={0.35}
        roughness={0.18}
        clearcoat={1}
        clearcoatRoughness={0.1}
        emissive="#c89b3c"
        emissiveIntensity={0.3}
      />
    </mesh>
  );
}

function ChamberGroup({
  audioLevel,
  scrollProgress,
  onHoverSound,
  onBurstSound,
}: {
  audioLevel: MotionValue<number>;
  scrollProgress: MotionValue<number>;
  onHoverSound: () => void;
  onBurstSound: () => void;
}) {
  const groupRef = useRef<THREE.Group>(null);
  const startRef = useRef(-1);
  const crystals = useMemo(() => buildCrystalField(CRYSTAL_COUNT), []);

  useFrame(({ clock }) => {
    const group = groupRef.current;
    if (!group) return;

    if (startRef.current < 0) startRef.current = clock.elapsedTime;
    const elapsed = clock.elapsedTime - startRef.current;
    const entrance = easeOutCubic(
      THREE.MathUtils.clamp(elapsed / ENTRANCE_DURATION, 0, 1)
    );

    // Fly-in from deep in the chamber, then drift gently deeper as the user
    // scrolls the page (scrollProgress is raw page scrollY in px).
    const entranceZ = (1 - entrance) * -7;
    const diveZ = Math.min(scrollProgress.get() / 900, 1.4) * 4;
    group.position.z = entranceZ + diveZ;

    const s = 0.5 + entrance * 0.5;
    group.scale.setScalar(s);
  });

  return (
    <group ref={groupRef}>
      <CentralGem audioLevel={audioLevel} />
      {crystals.map((c, i) => (
        <FloatingCrystal
          key={i}
          spec={c}
          index={i}
          onHoverSound={onHoverSound}
          onBurstSound={onBurstSound}
        />
      ))}
    </group>
  );
}

export default function HextechChamber() {
  const { audioLevel, playHover, playClick, playPing } = useSound();
  const { unlock } = useAchievements();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [allowDrag, setAllowDrag] = useState(false);
  const [pings, setPings] = useState<PingMarker[]>([]);
  const pingIdRef = useRef(0);
  const [palette] = useState(getTimePalette);
  const comboTimestampsRef = useRef<number[]>([]);

  const handleCrystalBurst = () => {
    playClick();
    const now = Date.now();
    const recent = comboTimestampsRef.current.filter(
      (t) => now - t < COMBO_WINDOW_MS
    );
    recent.push(now);
    comboTimestampsRef.current = recent;
    if (recent.length >= COMBO_TARGET) {
      unlock("combo-master");
      comboTimestampsRef.current = [];
    }
  };

  const handlePointerMissed = (event: MouseEvent) => {
    const kind = PING_KINDS[Math.floor(Math.random() * PING_KINDS.length)];
    const id = pingIdRef.current++;
    setPings((prev) => [
      ...prev,
      { id, x: event.clientX, y: event.clientY, kind },
    ]);
    playPing();
    setTimeout(() => {
      setPings((prev) => prev.filter((p) => p.id !== id));
    }, 1000);
  };

  // Fixed full-page backdrop: dive deeper with raw page scroll, and dim once
  // the reader is past the hero so the content stays readable.
  const { scrollY } = useScroll();
  const chamberOpacity = useTransform(scrollY, [0, 700, 1400], [1, 0.55, 0.4]);

  useEffect(() => {
    const reduced = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const fine = window.matchMedia("(pointer: fine)").matches;
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from browser-only APIs unavailable during SSR
    setReducedMotion(reduced);
    setAllowDrag(fine);
  }, []);

  return (
    <>
    <motion.div
      className="fixed inset-0 z-0"
      style={{ opacity: chamberOpacity }}
      aria-hidden
    >
      <Canvas
        frameloop="always"
        camera={{ position: [0, 0, 8], fov: 50 }}
        gl={{ alpha: true, antialias: true }}
        dpr={[1, 1.75]}
        onPointerMissed={handlePointerMissed}
      >
        <ambientLight intensity={palette.ambient} />
        <pointLight
          position={[4, 3, 4]}
          intensity={palette.primaryIntensity}
          color={palette.primary}
        />
        <pointLight
          position={[-4, -2, 3]}
          intensity={palette.secondaryIntensity}
          color={palette.secondary}
        />
        <pointLight position={[0, 4, -4]} intensity={30} color="#ffffff" />

        {!reducedMotion && (
          <Sparkles
            count={60}
            scale={9}
            size={2}
            speed={0.25}
            color="#c89b3c"
            opacity={0.5}
          />
        )}

        <ChamberGroup
          audioLevel={audioLevel}
          scrollProgress={scrollY}
          onHoverSound={playHover}
          onBurstSound={handleCrystalBurst}
        />

        <OrbitControls
          enabled={allowDrag}
          enableZoom={false}
          enablePan={false}
          autoRotate={!reducedMotion}
          autoRotateSpeed={0.4}
          minPolarAngle={Math.PI / 2 - 0.6}
          maxPolarAngle={Math.PI / 2 + 0.6}
        />

        <EffectComposer>
          <Bloom
            intensity={1.1}
            luminanceThreshold={0.25}
            luminanceSmoothing={0.6}
            mipmapBlur
          />
        </EffectComposer>
      </Canvas>
    </motion.div>

    <div className="pointer-events-none fixed inset-0 z-[3] overflow-hidden">
      <AnimatePresence>
        {pings.map((p) => {
          const meta = PING_META[p.kind];
          const Icon = meta.icon;
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, y: 0, scale: 0.6 }}
              animate={{ opacity: 1, y: -12, scale: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.35, ease: "easeOut" }}
              className="absolute flex -translate-x-1/2 -translate-y-full flex-col items-center gap-1"
              style={{ left: p.x, top: p.y }}
            >
              <span
                className="font-heading text-[10px] font-bold uppercase tracking-[0.15em]"
                style={{ color: meta.color, textShadow: `0 0 10px ${meta.color}` }}
              >
                {meta.label}
              </span>
              <motion.div
                initial={{ scale: 0.4, opacity: 0.9 }}
                animate={{ scale: 1.6, opacity: 0 }}
                transition={{ duration: 0.9, ease: "easeOut" }}
                className="absolute top-full h-10 w-10 rounded-full border-2"
                style={{ borderColor: meta.color }}
              />
              <span
                style={{
                  color: meta.color,
                  filter: `drop-shadow(0 0 6px ${meta.color})`,
                }}
              >
                <Icon className="h-6 w-6" />
              </span>
            </motion.div>
          );
        })}
      </AnimatePresence>
    </div>
    </>
  );
}
