// Hub wiring. AnyBook never owns accounts: every sign-in bounces to the hub at
// hubup.online and returns here with the hub session. Until the hub credentials
// are pasted in, these values are placeholders and the UI says so.

export const HUB_ORIGIN = import.meta.env["VITE_HUB_ORIGIN"] ?? "https://hubup.online";
export const TOOL_SLUG = "anybook";

// Render-safe: no window read, so SSR and hydration produce the same href.
// The return-here redirect is appended at click time instead.
export function hubLoginUrl(): string {
  return `${HUB_ORIGIN}/login?tool=${TOOL_SLUG}`;
}

export function goToHubLogin(): void {
  const redirect = encodeURIComponent(window.location.href);
  window.location.href = `${hubLoginUrl()}&redirect=${redirect}`;
}

export function hubUnlockUrl(scope: "all" | "tool"): string {
  return `${HUB_ORIGIN}/upgrade?tool=${TOOL_SLUG}&plan=${scope === "all" ? "hub-pass" : "single-tool"}`;
}

export const HUB_READY = Boolean(import.meta.env["VITE_HUB_ORIGIN"]);
