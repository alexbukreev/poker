// src/quiz/TrainerHistory.tsx
// comments in English only
export type HistoryEntry = {
  id: string;
  idx: number;
  hand?: string;
  user: string;     // e.g. "fold", "call", "raise_to 9.0"
  verdict: "correct" | "partial" | "wrong";
  note?: string;
};

export default function TrainerHistory({ items = [] }: { items?: HistoryEntry[] }) {
  if (!items.length) return <div className="text-xs opacity-70">No attempts yet.</div>;
  return (
    <div className="space-y-1 max-h-48 overflow-auto pr-1">
      {items.slice(-20).reverse().map((e) => (
        <div key={e.id + e.idx} className="flex items-center justify-between text-xs border border-foreground/15 rounded px-2 py-1">
          <div className="truncate">
            <span className="opacity-60">#{e.idx + 1}</span>{" "}
            {e.hand ? <span className="opacity-80">· {e.hand}</span> : null}
            {e.note ? <span className="opacity-60"> · {e.note}</span> : null}
          </div>
          <div className={
            e.verdict === "correct" ? "text-green-600" :
            e.verdict === "partial" ? "text-yellow-600" : "text-red-600"
          }>
            {e.user}
          </div>
        </div>
      ))}
    </div>
  );
}
