export const champion = {
  name: "Khairul Baharuddin",
  alias: "DJADULS",
  title: "The Full-Stack Vanguard",
  birthDate: "1988-04-21",
  role: "Software Engineer",
  resource: "Mana → Coffee",
  quote: '"Ship it, then make it beautiful."',
};

export type Stat = {
  key: string;
  label: string;
  value: number;
  icon: string;
  description: string;
};

export const stats: Stat[] = [
  {
    key: "backend",
    label: "Backend",
    value: 90,
    icon: "⚙️",
    description: "APIs, databases, and server architecture that hold the line.",
  },
  {
    key: "mobile",
    label: "Mobile",
    value: 85,
    icon: "📱",
    description:
      "Cross-platform apps built for reach without sacrificing feel.",
  },
  {
    key: "frontend",
    label: "Frontend",
    value: 75,
    icon: "🎨",
    description:
      "Interfaces that feel as good as they look — pixel-precise execution.",
  },

  {
    key: "devops",
    label: "DevOps",
    value: 80,
    icon: "🛠️",
    description:
      "CI/CD, containers, and infrastructure that ships without drama.",
  },
];

export type Ability = {
  key: "Q" | "W" | "E" | "R";
  name: string;
  cooldown: string;
  description: string;
  tags: string[];
};

export const abilities: Ability[] = [
  {
    key: "Q",
    name: "Rapid Prototype",
    cooldown: "1-2 days",
    description:
      "Fires a fast, functional MVP straight at the problem. Low cost, high impact — validates ideas before committing resources.",
    tags: ["Next.js", "React", "Prototyping"],
  },
  {
    key: "W",
    name: "API Fortress",
    cooldown: "3-5 days",
    description:
      "Erects a secure, scalable backend structure. Grants the team a shield of clean architecture and typed contracts.",
    tags: ["Node.js", "REST/GraphQL", "PostgreSQL"],
  },
  {
    key: "E",
    name: "Pixel Dash",
    cooldown: "Passive",
    description:
      "Dashes through design-to-code handoff, leaving behind pixel-perfect, responsive UI in its wake.",
    tags: ["Tailwind CSS", "Framer Motion", "UI/UX"],
  },
  {
    key: "R",
    name: "Deploy Ultimate",
    cooldown: "On demand",
    description:
      "Channels the full build pipeline — tests, containers, and infra — then unleashes it live to production.",
    tags: ["Docker", "CI/CD", "Cloud"],
  },
];

export type QuestStatus = "Selesai" | "Dalam Pengerjaan";

export type Quest = {
  title: string;
  status: QuestStatus;
  difficulty: 1 | 2 | 3 | 4 | 5;
  description: string;
  rewards: string[];
  demoUrl?: string;
  githubUrl?: string;
};

export const quests: Quest[] = [
  {
    title: "Project Aetherion — E-Commerce Platform",
    status: "Selesai",
    difficulty: 4,
    description:
      "A full-stack marketplace with real-time inventory, payments, and an admin nexus for order management.",
    rewards: ["Next.js", "Stripe", "PostgreSQL", "Redis"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    title: "Rift Analytics — Realtime Dashboard",
    status: "Selesai",
    difficulty: 3,
    description:
      "A live analytics dashboard streaming metrics via WebSockets, with animated charts and drill-down reports.",
    rewards: ["React", "WebSockets", "D3.js", "Node.js"],
    demoUrl: "#",
    githubUrl: "#",
  },
  {
    title: "Nomad Companion — Mobile App",
    status: "Dalam Pengerjaan",
    difficulty: 3,
    description:
      "A cross-platform travel companion app with offline maps, itinerary sync, and push notifications.",
    rewards: ["React Native", "Expo", "Firebase"],
    githubUrl: "#",
  },
  {
    title: "Hexforge — Internal DevOps Toolkit",
    status: "Selesai",
    difficulty: 5,
    description:
      "An internal CLI + dashboard for automating deployments, secrets rotation, and infra provisioning.",
    rewards: ["Docker", "GitHub Actions", "Terraform", "Go"],
    githubUrl: "#",
  },
];

export const contacts = [
  { label: "Email", href: "mailto:hey@djaduls.dev", icon: "mail" },
  { label: "GitHub", href: "https://github.com/arul21", icon: "github" },
  {
    label: "LinkedIn",
    href: "https://linkedin.com/in/khairul-baharuddin",
    icon: "linkedin",
  },
  { label: "Resume", href: "#", icon: "scroll" },
];
