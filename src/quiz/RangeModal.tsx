// src/quiz/RangeModal.tsx
import { useEffect, useMemo, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import RangeMatrix from "@/quiz/RangeMatrix";

/** Types that match PreflopCheatsheet.json (v1) enough for A1 use */
type CS_Entry = {
  label: string;
  raise_to?: number;
  metrics?: { pot_before?: number; to_call?: number; threshold_pct?: number };
  range_spec?: string;
};
type CS_Context = { id: string; label: string; entries?: CS_Entry[] };
type CS_Block = { id: string; name?: string; contexts?: CS_Context[] };
type Cheatsheet = {
  schema: string;
  meta?: { title?: string };
  blocks: Record<string, CS_Block>;
};

export default function RangeModal({
  open,
  onOpenChange,
  cheatsheet,
  programId,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  cheatsheet: Cheatsheet;
  programId: string; // e.g. "A1"
}) {
  const block: CS_Block | undefined = cheatsheet?.blocks?.[programId];

  // indexes for context and entry (size)
  const [ctxIdx, setCtxIdx] = useState(0);
  const [entryIdx, setEntryIdx] = useState(0);

  // reset when program changes
  useEffect(() => {
    setCtxIdx(0);
    setEntryIdx(0);
  }, [programId]);

  const ctx = block?.contexts?.[ctxIdx];
  const entries = ctx?.entries ?? [];
  const entry = entries[entryIdx];
  const spec = entry?.range_spec ?? "";

  // Title: "<programId> — <name>"
  const modalTitle = useMemo(() => {
    const name = block?.name || cheatsheet?.meta?.title || "Диапазон рук";
    return programId ? `${programId} — ${name}` : name;
  }, [block?.name, cheatsheet?.meta?.title, programId]);

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[720px]">
        <DialogHeader>
          <DialogTitle className="text-lg">{modalTitle}</DialogTitle>
        </DialogHeader>

        {/* Contexts */}
        <div className="mb-3 space-y-2">
          <div className="flex flex-wrap items-center gap-2">
            {block?.contexts && block.contexts.length > 0 ? (
              block.contexts.map((c, i) => (
                <Button
                  key={c.id || i}
                  size="sm"
                  variant={i === ctxIdx ? "default" : "outline"}
                  onClick={() => {
                    setCtxIdx(i);
                    setEntryIdx(0);
                  }}
                >
                  {c.label || c.id || `Context ${i + 1}`}
                </Button>
              ))
            ) : (
              <span className="text-sm opacity-60">none</span>
            )}
          </div>

          {/* Sizes (entries) */}
          {entries.length > 0 ? (
            <div className="flex flex-wrap items-center gap-2">
              {entries.map((e, i) => (
                <Button
                  key={e.label || i}
                  size="sm"
                  variant={i === entryIdx ? "default" : "outline"}
                  onClick={() => setEntryIdx(i)}
                  className="min-w-[110px] justify-center"
                >
                  {e.label || `#${i + 1}`}
                </Button>
              ))}
            </div>
          ) : (
            <span className="text-sm opacity-60">none</span>
          )}
        </div>

        {/* Matrix */}
        <div className="mt-1">
          {spec ? <RangeMatrix spec={spec} /> : <div className="text-sm opacity-70">none</div>}
        </div>
      </DialogContent>
    </Dialog>
  );
}
