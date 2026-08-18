// Free tier: 5 minutes of AI generation time per calendar day, tracked locally.
// When the hub (hubup.online) is wired in, the same counters move server-side
// and are keyed by the hub user id instead of the browser.

export const FREE_SECONDS_PER_DAY = 300;

const KEY = "anybook.usage.v1";

type UsageState = { day: string; seconds: number };

function today(): string {
  return new Date().toISOString().slice(0, 10);
}

export function readUsage(): UsageState {
  if (typeof window === "undefined") return { day: today(), seconds: 0 };
  try {
    const parsed = JSON.parse(localStorage.getItem(KEY) ?? "{}") as Partial<UsageState>;
    if (parsed.day === today() && typeof parsed.seconds === "number") {
      return { day: parsed.day, seconds: parsed.seconds };
    }
  } catch {
    /* ignore corrupt state */
  }
  return { day: today(), seconds: 0 };
}

export function addUsage(seconds: number): UsageState {
  const current = readUsage();
  const next: UsageState = { day: current.day, seconds: current.seconds + Math.max(0, seconds) };
  if (typeof window !== "undefined") localStorage.setItem(KEY, JSON.stringify(next));
  return next;
}

export function secondsLeft(): number {
  return Math.max(0, FREE_SECONDS_PER_DAY - readUsage().seconds);
}

export function formatSeconds(seconds: number): string {
  const minutes = Math.floor(seconds / 60);
  const rest = Math.floor(seconds % 60);
  return `${minutes}:${String(rest).padStart(2, "0")}`;
}
