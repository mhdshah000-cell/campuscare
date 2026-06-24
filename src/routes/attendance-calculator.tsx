import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { PageContainer, PageHeader } from "@/components/PageHeader";

export const Route = createFileRoute("/attendance-calculator")({
  head: () => ({ meta: [{ title: "Attendance Calculator — CampusCare" }] }),
  component: Calc,
});

function Calc() {
  const [attended, setAttended] = useState(0);
  const [total, setTotal] = useState(0);
  const [target, setTarget] = useState(75);

  const currentPct = total ? (attended / total) * 100 : 0;
  // attended + x >= target/100 * (total + x)  =>  x >= (target*total/100 - attended) / (1 - target/100)
  const t = target / 100;
  let needed = 0;
  if (currentPct < target) {
    needed = Math.ceil((t * total - attended) / (1 - t));
    if (needed < 0) needed = 0;
  }
  const canSkip = currentPct >= target ? Math.floor((attended - t * total) / t) : 0;

  return (
    <PageContainer>
      <PageHeader title="Attendance Calculator" subtitle="How many classes until you're safe?" />
      <div className="glass-card p-6 max-w-xl">
        <div className="grid grid-cols-3 gap-3">
          <Field label="Attended" value={attended} onChange={setAttended} />
          <Field label="Total" value={total} onChange={setTotal} />
          <Field label="Target %" value={target} onChange={setTarget} />
        </div>

        <div className="mt-6 grid sm:grid-cols-2 gap-4">
          <Stat label="Current" value={`${currentPct.toFixed(1)}%`} />
          {currentPct < target ? (
            <Stat label="Attend in a row" value={`${needed}`} accent />
          ) : (
            <Stat label="Can safely skip" value={`${canSkip}`} accent />
          )}
        </div>

        <p className="text-xs text-muted-foreground mt-4">
          Assumes you can attend (or skip) consecutive classes without missing the target.
        </p>
      </div>
    </PageContainer>
  );
}

function Field({ label, value, onChange }: { label: string; value: number; onChange: (n: number) => void }) {
  return (
    <label className="block">
      <span className="text-xs uppercase tracking-wider text-muted-foreground">{label}</span>
      <input type="number" min={0} className="input-field mt-1" value={value} onChange={(e) => onChange(Number(e.target.value) || 0)} />
    </label>
  );
}

function Stat({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="bg-secondary/50 rounded-lg p-4">
      <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className={`text-3xl font-bold mt-1 ${accent ? "glow-text" : ""}`}>{value}</div>
    </div>
  );
}
