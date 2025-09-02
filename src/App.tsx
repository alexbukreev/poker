// src/App.tsx
import { useMemo, useState } from "react";
import PokerTable from "@/components/PokerTable";
import { computePot, type TableState, type SeatPos } from "@/engine/table";
import { generatePreflopSpot, generateRandomPreflopSpot } from "@/engine/generator";
import Dock from "@/components/Dock";
import ControlsPanel from "@/panels/ControlsPanel";
import QuizzesPanel from "@/panels/QuizzesPanel";
import { PrefsProvider } from "@/state/prefs";
import PreflopActionBar from "@/quiz/PreflopActionBar";

import {
  type PreflopPack,
  type Scenario,
  type UserAnswer,
  buildStateFromScenario,
  evaluateAnswer,
  normalizePack,
} from "@/quiz/preflop";
import type { HistoryEntry } from "@/quiz/TrainerHistory";

type HeroChoice = SeatPos | "random";

export default function App() {
  // --- shared table state
  const [state, setState] = useState<TableState>(() => generateRandomPreflopSpot());
  const pot = computePot(state);

  // --- pot-odds quiz stats
  const [poStats, setPoStats] = useState<number[]>([]);

  const [heroPref, setHeroPref] = useState<HeroChoice>("random");
  const onGenerate = ({ hero }: { hero: HeroChoice }) => {
    setState(generatePreflopSpot({ hero }));
  };

  // --- preflop trainer
  const [trainerPack, setTrainerPack] = useState<PreflopPack | null>(null);
  const [trainerIndex, setTrainerIndex] = useState<number>(0);
  const currentScenario: Scenario | null = useMemo(() => {
    if (!trainerPack) return null;
    return trainerPack.scenarios[trainerIndex] || null;
  }, [trainerPack, trainerIndex]);

  const [answer, setAnswer] = useState<UserAnswer | null>(null);
  const [verdict, setVerdict] = useState<{ kind: "correct" | "partial" | "wrong"; note?: string } | null>(null);
  const [history, setHistory] = useState<HistoryEntry[]>([]);

  function loadTrainerPack(raw: unknown) {
    const p = normalizePack(raw);
    setTrainerPack(p);
    setTrainerIndex(0);
    setVerdict(null);
    setAnswer(null);
    setHistory([]);
    setState(buildStateFromScenario(p, p.scenarios[0]));
  }

  function gotoScenario(i: number) {
    if (!trainerPack) return;
    const idx = Math.max(0, Math.min(i, trainerPack.scenarios.length - 1));
    setTrainerIndex(idx);
    setVerdict(null);
    setAnswer(null);
    setState(buildStateFromScenario(trainerPack, trainerPack.scenarios[idx]));
  }

  function nextScenario() {
    if (!trainerPack) return;
    const next = (trainerIndex + 1) % trainerPack.scenarios.length;
    gotoScenario(next);
  }

  function selectAction(kind: "fold" | "call" | "raise_to", bb?: number) {
    if (kind === "raise_to") setAnswer({ action: "raise_to", bb });
    else setAnswer({ action: kind });
    setVerdict(null);
  }

  function submitAnswer() {
    if (!currentScenario || !answer) return;
  
    const v = evaluateAnswer(currentScenario, answer);
    setVerdict(v);
  
    const actionStr =
      answer.action === "raise_to"
        ? `raise_to ${answer.bb ?? ""}`.trim()
        : answer.action;
  
    const entry: HistoryEntry = {
      id: currentScenario.id,
      idx: trainerIndex,
      hand: currentScenario.hero.cards ?? undefined,
      user: actionStr,
      verdict: v.kind,
      note: v.note,
    };
  
    // новее сверху, храним до 100 записей
    setHistory((prev) => [entry, ...prev].slice(0, 100));
  }


  return (
    <PrefsProvider>
      <div className="p-6 space-y-4">
        <PokerTable
          heroSeat={state.heroSeat}
          dealerSeat={state.dealerSeat}
          stacks={state.stacks}
          contribs={state.contribs}
          pot={pot}
          heroCards={currentScenario?.hero.cards ?? "A♣ T♦"}
        />

        {currentScenario ? (
          <PreflopActionBar
            scenario={currentScenario}
            answer={answer}
            onSelect={selectAction}
            onSubmit={submitAnswer}
            onNext={nextScenario}
            verdict={verdict}
          />
        ) : null}

        <Dock side="left" title="Controls" defaultOpen widthClass="w-80">
          <ControlsPanel
            pot={pot}
            onGenerate={onGenerate}
            heroPref={heroPref}
            onChangeHeroPref={setHeroPref}
          />
        </Dock>

        <Dock side="right" title="Quizzes" defaultOpen widthClass="w-80">
          <QuizzesPanel
            state={state}
            onNewSpot={() => onGenerate({ hero: heroPref })}
            stats={poStats}
            onAddStat={(err) => setPoStats((prev) => [...prev, Number(err.toFixed(1))])}
            onResetStats={() => setPoStats([])}

            // preflop trainer
            trainerPack={trainerPack}
            trainerIndex={trainerIndex}
            onLoadTrainerPack={loadTrainerPack}
            onGotoTrainerIndex={gotoScenario}
            history={history}      // ← ВАЖНО: теперь не undefined
          />
        </Dock>
      </div>
    </PrefsProvider>
  );
}
