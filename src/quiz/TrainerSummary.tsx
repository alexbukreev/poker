// src/quiz/TrainerSummary.tsx
import type { HistoryEntry } from "@/quiz/TrainerHistory";

export default function TrainerSummary({ items = [] }: { items: HistoryEntry[] }) {
  const total = items.length || 0;
  const counts = { correct: 0, partial: 0, wrong: 0 } as Record<HistoryEntry["verdict"], number>;
  for (const it of items) counts[it.verdict]++;

  const pct = (n: number) => (total ? Math.round((n / total) * 100) : 0);

  return (
    <div className="mt-3 space-y-2">
      <div className="text-xs text-foreground/70">
        Attempts: <b className="text-foreground">{total}</b>
        {" • "}Correct: <b className="text-green-600">{pct(counts.correct)}%</b>
        {" • "}Partial: <b className="text-yellow-600">{pct(counts.partial)}%</b>
        {" • "}Wrong: <b className="text-red-600">{pct(counts.wrong)}%</b>
      </div>

      {/* Стаканная полоса: зелёный / жёлтый / красный */}
      <div className="flex h-2 w-full overflow-hidden rounded bg-border/50">
        <div className="bg-green-600" style={{ width: `${pct(counts.correct)}%` }} />
        <div className="bg-yellow-500" style={{ width: `${pct(counts.partial)}%` }} />
        <div className="bg-red-600" style={{ width: `${pct(counts.wrong)}%` }} />
      </div>
    </div>
  );
}
