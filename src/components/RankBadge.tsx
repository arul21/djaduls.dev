"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { fetchGithubRank, type RankStats } from "@/lib/github";

export default function RankBadge() {
  const [rank, setRank] = useState<RankStats | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    let cancelled = false;
    fetchGithubRank()
      .then((stats) => {
        if (!cancelled) setRank(stats);
      })
      .catch(() => {
        if (!cancelled) setFailed(true);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (failed || !rank) return null;

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.3 }}
      className="relative flex items-center gap-1.5 overflow-hidden rounded-sm border px-2.5 py-1"
      style={{
        borderColor: rank.tier.color,
        boxShadow: `0 0 14px ${rank.tier.color}40`,
      }}
      title={`${rank.totalStars} stars · ${rank.followers} followers · ${rank.publicRepos} repos`}
    >
      <div
        className="shimmer-sweep absolute inset-y-0 w-1/3 opacity-40"
        style={{
          background: `linear-gradient(90deg, transparent, ${rank.tier.glow}, transparent)`,
        }}
      />
      <span
        className="relative z-10 font-heading text-[10px] uppercase tracking-[0.2em] sm:text-xs"
        style={{ color: rank.tier.glow, textShadow: `0 0 8px ${rank.tier.color}` }}
      >
        {rank.tier.name}
      </span>
    </motion.div>
  );
}
