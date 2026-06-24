## Goal
Rebuild the visual layer of CampusCare in the selected "Dark minimal editorial" direction and silence the recurring `AwaitInner` console errors. No functional changes to data, routes, or backend.

## Design tokens (locked from chosen prototype)
- Background `#0a0a0b`, card surface `#0f1115`, borders `slate-800` (`#1e293b`).
- Text: `slate-300` body, `white` headings, `slate-500` muted, `indigo-400` eyebrow, `emerald-400` positive, `orange-400` / `red-400` warning.
- Single accent: `indigo-500` (`#6366f1`).
- Fonts (loaded via `<link>` in `__root.tsx` head): `Inter` (300–600) for UI/body, `Instrument Serif` for large headings, default mono for metric badges.
- Radius: `rounded-xl` cards, `rounded-md` nav items. No glassmorphism, no glow, no gradients.

Update `src/styles.css`: drop glass/glow utilities, redefine semantic tokens (`--background`, `--card`, `--border`, `--primary`, `--muted-foreground`, etc.) to match the palette above via `@theme inline`. Replace `btn-primary`/`glass-card` utility usages with shadcn primitives + Tailwind classes.

## Layout
- `__root.tsx`: replace existing sidebar with the editorial sidebar — 256px, single border-right, vertical nav list, brand row with indigo dot, footer profile block. Mobile: collapse to top bar + drawer (keep current bottom nav removed; use shadcn `Sheet`).
- Page shell: `main` with `p-8`, header row (eyebrow + serif title left, mono meta chips right).

## Per-page redesign (structure preserved, visuals only)
- **Dashboard (`/`)**: 12-col grid — Attendance Health (col-span-8, bar histogram from real data), Academic Index GPA card (col-span-4), Priority Tasks (col-span-7), Today's Schedule / recent activity (col-span-5).
- **Tasks**: editorial list rows with circular checkbox, title, mono eyebrow meta; add-task inline form at top in same card style.
- **Subjects**: list cards with subject name, code, credit-hour mono chip.
- **Attendance**: per-subject row with present/absent buttons (ghost + filled indigo), mono % badge, red `<75%` warning.
- **Attendance Calculator / GPA Calculator**: same card surface, mono inputs, serif result number.
- **Analytics**: Recharts restyled to palette (indigo bars, slate-800 grid, transparent bg).
- **AI Assistant / Notifications**: same card shell, "Coming soon" eyebrow.

## Bug fix: `AwaitInner` console warnings
Root cause: a route renders without an `errorComponent`/`pendingComponent` while React streams via `<Await>` (TanStack's `HeadContent`/loaders). Add `errorComponent` + `pendingComponent` to every route (currently only `__root` has them) and wrap data-fetching components so a thrown query doesn't bubble into the streaming boundary. Concretely:
- Add a shared `RouteError` and `RoutePending` to `src/components/route-boundaries.tsx`.
- Apply via `createFileRoute(...)({ component, errorComponent: RouteError, pendingComponent: RoutePending })` on all 9 routes.
- Set `defaultErrorComponent` and `defaultPendingComponent` on the router in `src/router.tsx` as a safety net.

## Out of scope
No DB schema changes, no new features, no auth, no AI wiring. Recharts stays. Existing CRUD logic untouched.

## Files touched
- `src/styles.css` (token rewrite)
- `src/routes/__root.tsx` (new sidebar, font links, drop glass)
- `src/router.tsx` (defaults)
- `src/components/route-boundaries.tsx` (new)
- `src/components/PageHeader.tsx` (restyle)
- All 9 route files in `src/routes/*.tsx` (visual rewrite + boundaries)
