import { createFileRoute } from "@tanstack/react-router";
import { PageContainer, PageHeader } from "@/components/PageHeader";
import { MessageCircle } from "lucide-react";

export const Route = createFileRoute("/notifications")({
  head: () => ({ meta: [{ title: "WhatsApp Notifications — CampusCare" }] }),
  component: () => (
    <PageContainer>
      <PageHeader title="WhatsApp Notifications" subtitle="Get reminders where you already chat — coming soon." />
      <div className="glass-card p-10 max-w-2xl text-center mx-auto relative overflow-hidden">
        <div className="absolute inset-0 opacity-20" style={{ background: "var(--gradient-primary)" }} />
        <div className="relative">
          <div className="h-16 w-16 rounded-2xl mx-auto flex items-center justify-center bg-secondary mb-4">
            <MessageCircle className="h-8 w-8 text-primary" />
          </div>
          <div className="inline-block px-3 py-1 rounded-full text-[11px] uppercase tracking-widest bg-secondary text-primary mb-3">Coming Soon</div>
          <h2 className="text-2xl font-bold">WhatsApp Reminders</h2>
          <p className="text-muted-foreground mt-3 max-w-md mx-auto">
            Daily attendance pings, due-date alerts, and GPA milestones — straight to your phone.
          </p>
        </div>
      </div>
    </PageContainer>
  ),
});
