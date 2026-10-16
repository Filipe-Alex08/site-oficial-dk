export type MemberBirthday = { user_id: string; nickname: string; month: number; day: number };

export function saoPauloDate(now = new Date()) {
  const parts = new Intl.DateTimeFormat("en-US", { timeZone: "America/Sao_Paulo", month: "numeric", day: "numeric" }).formatToParts(now);
  return { month: Number(parts.find((part) => part.type === "month")?.value), day: Number(parts.find((part) => part.type === "day")?.value) };
}

export function birthdayLabel(birthDate?: string | null, now = new Date()) {
  if (!birthDate) return null;
  const [, month, day] = birthDate.split("-").map(Number);
  const today = saoPauloDate(now);
  if (month !== today.month) return null;
  return day === today.day ? "Aniversariante de hoje" : "Aniversariante do mês";
}
