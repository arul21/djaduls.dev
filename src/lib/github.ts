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

export async function fetchGithubMatches(): Promise<Match[]> {
  const res = await fetch(
    `https://api.github.com/users/${USERNAME}/repos?sort=pushed&per_page=100`,
    { headers: { Accept: "application/vnd.github+json" } }
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
