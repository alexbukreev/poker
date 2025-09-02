// src/panels/QuizzesPanel.tsx
import UiSection from "@/components/UiSection";
import PotOddsQuiz from "@/quiz/PotOddsQuiz";
import type { TableState } from "@/engine/table";
import PreflopTrainer from "@/quiz/PreflopTrainer";
import type { PreflopPack } from "@/quiz/preflop";
import TrainerHistory, { type HistoryEntry } from "@/quiz/TrainerHistory";
import PreflopHelp from "@/quiz/PreflopHelp";
import RangeModal from "@/quiz/RangeModal";

export default function QuizzesPanel({
  state,
  onNewSpot,
  stats,
  onAddStat,
  onResetStats,
  trainerPack,
  trainerIndex,
  onLoadTrainerPack,
  onGotoTrainerIndex,
  history = [],
}: {
  state: TableState;
  onNewSpot: () => void;
  stats: number[];
  onAddStat: (err: number) => void;
  onResetStats: () => void;

  trainerPack: PreflopPack | null;
  trainerIndex: number;
  onLoadTrainerPack: (p: PreflopPack) => void;
  onGotoTrainerIndex: (i: number) => void;
  history?: HistoryEntry[];
}) {
  return (
    <div className="text-foreground">
      <UiSection title="Preflop Trainer" defaultOpen compactTop>
        <div className="mb-2 flex items-center gap-2">
          <PreflopHelp />
          <RangeModal spotKey="BBvsBTN_2.5x" />
        </div>
        <PreflopTrainer
          pack={trainerPack}
          index={trainerIndex}
          onLoadPack={onLoadTrainerPack}
          onGoto={onGotoTrainerIndex}
          history={history}
        />
      </UiSection>

      <UiSection title="History (last 20)" defaultOpen>
        <TrainerHistory items={history} />
      </UiSection>

      <UiSection title="Pot odds" defaultOpen>
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
