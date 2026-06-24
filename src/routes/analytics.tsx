import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAnonId } from "@/lib/anon-user";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend, CartesianGrid } from "recharts";

export const Route = createFileRoute("/analytics")({
  head: () => ({ meta: [{ title: "Analytics — CampusCare" }] }),
  component: Analytics,
});

const COLORS = ["#6366f1", "#818cf8", "#34d399", "#fb923c", "#ef4444"];

function Analytics() {
  const anonId = getAnonId();
  const { data } = useQuery({
    queryKey: ["analytics", anonId],
    queryFn: async () => {
      const [tasks, subjects, att, gpa] = await Promise.all([
        supabase.from("tasks").select("completed").eq("anonymous_user_id", anonId),
        supabase.from("subjects").select("id,name").eq("anonymous_user_id", anonId),
        supabase.from("attendance_records").select("subject_id,status").eq("anonymous_user_id", anonId),
        supabase.from("gpa_records").select("semester,credit_hours,grade_point").eq("anonymous_user_id", anonId),
      ]);
      const t = tasks.data ?? [];
      const completed = t.filter((x) => x.completed).length;
      const pending = t.length - completed;
      const subs = subjects.data ?? [];
      const attBySubject = subs.map((s) => {
        const rs = (att.data ?? []).filter((r) => r.subject_id === s.id);
        const present = rs.filter((r) => r.status === "present").length;
        return { name: s.name.slice(0, 12), pct: rs.length ? Math.round((present / rs.length) * 100) : 0 };
      });
      const gpaRows = gpa.data ?? [];
      const semMap = new Map<string, { cr: number; pts: number }>();
      gpaRows.forEach((r) => {
        const sem = r.semester ?? "Unspecified";
        const cur = semMap.get(sem) ?? { cr: 0, pts: 0 };
        cur.cr += Number(r.credit_hours);
        cur.pts += Number(r.credit_hours) * Number(r.grade_point);
        semMap.set(sem, cur);
      });
      const gpaBySem = Array.from(semMap.entries()).map(([sem, v]) => ({ semester: sem, gpa: v.cr ? +(v.pts / v.cr).toFixed(2) : 0 }));
      return {
        taskPie: [
          { name: "Completed", value: completed },
          { name: "Pending", value: pending },
        ],
        attBySubject,
        gpaBySem,
        totals: { tasks: t.length, subjects: subs.length, records: att.data?.length ?? 0 },
      };
    },
  });

  return (
    <PageContainer>
      <PageHeader title="Analytics" subtitle="Patterns and progress at a glance." />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        <Mini label="Tasks" value={data?.totals.tasks ?? 0} />
        <Mini label="Subjects" value={data?.totals.subjects ?? 0} />
        <Mini label="Attendance entries" value={data?.totals.records ?? 0} />
        <Mini label="Semesters tracked" value={data?.gpaBySem.length ?? 0} />
      </div>

      <div className="grid lg:grid-cols-2 gap-5">
        <Card title="Task completion">
          <ResponsiveContainer width="100%" height={260}>
            <PieChart>
              <Pie data={data?.taskPie ?? []} dataKey="value" nameKey="name" innerRadius={55} outerRadius={90} paddingAngle={4}>
                {(data?.taskPie ?? []).map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
              </Pie>
              <Legend />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
            </PieChart>
          </ResponsiveContainer>
        </Card>

        <Card title="Attendance % by subject">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.attBySubject ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="name" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} domain={[0, 100]} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Bar dataKey="pct" fill="#6366f1" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        <Card title="GPA by semester" className="lg:col-span-2">
          <ResponsiveContainer width="100%" height={260}>
            <BarChart data={data?.gpaBySem ?? []}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--color-border)" />
              <XAxis dataKey="semester" stroke="var(--color-muted-foreground)" fontSize={11} />
              <YAxis stroke="var(--color-muted-foreground)" fontSize={11} domain={[0, 4]} />
              <Tooltip contentStyle={{ background: "var(--color-card)", border: "1px solid var(--color-border)" }} />
              <Bar dataKey="gpa" fill="#818cf8" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>
    </PageContainer>
  );
}

function Mini({ label, value }: { label: string; value: number }) {
  return (
    <div className="glass-card p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="text-2xl font-bold mt-1">{value}</div>
    </div>
  );
}

function Card({ title, children, className = "" }: { title: string; children: React.ReactNode; className?: string }) {
  return (
    <div className={`glass-card p-5 ${className}`}>
      <h3 className="font-semibold mb-3">{title}</h3>
      {children}
    </div>
  );
}
