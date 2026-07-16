"use client";

import { abilities } from "@/lib/data";
import { useSound } from "@/lib/sound-context";
import TiltCard from "./TiltCard";

export default function AbilitiesPanel() {
  const { playHover } = useSound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h2 className="text-center font-heading text-lg uppercase tracking-[0.3em] text-gold sm:text-xl">
        Ability Kit
      </h2>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {abilities.map((ability, i) => (
          <TiltCard
            key={ability.key}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.1 }}
            whileHover={{ y: -4 }}
            onMouseEnter={playHover}
            className="hextech-border group flex flex-col gap-3 bg-navy/40 p-4 transition-shadow hover:gold-glow"
          >
            <div className="flex items-center gap-3">
              <div className="diamond flex h-10 w-10 shrink-0 items-center justify-center bg-gradient-to-br from-gold-dim to-gold text-base font-bold text-[#010a13] font-heading">
                {ability.key}
              </div>
              <div className="min-w-0">
                <h3 className="truncate font-heading text-sm font-bold uppercase tracking-wide text-gold-bright sm:text-base">
                  {ability.name}
                </h3>
                <p className="text-[10px] uppercase tracking-widest text-hextech-blue">
                  Cooldown: {ability.cooldown}
                </p>
              </div>
            </div>

            <p className="text-xs text-parchment/70 sm:text-sm">
              {ability.description}
            </p>

            <div className="mt-auto flex flex-wrap gap-1.5 pt-1">
              {ability.tags.map((tag) => (
                <span
                  key={tag}
                  className="rounded-sm border border-gold-dim/50 bg-void/60 px-2 py-0.5 text-[10px] text-parchment/70"
                >
                  {tag}
                </span>
              ))}
            </div>
          </TiltCard>
        ))}
      </div>
    </div>
  );
}
