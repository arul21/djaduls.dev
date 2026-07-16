"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Sparkles } from "@react-three/drei";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import * as THREE from "three";
import { motion, useScroll, useTransform, type MotionValue } from "framer-motion";
import { useSound } from "@/lib/sound-context";

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
  const { audioLevel, playHover, playClick } = useSound();
  const [reducedMotion, setReducedMotion] = useState(false);
  const [allowDrag, setAllowDrag] = useState(false);

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
      >
        <ambientLight intensity={0.6} />
        <pointLight position={[4, 3, 4]} intensity={90} color="#c89b3c" />
        <pointLight position={[-4, -2, 3]} intensity={100} color="#0bc4e3" />
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
          onBurstSound={playClick}
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
  );
}
