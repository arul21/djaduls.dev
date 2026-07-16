"use client";

import { motion } from "framer-motion";
import { stats } from "@/lib/data";

export default function StatsPanel() {
  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h2 className="text-center font-heading text-lg uppercase tracking-[0.3em] text-gold sm:text-xl">
        Champion Stats
      </h2>

      <div className="flex flex-col gap-5">
        {stats.map((stat, i) => (
          <motion.div
            key={stat.key}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: i * 0.12 }}
            className="hextech-border bg-navy/40 p-4"
          >
            <div className="mb-2 flex items-center justify-between">
              <span className="flex items-center gap-2 font-heading text-sm uppercase tracking-wider text-gold-bright sm:text-base">
                <span aria-hidden>{stat.icon}</span>
                {stat.label}
              </span>
              <span className="font-mono text-sm font-bold text-hextech-blue text-glow-blue">
                {stat.value}
                <span className="text-parchment/40">/100</span>
              </span>
            </div>

            <div className="relative h-3 w-full overflow-hidden rounded-sm border border-gold-dim/50 bg-[#000000]/60">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${stat.value}%` }}
                transition={{
                  duration: 1.1,
                  delay: i * 0.12 + 0.25,
                  ease: "easeOut",
                }}
                className="relative h-full overflow-hidden bg-gradient-to-r from-gold-dim via-gold to-hextech-blue"
              >
                <div className="absolute inset-0 opacity-40 [background-image:repeating-linear-gradient(90deg,transparent,transparent_6px,rgba(0,0,0,0.3)_6px,rgba(0,0,0,0.3)_8px)]" />
                <div
                  className="shimmer-sweep absolute inset-y-0 w-1/3 bg-gradient-to-r from-transparent via-white/70 to-transparent"
                  style={{ animationDelay: `${i * 0.3 + 1.3}s` }}
                />
              </motion.div>
            </div>

            <p className="mt-2 text-xs text-parchment/60 sm:text-sm">
              {stat.description}
            </p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
