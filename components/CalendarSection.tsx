import CalendarViews from "@/components/CalendarViews";
import { demoActivities } from "@/lib/content";
import type { Activity, AttendanceResponse } from "@/lib/types";
import { createClient } from "@/lib/supabase/server";

export default async function CalendarSection() {
  let activities: Activity[] = demoActivities;
  let isApprovedMember = false;
  let attendanceByActivity: Record<string, AttendanceResponse> = {};
  const supabase = await createClient();

  if (supabase) {
    const { data: { user } } = await supabase.auth.getUser();
    if (user) {
      const { data: profile } = await supabase.from("profiles").select("status").eq("id", user.id).maybeSingle();
      isApprovedMember = profile?.status === "aprovado";
      if (isApprovedMember) {
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
  const currentYear = Number(new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
  }).format(now));

  return (
    <section className="section calendar-section" id="calendario">
      <div className="container">
        <div className="section-heading">
          <div><p className="eyebrow">Cronograma</p><h2>Calendário do DK</h2></div>
          <p>Confira os próximos treinos e atividades. Alterações são publicadas diretamente pela equipe responsável.</p>
        </div>
        <CalendarViews activities={activities} upcomingActivities={upcomingActivities} isApprovedMember={isApprovedMember} attendanceByActivity={attendanceByActivity} initialYear={currentYear} />
      </div>
    </section>
  );
}
