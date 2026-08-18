import { useEffect, useState } from "react";
import { KeyRound, ShieldCheck } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SEARCH_PROVIDERS, describeLadder, type AiKeys } from "@/lib/ai-keys";
import { loadKeys, saveKeys } from "@/lib/storage";

export function AiKeysPanel({ onChange }: { onChange: (keys: AiKeys) => void }) {
  const [keys, setKeys] = useState<AiKeys>({ searchProvider: "none" });

  useEffect(() => {
    const stored = loadKeys();
    setKeys(stored);
    onChange(stored);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const update = (patch: Partial<AiKeys>) => {
    const next = { ...keys, ...patch };
    setKeys(next);
    saveKeys(next);
    onChange(next);
  };

  return (
    <div className="rounded-xl border border-border bg-card p-5">
      <div className="flex items-center gap-2">
        <KeyRound className="size-4 text-muted-foreground" />
        <h2 className="font-semibold text-card-foreground">AI proxy box</h2>
      </div>
      <p className="mt-1 text-sm text-muted-foreground">
        Optional. Paste your own keys and AnyBook uses them first. Leave everything empty and the
        built-in Lovable AI writes the book.
      </p>

      <div className="mt-4 grid gap-4 sm:grid-cols-2">
        <div className="space-y-1.5">
          <Label>Web search provider</Label>
          <Select
            value={keys.searchProvider ?? "none"}
            onValueChange={(value) => update({ searchProvider: value as NonNullable<AiKeys["searchProvider"]> })}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {SEARCH_PROVIDERS.map((provider) => (
                <SelectItem key={provider.value} value={provider.value}>
                  {provider.label} — {provider.help}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="searchKey">Web search API key</Label>
          <Input
            id="searchKey"
            type="password"
            placeholder="tvly-… / serper / brave token"
            value={keys.searchKey ?? ""}
            onChange={(event) => update({ searchKey: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="geminiKey">Gemini API key</Label>
          <Input
            id="geminiKey"
            type="password"
            placeholder="AIza…"
            value={keys.geminiKey ?? ""}
            onChange={(event) => update({ geminiKey: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="geminiModel">Gemini model</Label>
          <Input
            id="geminiModel"
            placeholder="gemini-2.5-flash"
            value={keys.geminiModel ?? ""}
            onChange={(event) => update({ geminiModel: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="openaiKey">OpenAI key (optional)</Label>
          <Input
            id="openaiKey"
            type="password"
            placeholder="sk-…"
            value={keys.openaiKey ?? ""}
            onChange={(event) => update({ openaiKey: event.target.value })}
          />
        </div>
        <div className="space-y-1.5">
          <Label htmlFor="openaiModel">OpenAI model</Label>
          <Input
            id="openaiModel"
            placeholder="gpt-4o-mini"
            value={keys.openaiModel ?? ""}
            onChange={(event) => update({ openaiModel: event.target.value })}
          />
        </div>
      </div>

      <div className="mt-4 rounded-lg bg-secondary/60 p-3 text-sm text-secondary-foreground">
        <p className="flex items-center gap-1.5 font-medium">
          <ShieldCheck className="size-4" /> Fallback ladder
        </p>
        <ol className="mt-1.5 space-y-0.5 text-muted-foreground">
          {describeLadder(keys).map((step) => (
            <li key={step}>{step}</li>
          ))}
        </ol>
        <p className="mt-2 text-xs text-muted-foreground">
          Keys are stored only in this browser and sent to our server solely to run your request.
        </p>
      </div>

      <Button
        variant="ghost"
        size="sm"
        className="mt-3"
        onClick={() => update({ searchKey: "", geminiKey: "", openaiKey: "", searchProvider: "none" })}
      >
        Clear all keys
      </Button>
    </div>
  );
}
