"use client";

import { useEffect, useRef, useState } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import Image from "next/image";
import { Mail } from "lucide-react";
import { champion, contacts } from "@/lib/data";
import { useSound } from "@/lib/sound-context";
import { useAchievements } from "@/lib/achievements-context";
import { getAgeProgress } from "@/lib/age";
import { GithubIcon, LinkedinIcon } from "./icons";
import RankBadge from "./RankBadge";
import type { TabKey } from "./TabNav";

const RECALL_DURATION_MS = 1100;

const SOCIAL_ICONS: Record<
  string,
  React.ComponentType<{ className?: string }>
> = {
  mail: Mail,
  github: GithubIcon,
  linkedin: LinkedinIcon,
};

export default function ChampionCard({
  onNavigate,
  onSummon,
}: {
  onNavigate: (tab: TabKey) => void;
  onSummon: () => void;
}) {
  const { playClick, playRecallComplete, playRecallCancel, audioLevel } =
    useSound();
  const { unlock } = useAchievements();
  const socials = contacts.filter((c) => c.icon in SOCIAL_ICONS);
  const { age, nextLevel, progress } = getAgeProgress(champion.birthDate);
  const ringScale = useTransform(audioLevel, [0, 1], [1, 1.07]);
  const [reducedMotion, setReducedMotion] = useState(false);

  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  const portraitScale = useTransform(scrollYProgress, [0, 1], [1, 0.82]);
  const portraitOpacity = useTransform(scrollYProgress, [0, 1], [1, 0.35]);
  const portraitY = useTransform(scrollYProgress, [0, 1], [0, -40]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from a browser-only API unavailable during SSR
    setReducedMotion(
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    );
  }, []);

  const [channelState, setChannelState] = useState<
    "idle" | "channeling" | "complete"
  >("idle");
  const channelTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const resetTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (channelTimeoutRef.current) clearTimeout(channelTimeoutRef.current);
      if (resetTimeoutRef.current) clearTimeout(resetTimeoutRef.current);
    };
  }, []);

  const handleCta = (tab: TabKey) => {
    playClick();
    onNavigate(tab);
  };

  const startChannel = () => {
    if (channelState !== "idle") return;
    setChannelState("channeling");
    channelTimeoutRef.current = setTimeout(() => {
      setChannelState("complete");
      playRecallComplete();
      unlock("summoner-verified");
      onSummon();
      resetTimeoutRef.current = setTimeout(
        () => setChannelState("idle"),
        700
      );
    }, RECALL_DURATION_MS);
  };

  const cancelChannel = () => {
    if (channelTimeoutRef.current) {
      clearTimeout(channelTimeoutRef.current);
      channelTimeoutRef.current = null;
    }
    if (channelState === "channeling") {
      setChannelState("idle");
      playRecallCancel();
    }
  };

  const handleSummonKeyDown = (e: React.KeyboardEvent) => {
    if ((e.key === "Enter" || e.key === " ") && !e.repeat) {
      e.preventDefault();
      startChannel();
    }
  };

  const handleSummonKeyUp = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") cancelChannel();
  };

  return (
    <motion.div
      ref={heroRef}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.7, ease: "easeOut" }}
      className='relative flex min-h-[100svh] w-full flex-col items-center justify-center px-6 py-14 text-center'
    >
      <div className='pointer-events-auto relative z-10 mx-auto flex w-full max-w-2xl flex-col items-center gap-4'>
        {/* Portrait frame with rotating hextech ring */}
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.15 }}
          className='relative h-28 w-28 sm:h-36 sm:w-36'
        >
          <motion.div
            style={{
              scale: portraitScale,
              opacity: portraitOpacity,
              y: portraitY,
            }}
            className='relative h-full w-full'
          >
            <motion.div
              animate={reducedMotion ? undefined : { rotate: 360 }}
              transition={{ duration: 6, repeat: Infinity, ease: "linear" }}
              className='absolute -inset-2 rounded-full'
              style={{
                scale: ringScale,
                background:
                  "conic-gradient(from 0deg, transparent 0%, var(--color-gold) 18%, transparent 32%, transparent 68%, var(--color-hextech-blue) 82%, transparent 100%)",
                WebkitMask:
                  "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
                mask: "radial-gradient(farthest-side, transparent calc(100% - 3px), black calc(100% - 3px))",
              }}
            />
            <div className='absolute inset-0'>
              <div className='hextech-border gold-glow relative h-full w-full overflow-hidden rounded-full bg-gradient-to-br from-[#1e2328] to-[#010a13]'>
                <Image
                  src='/images/djaduls.jpeg'
                  alt={champion.name}
                  fill
                  sizes='(min-width: 640px) 144px, 112px'
                  className='object-cover'
                  priority
                />
              </div>
            </div>
            {/* Level badge = age, computed live from birth date */}
            <div className='absolute -bottom-2 -right-2 h-9 w-9'>
              <div className='hextech-border flex h-full w-full items-center justify-center rounded-full bg-[#010a13] text-xs font-bold text-gold-bright'>
                {age}
              </div>
            </div>
          </motion.div>
        </motion.div>

        <div className='flex w-full max-w-[220px] flex-col gap-1'>
          <div className='flex items-center justify-between text-[9px] uppercase tracking-widest text-parchment/50'>
            <span>Lv. {age}</span>
            <span>Lv. {nextLevel}</span>
          </div>
          <div className='h-1.5 overflow-hidden rounded-sm border border-gold-dim/50 bg-black/60'>
            <motion.div
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 1.2, delay: 0.6, ease: "easeOut" }}
              className='relative h-full overflow-hidden bg-gradient-to-r from-gold-dim via-gold to-hextech-blue'
            >
              <div
                className='shimmer-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent'
                style={{ animationDelay: "1.8s" }}
              />
            </motion.div>
          </div>
          <p className='text-center text-[9px] tracking-widest text-parchment/40'>
            {progress}% to next level
          </p>
        </div>

        <div>
          <p className='mb-1 text-[11px] uppercase tracking-[0.35em] text-hextech-blue text-glow-blue'>
            {champion.role}
          </p>
          <h1 className='font-heading text-3xl font-bold tracking-wide text-gold-bright text-glow-gold sm:text-5xl'>
            {champion.name}
          </h1>
          <p className='mt-1 font-heading text-lg tracking-[0.2em] text-gold sm:text-xl'>
            &ldquo;{champion.alias}&rdquo;
          </p>
          <p className='mt-2 text-sm italic text-parchment/80 sm:text-base'>
            {champion.title}
          </p>
        </div>

        <RankBadge />

        <p className='max-w-md text-xs text-parchment/60 sm:text-sm'>
          {champion.quote}
        </p>

        <div className='flex flex-wrap items-center justify-center gap-3 pt-1'>
          <button
            onClick={() => handleCta("quests")}
            className='hextech-border bg-gradient-to-b from-gold-dim/30 to-transparent px-5 py-2.5 font-heading text-xs uppercase tracking-[0.2em] text-gold-bright transition-shadow hover:gold-glow sm:text-sm'
          >
            Lihat Quest Saya
          </button>
          <button
            onPointerDown={startChannel}
            onPointerUp={cancelChannel}
            onPointerLeave={cancelChannel}
            onKeyDown={handleSummonKeyDown}
            onKeyUp={handleSummonKeyUp}
            className='hextech-border relative select-none overflow-hidden bg-gradient-to-b from-hextech-blue-dim/20 to-transparent px-5 py-2.5 font-heading text-xs uppercase tracking-[0.2em] text-hextech-blue transition-shadow hover:gold-glow sm:text-sm'
          >
            {channelState === "channeling" && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: RECALL_DURATION_MS / 1000, ease: "linear" }}
                style={{ originX: 0 }}
                className='absolute inset-0 bg-hextech-blue/25'
              />
            )}
            {channelState === "channeling" && (
              <svg
                className='pointer-events-none absolute inset-0 h-full w-full'
                viewBox='0 0 100 100'
                preserveAspectRatio='none'
              >
                <motion.rect
                  x='1'
                  y='1'
                  width='98'
                  height='98'
                  fill='none'
                  stroke='var(--color-hextech-blue)'
                  strokeWidth='2'
                  initial={{ pathLength: 0 }}
                  animate={{ pathLength: 1 }}
                  transition={{
                    duration: RECALL_DURATION_MS / 1000,
                    ease: "linear",
                  }}
                />
              </svg>
            )}
            <span className='relative z-10'>
              {channelState === "complete" ? "Summoned!" : "Summon Me"}
            </span>
          </button>
        </div>

        <div className='flex items-center justify-center gap-3 pt-1'>
          {socials.map((social) => {
            const Icon = SOCIAL_ICONS[social.icon];
            return (
              <a
                key={social.label}
                href={social.href}
                target={social.href.startsWith("http") ? "_blank" : undefined}
                rel={
                  social.href.startsWith("http")
                    ? "noopener noreferrer"
                    : undefined
                }
                aria-label={social.label}
                className='clip-hex flex h-9 w-9 items-center justify-center bg-navy/60 text-parchment/70 ring-1 ring-gold-dim/40 transition-colors hover:bg-gold-dim/20 hover:text-gold-bright hover:ring-gold'
              >
                <Icon className='h-4 w-4' />
              </a>
            );
          })}
        </div>

        <div className='mt-2 h-px w-40 bg-gradient-to-r from-transparent via-gold-dim to-transparent sm:w-64' />
      </div>
    </motion.div>
  );
}
