import UiSection from "@/components/UiSection";
import PotOddsQuiz from "@/quiz/PotOddsQuiz";
import type { TableState } from "@/engine/table";

export default function QuizzesPanel({
  state,
  onNewSpot,
  stats,
  onAddStat,
  onResetStats,
}: {
  state: TableState;
  onNewSpot: () => void;
  stats: number[];
  onAddStat: (err: number) => void;
  onResetStats: () => void;
}) {
  return (
    <div className="text-foreground">
      <UiSection title="Pot odds" defaultOpen compactTop>
        <PotOddsQuiz
          state={state}
          onNewSpot={onNewSpot}
          stats={stats}
          onAddStat={onAddStat}
          onResetStats={onResetStats}
        />
      </UiSection>
    </div>
  );
}
