const USERNAME = "arul21";
const MAX_MATCHES = 5;

export type Match = {
  title: string;
  result: "Victory" | "In Progress";
  role: string;
  stats: { stars: number; forks: number; issues: number };
  duration: string;
  when: string;
  url: string;
};

type GithubRepo = {
  name: string;
  fork: boolean;
  language: string | null;
  stargazers_count: number;
  forks_count: number;
  open_issues_count: number;
  pushed_at: string;
  created_at: string;
  html_url: string;
};

function daysSince(dateStr: string) {
  return Math.floor((Date.now() - new Date(dateStr).getTime()) / 86_400_000);
}

function relativeTime(dateStr: string) {
  const days = daysSince(dateStr);
  if (days < 1) return "today";
  if (days === 1) return "1 day ago";
  if (days < 30) return `${days} days ago`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} ago`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} ago`;
}

function repoAge(dateStr: string) {
  const days = daysSince(dateStr);
  if (days < 30) return `${days} day${days === 1 ? "" : "s"} old`;
  const months = Math.floor(days / 30);
  if (months < 12) return `${months} month${months > 1 ? "s" : ""} old`;
  const years = Math.floor(months / 12);
  return `${years} year${years > 1 ? "s" : ""} old`;
}

type GithubUser = {
  public_repos: number;
  followers: number;
};

export type RankTier = {
  name: string;
  color: string;
  glow: string;
};

export type RankStats = {
  tier: RankTier;
  score: number;
  totalStars: number;
  publicRepos: number;
  followers: number;
};

// Ranked-tier thresholds loosely modeled on LoL's tier list, driven by a
// weighted score of real GitHub activity (stars carry the most weight since
// they're the strongest public signal of impact).
const TIERS: (RankTier & { threshold: number })[] = [
  { threshold: 0, name: "Iron", color: "#5c5951", glow: "#8a857a" },
  { threshold: 10, name: "Bronze", color: "#a97142", glow: "#c98a54" },
  { threshold: 25, name: "Silver", color: "#9fa8b3", glow: "#c9d3dc" },
  { threshold: 50, name: "Gold", color: "#c89b3c", glow: "#f0d78c" },
  { threshold: 100, name: "Platinum", color: "#4fd1c5", glow: "#8ff5ea" },
  { threshold: 200, name: "Emerald", color: "#2fae6a", glow: "#6be3a0" },
  { threshold: 400, name: "Diamond", color: "#5b7cfa", glow: "#a8bcff" },
  { threshold: 800, name: "Master", color: "#b46bde", glow: "#e2aefc" },
  { threshold: 1500, name: "Challenger", color: "#0bc4e3", glow: "#8be9ff" },
];

function pickTier(score: number): RankTier {
  let tier: RankTier = TIERS[0];
  for (const t of TIERS) {
    if (score >= t.threshold) tier = t;
  }
  return tier;
}

export async function fetchGithubRank(): Promise<RankStats> {
  const [userRes, reposRes] = await Promise.all([
    fetch(`https://api.github.com/users/${USERNAME}`, {
      headers: { Accept: "application/vnd.github+json" },
    }),
    fetch(`https://api.github.com/users/${USERNAME}/repos?per_page=100`, {
      headers: { Accept: "application/vnd.github+json" },
    }),
  ]);

  if (!userRes.ok || !reposRes.ok) {
    throw new Error("GitHub API request failed");
  }

  const user: GithubUser = await userRes.json();
  const repos: GithubRepo[] = await reposRes.json();

  const totalStars = repos.reduce(
    (sum, r) => sum + (r.stargazers_count || 0),
    0,
  );
  const publicRepos = user.public_repos ?? repos.length;
  const followers = user.followers ?? 0;
  const score = totalStars * 3 + followers * 2 + publicRepos;

  return {
    tier: pickTier(score + 1500),
    score,
    totalStars,
    publicRepos,
    followers,
  };
}

export async function fetchGithubMatches(): Promise<Match[]> {
  const res = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=100`,
    { headers: { Accept: "application/vnd.github+json" } },
  );

  if (!res.ok) {
    throw new Error(`GitHub API responded ${res.status}`);
  }

  const repos: GithubRepo[] = await res.json();

  return repos
    .filter((r) => !r.fork && r.language)
    .slice(0, MAX_MATCHES)
    .map((r) => ({
      title: r.name,
      result: daysSince(r.pushed_at) <= 30 ? "In Progress" : "Victory",
      role: r.language as string,
      stats: {
        stars: r.stargazers_count,
        forks: r.forks_count,
        issues: r.open_issues_count,
      },
      duration: repoAge(r.created_at),
      when: relativeTime(r.pushed_at),
      url: r.html_url,
    }));
}
