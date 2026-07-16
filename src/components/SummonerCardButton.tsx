"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { champion, stats } from "@/lib/data";
import { getAgeProgress } from "@/lib/age";
import { fetchGithubRank } from "@/lib/github";
import { renderSummonerCard } from "@/lib/summoner-card";
import { useSound } from "@/lib/sound-context";
import { useAchievements } from "@/lib/achievements-context";

export default function SummonerCardButton() {
  const [busy, setBusy] = useState(false);
  const { playClick } = useSound();
  const { unlock } = useAchievements();

  const handleDownload = async () => {
    if (busy) return;
    setBusy(true);
    playClick();
    try {
      const { age } = getAgeProgress(champion.birthDate);
      const rank = await fetchGithubRank().catch(() => null);
      const canvas = await renderSummonerCard({
        name: champion.name,
        alias: champion.alias,
        title: champion.title,
        role: champion.role,
        level: age,
        avatarSrc: "/images/djaduls.jpeg",
        stats: stats.map((s) => ({ label: s.label, value: s.value })),
        rank: rank?.tier ?? null,
      });

      const blob: Blob | null = await new Promise((resolve) =>
        canvas.toBlob(resolve, "image/png")
      );
      if (!blob) return;

      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "djaduls-summoner-card.png";
      a.click();
      URL.revokeObjectURL(url);
      unlock("collector");
    } finally {
      setBusy(false);
    }
  };

  return (
    <motion.button
      onClick={handleDownload}
      disabled={busy}
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.96 }}
      className="hextech-border bg-gradient-to-b from-gold-dim/20 to-transparent px-4 py-2 font-heading text-[10px] uppercase tracking-[0.2em] text-gold-bright transition-shadow hover:gold-glow disabled:opacity-50 sm:text-xs"
    >
      {busy ? "Forging Card..." : "Download Summoner Card"}
    </motion.button>
  );
}
