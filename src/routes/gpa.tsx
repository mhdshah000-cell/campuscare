import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAnonId } from "@/lib/anon-user";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Plus, Trash2 } from "lucide-react";

export const Route = createFileRoute("/gpa")({
  head: () => ({ meta: [{ title: "GPA Calculator — CampusCare" }] }),
  component: GPA,
});

type Row = { id: string; course_name: string; credit_hours: number; grade_point: number; semester: string };

const GRADES = [
  { label: "A+ / A (4.0)", value: 4.0 },
  { label: "A− (3.7)", value: 3.7 },
  { label: "B+ (3.3)", value: 3.3 },
  { label: "B (3.0)", value: 3.0 },
  { label: "B− (2.7)", value: 2.7 },
  { label: "C+ (2.3)", value: 2.3 },
  { label: "C (2.0)", value: 2.0 },
  { label: "D (1.0)", value: 1.0 },
  { label: "F (0.0)", value: 0.0 },
];

function GPA() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ course_name: "", credit_hours: 3, grade_point: 4.0, semester: "Semester 1" });

  const anonId = getAnonId();

  const { data: rows = [] } = useQuery({
    queryKey: ["gpa_records", anonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("gpa_records")
        .select("*")
        .eq("anonymous_user_id", anonId)
        .order("created_at");
      if (error) throw error;
      return data as Row[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["gpa_records"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const add = useMutation({
    mutationFn: async () => {
      if (!form.course_name.trim()) throw new Error("Course name is required");
      const { error } = await supabase.from("gpa_records").insert({
        course_name: form.course_name.trim(),
        credit_hours: form.credit_hours,
        grade_point: form.grade_point,
        semester: form.semester || "Semester 1",
        anonymous_user_id: anonId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ ...form, course_name: "" });
      invalidate();
      toast.success("Course added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("gpa_records")
        .delete()
        .eq("id", id)
        .eq("anonymous_user_id", anonId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Course removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const grouped = useMemo(() => {
    const m = new Map<string, Row[]>();
    rows.forEach((r) => { m.set(r.semester, [...(m.get(r.semester) ?? []), r]); });
    return Array.from(m.entries());
  }, [rows]);

  const overallGpa = useMemo(() => {
    const totalCr = rows.reduce((s, r) => s + Number(r.credit_hours), 0);
    if (!totalCr) return "0.00";
    return (rows.reduce((s, r) => s + Number(r.grade_point) * Number(r.credit_hours), 0) / totalCr).toFixed(2);
  }, [rows]);

  return (
    <PageContainer>
      <PageHeader
        title="GPA Calculator"
        subtitle="Add courses across semesters — your GPA updates live."
        action={<div className="glass-card px-5 py-3 text-right"><div className="text-[10px] uppercase tracking-wider text-muted-foreground">Cumulative</div><div className="text-3xl font-bold glow-text">{overallGpa}</div></div>}
      />

      <div className="glass-card p-5 mb-6 grid md:grid-cols-5 gap-3">
        <input className="input-field md:col-span-2" placeholder="Course name" value={form.course_name} onChange={(e) => setForm({ ...form, course_name: e.target.value })} />
        <input type="number" min={1} max={6} className="input-field" placeholder="Credits" value={form.credit_hours} onChange={(e) => setForm({ ...form, credit_hours: Number(e.target.value) })} />
        <select className="input-field" value={form.grade_point} onChange={(e) => setForm({ ...form, grade_point: Number(e.target.value) })}>
          {GRADES.map((g) => <option key={g.value} value={g.value}>{g.label}</option>)}
        </select>
        <input className="input-field" placeholder="Semester" value={form.semester} onChange={(e) => setForm({ ...form, semester: e.target.value })} />
        <button className="btn-primary md:col-span-5 flex items-center justify-center gap-2" disabled={add.isPending} onClick={() => add.mutate()}>
          <Plus className="h-4 w-4" /> Add Course
        </button>
        {add.isError && <p className="text-destructive text-sm md:col-span-5">{(add.error as Error).message}</p>}
      </div>

      {grouped.length === 0 && <p className="text-muted-foreground text-sm">No courses yet.</p>}

      <div className="space-y-5">
        {grouped.map(([sem, courses]) => {
          const totalCr = courses.reduce((s, r) => s + Number(r.credit_hours), 0);
          const semGpa = totalCr ? (courses.reduce((s, r) => s + r.grade_point * r.credit_hours, 0) / totalCr).toFixed(2) : "0.00";
          return (
            <div key={sem} className="glass-card p-5">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-semibold">{sem}</h3>
                <span className="text-sm text-muted-foreground">GPA <span className="text-primary font-bold">{semGpa}</span></span>
              </div>
              <div className="divide-y divide-border">
                {courses.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 py-2 text-sm">
                    <div className="flex-1">{c.course_name}</div>
                    <div className="text-muted-foreground w-20 text-right">{c.credit_hours} cr</div>
                    <div className="w-20 text-right text-primary font-medium">{Number(c.grade_point).toFixed(2)}</div>
                    <button onClick={() => remove.mutate(c.id)} className="text-muted-foreground hover:text-destructive"><Trash2 className="h-4 w-4" /></button>
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </PageContainer>
  );
}
