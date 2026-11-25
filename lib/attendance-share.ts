import type { Activity, AttendanceEntry, DkRank, RosterEntry } from "@/lib/types";

export const dateOptions: Intl.DateTimeFormatOptions = {
  day: "2-digit",
  month: "2-digit",
  year: "numeric",
  timeZone: "America/Sao_Paulo",
};

export function activityTime(activity: Activity) {
  const start = new Date(activity.starts_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  if (!activity.ends_at) return start;
  const end = new Date(activity.ends_at).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit", timeZone: "America/Sao_Paulo" });
  return `${start} às ${end}`;
}

export function responseLine(entry: AttendanceEntry, index: number) {
  const guests = entry.guest_count ? ` +${entry.guest_count} ${entry.guest_count === 1 ? "convidado" : "convidados"}` : "";
  const note = entry.note ? ` (${entry.note})` : "";
  return `${index + 1}. ${entry.nickname}${guests}${note}`;
}

/** Placar da lista: membros que vão (e os convidados deles), que não vão e os que ainda não responderam. */
export function attendanceTally(entries: AttendanceEntry[], roster: RosterEntry[]) {
  const going = entries.filter((entry) => entry.response === "vai");
  const answered = new Set(entries.map((entry) => entry.user_id));
  return {
    going: going.length,
    guests: going.reduce((total, entry) => total + entry.guest_count, 0),
    notGoing: entries.filter((entry) => entry.response === "nao_vai").length,
    // O roster só tem membros aprovados: quem está nele e não respondeu está pendente.
    pending: roster.filter((member) => !answered.has(member.user_id)).sort((a, b) => a.nickname.localeCompare(b.nickname)),
  };
}

// Títulos copiados da lista manual do grupo, da maior patente para a menor.
const invocationGroups: Array<{ title: string; ranks: DkRank[] }> = [
  { title: "⚜️GENERAL:", ranks: ["general_exercito", "general_divisao", "general_brigada"] },
  { title: "🌟CORONEL:", ranks: ["coronel"] },
  { title: "🌟TENENTE-CORONEL:", ranks: ["tenente_coronel"] },
  { title: "🌟MAJOR:", ranks: ["major"] },
  { title: "⭐CAPITÃES:", ranks: ["capitao"] },
  { title: "⭐TENENTE", ranks: ["tenente"] },
  { title: "✴️*SUBTENENTE:*", ranks: ["subtenente"] },
  { title: "1° SARGENTO:", ranks: ["primeiro_sargento"] },
  { title: "2° SARGENTO:", ranks: ["segundo_sargento"] },
  { title: "3° SARGENTO:", ranks: ["terceiro_sargento"] },
  { title: "CABO:", ranks: ["cabo"] },
  { title: "SOLDADO", ranks: ["soldado"] },
  { title: "Recruta:", ranks: ["recruta"] },
];

export function buildShareText(activity: Activity, entries: AttendanceEntry[], roster: RosterEntry[]) {
  const attending = entries.filter((entry) => entry.response === "vai").sort((a, b) => a.nickname.localeCompare(b.nickname));
  const absent = entries.filter((entry) => entry.response === "nao_vai").sort((a, b) => a.nickname.localeCompare(b.nickname));
  const lines = [
    "🏴‍☠️Death Knights🏴‍☠️",
    `💀- ${activity.title} -💀`,
    "",
    `📅 Data: ${new Date(activity.starts_at).toLocaleDateString("pt-BR", dateOptions)}`,
    `⏰ Horário: ${activityTime(activity)}`,
    `📍 Local: ${activity.location}`,
    "",
    "✅ Lista de presença:",
    ...(attending.length ? attending.map(responseLine) : ["Nenhuma confirmação até o momento."]),
    "",
    "❌ Não poderão ir:",
    ...(absent.length ? absent.map(responseLine) : ["Nenhuma ausência informada até o momento."]),
    "",
    "💀👁️‍🗨️INVOCAÇÃO DK👁️‍🗨️💀",
  ];

  for (const { title, ranks } of invocationGroups) {
    const members = ranks.flatMap((rank) => roster.filter((member) => member.rank === rank));
    if (!members.length) continue;
    // "Apelido> " deixa a linha pronta para quem envia digitar o @ e escolher a pessoa.
    lines.push("", title, ...members.map((member) => `${member.nickname}> `));
  }

  return lines.join("\n");
}

// Não use wa.me aqui: o redirecionamento dele troca todos os emojis por "�".
export function whatsappShareUrl(text: string) {
  return `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
}
