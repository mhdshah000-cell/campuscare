import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAnonId } from "@/lib/anon-user";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Trash2, Plus, BookOpen } from "lucide-react";

export const Route = createFileRoute("/subjects")({
  head: () => ({ meta: [{ title: "Subjects — CampusCare" }] }),
  component: SubjectsPage,
});

type Subject = { id: string; name: string; code: string | null; credit_hours: number | null };

function SubjectsPage() {
  const qc = useQueryClient();
  const [form, setForm] = useState({ name: "", code: "", credit_hours: 3 });

  const anonId = getAnonId();

  const { data: subjects = [], isLoading } = useQuery({
    queryKey: ["subjects", anonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("subjects")
        .select("*")
        .eq("anonymous_user_id", anonId)
        .order("created_at");
      if (error) throw error;
      return data as Subject[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["subjects"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!form.name.trim()) throw new Error("Name is required");
      const { error } = await supabase.from("subjects").insert({
        name: form.name.trim(),
        code: form.code || null,
        credit_hours: Number(form.credit_hours) || 3,
        anonymous_user_id: anonId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ name: "", code: "", credit_hours: 3 });
      invalidate();
      toast.success("Subject added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("subjects")
        .delete()
        .eq("id", id)
        .eq("anonymous_user_id", anonId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      qc.invalidateQueries({ queryKey: ["attendance_records"] });
      toast.success("Subject removed");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  return (
    <PageContainer>
      <PageHeader title="Subjects" subtitle="Your enrolled courses — drive attendance and GPA." />

      <div className="glass-card p-5 mb-6 grid md:grid-cols-4 gap-3">
        <input className="input-field md:col-span-2" placeholder="Subject name" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        <input className="input-field" placeholder="Code (e.g. CS101)" value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value })} />
        <input type="number" min={1} max={6} className="input-field" placeholder="Credits" value={form.credit_hours} onChange={(e) => setForm({ ...form, credit_hours: Number(e.target.value) })} />
        <button className="btn-primary md:col-span-4 flex items-center justify-center gap-2" disabled={create.isPending} onClick={() => create.mutate()}>
          <Plus className="h-4 w-4" /> Add Subject
        </button>
        {create.isError && <p className="text-destructive text-sm md:col-span-4">{(create.error as Error).message}</p>}
      </div>

      <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {isLoading && Array.from({ length: 3 }).map((_, i) => (
          <div key={i} className="glass-card p-5 h-24 shimmer bg-secondary/30" />
        ))}
        {!isLoading && subjects.length === 0 && (
          <div className="glass-card p-8 text-center sm:col-span-2 lg:col-span-3">
            <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground text-sm">No subjects yet — add your first course above.</p>
          </div>
        )}
        {subjects.map((s) => (
          <div key={s.id} className="glass-card p-5 flex items-start gap-4">
            <div className="h-10 w-10 rounded-lg bg-secondary flex items-center justify-center">
              <BookOpen className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="font-semibold truncate">{s.name}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {s.code || "—"} · {s.credit_hours ?? 3} credits
              </div>
            </div>
            <button onClick={() => remove.mutate(s.id)} className="text-muted-foreground hover:text-destructive">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
