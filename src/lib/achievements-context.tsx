"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
} from "react";
import type { AchievementId } from "./achievements";
import { useSound } from "./sound-context";

const STORAGE_KEY = "djaduls-achievements";

export type Toast = { id: AchievementId; key: number };

type AchievementsContextValue = {
  unlock: (id: AchievementId) => void;
  toasts: Toast[];
};

const AchievementsContext = createContext<AchievementsContextValue | null>(
  null
);

function readUnlocked(): Set<AchievementId> {
  if (typeof window === "undefined") return new Set();
  try {
    const stored = JSON.parse(
      window.localStorage.getItem(STORAGE_KEY) || "[]"
    );
    return new Set(stored);
  } catch {
    return new Set();
  }
}

export function AchievementsProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const { playAchievement } = useSound();
  const unlockedRef = useRef<Set<AchievementId> | null>(null);
  if (unlockedRef.current === null) unlockedRef.current = readUnlocked();
  const [toasts, setToasts] = useState<Toast[]>([]);
  const keyRef = useRef(0);

  const unlock = useCallback(
    (id: AchievementId) => {
      const unlocked = unlockedRef.current!;
      if (unlocked.has(id)) return;
      unlocked.add(id);
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify([...unlocked])
      );
      const key = keyRef.current++;
      setToasts((prev) => [...prev, { id, key }]);
      playAchievement();
      setTimeout(() => {
        setToasts((prev) => prev.filter((t) => t.key !== key));
      }, 4000);
    },
    [playAchievement]
  );

  const value = useMemo(() => ({ unlock, toasts }), [unlock, toasts]);

  return (
    <AchievementsContext.Provider value={value}>
      {children}
    </AchievementsContext.Provider>
  );
}

export function useAchievements() {
  const ctx = useContext(AchievementsContext);
  if (!ctx) {
    throw new Error(
      "useAchievements must be used within an AchievementsProvider"
    );
  }
  return ctx;
}
