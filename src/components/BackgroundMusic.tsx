"use client";

import { useEffect, useRef, useState } from "react";
import { Music, Pause, Play } from "lucide-react";
import { useSound } from "@/lib/sound-context";

// Played in order: the intro jingle once, then the main track on loop.
const TRACKS = [
  {
    src: "/audio/league-of-legends-original-sounds-welcome-to-summoners-rift.mp3",
    loop: false,
  },
  // { src: "/audio/lp.mp3", loop: false },
  { src: "/audio/howling-abyss-victory.mp3", loop: true },
];
const VOLUME = 0.35;

export default function BackgroundMusic() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const trackIndexRef = useRef(0);
  const userPausedRef = useRef(false);
  const [playing, setPlaying] = useState(false);
  const [errored, setErrored] = useState(false);
  const { registerAudioElement } = useSound();

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = VOLUME;
    audio.loop = TRACKS[trackIndexRef.current].loop;
    registerAudioElement(audio);

    const onFirstInteraction = () => attemptPlay();

    function attemptPlay() {
      if (userPausedRef.current) return;
      audio!
        .play()
        .then(() => {
          setPlaying(true);
          window.removeEventListener("pointerdown", onFirstInteraction);
          window.removeEventListener("keydown", onFirstInteraction);
        })
        .catch(() => {
          // Browser blocked audible autoplay — retry on the user's first interaction.
        });
    }

    attemptPlay();
    window.addEventListener("pointerdown", onFirstInteraction);
    window.addEventListener("keydown", onFirstInteraction);

    return () => {
      window.removeEventListener("pointerdown", onFirstInteraction);
      window.removeEventListener("keydown", onFirstInteraction);
    };
  }, [registerAudioElement]);

  const handleEnded = () => {
    const audio = audioRef.current;
    if (!audio || trackIndexRef.current >= TRACKS.length - 1) {
      setPlaying(false);
      return;
    }

    trackIndexRef.current += 1;
    const next = TRACKS[trackIndexRef.current];
    audio.src = next.src;
    audio.loop = next.loop;

    if (!userPausedRef.current) {
      audio
        .play()
        .then(() => setPlaying(true))
        .catch(() => setErrored(true));
    }
  };

  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (playing) {
      userPausedRef.current = true;
      audio.pause();
      setPlaying(false);
      return;
    }

    userPausedRef.current = false;
    audio
      .play()
      .then(() => setPlaying(true))
      .catch(() => setErrored(true));
  };

  return (
    <div className='fixed right-4 bottom-20 z-[95] h-11 w-11 sm:right-6 sm:bottom-24'>
      <audio
        ref={audioRef}
        src={TRACKS[0].src}
        preload='auto'
        onError={() => setErrored(true)}
        onEnded={handleEnded}
      />
      <button
        onClick={toggle}
        disabled={errored}
        aria-label={
          playing ? "Pause background music" : "Play background music"
        }
        aria-pressed={playing}
        title={errored ? "Background audio unavailable" : undefined}
        className='hextech-border flex h-full w-full items-center justify-center rounded-full bg-void/90 text-gold-bright backdrop-blur-sm transition-shadow enabled:hover:gold-glow disabled:cursor-not-allowed disabled:opacity-30'
      >
        {errored ? (
          <Music className='h-5 w-5 text-parchment/40' />
        ) : playing ? (
          <Pause className='h-4 w-4 text-hextech-blue' />
        ) : (
          <Play className='h-4 w-4 text-gold-bright' />
        )}
      </button>
    </div>
  );
}
