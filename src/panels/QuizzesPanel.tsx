// src/panels/QuizzesPanel.tsx
import UiSection from "@/components/UiSection";
import PotOddsQuiz from "@/quiz/PotOddsQuiz";
import type { TableState } from "@/engine/table";

export default function QuizzesPanel({ state }: { state: TableState }) {
  return (
    <div className="text-foreground">
      <UiSection title="Pot odds" defaultOpen compactTop>
        <PotOddsQuiz state={state} />
      </UiSection>
    </div>
  );
}
