// src/panels/QuizzesPanel.tsx
import UiSection from "@/components/UiSection";
import type { TableState } from "@/engine/table";
import { Suspense, lazy } from "react";

const PotOddsQuiz = lazy(() => import("@/quiz/PotOddsQuiz"));

export default function QuizzesPanel({
  state,
  onNewSpot,
}: {
  state: TableState;
  onNewSpot: () => void;
}) {
  return (
    <div className="text-foreground">
      <UiSection title="Pot odds" defaultOpen compactTop>
        <Suspense fallback={<div className="text-sm text-foreground/70">Loading…</div>}>
          <PotOddsQuiz state={state} onNewSpot={onNewSpot} />
        </Suspense>
      </UiSection>
    </div>
  );
}
