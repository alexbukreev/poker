// src/panels/QuizzesPanel.tsx
import UiSection from "@/components/UiSection";
import type { TableState } from "@/engine/table";
import { Suspense, lazy } from "react";

// ⬇️ вместо прямого импорта:
// import PotOddsQuiz from "@/quiz/PotOddsQuiz";
const PotOddsQuiz = lazy(() => import("@/quiz/PotOddsQuiz"));

export default function QuizzesPanel({ state }: { state: TableState }) {
  return (
    <div className="text-foreground">
      <UiSection title="Pot odds" defaultOpen compactTop>
        <Suspense fallback={<div className="text-sm text-foreground/70">Loading…</div>}>
          <PotOddsQuiz state={state} />
        </Suspense>
      </UiSection>
    </div>
  );
}
