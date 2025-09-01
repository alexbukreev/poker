// src/quiz/PreflopTrainer.tsx
// Right-panel loader + pack info. Keeps UI minimal and uses shadcn/ui buttons.

import { useRef } from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { PreflopPack } from "./preflop";

export default function PreflopTrainer({
  pack,
  index,
  onLoadPack,
  onGoto,
}: {
  pack: PreflopPack | null;
  index: number;
  onLoadPack: (p: PreflopPack) => void;
  onGoto: (i: number) => void;
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  async function handleFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const text = await file.text();
    try {
      const json = JSON.parse(text);
      onLoadPack(json);
    } catch {
      alert("Invalid JSON file");
    }
  }

  function handlePaste() {
    const raw = taRef.current?.value?.trim();
    if (!raw) return;
    try {
      onLoadPack(JSON.parse(raw));
      if (taRef.current) taRef.current.value = "";
    } catch {
      alert("Invalid JSON in textarea");
    }
  }

  return (
    <div className="space-y-3">
      <div className="text-sm opacity-80">Preflop Trainer (MVP)</div>

      <div className="flex items-center gap-2">
        <input
          type="file"
          accept="application/json"
          onChange={handleFile}
          className="block w-full text-sm"
        />
      </div>

      <textarea
        ref={taRef}
        className="w-full h-24 rounded-md border border-foreground/20 bg-transparent p-2 text-sm"
        placeholder='Paste JSON pack here…'
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handlePaste}>Load pasted JSON</Button>
      </div>

      {pack ? (
        <div className="mt-2 space-y-2 rounded-md border border-foreground/20 p-2 text-sm">
          <div className="font-medium">{pack.meta?.name || "Pack"}</div>
          <div className="opacity-75">
            Scenarios: <b>{pack.scenarios.length}</b>
            {typeof index === "number" && pack.scenarios.length > 0 ? (
              <> · Current: <b>{index + 1}</b></>
            ) : null}
          </div>
          <div className="flex flex-wrap gap-2">
            {pack.scenarios.slice(0, 6).map((s, i) => (
              <button
                key={s.id || i}
                onClick={() => onGoto(i)}
                className={cn(
                  "rounded border px-2 py-1 text-xs",
                  i === index
                    ? "border-foreground bg-foreground text-background"
                    : "border-foreground/30 hover:border-foreground/60"
                )}
                title={s.tags?.join(", ")}
              >
                #{i + 1}
              </button>
            ))}
            {pack.scenarios.length > 6 ? (
              <span className="text-xs opacity-60">…</span>
            ) : null}
          </div>
        </div>
      ) : (
        <div className="text-xs opacity-70">
          Load a JSON pack to start. The action buttons appear below the table.
        </div>
      )}
    </div>
  );
}
