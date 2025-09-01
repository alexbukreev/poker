// src/quiz/PreflopActionBar.tsx
import { Button } from "@/components/ui/button";
import type { Scenario, UserAnswer } from "@/quiz/preflop";

export default function PreflopActionBar({
  scenario,
  answer,
  onSelect,
  onSubmit,
  onNext,
  verdict,
}: {
  scenario: Scenario;
  answer: UserAnswer | null;
  onSelect: (kind: "fold" | "call" | "raise_to", bb?: number) => void;
  onSubmit: () => void;
  onNext: () => void;
  verdict: { kind: "correct" | "partial" | "wrong"; note?: string } | null;
}) {
  // метрики для строки "Threshold · MDF"
  const thr = scenario.metrics?.pot_odds_threshold_pct;
  const mdf = scenario.metrics?.mdf_pct ?? scenario.metrics?.mdf_vs_open_pct;

  return (
    <div className="mx-auto w-full max-w-[720px] rounded-md border border-border/40 p-3">
      <div className="mb-2 text-sm opacity-80">
        {scenario.tags?.join(", ")}
        {scenario.difficulty ? ` · ${scenario.difficulty}` : ""}
      </div>

      <div className="flex flex-wrap items-center gap-2">
        <Button
          variant={answer?.action === "fold" ? "default" : "secondary"}
          onClick={() => onSelect("fold")}
        >
          Fold
        </Button>

        <Button
          variant={answer?.action === "call" ? "default" : "secondary"}
          onClick={() => onSelect("call")}
        >
          Call
        </Button>

        <Button
          variant={answer?.action === "raise_to" ? "default" : "secondary"}
          onClick={() => onSelect("raise_to", scenario.allowed_bets?.[0])}
        >
          Raise
        </Button>

        {answer?.action === "raise_to" && (
          <div className="flex flex-wrap items-center gap-1">
            {(scenario.allowed_bets ?? []).map((b) => (
              <Button
                key={b}
                size="sm"
                variant={answer.bb === b ? "default" : "secondary"}
                onClick={() => onSelect("raise_to", b)}
              >
                {b}
              </Button>
            ))}
          </div>
        )}

        <div className="ml-auto flex gap-2">
          <Button onClick={onSubmit} disabled={!answer}>
            Submit
          </Button>
          <Button variant="secondary" onClick={onNext}>
            Next spot
          </Button>
        </div>
      </div>

      {verdict ? (
        <div className="mt-3 space-y-1 text-sm">
          <div>
            Result:{" "}
            {verdict.kind === "correct" ? (
              <span className="font-semibold text-green-600">Correct</span>
            ) : verdict.kind === "partial" ? (
              <span className="font-semibold text-yellow-600">Partial</span>
            ) : (
              <span className="font-semibold text-red-600">Wrong</span>
            )}
            {verdict.note ? <> · {verdict.note}</> : null}
          </div>

          {(thr != null || mdf != null) && (
            <div className="opacity-80">
              {thr != null && <>Threshold: <b>{thr.toFixed(1)}%</b></>}
              {thr != null && mdf != null && " · "}
              {mdf != null && <>MDF: <b>{mdf.toFixed(1)}%</b></>}
            </div>
          )}

          {scenario.comment ? (
            <div className="opacity-90">{scenario.comment}</div>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
