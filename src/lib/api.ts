// One HTTP client used by both hosting modes.
//
// On Lovable the API lives on the same origin. On GitHub Pages the static site
// is served by GitHub and every AI call goes to the Lovable backend, whose URL
// is baked in at build time via VITE_ANYBOOK_API (a GitHub Actions variable).
export const API_BASE = (import.meta.env["VITE_ANYBOOK_API"] ?? "").replace(/\/$/, "");

export const STATIC_HOST = import.meta.env["VITE_STATIC_HOST"] === "1";

/** Internal link that works on Lovable (paths) and GitHub Pages (hash routing). */
export function link(path: string): string {
  return STATIC_HOST ? `#${path}` : path;
}

export async function callApi<T>(path: string, body: unknown): Promise<T> {
  const response = await fetch(`${API_BASE}/api/public/anybook/${path}`, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify(body),
  });
  const text = await response.text();
  if (!response.ok) {
    throw new Error(`AnyBook backend failed [${response.status}]: ${text.slice(0, 400)}`);
  }
  return JSON.parse(text) as T;
}
