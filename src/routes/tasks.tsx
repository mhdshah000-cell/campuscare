import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useState } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { getAnonId } from "@/lib/anon-user";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Trash2, Check, Circle, Plus } from "lucide-react";

export const Route = createFileRoute("/tasks")({
  head: () => ({ meta: [{ title: "Tasks — CampusCare" }] }),
  component: TasksPage,
});

type Task = {
  id: string; title: string; description: string | null; category: string | null;
  due_date: string | null; completed: boolean; created_at: string;
};

function TasksPage() {
  const qc = useQueryClient();
  const [filter, setFilter] = useState<"all" | "pending" | "completed">("all");
  const [form, setForm] = useState({ title: "", description: "", category: "general", due_date: "" });

  const anonId = getAnonId();

  const { data: tasks = [], isLoading } = useQuery({
    queryKey: ["tasks", anonId],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("tasks")
        .select("*")
        .eq("anonymous_user_id", anonId)
        .order("created_at", { ascending: false });
      if (error) throw error;
      return data as Task[];
    },
  });

  const invalidate = () => {
    qc.invalidateQueries({ queryKey: ["tasks"] });
    qc.invalidateQueries({ queryKey: ["dashboard"] });
  };

  const create = useMutation({
    mutationFn: async () => {
      if (!form.title.trim()) throw new Error("Title is required");
      const { error } = await supabase.from("tasks").insert({
        title: form.title.trim(),
        description: form.description || null,
        category: form.category || "general",
        due_date: form.due_date ? new Date(form.due_date).toISOString() : null,
        anonymous_user_id: anonId,
      });
      if (error) throw error;
    },
    onSuccess: () => {
      setForm({ title: "", description: "", category: "general", due_date: "" });
      invalidate();
      toast.success("Task added");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const toggle = useMutation({
    mutationFn: async (t: Task) => {
      const { error } = await supabase
        .from("tasks")
        .update({ completed: !t.completed })
        .eq("id", t.id)
        .eq("anonymous_user_id", anonId);
      if (error) throw error;
    },
    onSuccess: invalidate,
    onError: (e: Error) => toast.error(e.message),
  });

  const remove = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from("tasks")
        .delete()
        .eq("id", id)
        .eq("anonymous_user_id", anonId);
      if (error) throw error;
    },
    onSuccess: () => {
      invalidate();
      toast.success("Task deleted");
    },
    onError: (e: Error) => toast.error(e.message),
  });

  const filtered = tasks.filter((t) => filter === "all" ? true : filter === "completed" ? t.completed : !t.completed);

  return (
    <PageContainer>
      <PageHeader title="Tasks" subtitle="Capture assignments, deadlines and study goals." />

      <div className="glass-card p-5 mb-6">
        <div className="grid md:grid-cols-5 gap-3">
          <input className="input-field md:col-span-2" placeholder="Task title" value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          <input className="input-field" placeholder="Category" value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} />
          <input type="date" className="input-field" value={form.due_date} onChange={(e) => setForm({ ...form, due_date: e.target.value })} />
          <button className="btn-primary flex items-center justify-center gap-2" disabled={create.isPending} onClick={() => create.mutate()}>
            <Plus className="h-4 w-4" /> Add Task
          </button>
        </div>
        <textarea className="input-field mt-3" placeholder="Description (optional)" rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
        {create.isError && <p className="text-destructive text-sm mt-2">{(create.error as Error).message}</p>}
      </div>

      <div className="flex gap-2 mb-4">
        {(["all", "pending", "completed"] as const).map((f) => (
          <button key={f} onClick={() => setFilter(f)} className={filter === f ? "btn-primary" : "btn-ghost"}>
            {f[0].toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      <div className="grid gap-3">
        {isLoading && <p className="text-muted-foreground">Loading...</p>}
        {!isLoading && filtered.length === 0 && <p className="text-muted-foreground text-sm">No tasks here yet.</p>}
        {filtered.map((t) => (
          <div key={t.id} className="glass-card p-4 flex items-start gap-4">
            <button onClick={() => toggle.mutate(t)} className="mt-1 shrink-0">
              {t.completed ? (
                <div className="h-6 w-6 rounded-md flex items-center justify-center" style={{ background: "var(--gradient-primary)" }}>
                  <Check className="h-4 w-4 text-primary-foreground" />
                </div>
              ) : (
                <Circle className="h-6 w-6 text-muted-foreground hover:text-primary" />
              )}
            </button>
            <div className="flex-1 min-w-0">
              <div className={`font-medium ${t.completed ? "line-through text-muted-foreground" : ""}`}>{t.title}</div>
              {t.description && <div className="text-sm text-muted-foreground mt-0.5">{t.description}</div>}
              <div className="flex flex-wrap gap-2 mt-2 text-[11px] uppercase tracking-wider">
                <span className="px-2 py-0.5 rounded bg-secondary text-secondary-foreground">{t.category}</span>
                {t.due_date && <span className="px-2 py-0.5 rounded bg-secondary text-muted-foreground">Due {new Date(t.due_date).toLocaleDateString()}</span>}
              </div>
            </div>
            <button onClick={() => remove.mutate(t.id)} className="text-muted-foreground hover:text-destructive p-2">
              <Trash2 className="h-4 w-4" />
            </button>
          </div>
        ))}
      </div>
    </PageContainer>
  );
}
