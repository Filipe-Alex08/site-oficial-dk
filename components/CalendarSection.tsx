import CalendarViews from "@/components/CalendarViews";
import LiveRefresh from "@/components/LiveRefresh";
import { saoPauloDate, type MemberBirthday } from "@/lib/birthdays";
import type { Activity, AttendanceResponse } from "@/lib/types";
import { createAdminClient } from "@/lib/supabase/admin";
import { getMember, getSupabase } from "@/lib/viewer";

export default async function CalendarSection() {
  let activities: Activity[] = [];
  let isApprovedMember = false;
  let birthdays: MemberBirthday[] = [];
  let birthdaysUnavailable = false;
  let attendanceByActivity: Record<string, AttendanceResponse> = {};
  const supabase = await getSupabase();

  if (supabase) {
    // As atividades são públicas e não dependem do usuário: a consulta parte
    // junto com a verificação de sessão em vez de esperar por ela.
    const activitiesRequest = supabase.from("activities").select("*").order("starts_at");
    const [{ user, profile }, { data }] = await Promise.all([getMember(), activitiesRequest]);
    activities = (data ?? []) as Activity[];

    isApprovedMember = profile?.status === "aprovado";
    if (user && isApprovedMember) {
      const [birthdayResult, { data: responses }] = await Promise.all([
        supabase.rpc("get_member_birthdays"),
        supabase.from("activity_attendance").select("activity_id,response").eq("user_id", user.id),
      ]);
      birthdays = (birthdayResult.data ?? []) as MemberBirthday[];
      if (birthdayResult.error) {
        // This branch runs only after verifying the user's approved membership.
        // Older databases can use the server credentials without exposing full dates.
        const admin = createAdminClient();
        birthdaysUnavailable = true;
        if (admin) {
          const loaded: MemberBirthday[] = [];
          for (let from = 0; ; from += 500) {
            const { data: page, error } = await admin.from("profiles")
              .select("id,nickname,birth_date").eq("status", "aprovado")
              .not("birth_date", "is", null).order("id").range(from, from + 499);
            if (error) break;
            for (const member of page ?? []) {
              const [, month, day] = String(member.birth_date).split("-").map(Number);
              loaded.push({ user_id: member.id, nickname: member.nickname, month, day });
            }
            if (!page || page.length < 500) {
              birthdays = loaded.sort((a, b) => a.month - b.month || a.day - b.day || a.nickname.localeCompare(b.nickname, "pt-BR"));
              birthdaysUnavailable = false;
              break;
            }
          }
        }
      }
      attendanceByActivity = Object.fromEntries((responses ?? []).map((entry) => [entry.activity_id, entry.response as AttendanceResponse]));
    }
  }

  const now = new Date();
  const upcomingActivities = activities
    .filter((activity) => new Date(activity.starts_at) >= now)
    .slice(0, 8);
  const currentYear = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(now));

  return (
    <section className="section calendar-section" id="calendario">
      <LiveRefresh tables={["activities", "activity_attendance"]} />
      <div className="container">
        <div className="section-heading">
          <h2>Calendário do DK</h2>
        </div>
        <CalendarViews activities={activities} upcomingActivities={upcomingActivities} isApprovedMember={isApprovedMember} attendanceByActivity={attendanceByActivity} initialYear={currentYear} birthdays={isApprovedMember ? birthdays : []} birthdaysUnavailable={isApprovedMember && birthdaysUnavailable} currentMonth={saoPauloDate(now).month} />
      </div>
    </section>
  );
}
