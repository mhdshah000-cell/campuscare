import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAnonId } from "@/lib/anon-user";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Check, X, AlertTriangle } from "lucide-react";

export const Route = createFileRoute("/attendance")({
  head: () => ({ meta: [{ title: "Attendance — CampusCare" }] }),
  component: AttendancePage,
});

type Subject = { id: string; name: string; code: string | null };
type Record_ = { id: string; subject_id: string; status: "present" | "absent"; date: string };

const LOW_THRESHOLD = 75;

function AttendancePage() {
  const qc = useQueryClient();

  const anonId = getAnonId();

  const { data: subjects = [] } = useQuery({
    queryKey: ["subjects", anonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("id,name,code")
        .eq("anonymous_user_id", anonId)
        .order("created_at");
      if (error) throw error;
      return data as Subject[];
    },
  });

  const { data: records = [] } = useQuery({
    queryKey: ["attendance_records", anonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("attendance_records")
        .select("*")
        .eq("anonymous_user_id", anonId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Record_[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["attendance_records"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const mark = useMutation({
    mutationFn: async ({ subject_id, status }: { subject_id: string; status: "present" | "absent" }) => {
      const { error } = await supabase
        .from("attendance_records")
        .insert({ subject_id, status, anonymous_user_id: anonId });
      if (error) throw error;
    },
    onSuccess: (_d, v) => {
      invalidate();
      toast.success(v.status === "present" ? "Marked present" : "Marked absent");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const undo = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("attendance_records")
        .delete()
        .eq("id", id)
        .eq("anonymous_user_id", anonId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const stats = (subjectId: string) => {
    const r = records.filter((x) => x.subject_id === subjectId);
    const total = r.length;
    const present = r.filter((x) => x.status === "present").length;
    const pct = total ? Math.round((present / total) * 100) : 0;
    return { total, present, absent: total - present, pct };
  };

  return (
    <PageContainer>
      <PageHeader title="Attendance" subtitle="Mark every class. Stay above the line." />

      {subjects.length === 0 ? (
        <div className="glass-card p-8 text-center">
          <p className="text-muted-foreground">No subjects yet.</p>
          <Link to="/subjects" className="btn-primary inline-block mt-4">Add a subject</Link>
        </div>
      ) : (
        <div className="grid lg:grid-cols-2 gap-5">
          {subjects.map((s) => {
            const st = stats(s.id);
            const low = st.total > 0 && st.pct < LOW_THRESHOLD;
            return (
              <div key={s.id} className="glass-card p-5">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{s.name}</div>
                    <div className="text-xs text-muted-foreground">{s.code || "—"}</div>
                  </div>
                  <div className={`text-2xl font-bold ${low ? "text-destructive" : "text-primary"}`}>{st.pct}%</div>
                </div>

                <div className="mt-3 h-2 rounded-full bg-secondary overflow-hidden">
                  <div
                    className="h-full"
                    style={{
                      width: `${st.pct}%`,
                      background: low ? "var(--color-destructive)" : "var(--gradient-primary)",
                    }}
                  />
                </div>

                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>{st.present} present · {st.absent} absent</span>
                  <span>{st.total} classes</span>
                </div>

                {low && (
                  <div className="mt-3 flex items-center gap-2 text-xs text-warning bg-warning/10 px-3 py-2 rounded-md" style={{ color: "var(--color-warning)" }}>
                    <AlertTriangle className="h-3.5 w-3.5" />
                    Below {LOW_THRESHOLD}% — attend the next classes!
                  </div>
                )}

                <div className="flex gap-2 mt-4">
                  <button
                    onClick={() => mark.mutate({ subject_id: s.id, status: "present" })}
                    className="btn-primary flex-1 flex items-center justify-center gap-2"
                  >
                    <Check className="h-4 w-4" /> Present
                  </button>
                  <button
                    onClick={() => mark.mutate({ subject_id: s.id, status: "absent" })}
                    className="btn-ghost flex-1 flex items-center justify-center gap-2"
                  >
                    <X className="h-4 w-4" /> Absent
                  </button>
                </div>

                <div className="mt-4 max-h-40 overflow-y-auto space-y-1 pr-1">
                  {records.filter((r) => r.subject_id === s.id).slice(0, 8).map((r) => (
                    <div key={r.id} className="flex items-center justify-between text-xs bg-secondary/50 rounded px-2 py-1">
                      <span className="text-muted-foreground">{new Date(r.date).toLocaleDateString()}</span>
                      <span className={r.status === "present" ? "text-primary" : "text-destructive"}>{r.status}</span>
                      <button onClick={() => undo.mutate(r.id)} className="text-muted-foreground hover:text-destructive">×</button>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </PageContainer>
  );
}
