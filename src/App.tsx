// src/App.tsx
import { useState } from "react";
import PokerTable from "@/components/PokerTable";
import { computePot, type TableState } from "@/engine/table";
import { generateRandomPreflopSpot } from "@/engine/generator";
import Dock from "@/components/Dock";
import ControlsPanel from "@/panels/ControlsPanel";
import QuizzesPanel from "@/panels/QuizzesPanel";
import { PrefsProvider } from "@/state/prefs";

export default function App() {
  const [state, setState] = useState<TableState>(() => generateRandomPreflopSpot());
  const pot = computePot(state);
  const onRandom = () => setState(generateRandomPreflopSpot());

  return (
    <PrefsProvider>
      <div className="p-6 space-y-4">
        <PokerTable
          heroSeat={state.heroSeat}
          dealerSeat={state.dealerSeat}
          stacks={state.stacks}
          contribs={state.contribs}
          pot={pot}
          heroCards="A♣ T♦"
        />

        <Dock side="left" title="Controls" defaultOpen widthClass="w-80">
          <ControlsPanel state={state} pot={pot} onRandom={onRandom} />
        </Dock>

        <Dock side="right" title="Quizzes" defaultOpen widthClass="w-80">
          <QuizzesPanel state={state} />
        </Dock>
      </div>
    </PrefsProvider>
  );
}
