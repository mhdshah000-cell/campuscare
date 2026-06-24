import type { ReactNode } from "react";

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  action,
}: {
  title: string;
  subtitle?: string;
  eyebrow?: string;
  action?: ReactNode;
}) {
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-end gap-4 mb-8 sm:flex sm:flex-wrap sm:justify-between">
      <div className="min-w-0">
        <p className="eyebrow mb-2">{eyebrow ?? "Overview"}</p>
        <h1
          className="text-3xl md:text-4xl text-white font-semibold tracking-tight"
          style={{ fontFamily: "var(--font-sora)", letterSpacing: "-0.025em" }}
        >
          {title}
        </h1>
        {subtitle && <p className="text-sm text-muted-foreground mt-2 max-w-xl">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}

export function PageContainer({ children }: { children: ReactNode }) {
  return <div className="p-6 md:p-10 max-w-7xl mx-auto w-full">{children}</div>;
}
