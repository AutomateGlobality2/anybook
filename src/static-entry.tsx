// Entry point for the GitHub Pages build. Same React components as the Lovable
// app, but hash-routed so it works from any repo subpath, and every AI call goes
// to the Lovable backend baked in via VITE_ANYBOOK_API.
import { StrictMode, useEffect, useState } from "react";
import { createRoot } from "react-dom/client";

import { HomePage } from "@/pages/HomePage";
import { ReaderPage } from "@/pages/ReaderPage";
import "@/styles.css";

function StaticApp() {
  const [route, setRoute] = useState(() => window.location.hash.replace(/^#/, "") || "/");

  useEffect(() => {
    const onHash = () => setRoute(window.location.hash.replace(/^#/, "") || "/");
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, []);

  useEffect(() => {
    if ("serviceWorker" in navigator) {
      void navigator.serviceWorker.register("./sw.js").catch(() => undefined);
    }
  }, []);

  return route.startsWith("/reader") ? <ReaderPage /> : <HomePage />;
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <StaticApp />
  </StrictMode>,
);
