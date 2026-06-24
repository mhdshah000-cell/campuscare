import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import {
  Outlet,
  Link,
  createRootRouteWithContext,
  useRouter,
  useRouterState,
  HeadContent,
  Scripts,
} from "@tanstack/react-router";
import { useEffect, useState, type ReactNode } from "react";
import {
  LayoutDashboard,
  CheckSquare,
  BookOpen,
  CalendarCheck,
  Calculator,
  GraduationCap,
  BarChart3,
  Sparkles,
  MessageCircle,
  Menu,
  X,
  Search,
  Bell,
  GraduationCap as Logo,
} from "lucide-react";
import { Toaster } from "@/components/ui/sonner";

import appCss from "../styles.css?url";
import { reportLovableError } from "../lib/lovable-error-reporting";

function NotFoundComponent() {
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md text-center p-10">
        <p className="eyebrow mb-2">404</p>
        <h1 className="text-4xl text-white" style={{ fontFamily: "var(--font-sora)" }}>Page not found</h1>
        <p className="mt-3 text-sm text-muted-foreground">This page drifted off into the void.</p>
        <Link to="/" className="btn-primary mt-6 inline-flex">Back to dashboard</Link>
      </div>
    </div>
  );
}

function ErrorComponent({ error, reset }: { error: Error; reset: () => void }) {
  const router = useRouter();
  useEffect(() => { reportLovableError(error, { boundary: "tanstack_root_error_component" }); }, [error]);
  return (
    <div className="flex min-h-screen items-center justify-center px-4">
      <div className="glass-card max-w-md text-center p-10">
        <p className="eyebrow mb-2">Error</p>
        <h1 className="text-2xl text-white" style={{ fontFamily: "var(--font-sora)" }}>Something went wrong</h1>
        <p className="mt-2 text-sm text-muted-foreground break-words">{error.message}</p>
        <button onClick={() => { router.invalidate(); reset(); }} className="btn-primary mt-6">Try again</button>
      </div>
    </div>
  );
}

export const Route = createRootRouteWithContext<{ queryClient: QueryClient }>()({
  head: () => ({
    meta: [
      { charSet: "utf-8" },
      { name: "viewport", content: "width=device-width, initial-scale=1" },
      { title: "CampusCare — Student OS" },
      { name: "description", content: "Tasks, attendance, GPA and analytics — a premium academic OS for students." },
      { property: "og:title", content: "CampusCare — Student OS" },
      { property: "og:description", content: "A premium academic OS for students." },
      { property: "og:type", content: "website" },
    ],
    links: [
      { rel: "stylesheet", href: appCss },
      { rel: "preconnect", href: "https://fonts.googleapis.com" },
      { rel: "preconnect", href: "https://fonts.gstatic.com", crossOrigin: "anonymous" },
      { rel: "stylesheet", href: "https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Sora:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500&display=swap" },
    ],
  }),
  shellComponent: RootShell,
  component: RootComponent,
  notFoundComponent: NotFoundComponent,
  errorComponent: ErrorComponent,
});

function RootShell({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className="dark">
      <head><HeadContent /></head>
      <body>{children}<Scripts /></body>
    </html>
  );
}

function BrandMark({ size = "md" }: { size?: "sm" | "md" }) {
  const dim = size === "sm" ? "h-7 w-7" : "h-8 w-8";
  return (
    <span className={`${dim} relative grid place-items-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[0_6px_20px_-6px_rgba(0,212,170,0.6)]`}>
      <Logo className="h-4 w-4 text-[#00120e]" strokeWidth={2.5} />
    </span>
  );
}

function Brand() {
  return (
    <Link to="/" className="flex items-center gap-2.5 group">
      <BrandMark />
      <span className="flex flex-col leading-none">
        <span className="text-white font-semibold tracking-tight text-[15px]" style={{ fontFamily: "var(--font-sora)" }}>
          CampusCare
        </span>
        <span className="text-[10px] font-mono uppercase tracking-[0.18em] text-muted-foreground mt-1">Student OS</span>
      </span>
    </Link>
  );
}

type NavItem = {
  to: string;
  label: string;
  icon: typeof LayoutDashboard;
  exact?: boolean;
  group: "Workspace" | "Tools" | "Roadmap";
  badge?: string;
};

const navItems: NavItem[] = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard, exact: true, group: "Workspace" },
  { to: "/tasks", label: "Tasks", icon: CheckSquare, group: "Workspace" },
  { to: "/subjects", label: "Subjects", icon: BookOpen, group: "Workspace" },
  { to: "/attendance", label: "Attendance", icon: CalendarCheck, group: "Workspace" },
  { to: "/analytics", label: "Analytics", icon: BarChart3, group: "Workspace" },
  { to: "/attendance-calculator", label: "Attendance Calc", icon: Calculator, group: "Tools" },
  { to: "/gpa", label: "GPA Calculator", icon: GraduationCap, group: "Tools" },
  { to: "/ai-assistant", label: "AI Assistant", icon: Sparkles, group: "Roadmap", badge: "Soon" },
  { to: "/notifications", label: "WhatsApp Alerts", icon: MessageCircle, group: "Roadmap", badge: "Soon" },
];

function NavList({ pathname, onClick }: { pathname: string; onClick?: () => void }) {
  const groups = ["Workspace", "Tools", "Roadmap"] as const;
  return (
    <nav className="flex-1 flex flex-col gap-6 overflow-y-auto">
      {groups.map((g) => (
        <div key={g}>
          <p className="px-3 mb-2 text-[10px] font-mono uppercase tracking-[0.2em] text-muted-foreground/70">{g}</p>
          <div className="space-y-0.5">
            {navItems.filter((n) => n.group === g).map(({ to, label, icon: Icon, exact, badge }) => {
              const active = exact ? pathname === to : pathname === to || pathname.startsWith(to + "/");
              return (
                <Link
                  key={to}
                  to={to}
                  onClick={onClick}
                  className={`group relative flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-all ${
                    active
                      ? "bg-secondary text-white"
                      : "text-muted-foreground hover:bg-secondary/60 hover:text-white"
                  }`}
                >
                  {active && (
                    <span className="absolute left-0 top-1/2 -translate-y-1/2 h-5 w-[2px] rounded-r bg-primary shadow-[0_0_12px_rgba(0,212,170,0.7)]" />
                  )}
                  <Icon className={`h-[15px] w-[15px] transition-colors ${active ? "text-primary" : "group-hover:text-primary/80"}`} />
                  <span className="truncate flex-1">{label}</span>
                  {badge && (
                    <span className="text-[9px] font-mono uppercase tracking-wider px-1.5 py-0.5 rounded border border-border text-muted-foreground/70">
                      {badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      ))}
    </nav>
  );
}

function Sidebar() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <aside className="hidden md:flex w-64 shrink-0 flex-col border-r border-sidebar-border bg-sidebar p-5 sticky top-0 h-screen">
      <div className="mb-8 px-1"><Brand /></div>
      <NavList pathname={pathname} />
      <div className="mt-6 pt-5 border-t border-sidebar-border">
        <div className="flex items-center gap-3 px-1">
          <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/30 to-accent/20 border border-border grid place-items-center text-xs font-semibold text-primary">S</div>
          <div className="text-xs min-w-0">
            <p className="text-white font-medium leading-tight truncate">Student</p>
            <p className="text-muted-foreground leading-tight truncate">Local workspace</p>
          </div>
        </div>
      </div>
    </aside>
  );
}

function TopBar({ onOpenMobile }: { onOpenMobile: () => void }) {
  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 px-4 md:px-8 h-14 border-b border-sidebar-border bg-background/80 backdrop-blur-xl">
      <button onClick={onOpenMobile} aria-label="Open menu" className="md:hidden p-2 -ml-2 rounded-md text-muted-foreground hover:text-foreground">
        <Menu className="h-5 w-5" />
      </button>
      <div className="md:hidden"><Brand /></div>
      <div className="hidden md:flex items-center gap-2 flex-1 max-w-md">
        <div className="relative w-full">
          <Search className="h-4 w-4 absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" />
          <input
            type="search"
            placeholder="Search tasks, subjects, grades…"
            className="input-field pl-9 pr-16 h-9"
          />
          <kbd className="hidden lg:inline-flex absolute right-2.5 top-1/2 -translate-y-1/2 text-[10px] font-mono text-muted-foreground border border-border rounded px-1.5 py-0.5">⌘K</kbd>
        </div>
      </div>
      <div className="flex-1 md:hidden" />
      <button aria-label="Notifications" className="relative h-9 w-9 grid place-items-center rounded-md border border-border text-muted-foreground hover:text-white hover:border-primary/40 transition-colors">
        <Bell className="h-4 w-4" />
        <span className="absolute top-1.5 right-1.5 h-1.5 w-1.5 rounded-full bg-primary shadow-[0_0_8px_rgba(0,212,170,0.8)]" />
      </button>
      <div className="h-9 w-9 rounded-full bg-gradient-to-br from-primary/40 to-accent/20 border border-border grid place-items-center text-xs font-semibold text-primary">
        S
      </div>
    </header>
  );
}

function MobileDrawer({ open, onClose }: { open: boolean; onClose: () => void }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  if (!open) return null;
  return (
    <div className="md:hidden fixed inset-0 z-50 flex">
      <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-72 max-w-[85vw] bg-sidebar border-r border-sidebar-border p-5 flex flex-col">
        <div className="flex items-center justify-between mb-8">
          <Brand />
          <button onClick={onClose} className="p-1.5 rounded-md text-muted-foreground hover:text-foreground" aria-label="Close menu">
            <X className="h-4 w-4" />
          </button>
        </div>
        <NavList pathname={pathname} onClick={onClose} />
      </div>
    </div>
  );
}

function RootComponent() {
  const { queryClient } = Route.useRouteContext();
  const [mobileOpen, setMobileOpen] = useState(false);
  return (
    <QueryClientProvider client={queryClient}>
      <div className="flex min-h-screen w-full">
        <Sidebar />
        <div className="flex-1 min-w-0 flex flex-col">
          <TopBar onOpenMobile={() => setMobileOpen(true)} />
          <main className="flex-1 min-w-0 animate-fade-up">
            <Outlet />
          </main>
        </div>
        <MobileDrawer open={mobileOpen} onClose={() => setMobileOpen(false)} />
        <Toaster />
      </div>
    </QueryClientProvider>
  );
}
