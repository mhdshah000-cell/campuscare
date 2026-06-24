// Anonymous-user identity. Persists a UUID in localStorage so each visitor
// gets a stable id without requiring authentication. Future-ready: when
// auth is added, map this to the authenticated user id during migration.

const KEY = "campuscare.anonymous_user_id";

function generate(): string {
  // Prefer native crypto.randomUUID; fall back for older browsers.
  try {
    if (typeof crypto !== "undefined" && "randomUUID" in crypto) {
      return crypto.randomUUID();
    }
  } catch {
    /* ignore */
  }
  return "anon-" + Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export function getAnonId(): string {
  if (typeof window === "undefined") return "ssr";
  try {
    const existing = window.localStorage.getItem(KEY);
    if (existing) return existing;
    const id = generate();
    window.localStorage.setItem(KEY, id);
    return id;
  } catch {
    // localStorage blocked (private mode, etc.) — fall back to per-session id.
    return "anon-session";
  }
}
