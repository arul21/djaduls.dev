"use client";

import { useEffect, useState } from "react";
import { fetchGithubMatches, type Match } from "@/lib/github";
import { LANGUAGE_ICONS } from "@/lib/language-icons";
import { iconFill } from "@/lib/icon-fill";
import { useSound } from "@/lib/sound-context";
import TiltCard from "./TiltCard";

export default function HistoryPanel() {
  const { playHover } = useSound();
  const [matches, setMatches] = useState<Match[] | null>(null);
  const [errored, setErrored] = useState(false);

  useEffect(() => {
    let cancelled = false;

    fetchGithubMatches()
      .then((data) => {
        if (!cancelled) setMatches(data);
      })
      .catch(() => {
        if (!cancelled) setErrored(true);
      });

    return () => {
      cancelled = true;
    };
  }, []);

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h2 className="text-center font-heading text-lg uppercase tracking-[0.3em] text-gold sm:text-xl">
        Match History
      </h2>
      <p className="-mt-4 text-center text-[10px] uppercase tracking-widest text-parchment/40">
        Live from GitHub · github.com/arul21
      </p>

      {errored && (
        <p className="text-center text-xs text-parchment/50">
          Unable to load match history from GitHub right now.
        </p>
      )}

      {!errored && !matches && (
        <p className="animate-pulse text-center text-xs uppercase tracking-widest text-parchment/40">
          Loading match history...
        </p>
      )}

      {matches && (
        <div className="flex flex-col gap-3">
          {matches.map((match, i) => {
            const isVictory = match.result === "Victory";
            const icon = LANGUAGE_ICONS[match.role];
            return (
              <TiltCard
                key={match.title}
                initial={{ opacity: 0, x: -16 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true, amount: 0.3 }}
                transition={{ duration: 0.4, delay: i * 0.08 }}
                onMouseEnter={playHover}
                className={`hextech-border flex items-center gap-4 border-l-4 bg-navy/40 p-3 transition-shadow hover:gold-glow sm:p-4 ${
                  isVictory ? "border-l-hextech-blue" : "border-l-gold"
                }`}
              >
                <a
                  href={match.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={match.title}
                  className="absolute inset-0"
                />
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gold-dim/50 bg-navy sm:h-12 sm:w-12">
                  {icon ? (
                    <svg
                      viewBox="0 0 24 24"
                      fill={iconFill(icon.hex)}
                      className="h-7 w-7 sm:h-8 sm:w-8"
                    >
                      <path d={icon.path} />
                    </svg>
                  ) : (
                    <span className="text-[10px] font-bold uppercase text-gold-bright">
                      {match.role.slice(0, 2).toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-baseline justify-between gap-x-2 gap-y-0.5">
                    <h3 className="truncate font-heading text-sm font-bold text-gold-bright sm:text-base">
                      {match.title}
                    </h3>
                    <span
                      className={`text-[10px] font-bold uppercase tracking-widest ${
                        isVictory ? "text-hextech-blue" : "text-gold"
                      }`}
                    >
                      {match.result}
                    </span>
                  </div>
                  <p className="text-[11px] text-parchment/50 sm:text-xs">
                    {match.role} · {match.duration} · {match.when}
                  </p>
                </div>

                <div className="shrink-0 text-right font-mono text-xs text-parchment/70 sm:text-sm">
                  <span className="font-bold text-gold-bright">
                    {match.stats.stars}
                  </span>
                  <span className="text-parchment/30"> / </span>
                  <span className="font-bold text-hextech-blue">
                    {match.stats.forks}
                  </span>
                  <span className="text-parchment/30"> / </span>
                  <span className="font-bold text-parchment/80">
                    {match.stats.issues}
                  </span>
                  <p className="mt-0.5 text-[9px] uppercase tracking-widest text-parchment/40">
                    Stars / Forks / Issues
                  </p>
                </div>
              </TiltCard>
            );
          })}
        </div>
      )}
    </div>
  );
}
