import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { getAnonId } from "@/lib/anon-user";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import {
  CheckSquare,
  BookOpen,
  CalendarCheck,
  GraduationCap,
  ArrowUpRight,
  TrendingUp,
  TrendingDown,
  Plus,
  Sparkles,
} from "lucide-react";
import { useEffect, useState } from "react";
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
} from "recharts";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — CampusCare" }] }),
  component: Dashboard,
});

function useCounter(target: number, duration = 900) {
  const [val, setVal] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const p = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - p, 3);
      setVal(target * eased);
      if (p < 1) raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [target, duration]);
  return val;
}

function StatNumber({ value, decimals = 0, suffix = "" }: { value: number; decimals?: number; suffix?: string }) {
  const v = useCounter(Number.isFinite(value) ? value : 0);
  return (
    <span className="tabular-nums">
      {v.toFixed(decimals)}
      {suffix}
    </span>
  );
}

function Dashboard() {
  const anonId = getAnonId();
  const { data, isLoading } = useQuery({
    queryKey: ["dashboard", anonId],
    queryFn: async () => {
      const [tasks, subjects, attendance, gpa] = await Promise.all([
        supabase.from("tasks").select("id,completed,created_at").eq("anonymous_user_id", anonId),
        supabase.from("subjects").select("id").eq("anonymous_user_id", anonId),
        supabase.from("attendance_records").select("status,date").eq("anonymous_user_id", anonId),
        supabase.from("gpa_records").select("credit_hours,grade_point,semester").eq("anonymous_user_id", anonId),
      ]);
      const taskRows = tasks.data ?? [];
      const totalTasks = taskRows.length;
      const completedTasks = taskRows.filter((t) => t.completed).length;
      const completionPct = totalTasks ? Math.round((completedTasks / totalTasks) * 100) : 0;
      const totalSubjects = subjects.data?.length ?? 0;
      const att = attendance.data ?? [];
      const attPct = att.length ? Math.round((att.filter((a) => a.status === "present").length / att.length) * 100) : 0;
      const gpaRows = gpa.data ?? [];
      const totalCredits = gpaRows.reduce((s, r) => s + Number(r.credit_hours), 0);
      const gpaVal = totalCredits
        ? gpaRows.reduce((s, r) => s + Number(r.grade_point) * Number(r.credit_hours), 0) / totalCredits
        : 0;

      // weekly trend (last 7 days)
      const days = Array.from({ length: 7 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - (6 - i));
        return d.toISOString().slice(0, 10);
      });
      const trend = days.map((d) => {
        const dayAtt = att.filter((a) => a.date === d);
        const present = dayAtt.filter((a) => a.status === "present").length;
        const total = dayAtt.length;
        return {
          day: new Date(d).toLocaleDateString(undefined, { weekday: "short" }),
          attendance: total ? Math.round((present / total) * 100) : 0,
        };
      });

      return {
        totalTasks, completedTasks, completionPct, totalSubjects, attPct,
        gpa: gpaVal, trend,
      };
    },
  });

  const cards = [
    {
      label: "Total Tasks",
      value: data?.totalTasks ?? 0,
      hint: `${data?.completedTasks ?? 0} of ${data?.totalTasks ?? 0} completed`,
      trend: (data?.completionPct ?? 0) >= 50 ? "up" : "down",
      trendLabel: `${data?.completionPct ?? 0}% done`,
      icon: CheckSquare,
      to: "/tasks",
      accent: "from-primary/20 to-primary/0",
    },
    {
      label: "Subjects",
      value: data?.totalSubjects ?? 0,
      hint: "Active this semester",
      trend: "up",
      trendLabel: "Tracked",
      icon: BookOpen,
      to: "/subjects",
      accent: "from-sky-400/20 to-sky-400/0",
    },
    {
      label: "Attendance",
      value: data?.attPct ?? 0,
      suffix: "%",
      hint: (data?.attPct ?? 0) >= 75 ? "Above safe threshold" : "Below 75% — focus needed",
      trend: (data?.attPct ?? 0) >= 75 ? "up" : "down",
      trendLabel: `${data?.attPct ?? 0}%`,
      icon: CalendarCheck,
      to: "/attendance",
      accent: "from-emerald-400/20 to-emerald-400/0",
    },
    {
      label: "Current GPA",
      value: data?.gpa ?? 0,
      decimals: 2,
      hint: "Weighted across all credits",
      trend: (data?.gpa ?? 0) >= 3 ? "up" : "down",
      trendLabel: (data?.gpa ?? 0).toFixed(2),
      icon: GraduationCap,
      to: "/gpa",
      accent: "from-violet-400/20 to-violet-400/0",
    },
  ];

  return (
    <PageContainer>
      <PageHeader
        eyebrow="Dashboard"
        title="Welcome back"
        subtitle="Your academic command center — tasks, attendance, grades and more, in one focused workspace."
        action={
          <div className="flex gap-2 shrink-0">
            <Link to="/tasks" className="btn-ghost"><Plus className="h-3.5 w-3.5" /> New Task</Link>
            <Link to="/ai-assistant" className="btn-primary"><Sparkles className="h-3.5 w-3.5" /> AI Assistant</Link>
          </div>
        }
      />

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map(({ label, value, suffix, decimals, hint, trend, trendLabel, icon: Icon, to, accent }, i) => {
          const TrendIcon = trend === "up" ? TrendingUp : TrendingDown;
          const trendColor = trend === "up" ? "text-primary" : "text-destructive";
          return (
            <Link
              key={label}
              to={to}
              style={{ animationDelay: `${i * 60}ms` }}
              className="glass-card glass-card-hover p-5 group relative overflow-hidden animate-fade-up"
            >
              <div className={`absolute -top-12 -right-12 h-32 w-32 rounded-full bg-gradient-to-br ${accent} blur-2xl opacity-80`} />
              <div className="relative flex items-start justify-between">
                <div className="h-10 w-10 rounded-lg grid place-items-center bg-secondary border border-border">
                  <Icon className="h-[18px] w-[18px] text-primary" />
                </div>
                <ArrowUpRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 transition-all" />
              </div>
              <div className="relative mt-5 text-3xl font-semibold text-white tracking-tight" style={{ fontFamily: "var(--font-sora)" }}>
                {isLoading ? <span className="inline-block h-7 w-16 rounded shimmer bg-secondary" /> : (
                  <StatNumber value={Number(value)} decimals={decimals ?? 0} suffix={suffix ?? ""} />
                )}
              </div>
              <div className="relative mt-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-mono">{label}</div>
              <div className="relative mt-3 flex items-center justify-between gap-2">
                <span className="text-xs text-muted-foreground truncate">{hint}</span>
                <span className={`inline-flex items-center gap-1 text-[11px] font-medium ${trendColor}`}>
                  <TrendIcon className="h-3 w-3" />
                  {trendLabel}
                </span>
              </div>
            </Link>
          );
        })}
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mt-6">
        <div className="glass-card p-6 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <div>
              <p className="eyebrow mb-1">Last 7 days</p>
              <h3 className="text-lg font-semibold text-white" style={{ fontFamily: "var(--font-sora)" }}>Attendance trend</h3>
            </div>
            <Link to="/analytics" className="text-xs text-muted-foreground hover:text-primary inline-flex items-center gap-1">
              Full analytics <ArrowUpRight className="h-3 w-3" />
            </Link>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={data?.trend ?? []} margin={{ top: 10, right: 8, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="att" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#00d4aa" stopOpacity={0.5} />
                    <stop offset="100%" stopColor="#00d4aa" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid stroke="#1a212b" strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="day" stroke="#6b7684" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="#6b7684" fontSize={11} tickLine={false} axisLine={false} domain={[0, 100]} />
                <Tooltip
                  contentStyle={{ background: "#0c1014", border: "1px solid #1a212b", borderRadius: 8, fontSize: 12 }}
                  labelStyle={{ color: "#6b7684" }}
                  itemStyle={{ color: "#00d4aa" }}
                />
                <Area type="monotone" dataKey="attendance" stroke="#00d4aa" strokeWidth={2} fill="url(#att)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="glass-card p-6">
          <p className="eyebrow mb-1">Quick actions</p>
          <h3 className="text-lg font-semibold text-white mb-4" style={{ fontFamily: "var(--font-sora)" }}>Jump in</h3>
          <div className="space-y-2">
            {[
              { to: "/tasks", label: "Add a new task", icon: CheckSquare },
              { to: "/attendance", label: "Mark today's attendance", icon: CalendarCheck },
              { to: "/gpa", label: "Log a grade", icon: GraduationCap },
              { to: "/subjects", label: "Manage subjects", icon: BookOpen },
            ].map(({ to, label, icon: Icon }) => (
              <Link
                key={to}
                to={to}
                className="flex items-center gap-3 px-3 py-2.5 rounded-md border border-border bg-secondary/40 hover:border-primary/40 hover:bg-secondary transition-all group"
              >
                <Icon className="h-4 w-4 text-primary" />
                <span className="text-sm text-foreground flex-1">{label}</span>
                <ArrowUpRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-primary transition-colors" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </PageContainer>
  );
}
