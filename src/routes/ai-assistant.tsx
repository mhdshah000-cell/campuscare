import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { Sparkles } from "lucide-react";

export const Route = createFileRoute("/ai-assistant")({
  head: () => ({ meta: [{ title: "AI Assistant — CampusCare" }] }),
  component: () => (
    <PageContainer>
      <PageHeader title="AI Assistant" subtitle="Your personal study copilot — coming soon." />
      <ComingSoon
        icon={<Sparkles className="h-8 w-8 text-primary" />}
        title="AI Assistant"
        blurb="Ask questions about your courses, get summaries of your notes, and generate study plans. We're cooking something special."
      />
    </PageContainer>
  ),
});

function ComingSoon({ icon, title, blurb }: { icon: React.ReactNode; title: string; blurb: string }) {
  return (
    <div className="glass-card p-10 max-w-2xl text-center mx-auto relative overflow-hidden">
      <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-primary)" }} />
      <div className="relative">
        <div className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center bg-secondary mb-4">{icon}</div>
        <div className="inline-block px-3 py-1 rounded-full text-[11px] uppercase tracking-widest bg-secondary text-primary mb-3">Coming Soon</div>
        <h2 className="text-2xl font-bold">{title}</h2>
        <p className="text-muted-foreground mt-3 max-w-md mx-auto">{blurb}</p>
      </div>
    </div>
  );
}
