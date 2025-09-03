// src/quiz/PreflopTrainer.tsx
// Right-panel loader + pack info. Program dropdown + "Open ranges" modal fed by PreflopCheatsheet.json

import { useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from "@/components/ui/select";
import type { PreflopPack } from "./preflop";
import TrainerSummary from "@/quiz/TrainerSummary";
import type { HistoryEntry } from "@/quiz/TrainerHistory";
import RangeModal from "@/quiz/RangeModal";

// ⬇️ JSON со шпаргалкой (v1.1); требуется "resolveJsonModule": true в tsconfig
import CHEATSHEET from "@/quiz/PreflopCheatsheet.json";

const PROGRAMS = ["A1","A2","B3","B4","B5","C6","C7","C8","D9","D10","E11","E12"] as const;

export default function PreflopTrainer({
  pack,
  index,
  onLoadPack,
  onGoto,
  history = [],
}: {
  pack: PreflopPack | null;
  index: number;
  onLoadPack: (p: PreflopPack) => void;
  onGoto: (i: number) => void;
  history?: HistoryEntry[];
}) {
  const taRef = useRef<HTMLTextAreaElement | null>(null);

  // UI: выбранная учебная программа (используется модалкой)
  const [program, setProgram] = useState<(typeof PROGRAMS)[number]>("A1");

  // Ranges modal
  const [rangeOpen, setRangeOpen] = useState(false);

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
      {/* Header: Program dropdown + Open ranges */}
      <div className="flex items-center justify-between">
        <Select value={program} onValueChange={(v) => setProgram(v as any)}>
          <SelectTrigger className="w-[120px]" aria-label="Select training program">
            <SelectValue placeholder="Program" />
          </SelectTrigger>
          <SelectContent>
            {PROGRAMS.map((p) => (
              <SelectItem key={p} value={p}>
                {p}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Button
          variant="outline"
          size="sm"
          onClick={() => setRangeOpen(true)}
          aria-label="Open ranges"
        >
          Open ranges
        </Button>
      </div>

      {/* File + paste loaders */}
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
        placeholder="Paste JSON pack here…"
      />
      <div className="flex gap-2">
        <Button size="sm" onClick={handlePaste}>
          Load pasted JSON
        </Button>
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

          <div className="mt-2 overflow-x-auto">
            <div className="inline-flex gap-2 whitespace-nowrap">
              {pack.scenarios.map((_, i) => (
                <Button
                  key={i}
                  size="sm"
                  variant={index === i ? "default" : "outline"}
                  onClick={() => onGoto(i)}
                  className="px-2"
                >
                  #{i + 1}
                </Button>
              ))}
            </div>

            <TrainerSummary items={history} />
          </div>
        </div>
      ) : (
        <div className="text-xs opacity-70">
          Load a JSON pack to start. The action buttons appear below the table.
        </div>
      )}

      {/* Ranges modal (питается из PreflopCheatsheet.json) */}
      <RangeModal
        open={rangeOpen}
        onOpenChange={setRangeOpen}
        cheatsheet={CHEATSHEET as any}
        programId={program}
      />
    </div>
  );
}
