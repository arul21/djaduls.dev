"use client";

import { Volume2, VolumeX } from "lucide-react";
import { useSound } from "@/lib/sound-context";

export default function SoundToggle() {
  const { muted, toggleMuted } = useSound();

  return (
    <div className="fixed right-4 bottom-4 z-[95] h-11 w-11 sm:right-6 sm:bottom-6">
      <button
        onClick={toggleMuted}
        aria-label={muted ? "Unmute sound effects" : "Mute sound effects"}
        aria-pressed={!muted}
        className="hextech-border flex h-full w-full items-center justify-center rounded-full bg-void/90 text-gold-bright backdrop-blur-sm transition-shadow hover:gold-glow"
      >
        {muted ? (
          <VolumeX className="h-5 w-5 text-parchment/60" />
        ) : (
          <Volume2 className="h-5 w-5 text-hextech-blue" />
        )}
      </button>
    </div>
  );
}
