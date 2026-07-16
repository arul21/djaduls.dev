export type SummonerCardData = {
  name: string;
  alias: string;
  title: string;
  role: string;
  level: number;
  avatarSrc: string;
  stats: { label: string; value: number }[];
  rank: { name: string; color: string; glow: string } | null;
};

const WIDTH = 800;
const HEIGHT = 450;

function loadImage(src: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}

function drawCoverImage(
  ctx: CanvasRenderingContext2D,
  img: HTMLImageElement,
  cx: number,
  cy: number,
  radius: number
) {
  const scale = Math.max((radius * 2) / img.width, (radius * 2) / img.height);
  const w = img.width * scale;
  const h = img.height * scale;
  ctx.drawImage(img, cx - w / 2, cy - h / 2, w, h);
}

function fontFamily(cssVar: string, fallback: string) {
  const value = getComputedStyle(document.documentElement)
    .getPropertyValue(cssVar)
    .trim();
  return value || fallback;
}

export async function renderSummonerCard(
  data: SummonerCardData
): Promise<HTMLCanvasElement> {
  const canvas = document.createElement("canvas");
  canvas.width = WIDTH;
  canvas.height = HEIGHT;
  const ctx = canvas.getContext("2d");
  if (!ctx) return canvas;

  const headingFont = fontFamily("--font-cinzel", "serif");
  const monoFont = fontFamily("--font-mono", "monospace");

  await document.fonts.ready.catch(() => {});
  const avatar = await loadImage(data.avatarSrc).catch(() => null);

  // Background
  const bg = ctx.createLinearGradient(0, 0, WIDTH, HEIGHT);
  bg.addColorStop(0, "#1e2328");
  bg.addColorStop(1, "#010a13");
  ctx.fillStyle = bg;
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  // Outer frame + corner brackets
  ctx.strokeStyle = "rgba(200, 155, 60, 0.35)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(14, 14, WIDTH - 28, HEIGHT - 28);

  ctx.strokeStyle = "#c89b3c";
  ctx.lineWidth = 3;
  const bl = 26;
  const corners: [number, number, number, number][] = [
    [14, 14, 1, 1],
    [WIDTH - 14, 14, -1, 1],
    [14, HEIGHT - 14, 1, -1],
    [WIDTH - 14, HEIGHT - 14, -1, -1],
  ];
  for (const [x, y, dx, dy] of corners) {
    ctx.beginPath();
    ctx.moveTo(x, y + dy * bl);
    ctx.lineTo(x, y);
    ctx.lineTo(x + dx * bl, y);
    ctx.stroke();
  }

  // Avatar
  const avatarX = 140;
  const avatarY = HEIGHT / 2;
  const avatarR = 92;
  if (avatar) {
    ctx.save();
    ctx.beginPath();
    ctx.arc(avatarX, avatarY, avatarR, 0, Math.PI * 2);
    ctx.closePath();
    ctx.clip();
    drawCoverImage(ctx, avatar, avatarX, avatarY, avatarR);
    ctx.restore();
  }
  ctx.beginPath();
  ctx.arc(avatarX, avatarY, avatarR + 3, 0, Math.PI * 2);
  ctx.strokeStyle = "#c89b3c";
  ctx.lineWidth = 3;
  ctx.stroke();

  // Level badge
  const badgeX = avatarX + avatarR - 6;
  const badgeY = avatarY + avatarR - 6;
  ctx.beginPath();
  ctx.arc(badgeX, badgeY, 24, 0, Math.PI * 2);
  ctx.fillStyle = "#010a13";
  ctx.fill();
  ctx.strokeStyle = "#c89b3c";
  ctx.lineWidth = 2;
  ctx.stroke();
  ctx.fillStyle = "#f0d78c";
  ctx.font = `700 18px ${monoFont}`;
  ctx.textAlign = "center";
  ctx.textBaseline = "middle";
  ctx.fillText(String(data.level), badgeX, badgeY + 1);

  // Text block
  const textX = 280;
  ctx.textAlign = "left";
  ctx.textBaseline = "alphabetic";

  ctx.fillStyle = "#0bc4e3";
  ctx.font = `600 15px ${monoFont}`;
  ctx.fillText(data.role.toUpperCase(), textX, 88);

  ctx.fillStyle = "#f0d78c";
  ctx.font = `800 44px ${headingFont}`;
  ctx.fillText(data.name, textX, 138);

  ctx.fillStyle = "#c89b3c";
  ctx.font = `600 22px ${headingFont}`;
  ctx.fillText(`"${data.alias}"`, textX, 170);

  ctx.fillStyle = "rgba(205, 190, 145, 0.75)";
  ctx.font = `italic 15px ${monoFont}`;
  ctx.fillText(data.title, textX, 195);

  if (data.rank) {
    ctx.fillStyle = data.rank.glow;
    ctx.font = `700 14px ${monoFont}`;
    ctx.fillText(`RANK · ${data.rank.name.toUpperCase()}`, textX, 222);
  }

  // Stat bars
  const barW = 460;
  let statY = data.rank ? 252 : 232;
  for (const stat of data.stats) {
    ctx.fillStyle = "rgba(205, 190, 145, 0.7)";
    ctx.font = `600 11px ${monoFont}`;
    ctx.textAlign = "left";
    ctx.fillText(stat.label.toUpperCase(), textX, statY);
    ctx.textAlign = "right";
    ctx.fillText(`${stat.value}/100`, textX + barW, statY);

    const barY = statY + 7;
    ctx.fillStyle = "rgba(0, 0, 0, 0.5)";
    ctx.fillRect(textX, barY, barW, 7);

    const grad = ctx.createLinearGradient(textX, 0, textX + barW, 0);
    grad.addColorStop(0, "#a97142");
    grad.addColorStop(1, "#0bc4e3");
    ctx.fillStyle = grad;
    ctx.fillRect(textX, barY, barW * (stat.value / 100), 7);

    statY += 34;
  }

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(205, 190, 145, 0.5)";
  ctx.font = `600 12px ${monoFont}`;
  ctx.fillText("djaduls.dev", WIDTH - 32, HEIGHT - 28);

  return canvas;
}
