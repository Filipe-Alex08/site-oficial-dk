const TIME_ZONE = "America/Sao_Paulo";

const dayKey = new Intl.DateTimeFormat("en-CA", { timeZone: TIME_ZONE, year: "numeric", month: "2-digit", day: "2-digit" });
const relative = new Intl.RelativeTimeFormat("pt-BR", { numeric: "auto" });

/** Dias de calendário (no fuso de São Paulo) entre `now` e `target`. Negativo = passado. */
export function calendarDaysBetween(target: Date | string, now: Date = new Date()): number {
  const toUtcDay = (date: Date) => {
    const [year, month, day] = dayKey.format(date).split("-").map(Number);
    return Date.UTC(year, month - 1, day);
  };
  return Math.round((toUtcDay(new Date(target)) - toUtcDay(now)) / 86_400_000);
}

/** "hoje", "amanhã", "em 3 dias"… relativo ao dia do calendário, não a 24 horas. */
export function relativeDayLabel(target: Date | string, now: Date = new Date()): string {
  return relative.format(calendarDaysBetween(target, now), "day");
}
