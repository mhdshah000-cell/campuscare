import { useRouter } from "@tanstack/react-router";

export function RouteError({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  return (
    <div className="p-10 max-w-2xl mx-auto">
      <div className="glass-card p-8">
        <p className="eyebrow mb-2">Error</p>
        <h2 className="text-2xl text-white font-serif" style={{ fontFamily: "var(--font-serif)" }}>
          Something went wrong on this page.
        </h2>
        <p className="text-sm text-muted-foreground mt-2 break-words">{error.message}</p>
        <button
          onClick={() => { router.invalidate(); reset(); }}
          className="btn-primary mt-6"
        >
          Try again
        </button>
      </div>
    </div>
  );
}

export function RoutePending() {
  return (
    <div className="p-10 max-w-7xl mx-auto">
      <div className="h-8 w-40 rounded bg-secondary animate-pulse mb-4" />
      <div className="h-6 w-72 rounded bg-secondary/60 animate-pulse mb-10" />
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="glass-card p-5 h-32 animate-pulse" />
        ))}
      </div>
    </div>
  );
}
