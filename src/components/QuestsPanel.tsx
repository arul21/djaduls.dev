"use client";

import { ExternalLink, Star } from "lucide-react";
import { quests, type QuestStatus } from "@/lib/data";
import { useSound } from "@/lib/sound-context";
import { GithubIcon } from "./icons";
import TiltCard from "./TiltCard";

const STATUS_STYLES: Record<QuestStatus, string> = {
  Selesai: "text-hextech-blue border-hextech-blue/50",
  "Dalam Pengerjaan": "text-gold border-gold/50",
};

export default function QuestsPanel() {
  const { playHover } = useSound();

  return (
    <div className="mx-auto flex w-full max-w-2xl flex-col gap-6 px-6 py-10">
      <h2 className="text-center font-heading text-lg uppercase tracking-[0.3em] text-gold sm:text-xl">
        Quest Log
      </h2>

      <div className="flex flex-col gap-4">
        {quests.map((quest, i) => (
          <TiltCard
            key={quest.title}
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, amount: 0.3 }}
            transition={{ duration: 0.5, delay: i * 0.08 }}
            onMouseEnter={playHover}
            className="hextech-border group flex flex-col gap-2 bg-navy/40 p-4 transition-[box-shadow,border-color] duration-300 hover:border-gold hover:gold-glow"
          >
            <div className="flex flex-wrap items-center justify-between gap-2">
              <h3 className="font-heading text-sm font-bold text-gold-bright sm:text-base">
                {quest.title}
              </h3>
              <span
                className={`shrink-0 rounded-sm border px-2 py-0.5 text-[10px] uppercase tracking-widest ${STATUS_STYLES[quest.status]}`}
              >
                {quest.status}
              </span>
            </div>

            <div
              className="flex items-center gap-1"
              aria-label={`Tingkat kesulitan ${quest.difficulty} dari 5`}
            >
              {Array.from({ length: 5 }).map((_, idx) => (
                <Star
                  key={idx}
                  className={`h-3.5 w-3.5 ${
                    idx < quest.difficulty
                      ? "fill-gold text-gold"
                      : "fill-transparent text-gold-dim/40"
                  }`}
                />
              ))}
            </div>

            <p className="text-xs text-parchment/70 sm:text-sm">
              {quest.description}
            </p>

            <div className="mt-1 flex flex-wrap gap-1.5">
              {quest.rewards.map((reward) => (
                <span
                  key={reward}
                  className="rounded-sm border border-gold-dim/50 bg-void/60 px-2 py-0.5 text-[10px] text-parchment/70"
                >
                  {reward}
                </span>
              ))}
            </div>

            {(quest.demoUrl || quest.githubUrl) && (
              <div className="mt-2 flex flex-wrap gap-2 pt-1">
                {quest.demoUrl && (
                  <a
                    href={quest.demoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-sm border border-gold-dim/60 px-3 py-1.5 text-[11px] uppercase tracking-wider text-gold-bright transition-colors hover:border-gold hover:bg-gold-dim/15"
                  >
                    <ExternalLink className="h-3.5 w-3.5" />
                    Live Demo
                  </a>
                )}
                {quest.githubUrl && (
                  <a
                    href={quest.githubUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 rounded-sm border border-gold-dim/60 px-3 py-1.5 text-[11px] uppercase tracking-wider text-parchment/70 transition-colors hover:border-gold hover:bg-gold-dim/15 hover:text-gold-bright"
                  >
                    <GithubIcon className="h-3.5 w-3.5" />
                    GitHub
                  </a>
                )}
              </div>
            )}
          </TiltCard>
        ))}
      </div>
    </div>
  );
}
