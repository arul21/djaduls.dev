export type AchievementId =
  | "explorer"
  | "deep-diver"
  | "combo-master"
  | "summoner-verified"
  | "collector";

export const ACHIEVEMENTS: Record<
  AchievementId,
  { title: string; description: string }
> = {
  explorer: {
    title: "Explorer",
    description: "Viewed every tab on the Rift.",
  },
  "deep-diver": {
    title: "Deep Diver",
    description: "Scrolled all the way to the footer.",
  },
  "combo-master": {
    title: "Combo Master",
    description: "Shattered 3 crystals in quick succession.",
  },
  "summoner-verified": {
    title: "Summoner Verified",
    description: "Completed a full recall channel.",
  },
  collector: {
    title: "Collector",
    description: "Downloaded the Summoner Card.",
  },
};
