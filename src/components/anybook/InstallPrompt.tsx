import { useEffect, useState } from "react";
import { Download, X, Smartphone } from "lucide-react";

import { Button } from "@/components/ui/button";

type BeforeInstallPromptEvent = Event & {
  prompt: () => Promise<void>;
  userChoice: Promise<{ outcome: string }>;
};

let deferred: BeforeInstallPromptEvent | null = null;

export function useInstallRecommendation() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const handler = (event: Event) => {
      event.preventDefault();
      deferred = event as BeforeInstallPromptEvent;
    };
    window.addEventListener("beforeinstallprompt", handler);
    return () => window.removeEventListener("beforeinstallprompt", handler);
  }, []);
  return {
    visible,
    recommend: () => {
      if (localStorage.getItem("anybook.install.dismissed") === "1") return;
      if (window.matchMedia("(display-mode: standalone)").matches) return;
      setVisible(true);
    },
    dismiss: () => {
      localStorage.setItem("anybook.install.dismissed", "1");
      setVisible(false);
    },
    install: async () => {
      if (deferred) {
        await deferred.prompt();
        deferred = null;
      }
      setVisible(false);
    },
  };
}

export function InstallPrompt({
  onInstall,
  onDismiss,
}: {
  onInstall: () => void;
  onDismiss: () => void;
}) {
  return (
    <div className="fixed inset-x-3 bottom-3 z-50 mx-auto max-w-md rounded-xl border border-border bg-card p-4 shadow-lg">
      <div className="flex items-start gap-3">
        <div className="rounded-lg bg-secondary p-2 text-secondary-foreground">
          <Smartphone className="size-5" />
        </div>
        <div className="flex-1">
          <p className="font-medium text-card-foreground">Keep your books on your phone</p>
          <p className="mt-1 text-sm text-muted-foreground">
            Add AnyBook to your home screen — no permissions asked. Your downloads and the reader
            keep working offline, even for formats your phone can't open on its own.
          </p>
          <div className="mt-3 flex gap-2">
            <Button size="sm" onClick={onInstall}>
              <Download className="mr-1.5 size-4" /> Add to home screen
            </Button>
            <Button size="sm" variant="ghost" onClick={onDismiss}>
              Not now
            </Button>
          </div>
        </div>
        <button aria-label="Dismiss" onClick={onDismiss} className="text-muted-foreground">
          <X className="size-4" />
        </button>
      </div>
    </div>
  );
}
