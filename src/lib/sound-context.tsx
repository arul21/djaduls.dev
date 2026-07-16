"use client";

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { useMotionValue, type MotionValue } from "framer-motion";

const STORAGE_KEY = "djaduls-sound-muted";

type SoundContextValue = {
  muted: boolean;
  toggleMuted: () => void;
  playClick: () => void;
  playHover: () => void;
  playFanfare: () => void;
  playWarp: () => void;
  audioLevel: MotionValue<number>;
  registerAudioElement: (audio: HTMLAudioElement) => void;
};

const SoundContext = createContext<SoundContextValue | null>(null);

const PENTAKILL_SRC = "/audio/pentakill-lol.mp3";

export function SoundProvider({ children }: { children: React.ReactNode }) {
  const [muted, setMuted] = useState(true);
  const ctxRef = useRef<AudioContext | null>(null);
  const fanfareAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioLevel = useMotionValue(0);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const levelDataRef = useRef<Uint8Array<ArrayBuffer> | null>(null);
  const levelRafRef = useRef<number | null>(null);
  const registeredElRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const stored = window.localStorage.getItem(STORAGE_KEY);
    // eslint-disable-next-line react-hooks/set-state-in-effect -- syncing from localStorage, unavailable during SSR
    setMuted(stored === null ? true : stored === "1");
  }, []);

  const toggleMuted = useCallback(() => {
    setMuted((prev) => {
      const next = !prev;
      window.localStorage.setItem(STORAGE_KEY, next ? "1" : "0");
      return next;
    });
  }, []);

  const getContext = useCallback(() => {
    if (!ctxRef.current) {
      const AudioCtx =
        window.AudioContext ||
        (window as unknown as { webkitAudioContext: typeof AudioContext })
          .webkitAudioContext;
      ctxRef.current = new AudioCtx();
    }
    const ctx = ctxRef.current;
    if (ctx.state === "suspended") ctx.resume();
    return ctx;
  }, []);

  const playTone = useCallback(
    (
      ctx: AudioContext,
      {
        startTime,
        type,
        startFreq,
        endFreq,
        duration,
        peakGain,
      }: {
        startTime: number;
        type: OscillatorType;
        startFreq: number;
        endFreq: number;
        duration: number;
        peakGain: number;
      }
    ) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(startFreq, startTime);
      osc.frequency.exponentialRampToValueAtTime(endFreq, startTime + duration);
      gain.gain.setValueAtTime(0.0001, startTime);
      gain.gain.exponentialRampToValueAtTime(peakGain, startTime + duration * 0.15);
      gain.gain.exponentialRampToValueAtTime(0.0001, startTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start(startTime);
      osc.stop(startTime + duration + 0.02);
    },
    []
  );

  const playClick = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getContext();
      playTone(ctx, {
        startTime: ctx.currentTime,
        type: "triangle",
        startFreq: 720,
        endFreq: 280,
        duration: 0.14,
        peakGain: 0.18,
      });
    } catch {
      // Web Audio unavailable — sound is a non-essential enhancement.
    }
  }, [muted, getContext, playTone]);

  const playHover = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getContext();
      playTone(ctx, {
        startTime: ctx.currentTime,
        type: "sine",
        startFreq: 1100,
        endFreq: 1400,
        duration: 0.07,
        peakGain: 0.06,
      });
    } catch {
      // Web Audio unavailable — sound is a non-essential enhancement.
    }
  }, [muted, getContext, playTone]);

  const playSynthFanfare = useCallback(() => {
    try {
      const ctx = getContext();
      const now = ctx.currentTime;
      const notes = [523, 659, 784, 1047]; // C5, E5, G5, C6 — a bright victory arpeggio
      notes.forEach((freq, i) => {
        playTone(ctx, {
          startTime: now + i * 0.11,
          type: "triangle",
          startFreq: freq,
          endFreq: freq,
          duration: 0.28,
          peakGain: 0.16,
        });
      });
    } catch {
      // Web Audio unavailable — sound is a non-essential enhancement.
    }
  }, [getContext, playTone]);

  const playFanfare = useCallback(() => {
    if (muted) return;
    try {
      if (!fanfareAudioRef.current) {
        fanfareAudioRef.current = new Audio(PENTAKILL_SRC);
      }
      const audio = fanfareAudioRef.current;
      audio.currentTime = 0;
      audio.volume = 0.7;
      audio.play()?.catch(() => playSynthFanfare());
    } catch {
      playSynthFanfare();
    }
  }, [muted, playSynthFanfare]);

  const playWarp = useCallback(() => {
    if (muted) return;
    try {
      const ctx = getContext();
      const now = ctx.currentTime;
      // Two detuned saws sweeping upward — a rising "sucked into the void" whoosh.
      [0, 7].forEach((detune) => {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = "sawtooth";
        osc.detune.setValueAtTime(detune, now);
        osc.frequency.setValueAtTime(70, now);
        osc.frequency.exponentialRampToValueAtTime(640, now + 1.9);
        gain.gain.setValueAtTime(0.0001, now);
        gain.gain.exponentialRampToValueAtTime(0.08, now + 0.4);
        gain.gain.exponentialRampToValueAtTime(0.0001, now + 2.05);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 2.1);
      });
    } catch {
      // Web Audio unavailable — sound is a non-essential enhancement.
    }
  }, [muted, getContext]);

  const registerAudioElement = useCallback(
    (audio: HTMLAudioElement) => {
      if (registeredElRef.current === audio) return;
      registeredElRef.current = audio;
      try {
        const ctx = getContext();
        const source = ctx.createMediaElementSource(audio);
        const analyser = ctx.createAnalyser();
        analyser.fftSize = 128;
        analyser.smoothingTimeConstant = 0.82;
        source.connect(analyser);
        analyser.connect(ctx.destination);
        analyserRef.current = analyser;
        levelDataRef.current = new Uint8Array(
          analyser.frequencyBinCount
        ) as Uint8Array<ArrayBuffer>;

        const tick = () => {
          const data = levelDataRef.current;
          if (analyserRef.current && data) {
            analyserRef.current.getByteFrequencyData(data);
            let sum = 0;
            for (let i = 0; i < data.length; i++) sum += data[i];
            audioLevel.set(sum / data.length / 255);
          }
          levelRafRef.current = requestAnimationFrame(tick);
        };
        tick();
      } catch {
        // Web Audio graph unavailable — the visual pulse is a non-essential enhancement.
      }
    },
    [getContext, audioLevel]
  );

  useEffect(() => {
    return () => {
      if (levelRafRef.current !== null) cancelAnimationFrame(levelRafRef.current);
    };
  }, []);

  const value = useMemo(
    () => ({
      muted,
      toggleMuted,
      playClick,
      playHover,
      playFanfare,
      playWarp,
      audioLevel,
      registerAudioElement,
    }),
    [
      muted,
      toggleMuted,
      playClick,
      playHover,
      playFanfare,
      playWarp,
      audioLevel,
      registerAudioElement,
    ]
  );

  return (
    <SoundContext.Provider value={value}>{children}</SoundContext.Provider>
  );
}

export function useSound() {
  const ctx = useContext(SoundContext);
  if (!ctx) throw new Error("useSound must be used within a SoundProvider");
  return ctx;
}
