export function getAgeProgress(birthDateIso: string, now: Date = new Date()) {
  const [year, month, day] = birthDateIso.split("-").map(Number);
  const birthMonth = month - 1;

  const hadBirthdayThisYear =
    now.getMonth() > birthMonth ||
    (now.getMonth() === birthMonth && now.getDate() >= day);

  const age = now.getFullYear() - year - (hadBirthdayThisYear ? 0 : 1);
  const lastBirthdayYear = now.getFullYear() - (hadBirthdayThisYear ? 0 : 1);
  const lastBirthday = new Date(lastBirthdayYear, birthMonth, day);
  const nextBirthday = new Date(lastBirthdayYear + 1, birthMonth, day);

  const totalMs = nextBirthday.getTime() - lastBirthday.getTime();
  const elapsedMs = now.getTime() - lastBirthday.getTime();
  const progress = Math.min(100, Math.max(0, Math.round((elapsedMs / totalMs) * 100)));

  return { age, nextLevel: age + 1, progress };
}
