"use client";

import { useEffect, useRef, useState } from "react";
import dynamic from "next/dynamic";
import { AnimatePresence, motion } from "framer-motion";
import ChampionCard from "@/components/ChampionCard";
import TabNav, { TABS, TabKey } from "@/components/TabNav";
import StatsPanel from "@/components/StatsPanel";
import AbilitiesPanel from "@/components/AbilitiesPanel";
import QuestsPanel from "@/components/QuestsPanel";
import HistoryPanel from "@/components/HistoryPanel";
import TechStackPanel from "@/components/TechStackPanel";
import SummonPanel from "@/components/SummonPanel";
import LoadingScreen from "@/components/LoadingScreen";
import RuneField from "@/components/RuneField";
import CustomCursor from "@/components/CustomCursor";
import SoundToggle from "@/components/SoundToggle";
import BackgroundMusic from "@/components/BackgroundMusic";
import ClickPing from "@/components/ClickPing";
import KonamiEasterEgg from "@/components/KonamiEasterEgg";
import AchievementToasts from "@/components/AchievementToasts";
import ShortcutsOverlay from "@/components/ShortcutsOverlay";
import WelcomeBack from "@/components/WelcomeBack";
import { SoundProvider, useSound } from "@/lib/sound-context";
import { AchievementsProvider, useAchievements } from "@/lib/achievements-context";

// WebGL warp effect — browser-only, loaded just-in-time after the loading screen.
const WarpTunnel = dynamic(() => import("@/components/WarpTunnel"), {
  ssr: false,
});

// Fixed full-page 3D backdrop — browser-only and heavy, so lazy-loaded.
const HextechChamber = dynamic(() => import("@/components/HextechChamber"), {
  ssr: false,
});

const PANELS: Record<TabKey, React.ComponentType> = {
  stats: StatsPanel,
  abilities: AbilitiesPanel,
  quests: QuestsPanel,
  history: HistoryPanel,
  techstack: TechStackPanel,
};

function AchievementTriggers({
  tab,
  footerRef,
}: {
  tab: TabKey;
  footerRef: React.RefObject<HTMLElement | null>;
}) {
  const { unlock } = useAchievements();
  const visitedRef = useRef<Set<TabKey>>(new Set());

  useEffect(() => {
    visitedRef.current.add(tab);
    if (visitedRef.current.size >= TABS.length) unlock("explorer");
  }, [tab, unlock]);

  useEffect(() => {
    const footer = footerRef.current;
    if (!footer) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          unlock("deep-diver");
          observer.disconnect();
        }
      },
      { threshold: 0.6 }
    );
    observer.observe(footer);
    return () => observer.disconnect();
  }, [unlock, footerRef]);

  return null;
}

function KeyboardShortcuts({ onSelect }: { onSelect: (tab: TabKey) => void }) {
  const { playClick } = useSound();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      const found = TABS.find((t) => t.hotkey === e.key);
      if (found) {
        playClick();
        onSelect(found.key);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onSelect, playClick]);

  return null;
}

type Phase = "loading" | "warp" | "ready";

export default function Home() {
  const [phase, setPhase] = useState<Phase>("loading");
  const [tab, setTab] = useState<TabKey>("stats");
  const panelAnchorRef = useRef<HTMLDivElement>(null);
  const summonRef = useRef<HTMLDivElement>(null);
  const footerRef = useRef<HTMLElement>(null);
  const hasMounted = useRef(false);

  useEffect(() => {
    if (!hasMounted.current) {
      hasMounted.current = true;
      return;
    }
    panelAnchorRef.current?.scrollIntoView({
      behavior: "smooth",
      block: "start",
    });
  }, [tab]);

  useEffect(() => {
    // Warm the warp chunk while the loading bar runs so the transition
    // starts instantly instead of showing a black frame on first paint.
    import("@/components/WarpTunnel");
  }, []);

  const scrollToSummon = () => {
    summonRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const ActivePanel = PANELS[tab];

  return (
    <SoundProvider>
      <AnimatePresence>
        {phase === "loading" && (
          <LoadingScreen
            onDone={() =>
              setPhase(
                window.matchMedia("(prefers-reduced-motion: reduce)").matches
                  ? "ready"
                  : "warp"
              )
            }
          />
        )}
        {phase === "warp" && (
          <WarpTunnel onComplete={() => setPhase("ready")} />
        )}
      </AnimatePresence>

      {phase === "ready" && (
        <AchievementsProvider>
          <RuneField />
          <HextechChamber />
          <ClickPing />
          <CustomCursor />
          <SoundToggle />
          <BackgroundMusic />
          <KeyboardShortcuts onSelect={setTab} />
          <KonamiEasterEgg />
          <AchievementTriggers tab={tab} footerRef={footerRef} />
          <AchievementToasts />
          <ShortcutsOverlay />
          <WelcomeBack />

          {/* pointer-events-none lets empty areas pass drags through to the
              fixed 3D chamber below; interactive children re-enable them. */}
          <main className="pointer-events-none relative z-10 flex flex-1 flex-col">
            <ChampionCard onNavigate={setTab} onSummon={scrollToSummon} />
            <div ref={panelAnchorRef} />
            <TabNav active={tab} onChange={setTab} />

            <AnimatePresence mode="wait">
              <motion.div
                key={tab}
                className="pointer-events-auto"
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -12 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
              >
                <ActivePanel />
              </motion.div>
            </AnimatePresence>

            <div
              ref={summonRef}
              className="pointer-events-auto border-t border-gold-dim/30"
            >
              <SummonPanel />
            </div>

            <footer
              ref={footerRef}
              className="pointer-events-auto mt-auto py-8 text-center text-[10px] uppercase tracking-[0.3em] text-parchment/40"
            >
              © {new Date().getFullYear()} Khairul Baharuddin — DJADULS
            </footer>
          </main>
        </AchievementsProvider>
      )}
    </SoundProvider>
  );
}
