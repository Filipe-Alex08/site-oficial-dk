import CalendarViews from "@/components/CalendarViews";
import { saoPauloDate, type MemberBirthday } from "@/lib/birthdays";
import type { Activity, AttendanceResponse } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";

function googleCalendarPublicUrl() {
  const value = process.env.GOOGLE_CALENDAR_PUBLIC_URL?.trim();
  if (!value) return null;
  try {
    const url = new URL(value);
    return url.protocol === "https:" ? url.href : null;
  } catch {
    return null;
  }
}

export default async function CalendarSection() {
  let activities: Activity[] = [];
  let isApprovedMember = false;
  let birthdays: MemberBirthday[] = [];
  let birthdaysUnavailable = false;
  let attendanceByActivity: Record<string, AttendanceResponse> = {};
  const supabase = await createClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
      isApprovedMember = profile?.status === "aprovado";
      if (isApprovedMember) {
        const { data: birthdayData, error: birthdayError } = await supabase.rpc("get_member_birthdays");
        birthdays = (birthdayData ?? []) as MemberBirthday[];
        if (birthdayError) {
          // This branch runs only after verifying the user's approved membership.
          // Older databases can use the server credentials without exposing full dates.
          const admin = createAdminClient();
          birthdaysUnavailable = true;
          if (admin) {
            const loaded: MemberBirthday[] = [];
            for (let from = 0; ; from += 500) {
              const { data, error } = await admin.from("profiles")
                .select("id,nickname,birth_date").eq("status", "aprovado")
                .not("birth_date", "is", null).order("id").range(from, from + 499);
              if (error) break;
              for (const member of data ?? []) {
                const [, month, day] = String(member.birth_date).split("-").map(Number);
                loaded.push({ user_id: member.id, nickname: member.nickname, month, day });
              }
              if (!data || data.length < 500) {
                birthdays = loaded.sort((a, b) => a.month - b.month || a.day - b.day || a.nickname.localeCompare(b.nickname, "pt-BR"));
                birthdaysUnavailable = false;
                break;
              }
            }
          }
        }
        const { data: responses } = await supabase.from("activity_attendance").select("activity_id,response").eq("user_id", user.id);
        attendanceByActivity = Object.fromEntries((responses ?? []).map((entry) => [entry.activity_id, entry.response as AttendanceResponse]));
      }
    }
    const { data } = await supabase
      .from("activities")
      .select("*")
      .order("starts_at");
    activities = (data ?? []) as Activity[];
  }

  const now = new Date();
  const upcomingActivities = activities
    .filter((activity) => new Date(activity.starts_at) >= now)
    .slice(0, 8);
  const activeNotices = activities
    .filter((activity) => activity.notice_message && activity.notice_expires_at && new Date(activity.notice_expires_at) > now)
    .sort((a, b) => new Date(b.notice_published_at || 0).getTime() - new Date(a.notice_published_at || 0).getTime());
  const currentYear = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(now));

  return (
    <section className="section calendar-section" id="calendario">
      <div className="container">
        <div className="section-heading">
          <h2>Calendário do DK</h2>
        </div>
        <CalendarViews activities={activities} upcomingActivities={upcomingActivities} activeNotices={activeNotices} isApprovedMember={isApprovedMember} attendanceByActivity={attendanceByActivity} initialYear={currentYear} birthdays={isApprovedMember ? birthdays : []} birthdaysUnavailable={isApprovedMember && birthdaysUnavailable} currentMonth={saoPauloDate(now).month} googleCalendarUrl={googleCalendarPublicUrl()} />
      </div>
    </section>
  );
}
